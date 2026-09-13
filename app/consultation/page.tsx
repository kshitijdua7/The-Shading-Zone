import type { Metadata } from 'next';
import { Home, Video, Ruler, Palette } from 'lucide-react';
import { PageHero, Section } from '@/components/Section';
import ConsultationForm from '@/components/forms/ConsultationForm';
import { imageUrl } from '@/lib/content';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Book a Free Consultation',
  description:
    'Book a free in-home or virtual window covering consultation with The Shading Zone. Samples, expert guidance and precise measurements — with no obligation.',
  alternates: { canonical: '/consultation' },
};

const WHAT_HAPPENS = [
  { Icon: Home, title: 'We come to you', text: 'Or meet on a video call, whichever suits. We look at the rooms, the light and how you use the space.' },
  { Icon: Palette, title: 'Samples in your light', text: 'Fabric reads completely differently on your wall than in a book. We bring the range and leave it with you.' },
  { Icon: Ruler, title: 'Precise measurements', text: 'If you decide to go ahead, we measure every opening ourselves. No numbers you had to take yourself.' },
  { Icon: Video, title: 'Straight advice', text: 'Including when a simpler or cheaper product suits your windows better than the one you came in asking about.' },
];

export default function ConsultationPage() {
  return (
    <>
      <PageHero
        eyebrow="Free consultation"
        title="Let's transform your windows."
        lead="Book your free in-home or virtual consultation. Not sure which blinds or curtains are right for your space? Our specialists will help you choose the right style, material, colour, light control and functionality."
        image={imageUrl('roomDrapery', 2000)}
        alt="A neutral living room with floor-length drapery filtering afternoon light"
      />

      <Section>
        <div className="shell grid gap-16 lg:grid-cols-[1fr_0.72fr] lg:gap-24">
          {/* Form */}
          <div>
            <h2 className="reveal text-display-sm font-bold uppercase text-char-950">
              Book your consultation
            </h2>
            <p className="reveal mt-5 max-w-prose text-base leading-relaxed text-stone-600">
              Fields marked <span className="text-brass">*</span> are required. Everything else helps us
              come prepared.
            </p>
            <div className="reveal mt-14">
              <ConsultationForm />
            </div>
          </div>

          {/* Aside */}
          <aside className="reveal lg:sticky lg:top-28 lg:self-start">
            <div className="border border-char-950/12 bg-warm-50 p-9">
              <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brass">
                What happens next
              </h2>
              <ul className="mt-8 space-y-8">
                {WHAT_HAPPENS.map(({ Icon, title, text }) => (
                  <li key={title} className="flex gap-5">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-tight text-char-950">{title}</h3>
                      <p className="mt-2 text-[0.9rem] leading-[1.7] text-stone-600">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10 border-t border-char-950/10 pt-8">
                <p className="text-sm leading-relaxed text-stone-600">
                  Prefer to talk it through?
                </p>
                <a
                  href={site.contact.phoneHref}
                  className="mt-3 block text-lg font-semibold text-char-950 link-draw"
                >
                  {site.contact.phone}
                </a>
                <a
                  href={site.contact.emailHref}
                  className="mt-2 block text-sm text-stone-600 link-draw"
                >
                  {site.contact.email}
                </a>
              </div>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-stone-500">
              Free means free — there is no fee for the visit and no obligation to order afterwards.
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
