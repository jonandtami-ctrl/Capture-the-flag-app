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
const CENTER = { x: W / 2, y: H / 2 }
const RADIUS = 280
const SPEED = 220
const ATTACKER_SPEED = 150
const ROUND_SECONDS = 120
const START_HEALTH = 16
const TELEGRAPH_TIME = 0.55
// Standing near your own flame blocks incoming balloons — wide and forgiving
// on purpose, so guarding it feels like an easy, learnable defense rather
// than something you have to pixel-perfectly camp on top of.
const BLOCK_R = 66
// A thrown balloon counts as a hit anywhere in this radius of the flame —
// generous, so landing "close enough" reads as a hit instead of a miss.
const FLAME_HIT_R = 55
// Click/tap within this radius of the enemy flame and the throw auto-snaps
// dead-center onto it — no need to aim a precise crosshair, just throw in
// the general direction and it lands.
const AIM_ASSIST_R = 95
const PICKUP_R = 32
const PICKUP_RESPAWN = 3.5

// Balloon pickup spots, defined once as (dx,dy) offsets from the arena
// center and then mirrored onto both sides — keeps the two halves visually
// and mechanically symmetric.
const PICKUP_OFFSETS = [
  { dx: 200, dy: -110 },
  { dx: 130, dy: 130 },
  { dx: 190, dy: 90 },
  { dx: 90, dy: -170 },
]

function makePickups() {
  const pickups = []
  for (const off of PICKUP_OFFSETS) {
    pickups.push({ x: CENTER.x - off.dx, y: CENTER.y + off.dy, side: 'left', available: true, respawnT: 0 })
    pickups.push({ x: CENTER.x + off.dx, y: CENTER.y + off.dy, side: 'right', available: true, respawnT: 0 })
  }
  return pickups
}

// Keeps an entity inside the circular arena AND on its own side of the
// center line — projecting radially toward the center preserves which
// side of that line a point is on, so this one clamp handles both.
function clampToArenaHalf(x, y, side, margin = 16) {
  const dx = x - CENTER.x
  const dy = y - CENTER.y
  const d = Math.hypot(dx, dy)
  const maxR = RADIUS - margin
  let nx = x
  let ny = y
  if (d > maxR) {
    const scale = maxR / d
    nx = CENTER.x + dx * scale
    ny = CENTER.y + dy * scale
  }
  if (side === 'left') nx = Math.min(nx, CENTER.x - margin)
  else nx = Math.max(nx, CENTER.x + margin)
  return { x: nx, y: ny }
}

function freshAttacker(side, wanderRange, throwRange, mult) {
  const baseX = side === 'right' ? CENTER.x + RADIUS - 90 : CENTER.x - RADIUS + 90
  return {
    x: baseX,
    y: CENTER.y,
    target: { x: baseX, y: CENTER.y },
    wanderT: rand(...wanderRange),
    throwCd: rand(...throwRange) / mult.speed,
    throwRange,
    carrying: false,
  }
}

function wanderTarget(side) {
  const angle = rand(0, Math.PI * 2)
  const r = rand(0, RADIUS - 50)
  const baseX = side === 'right' ? CENTER.x + RADIUS - 90 : CENTER.x - RADIUS + 90
  return clampToArenaHalf(baseX + Math.cos(angle) * r * 0.4, CENTER.y + Math.sin(angle) * r, side)
}

