import { useState } from 'react'
import { RANKS, getRankForWins, getNextRank } from './ranks.js'

const STORAGE_KEY = 'camphq-wins'

// Tracks total wins across every rank-enabled game and derives the
// player's current earned rank from it — nobody picks a rank, they earn
// their way up from Rover to Voyageur.
export default function useProgress() {
  const [wins, setWins] = useState(() => Number(localStorage.getItem(STORAGE_KEY)) || 0)

  const rank = getRankForWins(wins)
  const nextRank = getNextRank(rank)
  const winsToNext = nextRank ? nextRank.winsRequired - wins : 0

  const recordWin = () => {
    const newWins = wins + 1
    setWins(newWins)
    localStorage.setItem(STORAGE_KEY, String(newWins))
    const newRank = getRankForWins(newWins)
    return { rankedUp: newRank.id !== rank.id, newRank }
  }

  return { rank, wins, nextRank, winsToNext, recordWin, allRanks: RANKS }
}
