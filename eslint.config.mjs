import antfu from '@antfu/eslint-config'

export default antfu({
	astro: true,
	formatters: false,
	ignores: [
		'.agents/**',
		'.astro/**',
		'dist/**',
		'content/**/*.md',
		'public/feed.xsl',
	],
	stylistic: false,
	typescript: true,
	rules: {
		'antfu/if-newline': 'off',
	},
})
