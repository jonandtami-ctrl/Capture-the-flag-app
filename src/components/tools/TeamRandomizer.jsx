import { useEffect, useState } from 'react'
import useSound from '../../lib/useSound.js'

const TEAM_COLORS = [
  { name: 'Ember', class: 'from-ember-500 to-ember-700', text: 'text-ember-300' },
  { name: 'Forest', class: 'from-forest-500 to-forest-700', text: 'text-forest-300' },
  { name: 'Sky', class: 'from-sky-400 to-sky-600', text: 'text-sky-300' },
  { name: 'Violet', class: 'from-violet-400 to-violet-600', text: 'text-violet-300' },
  { name: 'Gold', class: 'from-yellow-400 to-yellow-600', text: 'text-yellow-300' },
  { name: 'Rose', class: 'from-rose-400 to-rose-600', text: 'text-rose-300' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TeamRandomizer({ storageKey = 'default' }) {
  const key = `bcg-roster-${storageKey}`
  const [names, setNames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState(null)
  const sound = useSound()

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(names))
  }, [names, key])

  const addNames = () => {
    const parts = input
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    setNames((prev) => [...prev, ...parts])
    setInput('')
    sound.click()
  }

  const removeName = (i) => {
    setNames((prev) => prev.filter((_, idx) => idx !== i))
  }

  const clearAll = () => {
    setNames([])
    setTeams(null)
  }

  const generateTeams = () => {
    if (names.length < 2) return
    const shuffled = shuffle(names)
    const count = Math.min(teamCount, names.length)
    const result = Array.from({ length: count }, () => [])
    shuffled.forEach((name, i) => result[i % count].push(name))
    setTeams(result)
    sound.start()
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl text-white">Team Randomizer</h3>
        <span className="chip">{names.length} players</span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNames()}
          placeholder="Type a name, or paste a list (comma or newline separated)"
          className="flex-1 rounded-xl border border-white/10 bg-dusk-900/80 px-4 py-3 text-sm text-white placeholder:text-forest-500/40 focus:border-forest-400/50 focus:outline-none"
        />
        <button onClick={addNames} className="btn-secondary shrink-0">
          Add
        </button>
      </div>

      {names.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {names.map((n, i) => (
            <span key={`${n}-${i}`} className="chip gap-2 normal-case tracking-normal">
              {n}
              <button
                onClick={() => removeName(i)}
                className="text-forest-400/60 hover:text-ember-400"
                aria-label={`Remove ${n}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/5 pt-5">
        <label className="flex items-center gap-3 text-sm text-forest-300/70">
          Teams
          <input
            type="number"
            min={2}
            max={8}
            value={teamCount}
            onChange={(e) => setTeamCount(Number(e.target.value))}
            className="w-16 rounded-lg border border-white/10 bg-dusk-900/80 px-2 py-1.5 text-center text-white focus:border-forest-400/50 focus:outline-none"
          />
        </label>

        <button
          onClick={generateTeams}
          disabled={names.length < 2}
          className="btn-primary"
        >
          🎲 Shuffle Teams
        </button>

        {names.length > 0 && (
          <button onClick={clearAll} className="btn-ghost ml-auto text-sm">
            Clear roster
          </button>
        )}
      </div>

      {teams && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team, i) => {
            const color = TEAM_COLORS[i % TEAM_COLORS.length]
            return (
              <div
                key={i}
                className="animate-[fadeIn_0.4s_ease] overflow-hidden rounded-xl border border-white/10 bg-dusk-900/60"
              >
                <div className={`bg-gradient-to-r ${color.class} px-4 py-2 font-display tracking-wide text-white`}>
                  Team {color.name}
                </div>
                <ul className="divide-y divide-white/5">
                  {team.map((n) => (
                    <li key={n} className="px-4 py-2 text-sm text-forest-100">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
