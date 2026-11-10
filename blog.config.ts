import type { BlogConfig } from './src/types/config'

export default {
	// ============================================================
	// Site identity / 站点身份
	// 站点级名称与描述，被 <title>、OG 标签、JSON-LD 结构化数据、
	// Atom/RSS feeds 和 PWA manifest 共同消费。
	// ============================================================

	// 完整站点名：<title> 后缀、og:site_name、JSON-LD、feeds、manifest、
	// 站点 OG 分享图主标题（src/utils/og.ts）
	title: 'Astro Blog Cupertino',
	// 导航栏品牌短名（src/components/Header.astro）；缺省回退为 title
	brand: 'Blog',
	// 站点标语：仅用于站点 OG 分享图（/og/site.png）的副标题行（src/utils/og.ts）
	subtitle: 'A clean Cupertino-inspired blog template.',
	// 站点描述：meta description 缺省值、feeds 频道简介、WebSite JSON-LD
	description:
		'基于 Astro 的 Cupertino 风格博客模板：文章、归档、分类、标签、搜索、友链与订阅，开箱即用。',
	// 站点语言：<html lang>、og:locale（zh-CN → zh_CN）、feeds xml:lang、JSON-LD
	language: 'zh-CN',

	// ============================================================
	// Deployment and environment / 部署与运行环境
	// ============================================================

	// 生产 origin：canonical、sitemap、feeds、OG 图链接的基准；
	// 预览环境的覆盖逻辑见 src/utils/site
	site: 'https://example.com',
	// 时区：日期格式化（src/utils/date.ts）、<html data-time-zone>
	timeZone: 'Asia/Shanghai',
	// Astro 原生 build.assetsPrefix：生成的 JS/CSS 与哈希 _astro 资源走 CDN，
	// CDN 必须镜像 dist/_astro 目录；public 目录文件（favicon 等）不加前缀。
	cdn: {
		assetsPrefix: '', // CDN origin, blank disables / CDN 源，留空关闭
	},

	// ============================================================
	// Author and attribution / 作者与署名
	// 文章署名、JSON-LD 作者、页脚版权与文章页许可声明。
	// ============================================================

	// 作者名（页脚版权行、JSON-LD 作者、OG 分享图署名，可被文章 frontmatter
	// copyright.author 覆盖）、头像与主页链接；website 为页脚版权名的超链接
	// 目标，留空则版权名显示为纯文本
	author: {
		name: 'Your Name',
		avatar: '/favicon.png',
		website: '',
	},
	// 文章页许可声明（src/components/ArticleFooter.astro）
	copyright: {
		license: 'CC BY-NC 4.0',
		url: 'https://creativecommons.org/licenses/by-nc/4.0/',
	},

	// ============================================================
	// Brand and visual assets / 品牌与视觉资源
	// ============================================================

	// 导航栏 logo 图（src/components/Header.astro）；缺省只显示文字品牌
	// logo: '/favicon.svg',
	// 站点图标（页头 favicon 链接）
	favicon: '/favicon.png',
	// 站点主色：<html --site-accent>、manifest theme_color、OG 分享图
	accentColor: '#0071E3',

	// ============================================================
	// Content governance / 内容治理
	// ============================================================

	// 远程图片域名白名单（仅封面与友链头像）；远程图片不会被下载或优化，
	// 见 src/utils/image.ts 的 assertAllowedImageSource
	imageDomains: ['astro.build'],
	// feeds：limit 为 Atom/RSS 输出条数上限；xslt 为浏览器直开 feed 时的样式表
	feed: { limit: 20, xslt: true },

	// ============================================================
	// Comments / 评论（Twikoo 2.0.17）
	// ============================================================

	comments: {
		// 模板默认关闭；部署自己的 Twikoo 实例后将 envId 改为后端地址再开启
		enabled: false,
		envId: 'https://your-twikoo-instance.example.com/.netlify/functions/twikoo',
		region: '', // Only for Tencent Cloud / 仅腾讯云环境需要
		lang: 'zh-CN', // Fixed comment language / 评论固定语言
		scriptSrc: 'https://s4.zstatic.net/npm/twikoo@2.0.17/dist/twikoo.nocss.js',
	},

	// ============================================================
	// Theme / 前台展示
	// 只影响页面呈现与交互，不参与 SEO、feeds 或部署链路。
	// ============================================================
	theme: {
		// Appearance / 外观
		appearance: {
			colorScheme: 'auto', // Light, dark, or system / 亮色、暗色或跟随系统
			squircle: true, // Squircle corners / 方圆角
			rainbowBanner: {
				enabled: false, // Top rainbow stripe / 顶部彩条
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
				title: 'Astro Blog Cupertino', // Home hero title / 首页首屏标题
				description: 'A Cupertino-inspired blog template built with Astro.', // Home hero summary / 首页首屏副标题
			},
			// 首页文章卡片排除的分类：数组中的分类不出现在首页列表（含分页），
			// 但归档、分类与标签页仍正常展示这些文章
			home: {
				// Category names / 分类名，如 ['日志']；`as string[]` 防止空数组被推断为 never[]
				excludedCategories: [] as string[],
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
			toc: {
				enabled: true, // Article outline / 文章目录
				maxDepth: 2, // Heading depth / 标题层级
			},
		},

		// Navigation / 导航（src/components/Header.astro）
		navigation: { blurGradient: true }, // Layered blur / 分层模糊

		// Search / 搜索（Header/Footer 入口、search 页面与 JSON-LD SearchAction）
		search: {
			enabled: true, // Show search / 启用搜索
			trigger: 'debounce', // Debounce or submit / 延迟或提交搜索
			delayMs: 350, // Debounce delay (ms) / 延迟毫秒数
		},

		// Footer / 页脚（src/components/Footer.astro）
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
	},

	// ============================================================
	// Extra head scripts / 额外页头脚本
	// ============================================================
	headScripts: [] as BlogConfig['headScripts'],

	// ============================================================
	// Analytics / 访问统计
	// ============================================================
	analytics: {
		vercel: { enabled: true }, // Vercel Analytics / 部署于 Vercel 后开启
		umami: {
			enabled: false, // Umami statistics / Umami 统计
			src: 'https://your-umami-instance.example.com/script.js', // Script URL / 统计脚本地址
			websiteId: '', // Website ID from Umami dashboard / Umami 后台网站 ID
		},
	},
} satisfies BlogConfig
