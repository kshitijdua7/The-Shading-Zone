'use client';

/* ────────────────────────────────────────────────────────────────────────────
   LIQUID METAL BUTTON

   The brushed-metal shader button, integrated for The Shading Zone.

   Changes from the original snippet, and why:
   • The shader library is imported dynamically inside the effect rather than at
     module scope. A static import runs during Next's server prerender, where
     `document` does not exist, and takes the whole build down.
   • If WebGL or the shader chunk is unavailable, the button renders as a solid
     metal-gradient pill instead of an empty black capsule. It always works.
   • The label colour was #666666 on a near-black pill — about 3.6:1, below the
     WCAG AA minimum for the size. It is now a warm light grey that passes while
     keeping the engraved look.
   • Width adapts to the label, so "Book a free consultation" is not clipped at
     the fixed 142px of the original.
   • `prefers-reduced-motion` freezes the shader instead of animating it, and the
     ripple is skipped.
   • It renders as a real <button> or a real <a> depending on `href`, so links
     are links and keyboard users get the right semantics either way.
   ──────────────────────────────────────────────────────────────────────────── */

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  /** Render as a link to this route instead of a button. */
  href?: string;
  viewMode?: 'text' | 'icon';
  className?: string;
}

const LABEL_COLOR = '#CFC7BB';

export function LiquidMetalButton({
  label = 'Get Started',
  onClick,
  href,
  viewMode = 'text',
  className,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [shaderReady, setShaderReady] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const shaderRef = useRef<HTMLDivElement>(null);
  // The shader library ships no types for the mount instance.
  const shaderMount = useRef<any>(null);
  const hostRef = useRef<HTMLElement>(null);
  const rippleId = useRef(0);
  const reducedRef = useRef(false);

  const dimensions = useMemo(() => {
    if (viewMode === 'icon') {
      return { width: 48, height: 48, innerWidth: 44, innerHeight: 44 };
    }
    // ~8.1px per uppercase tracked character, plus generous padding.
    const width = Math.max(150, Math.round(label.length * 8.1 + 52));
    return { width, height: 48, innerWidth: width - 4, innerHeight: 44 };
  }, [viewMode, label]);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const styleId = 'sz-liquid-metal-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .sz-shader-canvas canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes sz-ripple {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }`;
      document.head.appendChild(style);
    }

    let cancelled = false;

    (async () => {
      try {
        const mod: any = await import('@paper-design/shaders');
        const ShaderMount = mod.ShaderMount;
        const frag = mod.liquidMetalFragmentShader;
        if (cancelled || !shaderRef.current || !ShaderMount || !frag) return;

        shaderMount.current?.destroy?.();
        shaderMount.current = new ShaderMount(
          shaderRef.current,
          frag,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          reducedRef.current ? 0 : 0.6
        );
        setShaderReady(true);
      } catch {
        // No WebGL / chunk unavailable — the gradient fallback below stands in.
        setShaderReady(false);
      }
    })();

    return () => {
      cancelled = true;
      shaderMount.current?.destroy?.();
      shaderMount.current = null;
    };
  }, []);

  const setSpeed = (v: number) => {
    if (reducedRef.current) return;
    shaderMount.current?.setSpeed?.(v);
  };

  const handleEnter = () => {
    setIsHovered(true);
    setSpeed(1);
  };

  const handleLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    setSpeed(0.6);
  };

  const handleActivate = (e: React.MouseEvent<HTMLElement>) => {
    setSpeed(2.4);
    window.setTimeout(() => setSpeed(isHovered ? 1 : 0.6), 300);

    if (hostRef.current && !reducedRef.current) {
      const rect = hostRef.current.getBoundingClientRect();
      const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rippleId.current++ };
      setRipples((prev) => [...prev, ripple]);
      window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id)), 600);
    }
    onClick?.();
  };

  const shadow = isPressed
    ? '0 0 0 1px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)'
    : isHovered
      ? '0 0 0 1px rgba(0,0,0,0.4), 0 12px 6px rgba(0,0,0,0.05), 0 8px 5px rgba(0,0,0,0.1), 0 4px 4px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.2)'
      : '0 0 0 1px rgba(0,0,0,0.3), 0 36px 14px rgba(0,0,0,0.02), 0 20px 12px rgba(0,0,0,0.08), 0 9px 9px rgba(0,0,0,0.12), 0 2px 5px rgba(0,0,0,0.15)';

  const surface = (
    <>
      {/* Layer 3 — shader / metal surface */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 100,
          boxShadow: shadow,
          transform: isPressed ? 'translateY(1px) scale(0.985)' : 'none',
          transition: 'box-shadow 0.15s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.16,1,0.3,1)',
          overflow: 'hidden',
          background: shaderReady
            ? 'transparent'
            : 'conic-gradient(from 210deg at 30% 20%, #8f8f92, #efeeea 18%, #6c6c70 34%, #cfcdc7 52%, #55555a 68%, #dedcd6 84%, #8f8f92)',
        }}
      >
        <span ref={shaderRef} className="sz-shader-canvas" style={{ position: 'absolute', inset: 0, borderRadius: 100, overflow: 'hidden', display: 'block' }} />
      </span>

      {/* Layer 2 — the dark inner pill the label sits on */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 2,
          top: 2,
          width: dimensions.innerWidth,
          height: dimensions.innerHeight,
          borderRadius: 100,
          background: 'linear-gradient(180deg, #202020 0%, #050505 100%)',
          boxShadow: isPressed ? 'inset 0 2px 4px rgba(0,0,0,0.45)' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
          transform: isPressed ? 'translateY(1px) scale(0.985)' : 'none',
          transition: 'box-shadow 0.15s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      {/* Layer 1 — label */}
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {viewMode === 'icon' ? (
          <Sparkles
            size={17}
            aria-hidden="true"
            style={{ color: LABEL_COLOR, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
          />
        ) : (
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: LABEL_COLOR,
              textShadow: '0 1px 2px rgba(0,0,0,0.65)',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        )}
      </span>

      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
            zIndex: 3,
            animation: 'sz-ripple 0.6s ease-out',
          }}
        />
      ))}
    </>
  );

  const sharedStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: dimensions.width,
    height: dimensions.height,
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
    borderRadius: 100,
    overflow: 'hidden',
    WebkitTapHighlightColor: 'transparent',
  };

  if (href) {
    return (
      <Link
        ref={hostRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={className}
        style={sharedStyle}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={handleActivate}
      >
        {surface}
      </Link>
    );
  }

  return (
    <button
      ref={hostRef as React.RefObject<HTMLButtonElement>}
      type="button"
      className={className}
      style={sharedStyle}
      aria-label={viewMode === 'icon' ? label : undefined}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleActivate}
    >
      {surface}
    </button>
  );
}

export default LiquidMetalButton;
