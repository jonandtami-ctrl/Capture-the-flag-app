import { useRef, useCallback } from 'react'

// Generates short beeps/chimes with the Web Audio API so the app needs zero
// external audio assets. Lazily creates the AudioContext on first user
// interaction to respect browser autoplay policies.
export default function useSound() {
  const ctxRef = useRef(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      ctxRef.current = new AudioCtx()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const tone = useCallback(
    (freq = 880, duration = 0.15, delay = 0, type = 'sine', gain = 0.2) => {
      try {
        const ctx = getCtx()
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = type
        osc.frequency.value = freq
        g.gain.setValueAtTime(gain, ctx.currentTime + delay)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start(ctx.currentTime + delay)
        osc.stop(ctx.currentTime + delay + duration + 0.05)
      } catch {
        // Audio not supported/blocked — fail silently, it's a nice-to-have.
      }
    },
    [getCtx],
  )

  return {
    click: () => tone(520, 0.06, 0, 'triangle', 0.15),
    tick: () => tone(660, 0.05, 0, 'square', 0.08),
    start: () => {
      tone(523.25, 0.12, 0, 'sine', 0.2)
      tone(783.99, 0.15, 0.1, 'sine', 0.2)
    },
    complete: () => {
      tone(880, 0.15, 0, 'sine', 0.25)
      tone(660, 0.15, 0.15, 'sine', 0.25)
      tone(1046.5, 0.3, 0.3, 'sine', 0.25)
    },
    point: () => tone(987.77, 0.1, 0, 'triangle', 0.2),
  }
}
