import { unified } from '@astrojs/markdown-remark'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { transformerMetaHighlight } from '@shikijs/transformers'
import { defineConfig } from 'astro/config'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'

import blogConfig from './blog.config'
import { remarkImageWidth } from './src/markdown/remark-image-width'
import { transformerCodeMeta } from './src/utils/code'
import { siteOrigin } from './src/utils/site'

export default defineConfig({
	site: siteOrigin,
	output: 'static',
	trailingSlash: 'always',
	build: {
		// Astro-native CDN prefix for generated JS/CSS/_astro assets; blank disables
		assetsPrefix: blogConfig.cdn?.assetsPrefix || undefined,
	},
	vite: {
		build: {
			// Pin the CSS minifier (Vite's default, kept explicit for stability).
			// Note: lightningcss collapses a prefixed/standard property pair into
			// whichever is written last — order matters in component styles.
			cssMinify: 'lightningcss',
		},
	},
	devToolbar: { enabled: false },
	prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
	integrations: [
		react(),
		sitemap({
			filter: page =>
				!['/previews/', '/moments/', '/works/'].some(path =>
					new URL(page).pathname.startsWith(path),
				),
		}),
	],
	// Hybrid image strategy: local images are optimized into dist/_astro (covers
	// via <Picture>, markdown via constrained srcset). No `domains` configured —
	// remote markdown images are never downloaded or optimized, they keep their
	// original URLs in the output HTML.
	image: { layout: 'constrained' },
	markdown: {
		processor: unified({
			gfm: true,
			remarkPlugins: [remarkImageWidth],
			rehypePlugins: [
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						behavior: 'prepend',
						properties: {
							className: ['heading-anchor'],
							ariaLabel: '链接到此章节',
						},
						content: { type: 'text', value: '#' },
					},
				],
			],
		}),
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			wrap: true,
			transformers: [transformerMetaHighlight(), transformerCodeMeta()],
		},
	},
})
