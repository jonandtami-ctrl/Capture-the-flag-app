import { useState } from 'react'
import { holes, totalPar, courseName } from '../../data/discGolfCourse.js'
import useSound from '../../lib/useSound.js'

const PLAYER_COLORS = ['text-ember-300', 'text-forest-300', 'text-sky-300', 'text-violet-300', 'text-yellow-300', 'text-rose-300']

function relativeToPar(n) {
  if (n === 0) return '—'
  return n > 0 ? `+${n}` : `${n}`
}

export default function DiscGolfScorecard() {
  const [players, setPlayers] = useState(['Player 1', 'Player 2'])
  const [newName, setNewName] = useState('')
  const [scores, setScores] = useState({}) // { playerIdx: { holeNumber: strokes } }
  const [activeHole, setActiveHole] = useState(1)
  const sound = useSound()

  const addPlayer = () => {
    const name = newName.trim() || `Player ${players.length + 1}`
    setPlayers((prev) => [...prev, name])
    setNewName('')
    sound.click()
  }

  const removePlayer = (idx) => {
    setPlayers((prev) => prev.filter((_, i) => i !== idx))
    setScores((prev) => {
      const next = { ...prev }
      delete next[idx]
      return next
    })
  }

  const setStroke = (playerIdx, holeNumber, value) => {
    const strokes = Math.max(0, Number(value) || 0)
    setScores((prev) => ({
      ...prev,
      [playerIdx]: { ...prev[playerIdx], [holeNumber]: strokes },
    }))
    if (strokes > 0) sound.tick()
  }

  const totalFor = (playerIdx) => {
    const rounds = scores[playerIdx] ?? {}
    return Object.values(rounds).reduce((sum, s) => sum + s, 0)
  }

  const holesPlayed = (playerIdx) => Object.values(scores[playerIdx] ?? {}).filter((s) => s > 0).length

  const current = holes[activeHole - 1]

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-2xl text-white">{courseName} Scorecard</h3>
          <p className="text-sm text-forest-300/60">18 holes · Course par {totalPar}</p>
        </div>
      </div>

      {/* Players */}
      <div className="mt-4 flex flex-wrap gap-2">
        {players.map((name, i) => (
          <span key={i} className="chip gap-2 normal-case tracking-normal">
            <span className={PLAYER_COLORS[i % PLAYER_COLORS.length]}>●</span>
            {name}
            {players.length > 1 && (
              <button onClick={() => removePlayer(i)} className="text-forest-400/60 hover:text-ember-400">
                ✕
              </button>
            )}
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          placeholder={`Player ${players.length + 1} name`}
          className="flex-1 rounded-xl border border-white/10 bg-dusk-900/80 px-4 py-2 text-sm text-white placeholder:text-forest-500/40 focus:border-forest-400/50 focus:outline-none"
        />
        <button onClick={addPlayer} className="btn-secondary text-sm">
          + Add player
        </button>
      </div>

      {/* Hole picker */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-2">
        {holes.map((h) => {
          const done = players.every((_, i) => (scores[i]?.[h.number] ?? 0) > 0)
          return (
            <button
              key={h.number}
              onClick={() => setActiveHole(h.number)}
              className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border text-xs font-semibold transition-colors ${
                activeHole === h.number
                  ? 'border-forest-400/60 bg-forest-500/20 text-forest-100'
                  : done
                    ? 'border-white/10 bg-white/5 text-forest-300/40'
                    : 'border-white/10 text-forest-300/60 hover:bg-white/5'
              }`}
            >
              <span>{h.number}</span>
              <span className="text-[9px] opacity-60">par {h.par}</span>
            </button>
          )
        })}
      </div>

      {/* Active hole entry */}
      <div className="mt-4 rounded-xl border border-white/10 bg-dusk-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="chip">Hole {current.number} · Par {current.par}</span>
            <h4 className="mt-2 font-display text-xl text-white">{current.name}</h4>
            <p className="text-xs text-forest-300/60">{current.distance} ft</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveHole((h) => Math.max(1, h - 1))}
              disabled={activeHole === 1}
              className="btn-ghost !px-3 !py-2 text-sm"
            >
              ←
            </button>
            <button
              onClick={() => setActiveHole((h) => Math.min(18, h + 1))}
              disabled={activeHole === 18}
              className="btn-ghost !px-3 !py-2 text-sm"
            >
              →
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-forest-200/70">{current.feature}</p>

        <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
          {players.map((name, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className={`text-sm ${PLAYER_COLORS[i % PLAYER_COLORS.length]}`}>{name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStroke(i, current.number, (scores[i]?.[current.number] ?? 0) - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-forest-200 hover:bg-white/5"
                >
                  −
                </button>
                <span className="w-6 text-center font-display text-lg tabular-nums text-white">
                  {scores[i]?.[current.number] ?? 0}
                </span>
                <button
                  onClick={() => setStroke(i, current.number, (scores[i]?.[current.number] ?? 0) + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-ember-400/40 bg-ember-500/10 text-ember-300 hover:bg-ember-500/20"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mt-6 border-t border-white/5 pt-5">
        <h4 className="font-display text-lg text-white">Leaderboard</h4>
        <div className="mt-3 space-y-2">
          {[...players]
            .map((name, i) => ({ name, i, total: totalFor(i), played: holesPlayed(i) }))
            .sort((a, b) => (a.total || 999) - (b.total || 999))
            .map(({ name, i, total, played }) => {
              const parSoFar = holes.slice(0, played).reduce((s, h) => s + h.par, 0)
              const diff = total - parSoFar
              return (
                <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-dusk-900/60 px-4 py-2.5">
                  <span className={`text-sm font-semibold ${PLAYER_COLORS[i % PLAYER_COLORS.length]}`}>{name}</span>
                  <span className="text-xs text-forest-300/50">{played}/18 holes</span>
                  <span className="font-display text-lg text-white">
                    {total || '—'} <span className="text-sm text-forest-300/50">({relativeToPar(diff)})</span>
                  </span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
