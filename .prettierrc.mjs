export default {
	plugins: ['prettier-plugin-astro'],
	semi: false,
	singleQuote: true,
	useTabs: true,
	arrowParens: 'avoid',
	overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
}
