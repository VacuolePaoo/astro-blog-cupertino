import type { ArticleEntry } from '../types/article'
import type { SearchDocument } from '../types/search'
import {
	getArticleUrl,
	getCoverAlt,
	getCoverSource,
	stripMarkdown,
} from './article'

export function toSearchDocument(article: ArticleEntry): SearchDocument {
	const cover = getCoverSource(article)
	return {
		id: article.id,
		title: article.data.title,
		description: article.data.description,
		body: stripMarkdown(article.body),
		url: getArticleUrl(article),
		pubDate: article.data.pubDate,
		...(cover ? { cover } : {}),
		coverAlt: getCoverAlt(article),
	}
}
