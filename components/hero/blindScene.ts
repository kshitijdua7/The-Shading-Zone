/* ────────────────────────────────────────────────────────────────────────────
   THE BLIND ROOM — a scroll-scrubbed Three.js scene.

   A luxury room with a floor-to-ceiling window covered by a slatted blind.
   Driven entirely by a single `progress` value in [0,1] handed down from the
   page scroll, so it is deterministic, scrubbable in both directions, and never
   fights the browser's own scrolling.

   The choreography, in order:
     0.00 → 0.28   camera dollies toward the window; slats begin to tilt
     0.28 → 0.60   slats rotate fully open; daylight floods the room
     0.60 → 0.86   the blind lifts and stacks at the head of the window
     0.86 → 1.00   the camera moves through the opening; the view fills the frame

   No external assets — the view beyond the window is drawn procedurally to a
   canvas, so the whole scene ships in the JS bundle and there is nothing to
   wait on before the first frame.
   ──────────────────────────────────────────────────────────────────────────── */

import * as THREE from 'three';

export interface BlindScene {
  setProgress: (p: number) => void;
  resize: () => void;
  dispose: () => void;
  start: () => void;
  stop: () => void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Normalised progress across a sub-range of the master timeline. */
const range = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** The world beyond the glass: sky gradient, a low skyline, a treeline. */
function createViewTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d')!;

