import type { APIRoute } from 'astro'
import { AI_AGENT_CRAWLERS, AI_TRAINING_CRAWLERS, aiConfig } from '../utils/ai'
import { siteOrigin } from '../utils/site'

export const GET: APIRoute = () => {
	const lines: string[] = []
	// 'allow' 不输出专门分组：AI 爬虫与普通爬虫一样只匹配 User-agent: *
	if (aiConfig.crawlerPolicy !== 'allow') {
		const blockedGroups =
			aiConfig.crawlerPolicy === 'block'
				? [AI_TRAINING_CRAWLERS, AI_AGENT_CRAWLERS]
				: [AI_TRAINING_CRAWLERS]
		for (const crawlers of blockedGroups) {
			for (const crawler of crawlers) lines.push(`User-agent: ${crawler}`)
			lines.push('Disallow: /', '')
		}
	}
	lines.push(
		'User-agent: *',
		'Allow: /',
		'Disallow: /previews/',
		'',
		`Sitemap: ${new URL('/sitemap-index.xml', siteOrigin).href}`,
	)
	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	})
}
