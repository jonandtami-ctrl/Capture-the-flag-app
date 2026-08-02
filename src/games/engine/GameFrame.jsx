export default function GameFrame({ containerRef, canvasRef, children }) {
  return (
    <div
      ref={containerRef}
      className="relative w-full touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-dusk-950 shadow-card"
    >
      <canvas ref={canvasRef} className="block w-full" />
      {children}
    </div>
  )
}
