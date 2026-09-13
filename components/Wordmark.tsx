import { cn } from '@/lib/utils';

/**
 * The Shading Zone mark: a window divided into slats that step from closed to
 * open, set beside the wordmark. Pure SVG, `currentColor` throughout, so it
 * inverts cleanly on dark and light and scales to any size without an asset.
 */
export default function Wordmark({
  className,
  showMark = true,
}: {
  className?: string;
  showMark?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 320 46"
      role="img"
      aria-label="The Shading Zone"
      className={cn('h-auto', className)}
      fill="none"
    >
      {showMark && (
        <g>
          <rect x="0.6" y="0.6" width="36.8" height="44.8" rx="1.4" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
          {/* Slats: progressively opening from top to bottom. */}
          <rect x="5" y="6"  width="28" height="4.4" fill="currentColor" opacity="0.95" />
          <rect x="5" y="13" width="28" height="3.6" fill="currentColor" opacity="0.8" />
          <rect x="5" y="19.4" width="28" height="2.8" fill="currentColor" opacity="0.62" />
          <rect x="5" y="25" width="28" height="2" fill="currentColor" opacity="0.44" />
          <rect x="5" y="30" width="28" height="1.3" fill="currentColor" opacity="0.28" />
          <rect x="5" y="34.4" width="28" height="0.8" fill="currentColor" opacity="0.16" />
        </g>
      )}
      {/* Subordinate article, set above the wordmark. */}
      <text
        x={showMark ? 53 : 1}
        y="13.5"
        fill="currentColor"
        fontFamily="var(--font-display), Manrope, Helvetica Neue, Arial, sans-serif"
        fontSize="10.5"
        fontWeight="600"
        letterSpacing="3.6"
        opacity="0.6"
      >
        THE
      </text>
      <text
        x={showMark ? 52 : 0}
        y="33"
        fill="currentColor"
        fontFamily="var(--font-display), Manrope, Helvetica Neue, Arial, sans-serif"
        fontSize="25"
        fontWeight="800"
        letterSpacing="1.1"
      >
        SHADING
      </text>
      <text
        x={showMark ? 178 : 126}
        y="33"
        fill="currentColor"
        fontFamily="var(--font-display), Manrope, Helvetica Neue, Arial, sans-serif"
        fontSize="25"
        fontWeight="300"
        letterSpacing="4.2"
        opacity="0.78"
      >
        ZONE
      </text>
    </svg>
  );
}
