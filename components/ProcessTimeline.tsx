'use client';

import { useEffect, useRef } from 'react';
import type { Step } from '@/lib/content';
import { imageUrl } from '@/lib/content';
import { clamp } from '@/lib/utils';

/**
 * A vertical timeline whose spine draws itself as you scroll and whose steps
 * light up one at a time. The spine is a scaled div rather than an animated
 * height, so it stays on the compositor and never triggers layout.
 */
export default function ProcessTimeline({ steps }: { steps: Step[] }) {
  const wrapRef = useRef<HTMLOListElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (spineRef.current) spineRef.current.style.transform = 'scaleY(1)';
      return;
    }

    let raf = 0;
    const read = () => {
      const el = wrapRef.current;
      const spine = spineRef.current;
      if (!el || !spine) return;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.58;
      const p = clamp((mid - r.top) / Math.max(r.height, 1), 0, 1);
      spine.style.transform = `scaleY(${p})`;
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
    <ol ref={wrapRef} className="relative" data-reveal-stagger>
      {/* Spine */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-[13px] top-2 w-px bg-char-950/10 md:left-1/2 md:-translate-x-1/2"
      >
        <div
          ref={spineRef}
          className="h-full w-full origin-top scale-y-0 bg-brass will-change-transform"
        />
      </div>

      {steps.map((step, i) => (
        <li
          key={step.n}
          className="reveal relative grid gap-6 py-10 pl-12 md:grid-cols-2 md:items-center md:gap-16 md:py-14 md:pl-0"
        >
          {/* Node */}
          <span
            aria-hidden="true"
            className="absolute left-[7px] top-[3.1rem] grid h-3.5 w-3.5 place-items-center rounded-full border border-brass bg-warm-white md:left-1/2 md:-translate-x-1/2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brass" />
          </span>

          <div className={i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:order-2 md:pl-16'}>
            <p className="font-display text-5xl font-extrabold leading-none text-char-950/12 sm:text-6xl">
              {step.n}
            </p>
            <h3 className="mt-3 text-display-sm font-bold uppercase text-char-950">{step.title}</h3>
            <p className="mt-4 max-w-prose text-[0.95rem] leading-[1.75] text-stone-600 md:ml-auto">
              {step.text}
            </p>
          </div>

          <div className={i % 2 === 0 ? 'md:order-2 md:pl-16' : 'md:pr-16'}>
            {step.image && (
              <div className="aspect-[16/10] overflow-hidden bg-warm-100">
                <img
                  src={imageUrl(step.image, 900)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
