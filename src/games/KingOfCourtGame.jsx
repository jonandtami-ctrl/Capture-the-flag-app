import { useEffect, useRef, useState } from 'react'
import useSound from '../lib/useSound.js'

const OPPONENTS = ['Riley', 'Coach Marcus', 'Big Tone', 'Sam "Lightning"', 'The Reigning Champ']

export default function KingOfCourtGame() {
  const [phase, setPhase] = useState('ready') // ready | waiting | go | result | champion | lost
  const [wins, setWins] = useState(0)
  const [opponentIdx, setOpponentIdx] = useState(0)
  const [result, setResult] = useState(null)
  const timeoutRef = useRef(null)
  const goAtRef = useRef(0)
  const resolvedRef = useRef(false)
  const sound = useSound()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const startDuel = () => {
    setResult(null)
    setPhase('waiting')
    resolvedRef.current = false
    const delay = 1200 + Math.random() * 2200
    timeoutRef.current = setTimeout(() => {
      goAtRef.current = performance.now()
      setPhase('go')
      sound.tick()
    }, delay)
  }

  const swing = () => {
    if (phase === 'waiting') {
      // false start
      clearTimeout(timeoutRef.current)
      resolvedRef.current = true
      setResult({ win: false, reason: 'falseStart' })
      setPhase('result')
      sound.click()
      return
    }
    if (phase !== 'go' || resolvedRef.current) return
    resolvedRef.current = true
    const reactionMs = performance.now() - goAtRef.current
    const difficulty = Math.min(wins, 4)
    const aiReactionMs = 260 - difficulty * 25 + Math.random() * 120
    const win = reactionMs < aiReactionMs
    setResult({ win, reactionMs: Math.round(reactionMs), aiReactionMs: Math.round(aiReactionMs) })
    setPhase('result')
    if (win) sound.complete()
    else sound.click()
  }

  const nextStep = () => {
    if (result?.win) {
      const newWins = wins + 1
      if (newWins >= 3) {
        setPhase('champion')
      } else {
        setWins(newWins)
        setOpponentIdx((i) => Math.min(i + 1, OPPONENTS.length - 1))
        setPhase('ready')
      }
    } else {
      setPhase('lost')
    }
  }

  const resetAll = () => {
    setWins(0)
    setOpponentIdx(0)
    setResult(null)
    setPhase('ready')
  }

  return (
    <div>
      <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-dusk-950 p-8 text-center shadow-card">
        <div className="absolute left-4 top-4 chip">👑 Defenses: {wins}/3</div>
        <div className="absolute right-4 top-4 chip">🥊 vs. {OPPONENTS[opponentIdx]}</div>

        {phase === 'ready' && (
          <>
            <span className="text-5xl">🏀</span>
            <h3 className="mt-4 font-display text-2xl text-white">Next up: {OPPONENTS[opponentIdx]}</h3>
            <p className="mt-2 max-w-sm text-sm text-forest-200/70">
              Wait for "GO!" then swing as fast as you can. Swing too early and it's a false start.
            </p>
            <button onClick={startDuel} className="btn-primary mt-5">
              Ready up
            </button>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <span className="text-6xl">⏳</span>
            <p className="mt-4 text-lg text-forest-200/70">Wait for it...</p>
            <button onClick={swing} className="btn-secondary mt-5">
              Swing!
            </button>
          </>
        )}

        {phase === 'go' && (
          <>
            <span className="text-7xl animate-flicker">🟢</span>
            <p className="mt-4 font-display text-3xl text-forest-300">GO!</p>
            <button onClick={swing} className="btn-primary mt-5 animate-pulseRing text-lg">
              SWING!
            </button>
          </>
        )}

        {phase === 'result' && result && (
          <>
            {result.reason === 'falseStart' ? (
              <>
                <span className="text-5xl">🚫</span>
                <p className="mt-3 font-display text-2xl text-ember-300">False start!</p>
                <p className="mt-1 text-sm text-forest-200/70">You swung before the signal.</p>
              </>
            ) : result.win ? (
              <>
                <span className="text-5xl">✅</span>
                <p className="mt-3 font-display text-2xl text-forest-300">You win the point!</p>
                <p className="mt-1 text-sm text-forest-200/70">
                  {result.reactionMs}ms vs {OPPONENTS[opponentIdx]}'s {result.aiReactionMs}ms
                </p>
              </>
            ) : (
              <>
                <span className="text-5xl">❌</span>
                <p className="mt-3 font-display text-2xl text-ember-300">Too slow!</p>
                <p className="mt-1 text-sm text-forest-200/70">
                  {result.reactionMs}ms vs {OPPONENTS[opponentIdx]}'s {result.aiReactionMs}ms
                </p>
              </>
            )}
            <button onClick={nextStep} className="btn-primary mt-5">
              {result.win ? 'Next challenger' : 'See results'}
            </button>
          </>
        )}

        {phase === 'champion' && (
          <>
            <span className="text-6xl">👑</span>
            <h3 className="mt-4 font-display text-3xl text-white">Grand Champion!</h3>
            <p className="mt-2 text-sm text-forest-200/70">You defended the court 3 times in a row.</p>
            <button onClick={resetAll} className="btn-primary mt-5">
              Play again
            </button>
          </>
        )}

        {phase === 'lost' && (
          <>
            <span className="text-5xl">🏳️</span>
            <h3 className="mt-4 font-display text-3xl text-white">Dethroned</h3>
            <p className="mt-2 text-sm text-forest-200/70">You racked up {wins} defense{wins === 1 ? '' : 's'} before losing the court.</p>
            <button onClick={resetAll} className="btn-primary mt-5">
              Try again
            </button>
          </>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-forest-400/50">Click/tap "Swing!" the instant you see GO</p>
    </div>
  )
}
