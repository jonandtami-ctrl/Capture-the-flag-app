import { useRef, useState } from 'react'
import useCanvasSize from './engine/useCanvasSize.js'
import useKeyboard from './engine/useKeyboard.js'
import useGameLoop from './engine/useGameLoop.js'
import GameFrame from './engine/GameFrame.jsx'
import HUD from './engine/HUD.jsx'
import GameOverlay from './engine/GameOverlay.jsx'
import VirtualJoystick from './engine/VirtualJoystick.jsx'
import RankProgress from './engine/RankProgress.jsx'
import RankUpBanner from './engine/RankUpBanner.jsx'
import useRank from '../lib/useRank.js'
import {
  clamp,
  dist,
  rand,
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
const CENTER = { x: W / 2, y: H / 2 }
const RADIUS = 220
const SPEED = 220
const ROUND_SECONDS = 75
const START_HEALTH = 5

// Keeps an entity inside the circular arena AND on its own side of the
// center line — projecting radially toward the center preserves which
// side of that line a point is on, so this one clamp handles both.
function clampToArenaHalf(x, y, side, margin = 16) {
  const dx = x - CENTER.x
  const dy = y - CENTER.y
  const d = Math.hypot(dx, dy)
  const maxR = RADIUS - margin
  let nx = x
  let ny = y
  if (d > maxR) {
    const scale = maxR / d
    nx = CENTER.x + dx * scale
    ny = CENTER.y + dy * scale
  }
  if (side === 'left') nx = Math.min(nx, CENTER.x - margin)
  else nx = Math.max(nx, CENTER.x + margin)
  return { x: nx, y: ny }
}

function freshState(mult) {
  return {
    mult,
    player: { x: CENTER.x - RADIUS + 90, y: CENTER.y },
    ai: {
      x: CENTER.x + RADIUS - 90,
      y: CENTER.y,
      target: { x: CENTER.x + RADIUS - 90, y: CENTER.y },
      wanderT: rand(0.5, 1.5),
      throwCd: rand(0.6, 1.2) / mult.speed,
    },
    playerFlame: { x: CENTER.x - RADIUS + 30, y: CENTER.y, health: START_HEALTH },
    aiFlame: { x: CENTER.x + RADIUS - 30, y: CENTER.y, health: START_HEALTH },
    balloons: [], // {x,y,tx,ty,speed,from:'player'|'ai'}
    telegraphs: [], // {x,y,t}
    particles: [],
    floatingText: [],
    shake: { trauma: 0 },
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
  }
}

export default function FlameBattlersGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const { getDirection } = useKeyboard()
  const joyRef = useRef({ x: 0, y: 0 })
  const { rank, nextRank, winsToNext, recordWin } = useRank()
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))

  const [phase, setPhase] = useState('ready')
  const [hp, setHp] = useState({ player: START_HEALTH, ai: START_HEALTH })
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [rankUp, setRankUp] = useState(null)
  const hudAccum = useRef(0)

  const winGame = () => {
    setPhase('won')
    const result = recordWin()
    if (result.rankedUp) setRankUp(result.newRank)
  }

  const start = () => {
    setRankUp(null)
    const mult = { speed: rank.speedMult, time: rank.timeMult }
    stateRef.current = freshState(mult)
    setHp({ player: START_HEALTH, ai: START_HEALTH })
    setTimeLeft(stateRef.current.timeLeft)
    setPhase('playing')
  }

  const throwAt = (logicalX, logicalY) => {
    const s = stateRef.current
    if (phase !== 'playing') return
    s.balloons.push({
      x: s.player.x,
      y: s.player.y,
      tx: logicalX,
      ty: logicalY,
      t: 0,
      duration: dist(s.player, { x: logicalX, y: logicalY }) / 420,
      from: 'player',
    })
  }

  const handlePointer = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    const y = ((e.clientY - rect.top) / rect.height) * H
    throwAt(clamp(x, 0, W), clamp(y, 0, H))
  }

  useGameLoop((dt) => {
    const s = stateRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (phase === 'playing') {
      s.timeLeft -= dt
      if (s.timeLeft <= 0) {
        s.timeLeft = 0
        if (s.playerFlame.health >= s.aiFlame.health) winGame()
        else setPhase('lost')
      }

      // player movement — free to roam their half of the circular arena
      const kd = getDirection()
      const dx = kd.x !== 0 || kd.y !== 0 ? kd.x : joyRef.current.x
      const dy = kd.x !== 0 || kd.y !== 0 ? kd.y : joyRef.current.y
      const nextPlayer = clampToArenaHalf(s.player.x + dx * SPEED * dt, s.player.y + dy * SPEED * dt, 'left')
      s.player.x = nextPlayer.x
      s.player.y = nextPlayer.y

      // AI wander — roams its whole half of the arena, not just a strip,
      // so its position (and incoming balloons) is harder to predict
      const aiSpeed = 150 * s.mult.speed
      s.ai.wanderT -= dt
      if (s.ai.wanderT <= 0 || dist(s.ai, s.ai.target) < 12) {
        const angle = rand(0, Math.PI * 2)
        const r = rand(0, RADIUS - 50)
        s.ai.target = clampToArenaHalf(CENTER.x + RADIUS - 90 + Math.cos(angle) * r * 0.4, CENTER.y + Math.sin(angle) * r, 'right')
        s.ai.wanderT = rand(0.8, 1.8)
      }
      const toTarget = Math.atan2(s.ai.target.y - s.ai.y, s.ai.target.x - s.ai.x)
      const moved = clampToArenaHalf(s.ai.x + Math.cos(toTarget) * aiSpeed * dt, s.ai.y + Math.sin(toTarget) * aiSpeed * dt, 'right')
      s.ai.x = moved.x
      s.ai.y = moved.y

      // AI throw cadence with telegraph — faster and less predictable now
      s.ai.throwCd -= dt
      if (s.ai.throwCd <= 0) {
        s.ai.throwCd = rand(0.9, 1.7) / s.mult.speed
        const tx = s.playerFlame.x + rand(-18, 18)
        const ty = s.playerFlame.y + rand(-18, 18)
        s.telegraphs.push({ x: tx, y: ty, t: 0.4 })
      }

      // resolve telegraphs -> spawn AI balloons
      for (let i = s.telegraphs.length - 1; i >= 0; i--) {
        const tg = s.telegraphs[i]
        tg.t -= dt
        if (tg.t <= 0) {
          s.balloons.push({
            x: s.ai.x,
            y: s.ai.y,
            tx: tg.x,
            ty: tg.y,
            t: 0,
            duration: dist(s.ai, { x: tg.x, y: tg.y }) / (420 * s.mult.speed),
            from: 'ai',
          })
          s.telegraphs.splice(i, 1)
        }
      }

      // update balloons
      for (let i = s.balloons.length - 1; i >= 0; i--) {
        const b = s.balloons[i]
        b.t += dt
        const p = clamp(b.t / b.duration, 0, 1)
        b.cx = b.x + (b.tx - b.x) * p
        b.cy = b.y + (b.ty - b.y) * p
        if (p >= 1) {
          if (b.from === 'ai') {
            // does it hit the player (blocked) or the flame?
            if (dist(s.player, { x: b.tx, y: b.ty }) < 26) {
              spawnBurst(s.particles, b.tx, b.ty, '#67e8f9', 10)
              spawnFloatingText(s.floatingText, b.tx, b.ty - 20, 'DODGED!', '#7dd3fc', 15)
            } else {
              s.playerFlame.health = Math.max(0, s.playerFlame.health - 1)
              spawnBurst(s.particles, s.playerFlame.x, s.playerFlame.y, '#ff7a3d', 14)
              spawnFloatingText(s.floatingText, s.playerFlame.x, s.playerFlame.y - 30, '-1 🔥', '#ff7a3d', 18)
              triggerShake(s.shake, 0.3)
              setHp((h) => ({ ...h, player: s.playerFlame.health }))
            }
          } else if (dist(s.aiFlame, { x: b.tx, y: b.ty }) < 30) {
            s.aiFlame.health = Math.max(0, s.aiFlame.health - 1)
            spawnBurst(s.particles, s.aiFlame.x, s.aiFlame.y, '#43cc86', 14)
            spawnFloatingText(s.floatingText, s.aiFlame.x, s.aiFlame.y - 30, 'HIT! -1 🔥', '#43cc86', 18)
            triggerShake(s.shake, 0.3)
            setHp((h) => ({ ...h, ai: s.aiFlame.health }))
          } else {
            spawnBurst(s.particles, b.tx, b.ty, '#7dd3fc', 8)
          }
          s.balloons.splice(i, 1)
        }
      }

      if (s.playerFlame.health <= 0) setPhase('lost')
      if (s.aiFlame.health <= 0) winGame()

      hudAccum.current += dt
      if (hudAccum.current > 0.15) {
        hudAccum.current = 0
        setTimeLeft(Math.ceil(s.timeLeft))
      }
    }

    // --- draw ---
    ctx.clearRect(0, 0, width, height)
    const shakeOffset = updateShake(s.shake, dt)
    ctx.save()
    ctx.translate(shakeOffset.x, shakeOffset.y)
    ctx.fillStyle = '#06140d'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.beginPath()
    ctx.arc(CENTER.x, CENTER.y, RADIUS, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = '#0b1f14'
    ctx.fillRect(0, 0, CENTER.x, H)
    ctx.fillStyle = '#1a0f08'
    ctx.fillRect(CENTER.x, 0, W - CENTER.x, H)
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(CENTER.x, CENTER.y, RADIUS, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.moveTo(CENTER.x, CENTER.y - RADIUS)
    ctx.lineTo(CENTER.x, CENTER.y + RADIUS)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()

    // flame stacks (health as flame emoji count)
    drawEmoji(ctx, '🪵', s.playerFlame.x, s.playerFlame.y + 30, 22)
    for (let i = 0; i < s.playerFlame.health; i++) drawEmoji(ctx, '🔥', s.playerFlame.x, s.playerFlame.y - i * 16, 26)
    drawEmoji(ctx, '🪵', s.aiFlame.x, s.aiFlame.y + 30, 22)
    for (let i = 0; i < s.aiFlame.health; i++) drawEmoji(ctx, '🔥', s.aiFlame.x, s.aiFlame.y - i * 16, 26)

    // telegraph reticles
    for (const tg of s.telegraphs) {
      ctx.save()
      ctx.strokeStyle = 'rgba(249,88,26,0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(tg.x, tg.y, 16, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // balloons
    for (const b of s.balloons) drawEmoji(ctx, '💧', b.cx ?? b.x, b.cy ?? b.y, 20)

    // characters
    drawEmoji(ctx, '🧍', s.ai.x, s.ai.y, 30)
    drawEmoji(ctx, '🧑‍🚒', s.player.x, s.player.y, 30)

    updateAndDrawParticles(ctx, s.particles, dt)
    updateAndDrawFloatingText(ctx, s.floatingText, dt)
    ctx.restore()
  }, true)

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <div
          className="absolute inset-0 z-10 cursor-crosshair"
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse') handlePointer(e)
          }}
          onClick={handlePointer}
        />
        <HUD
          left={[`🔥 You: ${hp.player}`]}
          right={[`🔥 AI: ${hp.ai}`, `⏱ ${timeLeft}s`]}
        />
        <VirtualJoystick dirRef={joyRef} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🔥"
          title="Flame Battlers"
          subtitle="Douse the enemy flame before yours burns out!"
          buttonLabel="Start"
          onAction={start}
        >
          <RankProgress rank={rank} nextRank={nextRank} winsToNext={winsToNext} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🏆"
          title="Flame extinguished!"
          subtitle="Your squad doused the enemy fire first."
          buttonLabel="Play again"
          onAction={start}
        >
          <RankUpBanner rank={rankUp} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'lost'}
          emoji="💧"
          title="Your flame went out"
          subtitle="The AI got you first this time."
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50">Move to dodge · tap/click to throw a balloon</p>
    </div>
  )
}
