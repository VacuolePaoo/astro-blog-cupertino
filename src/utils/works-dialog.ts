/**
 * Client behavior for the works dialog. Each panel is a viewport-wide scroll
 * container (its scrollbar sits at the window's right edge like a normal
 * page) holding a centered visual dialog box. The dialog fades in and rises
 * with the site's shared entrance curve while every panel component (meta,
 * title, links, prose) reveals with the shared stagger; closing fades the
 * content and the dialog back out. Focus returns to the originating card.
 *
 * Shared shell regardless of the animations: scroll lock, Lenis bypass,
 * backdrop, close buttons, focus trap, Escape handling.
 */

const FADE_EASING = 'cubic-bezier(0.2, 0.2, 0.2, 1)'
/** Every panel component takes part in the reveal/close stagger. */
const PANEL_CONTENT_SELECTOR =
	'[data-works-reveal], .works-panel-meta, [data-works-title]'

export function initializeWorksDialog(root: ParentNode = document): void {
	const foundOverlay = root.querySelector<HTMLElement>('[data-works-overlay]')
	const foundBackdrop = foundOverlay?.querySelector<HTMLElement>(
		'[data-works-backdrop]',
	)
	if (!foundOverlay || !foundBackdrop) return

	const overlay: HTMLElement = foundOverlay
	const backdrop: HTMLElement = foundBackdrop

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
	let openCard: HTMLElement | null = null
	let activePanel: HTMLElement | null = null
	let busy = false

	/**
	 * Scroll lock with scrollbar-width compensation: hiding the classic
	 * scrollbar would shift the whole page sideways, so the reserved width is
	 * added back as padding.
	 */
	function lockScroll(): void {
		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth
		if (scrollbarWidth > 0)
			document.documentElement.style.paddingRight = `${scrollbarWidth}px`
		document.documentElement.classList.add('works-open')
	}

	function unlockScroll(): void {
		document.documentElement.style.paddingRight = ''
		document.documentElement.classList.remove('works-open')
	}

	/** Run `finish` once, with a timeout fallback in case the animation's
	 * finish event never fires (e.g. backgrounded tab). */
	function onceWithTimeout(finish: () => void, timeout: number): () => void {
		let done = false
		const run = () => {
			if (done) return
			done = true
			finish()
		}
		window.setTimeout(run, timeout)
		return run
	}

	function panelFor(card: HTMLElement): HTMLElement | null {
		const id = card.dataset.workCard
		if (!id) return null
		return overlay.querySelector<HTMLElement>(
			`[data-works-panel="${CSS.escape(id)}"]`,
		)
	}

	function dialogBoxOf(panel: HTMLElement): HTMLElement | null {
		return panel.querySelector<HTMLElement>(':scope > .works-dialog')
	}

	function focusableItems(): HTMLElement[] {
		if (!activePanel) return []
		return [
			...activePanel.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled])',
			),
		].filter(element => element.offsetParent !== null)
	}

	function trapFocus(event: KeyboardEvent): void {
		const items = focusableItems()
		const first = items.at(0)
		const last = items.at(-1)
		if (!first || !last) return
		const current = document.activeElement
		if (event.shiftKey && (current === first || current === activePanel)) {
			event.preventDefault()
			last.focus()
		} else if (!event.shiftKey && current === last) {
			event.preventDefault()
			first.focus()
		}
	}

	function onKeydown(event: KeyboardEvent): void {
		if (!activePanel) return
		if (event.key === 'Escape') {
			event.preventDefault()
			close()
		} else if (event.key === 'Tab') {
			trapFocus(event)
		}
	}

	/** Clear inline opacity left behind by the open/close fades. */
	function clearInlineOpacity(element: HTMLElement): void {
		element.style.opacity = ''
		for (const child of element.querySelectorAll<HTMLElement>('*')) {
			if (child.style.opacity) child.style.opacity = ''
		}
	}

	/** Panel content rises into view with the shared stagger. */
	function revealPanelContent(panel: HTMLElement): void {
		panel
			.querySelectorAll<HTMLElement>(PANEL_CONTENT_SELECTOR)
			.forEach((element, index) => {
				element.animate(
					[
						{ opacity: 0, transform: 'translateY(24px)' },
						{ opacity: 1, transform: 'none' },
					],
					{
						duration: 500,
						delay: 200 + index * 60,
						easing: FADE_EASING,
						fill: 'backwards',
					},
				)
			})
	}

	function open(card: HTMLElement): void {
		if (busy || openCard) return
		const panel = panelFor(card)
		if (!panel) return
		busy = true
		openCard = card
		activePanel = panel

		lockScroll()
		overlay.hidden = false
		panel.hidden = false
		panel.scrollTop = 0
		panel
			.querySelector<HTMLElement>('[data-works-close]')
			?.focus({ preventScroll: true })

		if (reduceMotion.matches) {
			busy = false
			return
		}

		const dialogBox = dialogBoxOf(panel)
		const animations: Animation[] = [
			backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
				duration: 400,
				easing: 'ease-out',
			}),
			closeButtonAnim(panel, [{ opacity: 0 }, { opacity: 1 }], {
				duration: 240,
				delay: 160,
				easing: 'ease-out',
				fill: 'backwards',
			}),
		]
		if (dialogBox) {
			animations.push(
				dialogBox.animate(
					[
						{ opacity: 0, transform: 'translateY(24px)' },
						{ opacity: 1, transform: 'none' },
					],
					{ duration: 400, easing: FADE_EASING, fill: 'backwards' },
				),
			)
		}
		revealPanelContent(panel)
		const finishOpen = onceWithTimeout(() => {
			busy = false
		}, 600)
		animations.at(-1)?.addEventListener('finish', finishOpen)
	}

	function closeButtonAnim(
		panel: HTMLElement,
		keyframes: Keyframe[],
		options: KeyframeAnimationOptions,
	): Animation {
		const button = panel.querySelector('[data-works-close]')
		if (!button) {
			// Keep timing consistent even if the button is missing.
			const dummy = document.createElement('div').animate([], options)
			return dummy
		}
		return button.animate(keyframes, options)
	}

	function close(): void {
		if (busy || !openCard || !activePanel) return
		const card = openCard
		const panel = activePanel
		busy = true
		openCard = null
		activePanel = null

		if (reduceMotion.matches) {
			overlay.hidden = true
			panel.hidden = true
			unlockScroll()
			card
				.querySelector<HTMLElement>('.work-card-hit')
				?.focus({ preventScroll: true })
			busy = false
			return
		}

		const animations: Animation[] = []
		panel
			.querySelectorAll<HTMLElement>(PANEL_CONTENT_SELECTOR)
			.forEach(element =>
				animations.push(
					element.animate([{ opacity: 1 }, { opacity: 0 }], {
						duration: 140,
						easing: 'ease-in',
						fill: 'forwards',
					}),
				),
			)
		animations.push(
			closeButtonAnim(panel, [{ opacity: 1 }, { opacity: 0 }], {
				duration: 140,
				easing: 'ease-in',
				fill: 'forwards',
			}),
			backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: 260,
				easing: 'ease-in',
				fill: 'forwards',
			}),
		)
		const dialogBox = dialogBoxOf(panel)
		if (dialogBox) {
			animations.push(
				dialogBox.animate(
					[
						{ opacity: 1, transform: 'none' },
						{ opacity: 0, transform: 'translateY(12px)' },
					],
					{ duration: 220, easing: 'ease-in', fill: 'forwards' },
				),
			)
		}
		const finishClose = onceWithTimeout(() => {
			animations.forEach(animation => animation.cancel())
			overlay.hidden = true
			panel.hidden = true
			clearInlineOpacity(panel)
			unlockScroll()
			card
				.querySelector<HTMLElement>('.work-card-hit')
				?.focus({ preventScroll: true })
			busy = false
		}, 600)
		animations.at(-1)?.addEventListener('finish', finishClose)
	}

	document.addEventListener('click', event => {
		const target = event.target instanceof Element ? event.target : null
		if (!target) return
		const cardHit = target.closest<HTMLElement>('.work-card-hit')
		if (cardHit) {
			const card = cardHit.closest<HTMLElement>('[data-work-card]')
			if (card) {
				event.preventDefault()
				open(card)
			}
			return
		}
		if (!activePanel) return
		if (target.closest('[data-works-close]')) {
			close()
			return
		}
		if (target === backdrop || target === overlay) close()
	})
	document.addEventListener('keydown', onKeydown)
}
