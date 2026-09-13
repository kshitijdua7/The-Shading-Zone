'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A single, quiet floating call to action.
 *
 * It stays hidden until the visitor is past the first screen, and hides itself
 * entirely on the consultation and quote pages — nobody needs a button to a page
 * they are already on. One CTA, one purpose; the brief asked for a subtle
 * presence, not a pop-up.
 */
export default function FloatingCTA() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  const hiddenOn = ['/consultation', '/quote'];
  const suppressed = hiddenOn.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (suppressed) {
      setShow(false);
      return;
    }
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [suppressed, pathname]);

  if (suppressed) return null;

  return (
    <Link
      href="/consultation"
      className={cn(
        'fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-40',
        'inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-char-950 px-6 py-3.5 text-[0.7rem]',
        'font-semibold uppercase tracking-[0.16em] text-warm-white shadow-lift-lg',
        'transition-all duration-500 ease-luxe hover:bg-brass',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      )}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
    >
      <CalendarCheck className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Free consultation</span>
      <span className="sm:hidden">Free consult</span>
    </Link>
  );
}
