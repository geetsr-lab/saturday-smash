import { useState } from 'react'
import { openWhatsApp, copyToClipboard, copyThenOpenWhatsApp } from '../lib/share'

// Reusable share row: Open WhatsApp / Copy Message / Copy & Open.
// Used by Leaderboard, Sessions, and PlayerDashboard so all share buttons
// behave identically and reliably across Android, iPhone, and WhatsApp Web.
export default function ShareButtons({ text, label = 'Share' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => copyThenOpenWhatsApp(text)}
        className="w-full bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-400 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        📲 {label} on WhatsApp
      </button>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1"
        >
          {copied ? '✓ Copied!' : '📋 Copy Message'}
        </button>
        <button
          onClick={() => openWhatsApp(text)}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm py-2.5 rounded-xl transition-colors"
        >
          Open WhatsApp Only
        </button>
      </div>
    </div>
  )
}
