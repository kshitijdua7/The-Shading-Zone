# The Shading Zone

A production-ready marketing website for **The Shading Zone** — custom blinds, shades, curtains and window coverings. Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Three.js.

The signature moment is the homepage hero: a luxury room with a floor-to-ceiling window behind a closed blind. As you scroll, the slats tilt open, daylight floods the room, the blind lifts, the camera moves through the opening, and the brand message lands.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # static export → ./out
npm run typecheck    # tsc --noEmit
npm run preview:build   # regenerate the single-file preview
```

`next.config.mjs` sets `output: 'export'`, so `npm run build` produces a fully static `out/` directory you can drop on Vercel, Netlify, Cloudflare Pages, S3, or ordinary shared hosting. No Node server required.

---

## First things to change

Everything below is a placeholder. Nothing on this site invents a fact about the business.

### 1. `lib/site.ts` — business details

Phone, email, hours, service area, address, social links, and the domain used for canonical URLs, the sitemap and Open Graph tags. Every one is marked `TODO`. Change them once and they update navigation, footer, contact page, forms, and structured data everywhere.

### 2. `lib/site.ts` → `formEndpoint` — make the forms actually send

Out of the box the consultation, quote and contact forms validate fully and show a real success state, but **they do not send anywhere**. A warning is logged to the console so this can't ship unnoticed.

Set `formEndpoint` to any HTTPS endpoint accepting `multipart/form-data` — Formspree, Basin, Web3Forms, Netlify Forms, or your own handler — and they start delivering. Alternatively, remove `output: 'export'` from `next.config.mjs`, add a route handler at `app/api/lead/route.ts`, and point `formEndpoint` at `/api/lead`.

### 3. `lib/content.json` — all site copy and imagery

Every product description, collection, process step, FAQ answer and image reference lives in this one file. The Next.js app and the standalone preview both read from it, so they can never drift apart.

### 4. Photography

Images are currently Unsplash placeholders, referenced by ID in the `images` block of `lib/content.json`. To swap in real The Shading Zone photography:

1. Drop your files into `public/photography/`.
2. Change one function — `imageUrl()` in `lib/content.ts` — to return `/photography/${id}.webp`.

Nothing else needs to change. Every component requests images through that single function.

### 5. `app/privacy/page.tsx` and `app/terms/page.tsx`

Honest starting drafts that describe what the site actually does. They deliberately state **no** warranty period, cancellation window, deposit terms, delivery timescale or returns policy, because none were supplied. Have them reviewed for your jurisdiction before launch.

---

## What is deliberately absent

No fake testimonials, reviews, ratings, statistics, awards, certifications, origin claims ("100% Canadian made"), lead times, warranty periods or service areas appear anywhere. Where such a claim would normally sit, the copy either says the honest thing ("we won't quote a number here — you'll get a specific timeline in writing with your quote") or leaves a clearly-marked placeholder.

`app/manufacturing/page.tsx` says this explicitly on the page. When The Shading Zone has those credentials in writing, that's where they belong.

---

## Structure

```
app/
  page.tsx                    Home — cinematic hero + every section
  blinds/                     Index + 10 dynamic product pages
  collections/                Index + 6 dynamic collection pages
  curtains/  motorized/       Dedicated marketing pages
  manufacturing/  process/    Story pages
  gallery/  before-after/     Visual pages
  consultation/  quote/  contact/   Lead capture
  about/  faq/  commercial/  trade/
  privacy/  terms/  not-found.tsx
  sitemap.ts  robots.ts       Generated at build time

components/
  hero/CinematicHero.tsx      Scroll-pinned hero shell + overlay choreography
  hero/blindScene.ts          The Three.js room, blind and light rig
  ui/liquid-metal-button.tsx  Shader button (integrated, see notes below)
  ui/scroll-locked-video-hero.tsx   Alternative video-scrub hero (not used by default)
  Navbar  Footer  FloatingCTA  ProductCard  GalleryGrid  BeforeAfter
  ProcessTimeline  HorizontalScroller  CurtainReveal  MotorizedDemo
  SeeItInYourSpace  WindowGraphic  Section  Cards  Wordmark
  forms/                      Fields, validation, submit, success animation

