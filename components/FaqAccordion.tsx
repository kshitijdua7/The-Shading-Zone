'use client';

import { useMemo, useState } from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import type { Faq } from '@/lib/content';

/**
 * Searchable FAQ. Uses native <details>/<summary> semantics via a controlled
 * button + region pair so it works with the keyboard and is announced properly,
 * and the search filters on question, answer and tags.
 */
export default function FaqAccordion({
  items,
  searchable = true,
}: {
  items: Faq[] | { q: string; a: string }[];
  searchable?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((f) => {
      const tags = 'tags' in f && Array.isArray(f.tags) ? f.tags.join(' ') : '';
      return `${f.q} ${f.a} ${tags}`.toLowerCase().includes(q);
    });
  }, [items, query]);

  return (
    <div>
      {searchable && (
        <div className="reveal relative mb-12 max-w-xl">
          <label htmlFor="faq-search" className="sr-only">
            Search frequently asked questions
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions — try “blackout”, “motorized”, “warranty”"
            className="min-h-[52px] w-full border border-char-950/15 bg-transparent py-3.5 pl-11 pr-4 text-sm text-char-900 placeholder:text-stone-400 focus:border-char-950 focus:outline-none"
          />
          <p aria-live="polite" className="mt-3 text-xs text-stone-500">
            {query
              ? `${filtered.length} ${filtered.length === 1 ? 'question' : 'questions'} match “${query}”`
              : `${items.length} questions`}
          </p>
        </div>
      )}

      <div className="divide-y divide-char-950/10 border-y border-char-950/10">
        {filtered.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={faq.q} className="reveal">
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-button-${i}`}
                  className="flex w-full items-start justify-between gap-6 py-7 text-left transition-colors hover:text-brass-dark"
                >
                  <span className="max-w-[46ch] text-base font-semibold leading-snug text-char-950 sm:text-lg">
                    {faq.q}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-char-950/15 text-char-950"
                  >
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
              </h3>
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-button-${i}`}
                hidden={!isOpen}
                className="pb-8 pr-12"
              >
                <p className="max-w-prose text-[0.95rem] leading-[1.8] text-stone-600">{faq.a}</p>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-12 text-sm text-stone-500">
            No questions match that search. Try a different word, or{' '}
            <a href="/contact" className="link-draw text-char-950">ask us directly</a>.
          </p>
        )}
      </div>
    </div>
  );
}
