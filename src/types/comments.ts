export interface TwikooConfig {
	enabled: boolean
	envId: string
	region: string
	/** Empty follows the visitor's UI language. */
	lang: string
	scriptSrc: string
}

export interface TwikooClient {
	init: (options: {
		envId: string
		el: string
		path: string
		lang: string
		region?: string
	}) => Promise<void>
}

export interface ArticleCommentsProps {
	path: string
}

declare global {
	interface Window {
		/** Expand this article's comments; already-expanded widgets are unchanged. */
		expandTwikoo?: () => boolean
	}
}
