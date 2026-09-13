import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import { TickCards } from '@/components/Cards';
import { whyCards, imageUrl, image } from '@/lib/content';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'The Shading Zone combines custom manufacturing, design, quality materials, professional installation and personalised service for window coverings.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const workshop = image('fabricStack', 1400);
  const room = image('roomWarm', 1400);

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="We believe every window deserves a better view."
        lead="The Shading Zone designs, manufactures, supplies and installs custom window coverings. Five things that are usually five different companies — which is exactly why they so often go wrong."
        image={imageUrl('roomChairs', 2000)}
        alt="Leather chairs beside a tall shaded window"
      />

      <Section>
        <div className="shell grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <h2 className="reveal text-display-sm font-bold uppercase text-char-950">Our story</h2>
            <div className="reveal mt-8 space-y-6 text-base leading-[1.85] text-stone-600">
              <p>
                Most window covering problems are not really about the blind. They are about a
                measurement somebody took in a hurry, a stock size trimmed to nearly fit, or a fabric
                chosen from a photograph on a screen instead of held against the wall it has to live
                beside.
              </p>
              <p>
                The Shading Zone exists to remove those handoffs. We measure your windows ourselves. We
                manufacture to those measurements. We install what we made, and if something needs
                adjusting a month later, you call the people who made it rather than a call centre with
                no record of your order.
              </p>
              <p>
                The catalogue is deliberately wide — ten product families, fabrics from near-transparent
                solar screen through to interlined blackout — because rooms are not the same as each
                other and a company that only sells one thing will always recommend that one thing.
              </p>
            </div>
          </div>

          <figure className="reveal">
            <div className="aspect-[4/5] overflow-hidden bg-warm-100">
              <img src={workshop.src} alt={workshop.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <figcaption className="mt-4 text-xs leading-relaxed text-stone-500">
              Placeholder imagery. Team and workshop photography drops into these slots as soon as it
              exists — the layout is already sized for it.
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section tone="off">
        <div className="shell">
          <SectionHeading
            eyebrow="What we combine"
            title="Five things, one company"
            lead="Custom manufacturing. Design. Quality materials. Professional installation. Personalised service."
          />
          <div className="mt-20 grid gap-px overflow-hidden border border-char-950/10 bg-char-950/10 sm:grid-cols-2 lg:grid-cols-5" data-reveal-stagger>
            {[
              ['Custom manufacturing', 'We build what we sell, to your measurements.'],
              ['Design', 'Product, fabric, colour and operation chosen for your rooms.'],
              ['Quality materials', 'Fabrics, slats and hardware inspected before assembly.'],
              ['Professional installation', 'Fitted and levelled by our own team.'],
              ['Personalised service', 'The same people, from first visit to last adjustment.'],
            ].map(([title, text], i) => (
              <div key={title} className="reveal bg-warm-white p-8">
                <p className="font-display text-xs font-semibold tracking-[0.24em] text-brass">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-5 text-sm font-bold uppercase tracking-tight text-char-950">{title}</h3>
                <p className="mt-3 text-[0.9rem] leading-[1.7] text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="shell">
          <SectionHeading eyebrow="Why The Shading Zone" title="Why The Shading Zone?" />
          <div className="mt-20">
            <TickCards items={whyCards} />
          </div>
        </div>
      </Section>

      <Section tone="off">
        <div className="shell grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-24">
          <figure className="reveal aspect-[4/3] overflow-hidden bg-warm-100">
            <img src={room.src} alt={room.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </figure>
          <div>
            <h2 className="reveal text-display-sm font-bold uppercase text-char-950">
              What you won&rsquo;t find here
            </h2>
            <p className="reveal mt-7 max-w-prose text-base leading-[1.85] text-stone-600">
              No invented five-star reviews. No made-up statistics about how many windows we&rsquo;ve
              covered. No award badges we didn&rsquo;t win, and no certifications we don&rsquo;t hold.
              Everything stated on this website is something The Shading Zone can actually stand behind —
              and where a real number, warranty period or service area belongs, we&rsquo;ve left space
              for it rather than filling it in.
            </p>
            <div className="reveal mt-11 flex flex-wrap items-center gap-4">
              <LiquidMetalButton href="/consultation" label="Book a free consultation" />
              <Link href="/contact" className="btn-outline">Contact us</Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
