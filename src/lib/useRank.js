import { useState } from 'react'
import { RANKS, getRankById } from './ranks.js'

const STORAGE_KEY = 'camphq-rank'

// Persists the player's chosen rank (difficulty) across every game so
// picking "Ranger" once carries over to whichever game they open next.
export default function useRank() {
  const [rankId, setRankId] = useState(() => localStorage.getItem(STORAGE_KEY) ?? 'frontiersman')

  const setRank = (id) => {
    setRankId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  return [getRankById(rankId), setRank, RANKS]
}
