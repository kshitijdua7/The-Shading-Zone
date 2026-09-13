import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge has to be told about custom scales.
 *
 * Out of the box it only knows Tailwind's own class groups. `text-display-md`
 * is not in its font-size list, so it falls into the catch-all text-COLOUR
 * group — and the moment a component also passes `text-char-950`, the size
 * class is silently discarded as a conflict. Every section heading on this site
 * rendered at body size because of it, with no error anywhere.
 *
 * Registering the custom scales here fixes it for every component at once.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display-xl', 'display-lg', 'display-md', 'display-sm', 'eyebrow'] },
      ],
      'font-family': [{ font: ['display', 'sans', 'editorial'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Respects the user's reduced-motion preference. Safe to call during SSR. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
