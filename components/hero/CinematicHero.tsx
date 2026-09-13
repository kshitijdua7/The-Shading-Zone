'use client';

/* ────────────────────────────────────────────────────────────────────────────
   CINEMATIC HERO — The Shading Zone's signature moment.

     open the site → premium room, blinds closed → scroll → blinds open →
     light floods in → the camera moves through the window → the brand appears.

   WHY THIS PINS INSTEAD OF HIJACKING SCROLL
   The original scroll-locked pattern pins `document.body` with position:fixed
   and swallows wheel/touch events. It looks great and it breaks badly: keyboard
   users (Space, PageDown, arrows), screen-reader virtual cursors, the scrollbar,
   browser find-in-page and back/forward restoration all stop working, and on a
   slow connection a visitor can be trapped in a hero that never releases.

   This version gets the identical feel from a tall spacer + `position: sticky`.
   The page genuinely scrolls — every input method works, the scrollbar tells the
   truth — but the visual frame stays put while the scene scrubs. Reverse
   scrolling rewinds it, exactly as before.

   The literal wheel-capture version is still in the repo at
   components/ui/scroll-locked-video-hero.tsx (with the release bug fixed) if you
   ever want to swap it in for a video-based hero.
   ──────────────────────────────────────────────────────────────────────────── */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import type { BlindScene } from './blindScene';
import { imageUrl } from '@/lib/content';
import { clamp } from '@/lib/utils';
import Wordmark from '@/components/Wordmark';

/** How much scroll distance the reveal takes. 320 = a little over three screens. */
const SCRUB_VH = 320;

