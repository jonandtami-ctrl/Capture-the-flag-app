import { useRef } from 'react'

// On-screen thumbstick for touch devices. Writes directly into `dirRef`
// (a {x,y} object) rather than React state so the game loop can read it
// every frame with zero re-render overhead.
export default function VirtualJoystick({ dirRef }) {
  const baseRef = useRef(null)
  const knobRef = useRef(null)
  const activeTouch = useRef(null)

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
  }

  return (
    <div
      ref={baseRef}
      className="absolute bottom-5 left-5 z-10 flex h-24 w-24 touch-none select-none items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-sm sm:hidden"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        activeTouch.current = e.pointerId
        handleMove(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => {
        if (activeTouch.current === e.pointerId) handleMove(e.clientX, e.clientY)
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div ref={knobRef} className="h-10 w-10 rounded-full bg-forest-400/70 shadow-glow-forest transition-transform duration-75" />
    </div>
  )
}
