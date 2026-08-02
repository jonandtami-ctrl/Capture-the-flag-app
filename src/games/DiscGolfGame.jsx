import { useRef, useState } from 'react'
import useCanvasSize from './engine/useCanvasSize.js'
import useGameLoop from './engine/useGameLoop.js'
import GameFrame from './engine/GameFrame.jsx'
import HUD from './engine/HUD.jsx'
import GameOverlay from './engine/GameOverlay.jsx'
import {
  clamp,
  dist,
  drawEmoji,
  spawnBurst,
  updateAndDrawParticles,
  spawnFloatingText,
  updateAndDrawFloatingText,
  triggerShake,
  updateShake,
} from './engine/utils.js'

const W = 800
const H = 500
const MAX_POWER = 620
const MAX_PULL = 140
const FRICTION = 0.988
const BASKET_R = 24

const HOLES = [
  // Trees sit just off the direct tee-to-basket line (not on it) — a
  // precise, full-power throw can thread the gap for a hole-in-one, while
  // anything less exact clips one on the way past.
  { tee: { x: 80, y: 440 }, basket: { x: 720, y: 80 }, par: 3, trees: [{ x: 358, y: 335, r: 26 }, { x: 474, y: 167, r: 22 }] },
  { tee: { x: 80, y: 80 }, basket: { x: 720, y: 440 }, par: 3, trees: [{ x: 330, y: 175, r: 24 }, { x: 500, y: 350, r: 24 }, { x: 620, y: 230, r: 20 }] },
  { tee: { x: 400, y: 460 }, basket: { x: 400, y: 50 }, par: 4, trees: [{ x: 340, y: 260, r: 24 }, { x: 460, y: 260, r: 24 }, { x: 445, y: 150, r: 22 }] },
]

function freshHoleState(holeIdx) {
  const hole = HOLES[holeIdx]
  return {
    disc: { x: hole.tee.x, y: hole.tee.y },
    vx: 0,
    vy: 0,
    flying: false,
    strokes: 0,
    floatingText: [],
    shake: { trauma: 0 },
  }
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
    // Explicit pointer capture so the drag keeps tracking this element even
    // if the pointer moves fast or briefly leaves its bounds — without it,
    // the browser can fail to deliver the matching pointerup at all.
    e.currentTarget.setPointerCapture(e.pointerId)
    // Anchor the pull at the disc's actual rest position (not wherever the
    // finger first landed) so grabbing anywhere near it still feels right.
    dragRef.current = { x: stateRef.current.disc.x, y: stateRef.current.disc.y }
    setAimLine({ from: dragRef.current, to: getPos(e) })
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
    const pullDist = Math.min(Math.hypot(dx, dy), MAX_PULL)
    if (pullDist > 8) {
      const power = (pullDist / MAX_PULL) * MAX_POWER
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
      // Decay expressed per 1/60s frame, but applied relative to actual dt
      // so total travel distance doesn't depend on the display's refresh rate.
      const frictionThisFrame = Math.pow(FRICTION, dt * 60)
      s.vx *= frictionThisFrame
      s.vy *= frictionThisFrame
      s.disc.x = clamp(s.disc.x, 10, W - 10)
      s.disc.y = clamp(s.disc.y, 10, H - 10)

      for (const tree of hole.trees) {
        if (dist(s.disc, tree) < tree.r + 8) {
          s.vx = 0
          s.vy = 0
          spawnBurst(s.particles, s.disc.x, s.disc.y, '#43cc86', 10)
          spawnFloatingText(s.floatingText, s.disc.x, s.disc.y - 20, 'BONK!', '#43cc86', 16)
          triggerShake(s.shake, 0.25)
        }
      }

      const speed = Math.hypot(s.vx, s.vy)
      if (speed < 6) {
        s.vx = 0
        s.vy = 0
        s.flying = false
        if (dist(s.disc, hole.basket) < BASKET_R) {
          spawnBurst(s.particles, hole.basket.x, hole.basket.y, '#f9581a', 22)
          triggerShake(s.shake, 0.4)
          spawnFloatingText(s.floatingText, hole.basket.x, hole.basket.y - 30, s.strokes === 1 ? 'HOLE IN ONE!' : 'IN THE BASKET!', '#ffd166', s.strokes === 1 ? 22 : 18)
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
    const shakeOffset = updateShake(s.shake, dt)
    ctx.save()
    ctx.translate(shakeOffset.x, shakeOffset.y)
    ctx.fillStyle = '#0b1f14'
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 0.5
    for (const tree of hole.trees) drawEmoji(ctx, '🌲', tree.x, tree.y, tree.r * 1.7)
    ctx.globalAlpha = 1

    drawEmoji(ctx, '🥏', hole.tee.x, hole.tee.y, 22)

    // basket — glowing ring so it always reads clearly against the trees
    ctx.save()
    ctx.strokeStyle = 'rgba(249,88,26,0.55)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(hole.basket.x, hole.basket.y, BASKET_R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
    drawEmoji(ctx, '🥅', hole.basket.x, hole.basket.y, 36)

    // Pull-back mechanics: while dragging, the disc itself slides toward
    // your finger (like stretching a slingshot) instead of staying put.
    let discDrawX = s.disc.x
    let discDrawY = s.disc.y

    if (aimLine && !s.flying) {
      const pdx = aimLine.to.x - aimLine.from.x
      const pdy = aimLine.to.y - aimLine.from.y
      const pullDist = Math.min(Math.hypot(pdx, pdy), MAX_PULL)
      const angle = Math.atan2(pdy, pdx)
      discDrawX = aimLine.from.x + Math.cos(angle) * pullDist
      discDrawY = aimLine.from.y + Math.sin(angle) * pullDist

      // rubber-band from the anchor to the pulled-back disc
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(aimLine.from.x, aimLine.from.y)
      ctx.lineTo(discDrawX, discDrawY)
      ctx.stroke()
      ctx.restore()

      // dashed trajectory preview shooting the opposite direction (launch dir)
      const power = pullDist / MAX_PULL
      ctx.save()
      ctx.strokeStyle = `rgba(249,88,26,${0.4 + power * 0.4})`
      ctx.lineWidth = 3
      ctx.setLineDash([10, 8])
      ctx.beginPath()
      ctx.moveTo(aimLine.from.x, aimLine.from.y)
      ctx.lineTo(aimLine.from.x - Math.cos(angle) * pullDist * 3, aimLine.from.y - Math.sin(angle) * pullDist * 3)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    } else if (phase === 'aiming' && !s.flying) {
      // not dragging: a faint guide toward the hole so it's always findable
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 8])
      ctx.beginPath()
      ctx.moveTo(s.disc.x, s.disc.y)
      ctx.lineTo(hole.basket.x, hole.basket.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    }

    drawEmoji(ctx, '🥏', discDrawX, discDrawY, 24)

    updateAndDrawParticles(ctx, s.particles, dt)
    updateAndDrawFloatingText(ctx, s.floatingText, dt)
    ctx.restore()
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
          subtitle="Land in the basket in as few throws as possible over 3 holes!"
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
      <p className="mt-3 text-center text-xs text-forest-400/50">Pull back from the disc like a slingshot, then let go to launch it toward the basket</p>
    </div>
  )
}
