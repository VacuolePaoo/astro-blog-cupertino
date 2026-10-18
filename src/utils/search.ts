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

export function highlightSnippet(text: string, term: string, size = 96) {
	const normalized = text.toLocaleLowerCase()
	const target = term.trim().toLocaleLowerCase()
	const index = normalized.indexOf(target)
	const start = Math.max(0, index < 0 ? 0 : index - Math.floor(size / 3))
	const excerpt = text.slice(start, start + size)
	if (!target) return escapeHtml(excerpt)
	const pattern = new RegExp(
		`(${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
		'gi',
	)
	return escapeHtml(excerpt).replace(pattern, '<mark>$1</mark>')
}
