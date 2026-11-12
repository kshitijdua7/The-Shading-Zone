import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { curtainStyles, image } from '@/lib/live';

/**
 * The curtain range as image cards.
 *
 *   variant="cards"   home page: each card links through to /curtains
 *   variant="detail"  curtains page: same photography with the longer description
 */
export default function CurtainStyles({
  variant = 'cards',
  limit,
}: {
  variant?: 'cards' | 'detail';
  limit?: number;
}) {
  const styles = limit ? curtainStyles.slice(0, limit) : curtainStyles.slice();

  return (
    <div
      className={
        variant === 'cards'
          ? 'grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4'
      }
      data-reveal-stagger
    >
      {styles.map((s, i) => {
        const img = image(s.image, 900);
        const picture = (
          <div className="relative aspect-[4/5] overflow-hidden bg-warm-100">
            <img
              src={img.src}
              alt={img.alt}
              loading={i < 4 ? 'eager' : 'lazy'}
              decoding="async"
              width={900}
              height={1125}
              className="h-full w-full object-cover transition-transform duration-[1.1s] ease-luxe group-hover:scale-[1.05]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-char-950/75 via-char-950/5 to-transparent"
            />
            {variant === 'cards' && (
              <span className="pointer-events-none absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-warm-white/30 text-warm-white opacity-0 transition-all duration-500 ease-luxe group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 md:translate-y-2">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-warm-white/55">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-2 text-xl font-bold uppercase leading-tight tracking-tight text-warm-white sm:text-2xl">
                {s.name}
              </h3>
            </div>
          </div>
        );

        return variant === 'cards' ? (
          <Link key={s.name} href="/curtains#styles" className="reveal group block">
            {picture}
            <p className="pt-5 text-sm leading-relaxed text-stone-600">{s.tagline}</p>
          </Link>
        ) : (
          <article key={s.name} className="reveal group">
            {picture}
            <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brass">{s.tagline}</p>
            <p className="mt-3 text-[0.92rem] leading-[1.75] text-stone-600">{s.text}</p>
          </article>
        );
      })}
    </div>
  );
}
