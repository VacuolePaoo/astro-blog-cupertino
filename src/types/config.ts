export interface ExternalHeadScript {
	src: string
	async?: boolean
	defer?: boolean
	type?: string
	integrity?: string
	crossorigin?: 'anonymous' | 'use-credentials'
}

export interface InlineHeadScript {
	content: string
	type?: string
}

export type HeadScript = ExternalHeadScript | InlineHeadScript

export interface BlogConfig {
	title: string
	subtitle: string
	description: string
	site: string
	language: string
	timeZone: string
	accentColor: `#${string}`
	logo?: string
	favicon: string
	author: { name: string; avatar: string }
	copyright: { name: string; url?: string }
	imageDomains: string[]
	collections: { defaultIcon: string; icons: Record<string, string> }
	feed: { limit: number; xslt: boolean }
	headScripts: HeadScript[]
}
