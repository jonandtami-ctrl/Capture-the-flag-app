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
const AI_SPEED = 190
const TEAMMATE_SPEED = 150
const PLAYER_R = 16
const AI_R = 16
const ROUND_SECONDS = 90
const DEFENDER_SIGHT = 150
const TAG_R = PLAYER_R + AI_R
const RAID_STUN = 2.2
const MY_FLAG = { x: 150, y: H / 2 }
const AI_SCORE_POINT = { x: W - 40, y: H / 2 }
const TREE_R = 16

// Keep-clear circles around spawn points, flags, and home so the maze never
// seals off somewhere the game depends on being reachable.
const RESERVED_ZONES = [
  { x: 60, y: H / 2, r: 55 }, // home
  { x: MY_FLAG.x, y: MY_FLAG.y, r: 55 }, // your flag
  { x: 90, y: H / 2, r: 40 }, // player spawn
  { x: W - 60, y: H / 2, r: 55 }, // enemy flag
  { x: W - 40, y: H / 2, r: 45 }, // AI score point
  { x: W - 180, y: H / 2 - 90, r: 45 },
  { x: W - 180, y: H / 2 + 90, r: 45 },
  { x: W - 260, y: H / 2, r: 45 },
]

// A deterministic scatter of trees across the arena — enough to break
// sightlines and force weaving through real lanes, without packing so
// tight it reads as a solid thicket. Fixed pattern (no Math.random) so the
// layout is stable and never seals off a reserved zone or a way across.
const TREES = (() => {
  const trees = []
  let col = 0
  for (let x = 120; x <= 680; x += 65) {
    let row = 0
    for (let y = 50; y <= 450; y += 65) {
      col++
      row++
      // Skip roughly a third of cells (fixed pattern) so real lanes survive.
      if ((col * 5 + row * 3) % 3 === 0) continue
      const jitterX = ((col * 17) % 27) - 13
      const jitterY = ((row * 23) % 27) - 13
      const tx = x + jitterX
      const ty = y + jitterY
      if (RESERVED_ZONES.some((z) => Math.hypot(tx - z.x, ty - z.y) < z.r)) continue
      trees.push({ x: tx, y: ty, r: TREE_R })
    }
  }
  return trees
})()

// Pushes an entity back out of any tree trunk it's overlapping — trees are
// solid, so you weave around them rather than clipping straight through.
function resolveTreeCollisions(entity, entityR) {
  for (const t of TREES) {
    const dx = entity.x - t.x
    const dy = entity.y - t.y
    const d = Math.hypot(dx, dy) || 0.001
    const minDist = t.r + entityR
    if (d < minDist) {
      const push = minDist - d
      entity.x += (dx / d) * push
      entity.y += (dy / d) * push
    }
  }
}

// True if no tree trunk sits on the straight line between a and b — lets
// defenders actually lose sight of you behind cover instead of seeing
// through the forest.
function hasLineOfSight(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  for (const t of TREES) {
    let along = len2 === 0 ? 0 : ((t.x - a.x) * dx + (t.y - a.y) * dy) / len2
    along = clamp(along, 0, 1)
    const px = a.x + dx * along
    const py = a.y + dy * along
    if (Math.hypot(t.x - px, t.y - py) < t.r + 5) return false
  }
  return true
}

