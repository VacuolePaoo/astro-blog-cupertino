import type { APIRoute } from 'astro'
import { siteOrigin } from '../utils/site'

export const GET: APIRoute = () =>
	new Response(
		[
			'User-agent: *',
			'Allow: /',
			'Disallow: /previews/',
			'',
			`Sitemap: ${new URL('/sitemap-index.xml', siteOrigin).href}`,
		].join('\n'),
		{ headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
	)
