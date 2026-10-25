import type { SearchDocument, SearchIndexPayload } from '../types/search'

function isSearchDocument(value: unknown): value is SearchDocument {
	if (!value || typeof value !== 'object') return false
	const document = value as Record<string, unknown>
	const requiredFields = [
		'id',
		'articleId',
		'articleTitle',
		'heading',
		'excerpt',
		'url',
		'pubDate',
		'titleSearch',
		'headingSearch',
		'bodySearch',
	] as const
	return (
		requiredFields.every(field => typeof document[field] === 'string') &&
		(document.cover === undefined || typeof document.cover === 'string') &&
		(document.coverAlt === undefined || typeof document.coverAlt === 'string')
	)
}

/** Validate the generated search index at the fetch boundary. */
export function parseSearchIndexPayload(value: unknown): SearchIndexPayload {
	if (!value || typeof value !== 'object' || !('documents' in value))
		throw new Error('Invalid search index')
	if (
		!Array.isArray(value.documents) ||
		!value.documents.every(isSearchDocument)
	)
		throw new Error('Invalid search documents')
	return { documents: value.documents }
}

export function escapeHtml(value: string) {
	return value.replace(
		/[&<>'"]/g,
		character =>
			({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				"'": '&#39;',
				'"': '&quot;',
			})[character]!,
	)
}

export function highlightText(value: string, term: string) {
	const query = term.trim()
	if (!query) return escapeHtml(value)
	const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
	let cursor = 0
	let html = ''
	for (const match of value.matchAll(pattern)) {
		const index = match.index ?? 0
		html += escapeHtml(value.slice(cursor, index))
		html += `<mark>${escapeHtml(match[0])}</mark>`
		cursor = index + match[0].length
	}
	return html + escapeHtml(value.slice(cursor))
}

/** Keep the matching paragraph context without truncating the article title. */
export function highlightSnippet(text: string, term: string, size = 160) {
	const target = term.trim().toLocaleLowerCase()
	const index = target ? text.toLocaleLowerCase().indexOf(target) : -1
	const start = Math.max(0, index < 0 ? 0 : index - Math.floor(size / 3))
	const end = Math.min(text.length, start + size)
	const excerpt = `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
	return highlightText(excerpt, term)
}

/** Return the article route for a search hit, leaving its section URL intact. */
export function getSearchArticleUrl(url: string) {
	return url.split('#', 1)[0]
}
