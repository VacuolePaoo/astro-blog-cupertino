import process from 'node:process'

import blogConfig from '../../blog.config'

/**
 * Effective site origin for the current build.
 *
 * Priority: an explicit `BLOG_SITE_URL` env var (any environment, e.g. a
 * custom preview or staging domain), then the Vercel branch URL on preview
 * deployments so generated absolute links (canonical, sitemap, feed, OG
 * images) match the branch domain instead of production, then the origin
 * configured in blog.config.ts. Build-time only: reads Vercel-injected
 * system variables and must never be imported by client code.
 */
export const siteOrigin = getSiteOriginOverride() ?? blogConfig.site

/**
 * Resolves the site origin override for non-production builds, or null when
 * none applies so callers can fall back to the configured production origin.
 */
export function getSiteOriginOverride(
	env: NodeJS.ProcessEnv = process.env,
): string | null {
	const explicit = env.BLOG_SITE_URL?.trim()
	if (explicit) return normalizeOrigin(explicit)

	if (env.VERCEL_ENV === 'preview') {
		const branchUrl = env.VERCEL_BRANCH_URL?.trim()
		if (branchUrl) return normalizeOrigin(branchUrl)
	}

	return null
}

/** Adds the https scheme when missing and strips any trailing slash. */
function normalizeOrigin(origin: string): string {
	const withScheme = /^https?:\/\//.test(origin) ? origin : `https://${origin}`
	return withScheme.replace(/\/+$/, '')
}
