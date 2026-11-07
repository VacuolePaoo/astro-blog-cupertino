import {
	cp,
	lstat,
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	realpath,
	rename,
	rm,
	writeFile,
} from 'node:fs/promises'
import {
	basename,
	dirname,
	isAbsolute,
	join,
	relative,
	resolve,
} from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

export const CDN_RELEASES_FILE = '.vacucdn-releases.json'

const RELEASE_ID_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{0,126}[a-z0-9])?$/
const WINDOWS_RESERVED_NAME_PATTERN =
	/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i
const PUBLIC_ROOT_FILE_NAMES = new Set(['health.txt'])

const EMPTY_RELEASES = Object.freeze({
	schemaVersion: 1,
	current: null,
	previous: null,
	candidate: null,
})

/**
 * Stage a generated `_astro` directory as the next CDN candidate.
 *
 * The public tree contains at most two release directories: the active release
 * and the candidate that may replace it. An older previous release or an
 * abandoned candidate is removed before the new candidate is copied.
 */
export async function stageAssets({
	hooks = {},
	repositoryDirectory,
	releaseId,
	sourceDirectory,
}) {
	validateReleaseId(releaseId)

	const repositoryRoot = resolve(repositoryDirectory)
	const publicRoot = join(repositoryRoot, 'public')
	const sourceRoot = resolve(sourceDirectory)

	if (basename(sourceRoot) !== '_astro')
		throw new Error(`CDN source directory must be named _astro: ${sourceRoot}`)

	await assertDirectory(repositoryRoot, 'CDN repository')
	await assertDirectory(sourceRoot, 'CDN source')
	await mkdir(publicRoot, { recursive: true })
	await assertPublicRoot(repositoryRoot, publicRoot)

	const releases = await readReleases(repositoryRoot)
	await assertReleaseTree(publicRoot, releases)

	if (releases.candidate === releaseId) return releases

	if (releases.current === releaseId) {
		if (releases.candidate !== null)
			throw new Error(
				`Cannot stage current release ${releaseId} while candidate ${releases.candidate} exists`,
			)
		return releases
	}

	if (releases.previous === releaseId) {
		const nextReleases = {
			schemaVersion: 1,
			current: releases.current,
			previous: null,
			candidate: releaseId,
		}
		await writeReleases(repositoryRoot, nextReleases)
		await assertReleaseTree(publicRoot, nextReleases)
		return nextReleases
	}

	const stagingRoot = await mkdtemp(join(repositoryRoot, '.vacucdn-stage-'))
	const stagedReleaseDirectory = join(stagingRoot, releaseId)
	const stagedAssetsDirectory = join(stagedReleaseDirectory, '_astro')
	let metadataCommitted = false
	let candidateInstalled = false
	let preserveStagingRoot = false
	const movedReleases = []

	try {
		await cp(sourceRoot, stagedAssetsDirectory, {
			recursive: true,
			errorOnExist: true,
			force: false,
		})

		const releaseIdsToMove = new Set(
			[releases.previous, releases.candidate].filter(
				id => id !== null && id !== releases.current,
			),
		)
		const backupRoot = join(stagingRoot, 'backup')

		await assertPublicRoot(repositoryRoot, publicRoot)
		for (const obsoleteReleaseId of releaseIdsToMove) {
			const originalDirectory = releaseDirectory(publicRoot, obsoleteReleaseId)
			const backupDirectory = join(backupRoot, obsoleteReleaseId)
			await mkdir(dirname(backupDirectory), { recursive: true })
			await rename(originalDirectory, backupDirectory)
			movedReleases.push({ backupDirectory, originalDirectory })
		}

		const candidateDirectory = releaseDirectory(publicRoot, releaseId)
		await assertPublicRoot(repositoryRoot, publicRoot)
		await rename(stagedReleaseDirectory, candidateDirectory)
		candidateInstalled = true

		if (typeof hooks.beforeMetadataCommit === 'function')
			await hooks.beforeMetadataCommit()

		const nextReleases = {
			schemaVersion: 1,
			current: releases.current,
			previous: null,
			candidate: releaseId,
		}

		await writeReleases(repositoryRoot, nextReleases)
		metadataCommitted = true
		await assertReleaseTree(publicRoot, nextReleases)

		return nextReleases
	} catch (error) {
		if (!metadataCommitted) {
			const rollbackErrors = []

			if (candidateInstalled) {
				try {
					await rename(
						releaseDirectory(publicRoot, releaseId),
						stagedReleaseDirectory,
					)
				} catch (rollbackError) {
					rollbackErrors.push(rollbackError)
				}
			}

			for (const movedRelease of movedReleases.reverse()) {
				try {
					await rename(
						movedRelease.backupDirectory,
						movedRelease.originalDirectory,
					)
				} catch (rollbackError) {
					rollbackErrors.push(rollbackError)
				}
			}

			if (rollbackErrors.length > 0) {
				preserveStagingRoot = true
				throw new AggregateError(
					[error, ...rollbackErrors],
					`Failed to stage CDN assets and fully restore the previous release tree; recovery files were retained at ${stagingRoot}`,
				)
			}
		}

		throw error
	} finally {
		if (!preserveStagingRoot)
			await rm(stagingRoot, { force: true, recursive: true })
	}
}

