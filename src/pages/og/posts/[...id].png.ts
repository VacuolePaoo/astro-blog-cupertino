import type { APIRoute, GetStaticPaths } from 'astro'
import { getArticles } from '../../../utils/article'
import { renderArticleOg } from '../../../utils/og'

export const getStaticPaths = (async () =>
	(await getArticles()).map(article => ({
		params: { id: article.id },
		props: { article },
	}))) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) =>
	new Response(await renderArticleOg(props.article), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
