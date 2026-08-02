import { useEffect, useRef, useState } from 'react'
import useGameLoop from '../../games/engine/useGameLoop.js'
import useKeyboard from '../../games/engine/useKeyboard.js'
import { clamp, rand } from '../../games/engine/utils.js'
import useSound from '../../lib/useSound.js'

const CATCH_TABLE = [
  { name: 'Old Boot', emoji: '🥾', weight: 35, points: 0, zone: 42, fishSpeed: 0.4 },
  { name: 'Minnow', emoji: '🐟', weight: 30, points: [1, 3], zone: 36, fishSpeed: 0.6 },
  { name: 'Sunfish', emoji: '🐠', weight: 20, points: [2, 4], zone: 30, fishSpeed: 0.8 },
  { name: 'Bass', emoji: '🎣', weight: 10, points: [5, 9], zone: 22, fishSpeed: 1.1 },
  { name: 'Trout', emoji: '🐡', weight: 4, points: [8, 14], zone: 16, fishSpeed: 1.5 },
  { name: 'The Big One', emoji: '🐋', weight: 1, points: [20, 30], zone: 11, fishSpeed: 2 },
]

const REEL_ACCEL = 130
const GRAVITY = 95
const MAX_REEL_SPEED = 70
const PROGRESS_FILL_RATE = 26
const PROGRESS_DRAIN_RATE = 15
const REEL_TIME_LIMIT = 14

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function rollCatch() {
  const totalWeight = CATCH_TABLE.reduce((s, f) => s + f.weight, 0)
  let roll = Math.random() * totalWeight
  for (const fish of CATCH_TABLE) {
    if (roll < fish.weight) {
      const points = Array.isArray(fish.points) ? randomInt(...fish.points) : fish.points
      return { ...fish, points }
    }
    roll -= fish.weight
  }
  return { ...CATCH_TABLE[0], points: 0 }
}

