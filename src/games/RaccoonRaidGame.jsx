import { useRef, useState } from 'react'
import useCanvasSize from './engine/useCanvasSize.js'
import useKeyboard from './engine/useKeyboard.js'
import useGameLoop from './engine/useGameLoop.js'
import GameFrame from './engine/GameFrame.jsx'
import HUD from './engine/HUD.jsx'
import GameOverlay from './engine/GameOverlay.jsx'
import RankProgress from './engine/RankProgress.jsx'
import RankUpBanner from './engine/RankUpBanner.jsx'
import useRank from '../lib/useRank.js'
import {
  clamp,
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
const PLAYER_Y = 440
const STASH = { x: W / 2, y: 470 }
const ROUND_SECONDS = 60
const START_LIVES = 4
const COMBO_WINDOW = 1.1

function freshState(mult) {
  return {
    mult,
    player: { x: W / 2 },
    raccoons: [],
    shots: [],
    particles: [],
    floatingText: [],
    shake: { trauma: 0 },
    spawnCd: 1,
    elapsed: 0,
    combo: 0,
    lastHitAt: -99,
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
  }
}

export default function RaccoonRaidGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const { getDirection, actionRef } = useKeyboard()
  const joyRef = useRef({ x: 0, y: 0 })
  const { rank, nextRank, winsToNext, recordWin, allRanks, unlockedRanks, selectedRank, selectRank } = useRank()
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))
  const firedRef = useRef(false)

  const [phase, setPhase] = useState('ready')
  const [lives, setLives] = useState(START_LIVES)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [rankUp, setRankUp] = useState(null)
  const hudAccum = useRef(0)

  const start = () => {
    setRankUp(null)
    const mult = { speed: selectedRank.speedMult, time: selectedRank.timeMult }
    stateRef.current = freshState(mult)
    setLives(START_LIVES)
    setScore(0)
    setTimeLeft(stateRef.current.timeLeft)
    setPhase('playing')
  }

  const fire = () => {
    const s = stateRef.current
    if (phase !== 'playing') return
    s.shots.push({ x: s.player.x, y: PLAYER_Y })
  }

  useGameLoop((dt) => {
    const s = stateRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (phase === 'playing') {
      s.timeLeft -= dt
      s.elapsed += dt
      if (s.timeLeft <= 0) {
        s.timeLeft = 0
        setPhase('won')
        const result = recordWin()
        if (result.rankedUp) setRankUp(result.newRank)
      }

      // player horizontal movement
      const kd = getDirection()
      const dx = kd.x !== 0 ? kd.x : joyRef.current.x
      s.player.x = clamp(s.player.x + dx * 260 * dt, 40, W - 40)

      if (actionRef.current && !firedRef.current) fire()
      firedRef.current = actionRef.current

      // spawn raccoons, faster over time
      s.spawnCd -= dt
      if (s.spawnCd <= 0) {
        const difficulty = clamp(s.elapsed / ROUND_SECONDS, 0, 1)
        s.spawnCd = (rand(1.1 - difficulty * 0.85, 1.9 - difficulty * 0.95)) / s.mult.speed
        s.raccoons.push({
          x: rand(50, W - 50),
          y: -20,
          speed: (rand(80, 125) + difficulty * 85) * s.mult.speed,
          wobble: rand(0, Math.PI * 2),
          alive: true,
        })
      }

      // update raccoons
      for (let i = s.raccoons.length - 1; i >= 0; i--) {
        const r = s.raccoons[i]
        r.y += r.speed * dt
        r.wobble += dt * 3
        r.x = clamp(r.x + Math.sin(r.wobble) * 40 * dt, 30, W - 30)
        if (r.y >= STASH.y - 10) {
          s.raccoons.splice(i, 1)
          spawnBurst(s.particles, r.x, STASH.y, '#ff7a3d', 12)
          triggerShake(s.shake, 0.5)
          spawnFloatingText(s.floatingText, STASH.x, STASH.y - 20, 'STASH RAIDED!', '#ff7a3d', 17)
          s.combo = 0
          setLives((l) => {
            const next = Math.max(0, l - 1)
            if (next === 0) setPhase('lost')
            return next
          })
        }
      }

      // update shots + collisions
      for (let i = s.shots.length - 1; i >= 0; i--) {
        const shot = s.shots[i]
        shot.y -= 480 * dt
        let hit = false
        for (let j = s.raccoons.length - 1; j >= 0; j--) {
          const r = s.raccoons[j]
          if (Math.abs(shot.x - r.x) < 22 && Math.abs(shot.y - r.y) < 22) {
            s.raccoons.splice(j, 1)
            spawnBurst(s.particles, r.x, r.y, '#43cc86', 14)
            s.combo = s.elapsed - s.lastHitAt < COMBO_WINDOW ? s.combo + 1 : 1
            s.lastHitAt = s.elapsed
            const gain = s.combo > 1 ? s.combo : 1
            setScore((sc) => sc + gain)
            triggerShake(s.shake, 0.15)
            spawnFloatingText(s.floatingText, r.x, r.y - 16, s.combo > 1 ? `COMBO x${s.combo}!` : '+1', '#43cc86', s.combo > 1 ? 18 : 15)
            hit = true
            break
          }
        }
        if (hit || shot.y < -10) s.shots.splice(i, 1)
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
    ctx.globalAlpha = 0.4
    ;[[60, 60], [740, 80], [700, 40], [100, 120]].forEach(([x, y]) => drawEmoji(ctx, '🌲', x, y, 30))
    ctx.globalAlpha = 1

    drawEmoji(ctx, '🧺', STASH.x, STASH.y, 34)

    for (const r of s.raccoons) drawEmoji(ctx, '🦝', r.x, r.y, 28)
    for (const shot of s.shots) {
      ctx.save()
      ctx.fillStyle = '#7dd3fc'
      ctx.beginPath()
      ctx.arc(shot.x, shot.y, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    drawEmoji(ctx, '🤺', s.player.x, PLAYER_Y, 32)
    updateAndDrawParticles(ctx, s.particles, dt)
    updateAndDrawFloatingText(ctx, s.floatingText, dt)
    ctx.restore()
  }, true)

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <div className="absolute inset-0 z-10" onClick={fire} />
        <HUD left={[`🎯 Stopped: ${score}`, `🧺 Lives: ${'❤️'.repeat(lives)}`]} right={[`⏱ ${timeLeft}s`]} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🦝"
          title="Raccoon Raid"
          subtitle="Defend the food stash — don't let the raccoons get through!"
          buttonLabel="Start"
          onAction={start}
        >
          <RankProgress rank={rank} nextRank={nextRank} winsToNext={winsToNext} allRanks={allRanks} unlockedRanks={unlockedRanks} selectedRank={selectedRank} onSelect={selectRank} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🏆"
          title="Stash defended!"
          subtitle={`You stopped ${score} raiders with ${lives} lives to spare.`}
          buttonLabel="Play again"
          onAction={start}
        >
          <RankUpBanner rank={rankUp} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'lost'}
          emoji="😱"
          title="The raccoons got the food!"
          subtitle={`You stopped ${score} raiders before they overran the stash.`}
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50">Move with A/D or arrows · Space or tap to fire</p>
    </div>
  )
}
