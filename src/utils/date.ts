import { Temporal } from 'temporal-polyfill'
import blogConfig from '../../blog.config'

export function toPlainDate(value: string) {
	return Temporal.PlainDate.from(value)
}

export function formatFullDate(value: string) {
	return toPlainDate(value).toLocaleString(blogConfig.language, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

/** Format list dates using the site's calendar-day thresholds. */
export function formatListDate(
	value: string,
	now = Temporal.Now.zonedDateTimeISO(blogConfig.timeZone),
) {
	const date = toPlainDate(value)
	const days = date.until(now.toPlainDate(), { largestUnit: 'day' }).days
	if (days <= 0) return '今天'
	if (days <= 7) return `${days}天前`
	if (date.year === now.year) return `${date.month}月${date.day}日`
	return `${String(date.year).slice(-2)}年${date.month}月${date.day}日`
}

export function toIsoDate(value: string) {
	return toPlainDate(value).toString()
}

export function toFeedInstant(value: string) {
	return toPlainDate(value)
		.toZonedDateTime({
			timeZone: blogConfig.timeZone,
			plainTime: Temporal.PlainTime.from('00:00'),
		})
		.toInstant()
		.toString()
}
