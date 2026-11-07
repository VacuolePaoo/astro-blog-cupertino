import assert from 'node:assert/strict'
import {
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	symlink,
	writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// Keep the release tooling dependency-free by using Node's built-in runner.
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'

import {
	abortCandidateAssets,
	CDN_RELEASES_FILE,
	promoteAssets,
	stageAssets,
	validateReleaseId,
} from './cdn-assets.mjs'
import {
	extractProductionReleaseId,
	fetchProductionReleaseId,
	getProductionReconciliationAction,
} from './cdn-production-release.mjs'

async function createFixture(
	t,
	files = { 'entry.js': 'console.log("fixture")\n' },
) {
	const root = await mkdtemp(join(tmpdir(), 'dino-cdn-assets-'))
	t.after(() => rm(root, { force: true, recursive: true }))

	const repositoryDirectory = join(root, 'repository')
	const sourceDirectory = join(root, 'source', '_astro')
	await mkdir(repositoryDirectory, { recursive: true })
	await mkdir(sourceDirectory, { recursive: true })

	for (const [relativePath, content] of Object.entries(files)) {
		const destination = join(sourceDirectory, relativePath)
		await mkdir(join(destination, '..'), { recursive: true })
		await writeFile(destination, content)
	}

	return { repositoryDirectory, root, sourceDirectory }
}

async function readReleases(repositoryDirectory) {
	return JSON.parse(
		await readFile(join(repositoryDirectory, CDN_RELEASES_FILE), 'utf8'),
	)
}

async function pathExists(path) {
	try {
		await readFile(path)
		return true
	} catch (error) {
		if (error?.code === 'ENOENT' || error?.code === 'EISDIR') return false
		throw error
	}
}

function createProductionResponse({ html, ok = true, status = 200 }) {
	return {
		ok,
		status,
		async text() {
			return html
		},
	}
}

test('stages the first release and supports an idempotent retry', async t => {
	const fixture = await createFixture(t)
	const input = { ...fixture, releaseId: 'release-a' }

	const firstResult = await stageAssets(input)
	const retryResult = await stageAssets(input)

	assert.deepEqual(firstResult, {
		schemaVersion: 1,
		current: null,
		previous: null,
		candidate: 'release-a',
	})
	assert.deepEqual(retryResult, firstResult)
	assert.equal(
		await readFile(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-a',
				'_astro',
				'entry.js',
			),
			'utf8',
		),
		'console.log("fixture")\n',
	)
})

test('keeps an existing candidate unchanged on an idempotent retry', async t => {
	const fixture = await createFixture(t)
	const input = { ...fixture, releaseId: 'release-a' }

	await stageAssets(input)
	await writeFile(
		join(fixture.sourceDirectory, 'entry.js'),
		'console.log("changed")\n',
	)

	const retryResult = await stageAssets(input)
	assert.deepEqual(retryResult, {
		schemaVersion: 1,
		current: null,
		previous: null,
		candidate: 'release-a',
	})
	assert.equal(
		await readFile(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-a',
				'_astro',
				'entry.js',
			),
			'utf8',
		),
		'console.log("fixture")\n',
	)
	assert.deepEqual(await readReleases(fixture.repositoryDirectory), {
		schemaVersion: 1,
		current: null,
		previous: null,
		candidate: 'release-a',
	})
})

test('rolls current and previous releases while keeping exactly two directories', async t => {
	const fixture = await createFixture(t)

	await stageAssets({ ...fixture, releaseId: 'release-a' })
	await promoteAssets({ ...fixture, releaseId: 'release-a' })
	await stageAssets({ ...fixture, releaseId: 'release-b' })
	await promoteAssets({ ...fixture, releaseId: 'release-b' })
	await stageAssets({ ...fixture, releaseId: 'release-c' })

	assert.deepEqual(await readReleases(fixture.repositoryDirectory), {
		schemaVersion: 1,
		current: 'release-b',
		previous: null,
		candidate: 'release-c',
	})
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-a',
				'_astro',
				'entry.js',
			),
		),
		false,
	)
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-b',
				'_astro',
				'entry.js',
			),
		),
		true,
	)
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-c',
				'_astro',
				'entry.js',
			),
		),
		true,
	)
})

