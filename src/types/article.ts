import type { CollectionEntry } from 'astro:content'

export type ArticleEntry = CollectionEntry<'articles'>
export type ArticleData = ArticleEntry['data']

export interface ArticleCollectionSummary {
	name: string
	count: number
	latest: string
	icon: string
}

export interface PaginationItem {
	type: 'page' | 'ellipsis'
	page?: number
	position?: 'start' | 'end'
}