  const sky = ctx.createLinearGradient(0, 0, 0, 1024);
  sky.addColorStop(0, '#BBD3E6');
  sky.addColorStop(0.42, '#DCE7EE');
  sky.addColorStop(0.68, '#F3E9D9');
  sky.addColorStop(1, '#EADFCC');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1024, 1024);

  // Sun glow, low and to the right.
  const glow = ctx.createRadialGradient(760, 610, 8, 760, 610, 420);
  glow.addColorStop(0, 'rgba(255,246,225,0.95)');
  glow.addColorStop(0.35, 'rgba(255,238,205,0.42)');
  glow.addColorStop(1, 'rgba(255,238,205,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1024, 1024);

  // Far skyline — soft, hazy, deliberately unremarkable so it reads as "a view".
  const far = [
    [40, 690, 78, 200], [130, 640, 62, 250], [205, 700, 96, 190], [315, 610, 70, 280],
    [400, 668, 110, 222], [525, 636, 58, 254], [598, 704, 88, 186], [700, 654, 74, 236],
    [790, 690, 104, 200], [905, 646, 82, 244],
  ];
  ctx.fillStyle = 'rgba(150,166,180,0.34)';
  far.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));

  const near = [
    [0, 748, 120, 180], [150, 782, 92, 146], [268, 762, 138, 166], [432, 796, 104, 132],
    [560, 756, 126, 172], [712, 790, 96, 138], [832, 764, 150, 164],
  ];
  ctx.fillStyle = 'rgba(120,136,152,0.4)';
  near.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));

  // Treeline along the base.
  ctx.fillStyle = 'rgba(104,124,96,0.55)';
  for (let x = -40; x < 1080; x += 34) {
    const r = 30 + Math.sin(x * 0.31) * 13;
    ctx.beginPath();
    ctx.arc(x, 928 + Math.cos(x * 0.19) * 10, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(92,110,86,0.7)';
  ctx.fillRect(0, 952, 1024, 72);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBlindScene(
  canvas: HTMLCanvasElement,
  opts: { lite?: boolean } = {}
): BlindScene {
  const lite = opts.lite ?? false;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lite,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  if (!lite) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0B0A09');

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 60);
  camera.position.set(0, 0.05, 5.4);

  /* ── Room ──────────────────────────────────────────────────────────────
     Built from individual planes rather than an inverted box, because the back
     wall needs a real aperture in it. A closed box would leave the view plane
     hidden behind solid geometry and the whole reveal would land on a blank
     wall — the blind would open onto nothing.                                */
  const ROOM_W = 8.2;
  const ROOM_H = 5.0;
  const ROOM_D = 12.0;
  const WINDOW_Z = -4.4;
  const HW = ROOM_W / 2;
  const HH = ROOM_H / 2;

  const WIN_W = 5.2;
  const WIN_H = 4.35;
  const WIN_CY = -0.1; // window centre, slightly below eye level

  const wallMat = new THREE.MeshStandardMaterial({ color: '#DCD3C6', roughness: 0.97, metalness: 0 });

  const addPlane = (
    w: number,
    h: number,
    pos: [number, number, number],
    rot: [number, number, number],
    mat: THREE.Material = wallMat
  ) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.receiveShadow = !lite;
    scene.add(m);
    return m;
  };

  // Warm oak floor.
  const floor = addPlane(
    ROOM_W,
    ROOM_D,
    [0, -HH, WINDOW_Z + ROOM_D / 2],
    [-Math.PI / 2, 0, 0],
    new THREE.MeshStandardMaterial({ color: '#A88A66', roughness: 0.72, metalness: 0 })
  );

  addPlane(ROOM_W, ROOM_D, [0, HH, WINDOW_Z + ROOM_D / 2], [Math.PI / 2, 0, 0]); // ceiling
  addPlane(ROOM_D, ROOM_H, [-HW, 0, WINDOW_Z + ROOM_D / 2], [0, Math.PI / 2, 0]); // left wall
  addPlane(ROOM_D, ROOM_H, [HW, 0, WINDOW_Z + ROOM_D / 2], [0, -Math.PI / 2, 0]); // right wall

  // Back wall, in four pieces framing the window aperture.
  const winTop = WIN_CY + WIN_H / 2;
  const winBottom = WIN_CY - WIN_H / 2;
  const headerH = HH - winTop;
  const sillH = winBottom + HH;
  const jambW = HW - WIN_W / 2;

  const backWall: THREE.Mesh[] = [];
  if (headerH > 0.01) backWall.push(addPlane(ROOM_W, headerH, [0, winTop + headerH / 2, WINDOW_Z], [0, 0, 0]));
  if (sillH > 0.01) backWall.push(addPlane(ROOM_W, sillH, [0, -HH + sillH / 2, WINDOW_Z], [0, 0, 0]));
  if (jambW > 0.01) {
    backWall.push(addPlane(jambW, WIN_H, [-WIN_W / 2 - jambW / 2, WIN_CY, WINDOW_Z], [0, 0, 0]));
    backWall.push(addPlane(jambW, WIN_H, [WIN_W / 2 + jambW / 2, WIN_CY, WINDOW_Z], [0, 0, 0]));
  }
  // The back wall blocks the sun, so daylight only reaches the floor through the
  // aperture — which is what produces the slat shadows once the blind opens.
  if (!lite) backWall.forEach((m) => (m.castShadow = true));

  /* The view sits well behind the glass and is much larger than the aperture,
     so it reads as a real outside with depth and parallax rather than a picture
     painted on the window. `toneMapped: false` keeps it bright and saturated —
     it is meant to be the light source of the composition, not part of the
     room's exposure. */
  const viewTex = createViewTexture();
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 11),
    new THREE.MeshBasicMaterial({ map: viewTex, toneMapped: false })
  );
  view.position.set(0, 0.4, WINDOW_Z - 6.5);
  scene.add(view);

  const frameMat = new THREE.MeshStandardMaterial({ color: '#2B2724', roughness: 0.55, metalness: 0.25 });
  const frameParts: [number, number, number, number, number][] = [
    // w, h, d, x, y
    [WIN_W + 0.3, 0.14, 0.16, 0, -0.1 + WIN_H / 2 + 0.06],
    [WIN_W + 0.3, 0.14, 0.16, 0, -0.1 - WIN_H / 2 - 0.06],
    [0.14, WIN_H + 0.3, 0.16, -WIN_W / 2 - 0.06, -0.1],
    [0.14, WIN_H + 0.3, 0.16, WIN_W / 2 + 0.06, -0.1],
    // No centre mullion: the camera travels straight through the middle of this
    // opening, and a post there would sit dead-centre in the final frame.
  ];
  frameParts.forEach(([w, h, d, x, y]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);
    m.position.set(x, y, WINDOW_Z + 0.02);
    scene.add(m);
  });

  /* ── Furniture: silhouettes only, purely for scale and depth ──────────── */
  const furnMat = new THREE.MeshStandardMaterial({ color: '#B9B0A4', roughness: 0.95 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#514B44', roughness: 0.9 });

  const sofa = new THREE.Group();
  const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.42, 1.0), furnMat);
  sofaBase.position.y = -ROOM_H / 2 + 0.34;
  const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.62, 0.22), furnMat);
  sofaBack.position.set(0, -ROOM_H / 2 + 0.82, -0.39);
  sofa.add(sofaBase, sofaBack);
  sofa.position.set(-1.35, 0, WINDOW_Z + 2.9);
  sofa.children.forEach((c) => { (c as THREE.Mesh).castShadow = !lite; (c as THREE.Mesh).receiveShadow = !lite; });
  scene.add(sofa);

  const chair = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.78), darkMat);
  chair.position.set(2.15, -ROOM_H / 2 + 0.39, WINDOW_Z + 2.2);
  chair.rotation.y = -0.42;
  chair.castShadow = !lite;
  scene.add(chair);

  const table = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.12, 0.7), darkMat);
  table.position.set(-1.2, -ROOM_H / 2 + 0.42, WINDOW_Z + 4.05);
  table.castShadow = !lite;
  scene.add(table);

  /* ── The blind ─────────────────────────────────────────────────────────
     Slats are children of a group so the whole assembly can lift as one,
     while each slat tilts and compresses individually.                     */
  const SLATS = lite ? 13 : 24;
  const SLAT_GAP = WIN_H / SLATS;
  const HEAD_Y = -0.1 + WIN_H / 2;

  const blind = new THREE.Group();
  const slatMat = new THREE.MeshStandardMaterial({
    color: '#EFE9DF',
    roughness: 0.88,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const slatGeo = new THREE.BoxGeometry(WIN_W - 0.12, SLAT_GAP * 1.16, 0.022);

  const slats: THREE.Mesh[] = [];
  for (let i = 0; i < SLATS; i++) {
    const s = new THREE.Mesh(slatGeo, slatMat);
    s.userData.baseY = HEAD_Y - SLAT_GAP * (i + 0.5);
    s.userData.index = i;
    s.position.set(0, s.userData.baseY, WINDOW_Z + 0.16);
    s.castShadow = !lite;
    blind.add(s);
    slats.push(s);
  }

  // Headrail — stays put while the slats stack beneath it.
  const headrail = new THREE.Mesh(
    new THREE.BoxGeometry(WIN_W + 0.06, 0.17, 0.13),
    new THREE.MeshStandardMaterial({ color: '#E4DCD0', roughness: 0.7, metalness: 0.1 })
  );
  headrail.position.set(0, HEAD_Y + 0.09, WINDOW_Z + 0.16);
  headrail.castShadow = !lite;
  blind.add(headrail);
  scene.add(blind);

  /* ── Lighting ──────────────────────────────────────────────────────────
     Everything except the faint interior fill ramps with progress, so the
     room genuinely darkens and brightens rather than cross-fading a filter. */
  const ambient = new THREE.AmbientLight('#9AA6B2', 0.62);
  scene.add(ambient);

  // A warm lamp in the room, so the opening frame reads as a dim luxury interior
  // rather than a black rectangle. It fades out as daylight takes over.
  const interiorFill = new THREE.PointLight('#FFD2A0', 9.5, 16, 2);
  interiorFill.position.set(2.1, 0.9, WINDOW_Z + 5.2);
  scene.add(interiorFill);

  // Second, cooler bounce from deeper in the room for a little modelling.
  const backFill = new THREE.PointLight('#C7D4E0', 4.0, 14, 2);
  backFill.position.set(-2.4, 1.6, WINDOW_Z + 8.0);
  scene.add(backFill);

  const sun = new THREE.DirectionalLight('#FFF0D6', 0);
  sun.position.set(2.6, 4.2, WINDOW_Z - 6.5);
  sun.target.position.set(-0.8, -ROOM_H / 2, WINDOW_Z + 4.2);
  scene.add(sun.target);
  if (!lite) {
    sun.castShadow = true;
    // The slats move every frame, so the shadow map re-renders every frame too.
    // 1536² keeps the slat shadows crisp without making that per-frame cost silly.
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 30;
    sun.shadow.camera.left = -9;
    sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 8;
    sun.shadow.camera.bottom = -8;
    sun.shadow.bias = -0.0009;
    sun.shadow.normalBias = 0.02;
  }
  scene.add(sun);

  const skyBounce = new THREE.HemisphereLight('#CFE0EC', '#8A6E4E', 0);
  scene.add(skyBounce);

  /* ── Timeline ──────────────────────────────────────────────────────────── */
  let target = 0;
  let current = 0;
  let raf = 0;
  let running = false;

  /* Framing depends on the viewport shape.

     A 5.2 × 4.35 window cannot be framed head-on in a phone's ~0.46 aspect
     without either cropping it or showing acres of ceiling and floor around it.
     Widening the field of view makes that worse, not better — it adds vertical
     coverage the room cannot fill. So on portrait we narrow the lens and start
     the camera closer: the blind fills the frame edge to edge and overflows
     horizontally, which is the more dramatic composition on a phone anyway. */
  let startZ = 5.4;
  let midZ = 3.15;
  let endZ = WINDOW_Z + 2.6;

  function applyFraming(aspect: number) {
    if (aspect < 0.85) {
      camera.fov = 46;
      startZ = WINDOW_Z + 6.4;
      midZ = WINDOW_Z + 5.0;
      endZ = WINDOW_Z + 3.2;
    } else if (aspect < 1.2) {
      camera.fov = 50;
      startZ = WINDOW_Z + 8.6;
      midZ = WINDOW_Z + 6.6;
      endZ = WINDOW_Z + 2.9;
    } else {
      camera.fov = 44;
      startZ = 5.4;
      midZ = 3.15;
      endZ = WINDOW_Z + 2.6;
    }
  }

  function apply(p: number) {
    /* Camera, in two movements.

       First half: a slow, restrained approach. The blind opening is the event
       here, so the camera barely moves — a single easeInOut across the whole
       timeline covered most of the distance while the blind was still shut,
       which threw the viewer at the glass before anything had happened.

       Second half: the real push, through the opening, once the blind is up. */
    const approach = easeInOut(range(p, 0, 0.52));
    const through = easeInOut(range(p, 0.52, 1));
    let z = lerp(startZ, midZ, approach);
    z = lerp(z, endZ, through);
    camera.position.z = z;
    camera.position.y = lerp(0.06, -0.02, through);
    camera.position.x = lerp(0.26, 0, easeOut(range(p, 0, 0.7)));
    camera.lookAt(0, lerp(0.0, 0.12, through), WINDOW_Z - 2);

    // Slat tilt — the blind "opens" before it lifts, exactly as a real one does.
    const tilt = easeInOut(range(p, 0.05, 0.46));
    // Lift — slats travel up and compress into a stack under the headrail.
    const lift = easeInOut(range(p, 0.44, 0.82));

    for (const s of slats) {
      const i = s.userData.index as number;
      const baseY = s.userData.baseY as number;
      // Starts very slightly tilted, so even "closed" the slat edges catch a
      // little light and read as a blind rather than a flat panel.
      s.rotation.x = lerp(-0.14, -1.34, tilt);

      const stackY = HEAD_Y - 0.055 - i * 0.022;
      s.position.y = lerp(baseY, stackY, lift);
      // Slats thin out visually as they compress, so the stack doesn't read as a slab.
      s.scale.y = lerp(1, 0.34, lift);
    }

    // Light ramps: sharp once the slats are past halfway open.
    const lightRamp = easeOut(range(p, 0.08, 0.6));
    sun.intensity = lerp(0, 3.6, lightRamp);
    skyBounce.intensity = lerp(0, 1.5, lightRamp);
    ambient.intensity = lerp(0.62, 0.9, lightRamp);
    interiorFill.intensity = lerp(9.5, 1.2, lightRamp);
    backFill.intensity = lerp(4.0, 0.4, lightRamp);
    renderer.toneMappingExposure = lerp(0.98, 1.24, lightRamp);

    // The walls warm as daylight reaches them.
    wallMat.color.setHSL(
      0.093,
      lerp(0.12, 0.19, lightRamp),
      lerp(0.55, 0.84, lightRamp)
    );

    /* Fade the blind out as the camera reaches the glass, so the last frame is
       pure view. Toggling `transparent` needs `needsUpdate` — three.js compiles
       a different shader program for transparent materials, and without the flag
       the opacity change is silently ignored. */
    const vanish = range(p, 0.84, 0.96);
    const wantsTransparent = vanish > 0 && vanish < 1;
    if (slatMat.transparent !== wantsTransparent) {
      slatMat.transparent = wantsTransparent;
      slatMat.needsUpdate = true;
    }
    slatMat.opacity = 1 - vanish;
    blind.visible = vanish < 0.995;
  }

  // Dev aid: append ?szdebug to the URL to inspect the timeline from the console.
  if (typeof window !== 'undefined' && window.location.search.includes('szdebug')) {
    (window as unknown as Record<string, unknown>).__szScene = {
      state: () => ({ target, current, camZ: camera.position.z, slat0Y: slats[0].position.y, rot: slats[0].rotation.x, running }),
    };
  }

  /* Smoothing is time-based, not per-frame. A fixed `current += delta * 0.14`
     converges in a fixed number of FRAMES, which means the scene crawls behind
     the scroll on any device that can't hold 60fps — a software renderer, an
     older laptop, a phone under load. This reaches the target in ~0.35s of wall
     clock time whatever the frame rate. */
  const SMOOTH_SECONDS = 0.35;
  let lastT = 0;

  function frame(now: number) {
    if (!running) return;
    const dt = lastT ? Math.min((now - lastT) / 1000, 0.25) : 1 / 60;
    lastT = now;

    const k = 1 - Math.pow(0.001, dt / SMOOTH_SECONDS);
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.0004) current = target;

    apply(current);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    applyFraming(camera.aspect);
    camera.updateProjectionMatrix();
    apply(current);
    renderer.render(scene, camera);
  }

  resize();
  apply(0);
  renderer.render(scene, camera);

  return {
    setProgress: (p: number) => {
      target = clamp01(p);
      if (!running) {
        // Reduced-motion / paused: jump straight there, render one frame.
        current = target;
        apply(current);
        renderer.render(scene, camera);
      }
    },
    resize,
    start: () => {
      if (running) return;
      running = true;
      lastT = 0;
      raf = requestAnimationFrame(frame);
    },
    stop: () => {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose: () => {
      running = false;
      cancelAnimationFrame(raf);
      viewTex.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
    },
  };
}
