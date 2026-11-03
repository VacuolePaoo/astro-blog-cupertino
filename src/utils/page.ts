import type { PageEntry } from '../types/page'
import { getCollection } from 'astro:content'

/** All standalone content pages written outside `content/posts`. */
export function getPages() {
	return getCollection('pages')
}

/** Site URL for a content page: the file-derived id maps 1:1 to the route path. */
export function getPageUrl(page: PageEntry) {
	return `/${page.id}/`
}
