import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';
import { PageHero, Section } from '@/components/Section';
import ContactForm from '@/components/forms/ContactForm';
import { imageUrl } from '@/lib/content';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Call, email or message The Shading Zone about custom blinds, shades and curtains — or book a free in-home or virtual consultation.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const { contact } = site;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about your windows."
        lead="Call, email, or send us a message. If you already know you'd like samples in the room, book a free consultation instead — it's the fastest way to a real answer."
        image={imageUrl('study', 2000)}
        alt="A quiet study with a chair, desk and shaded window"
      />

      <Section>
        <div className="shell grid gap-16 lg:grid-cols-[0.85fr_1fr] lg:gap-24">
          {/* Details */}
          <div>
            <h2 className="reveal text-display-sm font-bold uppercase text-char-950">Get in touch</h2>

            <dl className="reveal mt-12 space-y-10" data-reveal-stagger>
              <div className="reveal flex gap-5">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
                <div>
                  <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-stone-500">Phone</dt>
                  <dd className="mt-2">
                    <a href={contact.phoneHref} className="text-lg font-semibold text-char-950 link-draw">
                      {contact.phone}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="reveal flex gap-5">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
                <div>
                  <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-stone-500">Email</dt>
                  <dd className="mt-2">
                    <a href={contact.emailHref} className="text-lg font-semibold text-char-950 link-draw">
                      {contact.email}
                    </a>
                  </dd>
                </div>
              </div>

              {contact.hours && (
                <div className="reveal flex gap-5">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
                  <div>
                    <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Business hours
                    </dt>
                    <dd className="mt-3 space-y-1.5 text-[0.92rem] text-stone-600">
                      {contact.hours.map((h) => (
                        <p key={h.days} className="flex justify-between gap-8 sm:max-w-xs">
                          <span>{h.days}</span>
                          <span className="tabular-nums">{h.time}</span>
                        </p>
                      ))}
                    </dd>
                  </div>
                </div>
              )}

              <div className="reveal flex gap-5">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
                <div>
                  <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Service area
                  </dt>
                  <dd className="mt-2 max-w-prose text-[0.92rem] leading-relaxed text-stone-600">
                    {contact.serviceArea}
                    {!contact.address && (
                      <>
                        {' '}
                        Send us your address and we&rsquo;ll confirm whether you&rsquo;re inside it —
                        we&rsquo;d rather tell you straight away than take a booking we can&rsquo;t
                        fulfil.
                      </>
                    )}
                  </dd>
                  {contact.address && (
                    <dd className="mt-3 text-[0.92rem] leading-relaxed text-stone-600">
                      {contact.address.street}
                      <br />
                      {contact.address.city}, {contact.address.region} {contact.address.postalCode}
                      <br />
                      {contact.address.country}
                    </dd>
                  )}
                </div>
              </div>
            </dl>

            {site.social.length > 0 && (
              <div className="reveal mt-12 border-t border-char-950/10 pt-8">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-stone-500">Social</p>
                <ul className="mt-4 flex flex-wrap gap-6">
                  {site.social.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} rel="noopener noreferrer" className="link-draw text-sm text-char-950">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="reveal mt-12 border border-char-950/12 bg-warm-50 p-8">
              <p className="text-sm leading-relaxed text-stone-600">
                Ready for samples in the room?
              </p>
              <Link href="/consultation" className="btn-solid mt-5 inline-flex">
                Book a free consultation
              </Link>
            </div>

            {/* The map only renders once a real address with an embed URL is configured. */}
            {contact.address?.mapEmbedUrl && (
              <div className="reveal mt-12 aspect-[4/3] overflow-hidden border border-char-950/12">
                <iframe
                  src={contact.address.mapEmbedUrl}
                  title={`Map showing the location of ${site.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                />
              </div>
            )}
          </div>

          {/* Form */}
          <div>
            <h2 className="reveal text-display-sm font-bold uppercase text-char-950">Send a message</h2>
            <div className="reveal mt-12">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
