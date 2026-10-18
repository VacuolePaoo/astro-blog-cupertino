import type { APIRoute } from 'astro'
import { getArticles } from '../utils/article'
import { toSearchDocument } from '../utils/search-document'

export const GET: APIRoute = async () => {
	const articles = await getArticles()
	return new Response(
		JSON.stringify({ documents: articles.map(toSearchDocument) }),
		{
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Cache-Control': 'public, max-age=3600',
			},
		},
	)
}
