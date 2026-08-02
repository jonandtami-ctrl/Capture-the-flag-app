// Placeholder ad slot. Swap the inner content for your ad network's embed
// (e.g. Google AdSense <ins class="adsbygoogle">) — the outer sizing/label
// wrapper is what keeps layout stable once real ads load.
export default function AdSlot({ format = 'horizontal', className = '' }) {
  const sizing = {
    horizontal: 'min-h-[90px] w-full max-w-3xl',
    square: 'min-h-[250px] w-full max-w-[300px]',
    vertical: 'min-h-[600px] w-full max-w-[160px]',
  }[format]

  return (
    <div className={`mx-auto flex flex-col items-center gap-1 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-forest-500/50">
        Advertisement
      </span>
      <div
        className={`flex ${sizing} items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-forest-500/40`}
        data-ad-slot={format}
      >
        Ad space — {format}
      </div>
    </div>
  )
}
