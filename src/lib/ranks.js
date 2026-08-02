// Progressive difficulty ranks, borrowed from classic Scouting program
// levels. Rank is earned, not chosen — everyone starts as a Rover, and
// enough wins across any of the rank-enabled games promotes you to the
// next tier, which scales AI speed up and available time down.
export const RANKS = [
  { id: 'rover', label: 'Rover', emoji: '🥾', winsRequired: 0, speedMult: 0.82, timeMult: 1.25 },
  { id: 'frontiersman', label: 'Frontiersman', emoji: '🧭', winsRequired: 3, speedMult: 1, timeMult: 1 },
  { id: 'ranger', label: 'Ranger', emoji: '🏹', winsRequired: 8, speedMult: 1.18, timeMult: 0.85 },
  { id: 'voyageur', label: 'Voyageur', emoji: '🛶', winsRequired: 15, speedMult: 1.4, timeMult: 0.7 },
]

export const getRankForWins = (wins) => {
  let current = RANKS[0]
  for (const r of RANKS) {
    if (wins >= r.winsRequired) current = r
  }
  return current
}

export const getNextRank = (currentRank) => {
  const idx = RANKS.findIndex((r) => r.id === currentRank.id)
  return RANKS[idx + 1] ?? null
}
