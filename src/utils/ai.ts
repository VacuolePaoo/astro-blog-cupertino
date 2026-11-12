import blogConfig from '../../blog.config'

/**
 * AI/智能体功能的生效配置：`blogConfig.ai` 的缺省项回退值。
 * 全部为构建期常量，端点与组件直接读取，无需在每个调用点重复回退逻辑。
 */
export const aiConfig = {
	/** /llms.txt 与 /llms-full.txt（llmstxt.org 约定），默认开启 */
	llmsTxt: blogConfig.ai?.llmsTxt ?? true,
	/** /posts/<slug>.md 原始 Markdown 端点，默认开启 */
	markdownEndpoints: blogConfig.ai?.markdownEndpoints ?? true,
	/** robots.txt 对 AI 爬虫的策略，默认 'allow'（不设专门分组） */
	crawlerPolicy: blogConfig.ai?.crawlerPolicy ?? 'allow',
}

/**
 * 训练/数据收集类 AI 爬虫：抓取站点内容用于训练或构建数据集。
 * `no-training` 与 `block` 策略都会屏蔽这一组。
 */
export const AI_TRAINING_CRAWLERS = [
	'GPTBot', // OpenAI 模型训练
	'CCBot', // Common Crawl 开放语料库
	'ClaudeBot', // Anthropic 模型训练
	'anthropic-ai', // Anthropic（历史 UA）
	'Google-Extended', // Google Gemini 训练
	'Applebot-Extended', // Apple 智能训练
	'Bytespider', // 字节跳动（今日头条/TikTok）
	'FacebookBot', // Meta 模型训练
	'Meta-ExternalAgent', // Meta 模型训练（新 UA）
	'Amazonbot', // Amazon Alexa/训练
	'Diffbot', // Diffbot 知识图谱
	'YouBot', // You.com
]

/**
 * 用户主动触发的智能体实时访问与 AI 搜索索引爬虫：抓取仅服务于
 * 当次用户请求或 AI 搜索引擎引用。仅 `block` 策略屏蔽这一组。
 */
export const AI_AGENT_CRAWLERS = [
	'ChatGPT-User', // ChatGPT 用户主动访问
	'OAI-SearchBot', // ChatGPT Search 索引
	'Claude-User', // Claude 用户主动访问
	'Claude-SearchBot', // Claude 搜索索引
	'PerplexityBot', // Perplexity 搜索索引
	'Perplexity-User', // Perplexity 用户主动访问
]
