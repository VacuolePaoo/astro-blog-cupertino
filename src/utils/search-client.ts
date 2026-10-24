import type { SearchHit, SearchIndexPayload } from '../types/search'
import { create, insertMultiple, search } from '@orama/orama'
import { createTokenizer } from '@orama/tokenizers/mandarin'

let databasePromise: ReturnType<typeof buildDatabase> | undefined

async function buildDatabase() {
	const response = await fetch('/search-index.json')
	if (!response.ok) throw new Error(`搜索索引加载失败：${response.status}`)
	const payload = (await response.json()) as SearchIndexPayload
	const db = create({
		schema: {
			id: 'string',
			title: 'string',
			description: 'string',
			body: 'string',
			url: 'string',
			pubDate: 'string',
			cover: 'string',
			coverAlt: 'string',
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

/** Searches the static index with Mandarin tokenization and favors exact text matches. */
export async function searchArticles(term: string): Promise<SearchHit[]> {
	databasePromise ??= buildDatabase().catch(error => {
		databasePromise = undefined
		throw error
	})
	const db = await databasePromise
	const results = await search(db, {
		term,
		properties: ['title', 'description', 'body'],
		boost: { title: 8, description: 3, body: 1 },
		tolerance: 1,
		limit: 12,
	})
	const normalizedTerm = term.toLocaleLowerCase()
	return results.hits
		.map(hit => ({ ...hit.document, score: hit.score }) as SearchHit)
		.toSorted((a, b) => {
			const aExact = `${a.title} ${a.description} ${a.body}`
				.toLocaleLowerCase()
				.includes(normalizedTerm)
			const bExact = `${b.title} ${b.description} ${b.body}`
				.toLocaleLowerCase()
				.includes(normalizedTerm)
			return Number(bExact) - Number(aExact) || b.score - a.score
		})
}
