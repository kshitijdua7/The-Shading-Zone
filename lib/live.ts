import 'server-only';
import { getContent, getSite } from './store';
import defaultContent from './content.json';
import type {
  Product,
  Collection,
  Step,
  Faq,
  GalleryCategory,
  BeforeAfterPair,
  CurtainStyle,
  ImageKey,
} from './content';

/* ────────────────────────────────────────────────────────────────────────────
   LIVE CONTENT for server components.

   Same names as lib/content.ts and lib/site.ts, but every read goes to the
   data store, so edits made in the admin dashboard show on the next request.
   Each export is a thin proxy that resolves to the current stored value.
   ──────────────────────────────────────────────────────────────────────────── */

function live<T extends object>(resolve: () => T): T {
  const target = (Array.isArray(resolve()) ? [] : {}) as T;
  return new Proxy(target, {
    get(_t, prop) {
      const cur = resolve() as Record<string | symbol, unknown>;
      const v = cur[prop];
      return typeof v === 'function' ? (v as Function).bind(cur) : v;
    },
    has: (_t, prop) => prop in (resolve() as object),
    ownKeys: () => Reflect.ownKeys(resolve() as object),
    getOwnPropertyDescriptor(_t, prop) {
      const d = Reflect.getOwnPropertyDescriptor(resolve() as object, prop);
      if (d) d.configurable = true;
      return d;
    },
  });
}

/**
 * Content saved from the dashboard may predate sections added to the site
 * later. Anything it lacks (a whole section, or individual images) comes from
 * the defaults in content.json.
 */
const merged = new WeakMap<object, Record<string, unknown>>();
const c = () => {
  const stored = getContent() as unknown as Record<string, unknown>;
  let out = merged.get(stored);
  if (!out) {
    out = {
      ...defaultContent,
      ...stored,
      images: { ...defaultContent.images, ...(stored.images as object) },
    };
    merged.set(stored, out);
  }
  return out;
};

export const site = live(() => getSite());
export const products = live(() => c().products as Product[]);
export const collections = live(() => c().collections as Collection[]);
export const processSteps = live(() => c().process as Step[]);
export const manufacturingSteps = live(() => c().manufacturing as Step[]);
export const trustCards = live(() => c().trust as { title: string; text: string }[]);
export const whyCards = live(() => c().why as { title: string; text: string }[]);
export const galleryCategories = live(() => c().galleryCategories as GalleryCategory[]);
export const beforeAfterPairs = live(() => c().beforeAfter as BeforeAfterPair[]);
export const faqs = live(() => c().faqs as Faq[]);
export const curtainStyles = live(() => c().curtainStyles as CurtainStyle[]);
export const commercialSectors = live(() => c().commercialSectors as { title: string; text: string }[]);
export const tradePartners = live(() => c().tradePartners as { title: string; text: string }[]);

export function productBySlug(slug: string): Product | undefined {
  return (c().products as Product[]).find((p) => p.slug === slug);
}

export function productsInCollection(slug: string): Product[] {
  return (c().products as Product[]).filter((p) => p.collections.includes(slug));
}

/** Image lookup that also sees images added through the dashboard. */
export function imageUrl(key: ImageKey | string, width = 1600, quality = 78): string {
  if (/^(https?:)?\//.test(key)) return key;
  const entry = (c().images as Record<string, { id: string; alt: string }>)[key];
  if (!entry) return '';
  if (/^(https?:)?\//.test(entry.id)) return entry.id;
  return `https://images.unsplash.com/${entry.id}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

export function image(key: ImageKey | string, width = 1600) {
  const entry = (c().images as Record<string, { id: string; alt: string }>)[key];
  return { src: imageUrl(key, width), alt: entry?.alt ?? '', key: key as ImageKey };
}
