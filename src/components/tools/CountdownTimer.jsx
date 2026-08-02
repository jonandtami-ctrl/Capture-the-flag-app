import { useEffect, useRef, useState } from 'react'
import useSound from '../../lib/useSound.js'

const PRESETS = [60, 180, 300, 600]

function format(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function CountdownTimer() {
  const [durationInput, setDurationInput] = useState(5)
  const [total, setTotal] = useState(300)
  const [remaining, setRemaining] = useState(300)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const sound = useSound()

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          sound.complete()
          return 0
        }
        if (r <= 4) sound.tick()
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const setPreset = (secs) => {
    setRunning(false)
    setTotal(secs)
    setRemaining(secs)
  }

  const applyCustom = () => {
    const secs = Math.max(5, Math.round(Number(durationInput) * 60))
    setPreset(secs)
  }

  const toggle = () => {
    if (remaining === 0) return
    if (!running) sound.start()
    setRunning((r) => !r)
  }

  const reset = () => {
    setRunning(false)
    setRemaining(total)
  }

  const pct = total > 0 ? remaining / total : 0
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const isLow = remaining <= 10 && remaining > 0

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-display text-2xl text-white">Countdown Timer</h3>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
        <div className="relative flex h-56 w-56 items-center justify-center">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="currentColor" strokeWidth="12" className="text-white/5" />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct)}
              className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${
                isLow ? 'text-ember-500' : 'text-forest-400'
              }`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              className={`font-display text-5xl tabular-nums text-white ${
                isLow ? 'animate-flicker text-ember-300' : ''
              }`}
            >
              {format(remaining)}
            </span>
            <span className="mt-1 text-xs uppercase tracking-widest text-forest-400/50">
              {running ? 'Running' : remaining === 0 ? 'Time!' : 'Paused'}
            </span>
          </div>
          {running && (
            <span className="absolute inset-0 rounded-full border-2 border-forest-400/30 animate-pulseRing" />
          )}
        </div>

        <div className="flex w-full max-w-xs flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((secs) => (
              <button
                key={secs}
                onClick={() => setPreset(secs)}
                className={`chip transition-colors ${
                  total === secs ? 'border-forest-400/60 bg-forest-500/20 text-forest-100' : 'hover:text-forest-100'
                }`}
              >
                {secs / 60} min
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0.1}
              step={0.5}
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              className="w-20 rounded-lg border border-white/10 bg-dusk-900/80 px-2 py-1.5 text-center text-white focus:border-forest-400/50 focus:outline-none"
            />
            <span className="text-sm text-forest-300/60">minutes</span>
            <button onClick={applyCustom} className="btn-ghost ml-auto text-sm">
              Set
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={toggle} className="btn-primary flex-1" disabled={remaining === 0}>
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button onClick={reset} className="btn-secondary">
              ↺ Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
