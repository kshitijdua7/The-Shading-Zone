'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * The confirmation moment: a set of slats lifts away to reveal the message,
 * echoing the hero. Announced via role="status" so screen-reader users are told
 * the submission succeeded rather than being left with a silent animation.
 */
export default function FormSuccess({
  headline = "We've got you covered.",
  message,
}: {
  headline?: string;
  message: string;
}) {
  const [open, setOpen] = useState(false);
  const SLATS = 9;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setOpen(true);
      return;
    }
    const t = window.setTimeout(() => setOpen(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative isolate overflow-hidden bg-char-950 px-gutter py-section-sm text-center text-warm-white"
    >
      {/* Slats */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {Array.from({ length: SLATS }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-x-0 bg-char-800 transition-transform duration-[900ms] ease-luxe"
            style={{
              top: `${(i / SLATS) * 100}%`,
              height: `${100 / SLATS}%`,
              transitionDelay: `${i * 55}ms`,
              transform: open ? 'translateY(-104%) scaleY(0.2)' : 'none',
              borderTop: '1px solid rgba(250,248,245,0.07)',
            }}
          />
        ))}
      </div>

      <div
        className="relative mx-auto flex max-w-2xl flex-col items-center transition-all duration-700 ease-luxe"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'none' : 'translateY(18px)',
          transitionDelay: '420ms',
        }}
      >
        <span className="eyebrow text-brass-light">Request received</span>
        <h2 className="mt-6 text-display-md font-extrabold uppercase">{headline}</h2>
        <p className="mt-7 max-w-prose text-base leading-relaxed text-warm-white/70">{message}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/gallery" className="btn-light">
            Browse the gallery
          </Link>
          <Link href="/collections" className="btn-light">
            Explore collections
          </Link>
        </div>
      </div>
    </div>
  );
}
