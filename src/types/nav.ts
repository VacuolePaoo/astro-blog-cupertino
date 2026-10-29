export interface NavItem {
	url: string
	text: string
	external?: boolean
}

export interface NavGroup {
	title: string
	items: NavItem[]
}
