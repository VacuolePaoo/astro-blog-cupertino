export interface FriendLink {
	title: string
	url: string
	avatar: string
	author?: string
	feed?: string
	description?: string
}

export interface FriendGroup {
	title: string
	items: FriendLink[]
}
