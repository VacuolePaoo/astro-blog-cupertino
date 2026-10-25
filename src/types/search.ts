export interface SearchDocument {
	id: string
	articleId: string
	articleTitle: string
	heading: string
	excerpt: string
	url: string
	pubDate: string
	cover?: string
	coverAlt?: string
	titleSearch: string
	headingSearch: string
	bodySearch: string
}

export interface SearchIndexPayload {
	documents: SearchDocument[]
}

export type SearchHit = SearchDocument & { score: number }

export interface SearchResults {
	hits: SearchHit[]
	total: number
}
