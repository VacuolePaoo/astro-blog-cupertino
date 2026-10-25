import type { TwikooConfig } from './comments'

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

export type ColorScheme = 'light' | 'dark' | 'auto'
export type RainbowBannerDisplay = 'auto' | 'always'

export interface ThemeConfig {
	appearance: {
		colorScheme: ColorScheme
		squircle: boolean
		rainbowBanner: {
			enabled: boolean
			colors: string[]
			shown: RainbowBannerDisplay
			month: number
		}
	}
	content: {
		hero: { title: string; description: string }
		cards: { showExcerpt: boolean }
		categories: { uppercase: boolean; showPostCount: boolean }
		tags: {
			capitalize: boolean
			hashtagPrefix: boolean
			showPostCount: boolean
		}
		dates: { displayFormat: string }
		toc: { enabled: boolean; maxDepth: number }
	}
	navigation: { blurGradient: boolean }
	footer: {
		showColorSchemeToggle: boolean
		extraDescription?: string
	}
	motion: {
		viewTransition: boolean
		heroExitWhileScrolling: { enabled: boolean; blurFilter: boolean }
		smoothScroll: { enabled: boolean }
	}
	search: { enabled: boolean; trigger: 'debounce' | 'submit'; delayMs: number }
}

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
	license: { name: string; url: string }
	imageDomains: string[]
	feed: { limit: number; xslt: boolean }
	comments: TwikooConfig
	theme: ThemeConfig
	headScripts: HeadScript[]
}
