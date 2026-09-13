import type { Config } from 'tailwindcss';

/**
 * The Shading Zone design tokens.
 * Palette: warm white → off-white → beige → soft grey → charcoal → deep black,
 * with a single muted brass accent. Nothing here is decorative for its own sake;
 * every token maps to something used on the site.
 */
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
          white: '#FAF8F5',
          50: '#F5F1EB',
          100: '#EDE7DE',
          200: '#E0D7C9',
          300: '#CDC1AF',
        },
        stone: {
          400: '#A9A199',
          500: '#8A8279',
          600: '#6B645C',
        },
        char: {
          700: '#3A3633',
          800: '#262321',
          900: '#171514',
          950: '#0C0B0A',
        },
        brass: {
          DEFAULT: '#B08D57',
          light: '#C9A87C',
          dark: '#8C6E42',
        },
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
