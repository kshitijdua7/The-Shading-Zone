import type { Metadata } from 'next';
import { imageUrl, image, galleryCategories } from '@/lib/live';
import Link from 'next/link';
import { PageHero, Section } from '@/components/Section';
import GalleryGrid from '@/components/GalleryGrid';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Living rooms, bedrooms, kitchens, offices, large windows, patio doors, curtains, motorized and commercial projects — window coverings by All Time Solutions.',
  alternates: { canonical: '/gallery' },
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Rooms, transformed."
        lead="Filter by space, click any image to open it full screen, and use “Get this look” when something is close to what you're after."
        image={imageUrl('roomTwoWindows', 2000)}
        alt="A living room with two tall windows and layered light"
      />

      <Section>
        <div className="shell">
          <GalleryGrid
            categories={JSON.parse(JSON.stringify(galleryCategories))}
            images={Object.fromEntries(
              galleryCategories.flatMap((c) => c.images).map((k) => [
                k,
                { thumb: image(k, 900).src, full: imageUrl(k, 2000), alt: image(k).alt },
              ])
            )}
          />

          <div className="reveal mt-24 flex flex-col items-center gap-6 border-t border-char-950/10 pt-16 text-center">
            <p className="max-w-prose text-base leading-relaxed text-stone-600">
              These images show the kind of work window coverings do in a room. Once All Time Solutions
              project photography is available, it drops straight into this gallery — the layout,
              filters and lightbox are already built for it.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/consultation" className="btn-solid">Book a free consultation</Link>
              <Link href="/before-after" className="btn-outline">See before &amp; after</Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
