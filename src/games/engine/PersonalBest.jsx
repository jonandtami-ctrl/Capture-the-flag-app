// Small readout for a personal-best number, shown on the ready/won overlays.
// `format` turns the raw stored number into display text (e.g. "32s to spare").
export default function PersonalBest({ value, format, isNew = false }) {
  if (value === null) return null
  return (
    <p className="text-sm text-forest-300/70">
      🏅 Your best: <span className="font-semibold text-white">{format(value)}</span>
      {isNew && <span className="ml-2 font-semibold text-ember-400">New record!</span>}
    </p>
  )
}
