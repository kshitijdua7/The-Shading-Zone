'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryCategories, image, imageUrl, type ImageKey } from '@/lib/content';

type Item = { key: ImageKey; category: string; categorySlug: string };

export default function GalleryGrid() {
  const [filter, setFilter] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    const seen = new Set<string>();
    for (const cat of galleryCategories) {
      for (const key of cat.images) {
        const id = `${cat.slug}:${key}`;
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({ key, category: cat.name, categorySlug: cat.slug });
      }
    }
    return out;
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.categorySlug === filter)),
    [items, filter]
  );

  const close = useCallback(() => {
    setOpenIndex(null);
    lastFocused.current?.focus();
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setOpenIndex((i) => {
        if (i === null) return i;
        return (i + dir + visible.length) % visible.length;
      });
    },
    [visible.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab' && dialogRef.current) {
        const nodes = dialogRef.current.querySelectorAll<HTMLElement>('button, a[href]');
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [openIndex, close, step]);

  const current = openIndex !== null ? visible[openIndex] : null;

  return (
    <>
      {/* Filters */}
      <div className="no-scrollbar -mx-gutter mb-12 flex gap-2 overflow-x-auto px-gutter pb-2">
        {[{ slug: 'all', name: 'All' }, ...galleryCategories].map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setFilter(c.slug)}
            aria-pressed={filter === c.slug}
            className={`min-h-[44px] shrink-0 whitespace-nowrap border px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
              filter === c.slug
                ? 'border-char-950 bg-char-950 text-warm-white'
                : 'border-char-950/15 text-stone-600 hover:border-char-950/45 hover:text-char-950'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Masonry */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4" data-reveal-stagger>
        {visible.map((item, i) => {
          const img = image(item.key, 900);
          return (
            <button
              key={`${item.categorySlug}-${item.key}`}
              type="button"
              onClick={(e) => {
                lastFocused.current = e.currentTarget;
                setOpenIndex(i);
              }}
              className="reveal group relative block w-full break-inside-avoid overflow-hidden bg-warm-100 text-left"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="w-full transition-transform duration-[1.1s] ease-luxe group-hover:scale-[1.04]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-char-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <span className="absolute bottom-4 left-4 text-[0.6rem] uppercase tracking-[0.24em] text-warm-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                {item.category}
              </span>
              <span className="sr-only">Open larger view</span>
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {current && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${current.category} — enlarged view`}
          className="fixed inset-0 z-[60] flex flex-col bg-char-950/96 backdrop-blur-md"
        >
          <div className="flex items-center justify-between px-gutter py-5">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-warm-white/60">
              {current.category} · {openIndex! + 1} / {visible.length}
            </p>
            <button
              type="button"
              onClick={close}
              className="grid h-11 w-11 place-items-center rounded-full border border-warm-white/25 text-warm-white transition-colors hover:bg-warm-white hover:text-char-950"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-gutter">
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute left-3 z-10 grid h-12 w-12 place-items-center rounded-full border border-warm-white/25 text-warm-white transition-colors hover:bg-warm-white hover:text-char-950 sm:left-6"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Previous image</span>
            </button>

            <img
              src={imageUrl(current.key, 2000)}
              alt={image(current.key).alt}
              className="max-h-full max-w-full object-contain"
            />

            <button
              type="button"
              onClick={() => step(1)}
              className="absolute right-3 z-10 grid h-12 w-12 place-items-center rounded-full border border-warm-white/25 text-warm-white transition-colors hover:bg-warm-white hover:text-char-950 sm:right-6"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Next image</span>
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 px-gutter py-7 text-center">
            <p className="max-w-prose text-sm text-warm-white/65">{image(current.key).alt}</p>
            <Link href="/consultation" className="btn bg-warm-white text-char-950 hover:bg-brass hover:text-white">
              Get this look
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
