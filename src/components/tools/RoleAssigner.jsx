import { useState } from 'react'
import useSound from '../../lib/useSound.js'

const ROLE_INFO = {
  police: {
    label: 'Police',
    emoji: '👮',
    color: 'from-sky-400 to-sky-600',
    desc: 'Mingle and dance, but keep your eyes open. If you catch someone holding a diamond, call them out — they\'re caught.',
  },
  smuggler: {
    label: 'Smuggler',
    emoji: '💎',
    color: 'from-ember-500 to-ember-700',
    desc: 'You\'re carrying a diamond. Find a Buyer and pass it off subtly — a handshake, a hug, a slick dance move — before Police notice.',
  },
  buyer: {
    label: 'Buyer',
    emoji: '🤝',
    color: 'from-violet-400 to-violet-600',
    desc: 'You\'re looking to buy a diamond. Find a Smuggler on the floor and complete the trade without Police catching the handoff.',
  },
  partygoer: {
    label: 'Partygoer',
    emoji: '🕺',
    color: 'from-forest-500 to-forest-700',
    desc: 'Just here to dance. Blend in, dress ridiculous, and make it hard for Police to tell who\'s really smuggling.',
  },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function RoleAssigner() {
  const [phase, setPhase] = useState('setup') // setup | reveal | party
  const [names, setNames] = useState([])
  const [input, setInput] = useState('')
  const [policeCount, setPoliceCount] = useState(0)
  const [smugglerCount, setSmugglerCount] = useState(0)
  const [buyerCount, setBuyerCount] = useState(0)
  const [assignments, setAssignments] = useState([])
  const [revealIndex, setRevealIndex] = useState(0)
  const [shown, setShown] = useState(false)
  const [caught, setCaught] = useState(0)
  const [smuggled, setSmuggled] = useState(0)
  const sound = useSound()

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

  const removeName = (i) => setNames((prev) => prev.filter((_, idx) => idx !== i))

  const applyDefaults = (count) => {
    setPoliceCount(Math.max(1, Math.round(count * 0.15)))
    setSmugglerCount(Math.max(1, Math.round(count * 0.2)))
    setBuyerCount(Math.max(1, Math.round(count * 0.2)))
  }

  const usedNames = names.length
  const roleTotal = Number(policeCount) + Number(smugglerCount) + Number(buyerCount)
  const overAllocated = roleTotal > usedNames
  const canStart = usedNames >= 4 && !overAllocated

  const startGame = () => {
    if (!canStart) return
    const shuffled = shuffle(names)
    let cursor = 0
    const police = shuffled.slice(cursor, (cursor += Number(policeCount))).map((n) => ({ name: n, role: 'police' }))
    const smugglers = shuffled.slice(cursor, (cursor += Number(smugglerCount))).map((n) => ({ name: n, role: 'smuggler' }))
    const buyers = shuffled.slice(cursor, (cursor += Number(buyerCount))).map((n) => ({ name: n, role: 'buyer' }))
    const partygoers = shuffled.slice(cursor).map((n) => ({ name: n, role: 'partygoer' }))
    setAssignments(shuffle([...police, ...smugglers, ...buyers, ...partygoers]))
    setRevealIndex(0)
    setShown(false)
    setPhase('reveal')
    sound.start()
  }

  const revealCurrent = () => {
    setShown(true)
    sound.click()
  }

  const nextReveal = () => {
    if (revealIndex + 1 >= assignments.length) {
      setPhase('party')
      setCaught(0)
      setSmuggled(0)
      sound.start()
      return
    }
    setRevealIndex((i) => i + 1)
    setShown(false)
  }

  const newGame = () => {
    setPhase('setup')
    setAssignments([])
  }

  if (phase === 'setup') {
    return (
      <div className="card p-5 sm:p-6">
        <h3 className="font-display text-2xl text-white">Secret Role Assigner</h3>
        <p className="mt-1 text-sm text-forest-300/60">
          Add every player, set your role counts, then pass the device around for a private reveal.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNames()}
            placeholder="Type a name, or paste a list"
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
                <button onClick={() => removeName(i)} className="text-forest-400/60 hover:text-ember-400">
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-white/5 pt-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-forest-300/70">Role counts ({usedNames} players)</span>
            <button onClick={() => applyDefaults(usedNames)} className="btn-ghost text-xs" disabled={usedNames === 0}>
              Auto-suggest
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              ['Police', policeCount, setPoliceCount],
              ['Smugglers', smugglerCount, setSmugglerCount],
              ['Buyers', buyerCount, setBuyerCount],
            ].map(([label, val, setter]) => (
              <label key={label} className="text-xs text-forest-300/60">
                {label}
                <input
                  type="number"
                  min={0}
                  value={val}
                  onChange={(e) => setter(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-dusk-900/80 px-2 py-2 text-center text-white focus:border-forest-400/50 focus:outline-none"
                />
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-forest-400/50">
            Everyone else becomes a Partygoer.{' '}
            {overAllocated && <span className="text-ember-400">Role counts can't exceed the number of players.</span>}
          </p>
        </div>

        <button onClick={startGame} disabled={!canStart} className="btn-primary mt-6 w-full">
          🕶 Assign Secret Roles
        </button>
        {usedNames > 0 && usedNames < 4 && (
          <p className="mt-2 text-center text-xs text-forest-400/50">Add at least 4 players to start.</p>
        )}
      </div>
    )
  }

  if (phase === 'reveal') {
    const current = assignments[revealIndex]
    const info = ROLE_INFO[current.role]
    return (
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-white">Pass & Reveal</h3>
          <span className="chip">
            {revealIndex + 1} / {assignments.length}
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          {!shown ? (
            <>
              <span className="text-5xl">🤫</span>
              <p className="mt-4 text-lg text-forest-100">
                Hand the device to <span className="font-semibold text-white">{current.name}</span>
              </p>
              <p className="mt-1 text-sm text-forest-300/60">Nobody else should see this screen.</p>
              <button onClick={revealCurrent} className="btn-primary mt-6">
                Tap to reveal my role
              </button>
            </>
          ) : (
            <>
              <div className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${info.color} text-5xl shadow-glow`}>
                {info.emoji}
              </div>
              <h4 className="mt-4 font-display text-3xl text-white">{info.label}</h4>
              <p className="mt-2 max-w-sm text-sm text-forest-200/80">{info.desc}</p>
              <button onClick={nextReveal} className="btn-secondary mt-6">
                Hide it & pass to the next player
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // phase === 'party'
  const counts = assignments.reduce((acc, a) => {
    acc[a.role] = (acc[a.role] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-display text-2xl text-white">🎉 Let the party begin</h3>
      <p className="mt-1 text-sm text-forest-300/60">
        Everyone has their secret role. Crank the music — Police, keep your eyes open.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(counts).map(([role, n]) => {
          const info = ROLE_INFO[role]
          return (
            <div key={role} className="rounded-xl border border-white/10 bg-dusk-900/60 p-3 text-center">
              <div className="text-2xl">{info.emoji}</div>
              <div className="mt-1 text-xs text-forest-300/60">{info.label}</div>
              <div className="font-display text-xl text-white">{n}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-center">
          <div className="text-sm text-sky-200/70">Diamonds caught by Police</div>
          <div className="mt-1 font-display text-4xl text-white">{caught}</div>
          <button onClick={() => setCaught((c) => c + 1)} className="btn-secondary mt-3 text-sm">
            + Caught one
          </button>
        </div>
        <div className="rounded-xl border border-forest-500/30 bg-forest-500/10 p-4 text-center">
          <div className="text-sm text-forest-200/70">Diamonds successfully smuggled</div>
          <div className="mt-1 font-display text-4xl text-white">{smuggled}</div>
          <button onClick={() => setSmuggled((s) => s + 1)} className="btn-secondary mt-3 text-sm">
            + Trade completed
          </button>
        </div>
      </div>

      <button onClick={newGame} className="btn-ghost mt-6 w-full">
        ↺ New round with fresh roles
      </button>
    </div>
  )
}
