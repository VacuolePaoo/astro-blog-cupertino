import type { FooterNav } from '../types/footer'

export function getVisibleFooterNav(
	groups: FooterNav,
	searchEnabled: boolean,
): FooterNav {
	return groups.map(group => ({
		...group,
		items: group.items.filter(item => searchEnabled || item.url !== '/search/'),
	}))
}
