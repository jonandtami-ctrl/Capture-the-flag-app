export default function RankProgress({ rank, nextRank, winsToNext }) {
  return (
    <div className="mt-1 flex flex-col items-center gap-1.5">
      <span className="chip gap-1.5">
        <span>{rank.emoji}</span>
        Rank: {rank.label}
      </span>
      {nextRank ? (
        <p className="text-xs text-forest-400/60">
          {winsToNext} more win{winsToNext === 1 ? '' : 's'} to {nextRank.emoji} {nextRank.label}
        </p>
      ) : (
        <p className="text-xs text-ember-300/80">🏆 Max rank reached!</p>
      )}
    </div>
  )
}
