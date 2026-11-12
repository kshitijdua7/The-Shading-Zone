import type { Config } from 'tailwindcss';

/**
 * All Time Solutions design tokens.
 * Palette: warm white → off-white → beige → soft grey → charcoal → deep black,
 * with a single muted brass accent. Nothing here is decorative for its own sake;
 * every token maps to something used on the site.
 */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

/*
 * Every colour is a CSS variable (defined in app/globals.css) so the theme
 * switcher can change mode (light / dark) and palette at runtime.
 *
 *   warm-*   page surfaces as backgrounds; the fixed light tone as text/borders
 *   char-*   fixed dark surfaces as backgrounds; "ink" (flips in dark mode) as text/borders
 *   paper / night   always-light / always-dark, for use on photos and dark bands
 *   solid / on-solid   the high-contrast button pair, flips with the mode
 */
const ink = { 700: v('ink-700'), 800: v('ink-800'), 900: v('ink-900'), 950: v('ink-950') };

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          white: v('sf-white'),
          50: v('sf-50'),
          100: v('sf-100'),
          200: v('sf-200'),
          300: v('sf-300'),
        },
        stone: {
          400: v('stone-400'),
          500: v('stone-500'),
          600: v('stone-600'),
        },
        char: {
          700: v('char-700'),
          800: v('char-800'),
          900: v('char-900'),
          950: v('char-950'),
        },
        brass: {
          DEFAULT: v('brass'),
          light: v('brass-light'),
          dark: v('brass-dark'),
        },
        paper: v('paper-white'),
        night: v('char-950'),
        solid: v('solid'),
        'on-solid': v('on-solid'),
        line: v('ink-950'),
      },
      backgroundColor: {
        white: v('sf-card'),
      },
      textColor: {
        char: ink,
        warm: {
          white: v('paper-white'),
          50: v('paper-50'),
          100: v('paper-100'),
          200: v('paper-200'),
          300: v('paper-300'),
        },
      },
      borderColor: {
        char: ink,
        warm: { white: v('paper-white') },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        editorial: ['var(--font-editorial)', 'Georgia', 'serif'],
      },
      fontSize: {
        // Fluid display scale — used for the oversized editorial headlines.
        'display-xl': ['clamp(2.75rem, 11vw, 11rem)', { lineHeight: '0.88', letterSpacing: '-0.045em' }],
        'display-lg': ['clamp(2.25rem, 7.5vw, 6.5rem)', { lineHeight: '0.92', letterSpacing: '-0.038em' }],
        'display-md': ['clamp(1.9rem, 5vw, 4rem)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(1.5rem, 3.2vw, 2.5rem)', { lineHeight: '1.06', letterSpacing: '-0.02em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.34em' }],
      },
      spacing: {
        section: 'clamp(5rem, 12vw, 11rem)',
       'section-sm': 'clamp(3.5rem, 8vw, 7rem)',
        gutter: 'clamp(1.25rem, 5vw, 5rem)',
      },
      maxWidth: {
        shell: '110rem',
        prose: '38rem',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.16, 1, 0.3, 1)',
        swift: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        lift: '0 2px 4px rgba(23,21,20,0.03), 0 12px 24px -8px rgba(23,21,20,0.08), 0 32px 64px -24px rgba(23,21,20,0.12)',
        'lift-lg': '0 4px 8px rgba(23,21,20,0.04), 0 24px 48px -12px rgba(23,21,20,0.12), 0 64px 96px -32px rgba(23,21,20,0.18)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'slat-drift': {
          '0%, 100%': { transform: 'rotateX(0deg)' },
          '50%': { transform: 'rotateX(-18deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
