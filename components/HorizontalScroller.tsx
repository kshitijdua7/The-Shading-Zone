'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { imageUrl, type Collection } from '@/lib/content';
import { clamp } from '@/lib/utils';

/**
 * Editorial horizontal scroll.
 *
 * On wide screens the track translates sideways as the page scrolls through a
 * tall pinned section. Below `lg` — and for anyone who prefers reduced motion —
 * it degrades to an ordinary swipeable row, which is what a phone wants anyway.
 * The row is a real scroll container in both cases, so keyboard and trackpad
 * users can always reach every card.
 */
export default function HorizontalScroller({ items }: { items: Collection[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mqDesktop = window.matchMedia('(min-width: 1024px)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let active = false;

    const read = () => {
      const r = section.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const p = travel > 0 ? clamp(-r.top / travel, 0, 1) : 0;
      const distance = Math.max(track.scrollWidth - window.innerWidth + 96, 0);
      track.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };

    const setup = () => {
      const shouldPin = mqDesktop.matches && !mqReduce.matches;
      if (shouldPin && !active) {
        active = true;
        section.style.height = `${Math.max(items.length * 46, 220)}vh`;
        window.addEventListener('scroll', onScroll, { passive: true });
        read();
      } else if (!shouldPin && active) {
        active = false;
        section.style.height = '';
        track.style.transform = '';
        window.removeEventListener('scroll', onScroll);
      } else if (shouldPin) {
        read();
      }
    };

    setup();
    mqDesktop.addEventListener('change', setup);
    mqReduce.addEventListener('change', setup);
    window.addEventListener('resize', setup);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', setup);
      mqDesktop.removeEventListener('change', setup);
      mqReduce.removeEventListener('change', setup);
    };
  }, [items.length]);

  return (
    <div ref={sectionRef} className="relative">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden">
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-gutter pb-4 will-change-transform lg:snap-none lg:overflow-visible lg:pb-0"
        >
          {items.map((c, i) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="group relative aspect-[3/4] w-[78vw] shrink-0 snap-center overflow-hidden bg-warm-100 sm:w-[52vw] lg:aspect-[4/5] lg:w-[34vw] xl:w-[27vw]"
            >
              <img
                src={imageUrl(c.image, 1200)}
                alt=""
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[1.2s] ease-luxe group-hover:scale-[1.05]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-char-950/85 via-char-950/20 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-7 text-warm-white">
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-warm-white/50">
                  {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </p>
                <h3 className="mt-3 text-display-sm font-extrabold uppercase">{c.name}</h3>
                <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-warm-white/70">{c.blurb}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em]">
                  View collection
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
