export default function RankUpBanner({ rank }) {
  if (!rank) return null
  return (
    <p className="mt-1 font-display text-lg text-ember-300">
      🎉 Ranked up to {rank.emoji} {rank.label}!
    </p>
  )
}
