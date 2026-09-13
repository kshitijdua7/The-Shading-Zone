import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, SectionHeading } from '@/components/Section';
import ProcessTimeline from '@/components/ProcessTimeline';
import { processSteps, imageUrl } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Our Process',
  description:
    'Consultation, measurement, design, manufacturing, quality check, installation. The seven steps of a window covering from The Shading Zone, start to finish.',
  alternates: { canonical: '/process' },
};

const STEP_IMAGES = ['fabricBench', 'woodWindow', 'colourCards', 'fabricStack', 'sampleBook', 'blindsDaylight', 'roomDrapery'] as const;

export default function ProcessPage() {
  const steps = processSteps.map((s, i) => ({ ...s, image: STEP_IMAGES[i] }));

  return (
    <>
      <PageHero
        eyebrow="Our process"
        title="Seven steps. All of them ours."
        lead="We don't hand you off. The same company consults, measures, designs, manufactures, inspects, installs — and picks up the phone afterwards."
        image={imageUrl('woodSlatsLight', 2000)}
        alt="Wooden blind slats catching daylight"
      />

      <Section>
        <div className="shell">
          <ProcessTimeline steps={steps} />
        </div>
      </Section>

      <section className="bg-char-950 py-section text-warm-white">
        <div className="shell">
          <SectionHeading
            tone="dark"
            eyebrow="Timelines"
            title="How long does it take?"
            lead="It depends on the product, the size of the order and current lead times from our suppliers — so we won't put a number on this page that we can't stand behind for your job. You'll get a specific timeline in writing with your quote, before you commit to anything."
          />
          <div className="reveal mt-14 flex flex-wrap gap-4">
            <Link href="/consultation" className="btn bg-warm-white text-char-950 hover:bg-brass hover:text-white">
              Start with a free consultation
            </Link>
            <Link href="/manufacturing" className="btn-light">See how they're made</Link>
          </div>
        </div>
      </section>
    </>
  );
}
