import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { access, constants, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { emitKeypressEvents } from 'node:readline'
import blogConfig from '../blog.config.ts'

// 与 content.config.ts 的 slugPattern 保持一致：文件名即缺省页面路径。
const fileNameAllowed = /^[\w\u4E00-\u9FFF.-]+$/
const plainScalarAllowed = /^[\w\u4E00-\u9FFF][\w\u4E00-\u9FFF\s.-]*$/

const postsDir = join(process.cwd(), 'content', 'posts')

// Git Bash/mintty 会话里 node 的 stdin 是管道（isTTY 为 false），既开不了
// raw 键盘模式、方向键还会触发终端的历史召回。此时先经 winpty 把自身
// 拉起到真实控制台再运行；winpty 不可用或失败时按键入式回退继续。
const needsWinpty =
	process.platform === 'win32' &&
	!process.stdin.isTTY &&
	!process.stdout.isTTY &&
	process.env.MSYSTEM &&
	process.env.TERM &&
	process.env.TERM !== 'dumb' &&
	!process.env.NEW_POST_NO_WINPTY

if (needsWinpty) {
	const result = spawnSync('winpty', [process.execPath, process.argv[1]], {
		stdio: ['inherit', 'inherit', 'pipe'],
	})
	if (!result.error) {
		if (result.status === 0) process.exit(0)
		if (result.status !== 1) {
			// 非 0/1 的退出码视为用户中断等真实结果，原样透传。
			const stderr = result.stderr?.toString()
			if (stderr) process.stderr.write(stderr)
			process.exit(result.status ?? 1)
		}
		// status 1：winpty 无法提供控制台（例如 stdin 只是普通管道），
		// 继续本进程的键入式流程。
	}
}

const interactive =
	Boolean(process.stdin.isTTY) &&
	Boolean(process.stdout.isTTY) &&
	!process.env.NO_COLOR

const paint = (text, code) =>
	interactive ? `\x1B[${code}m${text}\x1B[0m` : text
const dim = text => paint(text, '90')
const accent = text => paint(text, '36')
const success = text => paint(text, '32')

const ICON_ASK = accent('◆')
const ICON_DONE = dim('◇')
const ICON_LINE = dim('│')

// 输入管线：文本问题按行缓冲读取（管道输入、手速快都适用）；选择题
// 只监听提问之后到达的按键——输入法确认候选词的回车等更早的按键
// 事件会被自然丢弃，不会误触确认。
const pendingLines = []
let lineWaiter
let lineBuffer = ''
let selecting = false

function dispatchLine(line) {
	if (lineWaiter) {
		const waiter = lineWaiter
		lineWaiter = undefined
		waiter(line)
	} else {
		pendingLines.push(line)
	}
}

process.stdin.on('data', chunk => {
	if (selecting) return
	lineBuffer += String(chunk)
	for (;;) {
		const match = lineBuffer.match(/\r\n|\r|\n/)
		if (!match) break
		const line = lineBuffer.slice(0, match.index)
		lineBuffer = lineBuffer.slice(match.index + match[0].length)
		dispatchLine(line)
	}
})

process.stdin.on('end', () => {
	if (lineWaiter) dispatchLine(null)
})

emitKeypressEvents(process.stdin)

async function readLine() {
	if (pendingLines.length > 0) return pendingLines.shift()
	return new Promise(resolve => {
		lineWaiter = resolve
	})
}

async function askText(prompt, { required = false, retryMessage } = {}) {
	process.stdout.write(`${ICON_ASK}  ${prompt}`)
	for (;;) {
		const line = await readLine()
		if (line === null) return null
		const answer = line.trim()
		// 管道输入没有终端回显，主动补印回答保持排版完整。
		if (!interactive && answer) process.stdout.write(`${answer}\n`)
		if (!required || answer) return answer
		if (interactive) process.stdout.write('\n')
		process.stdout.write(`${ICON_LINE}  ${dim(retryMessage)}\n`)
		process.stdout.write(`${ICON_ASK}  ${prompt}`)
	}
}

function choiceValueLine(option) {
	return `${option.label}${option.desc ? dim(` · ${option.desc}`) : ''}`
}

/**
 * 二元（或多元）选择：交互终端使用方向键 + 回车选择；管道输入回退为
 * 「序号 / 名称」键入，保证脚本化调用依旧可用。
 */
async function askChoice(prompt, options, fallbackAnswer) {
	if (!interactive) {
		const numbered = options
			.map((option, index) => `${index + 1}) ${option.label}`)
			.join('  ')
		process.stdout.write(`${ICON_ASK}  ${prompt}  ${dim(numbered)}：`)
		for (;;) {
			const raw = await readLine()
			if (raw === null) return null
			const answer = raw.trim().toLowerCase()
			const hit = answer
				? options.find(
						option =>
							option.value.toLowerCase() === answer ||
							String(options.indexOf(option) + 1) === answer ||
							option.aliases?.includes(answer),
					)
				: options.find(option => option.value === fallbackAnswer)
			if (hit) {
				process.stdout.write(`${dim(hit.value)}\n`)
				return hit
			}
			process.stdout.write(
				`\n${ICON_LINE}  ${dim(`请输入 1 / ${options.length} 或选项名称`)}\n`,
			)
			process.stdout.write(`${ICON_ASK}  ${prompt}  ${dim(numbered)}：`)
		}
	}
	return keyboardChoice(prompt, options)
}

function renderChoiceBlock(prompt, options, cursor) {
	const rows = options.map((option, index) => {
		const marker = index === cursor ? `${accent('❯')} ` : '  '
		const label = index === cursor ? accent(option.label) : dim(option.label)
		return `${ICON_LINE}  ${marker}${label}${
			option.desc ? dim(` · ${option.desc}`) : ''
		}`
	})
	return [`${ICON_ASK}  ${prompt}`, ...rows]
}

async function keyboardChoice(prompt, options) {
	selecting = true
	// raw 模式接管方向键与回车，否则终端会走行编辑/历史召回。
	process.stdin.setRawMode(true)
	let cursor = 0
	let confirmed = false
	const height = options.length + 1
	// 本题专属的按键队列：提问之前到达的按键（输入法确认回车、误按等）
	// 不会触发监听器，因此绝不会误触确认。
	const queuedKeys = []
	let keyWaiter
	const onKeypress = (char, key) => {
		if (keyWaiter) {
			const waiter = keyWaiter
			keyWaiter = undefined
			waiter({ char, key })
		} else {
			queuedKeys.push({ char, key })
		}
	}
	process.stdin.on('keypress', onKeypress)
	const nextKey = () =>
		queuedKeys.length > 0
			? Promise.resolve(queuedKeys.shift())
			: new Promise(resolve => {
					keyWaiter = resolve
				})

	process.stdout.write(
		`\x1B[?25l${renderChoiceBlock(prompt, options, cursor).join('\n')}`,
	)

	for (;;) {
		const event = await nextKey()
		if (!event) break
		const { key } = event
		if (key?.ctrl && key?.name === 'c') break
		switch (key?.name) {
			case 'up':
			case 'k':
			case 'left':
				cursor = (cursor - 1 + options.length) % options.length
				break
			case 'down':
			case 'j':
			case 'right':
			case 'tab':
				cursor = (cursor + 1) % options.length
				break
			case 'return':
			case 'enter':
			case 'space':
				confirmed = true
				break
			case 'escape':
				break
			default:
				continue
		}
		if (confirmed) break
		if (key?.name === 'escape') break
		// 光标回到选项块首行行首（上移不重置列，须显式回到第 1 列）后整块重绘。
		process.stdout.write(`\x1B[${height - 1}A`)
		process.stdout.write(
			renderChoiceBlock(prompt, options, cursor)
				.map(row => `\x1B[1G\x1B[2K${row}`)
				.join('\n'),
		)
	}

	process.stdin.removeListener('keypress', onKeypress)
	process.stdin.setRawMode(false)
	selecting = false
	process.stdout.write('\x1B[?25h')
	if (!confirmed) {
		process.stdout.write('\n')
		return null
	}
	// 收起选项块，仅保留问题与所选值两行。
	const chosen = options[cursor]
	process.stdout.write(`\x1B[${height - 1}A`)
	process.stdout.write(
		`\x1B[1G\x1B[2K${ICON_DONE}  ${prompt}\n\x1B[1G\x1B[2K${ICON_LINE}  ${choiceValueLine(chosen)}\n\x1B[0J`,
	)
	return chosen
}

function formatDate(timeZone) {
	return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date())
}

