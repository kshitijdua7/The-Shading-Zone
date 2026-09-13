import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import { NumberCards } from '@/components/Cards';
import { tradePartners, imageUrl } from '@/lib/content';

export const metadata: Metadata = {
  title: 'For Designers, Builders & Trade',
  description:
    'Trade partnerships for interior designers, contractors, builders, developers and property managers — specification support, samples and coordinated installation from The Shading Zone.',
  alternates: { canonical: '/trade' },
};

export default function TradePage() {
  return (
    <>
      <PageHero
        eyebrow="Trade partnerships"
        title="Built for designers. Built for projects."
        lead="If you specify window coverings for a living, you want a manufacturer who will make what you drew, tell you when it won't work, and show up when they said they would."
        image={imageUrl('entrance', 2000)}
        alt="A modern entrance framed by full-height drapery"
      />

      <Section>
        <div className="shell">
          <SectionHeading eyebrow="Who we partner with" title="Trade partners" />
          <div className="mt-16">
            <NumberCards items={tradePartners} />
          </div>
        </div>
      </Section>

      <Section tone="off">
        <div className="shell grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <h2 className="reveal text-display-sm font-bold uppercase text-char-950">What we bring</h2>
            <ul className="reveal mt-9 space-y-6 text-base leading-[1.8] text-stone-600" data-reveal-stagger>
              <li className="reveal"><strong className="font-semibold text-char-950">Specification support.</strong> Talk through what you&rsquo;re trying to achieve and we&rsquo;ll tell you which construction gets there — and which won&rsquo;t, before it&rsquo;s on a drawing.</li>
              <li className="reveal"><strong className="font-semibold text-char-950">Samples for client presentations.</strong> Physical samples you can put in front of a client, in the quantity a project needs.</li>
              <li className="reveal"><strong className="font-semibold text-char-950">Custom manufacturing.</strong> Non-standard sizes, unusual openings and bespoke constructions — the whole point of making our own product.</li>
              <li className="reveal"><strong className="font-semibold text-char-950">Coordinated scheduling.</strong> Measure and install slotted into your programme, with one contact throughout.</li>
              <li className="reveal"><strong className="font-semibold text-char-950">Consistency across units.</strong> Colour-matched finishes across different product families so a mixed spec still reads as one scheme.</li>
            </ul>
          </div>

          <figure className="reveal">
            <div className="aspect-[4/5] overflow-hidden bg-warm-100">
              <img
                src={imageUrl('colourCards', 1400)}
                alt="Colour cards fanned out for selection"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </figure>
        </div>
      </Section>

      <section className="bg-char-950 py-section text-warm-white">
        <div className="shell flex flex-col items-center text-center">
          <h2 className="reveal max-w-[18ch] text-display-md font-extrabold uppercase">
            Request trade information
          </h2>
          <p className="reveal mt-7 max-w-prose text-base leading-relaxed text-warm-white/70">
            Tell us about your practice and the projects you specify for, and we&rsquo;ll send the trade
            information relevant to the way you work.
          </p>
          <div className="reveal mt-11 flex flex-col gap-3 sm:flex-row">
            <Link href="/quote" className="btn bg-warm-white text-char-950 hover:bg-brass hover:text-white">
              Request trade information
            </Link>
            <Link href="/commercial" className="btn-light">Commercial projects</Link>
          </div>
        </div>
      </section>
    </>
  );
}
