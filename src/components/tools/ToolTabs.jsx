import { useState } from 'react'
import TeamRandomizer from './TeamRandomizer.jsx'
import CountdownTimer from './CountdownTimer.jsx'
import Scoreboard from './Scoreboard.jsx'
import MarketGame from './MarketGame.jsx'
import RoleAssigner from './RoleAssigner.jsx'

const ALL_TOOLS = {
  teams: { label: 'Team Randomizer', icon: '🎲', Component: TeamRandomizer },
  timer: { label: 'Timer', icon: '⏱', Component: CountdownTimer },
  scoreboard: { label: 'Scoreboard', icon: '🏆', Component: Scoreboard },
  market: { label: 'Market Simulator', icon: '📈', Component: MarketGame },
  roles: { label: 'Secret Roles', icon: '🕵️', Component: RoleAssigner },
}

export default function ToolTabs({ tools = ['teams', 'timer', 'scoreboard'], storageKey = 'default' }) {
  const active = tools.filter((k) => ALL_TOOLS[k])
  const [tab, setTab] = useState(active[0])

  if (active.length === 0) return null

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {active.map((key) => {
          const t = ALL_TOOLS[key]
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === key
                  ? 'bg-forest-500/20 text-forest-100 border border-forest-400/40'
                  : 'border border-white/10 text-forest-300/60 hover:bg-white/5'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {active.map((key) => {
          const { Component } = ALL_TOOLS[key]
          return (
            <div key={key} className={tab === key ? 'block' : 'hidden'}>
              {key === 'teams' ? <Component storageKey={storageKey} /> : <Component />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
