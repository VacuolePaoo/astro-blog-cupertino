import type { FooterNav } from './types/footer'
import type { NavItem } from './types/nav'

export const HOME_PAGE_SIZE = 8

export const primaryNav = [
	{ text: '文章', url: '/posts/' },
	{ text: '动态', url: '/moments/' },
	{ text: '友链', url: '/friends/' },
	{ text: '关于', url: '/about/' },
] satisfies NavItem[]

export const moreNav = [
	{ text: '主页', url: 'https://example.com', external: true },
	{ text: 'Moments', url: 'https://example.com/moments/', external: true },
	{ text: '作品', url: '/works/' },
	{ text: '订阅', url: '/subscribe/' },
] satisfies NavItem[]

export const footerNav = [
	{
		title: '探索',
		items: [
			{ text: 'Atom 订阅', url: '/atom.xml' },
			{ text: 'RSS 订阅', url: '/rss.xml' },
			{
				text: '开往',
				url: 'https://www.travellings.cn/go.html',
				external: true,
			},
			{ text: 'BlogFinder', url: 'https://bf.zzxworld.com/', external: true },
		],
	},
	{
		title: '站点',
		items: [
			{ text: '文章', url: '/posts/' },
			{ text: '友链', url: '/friends/' },
			{ text: '关于', url: '/about/' },
		],
	},
	{
		title: '更多',
		items: [
			{ text: '动态', url: '/moments/' },
			{ text: '作品', url: '/works/' },
			{ text: '订阅', url: '/subscribe/' },
		],
	},
] satisfies FooterNav
