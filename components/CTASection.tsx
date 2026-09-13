'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { imageUrl } from '@/lib/content';
import { clamp } from '@/lib/utils';
import Wordmark from './Wordmark';

/**
 * The closing moment of the homepage: a room behind two curtain panels that draw
 * apart as you scroll, letting sunlight into the frame and the brand onto it.
 *
 * Everything is driven by the section's own position in the viewport — no
 * library, no pinning, and it reverses cleanly on the way back up. Under
 * reduced motion the curtains simply start open.
 */
export default function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const paint = (p: number) => {
      const open = clamp((p - 0.06) / 0.62, 0, 1);
      const eased = 1 - Math.pow(1 - open, 3);
      if (leftRef.current) leftRef.current.style.transform = `translate3d(${-eased * 102}%,0,0)`;
      if (rightRef.current) rightRef.current.style.transform = `translate3d(${eased * 102}%,0,0)`;
      if (glowRef.current) {
        glowRef.current.style.opacity = String(eased * 0.9);
        glowRef.current.style.transform = `scale(${0.6 + eased * 0.75})`;
      }
      if (bgRef.current) bgRef.current.style.transform = `scale(${1.14 - eased * 0.1})`;
      if (contentRef.current) {
        const t = clamp((p - 0.3) / 0.35, 0, 1);
        contentRef.current.style.opacity = String(t);
        contentRef.current.style.transform = `translateY(${(1 - t) * 26}px)`;
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
      const travel = r.height + window.innerHeight;
      const p = clamp((window.innerHeight - r.top) / travel, 0, 1);
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
    <section
      ref={ref}
      aria-label="Ready to transform your windows"
      className="relative isolate flex min-h-[92svh] items-center justify-center overflow-hidden bg-char-950"
    >
      <img
        ref={bgRef}
        src={imageUrl('roomFireplace', 2000)}
        alt="A modern room with large windows and elegant window coverings"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-[1.14] object-cover will-change-transform"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-char-950/45" />

      {/* Sunlight bloom, revealed as the panels part */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[75vmax] w-[75vmax] -translate-x-1/2 -translate-y-1/2 opacity-0 will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(255,241,214,0.85) 0%, rgba(255,232,190,0.34) 32%, rgba(255,225,175,0) 68%)',
        }}
      />

      {/* Curtain panels */}
      <div
        ref={leftRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[52%] will-change-transform"
        style={{
          background:
            'linear-gradient(90deg, #14120F 0%, #241F1A 42%, #2E2822 78%, #100E0C 100%), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 2px, rgba(0,0,0,0.14) 2px 26px)',
          backgroundBlendMode: 'overlay',
          boxShadow: '18px 0 60px rgba(0,0,0,0.6)',
        }}
      />
      <div
        ref={rightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[52%] will-change-transform"
        style={{
          background:
            'linear-gradient(270deg, #14120F 0%, #241F1A 42%, #2E2822 78%, #100E0C 100%), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 2px, rgba(0,0,0,0.14) 2px 26px)',
          backgroundBlendMode: 'overlay',
          boxShadow: '-18px 0 60px rgba(0,0,0,0.6)',
        }}
      />

      <div
        ref={contentRef}
        className="shell relative z-10 flex flex-col items-center py-section text-center opacity-0"
      >
        <h2 className="max-w-[15ch] text-display-lg font-extrabold uppercase text-warm-white drop-shadow-[0_6px_40px_rgba(12,11,10,0.6)]">
          Ready to transform your windows?
        </h2>
        <p className="mt-7 max-w-prose text-base leading-relaxed text-warm-white/80 sm:text-lg">
          Let&rsquo;s create something that fits your space perfectly.
        </p>
        <div className="mt-11 flex flex-col items-stretch gap-3 sm:flex-row">
          <Link href="/consultation" className="btn bg-warm-white text-char-950 hover:bg-brass hover:text-white">
            Book a free consultation
          </Link>
          <Link href="/quote" className="btn-light">
            Get a free quote
          </Link>
        </div>
        <Wordmark className="mt-16 w-[min(60vw,17rem)] text-warm-white/55" />
      </div>
    </section>
  );
}
