import type { APIRoute } from 'astro'
import { renderSiteOg } from '../../utils/og'

export const GET: APIRoute = async () =>
	new Response(await renderSiteOg(), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