function freshState(mult) {
  return {
    mult,
    player: { x: 90, y: H / 2, carrying: false, tagFlashT: 0 },
    home: { x: 60, y: H / 2 },
    myFlag: { x: MY_FLAG.x, y: MY_FLAG.y, taken: false },
    enemyFlag: { x: W - 60, y: H / 2, taken: false },
    defenders: [
      { x: W - 180, y: H / 2 - 90, home: { x: W - 180, y: H / 2 - 90 }, mode: 'patrol', wait: 0, raiding: false, carrying: false, stunT: 0 },
      { x: W - 180, y: H / 2 + 90, home: { x: W - 180, y: H / 2 + 90 }, mode: 'patrol', wait: 0, raiding: false, carrying: false, stunT: 0 },
      { x: W - 260, y: H / 2, home: { x: W - 260, y: H / 2 }, mode: 'patrol', wait: 0, raiding: false, carrying: false, stunT: 0 },
    ],
    teammates: [
      { x: MY_FLAG.x - 20, y: H / 2 - 80, wanderT: 0 },
      { x: MY_FLAG.x - 20, y: H / 2 + 80, wanderT: 0 },
    ],
    raidCd: rand(4, 7),
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
  const { rank, nextRank, winsToNext, recordWin, allRanks, unlockedRanks, selectedRank, selectRank } = useRank()
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))

  const [phase, setPhase] = useState('ready') // ready | playing | won | lost
  const [carrying, setCarrying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [rankUp, setRankUp] = useState(null)
  const [lossReason, setLossReason] = useState('timeout')
  const [raidAlert, setRaidAlert] = useState(false)
  const hudAccum = useRef(0)

  const start = () => {
    setRankUp(null)
    setLossReason('timeout')
    setRaidAlert(false)
    const mult = { speed: selectedRank.speedMult, time: selectedRank.timeMult }
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
      resolveTreeCollisions(s.player, PLAYER_R)
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

      // Occasionally send one defender across to raid your flag
      s.raidCd -= dt
      if (s.raidCd <= 0) {
        const available = s.defenders.filter((d) => !d.raiding && d.stunT <= 0)
        if (available.length > 0) {
          const raider = available[Math.floor(Math.random() * available.length)]
          raider.raiding = true
          spawnFloatingText(s.floatingText, raider.x, raider.y - 26, 'RAIDER INCOMING!', '#ff7a3d', 16)
        }
        s.raidCd = rand(8, 13) / s.mult.speed
      }

      // Defenders: patrol vs chase vs raid your flag
      for (const d of s.defenders) {
        if (d.stunT > 0) {
          d.stunT -= dt
          d.vx = 0
          d.vy = 0
        } else if (d.raiding) {
          const target = d.carrying ? AI_SCORE_POINT : s.myFlag
          steer(d, target, AI_SPEED * s.mult.speed * 0.9)
          d.x = clamp(d.x + d.vx * dt, AI_R, W - AI_R)
          d.y = clamp(d.y + d.vy * dt, AI_R, H - AI_R)
          resolveTreeCollisions(d, AI_R)

          if (!d.carrying && !s.myFlag.taken && dist(d, s.myFlag) < AI_R + 14) {
            d.carrying = true
            s.myFlag.taken = true
            triggerShake(s.shake, 0.3)
            spawnFloatingText(s.floatingText, s.myFlag.x, s.myFlag.y - 26, 'YOUR FLAG WAS TAKEN!', '#ff7a3d', 17)
          }
          if (d.carrying && dist(d, AI_SCORE_POINT) < 30) {
            setLossReason('flagStolen')
            setPhase('lost')
          }
        } else {
          const seesPlayer =
            s.player.x > W / 2 - 20 && dist(d, s.player) < DEFENDER_SIGHT && hasLineOfSight(d, s.player)
          if (seesPlayer) {
            d.mode = 'chase'
          } else if (d.mode === 'chase' && dist(d, s.player) > 220) {
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
          resolveTreeCollisions(d, AI_R)
        }

        // Tag check: defender tags player when on the right side (their turf)
        if (s.player.x > W / 2 - 40 && dist(d, s.player) < TAG_R && s.player.tagFlashT <= 0 && d.stunT <= 0) {
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

        // You and your teammates can tag any defender caught on your side
        if (d.x < W / 2 && d.stunT <= 0) {
          const caught = dist(d, s.player) < TAG_R || s.teammates.some((t) => dist(d, t) < TAG_R)
          if (caught) {
            spawnBurst(s.particles, d.x, d.y, '#67e8f9', 14)
            triggerShake(s.shake, 0.25)
            spawnFloatingText(s.floatingText, d.x, d.y - 22, d.carrying ? 'FLAG RETURNED!' : 'SENT BACK!', '#7dd3fc', 15)
            if (d.carrying) s.myFlag.taken = false
            d.raiding = false
            d.carrying = false
            d.mode = 'patrol'
            d.stunT = RAID_STUN
            d.x = d.home.x
            d.y = d.home.y
            d.vx = 0
            d.vy = 0
          }
        }
      }

      // Teammates: guard the flag, converging on any raider that gets close
      for (const t of s.teammates) {
        let nearest = null
        let nearestDist = Infinity
        for (const d of s.defenders) {
          if (!d.raiding || d.stunT > 0 || d.x > W / 2 + 60) continue
          const dd = dist(t, d)
          if (dd < nearestDist) {
            nearestDist = dd
            nearest = d
          }
        }
        if (nearest && nearestDist < 280) {
          steer(t, nearest, TEAMMATE_SPEED * s.mult.speed)
        } else {
          t.wanderT -= dt
          if (!t.wanderTarget || dist(t, t.wanderTarget) < 8 || t.wanderT <= 0) {
            t.wanderTarget = { x: rand(PLAYER_R + 20, W / 2 - 40), y: rand(AI_R + 20, H - AI_R - 20) }
            t.wanderT = rand(1.5, 3)
          }
          steer(t, t.wanderTarget, TEAMMATE_SPEED * s.mult.speed * 0.5)
        }
        t.x = clamp(t.x + t.vx * dt, PLAYER_R, W / 2 - 20)
        t.y = clamp(t.y + t.vy * dt, AI_R, H - AI_R)
        resolveTreeCollisions(t, PLAYER_R)
      }

      hudAccum.current += dt
      if (hudAccum.current > 0.15) {
        hudAccum.current = 0
        setTimeLeft(Math.ceil(s.timeLeft))
        setRaidAlert(s.defenders.some((d) => d.raiding && d.stunT <= 0))
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

    // trees — real cover, not just scenery: they block movement and sightlines
    ctx.globalAlpha = 0.65
    for (const t of TREES) drawEmoji(ctx, '🌲', t.x, t.y, 30)
    ctx.globalAlpha = 1

    // home marker
    drawEmoji(ctx, '🏠', s.home.x, s.home.y, 28)

    // your flag — guard it from raiders
    if (!s.myFlag.taken) drawEmoji(ctx, '🚩', s.myFlag.x, s.myFlag.y, 34)

    // enemy flag
    if (!s.enemyFlag.taken) drawEmoji(ctx, '🚩', s.enemyFlag.x, s.enemyFlag.y, 34)

    // teammates
    for (const t of s.teammates) drawEmoji(ctx, '🏃‍♀️', t.x, t.y, 28)

    // defenders
    for (const d of s.defenders) {
      drawEmoji(ctx, d.stunT > 0 ? '😵' : d.mode === 'chase' ? '🏃' : '🥷', d.x, d.y, 30)
      if (d.carrying) drawEmoji(ctx, '🚩', d.x, d.y - 26, 20)
      else if (d.raiding && d.stunT <= 0) drawEmoji(ctx, '❗', d.x, d.y - 24, 18)
    }

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
          left={[carrying ? '🚩 Carrying the flag!' : '🎯 Grab the enemy flag', raidAlert ? '🚨 Your flag is under attack!' : null].filter(Boolean)}
          right={[`⏱ ${timeLeft}s`]}
        />
        <VirtualJoystick dirRef={joyRef} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🚩"
          title="Capture the Flag"
          subtitle="Grab the enemy flag and race it back home! Use the trees for cover — defenders can't see you through them. Your teammates guard your own flag, but raiders can still sneak in."
          buttonLabel="Start"
          onAction={start}
        >
          <RankProgress rank={rank} nextRank={nextRank} winsToNext={winsToNext} allRanks={allRanks} unlockedRanks={unlockedRanks} selectedRank={selectedRank} onSelect={selectRank} />
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
          emoji={lossReason === 'flagStolen' ? '🚩' : '⏰'}
          title={lossReason === 'flagStolen' ? 'Your flag was stolen!' : "Time's up!"}
          subtitle={
            lossReason === 'flagStolen'
              ? 'A raider snuck your flag back to their camp. Keep teammates near your flag next time!'
              : 'The defenders held their ground. Give it another run.'
          }
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50 sm:hidden">Use the joystick to move</p>
      <p className="mt-3 hidden text-center text-xs text-forest-400/50 sm:block">Move with WASD or arrow keys</p>
    </div>
  )
}
