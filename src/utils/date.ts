import { Temporal } from 'temporal-polyfill'
import blogConfig from '../../blog.config'

export function toPlainDate(value: string) {
	return Temporal.PlainDate.from(value)
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
