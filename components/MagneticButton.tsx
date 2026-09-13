'use client';

import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A link that leans very slightly toward the cursor. Pointer-only, disabled for
 * coarse pointers and for reduced-motion users — the button is fully usable
 * without it, this is only polish.
 */
export default function MagneticButton({
  href,
  children,
  className,
  strength = 0.24,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const move = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate3d(0,0,0)';
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={move}
      onMouseLeave={reset}
      onBlur={reset}
      className={cn('transition-transform duration-500 ease-luxe will-change-transform', className)}
    >
      {children}
    </Link>
  );
}
