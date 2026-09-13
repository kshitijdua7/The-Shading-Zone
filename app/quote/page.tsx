import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section } from '@/components/Section';
import QuoteForm from '@/components/forms/QuoteForm';
import { imageUrl } from '@/lib/content';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Get a Free Quote',
  description:
    'Request a free, no-obligation quote for custom blinds, shades or curtains from The Shading Zone. Three quick steps — tell us about your project, choose your coverings, and we come back with options.',
  alternates: { canonical: '/quote' },
};

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Free quote"
        title="Get a free quote."
        lead="Three steps, a couple of minutes. Tell us about the project, pick what you're considering, and we'll come back to you with options — including what we'd recommend instead, if we think something suits your windows better."
        image={imageUrl('dining', 2000)}
        alt="A bright modern dining room with a run of large windows"
      />

      <Section>
        <div className="shell grid gap-16 lg:grid-cols-[1fr_0.6fr] lg:gap-24">
          <div>
            <QuoteForm />
          </div>

          <aside className="reveal lg:sticky lg:top-28 lg:self-start">
            <div className="border border-char-950/12 bg-warm-50 p-9">
              <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brass">
                Good to know
              </h2>
              <ul className="mt-8 space-y-6 text-[0.9rem] leading-[1.75] text-stone-600">
                <li>
                  <strong className="font-semibold text-char-950">Rough numbers are fine.</strong>{' '}
                  We measure properly before anything is manufactured — your estimates are only there to
                  scope the quote.
                </li>
                <li>
                  <strong className="font-semibold text-char-950">Photos help a lot.</strong>{' '}
                  A wide shot of each room tells us more about light and proportion than a close-up of
                  the frame.
                </li>
                <li>
                  <strong className="font-semibold text-char-950">Not sure what you want?</strong>{' '}
                  Tick &ldquo;not sure yet&rdquo; and we&rsquo;ll narrow it down with you. That&rsquo;s
                  the job.
                </li>
              </ul>

              <div className="mt-10 border-t border-char-950/10 pt-8">
                <a href={site.contact.phoneHref} className="block text-lg font-semibold text-char-950 link-draw">
                  {site.contact.phone}
                </a>
                <a href={site.contact.emailHref} className="mt-2 block text-sm text-stone-600 link-draw">
                  {site.contact.email}
                </a>
              </div>
            </div>

            <div className="mt-8 border-l-2 border-brass/50 pl-5">
              <p className="text-sm leading-relaxed text-stone-600">
                Would you rather see samples first?
              </p>
              <Link href="/consultation" className="mt-3 inline-block link-draw text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-char-950">
                Book a free consultation
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
