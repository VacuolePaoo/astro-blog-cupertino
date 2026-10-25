import type { UiLocale, UiMessageKey } from '../types/i18n'
import { translate } from './i18n'

/** Twikoo 2.0.17 strips icon names; match only the three verified toolbar SVGs. */
function getToolbarAction(element: Element): UiMessageKey | undefined {
	const path = element.querySelector('svg path')?.getAttribute('d') ?? ''
	if (path.startsWith('M416 208')) return 'comments.search'
	if (path.startsWith('M65.9 228.5')) return 'comments.refresh'
	if (path.startsWith('M195.1 9.5')) return 'comments.manage'
	return undefined
}

function labelButton(element: HTMLElement, label: string) {
	element.setAttribute('aria-label', label)
	if (element.matches('button, a[href]')) return
	element.setAttribute('role', 'button')
	element.tabIndex = 0
	element.dataset.commentsKeyboard = ''
}

/** Add missing semantics while retaining Twikoo's own click handlers and state. */
export function observeCommentsAccessibility(
	root: HTMLElement,
	locale: UiLocale,
): () => void {
	if (typeof window === 'undefined' || typeof document === 'undefined')
		return () => {}
	let adminWasOpen = false
	let adminTrigger: HTMLElement | undefined

	const enhance = () => {
		for (const prepend of root.querySelectorAll('.tk-input-group__prepend')) {
			const input = prepend.parentElement?.querySelector('input, textarea')
			const label = prepend.textContent?.trim()
			if (input && label) input.setAttribute('aria-label', label)
		}
		for (const textarea of root.querySelectorAll('.tk-submit textarea'))
			textarea.setAttribute('aria-label', translate('comments.content', locale))
		root
			.querySelector('.tk-comments-search input')
			?.setAttribute('aria-label', translate('comments.search', locale))

		const admin = root.querySelector<HTMLElement>('.tk-admin')
		// Keep the scroll wheel inside Twikoo's configuration panel with Lenis enabled.
		admin?.setAttribute('data-lenis-prevent', '')
		const adminOpen = admin?.classList.contains('__show') ?? false
		for (const action of root.querySelectorAll<HTMLElement>(
			'.tk-comments-actions > .tk-icon.__comments',
		)) {
			const key = getToolbarAction(action)
			if (!key) continue
			labelButton(action, translate(key, locale))
			if (key === 'comments.manage') {
				adminTrigger = action
				action.setAttribute('aria-expanded', String(adminOpen))
			} else if (key === 'comments.search') {
				action.setAttribute(
					'aria-expanded',
					String(action.classList.contains('__active')),
				)
			}
		}
		for (const logo of root.querySelectorAll<HTMLElement>('.OwO-logo')) {
			labelButton(logo, translate('comments.emoji', locale))
			logo.setAttribute(
				'aria-expanded',
				String(logo.parentElement?.classList.contains('OwO-open') ?? false),
			)
		}
		for (const item of root.querySelectorAll<HTMLElement>(
			'.OwO-item, .OwO-packages > li, .tk-expand',
		)) {
			labelButton(
				item,
				item.title ||
					item.textContent?.trim() ||
					translate('comments.emoji', locale),
			)
			if (item.matches('.OwO-packages > li'))
				item.setAttribute(
					'aria-pressed',
					String(item.classList.contains('OwO-package-active')),
				)
		}
		for (const upload of root.querySelectorAll<HTMLElement>(
			'.tk-row-actions-start > .tk-submit-action-icon:not(.OwO)',
		))
			labelButton(upload, translate('comments.uploadImage', locale))
		const close = admin?.querySelector<HTMLElement>(':scope > .tk-admin-close')
		if (close) labelButton(close, translate('comments.closeAdmin', locale))
		if (adminOpen && !adminWasOpen) {
			admin?.scrollIntoView({ block: 'center', behavior: 'instant' })
			close?.focus({ preventScroll: true })
		} else if (!adminOpen && adminWasOpen && adminTrigger?.isConnected) {
			adminTrigger.focus()
		}
		adminWasOpen = adminOpen
	}

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.defaultPrevented) return
		if (event.key === 'Escape') {
			const emoji = root.querySelector<HTMLElement>('.OwO.OwO-open .OwO-logo')
			const close = root.querySelector<HTMLElement>(
				'.tk-admin.__show > .tk-admin-close',
			)
			if (!emoji && !close) return
			event.preventDefault()
			event.stopPropagation()
			if (emoji) {
				emoji.click()
				emoji.focus()
			} else close?.click()
			return
		}
		if (event.key !== 'Enter' && event.key !== ' ') return
		const target =
			event.target instanceof Element
				? event.target.closest<HTMLElement>('[data-comments-keyboard]')
				: null
		if (!target || !root.contains(target)) return
		event.preventDefault()
		if (!event.repeat) target.click()
	}
	const observer = new MutationObserver(records => {
		if (
			records.some(
				record =>
					record.type === 'childList' ||
					(record.target instanceof Element &&
						record.target.matches(
							'.tk-admin, .OwO, .OwO-packages > li, .tk-comments-actions > .tk-icon.__comments',
						)),
			)
		)
			enhance()
	})
	observer.observe(root, {
		subtree: true,
		childList: true,
		attributes: true,
		attributeFilter: ['class'],
	})
	root.addEventListener('keydown', onKeyDown)
	enhance()
	return () => {
		observer.disconnect()
		root.removeEventListener('keydown', onKeyDown)
	}
}
