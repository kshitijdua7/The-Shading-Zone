/* ────────────────────────────────────────────────────────────────────────────
   BUILD THE SINGLE-FILE PREVIEW

   Generates one self-contained HTML file from lib/content.json — the same
   source of truth the Next.js app uses — so the preview can never drift from
   the real site's copy.

   Deliberately zero dependencies at runtime: the hero is CSS 3D rather than
   WebGL, and photography degrades to a labelled placeholder if the image host
   is unreachable. The file works opened straight off a disk, with no server,
   no build step and no network.

   Run: npm run preview:build
   ──────────────────────────────────────────────────────────────────────────── */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const data = JSON.parse(await readFile(join(root, 'lib/content.json'), 'utf8'));

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const img = (key, w = 1200, cls = '', extra = '') => {
  const e = data.images[key];
  if (!e) return '';
  return `<img class="ph ${cls}" src="https://images.unsplash.com/${e.id}?auto=format&fit=crop&w=${w}&q=78" alt="${esc(e.alt)}" loading="lazy" decoding="async" ${extra}>`;
};

const CONTACT = {
  phone: '(000) 000-0000',
  email: 'hello@shadingzone.com',
  area: '[Service area — add the cities and regions you cover]',
};

/* ── Fragments ──────────────────────────────────────────────────────────── */

const wordmark = (cls = '') => `
<svg class="wm ${cls}" viewBox="0 0 320 46" role="img" aria-label="The Shading Zone" fill="none">
  <rect x="0.6" y="0.6" width="36.8" height="44.8" rx="1.4" stroke="currentColor" stroke-width="1.2" opacity=".5"/>
  <rect x="5" y="6" width="28" height="4.4" fill="currentColor" opacity=".95"/>
  <rect x="5" y="13" width="28" height="3.6" fill="currentColor" opacity=".8"/>
  <rect x="5" y="19.4" width="28" height="2.8" fill="currentColor" opacity=".62"/>
  <rect x="5" y="25" width="28" height="2" fill="currentColor" opacity=".44"/>
  <rect x="5" y="30" width="28" height="1.3" fill="currentColor" opacity=".28"/>
  <rect x="5" y="34.4" width="28" height=".8" fill="currentColor" opacity=".16"/>
  <text x="52" y="31" fill="currentColor" font-family="Manrope, Helvetica Neue, Arial, sans-serif" font-size="25" font-weight="800" letter-spacing="1.1">SHADING</text>
  <text x="178" y="31" fill="currentColor" font-family="Manrope, Helvetica Neue, Arial, sans-serif" font-size="25" font-weight="300" letter-spacing="4.2" opacity=".78">ZONE</text>
</svg>`;

const NAV = [
  ['home', 'Home'], ['blinds', 'Blinds'], ['curtains', 'Curtains'], ['collections', 'Our Collections'],
  ['about', 'About Us'], ['process', 'Our Process'], ['gallery', 'Gallery'],
  ['consultation', 'Free Consultation'], ['contact', 'Contact'],
];

/* Hero — CSS 3D room, scroll-scrubbed. */
const SLATS = 20;
/* Slats are 40% taller than their slot so they overlap when closed. Rotating in
   perspective foreshortens each one, and without the overlap daylight leaks
   between them at rest — the blind reads as open before you have scrolled. */
const heroSlats = Array.from({ length: SLATS })
  .map(
    (_, i) =>
      `<div class="slat" style="--i:${i};top:${(i / SLATS) * 100 - 100 / SLATS / 5}%;height:${(100 / SLATS) * 1.4}%"></div>`
  )
  .join('');

const hero = `
<section class="hero" id="hero" aria-label="The Shading Zone introduction">
  <div class="hero-pin">
    <div class="stage" aria-hidden="true">
      <div class="room">
        <div class="wall-l"></div><div class="wall-r"></div>
        <div class="ceil"></div><div class="floorr"><div class="lightpool"></div></div>
        <div class="win">
          <div class="view">
            <div class="sky"></div><div class="sun"></div>
            <div class="skyline">${Array.from({ length: 14 }).map((_, i) => `<i style="--h:${28 + ((i * 37) % 46)}%;--w:${5 + ((i * 13) % 7)}%"></i>`).join('')}</div>
            <div class="trees"></div>
          </div>
          <div class="blind">${heroSlats}<div class="headrail"></div></div>
          <div class="frame"></div>
        </div>
        <div class="sofa"></div><div class="chair"></div><div class="tablee"></div>
      </div>
      <div class="vig"></div>
    </div>

    <div class="hero-intro">
      ${wordmark('w-lg')}
      <p class="eyebrow light">Custom blinds · Custom curtains · Custom spaces</p>
    </div>

    <div class="hero-hint"><span class="eyebrow light">Scroll to reveal your view</span><span class="arr">↓</span></div>

    <div class="hero-msg">
      <h1 class="d-lg">Your view. Your light. Your style.</h1>
      <p class="lead-light">Custom blinds and curtains, designed and manufactured for the way you live.</p>
      <div class="btns">
        <a class="btn btn-white" href="#consultation">Book a free consultation</a>
        <a class="btn btn-ghost" href="#collections">Explore our collection</a>
      </div>
    </div>

    <div class="rail"><i id="railFill"></i></div>
  </div>
</section>`;

/* Product cards */
const productCards = data.products
  .map(
    (p, i) => `
<a class="card rv" href="#product-${p.slug}" data-goto="product-${p.slug}">
  <div class="card-img">${img(p.card, 800)}<div class="card-slats"></div><div class="card-scrim"></div>
    <div class="card-cap"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.name)}</h3></div>
  </div>
  <div class="card-foot"><p>${esc(p.tagline)}</p><span class="explore">Explore</span></div>
</a>`
  )
  .join('');

/* Product detail panels (hash-routed) */
const productPages = data.products
  .map(
    (p) => `
<section class="page" id="product-${p.slug}">
  <header class="phero">
    ${img(p.hero, 1800, 'phero-img')}
    <div class="phero-in shell">
      <p class="crumb"><a href="#blinds">Blinds &amp; shades</a> / ${esc(p.name)}</p>
      <h1 class="d-lg">${esc(p.name)}</h1>
      <p class="italic">${esc(p.tagline)}</p>
      <p class="lead-light">${esc(p.intro)}</p>
      <div class="btns"><a class="btn btn-white" href="#consultation">Book free consultation</a><a class="btn btn-ghost" href="#quote">Get a free quote</a></div>
    </div>
  </header>
  <div class="shell sect">
    <div class="two">
      <div><h2 class="d-sm">The detail</h2><p class="body">${esc(p.body)}</p></div>
      <div><h2 class="d-sm">Features</h2><ul class="ticks">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>
    </div>
  </div>
  <div class="band">
    <div class="shell">
      <p class="eyebrow">Specification</p><h2 class="d-md">Everything you choose</h2>
      <div class="specs">
        <div><h3>Fabrics &amp; materials</h3><ul>${p.materials.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>
        <div><h3>Colours</h3><ul>${p.colours.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>
        <div><h3>Opacity &amp; light filtering</h3><ul>${p.opacity.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>
      </div>
      <dl class="defs">
        <div><dt>Privacy</dt><dd>${esc(p.privacy)}</dd></div>
        <div><dt>Motorization</dt><dd>${esc(p.motorisation)}</dd></div>
        <div><dt>Custom sizing</dt><dd>${esc(p.sizing)}</dd></div>
        <div><dt>Installation</dt><dd>${esc(p.installation)}</dd></div>
      </dl>
    </div>
  </div>
  <div class="shell sect">
    <p class="eyebrow">Gallery</p><h2 class="d-md">${esc(p.name)} in rooms</h2>
    <div class="grid4">${p.gallery.map((g) => `<div class="tile">${img(g, 800)}</div>`).join('')}</div>
    <p class="eyebrow" style="margin-top:5rem">Questions</p><h2 class="d-md">Asked and answered</h2>
    <div class="acc">${p.faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
  </div>
</section>`
  )
  .join('');

const collectionStrip = data.collections
  .map(
    (c, i) => `
<div class="cstrip-item rv">
  ${img(c.image, 900)}
  <div class="cstrip-cap">
    <span class="num">${String(i + 1).padStart(2, '0')} / ${String(data.collections.length).padStart(2, '0')}</span>
    <h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p>
  </div>
</div>`
  )
  .join('');

const processList = data.process
  .map(
    (s) => `<li class="rv"><span class="pn">${s.n}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`
  )
  .join('');

const trustCards = data.trust
  .map((c) => `<li class="rv"><span class="tick">✓</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></li>`)
  .join('');

const galleryTiles = data.galleryCategories
  .flatMap((cat) => cat.images.map((k) => ({ k, cat: cat.name, slug: cat.slug })))
  .map((t) => `<figure class="gtile rv" data-cat="${t.slug}">${img(t.k, 800)}<figcaption>${esc(t.cat)}</figcaption></figure>`)
  .join('');

