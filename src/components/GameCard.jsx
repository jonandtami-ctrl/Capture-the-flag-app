import { Link } from 'react-router-dom'
import { getTheme } from '../lib/theme.js'
import { PLAYABLE_GAMES } from '../games/index.js'

export default function GameCard({ game }) {
  const t = getTheme(game.theme)
  const isPlayable = Boolean(PLAYABLE_GAMES[game.slug])

  return (
    <Link
      to={`/games/${game.slug}`}
      className={`card group flex flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${t.hoverBorder}`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${t.border} ${t.bg} text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          {game.emoji}
        </span>
        <span className={`chip ${t.text}`}>{game.category}</span>
      </div>

      <h3 className="mt-4 font-display text-2xl text-white">{game.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-forest-300/70">{game.tagline}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-forest-300/60">
        <span className="chip">👥 {game.players}</span>
        <span className="chip">⏱ {game.duration}</span>
        <span className="chip">⚡ {game.energy}</span>
      </div>

      <div className={`mt-4 flex items-center gap-1 text-sm font-semibold ${t.text}`}>
        {isPlayable ? '▶ Play now' : 'View game'}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  )
}
