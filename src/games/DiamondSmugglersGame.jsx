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
const PLAYER_START = { x: 70, y: H - 60 }
const BUYER = { x: W - 70, y: 60 }
const PLAYER_SPEED = 210
const ROUND_SECONDS = 60
const TARGET_DELIVERIES = 5
const PICKUP_R = 30
const DELIVER_R = 40
const COMBO_WINDOW = 5

// Fixed searchlight posts around the floor. Only the first is active at the
// start — more come online as you land deliveries, so the floor gets
// genuinely more dangerous the better you're doing.
const POLICE_POSTS = [
  { x: W * 0.36, y: H * 0.4, speed: 0.85, phase: 0 },
  { x: W * 0.64, y: H * 0.62, speed: 0.7, phase: 2.1 },
  { x: W * 0.5, y: H * 0.22, speed: 1.05, phase: 4.4 },
]
const CONE_RANGE = 230
const CONE_HALF_WIDTH = 0.42

function angleDiff(a, b) {
  let d = Math.abs(a - b) % (Math.PI * 2)
  if (d > Math.PI) d = Math.PI * 2 - d
  return d
}

function activeCount(delivered) {
  if (delivered >= 3) return 3
  if (delivered >= 1) return 2
  return 1
}

// Deterministic-enough diamond placement — cap the retry loop so a bad RNG
// streak can never hang the frame, just settle for a slightly-too-close spot.
function spawnDiamond() {
  let x = W / 2
  let y = H / 2
  for (let i = 0; i < 20; i++) {
    x = rand(60, W - 60)
    y = rand(60, H - 60)
    if (dist({ x, y }, BUYER) > 100 && dist({ x, y }, PLAYER_START) > 80) break
  }
  return { x, y }
}

