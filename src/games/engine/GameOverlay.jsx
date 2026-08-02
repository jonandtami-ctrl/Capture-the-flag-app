export default function GameOverlay({ show, emoji, title, subtitle, buttonLabel, onAction, children }) {
  if (!show) return null
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 overflow-y-auto rounded-2xl bg-dusk-950/85 p-3 text-center backdrop-blur-sm">
      {emoji && <span className="text-4xl sm:text-5xl">{emoji}</span>}
      <h3 className="font-display text-2xl text-white sm:text-3xl">{title}</h3>
      {subtitle && <p className="max-w-sm px-4 text-xs text-forest-200/70 sm:text-sm">{subtitle}</p>}
      {children}
      {buttonLabel && (
        <button onClick={onAction} className="btn-primary mt-1 shrink-0">
          {buttonLabel}
        </button>
      )}
    </div>
  )
}
