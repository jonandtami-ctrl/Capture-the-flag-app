import { useRef, useState } from 'react'

// On-screen thumbstick for touch devices. Writes directly into `dirRef`
// (a {x,y} object) rather than React state so the game loop can read it
// every frame with zero re-render overhead.
//
// Stays faint until you actually touch it, then lights up — so it doesn't
// sit there at full opacity covering whatever character happens to wander
// underneath its corner.
export default function VirtualJoystick({ dirRef }) {
  const baseRef = useRef(null)
  const knobRef = useRef(null)
  const activeTouch = useRef(null)
  const [active, setActive] = useState(false)

  const setKnob = (dx, dy) => {
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`
  }

  const handleMove = (clientX, clientY) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = clientX - cx
    let dy = clientY - cy
    const max = rect.width / 2
    const d = Math.hypot(dx, dy) || 1
    if (d > max) {
      dx = (dx / d) * max
      dy = (dy / d) * max
    }
    setKnob(dx, dy)
    dirRef.current = { x: dx / max, y: dy / max }
  }

  const reset = () => {
    setKnob(0, 0)
    dirRef.current = { x: 0, y: 0 }
    activeTouch.current = null
    setActive(false)
  }

  return (
    <div
      ref={baseRef}
      className={`absolute bottom-5 left-5 z-10 flex h-20 w-20 touch-none select-none items-center justify-center rounded-full border transition-opacity duration-150 sm:hidden ${
        active ? 'border-white/25 bg-white/10 opacity-100' : 'border-white/10 bg-white/5 opacity-35'
      }`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        activeTouch.current = e.pointerId
        setActive(true)
        handleMove(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => {
        if (activeTouch.current === e.pointerId) handleMove(e.clientX, e.clientY)
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div
        ref={knobRef}
        className={`h-8 w-8 rounded-full shadow-glow-forest transition-transform duration-75 ${
          active ? 'bg-forest-400/80' : 'bg-forest-400/40'
        }`}
      />
    </div>
  )
}
