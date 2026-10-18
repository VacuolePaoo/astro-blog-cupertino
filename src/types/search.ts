export interface SearchDocument {
	id: string
	title: string
	description: string
	body: string
	url: string
	pubDate: string
	cover?: string
	coverAlt?: string
}

export interface SearchIndexPayload {
	documents: SearchDocument[]
}
