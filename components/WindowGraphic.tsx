'use client';

import { useEffect, useRef } from 'react';
import { clamp } from '@/lib/utils';

/**
 * The animated window used on the homepage introduction — CSS 3D slats that tilt
 * open and let a wash of daylight through as the block scrolls into view.
 *
 * Deliberately not WebGL: this is decorative, sits below the fold, and a dozen
 * transformed divs cost essentially nothing next to a second canvas context.
 */
export default function WindowGraphic({ slats = 14 }: { slats?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const paint = (p: number) => {
      el.style.setProperty('--open', String(p));
    };

    if (reduce) {
      paint(0.8);
      return;
    }

    let raf = 0;
    const read = () => {
      const r = el.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.92 - r.top) / (r.height + window.innerHeight * 0.5), 0, 1);
      paint(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative aspect-[4/5] w-full select-none overflow-hidden bg-char-950"
      style={{ ['--open' as string]: '0', perspective: '900px' }}
    >
      {/* The view beyond */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #A9C4DA 0%, #D2E0EA 38%, #F0E4CE 68%, #E4D5B9 100%)',
          filter: 'saturate(1.05)',
        }}
      />
      {/* Horizon + treeline */}
      <div className="absolute inset-x-0 bottom-0 h-[26%]" style={{ background: 'linear-gradient(180deg, rgba(112,130,104,0.55), rgba(86,104,80,0.9))' }} />
      <div className="absolute inset-x-0 bottom-[24%] h-[14%] opacity-40" style={{ background: 'linear-gradient(180deg, rgba(140,156,172,0), rgba(120,138,156,0.9))' }} />

      {/* Light wash that strengthens as the slats open */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(70% 55% at 62% 38%, rgba(255,244,220,0.9), rgba(255,238,205,0) 70%)',
          opacity: 'calc(var(--open) * 0.95)',
        }}
      />

      {/* Slats */}
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {Array.from({ length: slats }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-x-0 origin-center"
            style={{
              top: `${(i / slats) * 100}%`,
              height: `${100 / slats}%`,
              background: 'linear-gradient(180deg, #F3EEE5 0%, #DCD4C7 55%, #C6BCAC 100%)',
              boxShadow: '0 2px 6px rgba(12,11,10,0.28)',
              transform: `rotateX(calc(var(--open) * -74deg)) translateY(calc(var(--open) * ${-i * 0.55}px))`,
              transformOrigin: 'center center',
              transition: 'transform 120ms linear',
              backfaceVisibility: 'hidden',
            }}
          />
        ))}
      </div>

      {/* Frame */}
      <div className="pointer-events-none absolute inset-0 border-[10px] border-char-900" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-char-900" />

      {/* Cast light on the "floor" strip below */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%]"
        style={{
          background: 'linear-gradient(180deg, rgba(255,243,219,0) 0%, rgba(255,240,212,0.55) 100%)',
          opacity: 'var(--open)',
        }}
      />
    </div>
  );
}
