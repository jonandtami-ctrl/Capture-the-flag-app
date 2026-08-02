import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/games', label: 'Program Central' },
  { to: '/tools', label: 'Tools' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-dusk-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="group flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="text-2xl transition-transform group-hover:-rotate-12">🏕️</span>
          <span className="font-display text-xl text-white sm:text-2xl">
            Camp<span className="text-ember-400">HQ</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-forest-500/15 text-forest-200'
                    : 'text-forest-300/70 hover:bg-white/5 hover:text-forest-100'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/games" className="btn-primary ml-2 !px-4 !py-2 text-sm">
            Start a Game
          </NavLink>
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-forest-100 sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/5 px-4 pb-4 sm:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-semibold ${
                  isActive ? 'bg-forest-500/15 text-forest-200' : 'text-forest-300/70'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
