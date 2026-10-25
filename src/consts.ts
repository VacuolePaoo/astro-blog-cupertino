import type { FooterNav } from './types/footer'
import type { NavItem } from './types/nav'

export const HOME_PAGE_SIZE = 8
export const ARCHIVE_PAGE_SIZE = 10
export const SEARCH_PAGE_SIZE = 30

export const primaryNav = [
	{ textKey: 'nav.posts', url: '/posts/' },
	{ textKey: 'nav.moments', url: '/moments/' },
	{ textKey: 'nav.friends', url: '/friends/' },
	{ textKey: 'nav.about', url: '/about/' },
] satisfies NavItem[]

export const moreNav = [
	{ textKey: 'nav.externalHome', url: 'https://example.com', external: true },
	{ text: 'Moments', url: 'https://example.com/moments/', external: true },
	{ textKey: 'nav.works', url: '/works/' },
	{ textKey: 'nav.subscribe', url: '/subscribe/' },
] satisfies NavItem[]

export const footerNav = [
	{
		titleKey: 'footer.explore',
		items: [
			{ textKey: 'footer.atom', url: '/atom.xml' },
			{ textKey: 'footer.rss', url: '/rss.xml' },
			{
				textKey: 'footer.traveling',
				url: 'https://www.travellings.cn/go.html',
				external: true,
			},
			{ text: 'BlogFinder', url: 'https://bf.zzxworld.com/', external: true },
		],
	},
	{
		titleKey: 'footer.site',
		items: [
			{ textKey: 'nav.posts', url: '/posts/' },
			{ textKey: 'page.archives', url: '/archives/' },
			{ textKey: 'page.categories', url: '/categories/' },
			{ textKey: 'page.tags', url: '/tags/' },
			{ textKey: 'nav.search', url: '/search/' },
			{ textKey: 'nav.friends', url: '/friends/' },
			{ textKey: 'nav.about', url: '/about/' },
		],
	},
	{
		titleKey: 'footer.more',
		items: [
			{ textKey: 'nav.moments', url: '/moments/' },
			{ textKey: 'nav.works', url: '/works/' },
			{ textKey: 'nav.subscribe', url: '/subscribe/' },
		],
	},
] satisfies FooterNav
