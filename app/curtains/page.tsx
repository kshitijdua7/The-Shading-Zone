import type { Metadata } from 'next';
import { productBySlug, imageUrl } from '@/lib/live';
import Link from 'next/link';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import CurtainReveal from '@/components/CurtainReveal';
import CurtainStyles from '@/components/CurtainStyles';
import FaqAccordion from '@/components/FaqAccordion';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

export const metadata: Metadata = {
  title: 'Custom Curtains & Drapery',
  description:
    'Sheer, blackout, lined and layered custom curtains. Pinch pleat, ripple fold, grommet and rod pocket headers, custom fabrics and motorized tracks from All Time Solutions.',
  alternates: { canonical: '/curtains' },
};

const HEADERS = [
  { name: 'Pinch pleat', note: 'Tailored, structured, traditional-leaning. Deep even folds.' },
  { name: 'Ripple fold', note: 'A continuous modern wave on a track. Very clean.' },
  { name: 'Grommet', note: 'Metal rings on a pole. Casual, with a wide relaxed fold.' },
  { name: 'Tab top', note: 'Fabric loops over a pole. Informal and light.' },
  { name: 'Rod pocket', note: 'The pole passes through a sewn channel. Softest and simplest.' },
];

export default function CurtainsPage() {
  const product = productBySlug('custom-curtains-drapery')!;

  return (
    <>
      <PageHero
        eyebrow="Curtains & drapery"
        title="Soften the light. Elevate the room."
        lead="Fabric, header, fullness, lining, length, hardware — every one of them is a decision, and every one changes how the room feels. This is the most customisable thing we make."
        image={imageUrl('curtainFull', 2000)}
        alt="Sunlight pushing through floor-length curtains"
      />

      {/* Scroll-driven curtain reveal */}
      <Section>
        <div className="shell">
          <SectionHeading
            eyebrow="The moment"
            title="Watch them open"
            lead="Keep scrolling — the panels draw apart and the fabric stacks toward the edges, the way real drapery does."
          />
          <div className="mt-16">
            <CurtainReveal
              imageKey="roomFireplace"
              caption="Full-length drapery hung close to the ceiling, drawn back to the frame so the whole window is glass."
            />
          </div>
        </div>
      </Section>

      {/* Styles */}
      <Section tone="off" id="styles" className="scroll-mt-[var(--nav-h)]">
        <div className="shell">
          <SectionHeading
            eyebrow="What we make"
            title="Eight directions"
            lead="Every one is made to your measurements, in the fabric, lining and length you choose."
          />
          <div className="mt-20">
            <CurtainStyles variant="detail" />
          </div>
        </div>
      </Section>

      {/* Headers */}
      <Section>
        <div className="shell">
          <SectionHeading
            eyebrow="Header styles"
            title="How the fabric meets the track"
            lead="The header decides the fold — and the fold is most of what you actually see."
          />
          <ul className="mt-16 divide-y divide-char-950/10 border-y border-char-950/10" data-reveal-stagger>
            {HEADERS.map((h, i) => (
              <li key={h.name} className="reveal grid gap-2 py-7 sm:grid-cols-[3rem_14rem_1fr] sm:items-baseline sm:gap-8">
                <span className="font-display text-xs font-semibold tracking-[0.22em] text-brass">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base font-bold uppercase tracking-tight text-char-950">{h.name}</h3>
                <p className="text-[0.92rem] leading-relaxed text-stone-600">{h.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* FAQ + CTA */}
      <Section tone="off">
        <div className="shell max-w-4xl">
          <SectionHeading eyebrow="Questions" title="Curtains, answered" />
          <div className="mt-14">
            <FaqAccordion items={product.faqs} searchable={false} />
          </div>
        </div>
      </Section>

      <section className="bg-char-950 py-section text-warm-white">
        <div className="shell flex flex-col items-center text-center">
          <h2 className="reveal max-w-[16ch] text-display-md font-extrabold uppercase">
            Bring samples into your own light.
          </h2>
          <p className="reveal mt-7 max-w-prose text-base leading-relaxed text-warm-white/70">
            Fabric reads completely differently on a wall than it does in a book. We bring the range to
            you and leave it with you.
          </p>
          <div className="reveal mt-11 flex flex-col items-center gap-4 sm:flex-row">
            <LiquidMetalButton href="/consultation" label="Book a free consultation" />
            <Link href="/blinds/custom-curtains-drapery" className="btn-light">
              Full specification
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