const faqItems = data.faqs
  .map(
    (f) =>
      `<details class="faq" data-q="${esc((f.q + ' ' + f.a + ' ' + (f.tags || []).join(' ')).toLowerCase())}"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`
  )
  .join('');

/* ── Page ───────────────────────────────────────────────────────────────── */

const html = `<title>The Shading Zone</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap">
<style>
:root{
  --ww:#FAF8F5;--w50:#F5F1EB;--w100:#EDE7DE;--w200:#E0D7C9;
  --s400:#A9A199;--s500:#8A8279;--s600:#6B645C;
  --c700:#3A3633;--c800:#262321;--c900:#171514;--c950:#0C0B0A;
  --brass:#B08D57;--brass-l:#C9A87C;
  --luxe:cubic-bezier(.16,1,.3,1);
  --gut:clamp(1.25rem,5vw,5rem);--sect:clamp(4.5rem,10vw,9rem);
}
*{box-sizing:border-box;margin:0;padding:0}
/* .btn sets display:inline-flex, which outranks the UA stylesheet's
   [hidden]{display:none} — without this the quote form's Back and Submit
   buttons stay visible on step one. */
[hidden]{display:none!important}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{background:var(--ww);color:var(--c900);font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;line-height:1.6}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
:focus-visible{outline:2px solid var(--brass);outline-offset:3px}
h1,h2,h3{font-family:Manrope,Helvetica Neue,Arial,sans-serif;text-wrap:balance;line-height:1}
.shell{max-width:110rem;margin-inline:auto;padding-inline:var(--gut);width:100%}
.sect{padding-block:var(--sect)}
.band{background:var(--w50);padding-block:var(--sect)}
.dark{background:var(--c950);color:var(--ww);padding-block:var(--sect)}
.d-xl{font-size:clamp(2.75rem,11vw,11rem);font-weight:800;letter-spacing:-.045em;line-height:.88;text-transform:uppercase}
.d-lg{font-size:clamp(2.25rem,7vw,6rem);font-weight:800;letter-spacing:-.038em;line-height:.92;text-transform:uppercase}
.d-md{font-size:clamp(1.9rem,5vw,4rem);font-weight:800;letter-spacing:-.03em;line-height:.98;text-transform:uppercase;margin-top:1.25rem}
.d-sm{font-size:clamp(1.5rem,3.2vw,2.5rem);font-weight:700;letter-spacing:-.02em;line-height:1.06;text-transform:uppercase}
.eyebrow{font-size:.6875rem;letter-spacing:.34em;text-transform:uppercase;color:var(--s500);font-weight:500}
.eyebrow.light{color:rgba(250,248,245,.6)}
.lead{max-width:38rem;margin-top:1.5rem;color:var(--s600);font-size:1.0625rem;line-height:1.75}
.lead-light{max-width:38rem;margin-top:1.75rem;color:rgba(250,248,245,.75);font-size:1.0625rem;line-height:1.75}
.body{max-width:38rem;margin-top:1.75rem;color:var(--s600);line-height:1.85}
.italic{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-size:1.6rem;color:var(--brass-l);margin-top:1.25rem}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:.9rem 1.75rem;font-size:.72rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;transition:all .3s var(--luxe);cursor:pointer;border:1px solid transparent;white-space:nowrap}
.btn-solid{background:var(--c950);color:var(--ww)}.btn-solid:hover{background:var(--brass)}
.btn-outline{border-color:rgba(12,11,10,.25);color:var(--c900)}.btn-outline:hover{background:var(--c950);color:var(--ww)}
.btn-white{background:var(--ww);color:var(--c950)}.btn-white:hover{background:var(--brass);color:#fff}
.btn-ghost{border-color:rgba(250,248,245,.4);color:var(--ww)}.btn-ghost:hover{background:var(--ww);color:var(--c950)}
.btns{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:2.5rem}
.wm{height:auto;width:11rem}.w-lg{width:min(78vw,30rem)}
.rv{opacity:0;transform:translateY(26px);transition:opacity .9s var(--luxe),transform .9s var(--luxe)}
.rv.in{opacity:1;transform:none}

/* ── Nav ─────────────────────────────────────────────────────────────── */
.nav{position:fixed;inset-inline:0;top:0;z-index:50;padding:1.25rem 0;transition:all .5s var(--luxe)}
.nav.scrolled{background:rgba(250,248,245,.75);backdrop-filter:saturate(180%) blur(18px);border-bottom:1px solid rgba(12,11,10,.08);padding:.75rem 0}
.nav.over{color:var(--ww)}
.nav-in{display:flex;align-items:center;justify-content:space-between;gap:1.5rem}
.nav-links{display:none;gap:1.25rem;align-items:center}
.nav-links a{font-size:.64rem;letter-spacing:.12em;text-transform:uppercase;font-weight:500;white-space:nowrap;opacity:.75;transition:opacity .3s}
.nav-links a:hover,.nav-links a[aria-current]{opacity:1}
@media(min-width:1180px){.nav-links{display:flex}.burger{display:none!important}}
.burger{display:grid;place-items:center;width:44px;height:44px;background:none;border:0;cursor:pointer;color:inherit}
.burger i{display:block;width:22px;height:1px;background:currentColor;margin:3px 0;transition:.4s var(--luxe)}
.menu{position:fixed;inset:0;z-index:49;background:var(--c950);color:var(--ww);padding:7rem var(--gut) 3rem;overflow-y:auto;opacity:0;visibility:hidden;transition:.4s var(--luxe)}
.menu.open{opacity:1;visibility:visible}
.menu a{display:block;padding:.6rem 0;font-family:Manrope,sans-serif;font-size:clamp(1.4rem,6vw,2.2rem);font-weight:700;text-transform:uppercase;letter-spacing:-.02em}
.menu a:hover{color:var(--brass-l)}

/* ── Hero ────────────────────────────────────────────────────────────── */
.hero{height:320vh;background:var(--c950)}
.hero-pin{position:sticky;top:0;height:100svh;overflow:hidden}
.stage{position:absolute;inset:0;perspective:900px;perspective-origin:50% 48%;background:#0B0A09;overflow:hidden}
/* The rotated wall/ceiling/floor planes cannot cover a tall viewport on their
   own — on a phone they leave black bands above and below the window. Painting
   the room container itself in the wall colour fills those gaps. */
.room{position:absolute;inset:0;transform-style:preserve-3d;background:var(--wall,#3a352f);transition:background .1s linear}
.wall-l,.wall-r,.ceil,.floorr{position:absolute;background:var(--wall,#3a352f);transition:background .1s linear}
.wall-l{left:0;top:0;width:34%;height:100%;transform-origin:left center;transform:rotateY(58deg);filter:brightness(.72)}
.wall-r{right:0;top:0;width:34%;height:100%;transform-origin:right center;transform:rotateY(-58deg);filter:brightness(.86)}
.ceil{left:0;top:0;width:100%;height:22%;transform-origin:top center;transform:rotateX(-52deg);filter:brightness(.55)}
.floorr{left:0;bottom:0;width:100%;height:30%;transform-origin:bottom center;transform:rotateX(56deg);background:var(--floor,#5b4630);overflow:hidden}
/* The light pool is masked to roughly the width of the window, so the slat
   shadows fall where the opening actually is rather than across the whole floor. */
.lightpool{position:absolute;inset:0;opacity:var(--open,0);background:repeating-linear-gradient(0deg,rgba(255,244,214,.8) 0 7px,rgba(255,244,214,0) 7px 17px);mix-blend-mode:screen;transform:translateY(-6%);-webkit-mask-image:radial-gradient(58% 78% at 50% 12%,#000 32%,transparent 76%);mask-image:radial-gradient(58% 78% at 50% 12%,#000 32%,transparent 76%)}
.win{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(58%,44rem);aspect-ratio:6/5;transform-style:preserve-3d}
/* A 58%-wide window is a postage stamp on a phone. Fill the width instead —
   the blind cropping past the edges is the more dramatic composition anyway. */
@media(max-width:900px){.win{width:88%;aspect-ratio:5/6}}
@media(max-width:600px){.nav .btn-solid{display:none}}
.view{position:absolute;inset:0;overflow:hidden}
.sky{position:absolute;inset:0;background:linear-gradient(180deg,#BBD3E6 0%,#DCE7EE 42%,#F3E9D9 68%,#EADFCC 100%)}
.sun{position:absolute;right:16%;top:52%;width:52%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(255,246,225,.95),rgba(255,238,205,.35) 38%,rgba(255,238,205,0) 70%)}
.skyline{position:absolute;inset:auto 0 12% 0;height:46%;display:flex;align-items:flex-end;gap:1.4%}
.skyline i{display:block;width:var(--w);height:var(--h);background:rgba(126,142,158,.42)}
.trees{position:absolute;inset:auto 0 0 0;height:14%;background:radial-gradient(circle at 10% 0,rgba(104,124,96,.75) 26%,transparent 27%) repeat-x,linear-gradient(180deg,rgba(96,116,88,.8),rgba(84,102,78,.95));background-size:9% 100%,100% 100%}
.blind{position:absolute;inset:0;transform-style:preserve-3d}
.slat{position:absolute;inset-inline:0;background:linear-gradient(180deg,#F3EEE5,#DCD4C7 55%,#C0B6A6);box-shadow:0 2px 6px rgba(12,11,10,.35);transform-origin:center;transform:rotateX(-14deg);backface-visibility:hidden}
.headrail{position:absolute;inset-inline:-1%;top:-3%;height:5%;background:linear-gradient(180deg,#E9E2D6,#CFC6B7);box-shadow:0 3px 10px rgba(0,0,0,.4)}
.frame{position:absolute;inset:-2.2%;border:10px solid #221E1B;box-shadow:0 30px 80px rgba(0,0,0,.5)}
.sofa,.chair,.tablee{position:absolute;background:var(--furn,#4a443d);transition:background .1s linear}
.sofa{left:12%;bottom:6%;width:30%;height:13%;border-radius:2px;box-shadow:0 20px 40px rgba(0,0,0,.45)}
.chair{right:14%;bottom:8%;width:11%;height:11%;box-shadow:0 16px 32px rgba(0,0,0,.45);filter:brightness(.7)}
.tablee{left:24%;bottom:2%;width:16%;height:3%;filter:brightness(.6)}
.vig{position:absolute;inset:0;pointer-events:none;opacity:var(--vig,.55);background:radial-gradient(120% 95% at 50% 45%,rgba(12,11,10,.22) 22%,rgba(12,11,10,.62) 72%,rgba(12,11,10,.9) 100%),linear-gradient(180deg,rgba(12,11,10,.5),rgba(12,11,10,.1) 26%,rgba(12,11,10,.1) 62%,rgba(12,11,10,.78))}
.hero-intro{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--ww);pointer-events:none;padding-inline:var(--gut)}
.hero-intro .eyebrow{margin-top:2rem}
.hero-hint{position:absolute;left:50%;bottom:2rem;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.6rem;color:rgba(250,248,245,.7);pointer-events:none}
.arr{animation:bob 1.6s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(5px);opacity:1}}
.hero-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--ww);opacity:0;padding-inline:var(--gut)}
.hero-msg h1{max-width:18ch;text-shadow:0 6px 40px rgba(12,11,10,.6)}
.hero-msg .lead-light{color:rgba(250,248,245,.92);text-shadow:0 2px 16px rgba(12,11,10,.85)}
.rail{position:absolute;inset-inline:0;bottom:0;height:2px;background:rgba(255,255,255,.12)}
.rail i{display:block;height:100%;width:100%;transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,rgba(255,255,255,.5),var(--brass-l))}

/* ── Cards / grids ───────────────────────────────────────────────────── */
.grid-cards{display:grid;gap:1.5rem 1.5rem;grid-template-columns:repeat(auto-fill,minmax(min(100%,17rem),1fr));margin-top:5rem}
.card{display:block}
.card-img{position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--w100)}
.card-img img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s var(--luxe)}
.card:hover .card-img img{transform:scale(1.05)}
.card-slats{position:absolute;inset:0;opacity:0;transition:opacity .7s var(--luxe);mix-blend-mode:multiply;background:repeating-linear-gradient(180deg,rgba(12,11,10,.34) 0 5px,rgba(12,11,10,0) 5px 13px)}
.card:hover .card-slats{opacity:1}
.card-scrim{position:absolute;inset:0;background:linear-gradient(0deg,rgba(12,11,10,.78),rgba(12,11,10,.04) 55%,transparent)}
.card-cap{position:absolute;inset-inline:0;bottom:0;padding:1.5rem;color:var(--ww)}
.card-cap h3{font-size:1.35rem;font-weight:700;text-transform:uppercase;margin-top:.4rem;letter-spacing:-.01em}
.num{font-size:.62rem;letter-spacing:.28em;color:rgba(250,248,245,.55)}
.card-foot{display:flex;justify-content:space-between;gap:1.5rem;padding-top:1.1rem}
.card-foot p{font-size:.88rem;color:var(--s600);max-width:26ch}
.explore{font-size:.62rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;white-space:nowrap}
.two{display:grid;gap:4rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr))}
.grid4{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr));margin-top:3rem}
.tile{aspect-ratio:4/5;overflow:hidden;background:var(--w100)}.tile img{width:100%;height:100%;object-fit:cover}
.ticks{list-style:none;margin-top:1.75rem;display:grid;gap:1rem}
.ticks li{position:relative;padding-left:1.75rem;color:var(--s600);font-size:.95rem}
.ticks li::before{content:"✓";position:absolute;left:0;color:var(--brass)}
.specs{display:grid;gap:3rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr));margin-top:4rem}
.specs h3{font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--brass);font-weight:600}
.specs ul{list-style:none;margin-top:1.25rem;border-top:1px solid rgba(12,11,10,.1);padding-top:1.25rem;display:grid;gap:.6rem;color:var(--s600);font-size:.92rem}
.defs{display:grid;gap:2.5rem 3rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));margin-top:4rem;border-top:1px solid rgba(12,11,10,.1);padding-top:3.5rem}
.defs dt{font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--brass);font-weight:600}
.defs dd{margin-top:1rem;color:var(--s600);font-size:.92rem;line-height:1.8;max-width:38rem}
.acc{margin-top:3rem;border-top:1px solid rgba(12,11,10,.1)}
details{border-bottom:1px solid rgba(12,11,10,.1)}
summary{cursor:pointer;padding:1.6rem 0;font-weight:600;font-size:1.05rem;list-style:none;display:flex;justify-content:space-between;gap:1.5rem;align-items:flex-start}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";font-size:1.2rem;color:var(--brass);flex:none}
details[open] summary::after{content:"–"}
details p{padding-bottom:1.75rem;color:var(--s600);max-width:38rem;line-height:1.8;font-size:.95rem}
.cstrip{display:flex;gap:1.25rem;overflow-x:auto;padding:0 var(--gut) 1rem;scroll-snap-type:x mandatory;margin-top:4rem}
.cstrip::-webkit-scrollbar{height:0}
.cstrip-item{position:relative;flex:0 0 auto;width:min(78vw,26rem);aspect-ratio:4/5;overflow:hidden;background:var(--w100);scroll-snap-align:center}
.cstrip-item img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--luxe)}
.cstrip-item:hover img{transform:scale(1.05)}
.cstrip-cap{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:1.75rem;color:var(--ww);background:linear-gradient(0deg,rgba(12,11,10,.85),rgba(12,11,10,.15) 55%,transparent)}
.cstrip-cap h3{font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;text-transform:uppercase;margin:.75rem 0 .5rem}
.cstrip-cap p{font-size:.9rem;color:rgba(250,248,245,.72);max-width:30ch}
.plist{list-style:none;margin-top:4rem;border-top:1px solid rgba(12,11,10,.1)}
.plist li{display:grid;gap:1rem 2.5rem;grid-template-columns:5rem 1fr;padding:2.25rem 0;border-bottom:1px solid rgba(12,11,10,.1)}
.pn{font-family:Manrope,sans-serif;font-size:2.4rem;font-weight:800;color:rgba(12,11,10,.13);line-height:1}
.plist h3{font-size:1rem;text-transform:uppercase;letter-spacing:.02em;font-weight:700}
.plist p{margin-top:.75rem;color:var(--s600);font-size:.95rem;line-height:1.8;max-width:46rem}
.trust{list-style:none;display:grid;gap:3rem 2.5rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr));margin-top:5rem}
.tick{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;border:1px solid rgba(176,141,87,.45);color:var(--brass)}
.trust h3{margin-top:1.5rem;font-size:1rem;text-transform:uppercase;font-weight:700}
.trust p{margin-top:.75rem;color:var(--s600);font-size:.92rem;line-height:1.75;max-width:34ch}
.gwrap{columns:1;column-gap:1rem;margin-top:3rem}
@media(min-width:640px){.gwrap{columns:2}}@media(min-width:1024px){.gwrap{columns:3}}
.gtile{position:relative;break-inside:avoid;margin-bottom:1rem;overflow:hidden;background:var(--w100)}
.gtile img{width:100%;transition:transform 1.1s var(--luxe)}
.gtile:hover img{transform:scale(1.04)}
.gtile figcaption{position:absolute;left:1rem;bottom:1rem;font-size:.6rem;letter-spacing:.24em;text-transform:uppercase;color:var(--ww);opacity:0;transition:.4s;text-shadow:0 2px 8px rgba(0,0,0,.8)}
.gtile:hover figcaption{opacity:1}
.chips{display:flex;gap:.5rem;overflow-x:auto;padding-bottom:.5rem;margin-top:2rem}
.chip{flex:none;min-height:44px;padding:.6rem 1.25rem;border:1px solid rgba(12,11,10,.15);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;font-weight:600;background:none;cursor:pointer;color:var(--s600);transition:.3s}
.chip[aria-pressed=true]{background:var(--c950);border-color:var(--c950);color:var(--ww)}

/* ── Forms ───────────────────────────────────────────────────────────── */
.form{display:grid;gap:1.75rem;max-width:46rem;margin-top:3rem}
.row{display:grid;gap:1.75rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr))}
.field label{display:block;font-size:.68rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--c700);margin-bottom:.6rem}
.field .req{color:var(--brass)}
.field input,.field select,.field textarea{width:100%;min-height:52px;padding:.9rem 1rem;border:1px solid rgba(12,11,10,.15);background:transparent;font:inherit;font-size:.95rem;color:var(--c900)}
.field textarea{min-height:8rem;resize:vertical}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--c950)}
.field .err{color:#b91c1c;font-size:.78rem;margin-top:.5rem;font-weight:500}
.field.bad input,.field.bad select,.field.bad textarea{border-color:#b91c1c}
.opts{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.9rem}
.opts label{display:inline-flex;align-items:center;min-height:46px;padding:.6rem 1.25rem;border:1px solid rgba(12,11,10,.15);font-size:.88rem;cursor:pointer;text-transform:none;letter-spacing:0;font-weight:400;color:var(--c900);margin:0}
.opts input{position:absolute;opacity:0;width:0;height:0}
.opts label:has(:checked){background:var(--c950);border-color:var(--c950);color:var(--ww)}
.errbox{border:1px solid rgba(185,28,28,.4);background:#fef2f2;padding:1.5rem;color:#991b1b;font-size:.9rem}
.errbox ul{margin:.75rem 0 0 1.25rem}
.success{position:relative;overflow:hidden;background:var(--c950);color:var(--ww);text-align:center;padding:var(--sect) var(--gut)}
.success .sl{position:absolute;inset-inline:0;background:var(--c800);border-top:1px solid rgba(250,248,245,.07);transition:transform .9s var(--luxe)}
.success .inner{position:relative;opacity:0;transform:translateY(18px);transition:.7s var(--luxe) .42s}
.success.go .inner{opacity:1;transform:none}
.aside{border:1px solid rgba(12,11,10,.12);background:var(--w50);padding:2.25rem}
.aside h2{font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--brass);font-weight:600}
.aside li{list-style:none;margin-top:1.5rem;color:var(--s600);font-size:.9rem;line-height:1.7}
.aside strong{color:var(--c950)}
.steps{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr));margin-bottom:3rem;list-style:none}
.steps li{display:flex;gap:1rem;align-items:flex-start}
.steps b{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;border:1px solid rgba(12,11,10,.2);font-size:.78rem;color:var(--s400);flex:none}
.steps li.on b{background:var(--c950);border-color:var(--c950);color:var(--ww)}
.steps li.done b{background:var(--brass);border-color:var(--brass);color:#fff}
.steps small{display:block;font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;color:var(--s400)}
.steps span{display:block;margin-top:.25rem;font-size:.88rem;font-weight:600;color:var(--s400)}
.steps li.on span,.steps li.done span{color:var(--c950)}

/* ── CTA / footer ────────────────────────────────────────────────────── */
.cta{position:relative;min-height:88svh;display:grid;place-items:center;overflow:hidden;background:var(--c950);text-align:center;color:var(--ww)}
.cta-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.5}
.cta .glow{position:absolute;left:50%;top:50%;width:70vmax;height:70vmax;transform:translate(-50%,-50%) scale(.6);opacity:0;background:radial-gradient(circle,rgba(255,241,214,.85),rgba(255,232,190,.3) 32%,transparent 68%)}
.cur{position:absolute;inset-block:0;width:52%;background:linear-gradient(90deg,#14120F,#241F1A 42%,#2E2822 78%,#100E0C),repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,rgba(0,0,0,.14) 2px 26px);background-blend-mode:overlay}
.cur.l{left:0;box-shadow:18px 0 60px rgba(0,0,0,.6)}.cur.r{right:0;box-shadow:-18px 0 60px rgba(0,0,0,.6)}
.cta-in{position:relative;z-index:2;padding:var(--sect) var(--gut);display:flex;flex-direction:column;align-items:center;opacity:0}
footer{background:var(--c950);color:var(--ww);padding-block:var(--sect) 3rem}
.fgrid{display:grid;gap:3.5rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr))}
footer h2{font-size:.6875rem;letter-spacing:.34em;text-transform:uppercase;color:rgba(250,248,245,.4);font-weight:500}
footer ul{list-style:none;margin-top:1.5rem;display:grid;gap:.75rem}
footer a{font-size:.9rem;color:rgba(250,248,245,.7)}footer a:hover{color:var(--ww)}
.fbot{margin-top:4rem;padding-top:1.75rem;border-top:1px solid rgba(250,248,245,.1);display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;font-size:.75rem;color:rgba(250,248,245,.4)}
.fab{position:fixed;right:1.25rem;bottom:1.25rem;z-index:40;border-radius:999px;background:var(--c950);color:var(--ww);padding:1rem 1.5rem;font-size:.7rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;box-shadow:0 24px 48px -12px rgba(0,0,0,.4);opacity:0;transform:translateY(24px);pointer-events:none;transition:.5s var(--luxe)}
.fab.show{opacity:1;transform:none;pointer-events:auto}
.page{display:none}.page.active{display:block}
.phero{position:relative;background:var(--c950);color:var(--ww);overflow:hidden}
.phero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.45}
.phero-in{position:relative;padding-block:calc(var(--sect) + 3rem) var(--sect)}
.crumb{font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(250,248,245,.5);margin-bottom:2rem}
.note{max-width:38rem;border-left:2px solid rgba(176,141,87,.5);padding-left:1.25rem;color:var(--s500);font-size:.8rem;line-height:1.7;margin-top:2.5rem}
/* Pinned bottom-left so it never collides with the fixed navigation. */
.banner{position:fixed;left:1rem;bottom:1.25rem;z-index:45;max-width:min(26rem,calc(100vw - 2rem));background:rgba(12,11,10,.82);backdrop-filter:blur(10px);color:rgba(250,248,245,.82);padding:.7rem 1rem;font-size:.7rem;line-height:1.5;border-left:2px solid var(--brass)}
@media(max-width:720px){.banner{display:none}}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
  .rv{opacity:1!important;transform:none!important}
}
</style>

<div class="banner">Interactive preview built from the same content file as the site. The full Next.js codebase — 20 pages, WebGL hero — is in the accompanying zip. <strong>Scroll to open the blinds.</strong></div>

<header class="nav over" id="nav">
  <div class="shell nav-in">
    <a href="#home" data-goto="home" aria-label="The Shading Zone — home">${wordmark()}</a>
    <nav class="nav-links" id="navLinks">${NAV.map(([id, label]) => `<a href="#${id}" data-goto="${id}">${label}</a>`).join('')}</nav>
    <div style="display:flex;gap:.75rem;align-items:center">
      <a class="btn btn-solid" href="#quote" data-goto="quote" style="padding:.75rem 1.25rem;font-size:.66rem">Get a free quote</a>
      <button class="burger" id="burger" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span><i></i><i></i><i></i></span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu">${NAV.map(([id, label]) => `<a href="#${id}" data-goto="${id}">${label}</a>`).join('')}
  <a href="#quote" data-goto="quote">Get a Free Quote</a></div>

<main>
<section class="page active" id="home">
  ${hero}

  <div class="shell sect">
    <div class="two" style="align-items:center">
      <div>
        <p class="eyebrow rv">Introduction</p>
        <h2 class="d-md rv">Window coverings, made your way.</h2>
        <p class="body rv">At The Shading Zone, we believe window coverings should do more than control light. They should transform the way a space looks, feels and functions.</p>
        <p class="body rv">From modern blinds to elegant curtains, we design and manufacture custom solutions tailored to your windows, your style and your lifestyle.</p>
        <div class="btns rv"><a class="btn btn-solid" href="#about" data-goto="about">Discover The Shading Zone</a></div>
      </div>
      <div class="rv" id="wingfx" style="aspect-ratio:4/5;position:relative;overflow:hidden;background:#0C0B0A;perspective:900px">
        <div class="sky" style="position:absolute;inset:0"></div>
        <div class="trees" style="height:26%"></div>
        <div style="position:absolute;inset:0;opacity:var(--o,0);background:radial-gradient(70% 55% at 62% 38%,rgba(255,244,220,.9),transparent 70%)"></div>
        <div style="position:absolute;inset:0;transform-style:preserve-3d">
          ${Array.from({ length: 14 }).map((_, i) => `<div style="position:absolute;inset-inline:0;top:${(i / 14) * 100}%;height:${100 / 14}%;background:linear-gradient(180deg,#F3EEE5,#DCD4C7 55%,#C6BCAC);box-shadow:0 2px 6px rgba(12,11,10,.28);transform:rotateX(calc(var(--o,0) * -74deg))"></div>`).join('')}
        </div>
        <div style="position:absolute;inset:0;border:10px solid #171514"></div>
      </div>
    </div>
  </div>

  <div class="band">
    <div class="shell">
      <p class="eyebrow rv">The range</p>
      <h2 class="d-md rv">Find your perfect shade</h2>
      <p class="lead rv">Ten product families, every one made to the measurements we take at your window.</p>
      <div class="grid-cards">${productCards}</div>
    </div>
  </div>

  <div class="dark">
    <div class="shell">
      <p class="eyebrow light rv">Our collections</p>
      <h2 class="d-md rv">Organised by the way you live</h2>
      <p class="lead-light rv">Six directions, from stripped-back minimal to fully automated.</p>
    </div>
    <div class="cstrip">${collectionStrip}</div>
  </div>

  <div class="shell sect">
    <p class="eyebrow rv">How it works</p>
    <h2 class="d-md rv">From first visit to finished window</h2>
    <ol class="plist">${processList}</ol>
  </div>

  <div class="band">
    <div class="shell">
      <p class="eyebrow rv">Why us</p>
      <h2 class="d-md rv">Why homeowners choose The Shading Zone</h2>
      <p class="lead rv">Everything below is something we actually do. You won't find invented statistics, borrowed awards or made-up reviews anywhere on this site.</p>
      <ul class="trust">${trustCards}</ul>
    </div>
  </div>

  <section class="cta" id="cta">
    ${img('roomFireplace', 2000, 'cta-bg')}
    <div class="glow" id="ctaGlow"></div>
    <div class="cur l" id="curL"></div><div class="cur r" id="curR"></div>
    <div class="cta-in shell" id="ctaIn">
      <h2 class="d-lg">Ready to transform your windows?</h2>
      <p class="lead-light">Let's create something that fits your space perfectly.</p>
      <div class="btns" style="justify-content:center"><a class="btn btn-white" href="#consultation" data-goto="consultation">Book a free consultation</a><a class="btn btn-ghost" href="#quote" data-goto="quote">Get a free quote</a></div>
      <div style="margin-top:4rem;opacity:.55">${wordmark('w-lg')}</div>
    </div>
  </section>
</section>

<section class="page" id="blinds">
  <header class="phero">${img('blindsDaylight', 1800, 'phero-img')}
    <div class="phero-in shell"><p class="eyebrow light">Blinds &amp; shades</p><h1 class="d-lg">Ten ways to control your light.</h1><p class="lead-light">Every product below is cut, assembled and finished to the measurements we take at your window.</p></div>
  </header>
  <div class="shell sect"><div class="grid-cards" style="margin-top:0">${productCards}</div></div>
</section>

${productPages}

<section class="page" id="curtains">
  <header class="phero">${img('curtainFull', 1800, 'phero-img')}
    <div class="phero-in shell"><p class="eyebrow light">Curtains &amp; drapery</p><h1 class="d-lg">Soften the light. Elevate the room.</h1><p class="lead-light">Fabric, header, fullness, lining, length, hardware — every one of them is a decision, and every one changes how the room feels.</p></div>
  </header>
  <div class="shell sect">
    <p class="eyebrow">The moment</p><h2 class="d-md">Watch them open</h2>
    <figure id="curRig" style="position:relative;aspect-ratio:16/9;overflow:hidden;background:#0C0B0A;margin-top:3rem">
      ${img('roomFireplace', 1800)}
      <div class="cur l" id="cr1" style="width:52%"></div><div class="cur r" id="cr2" style="width:52%"></div>
    </figure>
    <div class="grid4" style="margin-top:4rem">${['curtainSheer', 'curtainFull', 'roomDrapery', 'sheerLeaves', 'sampleBook', 'entrance'].map((k) => `<div class="tile">${img(k, 800)}</div>`).join('')}</div>
  </div>
</section>

<section class="page" id="collections">
  <header class="phero">${img('roomFireplace', 1800, 'phero-img')}
    <div class="phero-in shell"><p class="eyebrow light">Our collections</p><h1 class="d-lg">Organised by the way you live.</h1></div>
  </header>
  <div class="shell sect">
    ${data.collections
      .map(
        (c, i) => `<article class="two rv" style="align-items:center;margin-bottom:5rem">
        <figure style="aspect-ratio:4/3;overflow:hidden;background:var(--w100);${i % 2 ? 'order:2' : ''}">${img(c.image, 1200)}</figure>
        <div><p class="num" style="color:var(--brass);letter-spacing:.24em;font-weight:600;font-size:.7rem">${String(i + 1).padStart(2, '0')}</p>
        <h2 class="d-sm" style="margin-top:1rem">${esc(c.name)}</h2><p class="italic" style="color:var(--s500);font-size:1.25rem">${esc(c.blurb)}</p><p class="body">${esc(c.long)}</p></div>
      </article>`
      )
      .join('')}
  </div>
</section>

<section class="page" id="about">
  <header class="phero">${img('roomChairs', 1800, 'phero-img')}
    <div class="phero-in shell"><p class="eyebrow light">About us</p><h1 class="d-lg">We believe every window deserves a better view.</h1><p class="lead-light">The Shading Zone designs, manufactures, supplies and installs custom window coverings. Five things that are usually five different companies — which is exactly why they so often go wrong.</p></div>
  </header>
  <div class="shell sect">
    <div class="two">
      <div><h2 class="d-sm">Our story</h2>
      <p class="body">Most window covering problems are not really about the blind. They are about a measurement somebody took in a hurry, a stock size trimmed to nearly fit, or a fabric chosen from a photograph on a screen instead of held against the wall it has to live beside.</p>
      <p class="body">The Shading Zone exists to remove those handoffs. We measure your windows ourselves. We manufacture to those measurements. We install what we made, and if something needs adjusting a month later, you call the people who made it.</p></div>
      <figure style="aspect-ratio:4/5;overflow:hidden;background:var(--w100)">${img('fabricStack', 1200)}</figure>
    </div>
    <h2 class="d-md" style="margin-top:5rem">Why The Shading Zone?</h2>
    <ul class="trust">${data.why.map((c) => `<li class="rv"><span class="tick">✓</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="page" id="process">
  <header class="phero">${img('woodSlatsLight', 1800, 'phero-img')}
    <div class="phero-in shell"><p class="eyebrow light">Our process</p><h1 class="d-lg">Seven steps. All of them ours.</h1><p class="lead-light">We don't hand you off. The same company consults, measures, designs, manufactures, inspects, installs — and picks up the phone afterwards.</p></div>
  </header>
  <div class="shell sect"><ol class="plist" style="margin-top:0">${processList}</ol>
  <p class="note">How long does it take? It depends on the product, the size of the order and current lead times — so there is no number on this page we can't stand behind for your job. You'll get a specific timeline in writing with your quote.</p></div>