function toFileName(title, date) {
	const cleaned = title
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w\u4E00-\u9FFF.-]+/gu, '')
		.replace(/-{2,}/g, '-')
		.replace(/^[-.]+|[-.]+$/g, '')
	return fileNameAllowed.test(cleaned)
		? cleaned
		: `post-${date.replaceAll('-', '')}`
}

async function resolveFilePath(baseName) {
	for (let index = 0; ; index += 1) {
		const name = index === 0 ? baseName : `${baseName}-${index + 1}`
		const path = join(postsDir, `${name}.md`)
		try {
			await access(path, constants.F_OK)
		} catch {
			return path
		}
	}
}

function randomSlug(length = 10) {
	// 去掉易混淆字符（0/o、1/l）的小写字母与数字。
	const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'
	const bytes = randomBytes(length)
	let slug = ''
	for (const byte of bytes) slug += alphabet[byte % alphabet.length]
	return slug
}

function yamlScalar(value) {
	return plainScalarAllowed.test(value) ? value : JSON.stringify(value)
}

function buildFrontmatter({ title, collection, type, slug, date }) {
	const lines = ['---', `title: ${yamlScalar(title)}`, `date: ${date}`]
	if (collection) lines.push(`collection: ${yamlScalar(collection)}`)
	if (type === 'story') lines.push('type: story')
	if (slug) lines.push(`slug: ${slug}`)
	lines.push(
		'',
		'# 常用可选字段，按需取消注释并填写：',
		'# description: 摘要（缺省自动取正文前 100 字）',
		'# excerpt: 卡片与订阅源摘要（缺省取 <!-- more --> 之前的正文）',
		'# tags: [标签]',
		'# cover: ../assets/cover.jpg（本地图片放 content/assets/，或使用白名单域名的远程图片）',
		'# coverAlt: 封面图片描述',
		'# draft: true（草稿仅在 /previews/ 路径下预览）',
		'# no_comments: true',
		'---',
	)
	return lines.join('\n')
}

