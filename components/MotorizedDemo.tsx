'use client';

import { useEffect, useRef, useState } from 'react';
import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { clamp } from '@/lib/utils';

const SCENES = [
  { key: 'morning', label: '07:00 — Morning', note: 'Shades rise to let the day in.', open: 0.9, Icon: Sunrise, sky: ['#C8D9E8', '#F2E3CB'] },
  { key: 'midday', label: '13:00 — Midday', note: 'Angled to cut glare without losing the view.', open: 0.45, Icon: Sun, sky: ['#B9D2E8', '#E9EEF2'] },
  { key: 'evening', label: '18:00 — Evening', note: 'Lowered as the sun drops to the west.', open: 0.2, Icon: Sunset, sky: ['#E5B98C', '#8E7A78'] },
  { key: 'night', label: '22:00 — Night', note: 'Fully closed for privacy.', open: 0.02, Icon: Moon, sky: ['#26303C', '#151B22'] },
] as const;

/**
 * A scroll-driven demonstration of an automated schedule: as the section passes
 * through the viewport, the day advances and the blind adjusts itself. Buttons
 * let anyone jump straight to a time — the scroll is a flourish, not the only
 * way in.
 */
export default function MotorizedDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const read = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.3), 0, 1);
      setIndex(Math.min(SCENES.length - 1, Math.floor(p * SCENES.length)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [manual]);

  const scene = SCENES[index];
  const SLATS = 16;

  return (
    <div ref={ref} className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
      {/* The window */}
      <div
        aria-hidden="true"
        className="relative aspect-[5/6] overflow-hidden bg-char-950"
        style={{ perspective: '900px' }}
      >
        <div
          className="absolute inset-0 transition-all duration-[1200ms] ease-luxe"
          style={{ background: `linear-gradient(180deg, ${scene.sky[0]}, ${scene.sky[1]})` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[22%] transition-opacity duration-[1200ms]"
          style={{ background: 'linear-gradient(180deg, rgba(96,112,90,0.5), rgba(70,84,66,0.92))' }}
        />
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {Array.from({ length: SLATS }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-x-0 transition-transform duration-[1100ms] ease-luxe"
              style={{
                top: `${(i / SLATS) * 100}%`,
                height: `${100 / SLATS}%`,
                background: 'linear-gradient(180deg, #F1ECE3 0%, #D9D1C4 58%, #BFB5A6 100%)',
                boxShadow: '0 2px 5px rgba(12,11,10,0.3)',
                transform: `rotateX(${-scene.open * 76}deg) translateY(${-scene.open * i * 0.6}px)`,
                transitionDelay: `${i * 26}ms`,
              }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 border-[10px] border-char-900" />
      </div>

      {/* Controls */}
      <div>
        <ol className="space-y-1">
          {SCENES.map((s, i) => {
            const active = i === index;
            const Icon = s.Icon;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => {
                    setManual(true);
                    setIndex(i);
                  }}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full min-h-[64px] items-center gap-5 border-l-2 py-4 pl-5 pr-4 text-left transition-all duration-500 ${
                    active ? 'border-brass bg-warm-50' : 'border-char-950/10 hover:border-char-950/30'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors duration-500 ${active ? 'text-brass' : 'text-stone-400'}`}
                    aria-hidden="true"
                  />
                  <span>
                    <span className={`block text-sm font-semibold ${active ? 'text-char-950' : 'text-stone-500'}`}>
                      {s.label}
                    </span>
                    <span className={`mt-1 block text-sm ${active ? 'text-stone-600' : 'text-stone-400'}`}>
                      {s.note}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-8 max-w-prose border-l-2 border-brass/50 pl-5 text-xs leading-relaxed text-stone-500">
          Scheduling and sun-tracking are available where the motor system supports it. Which
          features you get depends on the motors we specify for your windows — we&rsquo;ll tell you
          exactly what your setup can and can&rsquo;t do before you order.
        </p>
      </div>
    </div>
  );
}
