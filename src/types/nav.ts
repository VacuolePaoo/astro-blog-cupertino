import type { UiMessageKey } from './i18n'

interface NavLinkBase {
	url: string
	external?: boolean
}

export type NavItem = NavLinkBase &
	({ text: string; textKey?: never } | { textKey: UiMessageKey; text?: never })

export type NavGroup = { items: NavItem[] } & (
	| { title: string; titleKey?: never }
	| { titleKey: UiMessageKey; title?: never }
)