test('replaces a failed candidate without deleting the active release', async t => {
	const fixture = await createFixture(t)

	await stageAssets({ ...fixture, releaseId: 'release-a' })
	await promoteAssets({ ...fixture, releaseId: 'release-a' })
	await stageAssets({ ...fixture, releaseId: 'release-b' })
	await stageAssets({ ...fixture, releaseId: 'release-c' })

	assert.deepEqual(await readReleases(fixture.repositoryDirectory), {
		schemaVersion: 1,
		current: 'release-a',
		previous: null,
		candidate: 'release-c',
	})
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-a',
				'_astro',
				'entry.js',
			),
		),
		true,
	)
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-b',
				'_astro',
				'entry.js',
			),
		),
		false,
	)
})

test('promotes a candidate and supports an idempotent retry', async t => {
	const fixture = await createFixture(t)

	await stageAssets({ ...fixture, releaseId: 'release-a' })
	await promoteAssets({ ...fixture, releaseId: 'release-a' })
	await stageAssets({ ...fixture, releaseId: 'release-b' })
	const promoted = await promoteAssets({ ...fixture, releaseId: 'release-b' })
	const retried = await promoteAssets({ ...fixture, releaseId: 'release-b' })

	assert.deepEqual(promoted, {
		schemaVersion: 1,
		current: 'release-b',
		previous: 'release-a',
		candidate: null,
	})
	assert.deepEqual(retried, promoted)
})

test('aborts only the expected unpromoted candidate', async t => {
	const fixture = await createFixture(t)

	await stageAssets({ ...fixture, releaseId: 'release-a' })
	await promoteAssets({ ...fixture, releaseId: 'release-a' })
	await stageAssets({ ...fixture, releaseId: 'release-b' })
	await assert.rejects(
		abortCandidateAssets({ ...fixture, releaseId: 'release-c' }),
		/Cannot abort release-c: staged candidate is release-b/,
	)

	const aborted = await abortCandidateAssets({
		...fixture,
		releaseId: 'release-b',
	})
	const retried = await abortCandidateAssets({
		...fixture,
		releaseId: 'release-b',
	})

	assert.deepEqual(aborted, {
		schemaVersion: 1,
		current: 'release-a',
		previous: null,
		candidate: null,
	})
	assert.deepEqual(retried, aborted)
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-b',
				'_astro',
				'entry.js',
			),
		),
		false,
	)
})

test('does not replace a newer candidate when retrying an old current release', async t => {
	const fixture = await createFixture(t)

	await stageAssets({ ...fixture, releaseId: 'release-a' })
	await promoteAssets({ ...fixture, releaseId: 'release-a' })
	await stageAssets({ ...fixture, releaseId: 'release-b' })

	await assert.rejects(
		stageAssets({ ...fixture, releaseId: 'release-a' }),
		/Cannot stage current release release-a while candidate release-b exists/,
	)
	assert.deepEqual(await readReleases(fixture.repositoryDirectory), {
		schemaVersion: 1,
		current: 'release-a',
		previous: null,
		candidate: 'release-b',
	})
})

test('restores the previous release tree when candidate switching fails', async t => {
	const fixture = await createFixture(t)

	await stageAssets({ ...fixture, releaseId: 'release-a' })
	await promoteAssets({ ...fixture, releaseId: 'release-a' })
	await stageAssets({ ...fixture, releaseId: 'release-b' })
	await promoteAssets({ ...fixture, releaseId: 'release-b' })

	await assert.rejects(
		stageAssets({
			...fixture,
			hooks: {
				beforeMetadataCommit() {
					throw new Error('simulated switch failure')
				},
			},
			releaseId: 'release-c',
		}),
		/simulated switch failure/,
	)

	assert.deepEqual(await readReleases(fixture.repositoryDirectory), {
		schemaVersion: 1,
		current: 'release-b',
		previous: 'release-a',
		candidate: null,
	})
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-a',
				'_astro',
				'entry.js',
			),
		),
		true,
	)
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-b',
				'_astro',
				'entry.js',
			),
		),
		true,
	)
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				'public',
				'release-c',
				'_astro',
				'entry.js',
			),
		),
		false,
	)
})

