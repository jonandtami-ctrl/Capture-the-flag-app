const KOFI_URL = 'https://ko-fi.com/camphq'

// Support-CampHQ card. Doubles as the site's ad slots until a real ad
// network is wired up — same sizing wrapper so nothing shifts if/when
// AdSense (or similar) replaces this later.
export default function AdSlot({ format = 'horizontal', className = '' }) {
  const sizing = {
    horizontal: 'min-h-[90px] w-full max-w-3xl',
    square: 'min-h-[250px] w-full max-w-[300px]',
    vertical: 'min-h-[600px] w-full max-w-[160px]',
  }[format]

  const stacked = format !== 'horizontal'

  return (
    <div className={`mx-auto flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`flex ${sizing} ${stacked ? 'flex-col' : 'flex-row'} items-center justify-center gap-3 rounded-xl border border-ember-500/20 bg-ember-500/[0.06] px-6 py-4 text-center`}
        data-ad-slot={format}
      >
        <span className="text-3xl">☕</span>
        <div className={stacked ? '' : 'text-left'}>
          <p className="font-display text-lg tracking-wide text-ember-100">
            Enjoying CampHQ?
          </p>
          <p className="text-xs text-forest-300/60">
            Tips keep it free, ad-free, and growing.
          </p>
        </div>
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-white shadow-glow transition hover:bg-ember-400"
        >
          Support on Ko-fi
        </a>
      </div>
    </div>
  )
}
