export default function RankSelector({ ranks, value, onChange }) {
  return (
    <div className="mt-1">
      <p className="mb-2 text-xs uppercase tracking-wider text-forest-400/60">Choose your rank</p>
      <div className="flex flex-wrap justify-center gap-2">
        {ranks.map((r) => (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
              value.id === r.id
                ? 'border-forest-400/60 bg-forest-500/20 text-forest-100'
                : 'border-white/10 text-forest-300/60 hover:bg-white/5'
            }`}
          >
            <span>{r.emoji}</span>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
