import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section } from '@/components/Section';
import BeforeAfter from '@/components/BeforeAfter';
import { beforeAfterPairs, imageUrl } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Before & After',
  description:
    'Drag the slider to see how custom blinds and curtains change a room — glare controlled, privacy gained, light softened.',
  alternates: { canonical: '/before-after' },
};

export default function BeforeAfterPage() {
  return (
    <>
      <PageHero
        eyebrow="Before & after"
        title="See the difference."
        lead="Drag the handle on any image — or use the arrow keys — to move between bare glass and a finished window."
        image={imageUrl('windowLight', 2000)}
        alt="Daylight pouring through a bare window opening"
      />

      <Section>
        <div className="shell">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-24" data-reveal-stagger>
            {beforeAfterPairs.map((pair) => (
              <BeforeAfter key={pair.title} pair={pair} />
            ))}
          </div>

          <div className="reveal mt-24 flex flex-col items-center gap-6 border-t border-char-950/10 pt-16 text-center">
            <p className="max-w-prose text-sm leading-relaxed text-stone-500">
              These comparisons illustrate the difference a window covering makes to a room. They pair
              rooms of a similar type rather than showing one address before and after, and they will be
              replaced with real project pairs as The Shading Zone photographs its own installations.
            </p>
            <Link href="/consultation" className="btn-solid">Book a free consultation</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
