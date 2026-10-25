import type { APIRoute } from 'astro'
import { render } from 'astro:content'
import blogConfig from '../../blog.config'
import { getArticles } from '../utils/article'
import { toSearchDocuments } from '../utils/search-document'

export const GET: APIRoute = async () => {
	const articles = blogConfig.theme.search.enabled ? await getArticles() : []
	const documents = (
		await Promise.all(
			articles.map(async article => {
				const { headings } = await render(article)
				return toSearchDocuments(article, headings)
			}),
		)
	).flat()
	return new Response(JSON.stringify({ documents }), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	})
}
