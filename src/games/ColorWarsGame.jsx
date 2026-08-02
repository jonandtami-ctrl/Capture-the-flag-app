import { useEffect, useRef, useState } from 'react'
import { randInt } from './engine/utils.js'
import useSound from '../lib/useSound.js'
import useRank from '../lib/useRank.js'
import RankSelector from './engine/RankSelector.jsx'

const TEAMS = [
  { name: 'Red', class: 'bg-rose-500' },
  { name: 'Blue', class: 'bg-sky-500' },
  { name: 'Green', class: 'bg-forest-500' },
  { name: 'Gold', class: 'bg-yellow-500' },
]
const TOTAL_ROUNDS = 8
const BASE_TARGET_MS = 5500

export default function ColorWarsGame() {
  const [phase, setPhase] = useState('ready') // ready | waiting | live | result | done
  const [round, setRound] = useState(0)
  const [litIdx, setLitIdx] = useState(null)
  const [totalMs, setTotalMs] = useState(0)
  const [lastResult, setLastResult] = useState(null)
  const [rank, setRank, ranks] = useRank()
  const targetMsRef = useRef(BASE_TARGET_MS)
  const goAtRef = useRef(0)
  const timeoutRef = useRef(null)
  const resolvedRef = useRef(false)
  const sound = useSound()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const nextRound = (accMs) => {
    if (round + 1 >= TOTAL_ROUNDS) {
      setTotalMs(accMs)
      setPhase('done')
      return
    }
    setRound((r) => r + 1)
    setPhase('waiting')
    resolvedRef.current = false
    setLitIdx(null)
    const delay = 500 + Math.random() * 1400
    timeoutRef.current = setTimeout(() => {
      const idx = randInt(0, TEAMS.length - 1)
      setLitIdx(idx)
      goAtRef.current = performance.now()
      setPhase('live')
      sound.tick()
    }, delay)
  }

  const start = () => {
    targetMsRef.current = BASE_TARGET_MS / rank.speedMult
    setTotalMs(0)
    setRound(0)
    setPhase('waiting')
    resolvedRef.current = false
    setLitIdx(null)
    const delay = 500 + Math.random() * 1400
    timeoutRef.current = setTimeout(() => {
      const idx = randInt(0, TEAMS.length - 1)
      setLitIdx(idx)
      goAtRef.current = performance.now()
      setPhase('live')
      sound.tick()
    }, delay)
  }

  const tap = (idx) => {
    if (phase !== 'live' || resolvedRef.current) return
    resolvedRef.current = true
    const correct = idx === litIdx
    const reactionMs = performance.now() - goAtRef.current
    const penalty = correct ? reactionMs : reactionMs + 800
    const newTotal = totalMs + penalty
    setLastResult({ correct, reactionMs: Math.round(reactionMs) })
    setTotalMs(newTotal)
    setPhase('result')
    if (correct) sound.point()
    else sound.click()
    setTimeout(() => nextRound(newTotal), 900)
  }

  const won = phase === 'done' && totalMs <= targetMsRef.current

  return (
    <div>
      <div className="relative rounded-2xl border border-white/10 bg-dusk-950 p-6 text-center shadow-card sm:p-8">
        <div className="mb-2 flex items-center justify-between text-xs text-forest-300/60">
          <span>Round {Math.min(round + (phase === 'ready' ? 0 : 1), TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</span>
          <span>Total time: {(totalMs / 1000).toFixed(2)}s</span>
        </div>

        <h3 className="font-display text-2xl text-white">Color Wars: Reaction Relay</h3>
        <p className="mt-1 text-sm text-forest-300/60">
          Tap the tile that lights up as fast as you can — a wrong tap costs a big penalty.
        </p>

        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-4">
          {TEAMS.map((team, i) => (
            <button
              key={team.name}
              onClick={() => tap(i)}
              disabled={phase !== 'live'}
              className={`flex h-28 items-center justify-center rounded-2xl text-lg font-display text-white transition-all ${team.class} ${
                litIdx === i && phase === 'live' ? 'scale-105 shadow-glow ring-4 ring-white/60' : 'opacity-70'
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>

        <div className="mt-6 min-h-[70px]">
          {phase === 'ready' && (
            <div className="flex flex-col items-center gap-4">
              <RankSelector ranks={ranks} value={rank} onChange={setRank} />
              <button onClick={start} className="btn-primary">
                Start relay
              </button>
            </div>
          )}
          {phase === 'waiting' && <p className="text-forest-300/60">Get ready...</p>}
          {phase === 'result' && lastResult && (
            <p className={lastResult.correct ? 'text-forest-300' : 'text-ember-400'}>
              {lastResult.correct ? `Nice! ${lastResult.reactionMs}ms` : 'Wrong tile!'}
            </p>
          )}
          {phase === 'done' && (
            <div>
              <p className={`font-display text-2xl ${won ? 'text-forest-300' : 'text-ember-400'}`}>
                {won ? '🏆 Camp trophy secured!' : '😅 So close — try again!'}
              </p>
              <p className="mt-1 text-sm text-forest-300/60">
                Total time: {(totalMs / 1000).toFixed(2)}s (target: under {(targetMsRef.current / 1000).toFixed(1)}s)
              </p>
              <button onClick={start} className="btn-primary mt-4">
                Play again
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-forest-400/50">Click/tap the lit tile as fast as you can</p>
    </div>
  )
}
