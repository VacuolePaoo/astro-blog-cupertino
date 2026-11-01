import type { ThemeConfig } from '../../types/config'
import type { SearchResults } from '../../types/search'
import { CornerDownRight, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import blogConfig from '../../../blog.config'
import { SEARCH_PAGE_SIZE } from '../../consts'
import { formatDisplayDate } from '../../utils/date-display'
import {
	getSearchArticleUrl,
	highlightSnippet,
	highlightText,
} from '../../utils/search'
import { searchArticles } from '../../utils/search-client'

const emptyResults: SearchResults = { hits: [], total: 0 }

export function SearchPage() {
	const inputRef = useRef<HTMLInputElement>(null)
	const resultsRef = useRef<HTMLDivElement>(null)
	const focusNewResultsFrom = useRef<number | null>(null)
	const [term, setTerm] = useState('')
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<SearchResults>(emptyResults)
	const [loading, setLoading] = useState(false)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState(false)
	const [moreError, setMoreError] = useState(false)
	const [visibleLimit, setVisibleLimit] = useState(SEARCH_PAGE_SIZE)
	const [retryVersion, setRetryVersion] = useState(0)
	const searchSettings: ThemeConfig['search'] = blogConfig.theme.search
	const { trigger, delayMs } = searchSettings

	useEffect(() => {
		const initialTerm =
			new URLSearchParams(location.search).get('q')?.trim() ?? ''
		setTerm(initialTerm)
		setQuery(initialTerm)
		inputRef.current?.focus()
	}, [])

	useEffect(() => {
		const trimmed = term.trim()
		if (!trimmed) {
			setQuery('')
			setVisibleLimit(SEARCH_PAGE_SIZE)
			setResults(emptyResults)
			setError(false)
			setMoreError(false)
			return
		}
		if (trigger !== 'debounce' || trimmed === query) return
		const timeout = setTimeout(() => {
			focusNewResultsFrom.current = null
			setVisibleLimit(SEARCH_PAGE_SIZE)
			setQuery(trimmed)
		}, delayMs)
		return () => clearTimeout(timeout)
	}, [term, query, trigger, delayMs])

	useEffect(() => {
		let active = true
		if (!query) {
			setLoading(false)
			setLoadingMore(false)
			setResults(emptyResults)
			return
		}
		const loadingAdditional = visibleLimit > SEARCH_PAGE_SIZE
		if (loadingAdditional) {
			setLoadingMore(true)
			setMoreError(false)
		} else {
			setLoading(true)
			setError(false)
			setResults(emptyResults)
		}
		void searchArticles(query, visibleLimit)
			.then(found => {
				if (active) {
					setResults(found)
					setMoreError(false)
				}
			})
			.catch(() => {
				if (active) {
					if (loadingAdditional) setMoreError(true)
					else setError(true)
				}
			})
			.finally(() => {
				if (active) {
					setLoading(false)
					setLoadingMore(false)
				}
			})
		return () => {
			active = false
		}
	}, [query, visibleLimit, retryVersion])

	useEffect(() => {
		const index = focusNewResultsFrom.current
		if (index === null || loadingMore || results.hits.length <= index) return
		focusNewResultsFrom.current = null
		resultsRef.current
			?.querySelectorAll<HTMLAnchorElement>('.search-result-title')
			.item(index)
			?.focus()
	}, [loadingMore, results.hits.length])

	const current = term.trim() === query
	const showResults = current && Boolean(query) && !loading && !error
	const hasMore = showResults && results.hits.length < results.total

	function submitSearch() {
		const nextQuery = term.trim()
		if (nextQuery === query) setRetryVersion(version => version + 1)
		else {
			focusNewResultsFrom.current = null
			setVisibleLimit(SEARCH_PAGE_SIZE)
			setQuery(nextQuery)
		}
	}

	return (
		<div className="search-page-ui">
			<form
				className="search-field"
				role="search"
				onSubmit={event => {
					event.preventDefault()
					submitSearch()
				}}
			>
				<button className="search-submit" type="submit" aria-label="搜索">
					<Search size={18} aria-hidden="true" />
				</button>
				<input
					ref={inputRef}
					type="search"
					value={term}
					onChange={event => {
						setTerm(event.target.value)
						if (trigger === 'submit') {
							focusNewResultsFrom.current = null
							setVisibleLimit(SEARCH_PAGE_SIZE)
							setQuery('')
						}
					}}
					placeholder="搜索文章"
					aria-label="搜索文章"
				/>
				{term && (
					<button
						className="search-clear"
						type="button"
						aria-label="清除搜索"
						onClick={() => {
							focusNewResultsFrom.current = null
							setTerm('')
							setQuery('')
							setVisibleLimit(SEARCH_PAGE_SIZE)
							inputRef.current?.focus()
						}}
					>
						<X size={18} aria-hidden="true" />
					</button>
				)}
			</form>
			<div className="search-status" aria-live="polite">
				{current && loading && <p className="search-empty">正在搜索…</p>}
				{current && error && (
					<>
						<p className="search-empty">搜索暂时不可用，请稍后重试。</p>
						<button
							className="search-retry"
							type="button"
							onClick={() => setRetryVersion(version => version + 1)}
						>
							重试
						</button>
					</>
				)}
				{showResults && (
					<p className="search-count">
						{`共 ${results.total} 条结果，已显示 ${results.hits.length} 条`}
					</p>
				)}
				{showResults && results.total === 0 && (
					<p className="search-empty">没有找到相关内容。</p>
				)}
			</div>
			<div
				ref={resultsRef}
				className="search-results"
				data-lenis-prevent=""
				role="region"
				aria-label="搜索结果列表"
				tabIndex={showResults && results.hits.length > 0 ? 0 : undefined}
			>
				{showResults &&
					results.hits.map(result => (
						<article className="search-result" key={result.id}>
							{result.cover && (
								<img
									src={result.cover}
									alt={
										result.coverAlt ||
										`文章《${result.articleTitle}》的封面图片`
									}
									loading="lazy"
								/>
							)}
							<div className="search-result-copy">
								<a
									className="search-result-title"
									href={getSearchArticleUrl(result.url)}
								>
									<strong
										dangerouslySetInnerHTML={{
											__html: highlightText(result.articleTitle, query),
										}}
									/>
								</a>
								{result.heading && (
									<a className="search-result-heading" href={result.url}>
										<CornerDownRight size={16} aria-hidden="true" />
										<span
											dangerouslySetInnerHTML={{
												__html: highlightText(`位于“${result.heading}”`, query),
											}}
										/>
									</a>
								)}
								<time dateTime={result.pubDate}>
									{formatDisplayDate(result.pubDate)}
								</time>
								{result.excerpt && (
									<span
										className="search-result-snippet"
										dangerouslySetInnerHTML={{
											__html: highlightSnippet(result.excerpt, query),
										}}
									/>
								)}
							</div>
						</article>
					))}
				{hasMore && (
					<div className="search-more">
						{moreError && (
							<p className="search-more-error">搜索暂时不可用，请稍后重试。</p>
						)}
						<button
							type="button"
							disabled={loadingMore}
							onClick={event => {
								if (moreError) setRetryVersion(version => version + 1)
								else {
									if (event.detail === 0)
										focusNewResultsFrom.current = results.hits.length
									setVisibleLimit(limit => limit + SEARCH_PAGE_SIZE)
								}
							}}
						>
							{loadingMore
								? '正在加载更多…'
								: moreError
									? '重试'
									: '加载更多结果'}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
