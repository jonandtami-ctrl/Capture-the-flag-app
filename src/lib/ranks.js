// Progressive difficulty ranks, borrowed from classic Scouting program
// levels. Each step up scales AI speed/reaction up and available time down.
export const RANKS = [
  { id: 'rover', label: 'Rover', emoji: '🥾', speedMult: 0.82, timeMult: 1.25 },
  { id: 'frontiersman', label: 'Frontiersman', emoji: '🧭', speedMult: 1, timeMult: 1 },
  { id: 'ranger', label: 'Ranger', emoji: '🏹', speedMult: 1.18, timeMult: 0.85 },
  { id: 'voyageur', label: 'Voyageur', emoji: '🛶', speedMult: 1.4, timeMult: 0.7 },
]

export const getRankById = (id) => RANKS.find((r) => r.id === id) ?? RANKS[1]
