import type { ArticleEntry } from '../types/article'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { render } from 'takumi-js'
import { Renderer } from 'takumi-js/node'
import blogConfig from '../../blog.config'
import { escapeHtml } from './search'
import { siteOrigin } from './site'

const root = process.cwd()

/** Recompress takumi's full-color PNG with libimagequant; stays PNG for social-platform compatibility. */
async function compressOgImage(
	buffer: Buffer<ArrayBuffer> | Uint8Array<ArrayBuffer>,
) {
	return sharp(buffer)
		.png({ palette: true, quality: 90, compressionLevel: 9 })
		.toBuffer()
}

async function readConfiguredImage(source: string) {
	if (/^https?:\/\//.test(source)) {
		const response = await fetch(source)
		if (!response.ok) throw new Error(`HTTP ${response.status}`)
		return Buffer.from(await response.arrayBuffer())
	}
	return readFile(join(root, 'public', source.replace(/^\//, '')))
}

async function getSiteAvatar() {
	try {
		return await readConfiguredImage(blogConfig.author.avatar)
	} catch (error) {
		console.warn(`无法读取作者头像，OG 图将回退 favicon：${String(error)}`)
		return readConfiguredImage(blogConfig.favicon)
	}
}

function parseUnicodeRange(input: string) {
	return input.split(',').map(item => {
		const [start, end] = item.trim().replace(/^U\+/i, '').split('-')
		const from = Number.parseInt(start!, 16)
		return [from, end ? Number.parseInt(end, 16) : from] as [number, number]
	})
}

async function registerFontsourceSubsets(
	renderer: Renderer,
	weight: 400 | 700,
) {
	const cssUrl = import.meta.resolve(`@fontsource/noto-sans-sc/${weight}.css`)
	const cssPath = fileURLToPath(cssUrl)
	const css = await readFile(cssPath, 'utf8')
	const blocks = [...css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)]
	for (const [, block = ''] of blocks) {
		const file = block.match(/url\(\.\/files\/([^)]*?\.woff2)\)/)?.[1]
		const range = block.split('unicode-range:')[1]?.split(';')[0]?.trim()
		if (!file || !range) continue
		await renderer.registerFont({
			name: 'Noto Sans SC',
			data: await readFile(join(dirname(cssPath), 'files', file)),
			weight,
			unicodeRange: parseUnicodeRange(range),
			generic: 'sans-serif',
		})
	}
}

const rendererPromise = (async () => {
	const renderer = new Renderer({ cacheMaxBytes: 96 * 1024 * 1024 })
	const interPath = fileURLToPath(
		import.meta
			.resolve('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),
	)
	await renderer.registerFont({
		name: 'Inter',
		data: await readFile(interPath),
		weight: 400,
		generic: 'sans-serif',
	})
	await Promise.all([
		registerFontsourceSubsets(renderer, 400),
		registerFontsourceSubsets(renderer, 700),
	])
	return renderer
})()

async function getArticleCover(article: ArticleEntry) {
	const cover = article.data.cover
	if (!cover) return undefined
	const frontmatter: unknown = article.rendered?.metadata?.frontmatter
	const declared =
		typeof cover === 'string'
			? cover
			: frontmatter && typeof frontmatter === 'object' && 'cover' in frontmatter
				? frontmatter.cover
				: undefined
	if (typeof declared !== 'string' || !declared.trim())
		throw new Error(`无法读取《${article.data.title}》已验证封面的源路径`)
	const source = declared.trim()
	if (/^https?:\/\//.test(source)) {
		try {
			return { src: 'article-cover', data: await readConfiguredImage(source) }
		} catch (error) {
			console.warn(
				`无法读取《${article.data.title}》的远程封面，OG 图将使用纯色版式：${String(error)}`,
			)
			return undefined
		}
	}
	const markdownPath = resolve(
		root,
		article.filePath ?? join('content', 'posts', `${article.id}.md`),
	)
	const filePath = source.startsWith('/')
		? join(root, 'public', source.slice(1))
		: resolve(dirname(markdownPath), source)
	return { src: 'article-cover', data: await readFile(filePath) }
}

/**
 * Port of takumi's official blog-post template
 * (https://takumi.kane.tw/docs/templates#blog-post-template) with the article
 * cover as a full-bleed background under a bottom-heavy dark overlay; falls
 * back to the plain dark gradient look when no cover is available.
 */
export async function renderArticleOg(article: ArticleEntry, preview = false) {
	const renderer = await rendererPromise
	const cover = await getArticleCover(article)
	const html = `<div lang="${blogConfig.language}" style="position:relative;width:1200px;height:630px;background-color:#111111;font-family:Inter,Noto Sans SC,sans-serif">
${cover ? '<img src="article-cover" style="position:absolute;top:0;left:0;width:1200px;height:630px;object-fit:cover" />' : ''}
<div style="position:absolute;top:0;left:0;width:1200px;height:630px;background-image:linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.6) 42%,rgba(0,0,0,0.28) 100%)"></div>
<div style="position:relative;display:flex;flex-direction:column;width:100%;height:100%;padding:60px;justify-content:space-between;color:#ffffff">
<div style="display:flex;align-items:flex-start;gap:16px">
<div style="display:flex;background-color:#3b82f6;color:#ffffff;padding:8px 24px;border-radius:9999px;font-size:24px;font-weight:600">${escapeHtml(article.data.collection)}</div>
${preview ? '<div style="display:flex;border:2px solid #ff9f0a;color:#ffb340;padding:8px 24px;border-radius:9999px;font-size:24px;font-weight:600">非正式版</div>' : ''}
</div>
<h1 style="margin:0;font-size:80px;font-weight:800;line-height:1.1;text-shadow:0 4px 12px rgba(0,0,0,0.5)">${escapeHtml(article.data.title)}</h1>
<div style="display:flex;align-items:center;gap:24px">
<img src="site-avatar" style="display:flex;width:80px;height:80px;border-radius:9999px;border:4px solid rgba(255,255,255,0.1)" />
<div style="display:flex;flex-direction:column">
<span style="font-size:32px;font-weight:600">${escapeHtml(blogConfig.author.name)}</span>
<span style="font-size:24px;color:#a1a1aa">${escapeHtml(article.data.pubDate)}</span>
</div></div></div></div>`
	const sources = [{ src: 'site-avatar', data: await getSiteAvatar() }]
	if (cover?.data) sources.push({ src: cover.src, data: cover.data })
	return compressOgImage(
		await render(html, {
			renderer,
			width: 1200,
			height: 630,
			format: 'png',
			fontFamilies: ['Inter', 'Noto Sans SC'],
			lang: blogConfig.language,
			images: { sources },
		}),
	)
}

/** Cupertino-style site card: centered avatar, oversized title, subtitle and accent hostname on the site's near-white background. */
export async function renderSiteOg() {
	const renderer = await rendererPromise
	const host = new URL(siteOrigin).host
	const html = `<div lang="${blogConfig.language}" style="width:1200px;height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:#fbfbfd;color:#333333;font-family:Inter,Noto Sans SC,sans-serif">
<img src="site-avatar" style="display:flex;width:96px;height:96px;border-radius:9999px" />
<h1 style="margin:36px 0 0;font-size:92px;line-height:1.05;font-weight:700;letter-spacing:-3px">${escapeHtml(blogConfig.title)}</h1>
<p style="margin:20px 0 0;font-size:34px;color:#666666">${escapeHtml(blogConfig.subtitle)}</p>
<p style="margin:28px 0 0;font-size:25px;color:${blogConfig.accentColor}">${escapeHtml(host)}</p>
</div>`
	return compressOgImage(
		await render(html, {
			renderer,
			width: 1200,
			height: 630,
			format: 'png',
			fontFamilies: ['Inter', 'Noto Sans SC'],
			lang: blogConfig.language,
			images: {
				sources: [{ src: 'site-avatar', data: await getSiteAvatar() }],
			},
		}),
	)
}
