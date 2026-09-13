import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import CurtainReveal from '@/components/CurtainReveal';
import FaqAccordion from '@/components/FaqAccordion';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';
import { productBySlug, image, imageUrl } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Custom Curtains & Drapery',
  description:
    'Sheer, blackout, lined and layered custom curtains. Pinch pleat, ripple fold, grommet and rod pocket headers, custom fabrics and motorized tracks from The Shading Zone.',
  alternates: { canonical: '/curtains' },
};

const TYPES = [
  { name: 'Sheer curtains', text: 'A soft veil that keeps the room bright and takes the hard edge off daylight. Beautiful layered in front of, or behind, something heavier.', img: 'curtainSheer' },
  { name: 'Blackout curtains', text: 'Lined to stop light rather than filter it. The right answer for bedrooms, nurseries and rooms with a screen in them.', img: 'curtainFull' },
  { name: 'Drapery', text: 'Full-length panels in a real drapery weight, hung high and stacked properly. This is the treatment that makes a room feel finished.', img: 'roomDrapery' },
  { name: 'Layered curtains', text: 'A sheer and an opaque panel on the same window, on a double track. Maximum flexibility, morning to night.', img: 'sheerLeaves' },
  { name: 'Custom fabrics', text: 'Linen, cotton, velvet, faux silk, wool-look wovens and voiles — chosen against your walls, in your light.', img: 'sampleBook' },
  { name: 'Motorized curtains', text: 'A quiet traverse track that draws your panels on a remote, a wall switch, or a schedule where the system supports it.', img: 'entrance' },
] as const;

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

      {/* Types */}
      <Section tone="off">
        <div className="shell">
          <SectionHeading eyebrow="What we make" title="Six directions" />
          <div className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {TYPES.map((t) => {
              const img = image(t.img, 800);
              return (
                <article key={t.name} className="reveal group">
                  <div className="aspect-[4/5] overflow-hidden bg-warm-100">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1.1s] ease-luxe group-hover:scale-[1.05]"
                    />
                  </div>
                  <h3 className="mt-6 text-base font-bold uppercase tracking-tight text-char-950">{t.name}</h3>
                  <p className="mt-3 text-[0.92rem] leading-[1.75] text-stone-600">{t.text}</p>
                </article>
              );
            })}
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
