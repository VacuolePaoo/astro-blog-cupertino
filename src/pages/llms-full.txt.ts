import type { APIRoute } from 'astro'
import blogConfig from '../../blog.config'
import { aiConfig } from '../utils/ai'
import { getArticles, getArticleUrl } from '../utils/article'
import { absoluteUrl } from '../utils/link'
import { siteOrigin } from '../utils/site'

/** llmstxt.org 全文合集：每篇文章的原始 Markdown，附来源链接与元信息 */
export const GET: APIRoute = async () => {
	if (!aiConfig.llmsTxt) return new Response(null, { status: 404 })

	const articles = await getArticles()
	const sections = articles.map(article => {
		const meta = [
			`- Source: ${absoluteUrl(getArticleUrl(article), siteOrigin)}`,
			`- Published: ${article.data.date}`,
			...(article.data.tags?.length
				? [`- Tags: ${article.data.tags.join(', ')}`]
				: []),
		]
		return [
			`## ${article.data.title}`,
			'',
			...meta,
			'',
			(article.body ?? '').trim(),
		].join('\n')
	})
	const header = [
		`# ${blogConfig.title}`,
		'',
		`> ${blogConfig.description}`,
	].join('\n')
	const content = [
		header,
		...(sections.length > 0 ? [sections.join('\n\n---\n\n')] : []),
	].join('\n\n')
	return new Response(`${content}\n`, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	})
}
