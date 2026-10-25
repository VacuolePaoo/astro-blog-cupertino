import type { MarkdownHeading } from 'astro'
import type { ArticleEntry } from '../types/article'
import type { SearchDocument } from '../types/search'
import { toString } from 'mdast-util-to-string'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { getArticleUrl, getCoverSource } from './article'

/** Build searchable title, heading, and paragraph entries with exact rendered heading anchors. */
export function toSearchDocuments(
	article: ArticleEntry,
	headings: MarkdownHeading[],
): SearchDocument[] {
	const cover = getCoverSource(article)
	const articleUrl = getArticleUrl(article)
	const shared = {
		articleId: article.id,
		articleTitle: article.data.title,
		pubDate: article.data.pubDate,
		...(cover ? { cover } : {}),
		coverAlt: article.data.coverAlt ?? '',
	}
	const documents: SearchDocument[] = [
		{
			...shared,
			id: `${article.id}:summary`,
			heading: '',
			excerpt: article.data.description,
			url: articleUrl,
			titleSearch: article.data.title,
			headingSearch: '',
			bodySearch: article.data.description,
		},
	]
	const tree = unified().use(remarkParse).parse(article.body)
	let currentHeading: MarkdownHeading | undefined
	let headingIndex = 0
	let paragraphIndex = 0
	const addHeadingWithoutParagraph = () => {
		if (!currentHeading || paragraphIndex > 0) return
		const heading = currentHeading.text.replace(/^#/, '')
		documents.push({
			...shared,
			id: `${article.id}:${currentHeading.slug}:heading`,
			heading,
			excerpt: '',
			url: `${articleUrl}#${currentHeading.slug}`,
			titleSearch: '',
			headingSearch: heading,
			bodySearch: '',
		})
	}
	visit(tree, node => {
		if (node.type === 'heading') {
			addHeadingWithoutParagraph()
			currentHeading = headings[headingIndex]
			headingIndex += 1
			paragraphIndex = 0
			return
		}
		if (node.type !== 'paragraph') return
		const paragraph = toString(node).replace(/\s+/g, ' ').trim()
		if (!paragraph) return
		const slug = currentHeading?.slug
		const heading = currentHeading?.text.replace(/^#/, '') ?? ''
		documents.push({
			...shared,
			id: `${article.id}:${slug ?? 'intro'}:${paragraphIndex}`,
			heading,
			excerpt: paragraph,
			url: slug ? `${articleUrl}#${slug}` : articleUrl,
			titleSearch: '',
			headingSearch: paragraphIndex === 0 ? heading : '',
			bodySearch: paragraph,
		})
		paragraphIndex += 1
	})
	addHeadingWithoutParagraph()
	return documents
}
