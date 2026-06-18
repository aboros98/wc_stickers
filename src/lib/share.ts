import { toBlob } from 'html-to-image'

const APP_TITLE = 'My Panini World Cup 2026 album'

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path (webviews / non-secure contexts) */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '0'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/** Share plain text via the native share sheet, falling back to clipboard. */
export async function shareText(text: string, title = APP_TITLE): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text })
      return
    } catch {
      return // user cancelled — do nothing
    }
  }
  await copyText(text)
}

async function nodeToBlob(node: HTMLElement): Promise<Blob | null> {
  try {
    return await toBlob(node, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#0B0B0B',
    })
  } catch {
    return null
  }
}

export type ImageShareResult = 'shared' | 'downloaded' | 'failed'

/**
 * Snapshot a DOM node to PNG and share it via the native sheet; on platforms
 * without file-sharing support, download it instead.
 */
export async function shareImage(
  node: HTMLElement,
  text: string,
  title = APP_TITLE,
): Promise<ImageShareResult> {
  const blob = await nodeToBlob(node)
  if (!blob) return 'failed'

  const file = new File([blob], 'panini-wc2026.png', { type: 'image/png' })

  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] }) &&
    navigator.share
  ) {
    try {
      await navigator.share({ title, text, files: [file] })
    } catch {
      // user cancelled — treat as handled
    }
    return 'shared'
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'panini-wc2026.png'
  a.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
