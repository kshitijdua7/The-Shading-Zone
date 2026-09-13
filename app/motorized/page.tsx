import type { Metadata } from 'next';
import Link from 'next/link';
import { Radio, Smartphone, CalendarClock, Hand, ShieldCheck, Home } from 'lucide-react';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import MotorizedDemo from '@/components/MotorizedDemo';
import FaqAccordion from '@/components/FaqAccordion';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';
import { productBySlug, imageUrl } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Motorized & Smart Blinds',
  description:
    'Motorized blinds, shades and curtains from The Shading Zone — remote, wall switch and app control, battery or hardwired motors, and cordless operation for child and pet safety.',
  alternates: { canonical: '/motorized' },
};

const FEATURES = [
  { Icon: Radio, title: 'Remote control', text: 'A handheld remote for one shade, a room, or the whole house — grouped however makes sense to you.' },
  { Icon: Smartphone, title: 'App control', text: 'Where the motor system supports it, your shades appear in an app on your phone.' },
  { Icon: CalendarClock, title: 'Automated schedules', text: 'Where supported, shades can move on a timetable or with the sun, so a west-facing room stops overheating at four.' },
  { Icon: Hand, title: 'Convenient operation', text: 'One press moves a wall of glass. No reaching, no stools, no doing it shade by shade.' },
  { Icon: ShieldCheck, title: 'Child & pet friendly', text: 'Motorised coverings have no accessible operating cords, which removes the main hazard.' },
  { Icon: Home, title: 'Smart-home integration', text: 'Compatible with common smart-home platforms depending on the motor family — tell us what you run and we’ll confirm.' },
];

export default function MotorizedPage() {
  const product = productBySlug('motorized-blinds')!;

  return (
    <>
      <PageHero
        eyebrow="Motorization"
        title="Smarter windows. Effortless control."
        lead="Almost everything we make can be motorised. No cords to reach for, no shade-by-shade routine — and, where the system supports it, blinds that move before you think to."
        image={imageUrl('media', 2000)}
        alt="A living room with motorised window coverings and a wall-mounted screen"
      />

      <Section>
        <div className="shell">
          <SectionHeading
            eyebrow="In plain language"
            title="What motorisation actually gives you"
            lead="A small motor sits inside the headrail. It turns the tube, tilts the slats or draws the track for you — and it knows exactly where to stop, because we set those limits when we install it."
          />
          <ul className="mt-20 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {FEATURES.map(({ Icon, title, text }) => (
              <li key={title} className="reveal group">
                <span
                  aria-hidden="true"
                  className="grid h-12 w-12 place-items-center rounded-full border border-brass/40 text-brass transition-all duration-500 ease-luxe group-hover:border-brass group-hover:bg-brass group-hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-base font-bold uppercase tracking-tight text-char-950">{title}</h3>
                <p className="mt-3 max-w-[34ch] text-[0.92rem] leading-[1.75] text-stone-600">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Interactive schedule */}
      <Section tone="off">
        <div className="shell">
          <SectionHeading
            eyebrow="A day on a schedule"
            title="Watch them adjust themselves"
            lead="Scroll — or pick a time — and see how an automated schedule moves through the day."
          />
          <div className="mt-20">
            <MotorizedDemo />
          </div>
        </div>
      </Section>

      {/* Power options */}
      <Section>
        <div className="shell">
          <SectionHeading eyebrow="Power" title="Three ways to power a motor" />
          <div className="mt-16 grid gap-px overflow-hidden border border-char-950/10 bg-char-950/10 md:grid-cols-3" data-reveal-stagger>
            {[
              ['Battery', 'Retrofits into a finished home with no electrical work. The simplest option by far, and the one most people end up with.'],
              ['Plug-in', 'A low-voltage adaptor to a nearby outlet. No batteries to change, minimal disruption.'],
              ['Hardwired', 'Cleanest of all, and the right choice if your walls are already open during a renovation. Needs planning before drywall.'],
            ].map(([title, text]) => (
              <div key={title} className="reveal bg-warm-white p-9">
                <h3 className="text-base font-bold uppercase tracking-tight text-char-950">{title}</h3>
                <p className="mt-4 text-[0.92rem] leading-[1.75] text-stone-600">{text}</p>
              </div>
            ))}
          </div>
          <p className="reveal mt-10 max-w-prose border-l-2 border-brass/50 pl-5 text-sm leading-relaxed text-stone-500">
            Battery life, app support and smart-home compatibility all depend on the specific motor
            family we specify. We&rsquo;ll give you the manufacturer&rsquo;s figures for your exact setup
            rather than a general claim.
          </p>
        </div>
      </Section>

      <Section tone="off">
        <div className="shell max-w-4xl">
          <SectionHeading eyebrow="Questions" title="Motorization, answered" />
          <div className="mt-14">
            <FaqAccordion items={product.faqs} searchable={false} />
          </div>
        </div>
      </Section>

      <section className="bg-char-950 py-section text-warm-white">
        <div className="shell flex flex-col items-center text-center">
          <h2 className="reveal max-w-[16ch] text-display-md font-extrabold uppercase">Explore motorization</h2>
          <p className="reveal mt-7 max-w-prose text-base leading-relaxed text-warm-white/70">
            Tell us which windows are the annoying ones. That&rsquo;s usually where motorisation earns
            its keep first.
          </p>
          <div className="reveal mt-11 flex flex-col items-center gap-4 sm:flex-row">
            <LiquidMetalButton href="/consultation" label="Book a free consultation" />
            <Link href="/blinds/motorized-blinds" className="btn-light">Full specification</Link>
          </div>
        </div>
      </section>
    </>
  );
}
