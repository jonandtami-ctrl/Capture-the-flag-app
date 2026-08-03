export default function RankProgress({ rank, nextRank, winsToNext, allRanks, unlockedRanks, selectedRank, onSelect }) {
  const showPicker = allRanks && unlockedRanks && selectedRank && onSelect

  return (
    <div className="mt-1 flex flex-col items-center gap-2">
      {showPicker ? (
        <div className="flex flex-wrap justify-center gap-1.5">
          {allRanks.map((r) => {
            const unlocked = unlockedRanks.some((u) => u.id === r.id)
            const isSelected = selectedRank.id === r.id
            return (
              <button
                key={r.id}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelect(r.id)}
                className={`chip gap-1.5 transition-colors ${
                  isSelected
                    ? 'border-forest-400/60 bg-forest-500/20 text-forest-100'
                    : unlocked
                      ? 'hover:text-forest-100'
                      : 'cursor-not-allowed opacity-40'
                }`}
              >
                <span>{unlocked ? r.emoji : '🔒'}</span>
                {r.label}
              </button>
            )
          })}
        </div>
      ) : (
        <span className="chip gap-1.5">
          <span>{rank.emoji}</span>
          Rank: {rank.label}
        </span>
      )}
      {nextRank ? (
        <p className="text-xs text-forest-400/60">
          {winsToNext} more win{winsToNext === 1 ? '' : 's'} to {nextRank.emoji} {nextRank.label}
        </p>
      ) : (
        <p className="text-xs text-ember-300/80">🏆 Max rank reached!</p>
      )}
      {showPicker && selectedRank.id !== rank.id && (
        <p className="max-w-xs text-center text-[11px] text-forest-400/50">
          Playing at {selectedRank.label} for practice — wins here won't count toward your rank-up.
        </p>
      )}
    </div>
  )
}