</section>

<section class="page" id="gallery">
  <header class="phero">${img('roomTwoWindows', 1800, 'phero-img')}
    <div class="phero-in shell"><p class="eyebrow light">Gallery</p><h1 class="d-lg">Rooms, transformed.</h1></div>
  </header>
  <div class="shell sect">
    <div class="chips" id="chips"><button class="chip" data-cat="all" aria-pressed="true">All</button>${data.galleryCategories.map((c) => `<button class="chip" data-cat="${c.slug}" aria-pressed="false">${esc(c.name)}</button>`).join('')}</div>
    <div class="gwrap" id="gwrap">${galleryTiles}</div>
  </div>
</section>

<section class="page" id="consultation">
  <header class="phero">${img('roomDrapery', 1800, 'phero-img')}
    <div class="phero-in shell"><p class="eyebrow light">Free consultation</p><h1 class="d-lg">Let's transform your windows.</h1><p class="lead-light">Book your free in-home or virtual consultation. Our specialists will help you choose the right style, material, colour, light control and functionality.</p></div>
  </header>
  <div class="shell sect">
    <div class="two" style="align-items:start">
      <div id="consultWrap">
        <h2 class="d-sm">Book your consultation</h2>
        <p class="lead">Fields marked <span style="color:var(--brass)">*</span> are required.</p>
        <form class="form" id="consultForm" novalidate>
          <div id="consultErr"></div>
          <div class="row">
            <div class="field"><label for="c-name">Full name <span class="req">*</span></label><input id="c-name" name="name" autocomplete="name"><p class="err"></p></div>
            <div class="field"><label for="c-phone">Phone number <span class="req">*</span></label><input id="c-phone" name="phone" type="tel" autocomplete="tel"><p class="err"></p></div>
          </div>
          <div class="row">
            <div class="field"><label for="c-email">Email <span class="req">*</span></label><input id="c-email" name="email" type="email" autocomplete="email"><p class="err"></p></div>
            <div class="field"><label for="c-area">Address or area <span class="req">*</span></label><input id="c-area" name="area"><p class="err"></p></div>
          </div>
          <fieldset style="border:0"><legend class="eyebrow" style="letter-spacing:.16em">Preferred consultation type *</legend>
            <div class="opts" data-group="type">
              <label><input type="radio" name="type" value="In-home">In-home</label>
              <label><input type="radio" name="type" value="Virtual">Virtual</label>
            </div><p class="err" id="typeErr"></p></fieldset>
          <fieldset style="border:0"><legend class="eyebrow" style="letter-spacing:.16em">What are you looking for?</legend>
            <div class="opts">${['Blinds', 'Shades', 'Curtains', 'Motorized', 'Not sure yet'].map((o) => `<label><input type="checkbox" name="interest" value="${o}">${o}</label>`).join('')}</div></fieldset>
          <div class="row">
            <div class="field"><label for="c-win">Number of windows</label><select id="c-win" name="windows"><option value="">Select…</option>${['1', '2–3', '4–6', '7–10', '11–20', 'More than 20', 'Not sure yet'].map((o) => `<option>${o}</option>`).join('')}</select></div>
            <div class="field"><label for="c-date">Preferred date</label><input id="c-date" name="date" type="date"></div>
            <div class="field"><label for="c-time">Preferred time</label><select id="c-time" name="time"><option value="">Select…</option>${['Morning', 'Midday', 'Afternoon', 'Evening', 'Flexible'].map((o) => `<option>${o}</option>`).join('')}</select></div>
          </div>
          <div class="field"><label for="c-more">Additional details</label><textarea id="c-more" name="details" placeholder="Tell us about the rooms, the light, anything you've already ruled in or out…"></textarea></div>
          <div><button class="btn btn-solid" type="submit">Book my free consultation</button>
          <p style="font-size:.75rem;color:var(--s500);margin-top:1.25rem;max-width:38rem">No cost. No obligation. In this preview nothing is sent — in the real build, set one form endpoint in <code>lib/site.ts</code> and it delivers.</p></div>
        </form>
      </div>
      <aside class="aside">
        <h2>What happens next</h2>
        <ul>
          <li><strong>We come to you.</strong> Or meet on a video call. We look at the rooms, the light and how you use the space.</li>
          <li><strong>Samples in your light.</strong> Fabric reads completely differently on your wall than in a book.</li>
          <li><strong>Precise measurements.</strong> We measure every opening ourselves.</li>
          <li><strong>Straight advice.</strong> Including when a simpler or cheaper product suits your windows better.</li>
        </ul>
        <div style="margin-top:2.5rem;border-top:1px solid rgba(12,11,10,.1);padding-top:2rem">
          <p style="font-size:1.1rem;font-weight:600">${CONTACT.phone}</p>
          <p style="font-size:.9rem;color:var(--s600);margin-top:.4rem">${CONTACT.email}</p>
        </div>
      </aside>
    </div>
  </div>
