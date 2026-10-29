import type { TwikooClient } from '../types/comments'
import { observeCommentsAccessibility } from './comments-accessibility'
import { registerCommentsConsole } from './comments-console'

let clientPromise: Promise<TwikooClient> | undefined

/** Load the pinned no-CSS client once; failed downloads can be retried. */
function loadTwikoo(src: string): Promise<TwikooClient> {
	if (clientPromise) return clientPromise
	clientPromise = new Promise<TwikooClient>((resolve, reject) => {
		const script = document.createElement('script')
		let timeout: number
		const fail = () => {
			window.clearTimeout(timeout)
			script.remove()
			clientPromise = undefined
			reject(new Error('Twikoo client could not be loaded'))
		}
		timeout = window.setTimeout(fail, 20_000)
		script.src = src
		script.async = true
		script.addEventListener('error', fail, { once: true })
		script.addEventListener(
			'load',
			() => {
				window.clearTimeout(timeout)
				const client: unknown = Reflect.get(window, 'twikoo')
				if (
					!client ||
					typeof client !== 'object' ||
					!('init' in client) ||
					typeof client.init !== 'function'
				) {
					fail()
					return
				}
				resolve(client as TwikooClient)
			},
			{ once: true },
		)
		document.head.append(script)
	})
	return clientPromise
}

/** Fetch comments only near the article footer, keeping the reading path light. */
export function observeArticleComments(element: HTMLElement): () => void {
	if (typeof window === 'undefined' || typeof document === 'undefined')
		return () => {}
	const status = element.querySelector<HTMLElement>('[data-comments-status]')
	const retry = element.querySelector<HTMLButtonElement>(
		'[data-comments-retry]',
	)
	const mount = element.querySelector<HTMLElement>('#article-comments-mount')
	if (!status || !retry || !mount) return () => {}
	const cleanupConsole = registerCommentsConsole(element)
	const cleanupAccessibility = observeCommentsAccessibility(mount)
	let disposed = false
	let loading = false

	const initialize = async () => {
		if (loading || disposed) return
		loading = true
		retry.hidden = true
		status.hidden = false
		status.textContent = '正在加载评论…'
		mount.setAttribute('aria-busy', 'true')
		try {
			const client = await loadTwikoo(element.dataset.scriptSrc!)
			if (disposed) return
			await client.init({
				envId: element.dataset.envId!,
				el: '#article-comments-mount',
				path: element.dataset.path!,
				lang: element.dataset.lang || 'zh-CN',
				...(element.dataset.region ? { region: element.dataset.region } : {}),
			})
			status.hidden = true
		} catch {
			if (disposed) return
			status.textContent = '评论暂时无法加载，请重试。'
			retry.hidden = false
		} finally {
			loading = false
			mount.removeAttribute('aria-busy')
		}
	}
	const onRetry = () => {
		void initialize()
	}
	retry.addEventListener('click', onRetry)
	const observer =
		'IntersectionObserver' in window
			? new IntersectionObserver(
					entries => {
						if (entries.some(entry => entry.isIntersecting)) {
							observer?.disconnect()
							void initialize()
						}
					},
					{ rootMargin: '400px' },
				)
			: undefined
	if (observer) observer.observe(element)
	else void initialize()
	return () => {
		disposed = true
		observer?.disconnect()
		cleanupAccessibility()
		cleanupConsole()
		retry.removeEventListener('click', onRetry)
	}
}
