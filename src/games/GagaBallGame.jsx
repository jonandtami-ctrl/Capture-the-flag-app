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
import { clamp, dist, rand, steer, drawEmoji, spawnBurst, updateAndDrawParticles } from './engine/utils.js'

const W = 800
const H = 500
const PIT = { left: 80, right: W - 80, top: 60, bottom: H - 60 }
const PLAYER_SPEED = 230
const SAFE_SPEED = 60
const ROUND_SECONDS = 60

function freshState(mult) {
  return {
    mult,
    player: { id: 'player', x: W / 2, y: H - 140, vx: 0, vy: 0, hitCd: 0 },
    bots: [
      { id: 'b1', x: W / 2 - 160, y: H / 2, vx: 0, vy: 0, hitCd: 0, think: 0 },
      { id: 'b2', x: W / 2 + 160, y: H / 2, vx: 0, vy: 0, hitCd: 0, think: 0 },
      { id: 'b3', x: W / 2, y: 130, vx: 0, vy: 0, hitCd: 0, think: 0 },
    ],
    ball: { x: W / 2, y: H / 2, vx: 140, vy: 90 },
    lastHitter: null,
    grace: 0,
    stallT: 0,
    particles: [],
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
  }
}

function bounceInPit(e, r = 16) {
  if (e.x < PIT.left + r) { e.x = PIT.left + r; e.vx = Math.abs(e.vx) }
  if (e.x > PIT.right - r) { e.x = PIT.right - r; e.vx = -Math.abs(e.vx) }
  if (e.y < PIT.top + r) { e.y = PIT.top + r; e.vy = Math.abs(e.vy) }
  if (e.y > PIT.bottom - r) { e.y = PIT.bottom - r; e.vy = -Math.abs(e.vy) }
}

export default function GagaBallGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const { getDirection } = useKeyboard()
  const joyRef = useRef({ x: 0, y: 0 })
  const [rank, setRank, ranks] = useRank()
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))

  const [phase, setPhase] = useState('ready')
  const [botsLeft, setBotsLeft] = useState(3)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const hudAccum = useRef(0)

  const start = () => {
    const mult = { speed: rank.speedMult, time: rank.timeMult }
    stateRef.current = freshState(mult)
    setBotsLeft(3)
    setTimeLeft(stateRef.current.timeLeft)
    setPhase('playing')
  }

  const redirectBall = (s, hitter) => {
    const speed = Math.max(260, Math.hypot(hitter.vx, hitter.vy) * 1.4, Math.hypot(s.ball.vx, s.ball.vy) * 1.1)
    const dx = s.ball.x - hitter.x || rand(-1, 1)
    const dy = s.ball.y - hitter.y || rand(-1, 1)
    const d = Math.hypot(dx, dy) || 1
    s.ball.vx = (dx / d) * speed
    s.ball.vy = (dy / d) * speed
    s.lastHitter = hitter.id
    s.grace = 0.35
    s.stallT = 0
  }

  useGameLoop((dt) => {
    const s = stateRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (phase === 'playing') {
      s.timeLeft -= dt
      if (s.timeLeft <= 0) {
        s.timeLeft = 0
        setPhase('won')
      }
      if (s.grace > 0) s.grace -= dt

      // player
      const kd = getDirection()
      const dx = kd.x !== 0 || kd.y !== 0 ? kd.x : joyRef.current.x
      const dy = kd.x !== 0 || kd.y !== 0 ? kd.y : joyRef.current.y
      s.player.vx = dx * PLAYER_SPEED
      s.player.vy = dy * PLAYER_SPEED
      s.player.x += s.player.vx * dt
      s.player.y += s.player.vy * dt
      bounceInPit(s.player)

      // bots: chase the ball
      for (const bot of s.bots) {
        steer(bot, s.ball, 150 * s.mult.speed)
        bot.x += bot.vx * dt
        bot.y += bot.vy * dt
        bounceInPit(bot)
      }

      // ball physics
      s.ball.x += s.ball.vx * dt
      s.ball.y += s.ball.vy * dt
      s.ball.vx *= 0.995
      s.ball.vy *= 0.995
      if (s.ball.x < PIT.left + 10) { s.ball.x = PIT.left + 10; s.ball.vx = Math.abs(s.ball.vx) }
      if (s.ball.x > PIT.right - 10) { s.ball.x = PIT.right - 10; s.ball.vx = -Math.abs(s.ball.vx) }
      if (s.ball.y < PIT.top + 10) { s.ball.y = PIT.top + 10; s.ball.vy = Math.abs(s.ball.vy) }
      if (s.ball.y > PIT.bottom - 10) { s.ball.y = PIT.bottom - 10; s.ball.vy = -Math.abs(s.ball.vy) }

      const ballSpeed = Math.hypot(s.ball.vx, s.ball.vy)
      if (ballSpeed < SAFE_SPEED) {
        s.stallT += dt
        if (s.stallT > 2.5) {
          s.ball.vx = rand(-160, 160)
          s.ball.vy = rand(-160, 160)
          s.lastHitter = null
          s.stallT = 0
        }
      }

      const entities = [s.player, ...s.bots]
      for (const e of entities) {
        if (dist(e, s.ball) > 24) continue
        const isHitter = s.lastHitter === e.id && s.grace > 0
        if (isHitter) continue

        if (ballSpeed > SAFE_SPEED && s.lastHitter && s.lastHitter !== e.id) {
          // eliminated
          spawnBurst(s.particles, e.x, e.y, e.id === 'player' ? '#ff7a3d' : '#43cc86', 16)
          if (e.id === 'player') {
            setPhase('lost')
          } else {
            s.bots = s.bots.filter((b) => b.id !== e.id)
            setBotsLeft(s.bots.length)
            if (s.bots.length === 0) setPhase('won')
          }
        } else {
          // redirect (a "hit")
          redirectBall(s, e)
        }
      }

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

    ctx.save()
    ctx.strokeStyle = 'rgba(249,88,26,0.4)'
    ctx.lineWidth = 4
    ctx.strokeRect(PIT.left, PIT.top, PIT.right - PIT.left, PIT.bottom - PIT.top)
    ctx.restore()

    for (const bot of s.bots) drawEmoji(ctx, '🧑', bot.x, bot.y, 28)
    drawEmoji(ctx, '🏐', s.ball.x, s.ball.y, 24)
    drawEmoji(ctx, '🧑‍🦱', s.player.x, s.player.y, 30)

    updateAndDrawParticles(ctx, s.particles, dt)
  }, true)

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <HUD left={[`🏐 Opponents left: ${botsLeft}`]} right={[`⏱ ${timeLeft}s`]} />
        <VirtualJoystick dirRef={joyRef} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🏐"
          title="Gaga Ball"
          subtitle="Move into the ball to swat it toward an opponent. If the ball you didn't just hit touches you, you're out. Last one standing wins!"
          buttonLabel="Start"
          onAction={start}
        >
          <RankSelector ranks={ranks} value={rank} onChange={setRank} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🏆"
          title="Last one standing!"
          subtitle="You cleared the pit."
          buttonLabel="Play again"
          onAction={start}
        />
        <GameOverlay
          show={phase === 'lost'}
          emoji="💥"
          title="You're out!"
          subtitle={`You lasted with ${botsLeft} opponents still in the pit.`}
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50">Move with WASD or arrow keys — bump the ball to hit it</p>
    </div>
  )
}
