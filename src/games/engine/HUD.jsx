export default function HUD({ left, right }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3 sm:p-4">
      <div className="flex flex-wrap gap-2">
        {left?.map((item, i) => (
          <span key={i} className="chip !bg-dusk-950/70 backdrop-blur-sm">
            {item}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {right?.map((item, i) => (
          <span key={i} className="chip !bg-dusk-950/70 backdrop-blur-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
