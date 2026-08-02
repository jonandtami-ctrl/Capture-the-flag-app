import { useEffect, useRef } from 'react'

// Games are authored against a fixed logical resolution so physics/AI never
// have to think about responsive coordinates. The canvas's drawing buffer
// stays at that logical size (times devicePixelRatio for crispness) while
// its CSS size scales to fill the container.
export default function useCanvasSize(canvasRef, width = 800, height = 500) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const resize = () => {
      const displayWidth = container.clientWidth
      const displayHeight = Math.round(displayWidth * (height / width))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [canvasRef, width, height])

  return { containerRef, width, height }
}
