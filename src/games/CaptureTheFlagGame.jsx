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
const PLAYER_SPEED = 230
const AI_SPEED = 212
const PLAYER_R = 16
const AI_R = 16
const ROUND_SECONDS = 60
const DEFENDER_SIGHT = 175

function freshState(mult) {
  return {
    mult,
    player: { x: 90, y: H / 2, carrying: false, tagFlashT: 0 },
    home: { x: 60, y: H / 2 },
    enemyFlag: { x: W - 60, y: H / 2, taken: false },
    defenders: [
      { x: W - 180, y: H / 2 - 90, home: { x: W - 180, y: H / 2 - 90 }, mode: 'patrol', wait: 0 },
      { x: W - 180, y: H / 2 + 90, home: { x: W - 180, y: H / 2 + 90 }, mode: 'patrol', wait: 0 },
      { x: W - 260, y: H / 2, home: { x: W - 260, y: H / 2 }, mode: 'patrol', wait: 0 },
      { x: W - 100, y: H / 2, home: { x: W - 100, y: H / 2 }, mode: 'patrol', wait: 0 },
    ],
    particles: [],
    floatingText: [],
    shake: { trauma: 0 },
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
  }
}

export default function CaptureTheFlagGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const { getDirection } = useKeyboard()
  const joyRef = useRef({ x: 0, y: 0 })
  const { rank, nextRank, winsToNext, recordWin } = useRank()
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))

  const [phase, setPhase] = useState('ready') // ready | playing | won | lost
  const [carrying, setCarrying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [rankUp, setRankUp] = useState(null)
  const hudAccum = useRef(0)

  const start = () => {
    setRankUp(null)
    const mult = { speed: rank.speedMult, time: rank.timeMult }
    stateRef.current = freshState(mult)
    setCarrying(false)
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

      // Player movement: keyboard direction takes priority, else joystick
      const kd = getDirection()
      const dx = kd.x !== 0 || kd.y !== 0 ? kd.x : joyRef.current.x
      const dy = kd.x !== 0 || kd.y !== 0 ? kd.y : joyRef.current.y
      s.player.x = clamp(s.player.x + dx * PLAYER_SPEED * dt, PLAYER_R, W - PLAYER_R)
      s.player.y = clamp(s.player.y + dy * PLAYER_SPEED * dt, PLAYER_R, H - PLAYER_R)
      if (s.player.tagFlashT > 0) s.player.tagFlashT -= dt

      // Pick up enemy flag
      if (!s.enemyFlag.taken && !s.player.carrying && dist(s.player, s.enemyFlag) < PLAYER_R + 14) {
        s.enemyFlag.taken = true
        s.player.carrying = true
        setCarrying(true)
        spawnFloatingText(s.floatingText, s.player.x, s.player.y - 26, 'FLAG GRABBED! RUN!', '#ffd166', 17)
        triggerShake(s.shake, 0.25)
      }

      // Win: carrying flag back home
      if (s.player.carrying && s.player.x < W / 2 - 40 && dist(s.player, s.home) < 40) {
        setPhase('won')
        const result = recordWin()
        if (result.rankedUp) setRankUp(result.newRank)
      }

      // Defenders: patrol vs chase
      for (const d of s.defenders) {
        const seesPlayer = s.player.x > W / 2 - 20 && dist(d, s.player) < DEFENDER_SIGHT
        if (seesPlayer) {
          d.mode = 'chase'
        } else if (d.mode === 'chase' && dist(d, s.player) > 240) {
          d.mode = 'patrol'
        }

        if (d.mode === 'chase') {
          steer(d, s.player, AI_SPEED * s.mult.speed)
        } else {
          if (!d.patrolTarget || dist(d, d.patrolTarget) < 6) {
            d.wait -= dt
            if (d.wait <= 0) {
              d.patrolTarget = {
                x: clamp(d.home.x + (Math.random() - 0.5) * 160, W / 2 + 20, W - AI_R),
                y: clamp(d.home.y + (Math.random() - 0.5) * 160, AI_R, H - AI_R),
              }
              d.wait = 1.5
            }
          }
          if (d.patrolTarget) steer(d, d.patrolTarget, AI_SPEED * s.mult.speed * 0.5)
        }
        d.x = clamp(d.x + d.vx * dt, W / 2 - 30, W - AI_R)
        d.y = clamp(d.y + d.vy * dt, AI_R, H - AI_R)

        // Tag check
        if (s.player.x > W / 2 - 40 && dist(d, s.player) < PLAYER_R + AI_R && s.player.tagFlashT <= 0) {
          spawnBurst(s.particles, s.player.x, s.player.y, '#ff7a3d', 16)
          triggerShake(s.shake, 0.45)
          spawnFloatingText(s.floatingText, s.player.x, s.player.y - 26, s.player.carrying ? 'TAGGED! FLAG DROPPED' : 'TAGGED!', '#ff7a3d', 16)
          s.player.tagFlashT = 1
          s.player.carrying = false
          s.enemyFlag.taken = false
          setCarrying(false)
          s.player.x = 90
          s.player.y = H / 2
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
    ctx.fillStyle = '#0b1f14'
    ctx.fillRect(0, 0, W / 2, H)
    ctx.fillStyle = '#1a0f08'
    ctx.fillRect(W / 2, 0, W / 2, H)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.moveTo(W / 2, 0)
    ctx.lineTo(W / 2, H)
    ctx.stroke()
    ctx.setLineDash([])

    // trees (decorative)
    ctx.globalAlpha = 0.5
    const trees = [[40, 40], [40, 460], [740, 60], [700, 440], [400, 30], [400, 470]]
    for (const [tx, ty] of trees) drawEmoji(ctx, '🌲', tx, ty, 34)
    ctx.globalAlpha = 1

    // home marker
    drawEmoji(ctx, '🏠', s.home.x, s.home.y, 28)

    // enemy flag
    if (!s.enemyFlag.taken) drawEmoji(ctx, '🚩', s.enemyFlag.x, s.enemyFlag.y, 34)

    // defenders
    for (const d of s.defenders) drawEmoji(ctx, d.mode === 'chase' ? '🏃' : '🥷', d.x, d.y, 30)

    // player
    ctx.save()
    if (s.player.tagFlashT > 0) ctx.globalAlpha = 0.5
    drawEmoji(ctx, s.player.carrying ? '🏃‍♂️🚩' : '🏃‍♂️', s.player.x, s.player.y, 30)
    ctx.restore()

    updateAndDrawParticles(ctx, s.particles, dt)
    updateAndDrawFloatingText(ctx, s.floatingText, dt)
    ctx.restore()
  }, true)

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <HUD
          left={[carrying ? '🚩 Carrying the flag!' : '🎯 Grab the enemy flag']}
          right={[`⏱ ${timeLeft}s`]}
        />
        <VirtualJoystick dirRef={joyRef} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🚩"
          title="Capture the Flag"
          subtitle="Grab the enemy flag and race it back home!"
          buttonLabel="Start"
          onAction={start}
        >
          <RankProgress rank={rank} nextRank={nextRank} winsToNext={winsToNext} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🏆"
          title="Flag captured!"
          subtitle={`You brought it home with ${timeLeft}s to spare.`}
          buttonLabel="Play again"
          onAction={start}
        >
          <RankUpBanner rank={rankUp} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'lost'}
          emoji="⏰"
          title="Time's up!"
          subtitle="The defenders held their ground. Give it another run."
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50 sm:hidden">Use the joystick to move</p>
      <p className="mt-3 hidden text-center text-xs text-forest-400/50 sm:block">Move with WASD or arrow keys</p>
    </div>
  )
}
