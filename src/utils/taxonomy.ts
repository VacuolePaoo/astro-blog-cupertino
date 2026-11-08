import type { ArticleEntry } from '../types/article'
import type { TaxonomyKind, TaxonomySummary } from '../types/taxonomy'

function getArticleTerms(article: ArticleEntry, kind: TaxonomyKind) {
	return kind === 'categories'
		? article.data.collection
			? [article.data.collection]
			: []
		: (article.data.tags ?? [])
}

export function getTaxonomySummaries(
	articles: ArticleEntry[],
	kind: TaxonomyKind,
): TaxonomySummary[] {
	const entries = new Map<string, ArticleEntry[]>()
	for (const article of articles) {
		for (const term of new Set(getArticleTerms(article, kind))) {
			const current = entries.get(term) ?? []
			entries.set(term, [...current, article])
		}
	}

	return [...entries.entries()]
		.map(([name, termArticles]) => ({
			name,
			count: termArticles.length,
			latest: termArticles[0]?.data.date ?? '',
			articles: termArticles,
		}))
		.toSorted((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
}

export function getTaxonomyUrl(kind: TaxonomyKind, name: string) {
	return `/${kind}/${encodeURIComponent(name)}/`
}