lib/
  content.json                All copy, products, FAQs, image references
  content.ts                  Typed access + the single image() function
  site.ts                     Business config — the file to edit first
  utils.ts                    cn() with custom Tailwind scales registered
```

---

## Notes on the two components you supplied

### `liquid-metal-button.tsx`

Integrated and used on the primary conversion CTAs. Five changes were necessary:

- **The shader library is imported dynamically inside the effect.** A static import runs during Next's server prerender, where `document` doesn't exist, and takes the whole build down.
- **A gradient fallback** renders if WebGL or the chunk is unavailable — previously the button became an empty black capsule.
- **Label contrast raised.** `#666666` on a near-black pill is about 3.6:1, below the WCAG AA minimum. It's now a warm light grey that passes while keeping the engraved look.
- **Width adapts to the label.** The fixed 142px clipped "Book a free consultation".
- **Renders as a real `<a>` when given `href`**, and respects `prefers-reduced-motion` (shader frozen, ripple skipped).

### `scroll-locked-video-hero.tsx`

Shipped in the repo, but **not** the default hero — and that was a deliberate call worth explaining.

The original pins `document.body` with `position: fixed` and swallows wheel and touch events, with (in its own words) "no release valve in either direction". That breaks keyboard scrolling, screen-reader virtual cursors, the scrollbar, find-in-page and back/forward restoration — and on a slow connection a visitor is trapped in a hero that never releases.

`components/hero/CinematicHero.tsx` produces the identical visual effect from a tall spacer plus `position: sticky`. The page genuinely scrolls, so every input method works and the scrollbar tells the truth, while the visual frame stays put and the scene scrubs. Reverse scrolling rewinds it exactly as before.

The video version is still there if you want a real video scrub, with the trapping bug fixed (it releases at the end, re-locks on scroll-up, supports the keyboard, skips the lock under reduced motion, and has a timeout so a failed video load can't strand anyone). Encode the source as a short, keyframe-dense MP4 or scrubbing will stutter.

---

## Accessibility & performance

- Visible focus rings everywhere; a skip link; one `<h1>` per page.
- Every interactive target is at least 44×44px. Every image has alt text. Every form field has a visible label, an error message beside the field it belongs to, and an error summary that takes focus.
- The before/after comparison is a restyled `<input type="range">`, so it works with the keyboard and is announced correctly.
- `prefers-reduced-motion` is honoured throughout: the hero renders its final frame statically, the curtains start open, scroll reveals are neutralised, and the shader button freezes.
- Three.js is loaded in a lazily-imported chunk, so the homepage's initial JS is ~136 kB and the 3D scene never blocks first paint. Mobile gets a lighter scene (fewer slats, no shadow map, capped DPR), and rendering stops entirely when the hero scrolls out of view.
- No horizontal overflow at 375 / 390 / 768 / 1024 / 1280 / 1440px.

---

## SEO

Unique title and meta description per page, canonical URLs, Open Graph and Twitter tags, a generated `sitemap.xml` and `robots.txt`, proper heading hierarchy, descriptive alt text, clean URLs, internal linking, and JSON-LD structured data (`HomeAndConstructionBusiness` sitewide, `Product` per product page, `FAQPage` on the FAQ and each product's questions). No price, rating or review is asserted anywhere, because none were supplied.

---

## Typefaces

Manrope (display), Inter (body), Instrument Serif (pull-quotes), loaded from Google Fonts via `<link>` so the build has no network dependency. To switch to `next/font/google` — self-hosted, zero layout shift, no third-party request — follow the commented instructions at the top of `app/layout.tsx`. It's a three-line change.

---

## `shading-zone-preview.html`

A single self-contained file that reproduces the site — generated from the same `lib/content.json` by `scripts/build-preview.mjs`, so it can't drift from the real copy. Zero dependencies: the hero is CSS 3D rather than WebGL, forms validate for real, and photography degrades to a labelled placeholder if the image host is unreachable. Open it straight off disk, no server needed.

It exists so the design can be reviewed and shared without installing anything. The Next.js app is the real deliverable.