/** Remove a candidate that is known not to have entered production. */
export async function abortCandidateAssets({
	hooks = {},
	repositoryDirectory,
	releaseId,
}) {
	validateReleaseId(releaseId)

	const repositoryRoot = resolve(repositoryDirectory)
	const publicRoot = join(repositoryRoot, 'public')
	await assertDirectory(repositoryRoot, 'CDN repository')
	await mkdir(publicRoot, { recursive: true })
	await assertPublicRoot(repositoryRoot, publicRoot)

	const releases = await readReleases(repositoryRoot)
	await assertReleaseTree(publicRoot, releases)

	if (releases.candidate === null) return releases
	if (releases.candidate !== releaseId)
		throw new Error(
			`Cannot abort ${releaseId}: staged candidate is ${releases.candidate}`,
		)

	const stagingRoot = await mkdtemp(join(repositoryRoot, '.vacucdn-stage-'))
	const candidateDirectory = releaseDirectory(publicRoot, releaseId)
	const backupDirectory = join(stagingRoot, 'backup', releaseId)
	let candidateMoved = false
	let metadataCommitted = false
	let preserveStagingRoot = false

	try {
		await mkdir(dirname(backupDirectory), { recursive: true })
		await rename(candidateDirectory, backupDirectory)
		candidateMoved = true

		if (typeof hooks.beforeMetadataCommit === 'function')
			await hooks.beforeMetadataCommit()

		const nextReleases = {
			schemaVersion: 1,
			current: releases.current,
			previous: releases.previous,
			candidate: null,
		}
		await writeReleases(repositoryRoot, nextReleases)
		metadataCommitted = true
		await assertReleaseTree(publicRoot, nextReleases)

		return nextReleases
	} catch (error) {
		if (!metadataCommitted && candidateMoved) {
			try {
				await rename(backupDirectory, candidateDirectory)
			} catch (rollbackError) {
				preserveStagingRoot = true
				throw new AggregateError(
					[error, rollbackError],
					`Failed to abort CDN candidate and restore it; recovery files were retained at ${stagingRoot}`,
				)
			}
		}

		throw error
	} finally {
		if (!preserveStagingRoot)
			await rm(stagingRoot, { force: true, recursive: true })
	}
}

