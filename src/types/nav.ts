export interface NavItem {
	text: string
	url: string
	external?: boolean
}

export interface NavGroup {
	title: string
	items: NavItem[]
}
