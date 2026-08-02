import { useMemo, useState } from 'react'
import { games, categories } from '../data/games.js'
import GameCard from '../components/GameCard.jsx'
import ProgramCentralMap from '../components/ProgramCentralMap.jsx'

export default function GamesLibrary() {
  const [view, setView] = useState('map') // map | list
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const matchesCategory = category === 'All' || g.category === category
      const matchesQuery =
        query.trim() === '' ||
        g.name.toLowerCase().includes(query.toLowerCase()) ||
        g.tagline.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <span className="chip mx-auto">🏕️ Program Central</span>
        <h1 className="section-heading mt-4">{games.length} games, one home base</h1>
        <p className="mx-auto mt-3 max-w-xl text-forest-300/70">
          Program Central is your jumping-off point — pick a station on the map, or
          switch to the list to search and filter.
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        <button
          onClick={() => setView('map')}
          className={`chip transition-colors ${
            view === 'map' ? 'border-forest-400/60 bg-forest-500/20 text-forest-100' : 'hover:text-forest-100'
          }`}
        >
          🗺️ Map view
        </button>
        <button
          onClick={() => setView('list')}
          className={`chip transition-colors ${
            view === 'list' ? 'border-forest-400/60 bg-forest-500/20 text-forest-100' : 'hover:text-forest-100'
          }`}
        >
          📋 List view
        </button>
      </div>

      {view === 'map' ? (
        <div className="mt-8">
          <ProgramCentralMap games={games} />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full rounded-xl border border-white/10 bg-dusk-900/80 px-4 py-3 text-sm text-white placeholder:text-forest-500/40 focus:border-forest-400/50 focus:outline-none sm:max-w-xs"
            />
            <div className="flex flex-wrap gap-2">
              {['All', ...categories].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`chip transition-colors ${
                    category === c ? 'border-forest-400/60 bg-forest-500/20 text-forest-100' : 'hover:text-forest-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-16 text-center text-forest-300/60">
              No games match that search. Try a different keyword.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((g) => (
                <GameCard key={g.slug} game={g} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
