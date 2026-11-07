import { resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { validateReleaseId } from './cdn-assets.mjs'

/**
 * Extract the single versioned CDN release referenced by production HTML.
 * Returns null before the first CDN-backed production deployment.
 */
export function extractProductionReleaseId({ cdnBaseUrl, html }) {
	if (typeof html !== 'string')
		throw new Error('Production HTML must be a string')

	const normalizedCdnBaseUrl = normalizeHttpUrl(cdnBaseUrl, 'CDN base URL')
	const releasePattern = new RegExp(
		`${escapeRegularExpression(normalizedCdnBaseUrl)}/([^/"'<>\\s]+)/_astro/`,
		'gi',
	)
	const releaseIds = new Set()

	for (const match of html.matchAll(releasePattern)) {
		const releaseId = decodeURIComponent(match[1])
		validateReleaseId(releaseId)
		releaseIds.add(releaseId)
	}

	if (releaseIds.size > 1)
		throw new Error(
			`Production HTML references multiple CDN releases: ${[...releaseIds].join(', ')}`,
		)

	return releaseIds.values().next().value ?? null
}

/**
 * Decide whether a deployment may continue or must finish an interrupted
 * metadata promotion. An unresolved candidate is always preserved.
 */
export function getProductionReconciliationAction({
	candidateReleaseId,
	currentReleaseId,
	liveReleaseId,
}) {
	const candidate = normalizeOptionalReleaseId(
		candidateReleaseId,
		'Candidate release ID',
	)
	const current = normalizeOptionalReleaseId(
		currentReleaseId,
		'Current release ID',
	)
	const live = normalizeOptionalReleaseId(liveReleaseId, 'Live release ID')

	if (candidate !== null && candidate === current)
		throw new Error('Current and candidate release IDs must differ')

	if (candidate !== null) {
		if (live === candidate) return 'promote-candidate'

		throw new Error(
			`CDN candidate ${candidate} is unresolved while production references ${live ?? 'no CDN release'}; preserve it and verify the previous deployment before staging another candidate`,
		)
	}

	if (live === null && current === null) return 'proceed'
	if (current !== null && live === current) return 'proceed'

	throw new Error(
		`Cannot reconcile production release ${live ?? 'none'} with current ${current ?? 'none'}`,
	)
}

/** Fetch production HTML without cache and report its referenced CDN release. */
export async function fetchProductionReleaseId({
	cdnBaseUrl,
	fetchImplementation = fetch,
	productionUrl,
}) {
	const normalizedProductionUrl = normalizeHttpUrl(
		productionUrl,
		'Production URL',
	)
	const response = await fetchImplementation(normalizedProductionUrl, {
		cache: 'no-store',
		headers: { 'cache-control': 'no-cache' },
		redirect: 'follow',
	})

	if (!response.ok)
		throw new Error(
			`Production URL returned ${response.status}: ${normalizedProductionUrl}`,
		)

	const html = await response.text()
	return extractProductionReleaseId({
		cdnBaseUrl,
		html,
	})
}

function normalizeOptionalReleaseId(value, label) {
	if (value === undefined || value === null) return null
	if (typeof value !== 'string' || value === '')
		throw new Error(`${label} must be a non-empty string when provided`)

	validateReleaseId(value)
	return value
}

function normalizeHttpUrl(value, label) {
	if (typeof value !== 'string' || value.trim() === '')
		throw new Error(`${label} is required`)

	let url
	try {
		url = new URL(value.trim())
	} catch (error) {
		throw new Error(`Invalid ${label}: ${String(value)}`, { cause: error })
	}

	if (url.protocol !== 'https:')
		throw new Error(`${label} must use HTTPS: ${String(value)}`)
	if (url.username || url.password || url.search || url.hash)
		throw new Error(`${label} must not contain credentials, query, or hash`)

	return url.toString().replace(/\/+$/, '')
}

function escapeRegularExpression(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseArguments(argv) {
	const options = {}
	for (let index = 0; index < argv.length; index += 2) {
		const name = argv[index]
		const value = argv[index + 1]
		if (!name?.startsWith('--') || value === undefined)
			throw new Error(`Invalid command argument: ${name ?? '<missing>'}`)
		if (
			![
				'--candidate-release',
				'--cdn-base-url',
				'--current-release',
				'--production-url',
			].includes(name)
		)
			throw new Error(`Unknown command argument: ${name}`)
		if (options[name] !== undefined)
			throw new Error(`Duplicate command argument: ${name}`)
		options[name] = value
	}

	if (!options['--cdn-base-url'] || !options['--production-url'])
		throw new Error('--cdn-base-url and --production-url are required')
	if (!options['--candidate-release'])
		throw new Error('--candidate-release is required for recovery')

	return {
		candidateReleaseId: options['--candidate-release'],
		cdnBaseUrl: options['--cdn-base-url'],
		currentReleaseId: options['--current-release'],
		productionUrl: options['--production-url'],
	}
}

async function runCli() {
	const options = parseArguments(process.argv.slice(2))
	const releaseId = await fetchProductionReleaseId(options)
	const action = getProductionReconciliationAction({
		candidateReleaseId: options.candidateReleaseId,
		currentReleaseId: options.currentReleaseId,
		liveReleaseId: releaseId,
	})

	console.log(JSON.stringify({ action, releaseId }))
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