</section>

<section class="page" id="quote">
  <header class="phero">${img('dining', 1800, 'phero-img')}
    <div class="phero-in shell"><p class="eyebrow light">Free quote</p><h1 class="d-lg">Get a free quote.</h1><p class="lead-light">Three steps, a couple of minutes. No obligation. No pressure. Just expert advice.</p></div>
  </header>
  <div class="shell sect" id="quoteWrap">
    <ol class="steps" id="qSteps">
      <li class="on"><b>1</b><div><small>Step 1</small><span>Tell us about your project</span></div></li>
      <li><b>2</b><div><small>Step 2</small><span>Choose your window coverings</span></div></li>
      <li><b>3</b><div><small>Step 3</small><span>We'll contact you with your options</span></div></li>
    </ol>
    <form class="form" id="quoteForm" novalidate>
      <div id="quoteErr"></div>
      <div data-step="0">
        <div class="row">
          <div class="field"><label for="q-name">Name <span class="req">*</span></label><input id="q-name" name="name"><p class="err"></p></div>
          <div class="field"><label for="q-phone">Phone <span class="req">*</span></label><input id="q-phone" name="phone" type="tel"><p class="err"></p></div>
        </div>
        <div class="row" style="margin-top:1.75rem">
          <div class="field"><label for="q-email">Email <span class="req">*</span></label><input id="q-email" name="email" type="email"><p class="err"></p></div>
          <div class="field"><label for="q-win">Number of windows</label><select id="q-win" name="windows"><option value="">Select…</option>${['1', '2–3', '4–6', '7–10', '11–20', 'More than 20', 'Not sure yet'].map((o) => `<option>${o}</option>`).join('')}</select></div>
        </div>
        <fieldset style="border:0;margin-top:1.75rem"><legend class="eyebrow" style="letter-spacing:.16em">Project type *</legend>
          <div class="opts">${['Home', 'New build / renovation', 'Commercial'].map((o) => `<label><input type="radio" name="project" value="${o}">${o}</label>`).join('')}</div><p class="err" id="projErr"></p></fieldset>
      </div>
      <div data-step="1" hidden>
        <fieldset style="border:0"><legend class="eyebrow" style="letter-spacing:.16em">Product interest *</legend>
          <div class="opts">${['Roller shades', 'Zebra shades', 'Roman shades', 'Cellular shades', 'Venetian blinds', 'Vertical blinds', 'Wood & faux wood', 'Panel track', 'Motorized', 'Curtains & drapery', 'Not sure yet'].map((o) => `<label><input type="checkbox" name="product" value="${esc(o)}">${esc(o)}</label>`).join('')}</div><p class="err" id="prodErr"></p></fieldset>
        <div class="field" style="margin-top:1.75rem"><label for="q-meas">Approximate measurements</label><textarea id="q-meas" name="measurements" placeholder="e.g. Living room: 240 × 210 cm"></textarea></div>
      </div>
      <div data-step="2" hidden>
        <div class="field"><label for="q-notes">Notes</label><textarea id="q-notes" name="notes" placeholder="Anything else we should know — deadlines, a look you're after, a window that's given you trouble…"></textarea></div>
        <div class="aside" style="margin-top:1.75rem"><h2>No obligation. No pressure. Just expert advice.</h2>
        <p style="margin-top:1rem;color:var(--s600);font-size:.9rem;line-height:1.7">We'll come back to you with options and what we'd recommend. If the honest answer is that a simpler or cheaper product suits your windows better, that's what we'll tell you.</p></div>
      </div>
      <div style="display:flex;gap:1rem;flex-wrap:wrap">
        <button class="btn btn-outline" type="button" id="qBack" hidden>Back</button>
        <button class="btn btn-solid" type="button" id="qNext">Continue</button>
        <button class="btn btn-solid" type="submit" id="qSubmit" hidden>Request my free quote</button>
      </div>
    </form>
  </div>
