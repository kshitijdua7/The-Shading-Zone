import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section } from '@/components/Section';
import FaqAccordion from '@/components/FaqAccordion';
import { faqs, imageUrl } from '@/lib/content';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers about free consultations, custom manufacturing, installation, motorized blinds, blackout options, large windows, patio doors, commercial work and quotes.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered."
        lead="Search or browse. Where a question has no honest general answer — timelines, warranty periods, service areas — we say so rather than inventing one."
        image={imageUrl('blindWhite', 2000)}
        alt="White window blinds filtering flat daylight"
      />

      <Section>
        <div className="shell max-w-4xl">
          <FaqAccordion items={faqs} />

          <div className="reveal mt-20 border-t border-char-950/10 pt-14">
            <h2 className="text-display-sm font-bold uppercase text-char-950">Still not answered?</h2>
            <p className="mt-5 max-w-prose text-base leading-relaxed text-stone-600">
              Ask us directly — we&rsquo;d rather answer a specific question about your window than have
              you guess from a general page.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-solid">Contact us</Link>
              <Link href="/consultation" className="btn-outline">Book a free consultation</Link>
            </div>
          </div>
        </div>
      </Section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
