export default function GameOverlay({ show, emoji, title, subtitle, buttonLabel, onAction }) {
  if (!show) return null
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-dusk-950/85 text-center backdrop-blur-sm">
      {emoji && <span className="text-5xl">{emoji}</span>}
      <h3 className="font-display text-3xl text-white">{title}</h3>
      {subtitle && <p className="max-w-sm px-6 text-sm text-forest-200/70">{subtitle}</p>}
      {buttonLabel && (
        <button onClick={onAction} className="btn-primary mt-2">
          {buttonLabel}
        </button>
      )}
    </div>
  )
}
