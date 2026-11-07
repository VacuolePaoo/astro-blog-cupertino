export function isExternalUrl(url: string) {
	return /^https?:\/\//.test(url)
}

export function getExternalLinkProps(url: string) {
	return isExternalUrl(url)
		? { target: '_blank', rel: 'noopener noreferrer' }
		: {}
}

/** Same attrs for typed nav entries that carry an explicit external flag. */
export function getFlaggedExternalLinkProps(external: boolean | undefined) {
	return external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
}

export function absoluteUrl(path: string, site: string) {
	return new URL(path, site).href
}
