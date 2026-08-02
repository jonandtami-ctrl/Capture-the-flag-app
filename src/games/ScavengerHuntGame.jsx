import { useEffect, useRef, useState } from 'react'
import { rand, randInt } from './engine/utils.js'
import useSound from '../lib/useSound.js'

const TARGETS = [
  { id: 'key', emoji: '🔑', name: 'Lost key' },
  { id: 'sock', emoji: '🧦', name: 'Missing sock' },
  { id: 'kite', emoji: '🪁', name: 'Kite' },
  { id: 'boot', emoji: '🥾', name: 'Old boot' },
  { id: 'flashlight', emoji: '🔦', name: 'Flashlight' },
  { id: 'balloon', emoji: '🎈', name: 'Balloon' },
]
const CLUTTER = ['🌲', '🍂', '🪨', '🍄', '🦋', '🐌', '🌼', '🪵', '🌿', '🍁', '🪺', '🌾']
const CLUTTER_COUNT = 45
const ROUND_SECONDS = 45

function buildScene() {
  const items = []
  for (let i = 0; i < CLUTTER_COUNT; i++) {
    items.push({
      key: `c${i}`,
      emoji: CLUTTER[randInt(0, CLUTTER.length - 1)],
      x: rand(3, 95),
      y: rand(6, 92),
      size: rand(18, 30),
      target: false,
    })
  }
  TARGETS.forEach((t) => {
    items.push({
      key: t.id,
      emoji: t.emoji,
      x: rand(5, 92),
      y: rand(10, 88),
      size: 24,
      target: true,
      id: t.id,
    })
  })
  return items
}

export default function ScavengerHuntGame() {
  const [phase, setPhase] = useState('ready')
  const [scene, setScene] = useState([])
  const [found, setFound] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const intervalRef = useRef(null)
  const sound = useSound()

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const start = () => {
    setScene(buildScene())
    setFound(new Set())
    setTimeLeft(ROUND_SECONDS)
    setPhase('playing')
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          setPhase((p) => (p === 'playing' ? 'lost' : p))
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const clickItem = (item) => {
    if (phase !== 'playing' || !item.target || found.has(item.id)) return
    const next = new Set(found)
    next.add(item.id)
    setFound(next)
    sound.point()
    if (next.size >= TARGETS.length) {
      clearInterval(intervalRef.current)
      setPhase('won')
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-dusk-950 p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-xl text-white">Find the list:</h3>
          <span className="chip">⏱ {timeLeft}s</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {TARGETS.map((t) => (
            <span
              key={t.id}
              className={`chip gap-1.5 normal-case tracking-normal ${found.has(t.id) ? 'opacity-30 line-through' : ''}`}
            >
              {t.emoji} {t.name}
            </span>
          ))}
        </div>

        <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-forest-950 to-dusk-950">
          {phase === 'playing' &&
            scene.map((item) => (
              <button
                key={item.key}
                onClick={() => clickItem(item)}
                style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: `${item.size}px` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 select-none transition-opacity ${
                  item.target && found.has(item.id) ? 'opacity-0' : 'opacity-100 hover:scale-110'
                }`}
              >
                {item.emoji}
              </button>
            ))}

          {phase !== 'playing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-dusk-950/85 text-center backdrop-blur-sm">
              {phase === 'ready' && (
                <>
                  <span className="text-5xl">🔍</span>
                  <h4 className="font-display text-2xl text-white">Scavenger Hunt</h4>
                  <p className="max-w-xs px-4 text-sm text-forest-200/70">
                    Find all 6 items hidden in the scene before time runs out.
                  </p>
                  <button onClick={start} className="btn-primary">
                    Start
                  </button>
                </>
              )}
              {phase === 'won' && (
                <>
                  <span className="text-5xl">🏆</span>
                  <h4 className="font-display text-2xl text-white">Found everything!</h4>
                  <p className="text-sm text-forest-200/70">You cleared the list with {timeLeft}s to spare.</p>
                  <button onClick={start} className="btn-primary">
                    Play again
                  </button>
                </>
              )}
              {phase === 'lost' && (
                <>
                  <span className="text-5xl">⏰</span>
                  <h4 className="font-display text-2xl text-white">Time's up!</h4>
                  <p className="text-sm text-forest-200/70">You found {found.size} of {TARGETS.length} items.</p>
                  <button onClick={start} className="btn-primary">
                    Try again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-forest-400/50">Click/tap the hidden items from the list</p>
    </div>
  )
}
