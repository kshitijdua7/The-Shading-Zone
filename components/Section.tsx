import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function Section({
  children,
  className,
  id,
  tone = 'light',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'light' | 'off' | 'dark';
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-section',
        tone === 'light' && 'bg-warm-white text-char-900',
        tone === 'off' && 'bg-warm-50 text-char-900',
        tone === 'dark' && 'bg-char-950 text-warm-white',
        className
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'light',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-4xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow && (
        <p className={cn('eyebrow reveal', tone === 'dark' && 'text-warm-white/45')}>{eyebrow}</p>
      )}
      <h2
        className={cn(
          'reveal mt-5 text-display-md font-extrabold uppercase',
          tone === 'dark' ? 'text-warm-white' : 'text-char-950'
        )}
      >
        {title}
      </h2>
      {lead && (
        <div
          className={cn(
            'reveal mt-6 max-w-prose text-base leading-[1.75] sm:text-[1.0625rem]',
            align === 'center' && 'mx-auto',
            tone === 'dark' ? 'text-warm-white/65' : 'text-stone-600'
          )}
        >
          {lead}
        </div>
      )}
    </div>
  );
}

/** Big numbered/lettered page header used at the top of every inner page. */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  alt,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  image?: string;
  alt?: string;
}) {
  return (
    <header className="relative isolate overflow-hidden bg-char-950 text-warm-white">
      {image && (
        <>
          <img
            src={image}
            alt={alt ?? ''}
            className="absolute inset-0 h-full w-full object-cover opacity-45"
            loading="eager"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-char-950/85 via-char-950/55 to-char-950"
          />
        </>
      )}
      <div className="shell relative pb-section-sm pt-[calc(var(--nav-h)+clamp(4.5rem,10vw,9rem))]">
        <p className="eyebrow text-warm-white/50">{eyebrow}</p>
        <h1 className="mt-6 max-w-[16ch] text-display-lg font-extrabold uppercase">{title}</h1>
        {lead && (
          <p className="mt-8 max-w-prose text-base leading-[1.75] text-warm-white/70 sm:text-lg">{lead}</p>
        )}
      </div>
    </header>
  );
}
