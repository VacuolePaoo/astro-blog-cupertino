import type { APIRoute } from 'astro'
import rss from '@astrojs/rss'
import blogConfig from '../../blog.config'
import {
	getArticleDescription,
	getArticles,
	getArticleUrl,
} from '../utils/article'
import { toFeedInstant } from '../utils/date'
import { siteOrigin } from '../utils/site'

export const GET: APIRoute = async context => {
	const articles = (await getArticles()).slice(0, blogConfig.feed.limit)
	return rss({
		title: blogConfig.title,
		description: blogConfig.description,
		site: context.site ?? siteOrigin,
		stylesheet: blogConfig.feed.xslt ? '/feed.xsl' : undefined,
		trailingSlash: true,
		customData: `<language>${blogConfig.language}</language>`,
		items: articles.map(article => ({
			title: article.data.title,
			description: getArticleDescription(article),
			pubDate: new Date(toFeedInstant(article.data.date)),
			link: getArticleUrl(article),
		})),
	})
}
