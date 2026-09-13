import Link from 'next/link';
import { Section } from '@/components/Section';
import { primaryNav } from '@/lib/site';

export default function NotFound() {
  return (
    <Section className="pt-[calc(var(--nav-h)+6rem)]">
      <div className="shell max-w-3xl">
        <p className="eyebrow">404</p>
        <h1 className="mt-6 text-display-lg font-extrabold uppercase text-char-950">
          This one&rsquo;s drawn shut.
        </h1>
        <p className="mt-8 max-w-prose text-base leading-relaxed text-stone-600">
          The page you were after isn&rsquo;t here. Try one of these instead, or tell us what you were
          looking for and we&rsquo;ll point you at it.
        </p>

        <ul className="mt-12 flex flex-wrap gap-3">
          {primaryNav.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="btn-outline">{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
