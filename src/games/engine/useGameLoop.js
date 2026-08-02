import { useEffect, useRef } from 'react'

// Runs `callback(dt)` on requestAnimationFrame while `active` is true. dt is
// clamped so a dropped/backgrounded tab doesn't cause a giant physics jump.
export default function useGameLoop(callback, active) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!active) return
    let frameId
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20)
      last = now
      callbackRef.current(dt)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [active])
}
