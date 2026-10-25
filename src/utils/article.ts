import type { ArticleEntry } from '../types/article'
import { getCollection } from 'astro:content'
import { fallbackCoverAlt } from './image'

export async function getArticles(options: { drafts?: boolean } = {}) {
	const { drafts = false } = options
	const entries = await getCollection(
		'articles',
		({ data }) => data.draft === drafts,
	)
	return entries.toSorted((a, b) =>
		b.data.pubDate.localeCompare(a.data.pubDate),
	)
}

export function getArticleUrl(article: ArticleEntry, preview = false) {
	return `/${preview ? 'previews' : 'posts'}/${article.id}/`
}

export function getCoverAlt(article: ArticleEntry) {
	return article.data.coverAlt || fallbackCoverAlt(article.data.title)
}

export function getCoverSource(article: ArticleEntry) {
	const { cover } = article.data
	if (!cover) return undefined
	return typeof cover === 'string' ? cover : cover.src
}

/** Match Hexo excerpts: authored override, then content before a `<!-- more -->` marker. */
export function getArticleExcerpt(article: ArticleEntry) {
	if (article.data.excerpt) return article.data.excerpt
	const body = article.body ?? ''
	const marker = body.search(/<!--\s*more\s*-->/i)
	return marker < 0 ? undefined : stripMarkdown(body.slice(0, marker))
}

export function getArticleSurround(
	articles: ArticleEntry[],
	article: ArticleEntry,
) {
	const index = articles.findIndex(item => item.id === article.id)
	return {
		newer: index > 0 ? articles[index - 1] : undefined,
		older:
			index >= 0 && index < articles.length - 1
				? articles[index + 1]
				: undefined,
	}
}

export function stripMarkdown(markdown = '') {
	return markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/[>*_~\-|]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}
