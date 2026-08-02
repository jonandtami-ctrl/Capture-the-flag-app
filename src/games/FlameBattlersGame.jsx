import { useRef, useState } from 'react'
import useCanvasSize from './engine/useCanvasSize.js'
import useKeyboard from './engine/useKeyboard.js'
import useGameLoop from './engine/useGameLoop.js'
import GameFrame from './engine/GameFrame.jsx'
import HUD from './engine/HUD.jsx'
import GameOverlay from './engine/GameOverlay.jsx'
import VirtualJoystick from './engine/VirtualJoystick.jsx'
import RankSelector from './engine/RankSelector.jsx'
import useRank from '../lib/useRank.js'
import { clamp, dist, rand, drawEmoji, spawnBurst, updateAndDrawParticles } from './engine/utils.js'

const W = 800
const H = 500
const SPEED = 220
const ROUND_SECONDS = 75
const START_HEALTH = 5

function freshState(mult) {
  return {
    mult,
    player: { x: 130, y: H / 2 },
    ai: { x: W - 130, y: H / 2, vy: rand(-60, 60), throwCd: rand(0.8, 1.6) / mult.speed },
    playerFlame: { x: 60, y: H / 2, health: START_HEALTH },
    aiFlame: { x: W - 60, y: H / 2, health: START_HEALTH },
    balloons: [], // {x,y,tx,ty,speed,from:'player'|'ai'}
    telegraphs: [], // {x,y,t}
    particles: [],
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
  }
}

export default function FlameBattlersGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const { getDirection } = useKeyboard()
  const joyRef = useRef({ x: 0, y: 0 })
  const [rank, setRank, ranks] = useRank()
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))

  const [phase, setPhase] = useState('ready')
  const [hp, setHp] = useState({ player: START_HEALTH, ai: START_HEALTH })
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const hudAccum = useRef(0)

  const start = () => {
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
        setPhase(s.playerFlame.health >= s.aiFlame.health ? 'won' : 'lost')
      }

      // player movement
      const kd = getDirection()
      const dx = kd.x !== 0 || kd.y !== 0 ? kd.x : joyRef.current.x
      const dy = kd.x !== 0 || kd.y !== 0 ? kd.y : joyRef.current.y
      s.player.x = clamp(s.player.x + dx * SPEED * dt, 20, W / 2 - 30)
      s.player.y = clamp(s.player.y + dy * SPEED * dt, 30, H - 30)

      // AI wander
      s.ai.y = clamp(s.ai.y + s.ai.vy * dt, 40, H - 40)
      if (s.ai.y <= 40 || s.ai.y >= H - 40) s.ai.vy *= -1
      if (Math.random() < 0.01) s.ai.vy = rand(-70, 70)

      // AI throw cadence with telegraph
      s.ai.throwCd -= dt
      if (s.ai.throwCd <= 0) {
        s.ai.throwCd = rand(1.2, 2.2) / s.mult.speed
        const tx = s.playerFlame.x + rand(-14, 14)
        const ty = s.playerFlame.y + rand(-14, 14)
        s.telegraphs.push({ x: tx, y: ty, t: 0.45 })
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
            duration: dist(s.ai, { x: tg.x, y: tg.y }) / 380,
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
            } else {
              s.playerFlame.health = Math.max(0, s.playerFlame.health - 1)
              spawnBurst(s.particles, s.playerFlame.x, s.playerFlame.y, '#ff7a3d', 14)
              setHp((h) => ({ ...h, player: s.playerFlame.health }))
            }
          } else if (dist(s.aiFlame, { x: b.tx, y: b.ty }) < 30) {
            s.aiFlame.health = Math.max(0, s.aiFlame.health - 1)
            spawnBurst(s.particles, s.aiFlame.x, s.aiFlame.y, '#43cc86', 14)
            setHp((h) => ({ ...h, ai: s.aiFlame.health }))
          } else {
            spawnBurst(s.particles, b.tx, b.ty, '#7dd3fc', 8)
          }
          s.balloons.splice(i, 1)
        }
      }

      if (s.playerFlame.health <= 0) setPhase('lost')
      if (s.aiFlame.health <= 0) setPhase('won')

      hudAccum.current += dt
      if (hudAccum.current > 0.15) {
        hudAccum.current = 0
        setTimeLeft(Math.ceil(s.timeLeft))
      }
    }

    // --- draw ---
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#0b1f14'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.moveTo(W / 2, 0)
    ctx.lineTo(W / 2, H)
    ctx.stroke()
    ctx.setLineDash([])

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
          subtitle="Move with WASD/joystick to dodge, and tap/click anywhere to throw a water balloon at the enemy flame. Watch for the AI's targeting reticle on your own flame — stand in front of it to block the hit!"
          buttonLabel="Start"
          onAction={start}
        >
          <RankSelector ranks={ranks} value={rank} onChange={setRank} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🏆"
          title="Flame extinguished!"
          subtitle="Your squad doused the enemy fire first."
          buttonLabel="Play again"
          onAction={start}
        />
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
