import type { UiLocale } from '../types/i18n'
import {
	isUiMessageKey,
	resolveUiLocale,
	translate,
	translateWithValues,
} from './i18n'

function getTemplateValues(element: Element) {
	const values: Record<string, string> = {}
	for (const attribute of element.attributes) {
		if (attribute.name.startsWith('data-i18n-value-'))
			values[attribute.name.slice(16)] = attribute.value
	}
	return values
}

function parseTemplateValues(value: string | undefined) {
	if (!value) return {}
	try {
		const parsed: unknown = JSON.parse(value)
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
			return {}
		return Object.fromEntries(
			Object.entries(parsed).filter(
				(entry): entry is [string, string | number] =>
					typeof entry[1] === 'string' || typeof entry[1] === 'number',
			),
		)
	} catch {
		return {}
	}
}

export function getClientLocale(): UiLocale {
	if (typeof navigator === 'undefined') return 'zh-CN'
	return resolveUiLocale(navigator.languages?.[0] ?? navigator.language)
}

/** Translate fixed UI copy after a static page loads or a client navigation completes. */
export function initializeI18n() {
	if (typeof document === 'undefined' || typeof navigator === 'undefined')
		return
	const locale = resolveUiLocale(navigator.languages?.[0] ?? navigator.language)
	document.documentElement.lang = locale
	for (const element of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
		const key = element.dataset.i18n
		if (key && isUiMessageKey(key)) element.textContent = translate(key, locale)
	}
	for (const element of document.querySelectorAll<HTMLElement>(
		'[data-i18n-template]',
	)) {
		const key = element.dataset.i18nTemplate
		if (key && isUiMessageKey(key))
			element.textContent = translateWithValues(
				key,
				getTemplateValues(element),
				locale,
			)
	}
	for (const element of document.querySelectorAll<HTMLElement>(
		'[data-i18n-aria-label]',
	)) {
		const key = element.dataset.i18nAriaLabel
		if (key && isUiMessageKey(key))
			element.setAttribute('aria-label', translate(key, locale))
	}
	for (const element of document.querySelectorAll<HTMLElement>(
		'[data-i18n-aria-template]',
	)) {
		const key = element.dataset.i18nAriaTemplate
		if (key && isUiMessageKey(key))
			element.setAttribute(
				'aria-label',
				translateWithValues(key, getTemplateValues(element), locale),
			)
	}
	for (const element of document.querySelectorAll<HTMLElement>(
		'[data-i18n-alt-template]',
	)) {
		const key = element.dataset.i18nAltTemplate
		const image =
			element instanceof HTMLImageElement
				? element
				: element.querySelector('img')
		if (key && image && isUiMessageKey(key))
			image.alt = translateWithValues(key, getTemplateValues(element), locale)
	}
	for (const element of document.querySelectorAll<HTMLInputElement>(
		'[data-i18n-placeholder]',
	)) {
		const key = element.dataset.i18nPlaceholder
		if (key && isUiMessageKey(key)) element.placeholder = translate(key, locale)
	}
	const pageTitleKey = document.body.dataset.i18nTitle
	if (pageTitleKey && isUiMessageKey(pageTitleKey)) {
		const suffix = document.documentElement.dataset.siteTitle ?? ''
		const title = `${translateWithValues(pageTitleKey, parseTemplateValues(document.body.dataset.i18nTitleValues), locale)} - ${suffix}`
		document.title = title
		for (const selector of [
			'meta[property="og:title"]',
			'meta[name="twitter:title"]',
		]) {
			document
				.querySelector<HTMLMetaElement>(selector)
				?.setAttribute('content', title)
		}
	}
	const descriptionKey = document.body.dataset.i18nDescription
	if (descriptionKey && isUiMessageKey(descriptionKey)) {
		for (const selector of [
			'meta[name="description"]',
			'meta[property="og:description"]',
			'meta[name="twitter:description"]',
		])
			document
				.querySelector<HTMLMetaElement>(selector)
				?.setAttribute(
					'content',
					translateWithValues(
						descriptionKey,
						parseTemplateValues(document.body.dataset.i18nDescriptionValues),
						locale,
					),
				)
	}
}
