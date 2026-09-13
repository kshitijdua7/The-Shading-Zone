'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { primaryNav, footerNav, site } from '@/lib/site';
import { cn } from '@/lib/utils';
import Wordmark from './Wordmark';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isHome = pathname === '/';

  /* The bar starts invisible over the hero and materialises as glass after it. */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setOverHero(isHome && y < window.innerHeight * 0.75);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  /* Close on route change. */
  useEffect(() => setOpen(false), [pathname]);

  /* Lock body scroll, trap focus and honour Escape while the menu is open. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const light = overHero && !scrolled;

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxe',
          scrolled ? 'glass border-b border-char-950/8 py-3' : 'py-5',
          light && 'py-6'
        )}
      >
        <div className="shell flex items-center justify-between gap-6">
          <Link
            href="/"
            aria-label="The Shading Zone — home"
            className={cn(
              'shrink-0 transition-colors duration-500',
              light ? 'text-warm-white' : 'text-char-950'
            )}
          >
            <Wordmark
              className={cn(
                'transition-all duration-500',
                scrolled ? 'w-[8.5rem] 2xl:w-[9.5rem]' : 'w-[9.5rem] 2xl:w-[11rem]'
              )}
            />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-5 xl:flex 2xl:gap-7">
            {primaryNav.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'link-draw whitespace-nowrap text-[0.64rem] font-medium uppercase tracking-[0.12em] transition-colors duration-300 2xl:text-[0.68rem] 2xl:tracking-[0.16em]',
                    light ? 'text-warm-white/80 hover:text-warm-white' : 'text-char-700 hover:text-char-950',
                    active && (light ? 'text-warm-white' : 'text-char-950')
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/quote"
              className={cn(
                'hidden lg:inline-flex btn whitespace-nowrap px-5 py-3 min-h-[44px] text-[0.66rem] tracking-[0.16em] 2xl:px-6 2xl:text-[0.72rem] 2xl:tracking-[0.2em]',
                light
                  ? 'border border-warm-white/40 text-warm-white hover:bg-warm-white hover:text-char-950'
                  : 'bg-char-950 text-warm-white hover:bg-brass'
              )}
            >
              Get a free quote
            </Link>

            {/* Hamburger — animated to an X */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className={cn(
                'relative grid h-11 w-11 shrink-0 place-items-center xl:hidden',
                light && !open ? 'text-warm-white' : 'text-char-950'
              )}
            >
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
              <span aria-hidden="true" className="relative block h-4 w-6">
                <span
                  className={cn(
                    'absolute left-0 block h-px w-6 bg-current transition-all duration-400 ease-luxe',
                    open ? 'top-[7px] rotate-45' : 'top-0'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-[7px] block h-px bg-current transition-all duration-300 ease-luxe',
                    open ? 'w-0 opacity-0' : 'w-4 opacity-100'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 block h-px w-6 bg-current transition-all duration-400 ease-luxe',
                    open ? 'top-[7px] -rotate-45' : 'top-[14px]'
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu */}
      <div
        id="site-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          'fixed inset-0 z-40 flex flex-col bg-char-950 text-warm-white transition-[opacity,visibility] duration-500 ease-luxe xl:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <div className="flex-1 overflow-y-auto px-gutter pb-10 pt-28">
          <nav aria-label="All pages">
            <ul className="space-y-1">
              {primaryNav.map((link, i) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{ transitionDelay: open ? `${120 + i * 45}ms` : '0ms' }}
                    className={cn(
                      'block py-2.5 text-display-sm font-semibold uppercase tracking-tight transition-all duration-500 ease-luxe hover:text-brass-light',
                      open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-10 rule bg-warm-white/12" />

          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
            {footerNav
              .filter((l) => !primaryNav.some((p) => p.href === l.href))
              .map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-white/60 transition-colors hover:text-warm-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3">
            <Link href="/quote" className="btn bg-warm-white text-char-950 hover:bg-brass hover:text-white">
              Get a free quote
            </Link>
            <Link href="/consultation" className="btn-light">
              Book a free consultation
            </Link>
          </div>

          <div className="mt-10 space-y-1 text-sm text-warm-white/55">
            <a href={site.contact.phoneHref} className="block link-draw">{site.contact.phone}</a>
            <a href={site.contact.emailHref} className="block link-draw">{site.contact.email}</a>
          </div>
        </div>
      </div>
    </>
  );
}