test('retains recovery files when a rollback cannot restore a moved release', async t => {
	const fixture = await createFixture(t)

	await stageAssets({ ...fixture, releaseId: 'release-a' })
	await promoteAssets({ ...fixture, releaseId: 'release-a' })
	await stageAssets({ ...fixture, releaseId: 'release-b' })

	await assert.rejects(
		stageAssets({
			...fixture,
			hooks: {
				async beforeMetadataCommit() {
					const conflictingDirectory = join(
						fixture.repositoryDirectory,
						'public',
						'release-b',
					)
					await mkdir(conflictingDirectory)
					await writeFile(
						join(conflictingDirectory, 'conflict.txt'),
						'conflict',
					)
					throw new Error('simulated rollback failure')
				},
			},
			releaseId: 'release-c',
		}),
		/recovery files were retained/,
	)

	const stagingDirectories = (
		await readdir(fixture.repositoryDirectory)
	).filter(entry => entry.startsWith('.vacucdn-stage-'))
	assert.equal(stagingDirectories.length, 1)
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				stagingDirectories[0],
				'backup',
				'release-b',
				'_astro',
				'entry.js',
			),
		),
		true,
	)
})

test('retains recovery files when abort rollback cannot restore the candidate', async t => {
	const fixture = await createFixture(t)

	await stageAssets({ ...fixture, releaseId: 'release-a' })
	await promoteAssets({ ...fixture, releaseId: 'release-a' })
	await stageAssets({ ...fixture, releaseId: 'release-b' })

	await assert.rejects(
		abortCandidateAssets({
			...fixture,
			hooks: {
				async beforeMetadataCommit() {
					const conflictingDirectory = join(
						fixture.repositoryDirectory,
						'public',
						'release-b',
					)
					await mkdir(conflictingDirectory)
					await writeFile(
						join(conflictingDirectory, 'conflict.txt'),
						'conflict',
					)
					throw new Error('simulated abort rollback failure')
				},
			},
			releaseId: 'release-b',
		}),
		/Failed to abort CDN candidate and restore it; recovery files were retained/,
	)

	const stagingDirectories = (
		await readdir(fixture.repositoryDirectory)
	).filter(entry => entry.startsWith('.vacucdn-stage-'))
	assert.equal(stagingDirectories.length, 1)
	assert.equal(
		await pathExists(
			join(
				fixture.repositoryDirectory,
				stagingDirectories[0],
				'backup',
				'release-b',
				'_astro',
				'entry.js',
			),
		),
		true,
	)
	assert.deepEqual(await readReleases(fixture.repositoryDirectory), {
		schemaVersion: 1,
		current: 'release-a',
		previous: null,
		candidate: 'release-b',
	})
})

test('rejects path traversal and unknown release directories', async t => {
	const traversalFixture = await createFixture(t)
	await assert.rejects(
		stageAssets({ ...traversalFixture, releaseId: '../escape' }),
		/Invalid CDN release ID/,
	)

	const unknownFixture = await createFixture(t)
	await mkdir(
		join(unknownFixture.repositoryDirectory, 'public', 'orphan-release'),
		{
			recursive: true,
		},
	)
	await assert.rejects(
		stageAssets({ ...unknownFixture, releaseId: 'release-a' }),
		/Unknown CDN release directory: orphan-release/,
	)
})

test('rejects symbolic public roots and unexpected page files', async t => {
	const symbolicFixture = await createFixture(t)
	const outsideDirectory = join(symbolicFixture.root, 'outside-public')
	await mkdir(outsideDirectory)
	await symlink(
		outsideDirectory,
		join(symbolicFixture.repositoryDirectory, 'public'),
		process.platform === 'win32' ? 'junction' : 'dir',
	)
	await assert.rejects(
		stageAssets({ ...symbolicFixture, releaseId: 'release-a' }),
		/CDN public must not be a symbolic link/,
	)

	const rootFileFixture = await createFixture(t)
	await mkdir(join(rootFileFixture.repositoryDirectory, 'public'))
	await writeFile(
		join(rootFileFixture.repositoryDirectory, 'public', 'index.html'),
		'<h1>unexpected</h1>',
	)
	await assert.rejects(
		stageAssets({ ...rootFileFixture, releaseId: 'release-a' }),
		/Unexpected CDN public file: index.html/,
	)

	const releaseFileFixture = await createFixture(t)
	await stageAssets({ ...releaseFileFixture, releaseId: 'release-a' })
	await writeFile(
		join(
			releaseFileFixture.repositoryDirectory,
			'public',
			'release-a',
			'index.html',
		),
		'<h1>unexpected</h1>',
	)
	await assert.rejects(
		stageAssets({ ...releaseFileFixture, releaseId: 'release-a' }),
		/CDN release release-a must contain only the _astro directory/,
	)
})

