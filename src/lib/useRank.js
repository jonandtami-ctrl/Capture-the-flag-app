import { useState } from 'react'
import { RANKS, getRankForWins, getNextRank } from './ranks.js'

const STORAGE_KEY = 'camphq-wins'

// Tracks total wins across every rank-enabled game and derives the
// player's current earned rank from it. You can choose to play a round at
// any rank you've already unlocked (handy for practice), but only a win at
// your true current rank counts toward ranking up further — otherwise
// everyone would just farm wins at Rover forever.
export default function useProgress() {
  const [wins, setWins] = useState(() => Number(localStorage.getItem(STORAGE_KEY)) || 0)
  const [selectedId, setSelectedId] = useState(null)

  const rank = getRankForWins(wins)
  const nextRank = getNextRank(rank)
  const winsToNext = nextRank ? nextRank.winsRequired - wins : 0

  const unlockedRanks = RANKS.filter((r) => r.winsRequired <= wins)
  const selectedRank = (selectedId && unlockedRanks.find((r) => r.id === selectedId)) || rank

  const selectRank = (id) => {
    if (unlockedRanks.some((r) => r.id === id)) setSelectedId(id)
  }

  const recordWin = () => {
    if (selectedRank.id !== rank.id) return { rankedUp: false, newRank: rank }
    const newWins = wins + 1
    setWins(newWins)
    localStorage.setItem(STORAGE_KEY, String(newWins))
    const newRank = getRankForWins(newWins)
    return { rankedUp: newRank.id !== rank.id, newRank }
  }

  return { rank, wins, nextRank, winsToNext, recordWin, allRanks: RANKS, unlockedRanks, selectedRank, selectRank }
}