// Wanders an AI-controlled attacker (enemy or teammate) around its half of
// the arena. Unarmed, it heads for the nearest available balloon pickup on
// its own side; once carrying, it mills around briefly and throws when its
// cooldown fires, returning a fresh telegraph reticle. Shared by the enemy
// pair and your teammate so all three behave consistently. Each attacker
// keeps its own throwRange (set at spawn) for every reset, not just its
// first throw, so a deliberately slow teammate doesn't speed up to enemy
// pace after her opening shot.
function updateAttacker(attacker, side, targetFlame, dt, mult, pickups) {
  const speed = ATTACKER_SPEED * mult.speed

  if (!attacker.carrying) {
    let nearest = null
    let nearestD = Infinity
    for (const p of pickups) {
      if (p.side !== side || !p.available) continue
      const d = dist(attacker, p)
      if (d < nearestD) {
        nearestD = d
        nearest = p
      }
    }
    if (nearest) {
      const toTarget = Math.atan2(nearest.y - attacker.y, nearest.x - attacker.x)
      const moved = clampToArenaHalf(attacker.x + Math.cos(toTarget) * speed * dt, attacker.y + Math.sin(toTarget) * speed * dt, side)
      attacker.x = moved.x
      attacker.y = moved.y
      if (nearestD < PICKUP_R) {
        nearest.available = false
        nearest.respawnT = PICKUP_RESPAWN
        attacker.carrying = true
        attacker.throwCd = rand(...attacker.throwRange) / mult.speed
      }
    } else {
      // no balloons free on this side right now — wander while waiting
      attacker.wanderT -= dt
      if (attacker.wanderT <= 0 || dist(attacker, attacker.target) < 12) {
        attacker.target = wanderTarget(side)
        attacker.wanderT = rand(0.6, 1.2)
      }
      const toTarget = Math.atan2(attacker.target.y - attacker.y, attacker.target.x - attacker.x)
      const moved = clampToArenaHalf(attacker.x + Math.cos(toTarget) * speed * dt, attacker.y + Math.sin(toTarget) * speed * dt, side)
      attacker.x = moved.x
      attacker.y = moved.y
    }
    return null
  }

  // carrying a balloon — mill around briefly, then throw when ready
  attacker.wanderT -= dt
  if (attacker.wanderT <= 0 || dist(attacker, attacker.target) < 12) {
    attacker.target = wanderTarget(side)
    attacker.wanderT = rand(0.5, 1)
  }
  const toTarget = Math.atan2(attacker.target.y - attacker.y, attacker.target.x - attacker.x)
  const moved = clampToArenaHalf(attacker.x + Math.cos(toTarget) * speed * 0.6 * dt, attacker.y + Math.sin(toTarget) * speed * 0.6 * dt, side)
  attacker.x = moved.x
  attacker.y = moved.y

  attacker.throwCd -= dt
  if (attacker.throwCd <= 0) {
    attacker.carrying = false
    return { x: targetFlame.x + rand(-18, 18), y: targetFlame.y + rand(-18, 18) }
  }
  return null
}

function roundedFillStroke(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
}

