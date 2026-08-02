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
import { clamp, drawEmoji, spawnBurst, updateAndDrawParticles } from './engine/utils.js'

const W = 800
const H = 500
const START_Y = 460
const GOAL_Y = 45
const PLAYER_SPEED = 210
const ROUND_SECONDS = 60
const START_LIVES = 3
const TARGET_CROSSINGS = 5

const LANES = [140, 210, 280, 350, 420].map((y, i) => ({
  y,
  dir: i % 2 === 0 ? 1 : -1,
  baseSpeed: 90 + i * 12,
}))

function freshState(mult) {
  return {
    mult,
    player: { x: W / 2, y: START_Y, invuln: 0 },
    sharks: LANES.flatMap((lane, i) => [
      { x: (i * 180) % W, y: lane.y, dir: lane.dir, speed: lane.baseSpeed * mult.speed },
      { x: (i * 180 + 380) % W, y: lane.y, dir: lane.dir, speed: lane.baseSpeed * mult.speed },
    ]),
    particles: [],
    crossings: 0,
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
  }
}

export default function SharksMinnowsGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const { getDirection } = useKeyboard()
  const joyRef = useRef({ x: 0, y: 0 })
  const [rank, setRank, ranks] = useRank()
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))

  const [phase, setPhase] = useState('ready')
  const [lives, setLives] = useState(START_LIVES)
  const [crossings, setCrossings] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const hudAccum = useRef(0)

  const start = () => {
    const mult = { speed: rank.speedMult, time: rank.timeMult }
    stateRef.current = freshState(mult)
    setLives(START_LIVES)
    setCrossings(0)
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
        setPhase(s.crossings >= TARGET_CROSSINGS ? 'won' : 'lost')
      }

      const kd = getDirection()
      const dx = kd.x !== 0 || kd.y !== 0 ? kd.x : joyRef.current.x
      const dy = kd.x !== 0 || kd.y !== 0 ? kd.y : joyRef.current.y
      s.player.x = clamp(s.player.x + dx * PLAYER_SPEED * dt, 20, W - 20)
      s.player.y = clamp(s.player.y + dy * PLAYER_SPEED * dt, GOAL_Y - 10, START_Y + 10)
      if (s.player.invuln > 0) s.player.invuln -= dt

      // sharks patrol their lane, bouncing at edges
      for (const shark of s.sharks) {
        shark.x += shark.dir * shark.speed * dt
        if (shark.x < 30) shark.dir = 1
        if (shark.x > W - 30) shark.dir = -1

        if (
          s.player.invuln <= 0 &&
          Math.abs(shark.x - s.player.x) < 26 &&
          Math.abs(shark.y - s.player.y) < 22
        ) {
          spawnBurst(s.particles, s.player.x, s.player.y, '#ff7a3d', 16)
          s.player.x = W / 2
          s.player.y = START_Y
          s.player.invuln = 1.2
          setLives((l) => {
            const next = l - 1
            if (next <= 0) setPhase('caught')
            return next
          })
        }
      }

      // reached the far shore
      if (s.player.y <= GOAL_Y) {
        s.crossings += 1
        spawnBurst(s.particles, s.player.x, s.player.y, '#43cc86', 16)
        s.player.x = W / 2
        s.player.y = START_Y
        s.player.invuln = 0.6
        setCrossings(s.crossings)
        if (s.crossings >= TARGET_CROSSINGS) setPhase('won')
      }

      hudAccum.current += dt
      if (hudAccum.current > 0.15) {
        hudAccum.current = 0
        setTimeLeft(Math.ceil(s.timeLeft))
      }
    }

    // --- draw ---
    ctx.clearRect(0, 0, width, height)
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#0c2a3a')
    g.addColorStop(1, '#0b1f14')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    // shore bands
    ctx.fillStyle = 'rgba(67, 204, 134, 0.15)'
    ctx.fillRect(0, GOAL_Y - 25, W, 30)
    ctx.fillRect(0, START_Y + 20, W, 30)

    for (const shark of s.sharks) drawEmoji(ctx, shark.dir > 0 ? '🦈' : '🦈', shark.x, shark.y, 30)
    ctx.save()
    if (s.player.invuln > 0) ctx.globalAlpha = 0.5
    drawEmoji(ctx, '🐟', s.player.x, s.player.y, 26)
    ctx.restore()

    updateAndDrawParticles(ctx, s.particles, dt)
  }, true)

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <HUD left={[`🏁 Crossings: ${crossings}/${TARGET_CROSSINGS}`, `❤️ ${lives}`]} right={[`⏱ ${timeLeft}s`]} />
        <VirtualJoystick dirRef={joyRef} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🦈"
          title="Sharks & Minnows"
          subtitle={`Swim from the bottom shore to the top without getting caught by a shark. Reach ${TARGET_CROSSINGS} crossings before time runs out. WASD/arrows or joystick to move.`}
          buttonLabel="Start"
          onAction={start}
        >
          <RankSelector ranks={ranks} value={rank} onChange={setRank} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🏆"
          title="Minnow Champion!"
          subtitle={`You made it across ${crossings} times.`}
          buttonLabel="Play again"
          onAction={start}
        />
        <GameOverlay
          show={phase === 'lost'}
          emoji="⏰"
          title="Time's up!"
          subtitle={`You crossed ${crossings} of ${TARGET_CROSSINGS} times.`}
          buttonLabel="Try again"
          onAction={start}
        />
        <GameOverlay
          show={phase === 'caught'}
          emoji="🦈"
          title="Caught!"
          subtitle={`The sharks got you after ${crossings} crossings.`}
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50">Move with WASD or arrow keys</p>
    </div>
  )
}
