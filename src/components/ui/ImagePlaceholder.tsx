import { clsx } from "clsx";

/**
 * Temporary photo placeholder. Replace by swapping this component for a
 * <Image src="/images/your-photo.jpg" .../> once final photography is ready.
 */
export default function ImagePlaceholder({
  label = "Photo coming soon",
  className,
  rounded = "rounded-3xl",
}: {
  label?: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={clsx(
        rounded,
        "flex w-full items-center justify-center overflow-hidden border border-beige-dark/50 bg-gradient-to-br from-beige via-cream to-beige-dark/60",
        className
      )}
      role="img"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center text-forest/60">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          className="h-12 w-12 opacity-70"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="m21 16-5-5-9 9" />
        </svg>
        <span className="font-sans text-sm font-medium tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
}
