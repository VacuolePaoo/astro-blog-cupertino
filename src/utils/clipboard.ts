/**
 * Copy text to the clipboard, preferring the async Clipboard API and falling
 * back to a hidden textarea with `execCommand` for non-secure contexts where
 * `navigator.clipboard` is unavailable.
 *
 * Browser-only: every browser global is touched inside the call, never at
 * import time.
 */
export async function copyText(text: string): Promise<boolean> {
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text)
			return true
		} catch {
			// Permission denied or transient failure; try the legacy path.
		}
	}
	return copyViaExecCommand(text)
}

/** Legacy fallback for contexts without the async Clipboard API. */
function copyViaExecCommand(text: string): boolean {
	const textarea = document.createElement('textarea')
	textarea.value = text
	textarea.setAttribute('readonly', '')
	textarea.style.position = 'fixed'
	textarea.style.top = '0'
	textarea.style.opacity = '0'
	document.body.appendChild(textarea)
	textarea.select()
	// `execCommand` is deprecated but remains the only programmatic copy
	// fallback; call it through a narrow binding that skips the deprecation
	// hint on the standard signature.
	const execCommand = (
		document as { execCommand?: (command: string) => boolean }
	).execCommand?.bind(document)
	let succeeded = false
	try {
		succeeded = execCommand?.('copy') ?? false
	} catch {
		succeeded = false
	}
	textarea.remove()
	return succeeded
}
