import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import ProductCard from '@/components/ProductCard';
import { collections, productsInCollection, imageUrl } from '@/lib/content';

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = collections.find((x) => x.slug === slug);
  if (!c) return { title: 'Collection not found' };
  return {
    title: `${c.name.charAt(0)}${c.name.slice(1).toLowerCase()} Collection`,
    description: `${c.blurb} ${c.long}`.slice(0, 158),
    alternates: { canonical: `/collections/${c.slug}` },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  const items = productsInCollection(collection.slug);

  return (
    <>
      <PageHero
        eyebrow="Collection"
        title={collection.name}
        lead={collection.long}
        image={imageUrl(collection.image, 2000)}
        alt=""
      />

      <Section>
        <div className="shell">
          <SectionHeading
            eyebrow={`${items.length} product${items.length === 1 ? '' : 's'}`}
            title={`In the ${collection.name.toLowerCase()} collection`}
            lead={collection.blurb}
          />
          <div className="mt-20 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {items.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} eager={i < 3} />
            ))}
          </div>
        </div>
      </Section>

      <Section tone="off">
        <div className="shell">
          <SectionHeading eyebrow="Keep looking" title="Other collections" />
          <ul className="mt-14 flex flex-wrap gap-3" data-reveal-stagger>
            {collections
              .filter((c) => c.slug !== collection.slug)
              .map((c) => (
                <li key={c.slug} className="reveal">
                  <Link
                    href={`/collections/${c.slug}`}
                    className="btn-outline"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
          </ul>
          <div className="reveal mt-16 flex flex-wrap gap-4 border-t border-char-950/10 pt-14">
            <Link href="/consultation" className="btn-solid">Book a free consultation</Link>
            <Link href="/quote" className="btn-outline">Get a free quote</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
