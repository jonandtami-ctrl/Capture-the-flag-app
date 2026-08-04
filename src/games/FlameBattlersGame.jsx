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
const ROUND_SECONDS = 90
const START_HEALTH = 7
const FLAME_STACK_GAP = 24
const TELEGRAPH_TIME = 0.55
// Standing this close to your own flame reliably blocks incoming balloons —
// generous enough to cover the whole visible flame column (not a tiny spot
// at its base), so guarding it feels like a real, learnable defense.
const BLOCK_R = 46

// The flame health stack is drawn as big 🔥 emoji rising above the flame's
// anchor point (one per health, FLAME_STACK_GAP apart) — a throw should
// register anywhere on that visible column, not just a small circle at its
// base, or landing on the flame you can clearly see will still read as a miss.
function hitsFlameStack(px, py, flame) {
  const dx = Math.abs(px - flame.x)
  const dy = py - flame.y
  return dx < 34 && dy > -(FLAME_STACK_GAP * (START_HEALTH - 1) + 34) && dy < 34
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
  }
}

// Wanders an AI-controlled attacker (enemy or teammate) around its half of
// the arena and returns a new telegraph reticle whenever its throw cooldown
// fires — shared by the enemy pair and your teammate so all three behave
// consistently. Each attacker keeps its own throwRange (set at spawn) for
// every reset, not just its first throw, so a deliberately slow teammate
// doesn't speed up to enemy pace after her opening shot.
function updateAttacker(attacker, side, targetFlame, dt, mult) {
  const speed = ATTACKER_SPEED * mult.speed
  attacker.wanderT -= dt
  if (attacker.wanderT <= 0 || dist(attacker, attacker.target) < 12) {
    const angle = rand(0, Math.PI * 2)
    const r = rand(0, RADIUS - 50)
    const baseX = side === 'right' ? CENTER.x + RADIUS - 90 : CENTER.x - RADIUS + 90
    attacker.target = clampToArenaHalf(baseX + Math.cos(angle) * r * 0.4, CENTER.y + Math.sin(angle) * r, side)
    attacker.wanderT = rand(0.8, 1.8)
  }
  const toTarget = Math.atan2(attacker.target.y - attacker.y, attacker.target.x - attacker.x)
  const moved = clampToArenaHalf(attacker.x + Math.cos(toTarget) * speed * dt, attacker.y + Math.sin(toTarget) * speed * dt, side)
  attacker.x = moved.x
  attacker.y = moved.y

  attacker.throwCd -= dt
  if (attacker.throwCd <= 0) {
    attacker.throwCd = rand(...attacker.throwRange) / mult.speed
    return { x: targetFlame.x + rand(-18, 18), y: targetFlame.y + rand(-18, 18) }
  }
  return null
}

function freshState(mult) {
  return {
    mult,
    player: { x: CENTER.x - RADIUS + 90, y: CENTER.y - 60 },
    // Your teammate throws slowly — she's backup, not a substitute for
    // actually playing. Your own throws (no cooldown, aimed by hand) are
    // what should carry the fight.
    teammate: freshAttacker('left', [0.5, 1.5], [3.5, 5.5], mult),
    ai: freshAttacker('right', [0.5, 1.5], [0.6, 1.2], mult),
    ai2: freshAttacker('right', [0.7, 1.7], [0.9, 1.6], mult),
    playerFlame: { x: CENTER.x - RADIUS + 30, y: CENTER.y, health: START_HEALTH },
    aiFlame: { x: CENTER.x + RADIUS - 30, y: CENTER.y, health: START_HEALTH },
    balloons: [], // {x,y,tx,ty,duration,team:'player'|'enemy'}
    telegraphs: [], // {x,y,t,team,origin}
    particles: [],
    floatingText: [],
    shake: { trauma: 0 },
    timeLeft: Math.round(ROUND_SECONDS * mult.time),
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
    setTimeLeft(stateRef.current.timeLeft)
    setPhase('playing')
  }

  const throwAt = (logicalX, logicalY) => {
    const s = stateRef.current
    if (phase !== 'playing') return
    s.balloons.push({
      x: s.player.x,
      y: s.player.y,
      tx: logicalX,
      ty: logicalY,
      t: 0,
      duration: dist(s.player, { x: logicalX, y: logicalY }) / 420,
      team: 'player',
    })
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

      // AI pair + your teammate all wander their half and throw on cadence
      const reticleAi = updateAttacker(s.ai, 'right', s.playerFlame, dt, s.mult)
      if (reticleAi) s.telegraphs.push({ ...reticleAi, t: TELEGRAPH_TIME, team: 'enemy', origin: s.ai })
      const reticleAi2 = updateAttacker(s.ai2, 'right', s.playerFlame, dt, s.mult)
      if (reticleAi2) s.telegraphs.push({ ...reticleAi2, t: TELEGRAPH_TIME, team: 'enemy', origin: s.ai2 })
      const reticleTeam = updateAttacker(s.teammate, 'left', s.aiFlame, dt, s.mult)
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
          } else if (hitsFlameStack(b.tx, b.ty, s.aiFlame)) {
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

    // flame stacks (health as flame emoji count) — big and unmissable
    drawEmoji(ctx, '🪵', s.playerFlame.x, s.playerFlame.y + 36, 30)
    for (let i = 0; i < s.playerFlame.health; i++) drawEmoji(ctx, '🔥', s.playerFlame.x, s.playerFlame.y - i * FLAME_STACK_GAP, 52)
    drawEmoji(ctx, '🪵', s.aiFlame.x, s.aiFlame.y + 36, 30)
    for (let i = 0; i < s.aiFlame.health; i++) drawEmoji(ctx, '🔥', s.aiFlame.x, s.aiFlame.y - i * FLAME_STACK_GAP, 52)

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

    // balloons
    for (const b of s.balloons) drawEmoji(ctx, '💧', b.cx ?? b.x, b.cy ?? b.y, 20)

    // characters
    drawEmoji(ctx, '🧍', s.ai.x, s.ai.y, 30)
    drawEmoji(ctx, '🧍‍♀️', s.ai2.x, s.ai2.y, 30)
    drawEmoji(ctx, '👩‍🚒', s.teammate.x, s.teammate.y, 30)
    drawEmoji(ctx, '🧑‍🚒', s.player.x, s.player.y, 30)

    updateAndDrawParticles(ctx, s.particles, dt)
    updateAndDrawFloatingText(ctx, s.floatingText, dt)
    ctx.restore()
  }, true)

  return (
    <div>
      <GameFrame containerRef={containerRef} canvasRef={canvasRef}>
        <div
          className="absolute inset-0 z-10 cursor-crosshair"
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse') handlePointer(e)
          }}
          onClick={handlePointer}
        />
        <HUD
          left={[`🔥 You: ${hp.player}`]}
          right={[`🔥 AI: ${hp.ai}`, `⏱ ${timeLeft}s`]}
        />
        <GameOverlay
          show={phase === 'ready'}
          emoji="🔥"
          title="Flame Battlers"
          subtitle="You and your teammate face off against two enemy throwers. Douse their flame before yours burns out — stand inside the dashed ring around your own flame to block incoming balloons!"
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
      <p className="mt-3 text-center text-xs text-forest-400/50">Move to dodge · tap/click to throw a balloon · guard the dashed ring around your flame to block</p>
    </div>
  )
}
