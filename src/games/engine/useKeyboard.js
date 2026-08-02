import { useEffect, useRef } from 'react'

const DIR_KEYS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
}

// Tracks currently-pressed keys in a ref (not React state) so the game loop
// can read input every frame without triggering re-renders.
export default function useKeyboard() {
  const keysRef = useRef(new Set())
  const actionRef = useRef(false)

  useEffect(() => {
    const down = (e) => {
      keysRef.current.add(e.code)
      if (e.code === 'Space') actionRef.current = true
      if (Object.keys(DIR_KEYS).includes(e.code)) e.preventDefault()
    }
    const up = (e) => {
      keysRef.current.delete(e.code)
      if (e.code === 'Space') actionRef.current = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const getDirection = () => {
    let x = 0
    let y = 0
    for (const code of keysRef.current) {
      const dir = DIR_KEYS[code]
      if (dir === 'up') y -= 1
      if (dir === 'down') y += 1
      if (dir === 'left') x -= 1
      if (dir === 'right') x += 1
    }
    const len = Math.hypot(x, y) || 1
    return { x: x / len, y: y / len }
  }

  return { keysRef, actionRef, getDirection }
}
