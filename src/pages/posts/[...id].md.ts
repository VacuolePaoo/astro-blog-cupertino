import type { APIRoute, GetStaticPaths } from 'astro'
import { aiConfig } from '../../utils/ai'
import {
	getArticleDescription,
	getArticles,
	getArticleSlug,
	getArticleUrl,
} from '../../utils/article'
import { absoluteUrl } from '../../utils/link'
import { siteOrigin } from '../../utils/site'

// 功能关闭时不产出任何 .md 端点文件
export const getStaticPaths = (async () => {
	if (!aiConfig.markdownEndpoints) return []
	return (await getArticles()).map(article => ({
		params: { id: getArticleSlug(article) },
		props: { article },
	}))
}) satisfies GetStaticPaths

/** 文章原始 Markdown：还原 Frontmatter 元信息与未经渲染的正文 */
export const GET: APIRoute = ({ props }) => {
	const { article } = props
	const { title, date, tags, collection } = article.data
	// JSON 字符串是合法的 YAML 标量，可安全承载标题中的引号与冒号
	const content = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`description: ${JSON.stringify(getArticleDescription(article))}`,
		`date: ${date}`,
		...(tags?.length ? [`tags: ${JSON.stringify(tags)}`] : []),
		...(collection ? [`collection: ${JSON.stringify(collection)}`] : []),
		`url: ${JSON.stringify(absoluteUrl(getArticleUrl(article), siteOrigin))}`,
		'---',
		'',
		(article.body ?? '').trim(),
	].join('\n')
	return new Response(`${content}\n`, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	})
}
