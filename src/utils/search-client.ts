import type { SearchHit, SearchResults } from '../types/search'
import { create, insertMultiple, search } from '@orama/orama'
import { createTokenizer } from '@orama/tokenizers/mandarin'
import { parseSearchIndexPayload } from './search'

let databasePromise: ReturnType<typeof buildDatabase> | undefined

async function buildDatabase() {
	const response = await fetch('/search-index.json')
	if (!response.ok) throw new Error(`搜索索引加载失败：${response.status}`)
	const payload = parseSearchIndexPayload(await response.json())
	const db = create({
		schema: {
			id: 'string',
			articleId: 'string',
			articleTitle: 'string',
			heading: 'string',
			excerpt: 'string',
			url: 'string',
			pubDate: 'string',
			cover: 'string',
			coverAlt: 'string',
			titleSearch: 'string',
			headingSearch: 'string',
			bodySearch: 'string',
		} as const,
		components: { tokenizer: createTokenizer() },
	})
	await insertMultiple(
		db,
		payload.documents.map(document => ({
			...document,
			cover: document.cover ?? '',
			coverAlt: document.coverAlt ?? '',
		})),
	)
	return db
}

/** Return the first `limit` matching sections and retain the full match count. */
export async function searchArticles(
	term: string,
	limit: number,
): Promise<SearchResults> {
	databasePromise ??= buildDatabase().catch(error => {
		databasePromise = undefined
		throw error
	})
	const db = await databasePromise
	const results = await search(db, {
		term,
		properties: ['titleSearch', 'headingSearch', 'bodySearch'],
		boost: { titleSearch: 8, headingSearch: 4, bodySearch: 1 },
		tolerance: 1,
		limit,
	})
	const normalizedTerm = term.toLocaleLowerCase()
	const hits = results.hits
		.map(hit => ({ ...hit.document, score: hit.score }) as SearchHit)
		.toSorted((a, b) => {
			const aExact = `${a.titleSearch} ${a.headingSearch} ${a.bodySearch}`
				.toLocaleLowerCase()
				.includes(normalizedTerm)
			const bExact = `${b.titleSearch} ${b.headingSearch} ${b.bodySearch}`
				.toLocaleLowerCase()
				.includes(normalizedTerm)
			return Number(bExact) - Number(aExact) || b.score - a.score
		})
	return { hits, total: results.count }
}
