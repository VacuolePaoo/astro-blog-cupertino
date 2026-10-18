import type { ShikiTransformer } from 'shiki'

function parseLineRange(meta: string, key: string) {
	const match = meta.match(new RegExp(`${key}=\\{([\\d,-]+)\\}`))
	if (!match) return []
	return match[1]!.split(',').flatMap(part => {
		const [start = 0, end] = part.split('-').map(Number)
		return end
			? Array.from({ length: end - start + 1 }, (_, index) => start + index)
			: [start]
	})
}

export function transformerCodeMeta(): ShikiTransformer {
	return {
		name: 'blog:code-meta',
		pre(node) {
			const raw = this.options.meta?.__raw ?? ''
			const title = raw
				.match(/title=(?:"([^"]+)"|'([^']+)')/)
				?.slice(1)
				.find(Boolean)
			node.properties['data-language'] = this.options.lang
			node.properties['data-title'] = title ?? this.options.lang
		},
		line(node, lineNumber) {
			const raw = this.options.meta?.__raw ?? ''
			if (parseLineRange(raw, 'ins').includes(lineNumber))
				this.addClassToHast(node, 'diff add')
			if (parseLineRange(raw, 'del').includes(lineNumber))
				this.addClassToHast(node, 'diff remove')
		},
	}
}
