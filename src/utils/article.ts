import type { ArticleCollectionSummary, ArticleEntry } from '../types/article'
import { getCollection } from 'astro:content'
import blogConfig from '../../blog.config'

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
	return article.data.coverAlt || `文章《${article.data.title}》的封面图片`
}

export function getCoverSource(article: ArticleEntry) {
	const { cover } = article.data
	if (!cover) return undefined
	return typeof cover === 'string' ? cover : cover.src
}

export function getCollectionSummaries(
	articles: ArticleEntry[],
): ArticleCollectionSummary[] {
	const summaries = new Map<string, { count: number; latest: string }>()
	for (const article of articles) {
		const current = summaries.get(article.data.collection)
		summaries.set(article.data.collection, {
			count: (current?.count ?? 0) + 1,
			latest:
				current?.latest && current.latest > article.data.pubDate
					? current.latest
					: article.data.pubDate,
		})
	}

	const configuredIcons: Record<string, string> = blogConfig.collections.icons
	return [...summaries.entries()]
		.map(([name, value]) => ({
			name,
			...value,
			icon: configuredIcons[name] ?? blogConfig.collections.defaultIcon,
		}))
		.toSorted((a, b) => b.latest.localeCompare(a.latest))
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
