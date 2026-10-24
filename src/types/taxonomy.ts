import type { ArticleEntry } from './article'

export type TaxonomyKind = 'categories' | 'tags'

export interface TaxonomySummary {
	name: string
	count: number
	latest: string
	articles: ArticleEntry[]
}
