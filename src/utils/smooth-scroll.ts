let smoothScroll: { destroy: () => void } | undefined

export async function initializeSmoothScroll(enabled: boolean) {
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
	if (!enabled || reducedMotion) {
		smoothScroll?.destroy()
		smoothScroll = undefined
		return
	}

	if (smoothScroll) return
	const { default: Lenis } = await import('lenis')
	smoothScroll = new Lenis({ autoRaf: true })
}
