import { useEffect, useRef, useState } from 'react'
import useSound from '../../lib/useSound.js'

const ASSET_TEMPLATES = [
  { id: 'gold', name: 'Gold', emoji: '🪙', volatility: 0.12 },
  { id: 'tech', name: 'Tech Startup', emoji: '💻', volatility: 0.25 },
  { id: 'oil', name: 'Oil & Energy', emoji: '🛢️', volatility: 0.18 },
  { id: 'crypto', name: 'Crypto Coin', emoji: '💠', volatility: 0.4 },
  { id: 'realestate', name: 'Real Estate', emoji: '🏠', volatility: 0.08 },
]

const TEAM_COLORS = [
  'from-ember-500 to-ember-700',
  'from-forest-500 to-forest-700',
  'from-sky-400 to-sky-600',
  'from-violet-400 to-violet-600',
  'from-yellow-400 to-yellow-600',
  'from-rose-400 to-rose-600',
]

function freshAssets() {
  return ASSET_TEMPLATES.map((a) => ({ ...a, price: 100, history: [100] }))
}

function nextPrice(asset) {
  const change = (Math.random() * 2 - 1) * asset.volatility
  return Math.max(5, Math.round(asset.price * (1 + change)))
}

function portfolioValue(team, assets) {
  const holdingsValue = Object.entries(team.holdings).reduce((sum, [assetId, qty]) => {
    const asset = assets.find((a) => a.id === assetId)
    return sum + qty * (asset?.price ?? 0)
  }, 0)
  return team.cash + holdingsValue
}