</section>

<section class="page" id="faq">
  <header class="phero">${img('blindWhite', 1800, 'phero-img')}
    <div class="phero-in shell"><p class="eyebrow light">FAQ</p><h1 class="d-lg">Questions, answered.</h1><p class="lead-light">Where a question has no honest general answer — timelines, warranty periods, service areas — we say so rather than inventing one.</p></div>
  </header>
  <div class="shell sect" style="max-width:60rem">
    <div class="field" style="max-width:34rem"><label for="faqq">Search questions</label><input id="faqq" type="search" placeholder="Try “blackout”, “motorized”, “warranty”"></div>
    <p id="faqCount" style="font-size:.78rem;color:var(--s500);margin-top:.75rem" aria-live="polite">${data.faqs.length} questions</p>
    <div class="acc" id="faqList" style="margin-top:2.5rem">${faqItems}</div>
  </div>
</section>

<section class="page" id="contact">
  <header class="phero">${img('study', 1800, 'phero-img')}
    <div class="phero-in shell"><p class="eyebrow light">Contact</p><h1 class="d-lg">Let's talk about your windows.</h1></div>
  </header>
  <div class="shell sect">
    <div class="two" style="align-items:start">
      <div>
        <h2 class="d-sm">Get in touch</h2>
        <dl style="margin-top:3rem;display:grid;gap:2.5rem">
          <div><dt class="eyebrow">Phone</dt><dd style="font-size:1.15rem;font-weight:600;margin-top:.5rem">${CONTACT.phone}</dd></div>
          <div><dt class="eyebrow">Email</dt><dd style="font-size:1.15rem;font-weight:600;margin-top:.5rem">${CONTACT.email}</dd></div>
          <div><dt class="eyebrow">Service area</dt><dd style="margin-top:.5rem;color:var(--s600);font-size:.92rem;max-width:38rem">${esc(CONTACT.area)} Send us your address and we'll confirm whether you're inside it.</dd></div>
        </dl>
        <p class="note">Business hours, address, map and social links all live in one config file and appear here the moment they're filled in.</p>
      </div>
      <div>
        <h2 class="d-sm">Send a message</h2>
        <form class="form" id="contactForm" novalidate>
          <div id="contactErr"></div>
          <div class="row">
            <div class="field"><label for="k-name">Name <span class="req">*</span></label><input id="k-name" name="name"><p class="err"></p></div>
            <div class="field"><label for="k-email">Email <span class="req">*</span></label><input id="k-email" name="email" type="email"><p class="err"></p></div>
          </div>
          <div class="field"><label for="k-phone">Phone <span class="req">*</span></label><input id="k-phone" name="phone" type="tel"><p class="err"></p></div>
          <div class="field"><label for="k-msg">Message <span class="req">*</span></label><textarea id="k-msg" name="message"></textarea><p class="err"></p></div>
          <div><button class="btn btn-solid" type="submit">Send message</button></div>
        </form>
      </div>
    </div>
  </div>