function freshState(mult) {
  return {
    mult,
    player: { x: PLAYER_START.x, y: PLAYER_START.y, carrying: false },
    diamond: spawnDiamond(),
    delivered: 0,
    combo: 0,
    lastDeliverAt: -99,
    clock: 0,
    police: POLICE_POSTS.map((p) => ({ ...p, coneAngle: 0 })),
    particles: [],
    floatingText: [],
    shake: { trauma: 0 },
    caughtFlash: 0,
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
  }
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
  const [delivered, setDelivered] = useState(0)
  const [carrying, setCarrying] = useState(false)
  const [rankUp, setRankUp] = useState(null)
  const hudAccum = useRef(0)

  const start = () => {
    setRankUp(null)
    const mult = { speed: selectedRank.speedMult, time: selectedRank.timeMult }
    stateRef.current = freshState(mult)
    setTimeLeft(stateRef.current.timeLeft)
    setDelivered(0)
    setCarrying(false)
    setPhase('playing')
  }

  useGameLoop((dt) => {
    const s = stateRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (phase === 'playing') {
      s.timeLeft -= dt
      s.clock += dt
      if (s.timeLeft <= 0) {
        s.timeLeft = 0
        setPhase('lost')
      }
      if (s.caughtFlash > 0) s.caughtFlash -= dt

      const nActive = activeCount(s.delivered)
      for (let i = 0; i < s.police.length; i++) {
        const p = s.police[i]
        p.coneAngle = Math.sin(s.clock * p.speed * s.mult.speed + p.phase) * Math.PI * 0.9
      }

      const kd = getDirection()
      const dx = kd.x !== 0 || kd.y !== 0 ? kd.x : joyRef.current.x
      const dy = kd.x !== 0 || kd.y !== 0 ? kd.y : joyRef.current.y
      const nx = clamp(s.player.x + dx * PLAYER_SPEED * dt, 20, W - 20)
      const ny = clamp(s.player.y + dy * PLAYER_SPEED * dt, 20, H - 20)

      let caught = false
      for (let i = 0; i < nActive; i++) {
        const p = s.police[i]
        const toPlayer = Math.atan2(ny - p.y, nx - p.x)
        if (dist({ x: nx, y: ny }, p) < CONE_RANGE && angleDiff(toPlayer, p.coneAngle) < CONE_HALF_WIDTH) {
          caught = true
          break
        }
      }

      if (caught) {
        spawnBurst(s.particles, s.player.x, s.player.y, '#ff7a3d', 16)
        triggerShake(s.shake, 0.4)
        if (s.player.carrying) {
          s.diamond = spawnDiamond()
          s.player.carrying = false
          setCarrying(false)
          s.combo = 0
          spawnFloatingText(s.floatingText, s.player.x, s.player.y - 26, 'CAUGHT! DIAMOND DROPPED', '#ff7a3d', 16)
        } else {
          spawnFloatingText(s.floatingText, s.player.x, s.player.y - 26, 'SPOTTED! BACK TO START', '#ff7a3d', 16)
        }
        s.player.x = PLAYER_START.x
        s.player.y = PLAYER_START.y
        s.caughtFlash = 0.8
      } else {
        s.player.x = nx
        s.player.y = ny
      }

      // pick up the diamond on the floor
      if (!s.player.carrying && s.diamond && dist(s.player, s.diamond) < PICKUP_R) {
        s.player.carrying = true
        setCarrying(true)
        s.diamond = null
        spawnBurst(s.particles, s.player.x, s.player.y, '#67e8f9', 10)
        spawnFloatingText(s.floatingText, s.player.x, s.player.y - 26, 'GOT IT! GET TO THE BUYER', '#67e8f9', 16)
      }

      // deliver to the buyer
      if (s.player.carrying && dist(s.player, BUYER) < DELIVER_R) {
        s.combo = s.clock - s.lastDeliverAt < COMBO_WINDOW ? s.combo + 1 : 1
        s.lastDeliverAt = s.clock
        const bonus = s.combo > 1 ? Math.min(s.combo, 4) : 0
        s.timeLeft += bonus
        s.delivered += 1
        setDelivered(s.delivered)
        s.player.carrying = false
        setCarrying(false)
        triggerShake(s.shake, 0.3)
        spawnBurst(s.particles, BUYER.x, BUYER.y, '#43cc86', 18)
        spawnFloatingText(
          s.floatingText,
          BUYER.x,
          BUYER.y - 30,
          s.combo > 1 ? `DEAL x${s.combo}! +${bonus}s` : 'DEAL MADE!',
          '#ffd166',
          s.combo > 1 ? 19 : 17,
        )

        if (s.delivered >= TARGET_DELIVERIES) {
          setPhase('won')
          const result = recordWin()
          if (result.rankedUp) setRankUp(result.newRank)
        } else {
          s.diamond = spawnDiamond()
          if (activeCount(s.delivered) > activeCount(s.delivered - 1)) {
            spawnFloatingText(s.floatingText, W / 2, 40, 'MORE POLICE ON THE FLOOR!', '#ff7a3d', 18)
          }
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

    const nActive = activeCount(s.delivered)

    // vision cones
    for (let i = 0; i < nActive; i++) {
      const p = s.police[i]
      ctx.save()
      ctx.fillStyle = 'rgba(249,88,26,0.18)'
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.arc(p.x, p.y, CONE_RANGE, p.coneAngle - CONE_HALF_WIDTH, p.coneAngle + CONE_HALF_WIDTH)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    drawEmoji(ctx, '🤝', BUYER.x, BUYER.y, 32)
    for (let i = 0; i < nActive; i++) drawEmoji(ctx, '👮', s.police[i].x, s.police[i].y, 32)

    if (s.diamond) {
      ctx.save()
      ctx.globalAlpha = 0.6 + Math.sin(s.clock * 4) * 0.25
      drawEmoji(ctx, '💎', s.diamond.x, s.diamond.y, 26)
      ctx.restore()
    }

    ctx.save()
    if (s.caughtFlash > 0) ctx.globalAlpha = 0.4
    drawEmoji(ctx, s.player.carrying ? '🕺💎' : '🕺', s.player.x, s.player.y, 30)
    ctx.restore()

    updateAndDrawParticles(ctx, s.particles, dt)
    updateAndDrawFloatingText(ctx, s.floatingText, dt)
    ctx.restore()
  }, true)

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <HUD
          left={[`💎 Delivered: ${delivered}/${TARGET_DELIVERIES}`, carrying ? '🕺 Carrying — get to the buyer!' : null].filter(Boolean)}
          right={[`⏱ ${timeLeft}s`]}
        />
        <VirtualJoystick dirRef={joyRef} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="💎"
          title="Diamond Smugglers"
          subtitle={`Grab a diamond, sneak it past the police searchlights, and deal it to the buyer. Land ${TARGET_DELIVERIES} deals before time runs out — more searchlights come online as you go!`}
          buttonLabel="Start"
          onAction={start}
        >
          <RankProgress rank={rank} nextRank={nextRank} winsToNext={winsToNext} allRanks={allRanks} unlockedRanks={unlockedRanks} selectedRank={selectedRank} onSelect={selectRank} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🏆"
          title="All diamonds moved!"
          subtitle={`You closed ${TARGET_DELIVERIES} deals with ${timeLeft}s to spare.`}
          buttonLabel="Play again"
          onAction={start}
        >
          <RankUpBanner rank={rankUp} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'lost'}
          emoji="🚨"
          title="Time's up!"
          subtitle={`The police shut down the floor after ${delivered} of ${TARGET_DELIVERIES} deals.`}
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50">Move with WASD or arrow keys — grab the 💎, avoid the orange searchlights, deal it to 🤝</p>
    </div>
  )
}
