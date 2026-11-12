import type { APIRoute } from 'astro'
import blogConfig from '../../blog.config'
import { aiConfig } from '../utils/ai'
import {
	getArticleDescription,
	getArticles,
	getArticleUrl,
} from '../utils/article'
import { absoluteUrl } from '../utils/link'
import { siteOrigin } from '../utils/site'

/** llmstxt.org 站点索引：H1 站点名 + 引用块摘要 + 分节链接清单，供智能体发现站点内容 */
export const GET: APIRoute = async () => {
	if (!aiConfig.llmsTxt) return new Response(null, { status: 404 })

	const articles = await getArticles()
	const { copyright } = blogConfig
	const postLines = articles.map(
		article =>
			`- [${article.data.title}](${absoluteUrl(getArticleUrl(article), siteOrigin)}): ${getArticleDescription(article)} (${article.data.date})`,
	)
	const content = [
		`# ${blogConfig.title}`,
		'',
		`> ${blogConfig.description}`,
		'',
		`- Author: ${blogConfig.author.name}`,
		`- Site: ${siteOrigin}`,
		`- Language: ${blogConfig.language}`,
		`- License: ${copyright.license} (${copyright.url})`,
		`- Atom feed: ${absoluteUrl('/atom.xml', siteOrigin)}`,
		`- RSS feed: ${absoluteUrl('/rss.xml', siteOrigin)}`,
		`- Sitemap: ${absoluteUrl('/sitemap-index.xml', siteOrigin)}`,
		`- Full content: ${absoluteUrl('/llms-full.txt', siteOrigin)}`,
		'',
		'## Pages',
		'',
		`- [Archives](${absoluteUrl('/archives/', siteOrigin)}): 全部文章的时间线归档`,
		`- [Categories](${absoluteUrl('/categories/', siteOrigin)}): 分类索引`,
		`- [Tags](${absoluteUrl('/tags/', siteOrigin)}): 标签索引`,
		`- [About](${absoluteUrl('/about/', siteOrigin)}): 关于站点与作者`,
		`- [Works](${absoluteUrl('/works/', siteOrigin)}): 项目作品集`,
		`- [Friends](${absoluteUrl('/friends/', siteOrigin)}): 友情链接`,
		// 无文章时省略空的 Posts 分节
		...(postLines.length > 0 ? ['', '## Posts', '', ...postLines] : []),
	].join('\n')
	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	})
}
