import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { SearchDialog } from './SearchDialog'
import '../../styles/search.css'

export async function mountSearch(container: Element | null) {
	if (!container) return
	flushSync(() => createRoot(container).render(<SearchDialog />))
	await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}
