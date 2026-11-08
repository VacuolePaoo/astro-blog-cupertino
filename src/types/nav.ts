export interface NavItem {
	url: string
	text: string
	external?: boolean
}

export interface NavGroup {
	title: string
	items: NavItem[]
}

/** 顶部导航项：带 url 为普通链接，带 title + items 为折叠组 */
export type NavEntry = NavItem | NavGroup
