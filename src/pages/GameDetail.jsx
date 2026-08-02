import { Link, Navigate, useParams } from 'react-router-dom'
import { getGameBySlug, games } from '../data/games.js'
import { getTheme } from '../lib/theme.js'
import ToolTabs from '../components/tools/ToolTabs.jsx'
import AdSlot from '../components/AdSlot.jsx'
import GameCard from '../components/GameCard.jsx'

export default function GameDetail() {
  const { slug } = useParams()
  const game = getGameBySlug(slug)

  if (!game) return <Navigate to="/games" replace />

  const t = getTheme(game.theme)
  const sameCategory = games.filter((g) => g.slug !== game.slug && g.category === game.category)
  const others = games.filter((g) => g.slug !== game.slug && g.category !== game.category)
  const fallbackRelated = [...sameCategory, ...others].slice(0, 3)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/games" className="text-sm font-semibold text-forest-300/70 hover:text-forest-100">
        ← All games
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
        <span className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border ${t.border} ${t.bg} text-6xl`}>
          {game.emoji}
        </span>
        <div>
          <span className={`chip ${t.text}`}>{game.category}</span>
          <h1 className="section-heading mt-2 text-4xl sm:text-5xl">{game.name}</h1>
          <p className="mt-2 max-w-2xl text-forest-300/70">{game.tagline}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="chip">👥 {game.players}</span>
        <span className="chip">⏱ {game.duration}</span>
        <span className="chip">⚡ Energy: {game.energy}</span>
      </div>

      {game.safetyNote && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-ember-500/30 bg-ember-500/10 p-4 text-sm text-ember-100/90">
          <span className="text-xl">⚠️</span>
          <div>
            <span className="font-semibold text-ember-200">Before you play: </span>
            {game.safetyNote}
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1.4fr]">
        {/* Rules column */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-2xl text-white">🎒 What you need</h2>
            <ul className="mt-3 space-y-2 text-sm text-forest-200/80">
              {game.equipment.map((e) => (
                <li key={e} className="flex gap-2">
                  <span className={t.text}>•</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-2xl text-white">📋 Setup</h2>
            <ol className="mt-3 space-y-3 text-sm text-forest-200/80">
              {game.setup.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${t.bg} ${t.text} text-xs font-bold`}>
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-2xl text-white">📜 Rules</h2>
            <ul className="mt-3 space-y-3 text-sm text-forest-200/80">
              {game.rules.map((r, i) => (
                <li key={i} className="flex gap-3">
                  <span className={t.text}>✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {game.variants?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display text-2xl text-white">✨ Fun variants</h2>
              <ul className="mt-3 space-y-3 text-sm text-forest-200/80">
                {game.variants.map((v, i) => (
                  <li key={i} className="flex gap-3">
                    <span className={t.text}>★</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tools column */}
        <div>
          <h2 className="font-display text-2xl text-white">🛠 Game Tools</h2>
          <p className="mt-1 text-sm text-forest-300/60">Everything you need to run {game.name} on the spot.</p>
          <div className="mt-4">
            <ToolTabs tools={game.tools} storageKey={game.slug} />
          </div>
        </div>
      </div>

      <div className="mt-14">
        <AdSlot format="horizontal" />
      </div>

      {fallbackRelated.length > 0 && (
        <div className="mt-14">
          <h2 className="section-heading">You might also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fallbackRelated.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
