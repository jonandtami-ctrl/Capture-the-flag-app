import { useEffect, useRef, useState } from 'react'
import useSound from '../../lib/useSound.js'

const CATCH_TABLE = [
  { name: 'Old Boot', emoji: '🥾', weight: 35, points: 0 },
  { name: 'Minnow', emoji: '🐟', weight: 30, points: [1, 3] },
  { name: 'Sunfish', emoji: '🐠', weight: 20, points: [2, 4] },
  { name: 'Bass', emoji: '🎣', weight: 10, points: [5, 9] },
  { name: 'Trout', emoji: '🐡', weight: 4, points: [8, 14] },
  { name: 'The Big One', emoji: '🐋', weight: 1, points: [20, 30] },
]

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
  const [phase, setPhase] = useState('idle') // idle | waiting | bite | result
  const [lastCatch, setLastCatch] = useState(null)
  const timeoutRef = useRef(null)
  const biteExpiredRef = useRef(false)
  const sound = useSound()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const castLine = () => {
    setPhase('waiting')
    setLastCatch(null)
    biteExpiredRef.current = false
    const delay = randomInt(1500, 4200)
    timeoutRef.current = setTimeout(() => {
      setPhase('bite')
      sound.tick()
      timeoutRef.current = setTimeout(() => {
        if (!biteExpiredRef.current) {
          biteExpiredRef.current = true
          setPhase('result')
          setLastCatch({ missed: true })
        }
      }, 900)
    }, delay)
  }

  const reel = () => {
    if (phase !== 'bite' || biteExpiredRef.current) return
    biteExpiredRef.current = true
    clearTimeout(timeoutRef.current)
    const catchResult = rollCatch()
    setLastCatch(catchResult)
    setPhase('result')
    setLogs((prev) => ({
      ...prev,
      [activeAngler]: [...(prev[activeAngler] ?? []), catchResult],
    }))
    if (catchResult.points > 0) sound.complete()
    else sound.click()
  }

  const reset = () => {
    clearTimeout(timeoutRef.current)
    setPhase('idle')
    setLastCatch(null)
  }

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
      <h3 className="font-display text-2xl text-white">🎣 Cast & Catch</h3>
      <p className="mt-1 text-sm text-forest-300/60">
        Cast your line, wait for a bite, then reel it in the instant you see one — timing is everything.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {anglers.map((name, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveAngler(i)
              reset()
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

        {phase === 'bite' && (
          <>
            <span className="text-6xl animate-flicker">🐟💦</span>
            <p className="mt-3 font-display text-2xl text-ember-300">Something's biting — REEL IT IN!</p>
            <button onClick={reel} className="btn-primary mt-4 animate-pulseRing">
              ⚡ Reel!
            </button>
          </>
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
