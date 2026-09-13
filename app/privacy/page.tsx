import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/Section';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How The Shading Zone handles the information you send through this website.',
  alternates: { canonical: '/privacy' },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        lead="How we handle the information you send us through this website."
      />

      <Section>
        <div className="shell max-w-prose space-y-10 text-[0.95rem] leading-[1.85] text-stone-600">
          <div className="border-l-2 border-brass bg-warm-50 p-7 text-sm text-char-700">
            <p className="font-semibold text-char-950">This is a starting draft, not legal advice.</p>
            <p className="mt-3">
              It describes what this website actually does, so it is accurate about the mechanics — but
              privacy obligations depend on where {site.name} operates and where its customers are.
              Have it reviewed by someone qualified in your jurisdiction before launch, and replace this
              notice with a real effective date.
            </p>
          </div>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">What we collect</h2>
            <p className="mt-4">
              Only what you type into a form on this site. Depending on which form you use, that may
              include your name, phone number, email address, address or area, your preferred
              consultation type and timing, the number of windows, which products interest you,
              approximate measurements, any notes you write, and any photos you choose to attach.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">Why we collect it</h2>
            <p className="mt-4">
              To respond to your enquiry, arrange a consultation, prepare a quote, and carry out work you
              ask us to do. We do not sell your information, and we do not use it to build advertising
              profiles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">Cookies and tracking</h2>
            <p className="mt-4">
              As built, this website sets no cookies of its own and runs no analytics or advertising
              scripts. Photography is currently served from a third-party image host, which will see the
              requests your browser makes for those images.
            </p>
            <p className="mt-4">
              If analytics, a chat widget, a pixel or any other third-party script is added later, this
              section must be updated to say so — and, depending on your jurisdiction, a consent banner
              may be required.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">Who else sees it</h2>
            <p className="mt-4">
              Form submissions are delivered through whichever form service {site.name} has configured,
              and are stored by that provider on our behalf. We share your details with nobody else
              except where we are legally required to.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">How long we keep it</h2>
            <p className="mt-4">
              [Add your retention period here.] We keep enquiry and order records for as long as we need
              them to serve you and to meet our record-keeping obligations, and no longer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">Your choices</h2>
            <p className="mt-4">
              You can ask us what we hold about you, ask us to correct it, or ask us to delete it. Email{' '}
              <a href={site.contact.emailHref} className="link-draw text-char-950">{site.contact.email}</a>{' '}
              or call{' '}
              <a href={site.contact.phoneHref} className="link-draw text-char-950">{site.contact.phone}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-tight text-char-950">Contact</h2>
            <p className="mt-4">
              {site.legalName} · <a href={site.contact.emailHref} className="link-draw text-char-950">{site.contact.email}</a>
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
