import type { BlogConfig } from './src/types/config'

const copyrightName = 'Blog'

export default {
	title: 'Dino Blog',
	subtitle: 'Dinosaur is talking here.',
	description:
		'记录软件开发、工程实践与日常思考，在持续写作中整理经验、问题与新的理解。',
	site: 'https://blog.vacu.top',
	language: 'zh-CN',
	timeZone: 'Asia/Shanghai',
	accentColor: '#0071E3',
	// logo: '/favicon.svg',
	favicon: '/favicon.png',
	author: { name: 'VacuolePao', avatar: '/favicon.png' },
	copyright: {
		name: copyrightName,
		url: 'https://creativecommons.org/licenses/by-nc/4.0/',
	},
	imageDomains: ['astro.build'],
	collections: {
		defaultIcon: 'Folder',
		icons: { 前端: 'Code2', 工程: 'Blocks', 随笔: 'NotebookPen' },
	},
	feed: { limit: 20, xslt: true },
	headScripts: [] as BlogConfig['headScripts'],
} satisfies BlogConfig
