import { access, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import sharp from 'sharp'
import blogConfig from '../blog.config.ts'

if (!blogConfig.favicon.startsWith('/'))
	throw new Error(
		'自动生成站点图标要求 blog.config.ts favicon 使用 public/ 下的绝对路径',
	)

const source = join(process.cwd(), 'public', blogConfig.favicon.slice(1))
await access(source)
await mkdir(dirname(source), { recursive: true })
await Promise.all([
	sharp(source)
		.resize(32, 32)
		.png()
		.toFile(join(process.cwd(), 'public', 'favicon-32.png')),
	sharp(source)
		.resize(180, 180)
		.png()
		.toFile(join(process.cwd(), 'public', 'apple-touch-icon.png')),
	sharp(source)
		.resize(192, 192)
		.png()
		.toFile(join(process.cwd(), 'public', 'icon-192.png')),
	sharp(source)
		.resize(512, 512)
		.png()
		.toFile(join(process.cwd(), 'public', 'icon-512.png')),
])
console.log('Generated favicon, touch, and manifest icons')
