import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/Section';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms governing the use of The Shading Zone website.',
  alternates: { canonical: '/terms' },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        lead="Terms governing your use of this website."
      />

      <Section>
        <div className="shell max-w-prose space-y-10 text-[0.95rem] leading-[1.85] text-stone-600">
          <div className="border-l-2 border-brass bg-warm-50 p-7 text-sm text-char-700">
            <p className="font-semibold text-char-950">This is a starting draft, not legal advice.</p>
            <p className="mt-3">
              It covers website use only. It deliberately does not state warranty periods, cancellation
              windows, deposit terms, delivery timescales or a returns policy, because none were
              supplied — and inventing them would create obligations {site.name} never agreed to. Have a
              qualified professional draft your sale-of-goods terms and add them here before launch.
            </p>
          </div>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">Using this website</h2>
            <p className="mt-4">
              You may browse this website and use its forms to contact us. Please do not attempt to
              disrupt the site, submit content you do not have the right to submit, or use it for
              anything unlawful.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">Information on this site</h2>
            <p className="mt-4">
              Product descriptions, specifications and imagery are provided to help you understand the
              options. Fabrics and finishes vary between batches and look different under different
              lighting, so an image on a screen is a guide rather than an exact match. Nothing on this
              website is an offer or a quotation — a quotation is the written document we send you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">Enquiries and quotes</h2>
            <p className="mt-4">
              Submitting a form starts a conversation; it does not create a contract or reserve a
              booking. Consultations are free and carry no obligation. Any order is governed by the
              written quotation and order documentation you receive and accept.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">
              Photography and content
            </h2>
            <p className="mt-4">
              The imagery currently on this site is licensed stock photography used to illustrate the
              kind of work described. It does not depict specific {site.name} installations unless
              captioned as such. Text, layout and code on this site belong to {site.legalName}.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">Links elsewhere</h2>
            <p className="mt-4">
              Where we link to another website, we are not responsible for its content or its practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">Contact</h2>
            <p className="mt-4">
              {site.legalName} ·{' '}
              <a href={site.contact.emailHref} className="link-draw text-char-950">{site.contact.email}</a>
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
