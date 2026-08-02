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
const START = { x: 60, y: H / 2 }
const TARGET = { x: W - 90, y: H / 2 }
const PLAYER_SPEED = 200
const ROUND_SECONDS = 45
const CATCH_R = 46
const TOTAL_DIST = dist(START, TARGET)

function freshState(mult) {
  return {
    mult,
    player: { x: START.x, y: START.y },
    counselor: { watching: false, warn: false, t: rand(1.3, 2.2) / mult.speed },
    particles: [],
    floatingText: [],
    shake: { trauma: 0 },
    busts: 0,
    caughtFlash: 0,
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
  }
}

export default function PrankWarsGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const { getDirection } = useKeyboard()
  const joyRef = useRef({ x: 0, y: 0 })
  const { rank, nextRank, winsToNext, recordWin } = useRank()
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))

  const [phase, setPhase] = useState('ready')
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [rankUp, setRankUp] = useState(null)
  const hudAccum = useRef(0)

  const start = () => {
    setRankUp(null)
    const mult = { speed: rank.speedMult, time: rank.timeMult }
    stateRef.current = freshState(mult)
    setTimeLeft(stateRef.current.timeLeft)
    setPhase('playing')
  }

  useGameLoop((dt) => {
    const s = stateRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (phase === 'playing') {
      s.timeLeft -= dt
      if (s.timeLeft <= 0) {
        s.timeLeft = 0
        setPhase('lost')
      }
      if (s.caughtFlash > 0) s.caughtFlash -= dt

      // counselor look cycle: looking away -> warn -> watching
      const c = s.counselor
      c.t -= dt
      if (!c.watching && !c.warn && c.t <= 0.5 && c.t > 0) {
        c.warn = true
      }
      if (c.t <= 0) {
        if (c.watching) {
          c.watching = false
          c.warn = false
          c.t = rand(1.3, 2.4) / s.mult.speed
        } else {
          c.watching = true
          c.warn = false
          c.t = rand(1.4, 2.6) * s.mult.speed
        }
      }

      const kd = getDirection()
      const dx = kd.x !== 0 || kd.y !== 0 ? kd.x : joyRef.current.x
      const dy = kd.x !== 0 || kd.y !== 0 ? kd.y : joyRef.current.y
      const moving = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05

      if (moving && c.watching) {
        spawnBurst(s.particles, s.player.x, s.player.y, '#ff7a3d', 16)
        triggerShake(s.shake, 0.4)
        s.busts += 1
        spawnFloatingText(s.floatingText, s.player.x, s.player.y - 26, 'BUSTED! BACK TO START', '#ff7a3d', 16)
        s.player.x = START.x
        s.player.y = START.y
        s.caughtFlash = 0.8
      } else {
        s.player.x = clamp(s.player.x + dx * PLAYER_SPEED * dt, 20, W - 20)
        s.player.y = clamp(s.player.y + dy * PLAYER_SPEED * dt, 20, H - 20)
      }

      if (dist(s.player, TARGET) < CATCH_R) {
        setPhase('won')
        const result = recordWin()
        if (result.rankedUp) setRankUp(result.newRank)
      }

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
    ctx.fillStyle = '#0b1f14'
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 0.35
    ;[[50, 50], [750, 440], [80, 440], [720, 60]].forEach(([x, y]) => drawEmoji(ctx, '🌲', x, y, 30))
    ctx.globalAlpha = 1

    const c = stateRef.current.counselor
    drawEmoji(ctx, c.watching ? '🧑‍🏫' : '🙈', TARGET.x, TARGET.y, 40)
    if (c.warn) {
      ctx.save()
      ctx.font = '20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('👀', TARGET.x, TARGET.y - 40)
      ctx.restore()
    }
    ctx.save()
    ctx.strokeStyle = c.watching ? 'rgba(249,88,26,0.5)' : 'rgba(30,176,108,0.35)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(TARGET.x, TARGET.y, CATCH_R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    ctx.save()
    if (stateRef.current.caughtFlash > 0) ctx.globalAlpha = 0.4
    drawEmoji(ctx, '🧒', stateRef.current.player.x, stateRef.current.player.y, 30)
    ctx.restore()

    updateAndDrawParticles(ctx, stateRef.current.particles, dt)
    updateAndDrawFloatingText(ctx, stateRef.current.floatingText, dt)
    ctx.restore()
  }, true)

  const progressPct = Math.round(clamp((1 - dist(stateRef.current.player, TARGET) / TOTAL_DIST) * 100, 0, 100))

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <HUD
          left={[stateRef.current.counselor?.watching ? '👀 Freeze!' : '✅ Clear to move', `📏 ${progressPct}% there`]}
          right={[`⏱ ${timeLeft}s`]}
        />
        <VirtualJoystick dirRef={joyRef} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🪣"
          title="Prank Wars"
          subtitle="Sneak up on the counselor without being spotted moving!"
          buttonLabel="Start"
          onAction={start}
        >
          <RankProgress rank={rank} nextRank={nextRank} winsToNext={winsToNext} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🎉"
          title="Prank landed!"
          subtitle={`You pulled it off with ${timeLeft}s to spare.`}
          buttonLabel="Play again"
          onAction={start}
        >
          <RankUpBanner rank={rankUp} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'lost'}
          emoji="⏰"
          title="Time's up!"
          subtitle="Better luck sneaking up next time."
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50">Move with WASD or arrow keys — freeze when they're watching</p>
    </div>
  )
}
