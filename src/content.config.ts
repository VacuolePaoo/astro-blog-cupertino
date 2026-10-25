import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'
import blogConfig from '../blog.config'
import { isAllowedImageSource } from './utils/image'

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const articleDate = z.preprocess(
	value => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
	z.string().regex(datePattern, '日期必须使用 YYYY-MM-DD'),
)

const slugPattern =
	/^[A-Za-z0-9\u4e00-\u9fff](?:[A-Za-z0-9\u4e00-\u9fff._-]*[A-Za-z0-9\u4e00-\u9fff])?(?:\/[A-Za-z0-9\u4e00-\u9fff](?:[A-Za-z0-9\u4e00-\u9fff._-]*[A-Za-z0-9\u4e00-\u9fff])?)*$/

const articles = defineCollection({
	loader: glob({ base: './content/posts', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().min(1),
				description: z.string().min(1),
				excerpt: z.string().optional(),
				pubDate: articleDate,
				collection: z.string().min(1),
				slug: z
					.string()
					.regex(
						slugPattern,
						'slug 只能包含字母、数字、汉字、连字符、下划线和点，可用 / 分隔多级路径',
					)
					.optional(),
				tags: z.array(z.string()).optional(),
				cover: z
					.union([
						image(),
						z
							.string()
							.min(1)
							.refine(
								source => isAllowedImageSource(source, blogConfig.imageDomains),
								'远程封面域名未加入 imageDomains',
							),
					])
					.optional(),
				coverAlt: z.string().optional(),
				updatedDate: articleDate.optional(),
				draft: z.boolean().default(false),
				copyright: z
					.object({ name: z.string().min(1), url: z.url().optional() })
					.optional(),
			})
			.refine(data => !data.updatedDate || data.updatedDate >= data.pubDate, {
				message: 'updatedDate 不能早于 pubDate',
				path: ['updatedDate'],
			}),
})

export const collections = { articles }
