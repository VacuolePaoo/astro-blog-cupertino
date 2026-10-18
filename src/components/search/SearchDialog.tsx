import type { SearchDocument, SearchIndexPayload } from '../../types/search'
import { create, insertMultiple, search } from '@orama/orama'
import { createTokenizer } from '@orama/tokenizers/mandarin'
import { Search, X } from 'lucide-react'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { highlightSnippet } from '../../utils/search'

type SearchHit = SearchDocument & { score: number }

let dataPromise: Promise<SearchIndexPayload> | undefined
let databasePromise: ReturnType<typeof buildDatabase> | undefined

async function getPayload() {
	dataPromise ??= fetch('/search-index.json').then(response => response.json())
	return dataPromise
}

async function buildDatabase() {
	const payload = await getPayload()
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

async function runSearch(term: string) {
	databasePromise ??= buildDatabase()
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

export function SearchDialog() {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const [term, setTerm] = useState('')
	const [results, setResults] = useState<SearchHit[]>([])
	const [loading, setLoading] = useState(false)
	const deferredTerm = useDeferredValue(term)

	function open() {
		requestAnimationFrame(() => {
			const dialog = dialogRef.current
			if (!dialog?.isConnected) return
			if (!dialog.open) dialog.showModal()
			inputRef.current?.focus()
			void getPayload()
		})
	}

	useEffect(() => {
		const listener = () => open()
		window.addEventListener('blog:open-search', listener)
		return () => window.removeEventListener('blog:open-search', listener)
	}, [])

	useEffect(() => {
		let active = true
		if (!deferredTerm.trim()) {
			setResults([])
			return
		}
		setLoading(true)
		void runSearch(deferredTerm)
			.then(hits => {
				if (active) setResults(hits)
			})
			.finally(() => active && setLoading(false))
		return () => {
			active = false
		}
	}, [deferredTerm])

	return (
		<dialog
			ref={dialogRef}
			className="search-dialog"
			onClick={event =>
				event.target === dialogRef.current && dialogRef.current?.close()
			}
		>
			<div className="search-panel">
				<header className="search-bar">
					<Search size={20} aria-hidden="true" />
					<input
						ref={inputRef}
						value={term}
						onChange={event => setTerm(event.target.value)}
						placeholder="搜索标题、摘要和正文"
						aria-label="搜索文章"
					/>
					<button
						type="button"
						aria-label="关闭搜索"
						onClick={() => dialogRef.current?.close()}
					>
						<X size={19} />
					</button>
				</header>
				<div className="search-results" aria-live="polite">
					{!term && (
						<p className="search-empty">
							输入关键词开始搜索，支持中文分词与轻度容错。
						</p>
					)}
					{loading && <p className="search-empty">正在搜索…</p>}
					{term && !loading && results.length === 0 && (
						<p className="search-empty">没有找到相关内容。</p>
					)}
					{results.map((result: SearchHit) => (
						<a
							className="search-result"
							href={result.url}
							key={result.id}
							onClick={() => dialogRef.current?.close()}
						>
							{result.cover && (
								<img src={result.cover} alt={result.coverAlt} loading="lazy" />
							)}
							<span className="search-result-copy">
								<strong>{result.title}</strong>
								<time dateTime={result.pubDate}>{result.pubDate}</time>
								<span
									dangerouslySetInnerHTML={{
										__html: highlightSnippet(
											`${result.description} ${result.body}`,
											deferredTerm,
										),
									}}
								/>
							</span>
						</a>
					))}
				</div>
			</div>
		</dialog>
	)
}
