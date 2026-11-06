const revealSelector =
	'.article-card, .work-card, .friend-card, .feed-card, .prose p img, .prose .block-large img'

let revealObserver: IntersectionObserver | undefined

/** Observe theme content and reveal each item once as it enters the viewport. */
export function initializeScrollReveal(root: ParentNode = document) {
	revealObserver?.disconnect()
	const items = [...root.querySelectorAll<HTMLElement>(revealSelector)]
	if (!items.length) return
	if (!('IntersectionObserver' in window)) {
		items.forEach(item => item.classList.add('scroll-reveal-show'))
		return
	}
	revealObserver = new IntersectionObserver(entries => {
		for (const entry of entries) {
			if (!entry.isIntersecting) continue
			entry.target.classList.add('scroll-reveal-show')
			revealObserver?.unobserve(entry.target)
		}
	})
	items.forEach(item => {
		item.classList.add('scroll-reveal')
		revealObserver?.observe(item)
	})
}
