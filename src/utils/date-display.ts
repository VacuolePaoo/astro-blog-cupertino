import type { UiLocale } from '../types/i18n'
import moment from 'moment/min/moment-with-locales'

/** Match Cupertino's Moment date_display_format using the selected UI locale. */
export function formatDisplayDate(
	value: string,
	format: string,
	locale: UiLocale,
) {
	return moment(value, 'YYYY-MM-DD', true)
		.locale(locale === 'zh-CN' ? 'zh-cn' : 'en')
		.format(format)
}
