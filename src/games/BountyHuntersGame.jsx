import { useRef, useState } from 'react'
import useCanvasSize from './engine/useCanvasSize.js'
import useKeyboard from './engine/useKeyboard.js'
import useGameLoop from './engine/useGameLoop.js'
import GameFrame from './engine/GameFrame.jsx'
import HUD from './engine/HUD.jsx'
import VirtualJoystick from './engine/VirtualJoystick.jsx'
import GameOverlay from './engine/GameOverlay.jsx'
import RankProgress from './engine/RankProgress.jsx'
import RankUpBanner from './engine/RankUpBanner.jsx'
import PersonalBest from './engine/PersonalBest.jsx'
import useRank from '../lib/useRank.js'
import useRecords from '../lib/useRecords.js'
import {
  clamp,
  dist,
  rand,
  steer,
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
const PLAYER_SPEED = 240
const BOUNTY_SPEED = 165
const ROUND_SECONDS = 45
const CATCH_R = 30
const DETECT_R = 130
// Each catch makes the hunter's reputation (and silhouette) grow, like a
// Snake/Hole.io meter — but here bigger also means louder: bounties clock
// you from further away, so the round gets harder as your streak grows.
const GROWTH_DETECT_STEP = 16
const GROWTH_SIZE_STEP = 5
const MAX_GROWTH_STEPS = 6
const COMBO_WINDOW = 4

const ALIASES = ['The Marshmallow Bandit', 'Sergeant Sasquatch', 'The Bug Juice Outlaw', 'Captain Campfire', 'Doc Poison Ivy']

function freshState(mult) {
  return {
    mult,
    player: { x: W / 2, y: H / 2 },
    bounties: ALIASES.slice(0, 4).map((name) => ({
      name,
      x: rand(60, W - 60),
      y: rand(60, H - 60),
      wanderT: rand(0, 2),
      wanderDir: { x: rand(-1, 1), y: rand(-1, 1) },
    })),
    particles: [],
    floatingText: [],
    shake: { trauma: 0 },
    growth: 0,
    clock: 0,
    lastCatchClock: -99,
    combo: 0,
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
  }
}

export default function BountyHuntersGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const { getDirection } = useKeyboard()
  const joyRef = useRef({ x: 0, y: 0 })
  const { rank, nextRank, winsToNext, recordWin, allRanks, unlockedRanks, selectedRank, selectRank } = useRank()
  const { best, submit } = useRecords('bounty-hunters', true)
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))

  const [phase, setPhase] = useState('ready')
  const [caught, setCaught] = useState(0)
  const total = ALIASES.slice(0, 4).length
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [growth, setGrowth] = useState(0)
  const [rankUp, setRankUp] = useState(null)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const hudAccum = useRef(0)

  const winGame = () => {
    setPhase('won')
    const result = recordWin()
    if (result.rankedUp) setRankUp(result.newRank)
    setIsNewRecord(submit(Math.ceil(stateRef.current.timeLeft)))
  }

  const start = () => {
    setRankUp(null)
    setIsNewRecord(false)
    const mult = { speed: selectedRank.speedMult, time: selectedRank.timeMult }
    stateRef.current = freshState(mult)
    setCaught(0)
    setGrowth(0)
    setTimeLeft(stateRef.current.timeLeft)
    setPhase('playing')
  }

  useGameLoop((dt) => {
    const s = stateRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (phase === 'playing') {
      s.clock += dt
      s.timeLeft -= dt
      if (s.timeLeft <= 0) {
        s.timeLeft = 0
        if (s.bounties.length === 0) winGame()
        else setPhase('lost')
      }

      const growthStep = Math.min(s.growth, MAX_GROWTH_STEPS)
      const effDetectR = DETECT_R + growthStep * GROWTH_DETECT_STEP
      const effCatchR = CATCH_R + growthStep * 2.5

      const kd = getDirection()
      const dx = kd.x !== 0 || kd.y !== 0 ? kd.x : joyRef.current.x
      const dy = kd.x !== 0 || kd.y !== 0 ? kd.y : joyRef.current.y
      s.player.x = clamp(s.player.x + dx * PLAYER_SPEED * dt, 20, W - 20)
      s.player.y = clamp(s.player.y + dy * PLAYER_SPEED * dt, 20, H - 20)

      for (let i = s.bounties.length - 1; i >= 0; i--) {
        const b = s.bounties[i]
        const d = dist(b, s.player)
        if (d < effDetectR) {
          steer(b, s.player, BOUNTY_SPEED * s.mult.speed, true)
        } else {
          b.wanderT -= dt
          if (b.wanderT <= 0) {
            b.wanderDir = { x: rand(-1, 1), y: rand(-1, 1) }
            b.wanderT = rand(1, 2.5)
          }
          b.vx = b.wanderDir.x * BOUNTY_SPEED * s.mult.speed * 0.35
          b.vy = b.wanderDir.y * BOUNTY_SPEED * s.mult.speed * 0.35
        }
        b.x = clamp(b.x + (b.vx ?? 0) * dt, 20, W - 20)
        b.y = clamp(b.y + (b.vy ?? 0) * dt, 20, H - 20)

        if (d < effCatchR) {
          const combo = s.clock - s.lastCatchClock < COMBO_WINDOW ? s.combo + 1 : 1
          s.combo = combo
          s.lastCatchClock = s.clock
          s.growth += 1

          const bonus = combo > 1 ? Math.min(combo, 5) : 0
          s.timeLeft += bonus

          spawnBurst(s.particles, b.x, b.y, '#f9581a', 18)
          triggerShake(s.shake, 0.35)
          spawnFloatingText(s.floatingText, b.x, b.y - 20, combo > 1 ? `COMBO x${combo}! +${bonus}s` : 'GOTCHA!', '#ffd166', combo > 1 ? 18 : 16)

          s.bounties.splice(i, 1)
          setCaught((c) => c + 1)
          if (s.bounties.length === 0) winGame()
        }
      }

      hudAccum.current += dt
      if (hudAccum.current > 0.15) {
        hudAccum.current = 0
        setTimeLeft(Math.ceil(s.timeLeft))
        setGrowth(Math.min(s.growth, MAX_GROWTH_STEPS))
      }
    }

    // --- draw ---
    const growthStep = Math.min(s.growth, MAX_GROWTH_STEPS)
    const effDetectR = DETECT_R + growthStep * GROWTH_DETECT_STEP
    const playerSize = 30 + growthStep * GROWTH_SIZE_STEP

    ctx.clearRect(0, 0, width, height)
    const shakeOffset = updateShake(s.shake, dt)
    ctx.save()
    ctx.translate(shakeOffset.x, shakeOffset.y)

    ctx.fillStyle = '#0b1f14'
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 0.4
    ;[[50, 50], [750, 60], [700, 440], [60, 440], [400, 50], [400, 450]].forEach(([x, y]) => drawEmoji(ctx, '🌲', x, y, 32))
    ctx.globalAlpha = 1

    for (const b of s.bounties) {
      const near = dist(b, s.player) < effDetectR + 40
      drawEmoji(ctx, '🥷', b.x, b.y, 28)
      if (near) {
        ctx.save()
        ctx.font = '11px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.8)'
        ctx.textAlign = 'center'
        ctx.fillText(b.name, b.x, b.y - 22)
        ctx.restore()
      }
    }

    if (growthStep > 0) {
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.strokeStyle = '#ffd166'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(s.player.x, s.player.y, playerSize * 0.62, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
    drawEmoji(ctx, '🤠', s.player.x, s.player.y, playerSize)
    ctx.save()
    ctx.strokeStyle = 'rgba(249,88,26,0.25)'
    ctx.beginPath()
    ctx.arc(s.player.x, s.player.y, effDetectR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    updateAndDrawParticles(ctx, s.particles, dt)
    updateAndDrawFloatingText(ctx, s.floatingText, dt)
    ctx.restore()
  }, true)

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <HUD
          left={[`🎯 Caught: ${caught}/${total}`, growth > 0 ? `📈 Notoriety: +${growth}` : null].filter(Boolean)}
          right={[`⏱ ${timeLeft}s`]}
        />
        <VirtualJoystick dirRef={joyRef} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🎯"
          title="Bounty Hunters"
          subtitle="Catch every hiding bounty before time's up!"
          buttonLabel="Start"
          onAction={start}
        >
          <RankProgress rank={rank} nextRank={nextRank} winsToNext={winsToNext} allRanks={allRanks} unlockedRanks={unlockedRanks} selectedRank={selectedRank} onSelect={selectRank} />
          <PersonalBest value={best} format={(v) => `${v}s to spare`} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🏆"
          title="All bounties caught!"
          subtitle={`Cleared the woods with ${timeLeft}s to spare.`}
          buttonLabel="Play again"
          onAction={start}
        >
          <RankUpBanner rank={rankUp} />
          <PersonalBest value={best} format={(v) => `${v}s to spare`} isNew={isNewRecord} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'lost'}
          emoji="⏰"
          title="Time's up!"
          subtitle={`You caught ${caught} of ${total} bounties.`}
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50">Move with WASD or arrow keys</p>
    </div>
  )
}
