'use client';

/* ────────────────────────────────────────────────────────────────────────────
   SCROLL-LOCKED VIDEO HERO  (alternative hero)

   The page is pinned while wheel / touch / keyboard input scrubs a video's
   currentTime. When the video reaches the end and the visitor keeps pushing
   forward, the page unlocks and continues; scrolling back up re-locks it.

   ⚠️  This is NOT the hero the site ships with. components/hero/CinematicHero
   gets the same effect from a sticky pin and native scrolling, which keeps the
   scrollbar honest and does not fight assistive technology. Reach for this file
   only if you specifically want a real video scrub, and read the caveats below.

   Fixes applied to the original snippet:
   • The original had "no release valve in either direction" — once mounted, the
     page could never scroll again. It now releases at the end of the video and
     re-locks on the way back up.
   • Keyboard input (arrows, space, page up/down, home/end) now drives the scrub.
     Without it, keyboard-only visitors were stuck on the hero permanently.
   • The lock is skipped entirely under `prefers-reduced-motion` — the video jumps
     to its final frame and the page scrolls normally.
   • A hard timeout releases the lock if the video never loads, so a failed
     network request can't trap anyone.
   • The hardcoded third-party signature credit is off by default.

   USAGE
     <MetroHero
       videoSrc="/video/blinds-opening.mp4"
       title="THE SHADING ZONE"
       tagline="Your view. Your light. Your style."
     />

   Encode the source as a short, keyframe-dense MP4 (H.264, ~2–4s, a keyframe
   every 2–3 frames) or scrubbing will stutter — normal web video has far too
   few keyframes to seek smoothly.
   ──────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react';

export interface MetroHeroProps {
  videoSrc: string;
  title?: string;
  scrollHint?: string;
  tagline?: string;
  signature?: { name: string; url: string } | false;
  /** Total input distance (px) needed to scrub the full video. */
  scrubDistance?: number;
  className?: string;
  style?: React.CSSProperties;
}