export default function CinematicHero() {
  const wrapRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  const sceneRef = useRef<BlindScene | null>(null);
  const progressRef = useRef(0);

  const [fallback, setFallback] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lowPower = window.matchMedia('(max-width: 767px)').matches;

    if (mq.matches) {
      setReduced(true);
      // Reduced motion: render the finished frame, show the message, no scrubbing.
      paintOverlays(1);
    }

    let cancelled = false;
    let onScroll: (() => void) | null = null;
    let onResize: (() => void) | null = null;
    let io: IntersectionObserver | null = null;

    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let scene: BlindScene;
      try {
        const { createBlindScene } = await import('./blindScene');
        scene = createBlindScene(canvas, { lite: lowPower });
      } catch {
        // No WebGL, or the chunk failed — fall back to the photographic hero.
        if (!cancelled) setFallback(true);
        return;
      }
      if (cancelled) {
        scene.dispose();
        return;
      }
      sceneRef.current = scene;

      if (mq.matches) {
        scene.setProgress(0.94);
        return;
      }

      scene.start();

      const read = () => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        const p = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
        progressRef.current = p;
        scene.setProgress(p);
        paintOverlays(p);
      };

      // Read synchronously rather than inside requestAnimationFrame. `read` only
      // measures one rect and writes compositor-only properties (transform,
      // opacity, filter), so it does not thrash layout — and if rAF is starved
      // on a slow device, the scroll position must still reach the scene.
      onScroll = read;
      onResize = () => {
        scene.resize();
        read();
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      read();

      // Stop rendering entirely once the hero is off screen.
      io = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? scene.start() : scene.stop()),
        { rootMargin: '120px' }
      );
      if (wrapRef.current) io.observe(wrapRef.current);
    })();

    return () => {
      cancelled = true;
      if (onScroll) window.removeEventListener('scroll', onScroll);
      if (onResize) window.removeEventListener('resize', onResize);
      io?.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  /** Overlay choreography — written straight to style, never through React state. */
  function paintOverlays(p: number) {
    const t = (from: number, to: number) => clamp((p - from) / (to - from), 0, 1);

    if (introRef.current) {
      const out = t(0.02, 0.2);
      introRef.current.style.opacity = String(1 - out);
      introRef.current.style.transform = `translateY(${out * -34}px) scale(${1 - out * 0.06})`;
      introRef.current.style.filter = `blur(${out * 9}px)`;
    }
    if (hintRef.current) {
      hintRef.current.style.opacity = String(1 - t(0.005, 0.06));
    }
    if (messageRef.current) {
      const inn = t(0.72, 0.95);
      messageRef.current.style.opacity = String(inn);
      messageRef.current.style.transform = `translateY(${(1 - inn) * 30}px)`;
      messageRef.current.style.filter = `blur(${(1 - inn) * 7}px)`;
      messageRef.current.style.pointerEvents = inn > 0.9 ? 'auto' : 'none';
    }
    if (railRef.current) {
      railRef.current.style.transform = `scaleX(${p})`;
    }
    if (vignetteRef.current) {
      /* Darkness lifts as daylight comes in, then returns firmly for the final
         frame. That last return is not decoration: the brand message is warm
         white over a bright sky, and without it the headline and subhead fall
         below AA contrast exactly where they matter most. */
      const dark = 0.55 - t(0.15, 0.6) * 0.42 + t(0.68, 1) * 0.64;
      vignetteRef.current.style.opacity = String(clamp(dark, 0, 1));
    }
  }

  return (
    <section
      ref={wrapRef}
      aria-label="The Shading Zone introduction"
      style={{ height: reduced ? '100svh' : `${SCRUB_VH}vh` }}
      className="relative bg-char-950"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* ── The scene ─────────────────────────────────────────────────── */}
        {!fallback ? (
          <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
        ) : (
          <img
            src={imageUrl('roomDrapery', 2000)}
            alt="A modern living room with floor-length drapery filtering afternoon light"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Vignette + colour grade */}
        <div
          ref={vignetteRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.5,
            background:
              'radial-gradient(120% 95% at 50% 45%, rgba(12,11,10,0.22) 22%, rgba(12,11,10,0.62) 72%, rgba(12,11,10,0.9) 100%), linear-gradient(180deg, rgba(12,11,10,0.5) 0%, rgba(12,11,10,0.1) 26%, rgba(12,11,10,0.1) 62%, rgba(12,11,10,0.78) 100%)',
          }}
        />

        {/* ── Opening frame: logo + instruction ─────────────────────────── */}
        <div
          ref={introRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-gutter text-center"
        >
          <Wordmark className="w-[min(78vw,30rem)] text-warm-white" />
          <p className="mt-8 text-eyebrow text-warm-white/60">Custom blinds · Custom curtains · Custom spaces</p>
        </div>

        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-[max(1.75rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-warm-white/70"
        >
          <span className="text-eyebrow">Scroll to reveal your view</span>
          <ArrowDown className="h-4 w-4 motion-safe:animate-bounce" aria-hidden="true" />
        </div>

        {/* ── Payoff: the brand message ─────────────────────────────────── */}
        <div
          ref={messageRef}
          style={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-gutter text-center"
        >
          <h1 className="max-w-[18ch] text-display-lg font-extrabold uppercase text-warm-white drop-shadow-[0_6px_40px_rgba(12,11,10,0.55)]">
            Your view. Your light. Your style.
          </h1>
          <p className="mt-7 max-w-prose text-base leading-relaxed text-warm-white/90 drop-shadow-[0_2px_16px_rgba(12,11,10,0.85)] sm:text-lg">
            Custom blinds and curtains, designed and manufactured for the way you live.
          </p>
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link href="/consultation" className="btn-light bg-warm-white text-char-950 hover:bg-warm-50">
              Book a free consultation
            </Link>
            <Link href="/collections" className="btn-light">
              Explore our collection
            </Link>
          </div>
        </div>

        {/* ── Progress rail ─────────────────────────────────────────────── */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-warm-white/12">
          <div
            ref={railRef}
            className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-warm-white/40 to-brass-light"
          />
        </div>
      </div>
    </section>
  );
}