/** Promote the staged candidate while retaining the former current release. */
export async function promoteAssets({ repositoryDirectory, releaseId }) {
	validateReleaseId(releaseId)

	const repositoryRoot = resolve(repositoryDirectory)
	const publicRoot = join(repositoryRoot, 'public')
	await assertDirectory(repositoryRoot, 'CDN repository')
	await mkdir(publicRoot, { recursive: true })
	await assertPublicRoot(repositoryRoot, publicRoot)

	const releases = await readReleases(repositoryRoot)
	await assertReleaseTree(publicRoot, releases)

	if (releases.current === releaseId && releases.candidate === null)
		return releases

	if (releases.candidate !== releaseId)
		throw new Error(
			`Cannot promote ${releaseId}: staged candidate is ${releases.candidate ?? 'missing'}`,
		)

	await assertReleaseDirectory(publicRoot, releaseId)

	const nextReleases = {
		schemaVersion: 1,
		current: releaseId,
		previous: releases.current,
		candidate: null,
	}

	await writeReleases(repositoryRoot, nextReleases)
	await assertReleaseTree(publicRoot, nextReleases)

	return nextReleases
}

export function validateReleaseId(releaseId) {
	if (
		typeof releaseId !== 'string' ||
		!RELEASE_ID_PATTERN.test(releaseId) ||
		releaseId.includes('..') ||
		WINDOWS_RESERVED_NAME_PATTERN.test(releaseId)
	)
		throw new Error(`Invalid CDN release ID: ${String(releaseId)}`)
}

async function readReleases(repositoryRoot) {
	const releasesPath = join(repositoryRoot, CDN_RELEASES_FILE)
	let rawReleases

	try {
		rawReleases = await readFile(releasesPath, 'utf8')
	} catch (error) {
		if (error?.code === 'ENOENT') return { ...EMPTY_RELEASES }
		throw error
	}

	let releases
	try {
		releases = JSON.parse(rawReleases)
	} catch (error) {
		throw new Error(`Invalid ${CDN_RELEASES_FILE}: expected JSON`, {
			cause: error,
		})
	}

	if (
		releases === null ||
		typeof releases !== 'object' ||
		Array.isArray(releases) ||
		releases.schemaVersion !== 1
	)
		throw new Error(`Invalid ${CDN_RELEASES_FILE}: unsupported schema`)

	for (const field of ['current', 'previous', 'candidate']) {
		const value = releases[field]
		if (value !== null) validateReleaseId(value)
	}

	const releaseIds = [
		releases.current,
		releases.previous,
		releases.candidate,
	].filter(value => value !== null)
	if (new Set(releaseIds).size !== releaseIds.length)
		throw new Error(
			`Invalid ${CDN_RELEASES_FILE}: release states must be distinct`,
		)
	if (releases.previous !== null && releases.current === null)
		throw new Error(
			`Invalid ${CDN_RELEASES_FILE}: previous requires a current release`,
		)
	if (releases.previous !== null && releases.candidate !== null)
		throw new Error(
			`Invalid ${CDN_RELEASES_FILE}: previous and candidate cannot coexist`,
		)

	return {
		schemaVersion: 1,
		current: releases.current,
		previous: releases.previous,
		candidate: releases.candidate,
	}
}

async function writeReleases(repositoryRoot, releases) {
	const releasesPath = join(repositoryRoot, CDN_RELEASES_FILE)
	const temporaryPath = `${releasesPath}.tmp-${process.pid}-${Date.now()}`
	const serialized = `${JSON.stringify(releases, null, 2)}\n`

	try {
		await writeFile(temporaryPath, serialized, { encoding: 'utf8', flag: 'wx' })
		await rename(temporaryPath, releasesPath)
	} finally {
		await rm(temporaryPath, { force: true })
	}
}

async function assertReleaseTree(publicRoot, releases) {
	const expectedReleaseIds = new Set(
		[releases.current, releases.previous, releases.candidate].filter(
			value => value !== null,
		),
	)
	const entries = await readdir(publicRoot, { withFileTypes: true })

	for (const entry of entries) {
		if (entry.isSymbolicLink())
			throw new Error(
				`Symbolic links are not allowed in CDN public directory: ${entry.name}`,
			)
		if (entry.isDirectory()) {
			if (!expectedReleaseIds.has(entry.name))
				throw new Error(`Unknown CDN release directory: ${entry.name}`)
			continue
		}
		if (!entry.isFile())
			throw new Error(`Unsupported CDN public entry: ${entry.name}`)
		if (!PUBLIC_ROOT_FILE_NAMES.has(entry.name))
			throw new Error(`Unexpected CDN public file: ${entry.name}`)
	}

	for (const releaseId of expectedReleaseIds)
		await assertReleaseDirectory(publicRoot, releaseId)
}

