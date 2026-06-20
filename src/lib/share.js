// Shared WhatsApp share helper.
// FIX: window.open(url, '_blank') is unreliable on iOS Safari and in-app
// browsers — popups triggered this way are frequently blocked, and the
// message can appear empty or vanish. Using location.href (same-tab nav)
// is the behavior WhatsApp's own share buttons use and works reliably on
// Android, iPhone, and WhatsApp Web.

export function buildWhatsAppUrl(text) {
  // encodeURIComponent handles all special characters, emoji, and newlines correctly.
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function openWhatsApp(text) {
  const url = buildWhatsAppUrl(text)
  // location.href works reliably across Android/iOS/WhatsApp Web, unlike
  // window.open which can be blocked as a popup on mobile Safari.
  window.location.href = url
}

// Copies the raw message text (not the encoded URL) so the user can paste
// it anywhere — WhatsApp, SMS, etc. Falls back gracefully if clipboard
// access is unavailable (e.g. non-HTTPS or older browsers).
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (e) {
    console.error('Clipboard write failed', e)
  }
  // Fallback for older browsers
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  } catch (e) {
    console.error('Fallback clipboard copy failed', e)
    return false
  }
}

// Copies the message AND opens WhatsApp right after — belt-and-suspenders
// so the user has the text in their clipboard even if the prefill doesn't
// stick on a particular device/browser combination.
export async function copyThenOpenWhatsApp(text) {
  await copyToClipboard(text)
  openWhatsApp(text)
}
