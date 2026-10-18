export function isRemoteImage(source: string) {
	return /^https?:\/\//.test(source)
}

export function isPublicImage(source: string) {
	return source.startsWith('/')
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
