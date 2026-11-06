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
	/^[A-Z0-9\u4E00-\u9FFF](?:[\w\u4E00-\u9FFF.-]*[A-Z0-9\u4E00-\u9FFF])?(?:\/[A-Z0-9\u4E00-\u9FFF](?:[\w\u4E00-\u9FFF.-]*[A-Z0-9\u4E00-\u9FFF])?)*$/i

const articles = defineCollection({
	loader: glob({ base: './content/posts', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
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
							.refine(source => isPublicImage(source) || isRemoteImage(source)),
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
			no_comments: z.boolean().optional(),
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

const works = defineCollection({
	loader: glob({ base: './content/works', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
			title: z.string().min(1),
			description: z.string().min(1),
			category: z.string().min(1),
			repo_url: z.url(),
			preview_url: z.url().optional(),
			cover: z.preprocess(
				normalizeOptionalImageValue,
				z
					.union([
						// Public and remote URLs bypass Astro's local image importer.
						z
							.string()
							.refine(source => isPublicImage(source) || isRemoteImage(source)),
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
			badge: z.string().optional(),
			draft: z.boolean().default(false),
		}),
})

const pages = defineCollection({
	loader: glob({
		base: './content',
		pattern: ['**/*.md', '!posts/**', '!works/**'],
	}),
	schema: z.object({
		title: z.string().min(1),
		description: z.string().min(1),
		comment: z.boolean().optional(),
	}),
})

export const collections = { articles, works, pages }
