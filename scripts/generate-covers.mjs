import { Buffer } from 'node:buffer'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

const output = join(process.cwd(), 'content', 'assets')
await mkdir(output, { recursive: true })

const palettes = [
	['#0A84FF', '#071B33', '#83B9FF'],
	['#FF9F0A', '#2B1800', '#FFD28A'],
	['#30D158', '#061F0D', '#9BEAAF'],
	['#BF5AF2', '#21092E', '#E5B7FA'],
	['#FF453A', '#2B0705', '#FFAAA5'],
	['#64D2FF', '#041D29', '#BCEEFF'],
	['#FFD60A', '#292100', '#FFF19A'],
	['#AC8E68', '#20160B', '#DEC7AA'],
]

function coverSvg(index, colors) {
	const [accent, background, soft] = colors
	const bars = Array.from({ length: 7 }, (_, item) => {
		const x = 90 + item * 155
		const height = 120 + ((item * 73 + index * 41) % 300)
		return `<rect x="${x}" y="${520 - height}" width="72" height="${height}" rx="36" fill="${item % 2 ? soft : accent}" opacity="${0.42 + item * 0.07}"/>`
	}).join('')
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
<rect width="1200" height="600" fill="${background}"/>
<circle cx="${180 + index * 71}" cy="${140 + index * 17}" r="96" fill="${accent}"/>
<circle cx="${980 - index * 29}" cy="${140 + index * 23}" r="54" fill="none" stroke="${soft}" stroke-width="18"/>
${bars}
<path d="M0 ${470 - index * 8} C 260 ${370 + index * 7}, 660 ${570 - index * 13}, 1200 ${390 + index * 11}" fill="none" stroke="${soft}" stroke-width="3" opacity=".7"/>
</svg>`
}

await Promise.all(
	palettes.map((palette, index) =>
		sharp(Buffer.from(coverSvg(index, palette)))
			.png()
			.toFile(join(output, `cover-${index + 1}.png`)),
	),
)

console.log(`Generated ${palettes.length} covers in ${output}`)
