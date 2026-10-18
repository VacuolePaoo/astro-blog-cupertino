import type { ArticleEntry } from '../types/article'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { render } from 'takumi-js'
import { Renderer } from 'takumi-js/node'
import blogConfig from '../../blog.config'
import { escapeHtml } from './search'

const root = process.cwd()

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
	if (!article.data.cover) return undefined
	const markdownPath = join(root, 'content', 'posts', `${article.id}.md`)
	const raw = await readFile(markdownPath, 'utf8')
	const coverLine = raw.split(/\r?\n/).find(line => line.startsWith('cover:'))
	const declared = coverLine
		?.slice('cover:'.length)
		.trim()
		.replace(/^['"]|['"]$/g, '')
	if (!declared) return undefined
	if (/^https?:\/\//.test(declared)) {
		try {
			return { src: 'article-cover', data: await readConfiguredImage(declared) }
		} catch (error) {
			console.warn(
				`无法读取《${article.data.title}》的远程封面，OG 图将使用无图版式：${String(error)}`,
			)
			return undefined
		}
	}
	const filePath = declared.startsWith('/')
		? join(root, 'public', declared.slice(1))
		: resolve(dirname(markdownPath), declared)
	return { src: 'article-cover', data: await readFile(filePath) }
}

function abstractDecoration(accent: string) {
	return `<div style="position:absolute;left:70px;bottom:54px;width:360px;height:24px;border-radius:999px;background:${accent};opacity:.92"></div>
<div style="position:absolute;left:70px;bottom:92px;width:220px;height:24px;border-radius:999px;background:${accent};opacity:.38"></div>
<div style="position:absolute;right:72px;top:64px;width:110px;height:110px;border:18px solid ${accent};border-radius:999px;opacity:.55"></div>`
}

export async function renderArticleOg(article: ArticleEntry, preview = false) {
	const renderer = await rendererPromise
	const cover = await getArticleCover(article)
	const coverMarkup = cover
		? `<img src="${escapeHtml(cover.src)}" style="width:520px;height:630px;object-fit:cover" />`
		: `<div style="position:relative;width:460px;height:630px;background:#071b33">${abstractDecoration(blogConfig.accentColor)}</div>`
	const html = `<div lang="${blogConfig.language}" style="width:1200px;height:630px;display:flex;background:#ffffff;color:#111111;font-family:Inter,Noto Sans SC,sans-serif">
${coverMarkup}
<div style="position:relative;display:flex;flex:1;flex-direction:column;justify-content:space-between;padding:64px 70px 58px">
<div style="display:flex;align-items:center;gap:14px;color:#6e6e73;font-size:24px">
<span>${escapeHtml(article.data.collection)}</span><span>/</span><span>${escapeHtml(article.data.pubDate)}</span>
${preview ? '<span style="border:2px solid #ff9f0a;border-radius:999px;padding:5px 12px;color:#b86400;font-size:18px">非正式版</span>' : ''}
</div>
<h1 style="margin:0;font-family:Inter,Noto Sans SC,sans-serif;font-size:58px;line-height:1.18;font-weight:700;letter-spacing:-2px">${escapeHtml(article.data.title)}</h1>
<div style="display:flex;align-items:center;gap:14px;font-size:23px;font-weight:700"><img src="site-avatar" style="width:34px;height:34px;border-radius:8px" /><span>${escapeHtml(blogConfig.title)}</span></div>
</div></div>`
	const sources = [{ src: 'site-avatar', data: await getSiteAvatar() }]
	if (cover?.data) sources.push({ src: cover.src, data: cover.data })
	return render(html, {
		renderer,
		width: 1200,
		height: 630,
		format: 'png',
		fontFamilies: ['Inter', 'Noto Sans SC'],
		lang: blogConfig.language,
		images: { sources },
	})
}

export async function renderSiteOg() {
	const renderer = await rendererPromise
	const html = `<div lang="${blogConfig.language}" style="position:relative;width:1200px;height:630px;display:flex;flex-direction:column;justify-content:space-between;background:#ffffff;color:#111111;padding:74px;font-family:Inter,Noto Sans SC,sans-serif">
${abstractDecoration(blogConfig.accentColor)}
<img src="site-avatar" style="width:72px;height:72px;border-radius:16px" />
<div style="position:relative;max-width:900px"><h1 style="margin:0;font-size:78px;line-height:1.05;font-weight:700;letter-spacing:-3px">${escapeHtml(blogConfig.title)}</h1><p style="margin:22px 0 0;color:#6e6e73;font-size:32px">${escapeHtml(blogConfig.subtitle)}</p></div>
</div>`
	return render(html, {
		renderer,
		width: 1200,
		height: 630,
		format: 'png',
		fontFamilies: ['Inter', 'Noto Sans SC'],
		lang: blogConfig.language,
		images: { sources: [{ src: 'site-avatar', data: await getSiteAvatar() }] },
	})
}
