'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Moon, Palette, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Appearance menu: light / dark mode plus four colour palettes.
 *
 * The choice is stored in localStorage and applied as data attributes on
 * <html>; the variables behind them live in app/globals.css. An inline script
 * in app/layout.tsx applies the saved choice before first paint.
 */
export const THEME_MODE_KEY = 'ats-mode';
export const THEME_PALETTE_KEY = 'ats-palette';

type Mode = 'light' | 'dark';

const PALETTES = [
  { id: 'sand', label: 'Sand', accent: '#B08D57', surface: '#EDE7DE' },
  { id: 'sage', label: 'Sage', accent: '#6F8F6B', surface: '#E3E9DD' },
  { id: 'ocean', label: 'Ocean', accent: '#4F7CA8', surface: '#DFE7EE' },
  { id: 'terracotta', label: 'Terracotta', accent: '#B5654A', surface: '#EEE0DA' },
] as const;
type PaletteId = (typeof PALETTES)[number]['id'];

function apply(mode: Mode, palette: PaletteId) {
  const root = document.documentElement;
  if (mode === 'dark') root.dataset.mode = 'dark';
  else delete root.dataset.mode;
  if (palette === 'sand') delete root.dataset.palette;
  else root.dataset.palette = palette;
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
    localStorage.setItem(THEME_PALETTE_KEY, palette);
  } catch {
    /* private window: the choice simply lasts for this page */
  }
}

export default function ThemeSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('light');
  const [palette, setPalette] = useState<PaletteId>('sand');
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Pick up whatever the inline script already applied. */
  useEffect(() => {
    const root = document.documentElement;
    setMode(root.dataset.mode === 'dark' ? 'dark' : 'light');
    const p = root.dataset.palette;
    if (PALETTES.some((x) => x.id === p)) setPalette(p as PaletteId);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const chooseMode = (m: Mode) => {
    setMode(m);
    apply(m, palette);
  };
  const choosePalette = (p: PaletteId) => {
    setPalette(p);
    apply(mode, p);
  };

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Appearance: light or dark mode and colour theme"
        className="grid h-11 w-11 place-items-center rounded-full transition-colors duration-300 hover:bg-brass/20"
      >
        <Palette className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Appearance"
          className="absolute right-0 top-full z-50 mt-3 w-[17rem] border border-char-950/10 bg-warm-white p-5 text-char-950 shadow-lift-lg"
        >
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-stone-500">Mode</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                { id: 'light', label: 'Light', Icon: Sun },
                { id: 'dark', label: 'Dark', Icon: Moon },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => chooseMode(id)}
                aria-pressed={mode === id}
                className={cn(
                  'flex min-h-[44px] items-center justify-center gap-2 border text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300',
                  mode === id
                    ? 'border-solid bg-solid text-on-solid'
                    : 'border-char-950/15 text-char-700 hover:border-char-950/50'
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <p className="mt-6 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-stone-500">Colour</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => choosePalette(p.id)}
                aria-pressed={palette === p.id}
                className={cn(
                  'flex min-h-[44px] items-center gap-2.5 border px-3 text-left text-[0.8rem] font-medium transition-colors duration-300',
                  palette === p.id ? 'border-char-950' : 'border-char-950/15 hover:border-char-950/50'
                )}
              >
                <span
                  aria-hidden="true"
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full ring-1 ring-black/10"
                  style={{ background: `linear-gradient(135deg, ${p.surface} 50%, ${p.accent} 50%)` }}
                >
                  {palette === p.id && <Check className="h-3 w-3 text-white drop-shadow" />}
                </span>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