async function assertReleaseDirectory(publicRoot, releaseId) {
	const directory = releaseDirectory(publicRoot, releaseId)
	await assertDirectory(directory, `CDN release ${releaseId}`)

	const entries = await readdir(directory, { withFileTypes: true })
	if (
		entries.length !== 1 ||
		entries[0].name !== '_astro' ||
		!entries[0].isDirectory() ||
		entries[0].isSymbolicLink()
	)
		throw new Error(
			`CDN release ${releaseId} must contain only the _astro directory`,
		)

	await assertDirectory(
		join(directory, '_astro'),
		`CDN release ${releaseId} assets`,
	)
}

function releaseDirectory(publicRoot, releaseId) {
	validateReleaseId(releaseId)
	const directory = resolve(publicRoot, releaseId)
	assertPathWithin(publicRoot, directory)
	return directory
}

function assertPathWithin(parentDirectory, childPath) {
	const relativePath = relative(resolve(parentDirectory), resolve(childPath))
	if (
		!relativePath ||
		relativePath.startsWith('..') ||
		isAbsolute(relativePath)
	)
		throw new Error(`Unsafe CDN path outside public directory: ${childPath}`)
}

async function assertDirectory(directory, label) {
	let details
	try {
		details = await lstat(directory)
	} catch (error) {
		if (error?.code === 'ENOENT')
			throw new Error(`${label} directory does not exist: ${directory}`)
		throw error
	}

	if (details.isSymbolicLink())
		throw new Error(`${label} must not be a symbolic link: ${directory}`)
	if (!details.isDirectory())
		throw new Error(`${label} is not a directory: ${directory}`)
}

async function assertPublicRoot(repositoryRoot, publicRoot) {
	await assertDirectory(repositoryRoot, 'CDN repository')
	await assertDirectory(publicRoot, 'CDN public')

	const [realRepositoryRoot, realPublicRoot] = await Promise.all([
		realpath(repositoryRoot),
		realpath(publicRoot),
	])
	assertPathWithin(realRepositoryRoot, realPublicRoot)
}

function parseArguments(argv) {
	const [command, ...tokens] = argv
	if (!['abort', 'stage', 'promote'].includes(command))
		throw new Error(
			'Usage: cdn-assets.mjs <abort|stage|promote> --repo <path> --release <id> [--source <path>]',
		)

	const options = {}
	for (let index = 0; index < tokens.length; index += 2) {
		const name = tokens[index]
		const value = tokens[index + 1]
		if (!name?.startsWith('--') || value === undefined)
			throw new Error(`Invalid command argument: ${name ?? '<missing>'}`)
		if (!['--repo', '--release', '--source'].includes(name))
			throw new Error(`Unknown command argument: ${name}`)
		if (options[name] !== undefined)
			throw new Error(`Duplicate command argument: ${name}`)
		options[name] = value
	}

	if (!options['--repo'] || !options['--release'])
		throw new Error('Both --repo and --release are required')
	if (command === 'stage' && !options['--source'])
		throw new Error('--source is required when staging CDN assets')
	if (command !== 'stage' && options['--source'])
		throw new Error('--source is only valid when staging CDN assets')

	return {
		command,
		repositoryDirectory: options['--repo'],
		releaseId: options['--release'],
		sourceDirectory: options['--source'],
	}
}

async function runCli() {
	const options = parseArguments(process.argv.slice(2))
	let releases
	if (options.command === 'stage') releases = await stageAssets(options)
	else if (options.command === 'promote')
		releases = await promoteAssets(options)
	else releases = await abortCandidateAssets(options)

	console.log(JSON.stringify(releases))
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
	try {
		await runCli()
	} catch (error) {
		console.error(error instanceof Error ? error.message : error)
		process.exitCode = 1
	}
}