</section>
</main>

<footer>
  <div class="shell">
    <div class="fgrid">
      <div>${wordmark()}<p style="margin-top:1.5rem;color:rgba(250,248,245,.55);font-size:.9rem;max-width:20rem">Custom blinds. Custom curtains. Custom spaces.</p>
      <a class="btn btn-ghost" style="margin-top:2rem" href="#consultation" data-goto="consultation">Book a free consultation</a></div>
      <div><h2>Explore</h2><ul>${NAV.slice(1, 6).map(([id, l]) => `<li><a href="#${id}" data-goto="${id}">${l}</a></li>`).join('')}</ul></div>
      <div><h2>Company</h2><ul>${NAV.slice(6).map(([id, l]) => `<li><a href="#${id}" data-goto="${id}">${l}</a></li>`).join('')}<li><a href="#faq" data-goto="faq">FAQ</a></li></ul></div>
      <div><h2>Get in touch</h2><ul><li>${CONTACT.phone}</li><li>${CONTACT.email}</li><li style="color:rgba(250,248,245,.5)">${esc(CONTACT.area)}</li></ul></div>
    </div>
    <div class="fbot"><p>© 2026 The Shading Zone. All rights reserved.</p><p>Privacy Policy · Terms &amp; Conditions</p></div>
  </div>
