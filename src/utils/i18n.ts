import type { UiLocale, UiMessageKey } from '../types/i18n'
import { messages } from '../i18n/messages'

export function resolveUiLocale(language: string): UiLocale {
	return language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}

export function isUiMessageKey(value: string): value is UiMessageKey {
	return Object.hasOwn(messages['zh-CN'], value)
}

export function translate(key: UiMessageKey, locale: UiLocale = 'zh-CN') {
	return messages[locale][key]
}

export function translateWithValues(
	key: UiMessageKey,
	values: Record<string, string | number>,
	locale: UiLocale = 'zh-CN',
) {
	return translate(key, locale).replace(/\{(\w+)\}/g, (match, name: string) =>
		name in values ? String(values[name]) : match,
	)
}