async function main() {
	console.log(
		`\n${ICON_ASK}  ${accent('新建文章')}  ${dim('Astro Blog Cupertino')}\n${ICON_LINE}`,
	)

	const title = await askText('标题（必填）：', {
		required: true,
		retryMessage: '标题不能为空，请重新输入',
	})
	if (title === null) return null
	const collection = await askText('分类（可留空）：')
	if (collection === null) return null

	// 版式与永久链接均为二元选择，交互终端下用方向键选择、回车确认。
	const type = await askChoice(
		'文章版式',
		[
			{ value: 'default', label: 'default', desc: '默认版式' },
			{ value: 'story', label: 'story', desc: '故事版式 · 衬线排版' },
		],
		'default',
	)
	if (type === null) return null

	const useRandomSlug = await askChoice(
		'随机永久链接',
		[
			{
				value: 'no',
				label: '否',
				desc: '页面路径使用文件名',
				aliases: ['n', 'no'],
			},
			{
				value: 'yes',
				label: '是',
				desc: '生成随机 slug',
				aliases: ['y', 'yes'],
			},
		],
		'no',
	)
	if (useRandomSlug === null) return null

	const date = formatDate(blogConfig.timeZone)
	const slug = useRandomSlug.value === 'yes' ? randomSlug() : ''
	const path = await resolveFilePath(toFileName(title, date))
	await writeFile(
		path,
		`${buildFrontmatter({ title, collection, type: type.value, slug, date })}\n`,
	)

	const urlSegment = slug || path.slice(postsDir.length + 1, -3)
	console.log(`${ICON_LINE}`)
	console.log(
		`└─ ${success('✔')}  ${accent('已创建文章')}  ${path.slice(process.cwd().length + 1)}`,
	)
	console.log(`      ${dim('页面路径')}  /posts/${urlSegment}/\n`)
	return true
}

let created = false
try {
	created = await main()
} catch (error) {
	if (error?.name === 'AbortError') {
		created = false
	} else {
		throw error
	}
}
if (!created) {
	console.log(`${dim('已取消。')}`)
	process.exitCode = 1
}
