import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import { manufacturingSteps, image, imageUrl } from '@/lib/content';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

export const metadata: Metadata = {
  title: 'Manufacturing',
  description:
    'The Shading Zone manufactures its own window coverings — fabric selection, cutting, assembly, custom sizing, motorization, finishing, quality control and packaging.',
  alternates: { canonical: '/manufacturing' },
};

export default function ManufacturingPage() {
  return (
    <>
      <PageHero
        eyebrow="Manufacturing"
        title="Made for your windows. Not off the shelf."
        lead="A stock blind is made to a size somebody guessed at, then trimmed to fit yours. Ours starts as a roll of fabric and a set of measurements taken at your window."
        image={imageUrl('fabricBench', 2000)}
        alt="Fabric samples laid out across a workbench"
      />

      <Section>
        <div className="shell">
          <SectionHeading
            eyebrow="Bench to window"
            title="Eight stages"
            lead="Nothing here is glamorous. It is simply what has to happen for a covering to fit an opening properly and keep working."
          />

          <div className="mt-24 space-y-24" data-reveal-stagger>
            {manufacturingSteps.map((s, i) => {
              const img = s.image ? image(s.image, 1200) : null;
              return (
                <article
                  key={s.n}
                  className={`reveal grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-20 ${
                    i % 2 === 1 ? 'lg:[&>figure]:order-2' : ''
                  }`}
                >
                  <figure className="aspect-[5/4] overflow-hidden bg-warm-100">
                    {img && (
                      <img
                        src={img.src}
                        alt={img.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-[1.4s] ease-luxe hover:scale-105"
                      />
                    )}
                  </figure>
                  <div>
                    <p className="font-display text-6xl font-extrabold leading-none text-char-950/10 sm:text-7xl">
                      {s.n}
                    </p>
                    <h3 className="mt-4 text-display-sm font-bold uppercase text-char-950">{s.title}</h3>
                    <p className="mt-5 max-w-prose text-base leading-[1.85] text-stone-600">{s.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Section>

      <section className="bg-char-950 py-section text-warm-white">
        <div className="shell flex flex-col items-center text-center">
          <p className="eyebrow reveal text-warm-white/45">Our standard</p>
          <h2 className="reveal mt-7 text-display-md font-extrabold uppercase">
            Custom made. Carefully finished.
          </h2>
          <p className="reveal mt-8 max-w-prose text-base leading-[1.8] text-warm-white/70">
            We describe what we do and nothing more. There are no origin claims, certifications or
            accreditations on this page, because none were provided to us — and a manufacturing claim
            you can&rsquo;t evidence is worse than no claim at all. When The Shading Zone has those
            credentials in writing, this is where they belong.
          </p>
          <div className="reveal mt-12 flex flex-col items-center gap-4 sm:flex-row">
            <LiquidMetalButton href="/consultation" label="Book a free consultation" />
            <Link href="/process" className="btn-light">See the full process</Link>
          </div>
        </div>
      </section>
    </>
  );
}
