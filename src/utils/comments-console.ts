/** Own the page-local expand command and restore button without remounting Twikoo. */
export function registerCommentsConsole(element: HTMLElement): () => void {
	if (typeof window === 'undefined') return () => {}
	const restoreButton = element.querySelector<HTMLButtonElement>(
		'[data-comments-restore]',
	)
	if (!restoreButton) return () => {}
	restoreButton.hidden = !element.hasAttribute('data-comments-expanded')
	restoreButton.textContent = '恢复评论区尺寸'
	// A body child remains viewport-fixed outside article containment and FLIP transforms.
	document.body.append(restoreButton)
	let animation: Animation | undefined
	const previousCommand = window.expandTwikoo
	const setExpanded = (expanded: boolean) => {
		if (
			!element.isConnected ||
			element.hasAttribute('data-comments-expanded') === expanded
		)
			return false

		// Scrolling also brings a not-yet-loaded widget into its lazy-load range.
		if (expanded)
			element.scrollIntoView({ block: 'start', behavior: 'instant' })
		const before = element.getBoundingClientRect()
		animation?.cancel()
		element.toggleAttribute('data-comments-expanded', expanded)
		restoreButton.textContent = '恢复评论区尺寸'
		restoreButton.hidden = !expanded
		const after = element.getBoundingClientRect()

		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			// FLIP: change layout once, then animate only the visual transform.
			animation = element.animate(
				[
					{
						transformOrigin: '0 0',
						transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`,
					},
					{ transformOrigin: '0 0', transform: 'none' },
				],
				{
					duration: expanded ? 300 : 240,
					easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
				},
			)
		}
		return true
	}
	const expand = () => setExpanded(true)
	const restore = () => {
		if (!setExpanded(false)) return
		element
			.querySelector<HTMLElement>('#comments-title')
			?.focus({ preventScroll: true })
	}
	restoreButton.addEventListener('click', restore)
	window.expandTwikoo = expand

	return () => {
		animation?.cancel()
		restoreButton.removeEventListener('click', restore)
		restoreButton.hidden = true
		// Keep the button with its owner if this custom element reconnects later.
		element.append(restoreButton)
		if (window.expandTwikoo !== expand) return
		if (previousCommand) window.expandTwikoo = previousCommand
		else delete window.expandTwikoo
	}
}
