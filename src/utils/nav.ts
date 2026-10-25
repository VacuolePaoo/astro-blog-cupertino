import type { FooterNav } from '../types/footer'
import type { UiLocale } from '../types/i18n'
import type { NavGroup, NavItem } from '../types/nav'
import { translate } from './i18n'

export function getNavItemLabel(item: NavItem, locale: UiLocale = 'zh-CN') {
	return item.textKey ? translate(item.textKey, locale) : item.text
}

export function getNavGroupTitle(group: NavGroup, locale: UiLocale = 'zh-CN') {
	return group.titleKey ? translate(group.titleKey, locale) : group.title
}

export function getVisibleFooterNav(
	groups: FooterNav,
	searchEnabled: boolean,
): FooterNav {
	return groups.map(group => ({
		...group,
		items: group.items.filter(item => searchEnabled || item.url !== '/search/'),
	}))
}
