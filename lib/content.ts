import data from './content.json';

/* ────────────────────────────────────────────────────────────────────────────
   Typed access to lib/content.json — the single source of truth for every page.

   REPLACING THE PHOTOGRAPHY
   Each entry in `images` is an Unsplash photo id plus alt text. To swap in real
   The Shading Zone's photography, drop your files into /public/photography/ and change
   `imageUrl()` below to return `/photography/${id}.webp` (or similar). Nothing
   else in the codebase needs to change — every component asks for images through
   this one function.
   ──────────────────────────────────────────────────────────────────────────── */

export type ImageKey = keyof typeof data.images;

export interface SiteImage {
  src: string;
  alt: string;
  key: ImageKey;
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  hero: ImageKey;
  card: ImageKey;
  collections: string[];
  intro: string;
  body: string;
  features: string[];
  materials: string[];
  colours: string[];
  opacity: string[];
  privacy: string;
  motorisation: string;
  sizing: string;
  installation: string;
  gallery: ImageKey[];
  faqs: { q: string; a: string }[];
}

export interface Collection {
  slug: string;
  name: string;
  blurb: string;
  long: string;
  image: ImageKey;
}

export interface Step {
  n: string;
  title: string;
  text: string;
  image?: ImageKey;
}

export interface Faq {
  q: string;
  a: string;
  tags: string[];
}

export interface GalleryCategory {
  slug: string;
  name: string;
  images: ImageKey[];
}

export interface BeforeAfterPair {
  title: string;
  before: ImageKey;
  after: ImageKey;
  note: string;
}

const images = data.images as Record<string, { id: string; alt: string }>;

/** Build a responsive Unsplash URL. Swap this out for local files when real photography arrives. */
export function imageUrl(key: ImageKey | string, width = 1600, quality = 78): string {
  const entry = images[key as string];
  if (!entry) return '';
  return `https://images.unsplash.com/${entry.id}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

export function image(key: ImageKey | string, width = 1600): SiteImage {
  const entry = images[key as string];
  return {
    src: imageUrl(key, width),
    alt: entry?.alt ?? '',
    key: key as ImageKey,
  };
}

export const products = data.products as unknown as Product[];
export const collections = data.collections as unknown as Collection[];
export const processSteps = data.process as unknown as Step[];
export const manufacturingSteps = data.manufacturing as unknown as Step[];
export const trustCards = data.trust as { title: string; text: string }[];
export const whyCards = data.why as { title: string; text: string }[];
export const galleryCategories = data.galleryCategories as unknown as GalleryCategory[];
export const beforeAfterPairs = data.beforeAfter as unknown as BeforeAfterPair[];
export const faqs = data.faqs as unknown as Faq[];
export const commercialSectors = data.commercialSectors as { title: string; text: string }[];
export const tradePartners = data.tradePartners as { title: string; text: string }[];

export function productBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsInCollection(slug: string): Product[] {
  return products.filter((p) => p.collections.includes(slug));
}

/** Every image used in the gallery, flattened and de-duplicated, with its category. */
export function allGalleryImages(): { key: ImageKey; category: string; categorySlug: string }[] {
  const seen = new Set<string>();
  const out: { key: ImageKey; category: string; categorySlug: string }[] = [];
  for (const cat of galleryCategories) {
    for (const key of cat.images) {
      const id = `${cat.slug}:${key}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ key, category: cat.name, categorySlug: cat.slug });
    }
  }
  return out;
}
