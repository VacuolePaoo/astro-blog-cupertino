import type { ColorScheme } from '../types/config'

const STORAGE_KEY = 'blog-theme'
let controlsAbortController: AbortController | undefined

function isColorScheme(value: string | null): value is ColorScheme {
	return value === 'light' || value === 'dark' || value === 'auto'
}

export function getColorScheme(fallback: ColorScheme): ColorScheme {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		return isColorScheme(stored) ? stored : fallback
	} catch {
		return fallback
	}
}

export function applyColorScheme(theme: ColorScheme) {
	const systemDark = matchMedia('(prefers-color-scheme: dark)').matches
	const isDark = theme === 'dark' || (theme === 'auto' && systemDark)
	document.documentElement.classList.toggle('dark', isDark)
	document.documentElement.dataset.theme = theme
	document
		.querySelectorAll<HTMLButtonElement>('button[data-theme]')
		.forEach(button =>
			button.setAttribute(
				'aria-pressed',
				String(button.dataset.theme === theme),
			),
		)
}

export function setColorScheme(theme: ColorScheme) {
	try {
		localStorage.setItem(STORAGE_KEY, theme)
	} catch {
		// The selected theme still applies for the current page when storage is blocked.
	}
	applyColorScheme(theme)
}

export function initializeThemeControls(fallback: ColorScheme) {
	controlsAbortController?.abort()
	controlsAbortController = new AbortController()
	const { signal } = controlsAbortController
	applyColorScheme(getColorScheme(fallback))

	document.addEventListener(
		'click',
		event => {
			const button = (event.target as Element).closest<HTMLButtonElement>(
				'button[data-theme]',
			)
			const theme = button?.dataset.theme ?? null
			if (isColorScheme(theme)) setColorScheme(theme)
		},
		{ signal },
	)

	matchMedia('(prefers-color-scheme: dark)').addEventListener(
		'change',
		() => {
			if (getColorScheme(fallback) === 'auto') applyColorScheme('auto')
		},
		{ signal },
	)
}
