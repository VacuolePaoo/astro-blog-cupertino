import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'
import blogConfig from '../blog.config'
import {
	isAllowedImageSource,
	isPublicImage,
	isRemoteImage,
	normalizeOptionalImageValue,
} from './utils/image'

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
				cover: z.preprocess(
					normalizeOptionalImageValue,
					z
						.union([
							// Public and remote URLs bypass Astro's local image importer.
							z
								.string()
								.refine(
									source => isPublicImage(source) || isRemoteImage(source),
								),
							image(),
						])
						.refine(
							source =>
								typeof source !== 'string' ||
								isAllowedImageSource(source, blogConfig.imageDomains),
							'远程封面域名未加入 imageDomains',
						)
						.optional(),
				),
				coverAlt: z.preprocess(
					normalizeOptionalImageValue,
					z.string().optional(),
				),
				draft: z.boolean().default(false),
				comments: z.boolean().optional(),
				about: z.boolean().optional(),
				extra_info: z.string().optional(),
				copyright: z
					.object({
						author: z.string().min(1).optional(),
						license: z.string().min(1).optional(),
						licenseUrl: z.url().optional(),
					})
					.optional(),
			}),
})

export const collections = { articles }
