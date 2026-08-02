import { useState } from 'react'

// Shares a direct link to the current game — uses the native share sheet on
// mobile (navigator.share) and falls back to copying the link to the
// clipboard everywhere else.
export default function ShareButton({ gameName, className = '' }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.href
    const text = `Play ${gameName} on CampHQ`

    if (navigator.share) {
      try {
        await navigator.share({ title: gameName, text, url })
        return
      } catch {
        // user cancelled the share sheet — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked — nothing more we can do silently
    }
  }

  return (
    <button onClick={share} className={`btn-ghost text-sm ${className}`}>
      {copied ? '✅ Link copied!' : '🔗 Share'}
    </button>
  )
}
