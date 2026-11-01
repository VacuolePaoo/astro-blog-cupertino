import type { APIRoute } from 'astro'
import blogConfig from '../../blog.config'
import { getArticles, getArticleUrl } from '../utils/article'
import { toFeedInstant } from '../utils/date'
import { escapeXml } from '../utils/feed'
import { absoluteUrl } from '../utils/link'
import { siteOrigin } from '../utils/site'

export const GET: APIRoute = async () => {
	const articles = (await getArticles()).slice(0, blogConfig.feed.limit)
	const updated = articles[0]?.data.pubDate ?? '1970-01-01'
	const entries = articles
		.map(article => {
			const url = absoluteUrl(getArticleUrl(article), siteOrigin)
			return `<entry>
<title>${escapeXml(article.data.title)}</title>
<id>${escapeXml(url)}</id>
<link href="${escapeXml(url)}" />
<published>${toFeedInstant(article.data.pubDate)}</published>
	<updated>${toFeedInstant(article.data.pubDate)}</updated>
<summary type="html">${escapeXml(article.data.description)}</summary>
</entry>`
		})
		.join('\n')
	const stylesheet = blogConfig.feed.xslt
		? '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>\n'
		: ''
	const xml = `<?xml version="1.0" encoding="utf-8"?>
${stylesheet}<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${blogConfig.language}">
<title>${escapeXml(blogConfig.title)}</title>
<subtitle>${escapeXml(blogConfig.description)}</subtitle>
<id>${escapeXml(siteOrigin)}</id>
<link href="${escapeXml(siteOrigin)}" />
<link href="${escapeXml(absoluteUrl('/atom.xml', siteOrigin))}" rel="self" type="application/atom+xml" />
<updated>${toFeedInstant(updated)}</updated>
<author><name>${escapeXml(blogConfig.author.name)}</name></author>
${entries}
</feed>`
	return new Response(xml, {
		headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
	})
}