</footer>

<a class="fab" id="fab" href="#consultation" data-goto="consultation">Free consultation</a>

<script>
(function(){
"use strict";
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};

/* ── Photography fallback ───────────────────────────────────────────────
   If the image host is unreachable (offline, or a sandbox that blocks it),
   swap in a labelled placeholder rather than showing a broken icon.        */
document.querySelectorAll('img.ph').forEach(function(im){
  im.addEventListener('error', function(){
    var d=document.createElement('div');
    d.setAttribute('role','img'); d.setAttribute('aria-label', im.alt||'');
    d.style.cssText='width:100%;height:100%;min-height:180px;display:grid;place-items:center;padding:1.25rem;text-align:center;'+
      'background:linear-gradient(140deg,#EDE7DE,#D9CFC0 45%,#C3B7A4);color:#6B645C;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase';
    d.textContent = im.alt || 'Photography';
    d.className = im.className.replace('ph','');
    if(im.parentNode) im.parentNode.replaceChild(d, im);
  });
});

/* ── Hash routing ──────────────────────────────────────────────────────── */
var pages=[].slice.call(document.querySelectorAll('.page'));
function show(id){
  var target=document.getElementById(id)||document.getElementById('home');
  pages.forEach(function(p){p.classList.toggle('active',p===target)});
  document.querySelectorAll('[data-goto]').forEach(function(a){
    if(a.getAttribute('data-goto')===id) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
  });
  document.getElementById('menu').classList.remove('open');
  document.getElementById('burger').setAttribute('aria-expanded','false');
  window.scrollTo({top:0,behavior:'instant'});
  observeReveals();
  onScroll();
}
function route(){ show((location.hash||'#home').slice(1)); }
addEventListener('hashchange',route);

/* ── Menu ──────────────────────────────────────────────────────────────── */
var burger=document.getElementById('burger'), menu=document.getElementById('menu');
burger.addEventListener('click',function(){
  var open=menu.classList.toggle('open');
  burger.setAttribute('aria-expanded',String(open));
});
addEventListener('keydown',function(e){ if(e.key==='Escape'){menu.classList.remove('open');burger.setAttribute('aria-expanded','false');} });

/* ── Reveals ───────────────────────────────────────────────────────────── */
var io=null;
function observeReveals(){
  if(reduce){document.querySelectorAll('.rv').forEach(function(e){e.classList.add('in')});return;}
  if(!io) io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}})},{rootMargin:'0px 0px -10% 0px',threshold:.08});
  document.querySelectorAll('.page.active .rv:not(.in)').forEach(function(e){io.observe(e)});
}

/* ── Hero scrub ────────────────────────────────────────────────────────── */
var hero=document.getElementById('hero'),
    pin=hero.querySelector('.hero-pin'),
    room=hero.querySelector('.room'),
    stage=hero.querySelector('.stage'),
    intro=hero.querySelector('.hero-intro'),
    hint=hero.querySelector('.hero-hint'),
    msg=hero.querySelector('.hero-msg'),
    railFill=document.getElementById('railFill'),
    vig=hero.querySelector('.vig'),
    slats=[].slice.call(hero.querySelectorAll('.blind .slat')),
    blind=hero.querySelector('.blind');

function paintHero(p){
  var t=function(a,b){return clamp((p-a)/(b-a),0,1)};
  var ease=function(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2};

  /* Camera: translateZ on the room, so walls, window and furniture all move
     together with correct perspective — the CSS equivalent of a dolly.

     The total travel is capped well short of the 900px perspective distance.
     Perspective magnification is P/(P-Z), which runs away as Z approaches P:
     at 880px the window is blown up 45× and the payoff frame is a flat patch of
     sky. 500px lands at a ~2.2× push, where the view still reads as a view. */
  var dolly = ease(t(0,.52))*130 + ease(t(.52,1))*370;
  room.style.transform='translateZ('+dolly+'px) translateY('+(ease(t(.52,1))*3.5)+'%)';

  var tilt=ease(t(.05,.46)), lift=ease(t(.44,.82));
  slats.forEach(function(s,i){
    var stack = lift * (-(i/slats.length)*100 + 2);
    s.style.transform='rotateX('+(-14-64*tilt)+'deg) translateY('+stack+'%) scaleY('+(1-.66*lift)+')';
  });
  blind.style.opacity=String(1-t(.84,.96));

  var light=1-Math.pow(1-t(.08,.6),3);
  stage.style.setProperty('--open',String(light));
  stage.style.setProperty('--wall','hsl(33 '+(12+7*light)+'% '+(24+42*light)+'%)');
  stage.style.setProperty('--floor','hsl(30 '+(26+10*light)+'% '+(16+30*light)+'%)');
  stage.style.setProperty('--furn','hsl(35 8% '+(18+34*light)+'%)');
  vig.style.opacity=String(clamp(.55-t(.15,.6)*.42+t(.68,1)*.64,0,1));

  var io1=t(.02,.2);
  intro.style.opacity=String(1-io1);
  intro.style.transform='translateY('+(io1*-34)+'px) scale('+(1-io1*.06)+')';
  intro.style.filter='blur('+(io1*9)+'px)';
  hint.style.opacity=String(1-t(.005,.06));

  var m=t(.72,.95);
  msg.style.opacity=String(m);
  msg.style.transform='translateY('+((1-m)*30)+'px)';
  msg.style.filter='blur('+((1-m)*7)+'px)';
  msg.style.pointerEvents=m>.9?'auto':'none';
  railFill.style.transform='scaleX('+p+')';
}

/* ── Other scroll-driven pieces ────────────────────────────────────────── */
var wingfx=document.getElementById('wingfx');
var cta=document.getElementById('cta'),curL=document.getElementById('curL'),curR=document.getElementById('curR'),
    ctaGlow=document.getElementById('ctaGlow'),ctaIn=document.getElementById('ctaIn');
var curRig=document.getElementById('curRig'),cr1=document.getElementById('cr1'),cr2=document.getElementById('cr2');
var fab=document.getElementById('fab'),nav=document.getElementById('nav');

