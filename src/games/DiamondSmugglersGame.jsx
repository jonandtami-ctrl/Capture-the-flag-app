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
const START = { x: 60, y: H - 60 }
const BUYER = { x: W - 60, y: 60 }
const POLICE = { x: W / 2, y: H / 2 }
const CONE_RANGE = 280
const CONE_HALF_WIDTH = 0.42 // radians
const PLAYER_SPEED = 200
const ROUND_SECONDS = 45
const TOTAL_DIST = dist(START, BUYER)

function freshState(mult) {
  return {
    mult,
    player: { x: START.x, y: START.y },
    coneAngle: 0,
    coneDir: 1,
    particles: [],
    floatingText: [],
    shake: { trauma: 0 },
    caughtFlash: 0,
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
    t: 0,
  }
}

function angleDiff(a, b) {
  let d = Math.abs(a - b) % (Math.PI * 2)
  if (d > Math.PI) d = Math.PI * 2 - d
  return d
}

export default function DiamondSmugglersGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const { getDirection } = useKeyboard()
  const joyRef = useRef({ x: 0, y: 0 })
  const { rank, nextRank, winsToNext, recordWin, allRanks, unlockedRanks, selectedRank, selectRank } = useRank()
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))

  const [phase, setPhase] = useState('ready')
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [rankUp, setRankUp] = useState(null)
  const hudAccum = useRef(0)

  const start = () => {
    setRankUp(null)
    const mult = { speed: selectedRank.speedMult, time: selectedRank.timeMult }
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
      s.t += dt
      if (s.timeLeft <= 0) {
        s.timeLeft = 0
        setPhase('lost')
      }
      if (s.caughtFlash > 0) s.caughtFlash -= dt

      // sweeping searchlight cone
      s.coneAngle = Math.sin(s.t * 0.82 * s.mult.speed) * Math.PI * 0.9

      const kd = getDirection()
      const dx = kd.x !== 0 || kd.y !== 0 ? kd.x : joyRef.current.x
      const dy = kd.x !== 0 || kd.y !== 0 ? kd.y : joyRef.current.y
      const nx = clamp(s.player.x + dx * PLAYER_SPEED * dt, 20, W - 20)
      const ny = clamp(s.player.y + dy * PLAYER_SPEED * dt, 20, H - 20)

      const toPlayer = Math.atan2(ny - POLICE.y, nx - POLICE.x)
      const inCone = dist({ x: nx, y: ny }, POLICE) < CONE_RANGE && angleDiff(toPlayer, s.coneAngle) < CONE_HALF_WIDTH

      if (inCone) {
        spawnBurst(s.particles, s.player.x, s.player.y, '#ff7a3d', 16)
        triggerShake(s.shake, 0.4)
        spawnFloatingText(s.floatingText, s.player.x, s.player.y - 26, 'SPOTTED! BACK TO START', '#ff7a3d', 16)
        s.player.x = START.x
        s.player.y = START.y
        s.caughtFlash = 0.8
      } else {
        s.player.x = nx
        s.player.y = ny
      }

      if (dist(s.player, BUYER) < 40) {
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
    ctx.fillStyle = '#150c1a'
    ctx.fillRect(0, 0, W, H)

    // dance floor tiles
    for (let x = 0; x < W; x += 50) {
      for (let y = 0; y < H; y += 50) {
        ctx.fillStyle = (x / 50 + y / 50) % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)'
        ctx.fillRect(x, y, 50, 50)
      }
    }

    // vision cone
    ctx.save()
    ctx.fillStyle = 'rgba(249,88,26,0.18)'
    ctx.beginPath()
    ctx.moveTo(POLICE.x, POLICE.y)
    ctx.arc(POLICE.x, POLICE.y, CONE_RANGE, s.coneAngle - CONE_HALF_WIDTH, s.coneAngle + CONE_HALF_WIDTH)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    drawEmoji(ctx, '🤝', BUYER.x, BUYER.y, 32)
    drawEmoji(ctx, '👮', POLICE.x, POLICE.y, 32)
    ctx.save()
    if (s.caughtFlash > 0) ctx.globalAlpha = 0.4
    drawEmoji(ctx, '🕺', s.player.x, s.player.y, 30)
    ctx.restore()

    updateAndDrawParticles(ctx, s.particles, dt)
    updateAndDrawFloatingText(ctx, s.floatingText, dt)
    ctx.restore()
  }, true)

  const progressPct = Math.round(clamp((1 - dist(stateRef.current.player, BUYER) / TOTAL_DIST) * 100, 0, 100))

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <HUD left={['💎 Reach the buyer', `📏 ${progressPct}% there`]} right={[`⏱ ${timeLeft}s`]} />
        <VirtualJoystick dirRef={joyRef} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="💎"
          title="Diamond Smugglers"
          subtitle="Cross the floor and reach the buyer without getting caught!"
          buttonLabel="Start"
          onAction={start}
        >
          <RankProgress rank={rank} nextRank={nextRank} winsToNext={winsToNext} allRanks={allRanks} unlockedRanks={unlockedRanks} selectedRank={selectedRank} onSelect={selectRank} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🏆"
          title="Trade complete!"
          subtitle={`You made it with ${timeLeft}s to spare.`}
          buttonLabel="Play again"
          onAction={start}
        >
          <RankUpBanner rank={rankUp} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'lost'}
          emoji="🚨"
          title="Time's up!"
          subtitle="The police shut down the dance floor before you made the trade."
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50">Move with WASD or arrow keys — avoid the orange searchlight</p>
    </div>
  )
}
