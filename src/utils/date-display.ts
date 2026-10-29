import moment from 'moment/min/moment-with-locales'

/** Match Cupertino's Moment date_display_format using the site language. */
export function formatDisplayDate(value: string, format: string) {
	return moment(value, 'YYYY-MM-DD', true).locale('zh-cn').format(format)
}
