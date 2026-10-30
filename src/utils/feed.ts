import type { ArticleEntry } from '../types/article'
import type { FeedItem } from '../types/feed'
import blogConfig from '../../blog.config'
import { getArticleUrl } from './article'
import { absoluteUrl } from './link'
import { siteOrigin } from './site'

export function toFeedItems(articles: ArticleEntry[]): FeedItem[] {
	return articles.slice(0, blogConfig.feed.limit).map(article => ({
		title: article.data.title,
		description: article.data.description,
		pubDate: article.data.pubDate,
		url: absoluteUrl(getArticleUrl(article), siteOrigin),
	}))
}

export function escapeXml(value: string) {
	return value.replace(
		/[<>&'"]/g,
		character =>
			({
				'<': '&lt;',
				'>': '&gt;',
				'&': '&amp;',
				"'": '&apos;',
				'"': '&quot;',
			})[character]!,
	)
}
