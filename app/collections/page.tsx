import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import HorizontalScroller from '@/components/HorizontalScroller';
import { collections, imageUrl } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Our Collections',
  description:
    'Modern, Luxury, Minimal, Classic, Smart and Custom — The Shading Zone window coverings organised by interior style.',
  alternates: { canonical: '/collections' },
};

export default function CollectionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our collections"
        title="Organised by the way you live."
        lead="The same catalogue, cut six ways. Start from the look you're after rather than the mechanism, and let us work backwards to the product."
        image={imageUrl('roomFireplace', 2000)}
        alt="A modern living room with tan leather chairs and large windows"
      />

      <section className="bg-char-950 py-section text-warm-white">
        <div className="shell">
          <SectionHeading
            tone="dark"
            eyebrow="Scroll sideways"
            title="Six directions"
            lead="On a wide screen the collections travel horizontally as you scroll. On a phone, just swipe."
          />
        </div>
        <div className="mt-20">
          <HorizontalScroller items={collections} />
        </div>
      </section>

      {/* Editorial grid — the accessible, always-available view of the same set */}
      <Section>
        <div className="shell">
          <SectionHeading eyebrow="All collections" title="In full" />
          <div className="mt-20 space-y-24" data-reveal-stagger>
            {collections.map((c, i) => (
              <article
                key={c.slug}
                className={`reveal grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-20 ${
                  i % 2 === 1 ? 'lg:[&>figure]:order-2' : ''
                }`}
              >
                <figure className="aspect-[4/3] overflow-hidden bg-warm-100">
                  <img
                    src={imageUrl(c.image, 1400)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </figure>
                <div>
                  <p className="font-display text-xs font-semibold tracking-[0.24em] text-brass">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-5 text-display-sm font-extrabold uppercase text-char-950">{c.name}</h3>
                  <p className="mt-4 font-editorial text-xl italic text-stone-500">{c.blurb}</p>
                  <p className="mt-6 max-w-prose text-base leading-[1.8] text-stone-600">{c.long}</p>
                  <Link href={`/collections/${c.slug}`} className="btn-outline mt-9 inline-flex">
                    View the {c.name.toLowerCase()} collection
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