export default function MarketGame() {
  const [phase, setPhase] = useState('setup')
  const [teamNames, setTeamNames] = useState(['Team 1', 'Team 2'])
  const [startingCash, setStartingCash] = useState(1000)
  const [totalRounds, setTotalRounds] = useState(10)
  const [roundSeconds, setRoundSeconds] = useState(90)

  const [teams, setTeams] = useState([])
  const [assets, setAssets] = useState(freshAssets())
  const [round, setRound] = useState(1)
  const [remaining, setRemaining] = useState(90)
  const [running, setRunning] = useState(false)
  const [trade, setTrade] = useState({})
  const intervalRef = useRef(null)
  const sound = useSound()

  const advanceRound = () => {
    setAssets((prev) =>
      prev.map((a) => {
        const price = nextPrice(a)
        return { ...a, price, history: [...a.history, price] }
      }),
    )
    setRunning(false)
    sound.complete()
    setRound((r) => r + 1)
    setRemaining(roundSeconds)
  }

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          advanceRound()
          return roundSeconds
        }
        if (r <= 4) sound.tick()
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const startGame = () => {
    const names = teamNames.map((n) => n.trim()).filter(Boolean)
    if (names.length < 2) return
    setTeams(
      names.map((name, i) => ({
        id: i,
        name,
        cash: Number(startingCash) || 1000,
        holdings: {},
      })),
    )
    setAssets(freshAssets())
    setRound(1)
    setRemaining(Number(roundSeconds) || 90)
    setRunning(false)
    setPhase('playing')
    sound.start()
  }

  const toggleTimer = () => {
    if (!running) sound.start()
    setRunning((r) => !r)
  }

  const setTradeField = (teamId, field, value) => {
    setTrade((prev) => ({ ...prev, [teamId]: { ...prev[teamId], [field]: value } }))
  }

  const buy = (teamId) => {
    const { assetId = assets[0].id, qty = 1 } = trade[teamId] ?? {}
    const asset = assets.find((a) => a.id === assetId)
    const quantity = Math.max(1, Number(qty))
    const cost = asset.price * quantity
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId || t.cash < cost) return t
        return {
          ...t,
          cash: t.cash - cost,
          holdings: { ...t.holdings, [assetId]: (t.holdings[assetId] ?? 0) + quantity },
        }
      }),
    )
    sound.point()
  }

  const sell = (teamId) => {
    const { assetId = assets[0].id, qty = 1 } = trade[teamId] ?? {}
    const asset = assets.find((a) => a.id === assetId)
    const quantity = Math.max(1, Number(qty))
    setTeams((prev) =>
      prev.map((t) => {
        const held = t.holdings[assetId] ?? 0
        if (t.id !== teamId || held < quantity) return t
        return {
          ...t,
          cash: t.cash + asset.price * quantity,
          holdings: { ...t.holdings, [assetId]: held - quantity },
        }
      }),
    )
    sound.point()
  }

  const resetGame = () => {
    setPhase('setup')
    setRunning(false)
  }

  const finished = round > totalRounds

  if (phase === 'setup') {
    return (
      <div className="card p-5 sm:p-6">
        <h3 className="font-display text-2xl text-white">Market Simulator Setup</h3>
        <p className="mt-1 text-sm text-forest-300/60">
          Set up squads, starting cash, and round length, then start the market.
        </p>

        <div className="mt-5 space-y-2">
          {teamNames.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={name}
                onChange={(e) =>
                  setTeamNames((prev) => prev.map((n, idx) => (idx === i ? e.target.value : n)))
                }
                className="flex-1 rounded-xl border border-white/10 bg-dusk-900/80 px-4 py-2.5 text-sm text-white focus:border-forest-400/50 focus:outline-none"
              />
              {teamNames.length > 2 && (
                <button
                  onClick={() => setTeamNames((prev) => prev.filter((_, idx) => idx !== i))}
                  className="btn-ghost px-3"
                  aria-label={`Remove ${name}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {teamNames.length < 6 && (
            <button
              onClick={() => setTeamNames((prev) => [...prev, `Team ${prev.length + 1}`])}
              className="btn-secondary w-full text-sm"
            >
              + Add squad
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <label className="text-xs text-forest-300/60">
            Starting cash
            <input
              type="number"
              value={startingCash}
              onChange={(e) => setStartingCash(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-dusk-900/80 px-2 py-2 text-center text-white focus:border-forest-400/50 focus:outline-none"
            />
          </label>
          <label className="text-xs text-forest-300/60">
            Rounds
            <input
              type="number"
              min={3}
              max={20}
              value={totalRounds}
              onChange={(e) => setTotalRounds(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-dusk-900/80 px-2 py-2 text-center text-white focus:border-forest-400/50 focus:outline-none"
            />
          </label>
          <label className="text-xs text-forest-300/60">
            Round length (sec)
            <input
              type="number"
              min={20}
              step={10}
              value={roundSeconds}
              onChange={(e) => setRoundSeconds(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-dusk-900/80 px-2 py-2 text-center text-white focus:border-forest-400/50 focus:outline-none"
            />
          </label>
        </div>

        <button onClick={startGame} className="btn-primary mt-6 w-full">
          📈 Start Market
        </button>
      </div>
    )
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl text-white">Market Simulator</h3>
          <p className="text-sm text-forest-300/60">
            {finished ? 'Market closed — final results' : `Round ${round} of ${totalRounds}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!finished && (
            <>
              <span className="font-display text-3xl tabular-nums text-white">
                {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
              </span>
              <button onClick={toggleTimer} className="btn-primary text-sm">
                {running ? '⏸ Pause' : '▶ Start round'}
              </button>
              <button onClick={advanceRound} className="btn-secondary text-sm">
                ⏭ Advance
              </button>
            </>
          )}
          <button onClick={resetGame} className="btn-ghost text-sm">
            ↺ New game
          </button>
        </div>
      </div>

      {/* Ticker */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {assets.map((a) => {
          const prev = a.history[a.history.length - 2] ?? a.price
          const delta = a.price - prev
          const up = delta > 0
          const flat = delta === 0
          return (
            <div key={a.id} className="rounded-xl border border-white/10 bg-dusk-900/60 p-3 text-center">
              <div className="text-2xl">{a.emoji}</div>
              <div className="mt-1 text-xs text-forest-300/60">{a.name}</div>
              <div className="mt-1 font-display text-xl text-white">${a.price}</div>
              {!flat && (
                <div className={`text-xs font-semibold ${up ? 'text-forest-400' : 'text-ember-400'}`}>
                  {up ? '▲' : '▼'} {Math.abs(delta)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Teams */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[...teams]
          .sort((a, b) => portfolioValue(b, assets) - portfolioValue(a, assets))
          .map((team, i) => {
            const value = portfolioValue(team, assets)
            const isLeading = i === 0 && value > 0
            const t = trade[team.id] ?? { assetId: assets[0].id, qty: 1 }
            return (
              <div
                key={team.id}
                className={`overflow-hidden rounded-xl border bg-dusk-900/60 ${
                  isLeading ? 'border-ember-400/50 shadow-glow' : 'border-white/10'
                }`}
              >
                <div className={`bg-gradient-to-r ${TEAM_COLORS[team.id % TEAM_COLORS.length]} px-4 py-2 flex items-center justify-between`}>
                  <span className="font-display tracking-wide text-white">{team.name}</span>
                  {isLeading && <span title="Leading">👑</span>}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-300/60">Cash</span>
                    <span className="font-semibold text-white">${team.cash.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-forest-300/60">Portfolio value</span>
                    <span className="font-display text-lg text-white">${value.toLocaleString()}</span>
                  </div>

                  {Object.entries(team.holdings).some(([, qty]) => qty > 0) && (
                    <ul className="mt-2 space-y-1 border-t border-white/5 pt-2 text-xs text-forest-200/70">
                      {Object.entries(team.holdings)
                        .filter(([, qty]) => qty > 0)
                        .map(([assetId, qty]) => {
                          const asset = assets.find((a) => a.id === assetId)
                          return (
                            <li key={assetId} className="flex justify-between">
                              <span>{asset.emoji} {asset.name} × {qty}</span>
                              <span>${(qty * asset.price).toLocaleString()}</span>
                            </li>
                          )
                        })}
                    </ul>
                  )}

                  {!finished && (
                    <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
                      <select
                        value={t.assetId}
                        onChange={(e) => setTradeField(team.id, 'assetId', e.target.value)}
                        className="flex-1 rounded-lg border border-white/10 bg-dusk-900/80 px-2 py-2 text-xs text-white focus:border-forest-400/50 focus:outline-none"
                      >
                        {assets.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.emoji} {a.name} · ${a.price}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={t.qty}
                        onChange={(e) => setTradeField(team.id, 'qty', e.target.value)}
                        className="w-16 rounded-lg border border-white/10 bg-dusk-900/80 px-2 py-2 text-center text-xs text-white focus:border-forest-400/50 focus:outline-none"
                      />
                      <button onClick={() => buy(team.id)} className="btn-secondary !px-3 !py-2 text-xs">
                        Buy
                      </button>
                      <button onClick={() => sell(team.id)} className="btn-ghost !px-3 !py-2 text-xs">
                        Sell
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
