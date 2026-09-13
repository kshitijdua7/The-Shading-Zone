'use client';

import { useEffect } from 'react';

/**
 * One IntersectionObserver for the whole site.
 *
 * Any element with `.reveal` fades and lifts into place the first time it
 * enters the viewport. Elements are visible by default in CSS when JS is
 * unavailable, and `prefers-reduced-motion` neutralises the transform entirely
 * (see globals.css) — so this is pure enhancement, never a dependency.
 *
 * Set `--reveal-delay` on a child, or add `data-reveal-stagger` to a parent, to
 * cascade a group.
 */
export default function ScrollRevealProvider() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const parent = el.closest('[data-reveal-stagger]');
          let delay = 0;
          if (parent) {
            const siblings = Array.from(parent.querySelectorAll<HTMLElement>('.reveal'));
            delay = Math.min(siblings.indexOf(el), 8) * 85;
          }
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('is-in');
          io.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    const observeAll = () => {
      document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => io.observe(el));
    };

    observeAll();

    // Re-scan after client-side navigation adds new nodes.
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