function drawFlameGauge(ctx, x, y, health, maxHealth, barColor) {
  const frac = clamp(health / maxHealth, 0, 1)
  const w = 100
  const h = 14
  const bx = x - w / 2
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  roundedFillStroke(ctx, bx, y, w, h, 7)
  ctx.fill()
  if (frac > 0) {
    ctx.fillStyle = barColor
    roundedFillStroke(ctx, bx, y, w * frac, h, 7)
    ctx.fill()
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'
  ctx.lineWidth = 1.5
  roundedFillStroke(ctx, bx, y, w, h, 7)
  ctx.stroke()
  ctx.font = 'bold 11px system-ui, sans-serif'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${Math.max(0, health)}/${maxHealth}`, x, y + h / 2 + 0.5)
  ctx.restore()
}

function freshState(mult) {
  return {
    mult,
    player: { x: CENTER.x - RADIUS + 90, y: CENTER.y - 60, carrying: false },
    // Your teammate throws slowly — she's backup, not a substitute for
    // actually playing. Your own throws (no cooldown, aimed by hand) are
    // what should carry the fight.
    teammate: freshAttacker('left', [0.5, 1.5], [3.5, 5.5], mult),
    ai: freshAttacker('right', [0.5, 1.5], [0.6, 1.2], mult),
    ai2: freshAttacker('right', [0.7, 1.7], [0.9, 1.6], mult),
    playerFlame: { x: CENTER.x - RADIUS + 30, y: CENTER.y, health: START_HEALTH },
    aiFlame: { x: CENTER.x + RADIUS - 30, y: CENTER.y, health: START_HEALTH },
    pickups: makePickups(),
    balloons: [], // {x,y,tx,ty,duration,team:'player'|'enemy'}
    telegraphs: [], // {x,y,t,team,origin}
    particles: [],
    floatingText: [],
    shake: { trauma: 0 },
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
    pulseT: 0,
    noBalloonHintCd: 0,
  }
}

export default function FlameBattlersGame() {
  const canvasRef = useRef(null)
  const { containerRef, width, height } = useCanvasSize(canvasRef, W, H)
  const { getDirection } = useKeyboard()
  const joyRef = useRef({ x: 0, y: 0 })
  const { rank, nextRank, winsToNext, recordWin, allRanks, unlockedRanks, selectedRank, selectRank } = useRank()
  const stateRef = useRef(freshState({ speed: 1, time: 1 }))

  const [phase, setPhase] = useState('ready')
  const [hp, setHp] = useState({ player: START_HEALTH, ai: START_HEALTH })
  const [carrying, setCarrying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [rankUp, setRankUp] = useState(null)
  const hudAccum = useRef(0)

  const winGame = () => {
    setPhase('won')
    const result = recordWin()
    if (result.rankedUp) setRankUp(result.newRank)
  }

  const start = () => {
    setRankUp(null)
    const mult = { speed: selectedRank.speedMult, time: selectedRank.timeMult }
    stateRef.current = freshState(mult)
    setHp({ player: START_HEALTH, ai: START_HEALTH })
    setCarrying(false)
    setTimeLeft(stateRef.current.timeLeft)
    setPhase('playing')
  }

  const throwAt = (logicalX, logicalY) => {
    const s = stateRef.current
    if (phase !== 'playing') return
    if (!s.player.carrying) {
      if (s.noBalloonHintCd <= 0) {
        spawnFloatingText(s.floatingText, s.player.x, s.player.y - 26, 'Grab a balloon first!', '#ffb020', 14)
        s.noBalloonHintCd = 1.2
      }
      return
    }
    let tx = logicalX
    let ty = logicalY
    if (dist({ x: tx, y: ty }, s.aiFlame) < AIM_ASSIST_R) {
      tx = s.aiFlame.x
      ty = s.aiFlame.y
    }
    s.balloons.push({
      x: s.player.x,
      y: s.player.y,
      tx,
      ty,
      t: 0,
      duration: dist(s.player, { x: tx, y: ty }) / 420,
      team: 'player',
    })
    s.player.carrying = false
    setCarrying(false)
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
      s.pulseT += dt
      s.noBalloonHintCd = Math.max(0, s.noBalloonHintCd - dt)
      if (s.timeLeft <= 0) {
        s.timeLeft = 0
        if (s.playerFlame.health >= s.aiFlame.health) winGame()
        else setPhase('lost')
      }

      // player movement — free to roam their half of the circular arena
      const kd = getDirection()
      const dx = kd.x !== 0 || kd.y !== 0 ? kd.x : joyRef.current.x
      const dy = kd.x !== 0 || kd.y !== 0 ? kd.y : joyRef.current.y
      const nextPlayer = clampToArenaHalf(s.player.x + dx * SPEED * dt, s.player.y + dy * SPEED * dt, 'left')
      s.player.x = nextPlayer.x
      s.player.y = nextPlayer.y

      // player auto-grabs any available balloon pickup they walk over
      if (!s.player.carrying) {
        for (const p of s.pickups) {
          if (p.side === 'left' && p.available && dist(s.player, p) < PICKUP_R) {
            p.available = false
            p.respawnT = PICKUP_RESPAWN
            s.player.carrying = true
            setCarrying(true)
            spawnBurst(s.particles, p.x, p.y, '#7dd3fc', 8)
            spawnFloatingText(s.floatingText, s.player.x, s.player.y - 26, 'Balloon ready!', '#7dd3fc', 14)
            break
          }
        }
      }

      // pickups respawn on a timer regardless of who grabbed them
      for (const p of s.pickups) {
        if (!p.available) {
          p.respawnT -= dt
          if (p.respawnT <= 0) p.available = true
        }
      }

      // AI pair + your teammate all seek balloons and throw on cadence
      const reticleAi = updateAttacker(s.ai, 'right', s.playerFlame, dt, s.mult, s.pickups)
      if (reticleAi) s.telegraphs.push({ ...reticleAi, t: TELEGRAPH_TIME, team: 'enemy', origin: s.ai })
      const reticleAi2 = updateAttacker(s.ai2, 'right', s.playerFlame, dt, s.mult, s.pickups)
      if (reticleAi2) s.telegraphs.push({ ...reticleAi2, t: TELEGRAPH_TIME, team: 'enemy', origin: s.ai2 })
      const reticleTeam = updateAttacker(s.teammate, 'left', s.aiFlame, dt, s.mult, s.pickups)
      if (reticleTeam) s.telegraphs.push({ ...reticleTeam, t: TELEGRAPH_TIME, team: 'player', origin: s.teammate })

      // resolve telegraphs -> spawn balloons from whichever attacker threw them
      for (let i = s.telegraphs.length - 1; i >= 0; i--) {
        const tg = s.telegraphs[i]
        tg.t -= dt
        if (tg.t <= 0) {
          s.balloons.push({
            x: tg.origin.x,
            y: tg.origin.y,
            tx: tg.x,
            ty: tg.y,
            t: 0,
            duration: dist(tg.origin, { x: tg.x, y: tg.y }) / (420 * s.mult.speed),
            team: tg.team,
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
          if (b.team === 'enemy') {
            // blocked if you OR your teammate are guarding the flame
            const blocked = dist(s.player, s.playerFlame) < BLOCK_R || dist(s.teammate, s.playerFlame) < BLOCK_R
            if (blocked) {
              spawnBurst(s.particles, b.tx, b.ty, '#67e8f9', 10)
              spawnFloatingText(s.floatingText, b.tx, b.ty - 20, 'BLOCKED!', '#7dd3fc', 15)
            } else {
              s.playerFlame.health = Math.max(0, s.playerFlame.health - 1)
              spawnBurst(s.particles, s.playerFlame.x, s.playerFlame.y, '#ff7a3d', 14)
              spawnFloatingText(s.floatingText, s.playerFlame.x, s.playerFlame.y - 30, '-1 🔥', '#ff7a3d', 18)
              triggerShake(s.shake, 0.3)
              setHp((h) => ({ ...h, player: s.playerFlame.health }))
            }
          } else if (dist({ x: b.tx, y: b.ty }, s.aiFlame) < FLAME_HIT_R) {
            s.aiFlame.health = Math.max(0, s.aiFlame.health - 1)
            spawnBurst(s.particles, s.aiFlame.x, s.aiFlame.y, '#43cc86', 14)
            spawnFloatingText(s.floatingText, s.aiFlame.x, s.aiFlame.y - 30, 'HIT! -1 🔥', '#43cc86', 18)
            triggerShake(s.shake, 0.3)
            setHp((h) => ({ ...h, ai: s.aiFlame.health }))
          } else {
            spawnBurst(s.particles, b.tx, b.ty, '#7dd3fc', 8)
          }
          s.balloons.splice(i, 1)
        }
      }

      if (s.playerFlame.health <= 0) setPhase('lost')
      if (s.aiFlame.health <= 0) winGame()

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
    ctx.fillStyle = '#06140d'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.beginPath()
    ctx.arc(CENTER.x, CENTER.y, RADIUS, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = '#0b1f14'
    ctx.fillRect(0, 0, CENTER.x, H)
    ctx.fillStyle = '#1a0f08'
    ctx.fillRect(CENTER.x, 0, W - CENTER.x, H)
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(CENTER.x, CENTER.y, RADIUS, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.moveTo(CENTER.x, CENTER.y - RADIUS)
    ctx.lineTo(CENTER.x, CENTER.y + RADIUS)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()

    // guard zone — stand inside this ring to block incoming balloons
    const guarding = dist(s.player, s.playerFlame) < BLOCK_R || dist(s.teammate, s.playerFlame) < BLOCK_R
    ctx.save()
    ctx.strokeStyle = guarding ? 'rgba(125,211,252,0.6)' : 'rgba(125,211,252,0.22)'
    ctx.lineWidth = guarding ? 3 : 2
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.arc(s.playerFlame.x, s.playerFlame.y, BLOCK_R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()

    // flames — a single big flame plus a health bar, so a large max-health
    // reads clearly instead of stacking dozens of emoji off the top of the arena
    drawEmoji(ctx, '🪵', s.playerFlame.x, s.playerFlame.y + 36, 30)
    drawEmoji(ctx, '🔥', s.playerFlame.x, s.playerFlame.y - 6, 64)
    drawFlameGauge(ctx, s.playerFlame.x, s.playerFlame.y - 78, s.playerFlame.health, START_HEALTH, '#ff7a3d')
    drawEmoji(ctx, '🪵', s.aiFlame.x, s.aiFlame.y + 36, 30)
    drawEmoji(ctx, '🔥', s.aiFlame.x, s.aiFlame.y - 6, 64)
    drawFlameGauge(ctx, s.aiFlame.x, s.aiFlame.y - 78, s.aiFlame.health, START_HEALTH, '#43cc86')

    // balloon pickups scattered around the field
    for (const p of s.pickups) {
      if (!p.available) continue
      const bob = Math.sin(s.pulseT * 3 + p.x) * 3
      drawEmoji(ctx, '🎈', p.x, p.y + bob, 30)
    }

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

    // thrown balloons
    for (const b of s.balloons) drawEmoji(ctx, '💧', b.cx ?? b.x, b.cy ?? b.y, 20)

    // characters (with a small balloon badge over whoever's currently armed)
    drawEmoji(ctx, '🧍', s.ai.x, s.ai.y, 30)
    if (s.ai.carrying) drawEmoji(ctx, '🎈', s.ai.x, s.ai.y - 26, 16)
    drawEmoji(ctx, '🧍‍♀️', s.ai2.x, s.ai2.y, 30)
    if (s.ai2.carrying) drawEmoji(ctx, '🎈', s.ai2.x, s.ai2.y - 26, 16)
    drawEmoji(ctx, '👩‍🚒', s.teammate.x, s.teammate.y, 30)
    if (s.teammate.carrying) drawEmoji(ctx, '🎈', s.teammate.x, s.teammate.y - 26, 16)
    drawEmoji(ctx, '🧑‍🚒', s.player.x, s.player.y, 30)
    if (s.player.carrying) drawEmoji(ctx, '🎈', s.player.x, s.player.y - 30, 18)

    updateAndDrawParticles(ctx, s.particles, dt)
    updateAndDrawFloatingText(ctx, s.floatingText, dt)
    ctx.restore()
  }, true)

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse') handlePointer(e)
          }}
          onClick={handlePointer}
        />
        <HUD
          left={[`🔥 You: ${hp.player}/${START_HEALTH}`, carrying ? '🎈 Ready to throw!' : '🚶 Grab a balloon']}
          right={[`🔥 AI: ${hp.ai}/${START_HEALTH}`, `⏱ ${timeLeft}s`]}
        />
        <VirtualJoystick dirRef={joyRef} />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🔥"
          title="Flame Battlers"
          subtitle="You and your teammate face off against two enemy throwers. Balloons are scattered around the field — walk over one to grab it, then tap/click near their flame to throw. Stand near your own flame to block incoming balloons. Their flame can take a beating, so keep collecting and throwing!"
          buttonLabel="Start"
          onAction={start}
        >
          <RankProgress rank={rank} nextRank={nextRank} winsToNext={winsToNext} allRanks={allRanks} unlockedRanks={unlockedRanks} selectedRank={selectedRank} onSelect={selectRank} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'won'}
          emoji="🏆"
          title="Flame extinguished!"
          subtitle="Your squad doused the enemy fire first."
          buttonLabel="Play again"
          onAction={start}
        >
          <RankUpBanner rank={rankUp} />
        </GameOverlay>
        <GameOverlay
          show={phase === 'lost'}
          emoji="💧"
          title="Your flame went out"
          subtitle="The AI got you first this time."
          buttonLabel="Try again"
          onAction={start}
        />
      </GameFrame>
      <p className="mt-3 text-center text-xs text-forest-400/50">Move to dodge · grab a 🎈 balloon off the ground · tap/click near their flame to throw · guard your flame to block</p>
    </div>
  )
}