export default function FishingGame() {
  const [anglers, setAnglers] = useState(['Angler 1'])
  const [activeAngler, setActiveAngler] = useState(0)
  const [newName, setNewName] = useState('')
  const [logs, setLogs] = useState({}) // { anglerIdx: [{name, emoji, points}] }
  const [phase, setPhase] = useState('idle') // idle | waiting | reeling | result
  const [lastCatch, setLastCatch] = useState(null)
  const [progressDisplay, setProgressDisplay] = useState(0)
  const [streak, setStreak] = useState(0)
  const timeoutRef = useRef(null)
  const { actionRef } = useKeyboard()
  const holdingRef = useRef(false)
  const sound = useSound()

  const fishRef = useRef({ pos: 50, vel: 0, kickCd: 1 })
  const reelRef = useRef({ pos: 50, vel: 0 })
  const progressRef = useRef(0)
  const timeLeftRef = useRef(REEL_TIME_LIMIT)
  const catchRef = useRef(null)
  const fishTrackRef = useRef(null)
  const reelMarkerRef = useRef(null)
  const progressBarRef = useRef(null)
  const hudAccum = useRef(0)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const castLine = () => {
    setPhase('waiting')
    setLastCatch(null)
    const delay = randomInt(1200, 3600)
    timeoutRef.current = setTimeout(() => {
      const fish = rollCatch()
      catchRef.current = fish
      fishRef.current = { pos: rand(30, 70), vel: rand(-1, 1), kickCd: rand(0.8, 1.8) }
      reelRef.current = { pos: 50, vel: 0 }
      progressRef.current = 18
      timeLeftRef.current = REEL_TIME_LIMIT
      setProgressDisplay(18)
      setPhase('reeling')
      sound.tick()
    }, delay)
  }

  const finishReel = (success) => {
    const fish = catchRef.current
    setPhase('result')
    if (success && fish.points > 0) {
      const nextStreak = streak + 1
      setStreak(nextStreak)
      const bonus = Math.round(fish.points * Math.min(nextStreak - 1, 5) * 0.15)
      const landed = { ...fish, points: fish.points + bonus, bonus, streak: nextStreak }
      setLastCatch(landed)
      setLogs((prev) => ({
        ...prev,
        [activeAngler]: [...(prev[activeAngler] ?? []), landed],
      }))
      sound.complete()
    } else if (success) {
      setStreak(0)
      setLastCatch(fish)
      setLogs((prev) => ({
        ...prev,
        [activeAngler]: [...(prev[activeAngler] ?? []), fish],
      }))
      sound.click()
    } else {
      setStreak(0)
      setLastCatch({ missed: true })
      sound.click()
    }
  }

  useGameLoop((dt) => {
    if (phase !== 'reeling') return
    const fish = fishRef.current
    const reel = reelRef.current
    const catching = catchRef.current

    // fish struggles: gentle drift plus the occasional sharp dart
    fish.kickCd -= dt
    if (fish.kickCd <= 0) {
      fish.vel += rand(-1, 1) * catching.fishSpeed * 55
      fish.kickCd = rand(0.5, 1.4)
    }
    fish.vel = clamp(fish.vel, -MAX_REEL_SPEED * catching.fishSpeed, MAX_REEL_SPEED * catching.fishSpeed)
    fish.pos += fish.vel * dt
    if (fish.pos < 6) { fish.pos = 6; fish.vel = Math.abs(fish.vel) }
    if (fish.pos > 94) { fish.pos = 94; fish.vel = -Math.abs(fish.vel) }

    // reel: hold to climb, release to sink back down
    const holding = holdingRef.current || actionRef.current
    reel.vel += (holding ? REEL_ACCEL : -GRAVITY) * dt
    reel.vel = clamp(reel.vel, -MAX_REEL_SPEED, MAX_REEL_SPEED)
    reel.pos = clamp(reel.pos + reel.vel * dt, 0, 100)
    if (reel.pos === 0 || reel.pos === 100) reel.vel = 0

    const overlap = Math.abs(reel.pos - fish.pos) < catching.zone / 2
    progressRef.current = clamp(
      progressRef.current + (overlap ? PROGRESS_FILL_RATE : -PROGRESS_DRAIN_RATE) * dt,
      0,
      100,
    )
    timeLeftRef.current -= dt

    // direct DOM updates — smooth 60fps motion without re-rendering React
    if (fishTrackRef.current) fishTrackRef.current.style.left = `${fish.pos - catching.zone / 2}%`
    if (fishTrackRef.current) fishTrackRef.current.style.width = `${catching.zone}%`
    if (reelMarkerRef.current) {
      reelMarkerRef.current.style.left = `${reel.pos}%`
      // instant color feedback so "in the zone" reads at a glance, every frame
      reelMarkerRef.current.style.backgroundColor = overlap ? '#43cc86' : '#f9581a'
      reelMarkerRef.current.style.boxShadow = overlap ? '0 0 14px 2px rgba(67,204,134,0.7)' : '0 0 8px 1px rgba(249,88,26,0.5)'
    }
    if (progressBarRef.current) progressBarRef.current.style.width = `${progressRef.current}%`

    hudAccum.current += dt
    if (hudAccum.current > 0.1) {
      hudAccum.current = 0
      setProgressDisplay(Math.round(progressRef.current))
    }

    if (progressRef.current >= 100) finishReel(true)
    else if (progressRef.current <= 0 || timeLeftRef.current <= 0) finishReel(false)
  }, phase === 'reeling')

  const addAngler = () => {
    const name = newName.trim() || `Angler ${anglers.length + 1}`
    setAnglers((prev) => [...prev, name])
    setNewName('')
    sound.click()
  }

  const totalPoints = (idx) => (logs[idx] ?? []).reduce((s, c) => s + c.points, 0)
  const biggestCatch = (idx) => {
    const catches = (logs[idx] ?? []).filter((c) => c.points > 0)
    if (catches.length === 0) return null
    return catches.reduce((best, c) => (c.points > best.points ? c : best))
  }

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-display text-2xl text-white">🎣 Cast & Reel</h3>
      <p className="mt-1 text-sm text-forest-300/60">
        Cast your line, wait for a bite, then hold to reel up and release to let out slack — keep the
        marker on the fish to land it.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {anglers.map((name, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveAngler(i)
              setPhase('idle')
              clearTimeout(timeoutRef.current)
            }}
            className={`chip transition-colors ${
              activeAngler === i ? 'border-forest-400/60 bg-forest-500/20 text-forest-100' : 'hover:text-forest-100'
            }`}
          >
            🧑‍🎣 {name}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addAngler()}
          placeholder="Add another angler"
          className="flex-1 rounded-xl border border-white/10 bg-dusk-900/80 px-4 py-2 text-sm text-white placeholder:text-forest-500/40 focus:border-forest-400/50 focus:outline-none"
        />
        <button onClick={addAngler} className="btn-secondary text-sm">
          + Add
        </button>
      </div>

      {/* Pond / cast area */}
      <div className="mt-6 flex flex-col items-center rounded-2xl border border-white/10 bg-gradient-to-b from-sky-500/10 to-forest-900/40 p-8 text-center">
        {phase === 'idle' && (
          <>
            <span className="text-5xl">🪝</span>
            <p className="mt-3 text-forest-200/70">{anglers[activeAngler]}'s turn at the dock.</p>
            <button onClick={castLine} className="btn-primary mt-4">
              Cast Line
            </button>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <span className="text-5xl animate-floaty">🎣</span>
            <p className="mt-3 text-forest-200/70">Line's in the water... wait for it...</p>
          </>
        )}

        {phase === 'reeling' && (
          <div
            className="w-full max-w-sm select-none"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              holdingRef.current = true
            }}
            onPointerUp={() => { holdingRef.current = false }}
            onPointerCancel={() => { holdingRef.current = false }}
          >
            <p className="font-display text-xl text-ember-300">
              Something's on the line — {catchRef.current?.emoji} keep reeling!
            </p>
            {streak > 0 && <p className="mt-1 text-xs font-semibold text-forest-300">🔥 Streak: {streak} — green zone = bonus points!</p>}
            <div className="relative mt-4 h-10 w-full overflow-hidden rounded-full border border-white/10 bg-dusk-950/70">
              <div ref={fishTrackRef} className="absolute inset-y-0 rounded-full bg-sky-500/40" style={{ left: '40%', width: '30%' }} />
              <div
                ref={reelMarkerRef}
                className="absolute top-1/2 h-8 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-400 shadow-glow"
                style={{ left: '50%' }}
              />
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-dusk-950/70">
              <div ref={progressBarRef} className="h-full rounded-full bg-forest-400 transition-[width]" style={{ width: '18%' }} />
            </div>
            <p className="mt-1 text-xs text-forest-400/60">{progressDisplay}% landed</p>
            <button className="btn-primary mt-4 w-full touch-none">Hold to reel</button>
          </div>
        )}

        {phase === 'result' && lastCatch && (
          <>
            {lastCatch.missed ? (
              <>
                <span className="text-5xl">💨</span>
                <p className="mt-3 text-forest-200/70">The one that got away...</p>
              </>
            ) : (
              <>
                <span className="text-6xl">{lastCatch.emoji}</span>
                <p className="mt-3 font-display text-2xl text-white">
                  {lastCatch.name}
                  {lastCatch.points > 0 && <span className="text-forest-300"> · +{lastCatch.points} pts</span>}
                </p>
                {lastCatch.bonus > 0 && (
                  <p className="mt-1 text-sm font-semibold text-ember-300">🔥 Streak x{lastCatch.streak} bonus: +{lastCatch.bonus}!</p>
                )}
              </>
            )}
            <button onClick={castLine} className="btn-secondary mt-4">
              Cast again
            </button>
          </>
        )}
      </div>

      {/* Leaderboard */}
      <div className="mt-6 border-t border-white/5 pt-5">
        <h4 className="font-display text-lg text-white">Catch log</h4>
        <div className="mt-3 space-y-2">
          {[...anglers]
            .map((name, i) => ({ name, i, points: totalPoints(i), best: biggestCatch(i), count: (logs[i] ?? []).length }))
            .sort((a, b) => b.points - a.points)
            .map(({ name, i, points, best, count }) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-dusk-900/60 px-4 py-2.5">
                <span className="text-sm font-semibold text-forest-100">{name}</span>
                <span className="text-xs text-forest-300/50">
                  {count} catch{count === 1 ? '' : 'es'} {best && `· best: ${best.emoji} ${best.name}`}
                </span>
                <span className="font-display text-lg text-white">{points} pts</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
