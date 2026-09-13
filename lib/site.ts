/* ────────────────────────────────────────────────────────────────────────────
   THE SHADING ZONE — SITE CONFIGURATION

   ⚠️  EVERY PLACEHOLDER IN THIS FILE IS MARKED `TODO`.
   Replace them once and the correct details appear everywhere on the site:
   navigation, footer, contact page, forms, structured data and OG metadata.

   Nothing on this site states a warranty period, a lead time, a service area,
   a certification, a review, a rating or a statistic — because none of those
   were supplied. Add them here (and to lib/content.json) only when they are
   claims The Shading Zone can actually support.
   ──────────────────────────────────────────────────────────────────────────── */

export const site = {
  name: 'The Shading Zone',
  legalName: 'The Shading Zone', // TODO: registered business name, if different
  tagline: 'Custom blinds. Custom curtains. Custom spaces.',
  description:
    'The Shading Zone designs, manufactures, supplies and installs custom blinds, shades, curtains and window coverings. Free in-home and virtual consultations.',

  // TODO: replace with your live domain — used for canonical URLs, sitemap and OG tags.
  url: 'https://www.shadingzone.com',

  contact: {
    phone: '(000) 000-0000',            // TODO
    phoneHref: 'tel:+10000000000',      // TODO
    email: 'hello@shadingzone.com',     // TODO
    emailHref: 'mailto:hello@shadingzone.com', // TODO

    // TODO: replace with your real hours, or set `hours: null` to hide the block.
    hours: [
      { days: 'Monday – Friday', time: '00:00 – 00:00' },
      { days: 'Saturday', time: '00:00 – 00:00' },
      { days: 'Sunday', time: 'Closed' },
    ] as { days: string; time: string }[] | null,

    // TODO: replace with the areas you actually service. Leave as-is and the site
    // simply invites people to ask — which is better than claiming coverage you
    // don't have.
    serviceArea: '[Service area — add the cities and regions you cover]',

    // TODO: set to a real address to show the location block and enable the map.
    // Leave `null` if you operate without a public showroom.
    address: null as null | {
      street: string;
      city: string;
      region: string;
      postalCode: string;
      country: string;
      mapEmbedUrl: string;
    },
  },

  social: [
    // TODO: replace the `#` hrefs, or delete the entries you don't use.
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
    { label: 'Pinterest', href: '#' },
  ],

  /**
   * Where the consultation / quote / contact forms POST.
   *
   * Out of the box the forms validate fully and show a real success state, but
   * they do NOT send anywhere — see components/forms/submit.ts. Set one of these
   * and the forms start delivering:
   *
   *   • formEndpoint — any HTTPS endpoint that accepts multipart/form-data
   *     (Formspree, Basin, Netlify Forms, Web3Forms, your own handler).
   *   • Or remove `output: 'export'` from next.config.mjs and add a route
   *     handler at app/api/lead/route.ts, then set formEndpoint to '/api/lead'.
   */
  formEndpoint: '' as string, // TODO
};

export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Blinds', href: '/blinds' },
  { label: 'Curtains', href: '/curtains' },
  { label: 'Our Collections', href: '/collections' },
  { label: 'About Us', href: '/about' },
  { label: 'Our Process', href: '/process' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Free Consultation', href: '/consultation' },
  { label: 'Contact', href: '/contact' },
];

export const footerNav: NavLink[] = [
  { label: 'Blinds', href: '/blinds' },
  { label: 'Curtains', href: '/curtains' },
  { label: 'Collections', href: '/collections' },
  { label: 'Motorized', href: '/motorized' },
  { label: 'Manufacturing', href: '/manufacturing' },
  { label: 'About', href: '/about' },
  { label: 'Process', href: '/process' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Before & After', href: '/before-after' },
  { label: 'Commercial', href: '/commercial' },
  { label: 'Trade', href: '/trade' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Free Consultation', href: '/consultation' },
];
