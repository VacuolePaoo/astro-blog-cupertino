import type { APIRoute } from 'astro'
import blogConfig from '../../blog.config'

export const GET: APIRoute = () =>
	new Response(
		JSON.stringify({
			name: blogConfig.title,
			short_name: blogConfig.title,
			description: blogConfig.description,
			lang: blogConfig.language,
			start_url: '/',
			scope: '/',
			display: 'standalone',
			background_color: '#fbfbfd',
			theme_color: blogConfig.accentColor,
			icons: [
				{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
				{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
			],
		}),
		{
			headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
		},
	)
