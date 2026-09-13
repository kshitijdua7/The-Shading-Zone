'use client';

import { useCallback, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { image, type BeforeAfterPair } from '@/lib/content';

/**
 * Draggable before/after comparison.
 *
 * The handle is a real <input type="range">, visually restyled. That single
 * decision gives keyboard control, screen-reader announcement, touch support and
 * correct focus behaviour for free — none of which a div-with-pointer-events
 * implementation gets without a lot of extra code.
 */
export default function BeforeAfter({ pair }: { pair: BeforeAfterPair }) {
  const [value, setValue] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);

  const before = image(pair.before, 1400);
  const after = image(pair.after, 1400);

  const onPointer = useCallback((e: React.PointerEvent) => {
    if (e.buttons !== 1) return;
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setValue(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <figure className="reveal">
      <div
        ref={frameRef}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        className="relative aspect-[16/10] select-none overflow-hidden bg-warm-100"
      >
        <img
          src={after.src}
          alt={`After — ${pair.title}`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* The "before" layer is full-size and clipped, so both images stay in
            register at every viewport width. */}
        <img
          src={before.src}
          alt={`Before — ${pair.title}`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        />
        <span
          className="absolute left-4 top-4 bg-char-950/75 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-warm-white transition-opacity"
          style={{ opacity: value > 12 ? 1 : 0 }}
        >
          Before
        </span>

        <span className="absolute right-4 top-4 bg-warm-white/85 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-char-950">
          After
        </span>

        {/* Divider */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-warm-white shadow-[0_0_20px_rgba(0,0,0,0.35)]"
          style={{ left: `${value}%` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-warm-white/70 bg-char-950/55 text-warm-white backdrop-blur-sm"
          style={{ left: `${value}%` }}
        >
          <MoveHorizontal className="h-5 w-5" />
        </div>

        {/* The real control */}
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label={`Reveal slider — ${pair.title}. Left shows before, right shows after.`}
          className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0 focus-visible:opacity-100"
          style={{ WebkitAppearance: 'none' }}
        />
      </div>

      <figcaption className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h3 className="text-base font-semibold uppercase tracking-tight text-char-950">{pair.title}</h3>
        <p className="max-w-[46ch] text-sm leading-relaxed text-stone-600">{pair.note}</p>
      </figcaption>
    </figure>
  );
}
