import type { FriendGroup } from './types/friend'

export const friendGroups = [
	{
		title: '创作与技术',
		items: [
			{
				title: 'Astro',
				url: 'https://astro.build/',
				avatar: 'https://astro.build/favicon.svg',
				author: 'Astro Team',
				feed: 'https://astro.build/rss.xml',
				description: 'The web framework for content-driven websites.',
			},
		],
	},
] satisfies FriendGroup[]
