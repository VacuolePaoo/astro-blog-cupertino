import type { SearchHit } from '../../types/search'
import { Search } from 'lucide-react'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { highlightSnippet } from '../../utils/search'
import { searchArticles } from '../../utils/search-client'

export function SearchPage() {
	const inputRef = useRef<HTMLInputElement>(null)
	const [term, setTerm] = useState('')
	const [results, setResults] = useState<SearchHit[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)
	const deferredTerm = useDeferredValue(term)

	useEffect(() => {
		const initialTerm = new URLSearchParams(location.search).get('q') ?? ''
		setTerm(initialTerm)
	}, [])

	useEffect(() => {
		let active = true
		const query = deferredTerm.trim()
		if (!query) {
			setResults([])
			setLoading(false)
			setError(false)
			return
		}
		setLoading(true)
		setError(false)
		void searchArticles(query)
			.then(hits => {
				if (active) setResults(hits)
			})
			.catch(() => {
				if (active) setError(true)
			})
			.finally(() => {
				if (active) setLoading(false)
			})
		return () => {
			active = false
		}
	}, [deferredTerm])

	return (
		<div className="search-page-ui">
			<label className="search-field">
				<Search size={20} aria-hidden="true" />
				<input
					ref={inputRef}
					type="search"
					value={term}
					onChange={event => setTerm(event.target.value)}
					placeholder="搜索文章"
					aria-label="搜索文章"
				/>
			</label>
			<div className="search-results" aria-live="polite">
				{loading && <p className="search-empty">正在搜索…</p>}
				{error && <p className="search-empty">搜索暂时不可用，请稍后重试。</p>}
				{term && !loading && !error && results.length === 0 && (
					<p className="search-empty">没有找到相关内容。</p>
				)}
				{!error &&
					results.map(result => (
						<a className="search-result" href={result.url} key={result.id}>
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
	)
}
