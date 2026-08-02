import { useRef, useState } from 'react'
import useCanvasSize from './engine/useCanvasSize.js'
import useGameLoop from './engine/useGameLoop.js'
import GameFrame from './engine/GameFrame.jsx'
import HUD from './engine/HUD.jsx'
import GameOverlay from './engine/GameOverlay.jsx'
import { clamp, dist, drawEmoji, spawnBurst, updateAndDrawParticles } from './engine/utils.js'

const W = 800
const H = 500
const MAX_POWER = 420
const BASKET_R = 24

const HOLES = [
  { tee: { x: 80, y: 440 }, basket: { x: 720, y: 80 }, par: 3, trees: [{ x: 380, y: 260, r: 26 }, { x: 560, y: 150, r: 22 }] },
  { tee: { x: 80, y: 80 }, basket: { x: 720, y: 440 }, par: 3, trees: [{ x: 300, y: 220, r: 24 }, { x: 500, y: 350, r: 24 }, { x: 620, y: 230, r: 20 }] },
  { tee: { x: 400, y: 460 }, basket: { x: 400, y: 50 }, par: 4, trees: [{ x: 340, y: 260, r: 24 }, { x: 460, y: 260, r: 24 }, { x: 400, y: 150, r: 22 }] },
]

function freshHoleState(holeIdx) {
  const hole = HOLES[holeIdx]
  return { disc: { x: hole.tee.x, y: hole.tee.y }, vx: 0, vy: 0, flying: false, strokes: 0 }
}

export default function DiscGolfGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const stateRef = useRef({ holeIdx: 0, ...freshHoleState(0), particles: [], totalStrokes: 0 })

  const [phase, setPhase] = useState('ready') // ready | aiming | holeComplete | done
  const [holeIdx, setHoleIdx] = useState(0)
  const [strokes, setStrokes] = useState(0)
  const [totalStrokes, setTotalStrokes] = useState(0)
  const [lastHoleStrokes, setLastHoleStrokes] = useState(null)
  const dragRef = useRef(null)
  const [aimLine, setAimLine] = useState(null)

  const start = () => {
    stateRef.current = { holeIdx: 0, ...freshHoleState(0), particles: [], totalStrokes: 0 }
    setHoleIdx(0)
    setStrokes(0)
    setTotalStrokes(0)
    setPhase('aiming')
  }

  const nextHole = () => {
    const s = stateRef.current
    const idx = s.holeIdx + 1
    if (idx >= HOLES.length) {
      setPhase('done')
      return
    }
    s.holeIdx = idx
    Object.assign(s, freshHoleState(idx))
    setHoleIdx(idx)
    setStrokes(0)
    setPhase('aiming')
  }

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * W, 0, W),
      y: clamp(((e.clientY - rect.top) / rect.height) * H, 0, H),
    }
  }

  const onPointerDown = (e) => {
    if (phase !== 'aiming' || stateRef.current.flying) return
    dragRef.current = getPos(e)
  }
  const onPointerMove = (e) => {
    if (!dragRef.current) return
    setAimLine({ from: dragRef.current, to: getPos(e) })
  }
  const onPointerUp = (e) => {
    if (!dragRef.current) return
    const end = getPos(e)
    const s = stateRef.current
    const dx = dragRef.current.x - end.x
    const dy = dragRef.current.y - end.y
    const pullDist = Math.min(Math.hypot(dx, dy), 140)
    if (pullDist > 8) {
      const power = (pullDist / 140) * MAX_POWER
      const d = Math.hypot(dx, dy) || 1
      s.vx = (dx / d) * power
      s.vy = (dy / d) * power
      s.flying = true
      s.strokes += 1
      setStrokes(s.strokes)
    }
    dragRef.current = null
    setAimLine(null)
  }

  useGameLoop((dt) => {
    const s = stateRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const hole = HOLES[s.holeIdx]

    if (phase === 'aiming' && s.flying) {
      s.disc.x += s.vx * dt
      s.disc.y += s.vy * dt
      s.vx *= 0.965
      s.vy *= 0.965
      s.disc.x = clamp(s.disc.x, 10, W - 10)
      s.disc.y = clamp(s.disc.y, 10, H - 10)

      for (const tree of hole.trees) {
        if (dist(s.disc, tree) < tree.r + 8) {
          s.vx = 0
          s.vy = 0
          spawnBurst(s.particles, s.disc.x, s.disc.y, '#43cc86', 10)
        }
      }

      const speed = Math.hypot(s.vx, s.vy)
      if (speed < 6) {
        s.vx = 0
        s.vy = 0
        s.flying = false
        if (dist(s.disc, hole.basket) < BASKET_R) {
          spawnBurst(s.particles, hole.basket.x, hole.basket.y, '#f9581a', 22)
          const total = s.totalStrokes + s.strokes
          s.totalStrokes = total
          setTotalStrokes(total)
          setLastHoleStrokes(s.strokes)
          setPhase('holeComplete')
        }
      }
    }

    // --- draw ---
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#0b1f14'
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 0.5
    for (const tree of hole.trees) drawEmoji(ctx, '🌲', tree.x, tree.y, tree.r * 1.7)
    ctx.globalAlpha = 1

    drawEmoji(ctx, '🥏', hole.tee.x, hole.tee.y, 22)
    drawEmoji(ctx, '🥅', hole.basket.x, hole.basket.y, 34)
    drawEmoji(ctx, '🥏', s.disc.x, s.disc.y, 24)

    if (aimLine) {
      ctx.save()
      ctx.strokeStyle = 'rgba(249,88,26,0.7)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(s.disc.x, s.disc.y)
      const dx = aimLine.from.x - aimLine.to.x
      const dy = aimLine.from.y - aimLine.to.y
      ctx.lineTo(s.disc.x + dx, s.disc.y + dy)
      ctx.stroke()
      ctx.restore()
    }

    updateAndDrawParticles(ctx, s.particles, dt)
  }, true)

  const hole = HOLES[holeIdx]

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <div
          className="absolute inset-0 z-10 cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
        <HUD left={[`⛳ Hole ${holeIdx + 1}/3 · Par ${hole.par}`]} right={[`🥏 Strokes: ${strokes}`]} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🥏"
          title="Pinecone Ridge — Quick Round"
          subtitle="Click/tap and drag back from the disc, then release to throw — like a slingshot. Land in the basket in as few throws as possible over 3 holes."
          buttonLabel="Start round"
          onAction={start}
        />
        <GameOverlay
          show={phase === 'holeComplete'}
          emoji="⛳"
          title={`Hole ${holeIdx + 1} complete!`}
          subtitle={`${lastHoleStrokes} throw${lastHoleStrokes === 1 ? '' : 's'} (par ${hole.par}). Total: ${totalStrokes} throws.`}
          buttonLabel={holeIdx + 1 >= HOLES.length ? 'See final score' : 'Next hole'}
          onAction={nextHole}
        />
        <GameOverlay
          show={phase === 'done'}
          emoji="🏆"
          title="Round complete!"
          subtitle={`Final score: ${totalStrokes} throws over 3 holes (par ${HOLES.reduce((s, h) => s + h.par, 0)}).`}
          buttonLabel="Play again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50">Drag back from the disc and release to throw</p>
    </div>
  )
}
