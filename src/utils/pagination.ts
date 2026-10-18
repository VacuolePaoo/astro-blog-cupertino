import type { PaginationItem } from '../types/article'

export function paginate<T>(items: T[], page: number, pageSize: number) {
	const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
	const currentPage = Math.min(Math.max(page, 1), totalPages)
	const start = (currentPage - 1) * pageSize
	return {
		items: items.slice(start, start + pageSize),
		currentPage,
		totalPages,
	}
}

export function getPaginationItems(
	current: number,
	total: number,
	radius = 1,
): PaginationItem[] {
	const pages = new Set([1, total])
	for (
		let page = Math.max(1, current - radius);
		page <= Math.min(total, current + radius);
		page++
	)
		pages.add(page)

	const sorted = [...pages].toSorted((a, b) => a - b)
	const result: PaginationItem[] = []
	for (const [index, page] of sorted.entries()) {
		const previous = sorted[index - 1]
		if (previous && page - previous > 1) {
			result.push({
				type: 'ellipsis',
				position: previous === 1 ? 'start' : 'end',
			})
		}
		result.push({ type: 'page', page })
	}
	return result
}

export function getHomePageUrl(page: number) {
	return page <= 1 ? '/' : `/page/${page}/`
}
