import type { Metadata, Viewport } from 'next';
// Next.js handles this stylesheet import at build time; the declaration is
// intentionally suppressed here because CSS has no TypeScript module shape.
// @ts-expect-error CSS side-effect imports are supported by Next.js.
import './globals.css';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';
import ScrollRevealProvider from '@/components/ScrollRevealProvider';
import { site } from '@/lib/site';

/* ────────────────────────────────────────────────────────────────────────────
   TYPEFACES

   Manrope for display (oversized editorial headlines), Inter for body copy,
   Instrument Serif for the occasional italic pull-quote.

   They load from Google Fonts via <link> rather than `next/font/google`, so the
   build has no network dependency — it works in CI, in an air-gapped container,
   and on any static host. The font-family names are wired to CSS variables in
   globals.css and consumed through tailwind.config.ts, so nothing else in the
   codebase cares how they arrive.

   ── To switch to next/font/google (self-hosted, zero layout shift, no
      third-party request — worth doing if your build machine can reach
      fonts.googleapis.com):

        import { Manrope, Inter, Instrument_Serif } from 'next/font/google';

        const display   = Manrope({ subsets: ['latin'], weight: ['500','600','700','800'], variable: '--font-display',  display: 'swap' });
        const body      = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
        const editorial = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal','italic'], variable: '--font-editorial', display: 'swap' });

      …then put `${display.variable} ${body.variable} ${editorial.variable}` on
      <html>, delete the three <link> tags below, and remove the
      `--font-*` declarations from the :root block in globals.css.
   ──────────────────────────────────────────────────────────────────────────── */
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2' +
  '?family=Manrope:wght@500;600;700;800' +
  '&family=Inter:wght@400;500;600' +
  '&family=Instrument+Serif:ital@0;1' +
  '&display=swap';

export const viewport: Viewport = {
  themeColor: '#0C0B0A',
  width: 'device-width',
  initialScale: 1,
  // Zoom is never disabled — pinch-to-zoom stays available.
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'The Shading Zone | Custom Blinds, Shades & Curtains',
    template: '%s | The Shading Zone',
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'custom blinds',
    'custom curtains',
    'window coverings',
    'motorized blinds',
    'roller shades',
    'zebra shades',
    'blackout shades',
    'custom window treatments',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: 'The Shading Zone | Custom Blinds, Shades & Curtains',
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Shading Zone | Custom Blinds, Shades & Curtains',
    description: site.description,
  },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.contact.phone,
  email: site.contact.email,
  slogan: site.tagline,
  makesOffer: [
    'Custom blinds',
    'Custom shades',
    'Custom curtains and drapery',
    'Motorized window coverings',
    'Window covering measurement and installation',
  ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-char-950 focus:px-5 focus:py-3 focus:text-warm-white"
        >
          Skip to content
        </a>

        <ScrollRevealProvider />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <FloatingCTA />

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
