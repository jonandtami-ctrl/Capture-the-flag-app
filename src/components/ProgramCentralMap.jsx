import { Link } from 'react-router-dom'
import { getTheme } from '../lib/theme.js'

// Lays every game out radially around a central "CampHQ" hub, like stations
// on a camp map. Positions are computed in percentage/viewBox units so the
// SVG trail lines always line up with the absolutely-positioned node
// buttons, regardless of the container's actual pixel size.
const RADIUS_X = 40
const RADIUS_Y = 36

export default function ProgramCentralMap({ games }) {
  const nodes = games.map((game, i) => {
    const angle = (i / games.length) * Math.PI * 2 - Math.PI / 2
    const x = 50 + RADIUS_X * Math.cos(angle)
    const y = 50 + RADIUS_Y * Math.sin(angle)
    return { game, x, y }
  })

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-3xl border border-white/10 bg-dusk-950 bg-grain sm:h-[600px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest-500/10 blur-3xl" />
      </div>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {nodes.map(({ game, x, y }) => (
          <line
            key={game.slug}
            x1={50}
            y1={50}
            x2={x}
            y2={y}
            stroke="rgba(228, 155, 95, 0.35)"
            strokeWidth="0.6"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* CampHQ centerpiece */}
      <div className="absolute left-1/2 top-1/2 z-10 flex w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center sm:w-48">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-ember-400/60 bg-dusk-900 text-4xl shadow-glow sm:h-24 sm:w-24 sm:text-5xl">
          🏕️
        </div>
        <h3 className="mt-2 font-display text-lg text-white sm:text-xl">Program Central</h3>
        <p className="mt-1 text-[11px] leading-snug text-forest-300/60 sm:text-xs">
          Pick a station on the map to jump straight into that game.
        </p>
      </div>

      {/* game stations */}
      {nodes.map(({ game, x, y }) => {
        const t = getTheme(game.theme)
        return (
          <Link
            key={game.slug}
            to={`/games/${game.slug}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            className="group absolute z-10 flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center sm:w-24"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full border ${t.border} ${t.bg} text-xl shadow-card transition-transform duration-200 group-hover:scale-110 group-hover:shadow-glow sm:h-14 sm:w-14 sm:text-2xl`}
            >
              {game.emoji}
            </span>
            <span className="rounded-md bg-dusk-950/80 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-forest-100 sm:text-xs">
              {game.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
