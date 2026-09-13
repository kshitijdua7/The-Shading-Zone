import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import ProductCard from '@/components/ProductCard';
import { TickCards } from '@/components/Cards';
import { products, whyCards, imageUrl } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Blinds & Shades',
  description:
    'Roller, zebra, roman, cellular, venetian, vertical, wood and panel track blinds — custom manufactured and professionally installed by The Shading Zone.',
  alternates: { canonical: '/blinds' },
};

export default function BlindsPage() {
  return (
    <>
      <PageHero
        eyebrow="Blinds & shades"
        title="Ten ways to control your light."
        lead="Every product below is cut, assembled and finished to the measurements we take at your window. Choose by look, by light control, or let us narrow it down for you."
        image={imageUrl('blindsDaylight', 2000)}
        alt="A window dressed in white blinds diffusing daylight"
      />

      <Section>
        <div className="shell">
          <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} eager={i < 3} />
            ))}
          </div>
        </div>
      </Section>

      <Section tone="off">
        <div className="shell">
          <SectionHeading
            eyebrow="Choosing"
            title="Not sure which one?"
            lead="A rough guide. The real answer depends on the room, the orientation and how you use the space — which is exactly what a consultation is for."
          />

          <div className="mt-16 overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Which window covering suits which situation
              </caption>
              <thead>
                <tr className="border-b border-char-950/15">
                  <th scope="col" className="py-4 pr-6 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-stone-500">If you want…</th>
                  <th scope="col" className="py-4 pr-6 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-stone-500">Start with</th>
                  <th scope="col" className="py-4 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-stone-500">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-char-950/10">
                {[
                  ['A dark bedroom or nursery', 'Cellular or roller (blackout)', 'Blackout fabric in a tight reveal, with side channels for the edges.'],
                  ['View by day, privacy at night', 'Zebra shades, or layered roller + drapery', 'Two levels of light control in one treatment.'],
                  ['Glare off a screen', 'Solar screen roller', 'Cuts glare without darkening the desk.'],
                  ['A patio or sliding door', 'Panel track or vertical', 'Stacks clear of the doorway.'],
                  ['Warmth and texture', 'Roman shades or drapery', 'Real fabric weight softens hard architecture.'],
                  ['Precise directional light', 'Venetian or wood blinds', 'Tilt the slats, keep the room bright, block the sightline.'],
                  ['A cold or overheating window', 'Cellular shades', 'Trapped air slows heat transfer at the glass.'],
                  ['Hands-free, cord-free operation', 'Motorized (any product)', 'No accessible cords, and a whole room moves at once.'],
                ].map(([want, start, why]) => (
                  <tr key={want} className="reveal align-top">
                    <th scope="row" className="py-5 pr-6 font-semibold text-char-950">{want}</th>
                    <td className="py-5 pr-6 text-char-700">{start}</td>
                    <td className="py-5 text-stone-600">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="reveal mt-14 flex flex-wrap gap-4">
            <Link href="/consultation" className="btn-solid">Book a free consultation</Link>
            <Link href="/quote" className="btn-outline">Get a free quote</Link>
          </div>
        </div>
      </Section>

      <Section>
        <div className="shell">
          <SectionHeading eyebrow="Why The Shading Zone" title="What you get either way" />
          <div className="mt-20">
            <TickCards items={whyCards} />
          </div>
        </div>
      </Section>
    </>
  );
}
