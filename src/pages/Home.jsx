import { Link } from 'react-router-dom'
import { games } from '../data/games.js'
import GameCard from '../components/GameCard.jsx'
import AdSlot from '../components/AdSlot.jsx'

const FEATURES = [
  {
    icon: '🎮',
    title: 'Play in seconds',
    desc: 'No install, no sign-up. Pick a game and you\'re moving a character within a click.',
  },
  {
    icon: '🤖',
    title: 'You vs. the AI',
    desc: 'Every game pits you against computer-controlled opponents — quick rounds, no waiting on other players.',
  },
  {
    icon: '⚡',
    title: 'Fast rounds',
    desc: 'Most games wrap up in 45-90 seconds, so you can squeeze in a round (or five) whenever.',
  },
]

export default function Home() {
  const featured = games.slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-forest-500/20 blur-3xl" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-ember-500/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <span className="chip mx-auto animate-floaty">🏕️ Camp games, playable right now</span>
          <h1 className="section-heading mt-5 text-5xl sm:text-6xl md:text-7xl">
            Every camp game.
            <br />
            <span className="text-ember-400">Playable right now.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-forest-200/70">
            Capture the Flag, Flame Battlers, Risk Takers, and the rest of the classics —
            reimagined as real browser games you play against the computer. No install,
            no waiting for other players.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/games/capture-the-flag" className="btn-primary text-base">
              🚩 Play now
            </Link>
            <Link to="/games" className="btn-secondary text-base">
              Browse all games
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 font-display text-xl text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-forest-300/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured games */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="chip">Popular right now</span>
            <h2 className="section-heading mt-3">Pick your game</h2>
          </div>
          <Link to="/games" className="hidden text-sm font-semibold text-forest-300 hover:text-forest-100 sm:block">
            See all games →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>

        <Link to="/games" className="btn-secondary mt-8 flex w-full items-center justify-center sm:hidden">
          See all games →
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <AdSlot format="horizontal" />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        <div className="card overflow-hidden p-10 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-forest-500/10 via-transparent to-ember-500/10" />
          <span className="text-4xl">⏳</span>
          <h2 className="section-heading mt-4">Got 60 seconds?</h2>
          <p className="mx-auto mt-3 max-w-xl text-forest-300/70">
            Sneak up on the counselor in Prank Wars, dodge sharks, or see if you can out-trade
            the market bot — every game here is a quick round away.
          </p>
          <Link to="/games/prank-wars" className="btn-primary mt-6 inline-flex">
            Try Prank Wars
          </Link>
        </div>
      </section>
    </div>
  )
}
