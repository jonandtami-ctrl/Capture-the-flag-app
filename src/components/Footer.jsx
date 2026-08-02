import { Link } from 'react-router-dom'
import AdSlot from './AdSlot.jsx'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-dusk-950/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <AdSlot format="horizontal" className="mb-10" />

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏕️</span>
              <span className="font-display text-lg text-white">CampHQ</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-forest-300/60">
              The camp games everyone actually wants to play — pick one and jump
              straight in.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-forest-300/50">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-forest-300/70">
              <li><Link to="/games" className="hover:text-forest-100">Program Central</Link></li>
              <li><Link to="/about" className="hover:text-forest-100">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-forest-300/50">
              Popular Games
            </h4>
            <ul className="space-y-2 text-sm text-forest-300/70">
              <li><Link to="/games/capture-the-flag" className="hover:text-forest-100">Capture the Flag</Link></li>
              <li><Link to="/games/flame-battlers" className="hover:text-forest-100">Flame Battlers</Link></li>
              <li><Link to="/games/risk-takers" className="hover:text-forest-100">Risk Takers</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-forest-300/40 sm:flex-row">
          <span>© {new Date().getFullYear()} CampHQ. Built for camps, scouts, and backyard rivalries.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-forest-200">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-forest-200">Terms & Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