function onScroll(){
  var y=scrollY, vh=innerHeight;

  if(nav){
    nav.classList.toggle('scrolled', y>24);
    var onHome=document.getElementById('home').classList.contains('active');
    nav.classList.toggle('over', onHome && y < vh*0.75);
  }
  if(fab) fab.classList.toggle('show', y>vh*0.9);

  if(hero.offsetParent!==null){
    var r=hero.getBoundingClientRect(), travel=r.height-vh;
    paintHero(travel>0?clamp(-r.top/travel,0,1):0);
  }
  if(wingfx&&wingfx.offsetParent!==null){
    var wr=wingfx.getBoundingClientRect();
    wingfx.style.setProperty('--o',String(clamp((vh*.92-wr.top)/(wr.height+vh*.5),0,1)));
  }
  if(cta&&cta.offsetParent!==null){
    var cr=cta.getBoundingClientRect(), cp=clamp((vh-cr.top)/(cr.height+vh),0,1);
    var open=1-Math.pow(1-clamp((cp-.06)/.62,0,1),3);
    curL.style.transform='translate3d('+(-open*102)+'%,0,0)';
    curR.style.transform='translate3d('+(open*102)+'%,0,0)';
    ctaGlow.style.opacity=String(open*.9);
    ctaGlow.style.transform='translate(-50%,-50%) scale('+(.6+open*.75)+')';
    var ct=clamp((cp-.3)/.35,0,1);
    ctaIn.style.opacity=String(ct);
    ctaIn.style.transform='translateY('+((1-ct)*26)+'px)';
  }
  if(curRig&&curRig.offsetParent!==null){
    var qr=curRig.getBoundingClientRect(), qp=clamp((vh*.9-qr.top)/(qr.height*.85+vh*.25),0,1);
    var qe=1-Math.pow(1-qp,3);
    cr1.style.width=(52-qe*38)+'%'; cr1.style.transform='translate3d('+(-qe*14)+'%,0,0)';
    cr2.style.width=(52-qe*38)+'%'; cr2.style.transform='translate3d('+(qe*14)+'%,0,0)';
  }
}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',onScroll);

/* ── Gallery filter ────────────────────────────────────────────────────── */
var chips=document.getElementById('chips');
if(chips){
  chips.addEventListener('click',function(e){
    var b=e.target.closest('.chip'); if(!b) return;
    chips.querySelectorAll('.chip').forEach(function(c){c.setAttribute('aria-pressed',String(c===b))});
    var cat=b.getAttribute('data-cat');
    document.querySelectorAll('#gwrap .gtile').forEach(function(t){
      t.style.display = (cat==='all'||t.getAttribute('data-cat')===cat)?'':'none';
    });
  });
}

/* ── FAQ search ────────────────────────────────────────────────────────── */
var faqq=document.getElementById('faqq');
if(faqq){
  faqq.addEventListener('input',function(){
    var q=faqq.value.trim().toLowerCase(), n=0;
    document.querySelectorAll('#faqList .faq').forEach(function(d){
      var hit=!q||d.getAttribute('data-q').indexOf(q)>-1;
      d.style.display=hit?'':'none'; if(hit)n++;
    });
    document.getElementById('faqCount').textContent = q
      ? n+' '+(n===1?'question matches':'questions match')+' “'+faqq.value+'”'
      : ${data.faqs.length}+' questions';
  });
}

/* ── Forms: validation + confirmation ──────────────────────────────────── */
function setErr(input,msg){
  var f=input.closest('.field'); if(!f) return;
  f.classList.toggle('bad',!!msg);
  var p=f.querySelector('.err'); if(p) p.textContent=msg||'';
  if(msg){input.setAttribute('aria-invalid','true');}else{input.removeAttribute('aria-invalid');}
}
function req(input,label){ var v=input.value.trim(); setErr(input, v?'':label+' is required.'); return !!v; }
function email(input){
  var v=input.value.trim();
  var ok=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(v);
  setErr(input, v?(ok?'':'Enter a valid email address, e.g. name@example.com.'):'Email address is required.');
  return ok;
}
function phone(input){
  var v=input.value.replace(/\\D/g,'');
  var ok=v.length>=7&&v.length<=15;
  setErr(input, input.value.trim()?(ok?'':'Enter a phone number we can reach you on.'):'Phone number is required.');
  return ok;
}
function summary(box,errs){
  if(!errs.length){box.innerHTML='';return;}
  box.innerHTML='<div class="errbox" role="alert" tabindex="-1"><strong>Please check '+errs.length+' '+(errs.length===1?'field':'fields')+'.</strong><ul>'+errs.map(function(e){return '<li>'+e+'</li>'}).join('')+'</ul></div>';
  box.querySelector('.errbox').focus();
}
function succeed(wrap,headline,message){
  var n=9,sl='';
  for(var i=0;i<n;i++) sl+='<div class="sl" style="top:'+((i/n)*100)+'%;height:'+(100/n)+'%;transition-delay:'+(i*55)+'ms"></div>';
  wrap.innerHTML='<div class="success" role="status" aria-live="polite">'+sl+
    '<div class="inner"><p class="eyebrow" style="color:var(--brass-l)">Request received</p>'+
    '<h2 class="d-md">'+headline+'</h2><p class="lead-light" style="margin-inline:auto">'+message+'</p></div></div>';
  var s=wrap.querySelector('.success');
  requestAnimationFrame(function(){
    s.classList.add('go');
    s.querySelectorAll('.sl').forEach(function(el){ el.style.transform='translateY(-104%) scaleY(.2)'; });
  });
}

var cf=document.getElementById('consultForm');
if(cf) cf.addEventListener('submit',function(e){
  e.preventDefault();
  var errs=[];
  if(!req(cf.name,'Full name')) errs.push('Full name is required.');
  if(!phone(cf.phone)) errs.push('A valid phone number is required.');
  if(!email(cf.email)) errs.push('A valid email address is required.');
  if(!req(cf.area,'Address or area')) errs.push('Address or area is required.');
  var t=cf.querySelector('input[name=type]:checked');
  document.getElementById('typeErr').textContent = t?'':'Choose in-home or virtual.';
  if(!t) errs.push('Choose in-home or virtual.');
  summary(document.getElementById('consultErr'),errs);
  if(errs.length) return;
  succeed(document.getElementById('consultWrap'),"We've got you covered.",
    "Thank you — your consultation request is with us. We'll be in touch to confirm a time that works for you.");
});

var kf=document.getElementById('contactForm');
if(kf) kf.addEventListener('submit',function(e){
  e.preventDefault();
  var errs=[];
  if(!req(kf.name,'Name')) errs.push('Name is required.');
  if(!email(kf.email)) errs.push('A valid email address is required.');
  if(!phone(kf.phone)) errs.push('A valid phone number is required.');
  if(!req(kf.message,'Message')) errs.push('Message is required.');
  summary(document.getElementById('contactErr'),errs);
  if(errs.length) return;
  succeed(kf.parentNode,'Message received.',"Thanks for getting in touch — we'll come back to you shortly.");
});

/* Quote: three steps in one form, hidden not unmounted, so nothing is lost. */
var qf=document.getElementById('quoteForm');
if(qf){
  var step=0, panes=[].slice.call(qf.querySelectorAll('[data-step]')),
      back=document.getElementById('qBack'), next=document.getElementById('qNext'),
      submit=document.getElementById('qSubmit'), stepEls=document.querySelectorAll('#qSteps li');
  function render(){
    panes.forEach(function(p,i){p.hidden=i!==step});
    back.hidden=step===0; next.hidden=step===panes.length-1; submit.hidden=step!==panes.length-1;
    stepEls.forEach(function(li,i){ li.classList.toggle('on',i===step); li.classList.toggle('done',i<step); });
  }
  function validate(i){
    var errs=[];
    if(i===0){
      if(!req(qf.name,'Name')) errs.push('Name is required.');
      if(!phone(qf.phone)) errs.push('A valid phone number is required.');
      if(!email(qf.email)) errs.push('A valid email address is required.');
      var pr=qf.querySelector('input[name=project]:checked');
      document.getElementById('projErr').textContent=pr?'':'Choose a project type.';
      if(!pr) errs.push('Choose a project type.');
    }
    if(i===1){
      var any=qf.querySelectorAll('input[name=product]:checked').length;
      document.getElementById('prodErr').textContent=any?'':'Pick at least one product — “not sure yet” counts.';
      if(!any) errs.push('Pick at least one product.');
    }
    summary(document.getElementById('quoteErr'),errs);
    return errs.length===0;
  }
  next.addEventListener('click',function(){ if(validate(step)){ step=Math.min(step+1,panes.length-1); render(); window.scrollTo({top:qf.getBoundingClientRect().top+scrollY-120,behavior:'smooth'});} });
  back.addEventListener('click',function(){ step=Math.max(step-1,0); render(); });
  qf.addEventListener('submit',function(e){
    e.preventDefault();
    if(!validate(0)){step=0;render();return;}
    if(!validate(1)){step=1;render();return;}
    succeed(document.getElementById('quoteWrap'),"We've got you covered.",
      "Your quote request is with us. We'll review what you've sent and come back to you with options.");
  });
  render();
}

/* ── Go ────────────────────────────────────────────────────────────────── */
document.addEventListener('click',function(e){
  var a=e.target.closest('a[href^="#"]'); if(!a) return;
  var id=a.getAttribute('href').slice(1);
  if(document.getElementById(id) && document.getElementById(id).classList.contains('page')){
    e.preventDefault(); if(location.hash!=='#'+id) location.hash=id; else show(id);
  }
});
route();
onScroll();
})();
</script>`;

await writeFile(join(root, 'shading-zone-preview.html'), html, 'utf8');
console.log('Wrote shading-zone-preview.html (' + (html.length / 1024).toFixed(0) + ' KB)');
