/** Format an ISO date (YYYY-MM-DD) as an absolute Chinese date like 2025年12月21日; invalid input is returned unchanged. */
export function formatDisplayDate(value: string): string {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
	return `${value.slice(0, 4)}年${Number(value.slice(5, 7))}月${Number(value.slice(8, 10))}日`
}
