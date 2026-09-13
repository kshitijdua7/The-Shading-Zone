import { Check } from 'lucide-react';

/** The animated tick cards used for the trust and "why us" sections. */
export function TickCards({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
      {items.map((c) => (
        <li key={c.title} className="reveal group">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 place-items-center rounded-full border border-brass/40 text-brass transition-all duration-500 ease-luxe group-hover:border-brass group-hover:bg-brass group-hover:text-white"
          >
            <Check className="h-4 w-4" />
          </span>
          <h3 className="mt-6 text-base font-bold uppercase tracking-tight text-char-950">{c.title}</h3>
          <p className="mt-3 max-w-[34ch] text-[0.92rem] leading-[1.75] text-stone-600">{c.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** Plain numbered cards, used for sector and partner lists. */
export function NumberCards({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ul className="grid gap-px overflow-hidden border border-char-950/10 bg-char-950/10 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
      {items.map((c, i) => (
        <li key={c.title} className="reveal bg-warm-white p-9 transition-colors duration-500 hover:bg-warm-50">
          <p className="font-display text-xs font-semibold tracking-[0.24em] text-brass">
            {String(i + 1).padStart(2, '0')}
          </p>
          <h3 className="mt-5 text-base font-bold uppercase tracking-tight text-char-950">{c.title}</h3>
          <p className="mt-3 text-[0.92rem] leading-[1.75] text-stone-600">{c.text}</p>
        </li>
      ))}
    </ul>
  );
}
