import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import CinematicHero from '@/components/hero/CinematicHero';
import { Section, SectionHeading } from '@/components/Section';
import WindowGraphic from '@/components/WindowGraphic';
import ProductCard from '@/components/ProductCard';
import HorizontalScroller from '@/components/HorizontalScroller';
import { TickCards } from '@/components/Cards';
import CTASection from '@/components/CTASection';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

import { products, collections, trustCards, processSteps, imageUrl, image } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Custom Blinds, Shades & Curtains | The Shading Zone',
  description:
    'The Shading Zone designs, manufactures and installs custom blinds, shades and curtains. Roller, zebra, roman, cellular, wood and motorized window coverings — with a free consultation.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const galleryPreview = ['roomDrapery', 'woodShadow', 'curtainSheer', 'dining'] as const;

  return (
    <>
      <CinematicHero />

      {/* ── Introduction ──────────────────────────────────────────────────── */}
      <Section id="intro">
        <div className="shell grid gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-24">
          <div>
            <p className="eyebrow reveal">Introduction</p>
            <h2 className="reveal mt-6 text-display-md font-extrabold uppercase text-char-950">
              Window coverings, made your way.
            </h2>
            <div className="reveal mt-9 space-y-6 text-base leading-[1.8] text-stone-600 sm:text-[1.0625rem]">
              <p>
                At The Shading Zone, we believe window coverings should do more than control light. They
                should transform the way a space looks, feels and functions.
              </p>
              <p>
                From modern blinds to elegant curtains, we design and manufacture custom solutions
                tailored to your windows, your style and your lifestyle.
              </p>
            </div>
            <div className="reveal mt-11 flex flex-wrap items-center gap-5">
              <Link href="/about" className="btn-solid">
                Discover The Shading Zone
              </Link>
              <Link
                href="/blinds"
                className="link-draw text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-char-950"
              >
                See all products
              </Link>
            </div>
          </div>

          <div className="reveal">
            <WindowGraphic />
          </div>
        </div>
      </Section>

      {/* ── Product categories ────────────────────────────────────────────── */}
      <Section tone="off" id="products">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading
              eyebrow="The range"
              title="Find your perfect shade"
              lead="Ten product families, every one made to the measurements we take at your window. Hover any card to see it move."
            />
            <Link
              href="/blinds"
              className="reveal link-draw shrink-0 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-char-950"
            >
              All products
            </Link>
          </div>

          <div
            className="mt-20 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            data-reveal-stagger
          >
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} eager={i < 4} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── Collections ───────────────────────────────────────────────────── */}
      <section className="bg-char-950 py-section text-warm-white">
        <div className="shell">
          <SectionHeading
            tone="dark"
            eyebrow="Our collections"
            title="Organised by the way you live"
            lead="Six directions, from stripped-back minimal to fully automated. Every one drawn from the same catalogue and made to your window."
          />
        </div>
        <div className="mt-20">
          <HorizontalScroller items={collections} />
        </div>
        <div className="shell mt-16">
          <Link href="/collections" className="btn-light reveal">
            Explore all collections
          </Link>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────────────── */}
      <Section>
        <div className="shell">
          <SectionHeading
            eyebrow="How it works"
            title="From first visit to finished window"
            lead="Seven steps, all of them ours. We consult, measure, design, manufacture, inspect, install — and stay reachable afterwards."
          />

          <ol className="mt-20 grid gap-px overflow-hidden border border-char-950/10 bg-char-950/10 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
            {processSteps.slice(0, 4).map((s) => (
              <li key={s.n} className="reveal group bg-warm-white p-9 transition-colors duration-500 hover:bg-warm-50">
                <p className="font-display text-4xl font-extrabold leading-none text-char-950/12 transition-colors duration-500 group-hover:text-brass/45">
                  {s.n}
                </p>
                <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.06em] text-char-950">{s.title}</h3>
                <p className="mt-3 text-[0.9rem] leading-[1.7] text-stone-600">{s.text}</p>
              </li>
            ))}
          </ol>

          <div className="reveal mt-12">
            <Link href="/process" className="btn-outline">
              See the full process
            </Link>
          </div>
        </div>
      </Section>

      {/* ── Manufacturing ─────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-char-900 py-section text-warm-white">
        <img
          src={imageUrl('fabricBench', 2000)}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-char-950 via-char-950/85 to-char-950/40" />
        <div className="shell relative">
          <div className="max-w-2xl">
            <p className="eyebrow reveal text-warm-white/45">We make what we sell</p>
            <h2 className="reveal mt-6 text-display-md font-extrabold uppercase">
              Made for your windows. Not off the shelf.
            </h2>
            <p className="reveal mt-8 max-w-prose text-base leading-[1.8] text-warm-white/70">
              Your fabric is inspected before it&rsquo;s cut. Slat counts, fold spacing and panel widths
              come from your measurements. Everything is cycled and checked before it leaves the bench,
              and packed by room so installation day is quick.
            </p>
            <p className="reveal mt-6 font-editorial text-2xl italic text-brass-light">
              Custom made. Carefully finished.
            </p>
            <div className="reveal mt-11">
              <Link href="/manufacturing" className="btn-light">
                Inside our manufacturing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ─────────────────────────────────────────────────────────── */}
      <Section tone="off">
        <div className="shell">
          <SectionHeading
            eyebrow="Why us"
            title="Why homeowners choose The Shading Zone"
            lead="Everything below is something we actually do. You won't find invented statistics, borrowed awards or made-up reviews anywhere on this site."
          />
          <div className="mt-20">
            <TickCards items={trustCards} />
          </div>
        </div>
      </Section>

      {/* ── Gallery teaser ────────────────────────────────────────────────── */}
      <Section>
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading eyebrow="Gallery" title="Rooms, transformed" />
            <Link
              href="/gallery"
              className="reveal group inline-flex shrink-0 items-center gap-2 pb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-char-950"
            >
              View the gallery
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
            {galleryPreview.map((key, i) => {
              const img = image(key, 800);
              return (
                <Link
                  key={key}
                  href="/gallery"
                  className={`reveal group relative block overflow-hidden bg-warm-100 ${
                    i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/5]'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1.1s] ease-luxe group-hover:scale-[1.06]"
                  />
                </Link>
              );
            })}
          </div>

          <div className="reveal mt-20 flex flex-col items-center gap-6 border-t border-char-950/10 pt-16 text-center">
            <p className="max-w-prose text-base leading-relaxed text-stone-600">
              Not sure where to start? A free consultation is the fastest way to narrow a very large
              catalogue down to the two or three options that actually suit your rooms.
            </p>
            <LiquidMetalButton href="/consultation" label="Book a free consultation" />
          </div>
        </div>
      </Section>

      <CTASection />
    </>
  );
}
