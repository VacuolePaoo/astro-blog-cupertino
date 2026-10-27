import type { BlogConfig } from './src/types/config'

export default {
	// Site metadata / 站点信息
	title: 'Dino Blog',
	subtitle: 'Dinosaur is talking here.',
	description:
		'记录软件开发、工程实践与日常思考，在持续写作中整理经验、问题与新的理解。',
	site: 'https://blog.vacu.top',
	language: 'zh-CN',
	timeZone: 'Asia/Shanghai',

	// Brand and attribution / 品牌与署名
	accentColor: '#0071E3',
	// logo: '/favicon.svg',
	favicon: '/favicon.png',
	author: { name: 'VacuolePao', avatar: '/favicon.png' },
	copyright: {
		name: 'Blog',
		url: 'https://creativecommons.org/licenses/by-nc/4.0/',
	},
	license: {
		name: 'CC BY-NC 4.0',
		url: 'https://creativecommons.org/licenses/by-nc/4.0/',
	},

	// Media and feeds / 图片与订阅
	imageDomains: ['astro.build', 'dinoimg.236668.xyz'],
	feed: { limit: 20, xslt: true },

	// Asset CDN / 资源 CDN
	// Astro-native build.assetsPrefix: generated JS/CSS and hashed _astro
	// assets are served from the CDN, which must mirror the built dist/_astro
	// directory. Public-directory files (favicon, etc.) are not prefixed.
	cdn: {
		assetsPrefix: '', // CDN origin, blank disables / CDN 源，留空关闭
	},

	// Article comments / 文章评论（Twikoo 2.0.17）
	comments: {
		enabled: true,
		envId: 'https://twikoo.vacu.top/.netlify/functions/twikoo',
		region: '', // Only for Tencent Cloud / 仅腾讯云环境需要
		lang: '', // Empty follows the visitor / 留空跟随访客语言
		scriptSrc:
			'https://registry.npmmirror.com/twikoo/2.0.17/files/dist/twikoo.nocss.js',
	},

	// Theme and interaction / 主题与交互
	theme: {
		// Appearance / 外观
		appearance: {
			colorScheme: 'auto', // Light, dark, or system / 亮色、暗色或跟随系统
			squircle: true, // Squircle corners / 方圆角
			rainbowBanner: {
				enabled: true, // Top rainbow stripe / 顶部彩条
				colors: [
					'#e50000',
					'#ff8d00',
					'#ffee00',
					'#008121',
					'#004cff',
					'#760188',
				],
				shown: 'always', // Always or selected month / 始终显示或指定月份
				month: 10, // Display month / 显示月份
			},
		},

		// Content display / 内容展示
		content: {
			hero: {
				title: 'Dino Blog', // Home hero title / 首页首屏标题
				description: 'Dinosaur is talking here.', // Home hero summary / 首页首屏副标题
			},
			cards: {
				showExcerpt: true, // Card summaries / 卡片摘要
			},
			categories: {
				uppercase: true, // Uppercase labels / 标签大写
				showPostCount: true, // Article counts / 文章数量
			},
			tags: {
				capitalize: false, // Capitalize labels / 首字母大写
				hashtagPrefix: true, // Leading hash / 前置井号
				showPostCount: true, // Article counts / 文章数量
			},
			dates: {
				displayFormat: 'MMMM D, YYYY', // Display format / 显示格式
			},
			toc: {
				enabled: true, // Article outline / 文章目录
				maxDepth: 2, // Heading depth / 标题层级
			},
		},

		// Navigation / 导航
		navigation: { blurGradient: true }, // Layered blur / 分层模糊

		// Footer / 页脚
		footer: {
			showColorSchemeToggle: true, // Theme switch / 配色切换
			extraDescription: '', // Optional note / 可选说明
		},

		// Motion / 动效
		motion: {
			viewTransition: true, // Page transitions / 页面过渡
			heroExitWhileScrolling: {
				enabled: true, // Hero scroll exit / 首屏滚动退场
				blurFilter: true, // Exit blur / 退场模糊
			},
			smoothScroll: { enabled: true }, // Smooth scrolling / 平滑滚动
		},

		// Search / 搜索
		search: {
			enabled: true, // Show search / 启用搜索
			trigger: 'debounce', // Debounce or submit / 延迟或提交搜索
			delayMs: 350, // Debounce delay (ms) / 延迟毫秒数
		},
	},

	// Extra head scripts / 额外页头脚本
	headScripts: [] as BlogConfig['headScripts'],
} satisfies BlogConfig
