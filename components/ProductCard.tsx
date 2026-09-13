'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { imageUrl, type Product } from '@/lib/content';
import { cn } from '@/lib/utils';

/**
 * Product card with a real 3D tilt and a slat animation on hover.
 *
 * The tilt is pointer-only and skipped for reduced-motion users and coarse
 * pointers. The slats are a CSS gradient overlay that "opens" — the same visual
 * language as the hero, at card scale.
 */
export default function ProductCard({
  product,
  index = 0,
  eager = false,
}: {
  product: Product;
  index?: number;
  eager?: boolean;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const enabled = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onMove = (e: React.MouseEvent) => {
    if (!enabled() || !innerRef.current || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    innerRef.current.style.transform = `perspective(1100px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateZ(14px)`;
  };

  const onLeave = () => {
    if (innerRef.current) innerRef.current.style.transform = '';
  };

  return (
    <Link
      ref={cardRef}
      href={`/blinds/${product.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onBlur={onLeave}
      className="reveal group relative block"
      style={{ perspective: '1100px' }}
    >
      <div ref={innerRef} className="tilt">
        <div className="relative aspect-[4/5] overflow-hidden bg-warm-100">
          <img
            src={imageUrl(product.card, 900)}
            alt={`${product.name} — ${product.tagline}`}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            width={900}
            height={1125}
            className="h-full w-full object-cover transition-transform duration-[1.1s] ease-luxe group-hover:scale-[1.05]"
          />

          {/* Slats close in on hover, then rotate open — a blind, at card scale. */}
          <div
            aria-hidden="true"
            className="slats pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-luxe group-hover:opacity-100 group-focus-visible:opacity-100"
            style={{ mixBlendMode: 'multiply' }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-char-950/75 via-char-950/5 to-transparent"
          />

          <span className="pointer-events-none absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-warm-white/30 text-warm-white opacity-0 transition-all duration-500 ease-luxe group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 md:translate-y-2">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>

          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-[0.62rem] uppercase tracking-[0.28em] text-warm-white/55">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-2 text-xl font-bold uppercase leading-tight tracking-tight text-warm-white sm:text-2xl">
              {product.name}
            </h3>
          </div>
        </div>

        <div className="flex items-start justify-between gap-6 pt-5">
          <p className="max-w-[26ch] text-sm leading-relaxed text-stone-600">{product.tagline}</p>
          <span
            className={cn(
              'shrink-0 pt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-char-950',
              'link-draw'
            )}
          >
            Explore
          </span>
        </div>
      </div>
    </Link>
  );
}
