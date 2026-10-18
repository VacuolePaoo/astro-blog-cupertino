import type { Image, Root } from 'mdast'
import { visit } from 'unist-util-visit'

const widthPattern = /#width=(wide|\d+(?:\.\d+)?%?)$/

export function remarkImageWidth() {
	return (tree: Root) => {
		visit(tree, 'image', (node: Image) => {
			const match = node.url.match(widthPattern)
			if (!match) return
			const width = match[1]!
			node.url = node.url.replace(widthPattern, '')
			node.data ??= {}
			const data = node.data as typeof node.data & {
				hProperties?: Record<string, string | undefined>
			}
			data.hProperties = {
				...data.hProperties,
				'data-image-width': width,
				style:
					width === 'wide'
						? undefined
						: `--article-image-width:${width.includes('%') ? width : `${width}%`}`,
			}
		})
	}
}