test('rejects invalid release states and Windows reserved names', async t => {
	for (const releaseId of ['con', 'nul.txt', 'com1', 'lpt9.log'])
		assert.throws(() => validateReleaseId(releaseId), /Invalid CDN release ID/)

	const fixture = await createFixture(t)
	await writeFile(
		join(fixture.repositoryDirectory, CDN_RELEASES_FILE),
		`${JSON.stringify({
			schemaVersion: 1,
			current: 'release-a',
			previous: 'release-old',
			candidate: 'release-b',
		})}\n`,
	)
	await assert.rejects(
		stageAssets({ ...fixture, releaseId: 'release-c' }),
		/previous and candidate cannot coexist/,
	)
})

test('extracts one production CDN release and deduplicates asset references', () => {
	const releaseId = extractProductionReleaseId({
		cdnBaseUrl: 'https://assets.example.test/',
		html: `
			<link rel="stylesheet" href="https://assets.example.test/release-a/_astro/app.css">
			<script src="https://assets.example.test/release-a/_astro/app.js"></script>
		`,
	})

	assert.equal(releaseId, 'release-a')
})

test('reports no production CDN release before the first migration', () => {
	assert.equal(
		extractProductionReleaseId({
			cdnBaseUrl: 'https://assets.example.test',
			html: '<script src="/_astro/app.js"></script>',
		}),
		null,
	)
})

test('rejects production HTML that references multiple CDN releases', () => {
	assert.throws(
		() =>
			extractProductionReleaseId({
				cdnBaseUrl: 'https://assets.example.test',
				html: `
					<script src="https://assets.example.test/release-a/_astro/a.js"></script>
					<script src="https://assets.example.test/release-b/_astro/b.js"></script>
				`,
			}),
		/Production HTML references multiple CDN releases/,
	)
})

test('fetches the production release for interrupted candidate recovery', async () => {
	const productionUrl = 'https://blog.example.test'
	const html = `
		<script src="https://assets.example.test/release-a/_astro/app.js"></script>
	`
	const releaseId = await fetchProductionReleaseId({
		cdnBaseUrl: 'https://assets.example.test',
		fetchImplementation: async (url, options) => {
			assert.equal(url, productionUrl)
			assert.equal(options.cache, 'no-store')
			assert.equal(options.headers['cache-control'], 'no-cache')
			return createProductionResponse({ html })
		},
		productionUrl,
	})

	assert.equal(releaseId, 'release-a')

	await assert.rejects(
		fetchProductionReleaseId({
			cdnBaseUrl: 'https://assets.example.test',
			fetchImplementation: async () =>
				createProductionResponse({
					html: '',
					ok: false,
					status: 503,
				}),
			productionUrl,
		}),
		/Production URL returned 503/,
	)
	await assert.rejects(
		fetchProductionReleaseId({
			cdnBaseUrl: 'https://assets.example.test',
			fetchImplementation: async () => {
				throw new Error('HTTP production URL must fail before fetching')
			},
			productionUrl: 'http://blog.example.test',
		}),
		/Production URL must use HTTPS/,
	)
	assert.throws(
		() =>
			extractProductionReleaseId({
				cdnBaseUrl: 'http://assets.example.test',
				html,
			}),
		/CDN base URL must use HTTPS/,
	)
})

test('fails closed until an unresolved CDN candidate is live', () => {
	assert.equal(
		getProductionReconciliationAction({
			candidateReleaseId: null,
			currentReleaseId: null,
			liveReleaseId: null,
		}),
		'proceed',
	)
	assert.equal(
		getProductionReconciliationAction({
			candidateReleaseId: null,
			currentReleaseId: 'release-a',
			liveReleaseId: 'release-a',
		}),
		'proceed',
	)
	assert.equal(
		getProductionReconciliationAction({
			candidateReleaseId: 'release-b',
			currentReleaseId: 'release-a',
			liveReleaseId: 'release-b',
		}),
		'promote-candidate',
	)
	assert.throws(
		() =>
			getProductionReconciliationAction({
				candidateReleaseId: 'release-b',
				currentReleaseId: 'release-a',
				liveReleaseId: 'release-a',
			}),
		/CDN candidate release-b is unresolved/,
	)
	assert.throws(
		() =>
			getProductionReconciliationAction({
				candidateReleaseId: 'release-a',
				currentReleaseId: null,
				liveReleaseId: null,
			}),
		/CDN candidate release-a is unresolved/,
	)
})
