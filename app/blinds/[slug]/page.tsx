import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';

import { Section, SectionHeading } from '@/components/Section';
import FaqAccordion from '@/components/FaqAccordion';
import SeeItInYourSpace from '@/components/SeeItInYourSpace';
import ProductCard from '@/components/ProductCard';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';
import { products, productBySlug, image, imageUrl } from '@/lib/content';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: 'Product not found' };

  return {
    title: `${product.name} — Custom Made`,
    description: `${product.tagline} ${product.intro.slice(0, 120)}…`.slice(0, 158),
    alternates: { canonical: `/blinds/${product.slug}` },
    openGraph: {
      title: `${product.name} | The Shading Zone`,
      description: product.tagline,
      images: [imageUrl(product.hero, 1200)],
    },
  };
}

const SPEC_LABELS: Record<string, string> = {
  materials: 'Fabrics & materials',
  colours: 'Colours',
  opacity: 'Opacity & light filtering',
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const hero = image(product.hero, 2000);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.intro,
    brand: { '@type': 'Brand', name: site.name },
    image: imageUrl(product.hero, 1200),
    // No price, rating or review is asserted — none were supplied.
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: product.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <header className="relative isolate overflow-hidden bg-char-950 text-warm-white">
        <img
          src={hero.src}
          alt={hero.alt}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          loading="eager"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-char-950/80 via-char-950/50 to-char-950" />
        <div className="shell relative pb-section-sm pt-[calc(var(--nav-h)+clamp(4rem,9vw,8rem))]">
          <nav aria-label="Breadcrumb" className="text-[0.62rem] uppercase tracking-[0.2em] text-warm-white/50">
            <Link href="/blinds" className="link-draw hover:text-warm-white">Blinds &amp; shades</Link>
            <span className="mx-3" aria-hidden="true">/</span>
            <span className="text-warm-white/80">{product.name}</span>
          </nav>
          <h1 className="mt-8 max-w-[15ch] text-display-lg font-extrabold uppercase">{product.name}</h1>
          <p className="mt-6 font-editorial text-2xl italic text-brass-light sm:text-3xl">{product.tagline}</p>
          <p className="mt-8 max-w-prose text-base leading-[1.8] text-warm-white/75 sm:text-lg">{product.intro}</p>
          <div className="mt-11 flex flex-wrap items-center gap-4">
            <LiquidMetalButton href="/consultation" label="Book free consultation" />
            <Link href="/quote" className="btn-light">Get a free quote</Link>
          </div>
        </div>
      </header>

      {/* ── Description + features ────────────────────────────────────────── */}
      <Section>
        <div className="shell grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <h2 className="reveal text-display-sm font-bold uppercase text-char-950">The detail</h2>
            <p className="reveal mt-7 max-w-prose text-base leading-[1.85] text-stone-600">{product.body}</p>
          </div>
          <div>
            <h2 className="reveal text-display-sm font-bold uppercase text-char-950">Features</h2>
            <ul className="reveal mt-7 space-y-4" data-reveal-stagger>
              {product.features.map((f) => (
                <li key={f} className="flex gap-4 text-[0.95rem] leading-relaxed text-stone-600">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-brass" aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── Specification ─────────────────────────────────────────────────── */}
      <Section tone="off">
        <div className="shell">
          <SectionHeading eyebrow="Specification" title="Everything you choose" />

          <div className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-3" data-reveal-stagger>
            {(['materials', 'colours', 'opacity'] as const).map((key) => (
              <div key={key} className="reveal">
                <h3 className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-brass">
                  {SPEC_LABELS[key]}
                </h3>
                <ul className="mt-5 space-y-2.5 border-t border-char-950/10 pt-5 text-[0.92rem] text-stone-600">
                  {product[key].map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <dl className="mt-16 grid gap-x-12 gap-y-10 border-t border-char-950/10 pt-14 md:grid-cols-2" data-reveal-stagger>
            {[
              ['Privacy', product.privacy],
              ['Motorization', product.motorisation],
              ['Custom sizing', product.sizing],
              ['Installation', product.installation],
            ].map(([term, def]) => (
              <div key={term} className="reveal">
                <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-brass">{term}</dt>
                <dd className="mt-4 max-w-prose text-[0.92rem] leading-[1.8] text-stone-600">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* ── See it in your space ──────────────────────────────────────────── */}
      <Section>
        <div className="shell">
          <SectionHeading
            eyebrow="See it in your space"
            title="Light, colour, privacy"
            lead="Move between opacities and colours to get a feel for how the same window changes."
          />
          <div className="mt-16">
            <SeeItInYourSpace imageKey={product.hero} productName={product.name} />
          </div>
        </div>
      </Section>

      {/* ── Gallery ───────────────────────────────────────────────────────── */}
      <Section tone="off">
        <div className="shell">
          <SectionHeading eyebrow="Gallery" title={`${product.name} in rooms`} />
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
            {product.gallery.map((key, i) => {
              const img = image(key, 900);
              return (
                <div
                  key={`${key}-${i}`}
                  className={`reveal overflow-hidden bg-warm-100 ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1.1s] ease-luxe hover:scale-105"
                  />
                </div>
              );
            })}
          </div>
          <div className="reveal mt-12">
            <Link href="/gallery" className="btn-outline">See the full gallery</Link>
          </div>
        </div>
      </Section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <Section>
        <div className="shell max-w-4xl">
          <SectionHeading eyebrow="Questions" title={`${product.name} — asked and answered`} />
          <div className="mt-14">
            <FaqAccordion items={product.faqs} searchable={false} />
          </div>
          <p className="reveal mt-10 text-sm text-stone-600">
            More questions on our{' '}
            <Link href="/faq" className="link-draw text-char-950">FAQ page</Link>, or just{' '}
            <Link href="/contact" className="link-draw text-char-950">ask us directly</Link>.
          </p>
        </div>
      </Section>

      {/* ── Related ───────────────────────────────────────────────────────── */}
      <Section tone="off">
        <div className="shell">
          <SectionHeading eyebrow="Also consider" title="Related products" />
          <div className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-char-950 py-section text-warm-white">
        <div className="shell flex flex-col items-center text-center">
          <h2 className="reveal max-w-[18ch] text-display-md font-extrabold uppercase">
            Let&rsquo;s get {product.name.toLowerCase()} on your windows.
          </h2>
          <p className="reveal mt-7 max-w-prose text-base leading-relaxed text-warm-white/70">
            Free consultation, in your home or on a video call. Samples, measurements and straight
            advice — including when something else would suit you better.
          </p>
          <div className="reveal mt-11 flex flex-col gap-3 sm:flex-row">
            <Link href="/consultation" className="btn bg-warm-white text-char-950 hover:bg-brass hover:text-white">
              Book a free consultation
            </Link>
            <Link href="/quote" className="btn-light">Get a free quote</Link>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </>
  );
}
