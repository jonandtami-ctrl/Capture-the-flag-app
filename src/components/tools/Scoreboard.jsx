import { useState } from 'react'
import useSound from '../../lib/useSound.js'

const COLORS = [
  'from-ember-500 to-ember-700',
  'from-forest-500 to-forest-700',
  'from-sky-400 to-sky-600',
  'from-violet-400 to-violet-600',
  'from-yellow-400 to-yellow-600',
  'from-rose-400 to-rose-600',
]

export default function Scoreboard() {
  const [teams, setTeams] = useState([
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 },
  ])
  const [newName, setNewName] = useState('')
  const sound = useSound()

  const addTeam = () => {
    const name = newName.trim() || `Team ${teams.length + 1}`
    setTeams((prev) => [...prev, { name, score: 0 }])
    setNewName('')
    sound.click()
  }

  const removeTeam = (i) => setTeams((prev) => prev.filter((_, idx) => idx !== i))

  const adjust = (i, delta) => {
    setTeams((prev) => prev.map((t, idx) => (idx === i ? { ...t, score: Math.max(0, t.score + delta) } : t)))
    if (delta > 0) sound.point()
  }

  const rename = (i, name) => {
    setTeams((prev) => prev.map((t, idx) => (idx === i ? { ...t, name } : t)))
  }

  const resetScores = () => setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })))

  const maxScore = Math.max(0, ...teams.map((t) => t.score))

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl text-white">Scoreboard</h3>
        <button onClick={resetScores} className="btn-ghost text-sm">
          ↺ Reset scores
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {teams.map((team, i) => {
          const isLeading = team.score === maxScore && maxScore > 0
          return (
            <div
              key={i}
              className={`overflow-hidden rounded-xl border bg-dusk-900/60 transition-all ${
                isLeading ? 'border-ember-400/50 shadow-glow' : 'border-white/10'
              }`}
            >
              <div className={`bg-gradient-to-r ${COLORS[i % COLORS.length]} px-4 py-2 flex items-center gap-2`}>
                <input
                  value={team.name}
                  onChange={(e) => rename(i, e.target.value)}
                  className="min-w-0 flex-1 bg-transparent font-display tracking-wide text-white placeholder:text-white/50 focus:outline-none"
                />
                {isLeading && <span title="Leading">👑</span>}
                {teams.length > 1 && (
                  <button
                    onClick={() => removeTeam(i)}
                    className="text-white/60 hover:text-white"
                    aria-label={`Remove ${team.name}`}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-4">
                <button
                  onClick={() => adjust(i, -1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-xl text-forest-200 hover:bg-white/5 active:scale-90"
                >
                  −
                </button>
                <span className="font-display text-4xl tabular-nums text-white">{team.score}</span>
                <button
                  onClick={() => adjust(i, 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ember-400/40 bg-ember-500/10 text-xl text-ember-300 hover:bg-ember-500/20 active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {teams.length < 6 && (
        <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTeam()}
            placeholder={`Team ${teams.length + 1} name`}
            className="flex-1 rounded-xl border border-white/10 bg-dusk-900/80 px-4 py-2.5 text-sm text-white placeholder:text-forest-500/40 focus:border-forest-400/50 focus:outline-none"
          />
          <button onClick={addTeam} className="btn-secondary">
            + Add team
          </button>
        </div>
      )}
    </div>
  )
}
