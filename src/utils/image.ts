import type { UiLocale } from '../types/i18n'
import { translateWithValues } from './i18n'

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

export function fallbackCoverAlt(title: string, locale: UiLocale = 'zh-CN') {
	return translateWithValues('article.coverAlt', { title }, locale)
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
