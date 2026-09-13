import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import { NumberCards } from '@/components/Cards';
import { commercialSectors, imageUrl } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Commercial & Contract Projects',
  description:
    'Window coverings for offices, condos, restaurants, retail, property managers, builders and contractors — custom manufactured and installed by The Shading Zone.',
  alternates: { canonical: '/commercial' },
};

export default function CommercialPage() {
  return (
    <>
      <PageHero
        eyebrow="Commercial & contract"
        title="Window solutions for business."
        lead="Glare at desks, heat load on a west elevation, a storefront that needs to stay open and inviting, forty units that all have to match. Commercial work is a different problem, and we scope it as one."
        image={imageUrl('boardroom', 2000)}
        alt="A meeting room with a long table and wide glazing"
      />

      <Section>
        <div className="shell">
          <SectionHeading eyebrow="Who we work with" title="Sectors" />
          <div className="mt-16">
            <NumberCards items={commercialSectors} />
          </div>
        </div>
      </Section>

      <Section tone="off">
        <div className="shell grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <h2 className="reveal text-display-sm font-bold uppercase text-char-950">
              How commercial work differs
            </h2>
            <ul className="reveal mt-9 space-y-6 text-base leading-[1.8] text-stone-600" data-reveal-stagger>
              <li className="reveal"><strong className="font-semibold text-char-950">Specification comes first.</strong> We start from performance — glare, heat, privacy, code — then choose the product, rather than the other way round.</li>
              <li className="reveal"><strong className="font-semibold text-char-950">Repeatability matters.</strong> Forty windows that all need the same fabric, the same finish and the same operation, ordered once and installed on schedule.</li>
              <li className="reveal"><strong className="font-semibold text-char-950">Scheduling around trades.</strong> Measure after glazing, install after paint. We work to your sequence, not ours.</li>
              <li className="reveal"><strong className="font-semibold text-char-950">One point of contact.</strong> Manufacturing and installation are the same company, so there is nobody to chase between them.</li>
            </ul>
          </div>

          <figure className="reveal">
            <div className="aspect-[4/5] overflow-hidden bg-warm-100">
              <img
                src={imageUrl('officeBlinds', 1400)}
                alt="An office window dressed in horizontal blinds"
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
          <h2 className="reveal max-w-[16ch] text-display-md font-extrabold uppercase">
            Discuss your project
          </h2>
          <p className="reveal mt-7 max-w-prose text-base leading-relaxed text-warm-white/70">
            Send us the drawings, the unit count, or just a photo of the elevation that&rsquo;s causing
            the problem. We&rsquo;ll come back with a specification and a quote.
          </p>
          <div className="reveal mt-11 flex flex-col gap-3 sm:flex-row">
            <Link href="/quote" className="btn bg-warm-white text-char-950 hover:bg-brass hover:text-white">
              Discuss your project
            </Link>
            <Link href="/trade" className="btn-light">Trade &amp; designer partnerships</Link>
          </div>
        </div>
      </section>
    </>
  );
}