const SANS = 'var(--font-display), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const COL_BG = '#0C0B0A';
const COL_TEXT = '#FAF8F5';

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function MetroHero({
  videoSrc,
  title = 'THE SHADING ZONE',
  scrollHint = 'SCROLL TO REVEAL YOUR VIEW',
  tagline = 'Your view. Your light. Your style.',
  signature = false,
  scrubDistance = 3200,
  className,
  style,
}: MetroHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let duration = 0;
    let rafId = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let started = false;
    let isSeeking = false;
    let pendingTime: number | null = null;
    let locked = false;
    let lockedScrollY = 0;
    let touchStartY = 0;
    let releaseTimer = 0;

    const onLoadedData = () => {
      duration = video.duration || 0;
      setReady(true);
      window.clearTimeout(releaseTimer);
      if (reduceMotion) {
        try { video.currentTime = duration * 0.98; } catch { /* seek unsupported */ }
      }
    };
    video.addEventListener('loadeddata', onLoadedData);

    const onSeeked = () => {
      isSeeking = false;
      if (pendingTime !== null) {
        const t = pendingTime;
        pendingTime = null;
        isSeeking = true;
        try { video.currentTime = t; } catch { isSeeking = false; }
      }
    };
    video.addEventListener('seeked', onSeeked);

    // Alias so the narrowing above survives into these hoisted functions.
    const media = video;

    function seekTo(t: number) {
      if (isSeeking) { pendingTime = t; return; }
      isSeeking = true;
      try { media.currentTime = t; } catch { isSeeking = false; }
    }

    function engageLock() {
      if (locked) return;
      locked = true;
      lockedScrollY = window.scrollY;
      const b = document.body.style;
      b.position = 'fixed';
      b.top = `-${lockedScrollY}px`;
      b.left = '0';
      b.right = '0';
      b.width = '100%';
    }

    function releaseLock() {
      if (!locked) return;
      locked = false;
      const y = lockedScrollY;
      const b = document.body.style;
      b.position = '';
      b.top = '';
      b.left = '';
      b.right = '';
      b.width = '';
      window.scrollTo(0, y);
    }

    /** Returns true when the input was consumed by the scrub. */
    function addDelta(deltaY: number): boolean {
      const next = clamp(targetProgress + deltaY / scrubDistance, 0, 1);

      // At the end and still pushing forward → hand the page back.
      if (targetProgress >= 1 && deltaY > 0) {
        releaseLock();
        return false;
      }
      targetProgress = next;
      if (targetProgress > 0.001) started = true;
      return true;
    }

    const onWheel = (e: WheelEvent) => {
      if (!locked) {
        // Re-lock when the visitor scrolls back up into the hero.
        if (e.deltaY < 0 && window.scrollY <= 1) {
          engageLock();
          targetProgress = Math.min(targetProgress, 0.999);
        } else {
          return;
        }
      }
      if (addDelta(e.deltaY)) e.preventDefault();
    };

    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0]?.clientY ?? 0; };

    const onTouchMove = (e: TouchEvent) => {
      if (!locked) return;
      const y = e.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - y;
      touchStartY = y;
      if (addDelta(deltaY)) e.preventDefault();
    };

    // Keyboard parity — without this the hero is a hard trap for keyboard users.
    const onKeyDown = (e: KeyboardEvent) => {
      if (!locked) return;
      const step = scrubDistance / 12;
      const map: Record<string, number> = {
        ArrowDown: step, ArrowRight: step, PageDown: step * 3, ' ': step * 3,
        ArrowUp: -step, ArrowLeft: -step, PageUp: -step * 3,
      };
      if (e.key === 'End') { targetProgress = 1; releaseLock(); e.preventDefault(); return; }
      if (e.key === 'Home') { targetProgress = 0; e.preventDefault(); return; }
      const d = map[e.key];
      if (d === undefined) return;
      if (addDelta(d)) e.preventDefault();
    };

    if (!reduceMotion) {
      engageLock();
      // Safety valve: if the video never loads, don't trap the visitor.
      releaseTimer = window.setTimeout(releaseLock, 6000);

      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('keydown', onKeyDown);
    } else {
      setReady(true);
    }

    function frame() {
      currentProgress += (targetProgress - currentProgress) * 0.18;
      if (duration > 0) seekTo(currentProgress * duration);

      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${1 + currentProgress * 0.06})`;
      }
      if (titleRef.current) {
        const t = 1 - clamp(currentProgress / 0.35, 0, 1);
        titleRef.current.style.opacity = String(t);
        titleRef.current.style.transform = `translateY(${(1 - t) * -24}px) scale(${0.96 + t * 0.04})`;
        titleRef.current.style.filter = `blur(${(1 - t) * 10}px)`;
      }
      if (hintRef.current) hintRef.current.style.opacity = started ? '0' : '1';
      if (taglineRef.current) {
        const t = clamp((currentProgress - 0.8) / 0.2, 0, 1);
        taglineRef.current.style.opacity = String(t);
        taglineRef.current.style.transform = `translateY(${(1 - t) * 20}px)`;
        taglineRef.current.style.filter = `blur(${(1 - t) * 8}px)`;
      }
      if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${currentProgress})`;

      rafId = requestAnimationFrame(frame);
    }

    if (!reduceMotion) rafId = requestAnimationFrame(frame);

    return () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('seeked', onSeeked);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(releaseTimer);
      cancelAnimationFrame(rafId);
      releaseLock();
    };
  }, [scrubDistance]);

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{ position: 'relative', height: '100dvh', width: '100%', overflow: 'hidden', background: COL_BG, ...style }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          opacity: ready ? 1 : 0, transformOrigin: 'center', willChange: 'transform',
          transition: 'opacity 0.6s ease',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(12,11,10,0.4), rgba(12,11,10,0) 30%, rgba(12,11,10,0.15) 70%, rgba(12,11,10,0.6))',
        }}
      />

      <div ref={titleRef} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6%', textAlign: 'center', pointerEvents: 'none' }}>
        <h1 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 'clamp(30px, 7vw, 96px)', lineHeight: 1, letterSpacing: '-0.03em', color: COL_TEXT, textShadow: '0 4px 30px rgba(0,0,0,0.5)', margin: 0 }}>
          {title}
        </h1>
      </div>

      {tagline && (
        <div ref={taglineRef} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%', textAlign: 'center', opacity: 0, pointerEvents: 'none' }}>
          <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: 'clamp(20px, 3.4vw, 40px)', lineHeight: 1.2, letterSpacing: '-0.01em', color: COL_TEXT, textShadow: '0 4px 24px rgba(0,0,0,0.5)', margin: 0 }}>
            {tagline}
          </p>
        </div>
      )}

      <div
        ref={hintRef}
        style={{
          position: 'absolute', left: '50%', bottom: 'clamp(20px, 6vh, 48px)', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          color: 'rgba(250,248,245,0.75)', fontFamily: SANS, fontSize: 'clamp(10px, 1.4vw, 12px)',
          fontWeight: 600, letterSpacing: '0.3em', transition: 'opacity 0.4s ease', pointerEvents: 'none',
        }}
      >
        <span>{scrollHint}</span>
        <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true">
          <path d="M7 1 L7 17 M2 12 L7 17 L12 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'rgba(255,255,255,0.12)' }}>
        <div ref={progressBarRef} style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,0.5), #C9A87C)', transform: 'scaleX(0)', transformOrigin: 'left center' }} />
      </div>

      {signature && (
        <span style={{ position: 'absolute', right: 'clamp(12px,2.5vw,24px)', bottom: 'clamp(10px,2vw,18px)', fontFamily: SANS, fontSize: 12, color: 'rgba(250,248,245,0.55)', zIndex: 2 }}>
          by{' '}
          <a href={signature.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
            {signature.name}
          </a>
        </span>
      )}
    </div>
  );
}
