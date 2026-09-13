import Link from 'next/link';
import { site, footerNav } from '@/lib/site';
import Wordmark from './Wordmark';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-char-950 text-warm-white">
      <div className="shell py-section-sm">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          {/* Brand */}
          <div>
            <Wordmark className="w-[13rem] text-warm-white" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-warm-white/55">
              {site.tagline}
            </p>
            <Link href="/consultation" className="btn-light mt-8 inline-flex">
              Book a free consultation
            </Link>
          </div>

          {/* Navigation, split into two columns */}
          <nav aria-label="Footer — products">
            <h2 className="eyebrow text-warm-white/40">Explore</h2>
            <ul className="mt-6 space-y-3">
              {footerNav.slice(0, 7).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-draw text-sm text-warm-white/70 hover:text-warm-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer — company">
            <h2 className="eyebrow text-warm-white/40">Company</h2>
            <ul className="mt-6 space-y-3">
              {footerNav.slice(7).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-draw text-sm text-warm-white/70 hover:text-warm-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="eyebrow text-warm-white/40">Get in touch</h2>
            <ul className="mt-6 space-y-3 text-sm text-warm-white/70">
              <li>
                <a href={site.contact.phoneHref} className="link-draw hover:text-warm-white">
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a href={site.contact.emailHref} className="link-draw hover:text-warm-white">
                  {site.contact.email}
                </a>
              </li>
              <li className="pt-1 text-warm-white/50">{site.contact.serviceArea}</li>
              {site.contact.address && (
                <li className="text-warm-white/50">
                  {site.contact.address.street}
                  <br />
                  {site.contact.address.city}, {site.contact.address.region}{' '}
                  {site.contact.address.postalCode}
                </li>
              )}
            </ul>

            {site.social.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                {site.social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="link-draw text-xs uppercase tracking-[0.18em] text-warm-white/50 hover:text-warm-white"
                      rel="noopener noreferrer"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-16 rule bg-warm-white/10" />

        <div className="mt-7 flex flex-col gap-4 text-xs text-warm-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.name}. All rights reserved.</p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy" className="link-draw hover:text-warm-white/70">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="link-draw hover:text-warm-white/70">Terms &amp; Conditions</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
