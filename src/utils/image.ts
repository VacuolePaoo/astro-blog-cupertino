/** Treat omitted, YAML-null, and blank image fields as absent before validation. */
export function normalizeOptionalImageValue(value: unknown) {
	if (value == null) return undefined
	return typeof value === 'string' ? value.trim() || undefined : value
}

export function isRemoteImage(source: string) {
	return /^https?:\/\//.test(source)
}

export function isPublicImage(source: string) {
	return source.startsWith('/')
}

/** Return the origin of a remote image URL, or undefined for local and public paths. */
export function getRemoteImageOrigin(source: string) {
	if (!isRemoteImage(source)) return undefined
	try {
		return new URL(source).origin
	} catch {
		return undefined
	}
}

export function fallbackCoverAlt(title: string) {
	return `文章《${title}》的封面图片`
}

export function isAllowedImageSource(
	source: string,
	domains: readonly string[],
) {
	if (!isRemoteImage(source)) return true
	try {
		return domains.includes(new URL(source).hostname)
	} catch {
		return false
	}
}

export function assertAllowedImageSource(
	source: string,
	domains: readonly string[],
	label: string,
) {
	if (!isAllowedImageSource(source, domains))
		throw new Error(
			`${label} 使用了未在 blog.config.ts imageDomains 中允许的远程图片：${source}`,
		)
}
