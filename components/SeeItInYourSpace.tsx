'use client';

import { useState } from 'react';
import { imageUrl, type ImageKey } from '@/lib/content';
import { cn } from '@/lib/utils';

const OPACITIES = [
  { id: 'sheer', label: 'Sheer', alpha: 0.16, blur: 0 },
  { id: 'filtering', label: 'Light filtering', alpha: 0.44, blur: 1.5 },
  { id: 'darkening', label: 'Room darkening', alpha: 0.72, blur: 3 },
  { id: 'blackout', label: 'Blackout', alpha: 0.94, blur: 5 },
] as const;

const COLOURS = [
  { id: 'warm-white', label: 'Warm white', hex: '#F2ECE2' },
  { id: 'oyster', label: 'Oyster', hex: '#E2D8C8' },
  { id: 'sand', label: 'Sand', hex: '#CDBBA0' },
  { id: 'greige', label: 'Greige', hex: '#A79C8E' },
  { id: 'slate', label: 'Slate', hex: '#6E7176' },
  { id: 'charcoal', label: 'Charcoal', hex: '#3A3633' },
] as const;

/**
 * "See it in your space" — an illustrative preview of how opacity and colour
 * change a room. It is a visualisation aid, not a rendering engine, and the
 * caption says so; the real decision always happens with a physical sample in
 * the room's own light.
 */
export default function SeeItInYourSpace({
  imageKey,
  productName,
}: {
  imageKey: ImageKey;
  productName: string;
}) {
  const [opacity, setOpacity] = useState<(typeof OPACITIES)[number]>(OPACITIES[1]);
  const [colour, setColour] = useState<(typeof COLOURS)[number]>(COLOURS[0]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start lg:gap-16">
      <div className="reveal relative aspect-[4/3] overflow-hidden bg-warm-100">
        <img
          src={imageUrl(imageKey, 1400)}
          alt={`A room fitted with ${productName}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        {/* The covering: a tinted, slatted veil over the frame. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-all duration-500 ease-luxe"
          style={{
            backgroundColor: colour.hex,
            opacity: opacity.alpha,
            backdropFilter: `blur(${opacity.blur}px)`,
            WebkitBackdropFilter: `blur(${opacity.blur}px)`,
            mixBlendMode: opacity.alpha > 0.8 ? 'normal' : 'multiply',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25 transition-opacity duration-500"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgba(0,0,0,0.16) 0 1px, rgba(255,255,255,0.05) 1px 11px)',
          }}
        />
        <p
          aria-live="polite"
          className="absolute bottom-4 left-4 bg-char-950/70 px-4 py-2 text-[0.6rem] uppercase tracking-[0.2em] text-warm-white"
        >
          {colour.label} · {opacity.label}
        </p>
      </div>

      <div className="reveal space-y-9">
        <fieldset>
          <legend className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-char-700">
            Light control
          </legend>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {OPACITIES.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOpacity(o)}
                aria-pressed={opacity.id === o.id}
                className={cn(
                  'min-h-[48px] border px-4 py-3 text-sm transition-all duration-200',
                  opacity.id === o.id
                    ? 'border-char-950 bg-char-950 text-warm-white'
                    : 'border-char-950/15 text-stone-600 hover:border-char-950/45 hover:text-char-950'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-char-700">
            Colour
          </legend>
          <div className="mt-4 flex flex-wrap gap-3">
            {COLOURS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColour(c)}
                aria-pressed={colour.id === c.id}
                aria-label={c.label}
                title={c.label}
                className={cn(
                  'h-12 w-12 rounded-full border-2 transition-all duration-200',
                  colour.id === c.id ? 'border-char-950 scale-105' : 'border-char-950/15 hover:border-char-950/50'
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-stone-600">{colour.label}</p>
        </fieldset>

        <p className="max-w-prose border-l-2 border-brass/50 pl-5 text-xs leading-relaxed text-stone-500">
          This preview is an illustration of how opacity and colour change a room — not a rendering of
          your window. Fabric reads differently in real light, which is why we bring physical samples to
          every consultation and leave them with you.
        </p>
      </div>
    </div>
  );
}
