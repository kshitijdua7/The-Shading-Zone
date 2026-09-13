'use client';

import { useEffect, useRef } from 'react';
import { imageUrl, type ImageKey } from '@/lib/content';
import { clamp } from '@/lib/utils';

/**
 * Curtains that draw open as the section scrolls through the viewport, with the
 * fabric folds compressing toward the edges the way real drapery stacks.
 * Reverses on the way back up; starts open for reduced-motion visitors.
 */
export default function CurtainReveal({
  imageKey,
  caption,
}: {
  imageKey: ImageKey;
  caption?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const paint = (p: number) => {
      const eased = 1 - Math.pow(1 - p, 3);
      // Panels narrow and slide out — fabric bunching, not a sliding door.
      if (leftRef.current) {
        leftRef.current.style.width = `${52 - eased * 38}%`;
        leftRef.current.style.transform = `translate3d(${-eased * 14}%,0,0)`;
      }
      if (rightRef.current) {
        rightRef.current.style.width = `${52 - eased * 38}%`;
        rightRef.current.style.transform = `translate3d(${eased * 14}%,0,0)`;
      }
    };

    if (reduce) {
      paint(1);
      return;
    }

    let raf = 0;
    const read = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.9 - r.top) / (r.height * 0.85 + window.innerHeight * 0.25), 0, 1);
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

  const fold =
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.11) 0 3px, rgba(0,0,0,0.10) 3px 9px, rgba(0,0,0,0.20) 9px 20px, rgba(255,255,255,0.06) 20px 26px)';

  return (
    <figure ref={ref} className="reveal">
      <div className="relative aspect-[16/9] overflow-hidden bg-char-950">
        <img
          src={imageUrl(imageKey, 2000)}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          ref={leftRef}
          aria-hidden="true"
          className="absolute inset-y-0 left-0 will-change-[width,transform]"
          style={{
            width: '52%',
            background: `linear-gradient(90deg, #1A1714 0%, #2C2620 50%, #191612 100%), ${fold}`,
            backgroundBlendMode: 'overlay',
            boxShadow: '16px 0 50px rgba(0,0,0,0.55)',
            transition: 'width 120ms linear, transform 120ms linear',
          }}
        />
        <div
          ref={rightRef}
          aria-hidden="true"
          className="absolute inset-y-0 right-0 will-change-[width,transform]"
          style={{
            width: '52%',
            background: `linear-gradient(270deg, #1A1714 0%, #2C2620 50%, #191612 100%), ${fold}`,
            backgroundBlendMode: 'overlay',
            boxShadow: '-16px 0 50px rgba(0,0,0,0.55)',
            transition: 'width 120ms linear, transform 120ms linear',
          }}
        />
      </div>
      {caption && (
        <figcaption className="mt-5 max-w-prose text-sm leading-relaxed text-stone-600">{caption}</figcaption>
      )}
    </figure>
  );
}
