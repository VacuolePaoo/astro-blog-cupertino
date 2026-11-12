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

/**
 * robots.txt 中对 AI 爬虫的策略：
 * - `allow`：不设专门分组，由 `User-agent: *` 全部放行（默认）
 * - `no-training`：屏蔽训练/数据收集类爬虫，保留用户主动触发的智能体
 *   实时访问（ChatGPT-User、Claude-User 等）与 AI 搜索索引爬虫
 * - `block`：屏蔽下方两份清单中的全部 AI 爬虫
 */
export type AiCrawlerPolicy = 'allow' | 'no-training' | 'block'

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
		/** 首页文章列表（含分页）排除的分类；被排除的文章仍出现在归档、分类与标签页 */
		home: { excludedCategories: string[] }
		cards: { showExcerpt: boolean }
		categories: { uppercase: boolean; showPostCount: boolean }
		tags: {
			capitalize: boolean
			hashtagPrefix: boolean
			showPostCount: boolean
		}
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

/**
 * Astro `build.assetsPrefix` value: a single CDN origin covering all
 * generated assets, or per-extension origins that require a `fallback`
 * origin for every other file type.
 * @see https://docs.astro.build/en/reference/configuration-reference/#build-assetsprefix
 */
export type CdnAssetsPrefix =
	string | ({ fallback: string } & Record<string, string>)

export interface BlogConfig {
	/** 完整站点名，用于 <title>、OG、feed、manifest 等站点级标识 */
	title: string
	/** 导航栏品牌短名，展示用；默认回退为站点名 */
	brand?: string
	subtitle: string
	description: string
	site: string
	language: string
	timeZone: string
	accentColor: `#${string}`
	logo?: string
	favicon: string
	author: { name: string; avatar: string; website?: string }
	copyright: { license: string; url: string }
	imageDomains: string[]
	cdn?: { assetsPrefix: CdnAssetsPrefix }
	feed: { limit: number; xslt: boolean }
	comments: TwikooConfig
	theme: ThemeConfig
	headScripts: HeadScript[]
	/** 访问统计；缺省不注入任何统计脚本 */
	analytics?: {
		/** Vercel Analytics：需部署于 Vercel 才生效 */
		vercel?: { enabled?: boolean }
		/** Umami：自托管统计脚本 */
		umami?: {
			enabled?: boolean
			/** 统计脚本地址，如 https://umami.example.com/script.js */
			src?: string
			/** Umami 后台分配的网站 ID */
			websiteId?: string
		}
	}
	/** 对 AI/智能体友好的机器可读输出；缺省全部开启、AI 爬虫全放行 */
	ai?: {
		/** /llms.txt 站点索引与 /llms-full.txt 全文 Markdown 合集（llmstxt.org 约定） */
		llmsTxt?: boolean
		/** 每篇文章的原始 Markdown 端点 /posts/<slug>.md，并在文章页 <head> 声明 */
		markdownEndpoints?: boolean
		/** robots.txt 对 AI 爬虫的策略，见 {@link AiCrawlerPolicy} */
		crawlerPolicy?: AiCrawlerPolicy
	}
}
