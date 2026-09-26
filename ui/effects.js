// ============================================================
// ui/effects.js
// Procedural SVG combat effects. Every visual is drawn from
// primitives (paths, arcs, lines, circles) recomputed per frame.
// ============================================================

const NS = 'http://www.w3.org/2000/svg';

const TAU = Math.PI * 2;
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const easeOutCubic  = x => 1 - Math.pow(1 - x, 3);
const easeOutQuint  = x => 1 - Math.pow(1 - x, 5);
const easeInCubic   = x => x * x * x;

function ptOnArc(cx, cy, r, theta) {
  return [cx + r * Math.cos(theta), cy + r * Math.sin(theta)];
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ============================================================
// THE CRESCENT
// ============================================================

/**
 * Build an SVG path for a crescent arc.
 *
 *   outer edge follows circle radius (R + t/2)
 *   inner edge follows circle radius (R - t/2)
 *   arc spans [thetaTrail, thetaLead]
 *   local thickness at position s∈[0,1] is:
 *       t(s) = maxT * sin(π * s^1.3)
 *     → 0 at both tips, peak biased ~60% toward leading tip
 */
function crescentPath(cx, cy, R, maxT, thetaTrail, thetaLead, samples = 48) {
  const span = thetaLead - thetaTrail;
  if (Math.abs(span) < 0.008 || maxT < 0.4) return '';

  const outer = [];
  const inner = [];

  for (let i = 0; i <= samples; i++) {
    const s = i / samples;
    const theta = thetaTrail + span * s;
    const profile = Math.sin(Math.PI * Math.pow(s, 1.3));
    const t = maxT * profile;
    outer.push(ptOnArc(cx, cy, R + t * 0.5, theta));
    inner.push(ptOnArc(cx, cy, R - t * 0.5, theta));
  }

  let d = `M${outer[0][0].toFixed(2)} ${outer[0][1].toFixed(2)}`;
  for (let i = 1; i < outer.length; i++) {
    d += `L${outer[i][0].toFixed(2)} ${outer[i][1].toFixed(2)}`;
  }
  for (let i = inner.length - 1; i >= 0; i--) {
    d += `L${inner[i][0].toFixed(2)} ${inner[i][1].toFixed(2)}`;
  }
  d += 'Z';
  return d;
}

const CRESCENT_PALETTES = {
  slash:  { core:'#ffffff', mid:'#ffe4b0', glow:'#ff8a3a' },
  heavy:  { core:'#ffffff', mid:'#ffb8b8', glow:'#ff3030' },
  magic:  { core:'#ffffff', mid:'#d8b8ff', glow:'#8a4aff' },
  pierce: { core:'#ffffff', mid:'#f0f0f0', glow:'#d8d8d8' },
};
CRESCENT_PALETTES.default = CRESCENT_PALETTES.slash;

export function spawnCrescent(cx, cy, opts = {}) {
  const {
    kind = 'slash',
    dirX = 1,
    radius   = 60,
    thickness = 32,
    sweepDeg = 130,
    duration = 470,
  } = opts;

  const pal = CRESCENT_PALETTES[kind] || CRESCENT_PALETTES.slash;

  // --- Angle range --------------------------------------------------------
  // Angles are in SVG space (y-down, so positive = clockwise).
  // Over-the-top arc between two upper corners of the target.
  const jitter = (Math.random() - 0.5) * 0.28;  // ±8°
  const sweep  = sweepDeg * Math.PI / 180;

  const START = dirX >= 0
    ? (-Math.PI * 11 / 12) + jitter     // -165° (upper-left)
    : (-Math.PI *  1 / 12) + jitter;    //  -15° (upper-right)
  const END = START + (dirX >= 0 ? sweep : -sweep);

  // --- Container ----------------------------------------------------------
  const size = (radius + thickness * 3) * 2 + 40;
  const cx0 = size / 2, cy0 = size / 2;

  const svg = svgEl('svg', {
    class: `fx-crescent kind-${kind}`,
    width: size, height: size,
  });
  Object.assign(svg.style, {
    position: 'fixed',
    left: (cx - size / 2) + 'px',
    top:  (cy - size / 2) + 'px',
    pointerEvents: 'none',
    zIndex: 9000,
    overflow: 'visible',
    willChange: 'opacity',
  });

  // --- Defs: gradient along the arc + soft blur for the glow layer --------
  const uid = 'cg' + Math.random().toString(36).slice(2, 8);
  const defs = svgEl('defs');

  const grad = svgEl('linearGradient', {
    id: uid + '_g',
    gradientUnits: 'userSpaceOnUse',
    x1: ptOnArc(cx0, cy0, radius, START)[0],
    y1: ptOnArc(cx0, cy0, radius, START)[1],
    x2: ptOnArc(cx0, cy0, radius, END)[0],
    y2: ptOnArc(cx0, cy0, radius, END)[1],
  });
  [
    [0.00, 'rgba(255,255,255,0)'],
    [0.18, pal.glow],
    [0.55, pal.mid],
    [1.00, pal.core],
  ].forEach(([off, col]) => {
    grad.appendChild(svgEl('stop', {
      offset: off, 'stop-color': col,
    }));
  });
  defs.appendChild(grad);

  const blurFilter = svgEl('filter', {
    id: uid + '_b',
    x: '-50%', y: '-50%', width: '200%', height: '200%',
  });
  blurFilter.appendChild(svgEl('feGaussianBlur', { stdDeviation: '6' }));
  defs.appendChild(blurFilter);

  svg.appendChild(defs);

  // --- Three layered paths: outer glow, mid, core ------------------------
  const glowPath = svgEl('path', {
    fill: pal.glow,
    filter: `url(#${uid}_b)`,
  });
  const midPath  = svgEl('path', { fill: pal.glow });
  const corePath = svgEl('path', { fill: `url(#${uid}_g)` });
  svg.append(glowPath, midPath, corePath);

  document.body.appendChild(svg);

  // --- Animate ------------------------------------------------------------
  const t0 = performance.now();

  function frame(now) {
    const t = (now - t0) / duration;
    if (t >= 1) { svg.remove(); return; }

    let thetaLead, thetaTrail, thicknessEnv, opacity;

    if (t < 0.50) {
      // ─── REVEAL ──────────────────────────────────────────────────────
      // Leading tip accelerates forward; trailing tip anchored at START.
      // Thickness ramps from 0, so the very first frame is a true point.
      const p = easeOutQuint(t / 0.50);
      thetaLead    = START + (END - START) * p;
      thetaTrail   = START;
      thicknessEnv = clamp01(p * 1.9);
      opacity      = clamp01(t / 0.06);
    } else if (t < 0.62) {
      // ─── HOLD ────────────────────────────────────────────────────────
      thetaLead    = END;
      thetaTrail   = START;
      thicknessEnv = 1;
      opacity      = 1;
    } else {
      // ─── DISSOLVE ────────────────────────────────────────────────────
      // Thin and fade — but never rewind the arc, so it reads as
      // the whole crescent dissipating rather than retracting.
      const p = (t - 0.62) / 0.38;
      thetaLead    = END;
      thetaTrail   = START;
      thicknessEnv = 1 - easeInCubic(p) * 0.55;
      opacity      = 1 - p;
    }

    const coreT = thickness * thicknessEnv;
    const midT  = coreT * 1.75;
    const glowT = coreT * 2.75;

    corePath.setAttribute('d', crescentPath(cx0, cy0, radius, coreT, thetaTrail, thetaLead));
    midPath.setAttribute ('d', crescentPath(cx0, cy0, radius, midT,  thetaTrail, thetaLead));
    glowPath.setAttribute('d', crescentPath(cx0, cy0, radius, glowT, thetaTrail, thetaLead));

    corePath.setAttribute('opacity', opacity.toFixed(3));
    midPath.setAttribute ('opacity', (opacity * 0.55).toFixed(3));
    glowPath.setAttribute('opacity', (opacity * 0.30).toFixed(3));

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return svg;
}

// ============================================================
// THE IMPACT BURST
// ============================================================

const BURST_PALETTES = {
  slash:  { core:'#ffffff', mid:'#ffcf7a', glow:'#ff5a20' },
  heavy:  { core:'#ffffff', mid:'#ffb0b0', glow:'#ff2020' },
  magic:  { core:'#ffffff', mid:'#d0a8ff', glow:'#7020ff' },
  pierce: { core:'#ffffff', mid:'#ffffff', glow:'#b0c4d8' },
};
BURST_PALETTES.default = BURST_PALETTES.slash;

export function spawnImpactBurst(cx, cy, opts = {}) {
  const { kind = 'slash', damage = 10 } = opts;
  const pal = BURST_PALETTES[kind] || BURST_PALETTES.slash;

  const size = 320;
  const cx0 = size / 2, cy0 = size / 2;
  const maxR = 32 + Math.min(60, damage * 1.6);

  const svg = svgEl('svg', {
    class: `fx-impact kind-${kind}`,
    width: size, height: size,
  });
  Object.assign(svg.style, {
    position: 'fixed',
    left: (cx - size / 2) + 'px',
    top:  (cy - size / 2) + 'px',
    pointerEvents: 'none',
    zIndex: 8980,
    overflow: 'visible',
  });

  const uid = 'ib' + Math.random().toString(36).slice(2, 8);
  const defs = svgEl('defs');

  // Radial flash gradient
  const rg = svgEl('radialGradient', { id: uid + '_rg' });
  [
    [0.00, pal.core, 1.0],
    [0.25, pal.mid,  0.95],
    [0.55, pal.glow, 0.55],
    [1.00, pal.glow, 0.0],
  ].forEach(([off, col, a]) => {
    rg.appendChild(svgEl('stop', {
      offset: off, 'stop-color': col, 'stop-opacity': a,
    }));
  });
  defs.appendChild(rg);

  // Blur for the glow ring
  const bf = svgEl('filter', {
    id: uid + '_b',
    x: '-50%', y: '-50%', width: '200%', height: '200%',
  });
  bf.appendChild(svgEl('feGaussianBlur', { stdDeviation: '2.5' }));
  defs.appendChild(bf);

  svg.appendChild(defs);

  // Flash core
  const flash = svgEl('circle', {
    cx: cx0, cy: cy0, r: 0,
    fill: `url(#${uid}_rg)`,
  });
  svg.appendChild(flash);

  // Outer glow ring
  const glowRing = svgEl('circle', {
    cx: cx0, cy: cy0, r: 0,
    fill: 'none',
    stroke: pal.core,
    'stroke-width': '3',
    filter: `url(#${uid}_b)`,
  });
  svg.appendChild(glowRing);

  // Inner crisp ring
  const innerRing = svgEl('circle', {
    cx: cx0, cy: cy0, r: 0,
    fill: 'none',
    stroke: pal.mid,
    'stroke-width': '1.4',
  });
  svg.appendChild(innerRing);

  // Radial shards
  const shardCount = kind === 'heavy' ? 14 : 9;
  const shards = [];
  for (let i = 0; i < shardCount; i++) {
    const angle = (i / shardCount) * TAU + (Math.random() - 0.5) * 0.35;
    const line = svgEl('line', {
      stroke: pal.core,
      'stroke-width': kind === 'heavy' ? '3' : '2.2',
      'stroke-linecap': 'round',
      x1: cx0, y1: cy0, x2: cx0, y2: cy0,
      opacity: 0,
    });
    svg.appendChild(line);
    shards.push({
      line, angle,
      reach: 0.55 + Math.random() * 0.55,
      delay: Math.random() * 0.12,
    });
  }

  document.body.appendChild(svg);

  const t0 = performance.now();
  const DURATION = 460;

  function frame(now) {
    const t = (now - t0) / DURATION;
    if (t >= 1) { svg.remove(); return; }

    // Flash core — pops fast, decays
    const fp = easeOutCubic(clamp01(t / 0.35));
    flash.setAttribute('r', (maxR * (0.35 + fp * 0.85)).toFixed(1));
    flash.setAttribute('opacity',
      clamp01(t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88).toFixed(3));

    // Rings — expand outward
    const rp = easeOutQuint(clamp01(t / 0.65));
    const rr = maxR * 1.55 * rp;
    const ro = clamp01(t < 0.08 ? t / 0.08 : 1 - (t - 0.08) / 0.92);
    glowRing.setAttribute('r', rr.toFixed(1));
    glowRing.setAttribute('opacity', (ro * 0.9).toFixed(3));
    innerRing.setAttribute('r', (rr * 0.65).toFixed(1));
    innerRing.setAttribute('opacity', (ro * 0.55).toFixed(3));

    // Shards — draw radially outward
    for (const s of shards) {
      const local = clamp01((t - s.delay) / 0.55);
      const sp = easeOutCubic(local);
      const so = local < 0.05 ? local / 0.05 : 1 - clamp01((local - 0.05) / 0.95);
      const a  = maxR * 0.35;
      const b  = a + maxR * 0.9 * s.reach * sp;
      const cos = Math.cos(s.angle), sin = Math.sin(s.angle);
      s.line.setAttribute('x1', (cx0 + cos * a).toFixed(1));
      s.line.setAttribute('y1', (cy0 + sin * a).toFixed(1));
      s.line.setAttribute('x2', (cx0 + cos * b).toFixed(1));
      s.line.setAttribute('y2', (cy0 + sin * b).toFixed(1));
      s.line.setAttribute('opacity', so.toFixed(3));
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return svg;
}

// ============================================================
// THE SHIELD BURST (replaces block.png)
// ============================================================

export function spawnShieldBurst(cx, cy, opts = {}) {
  const { duration = 1100 } = opts;

  const size = 180;
  const cx0 = size / 2, cy0 = size / 2;

  const svg = svgEl('svg', { class: 'fx-shield', width: size, height: size });
  Object.assign(svg.style, {
    position: 'fixed',
    left: (cx - size / 2) + 'px',
    top:  (cy - size / 2) + 'px',
    pointerEvents: 'none',
    zIndex: 9500,
    overflow: 'visible',
  });

  const uid = 'sh' + Math.random().toString(36).slice(2, 8);
  const defs = svgEl('defs');

  const g = svgEl('linearGradient', {
    id: uid + '_g', x1: '0', y1: '0', x2: '0', y2: '1',
  });
  [
    [0.0, '#bfe4ff'],
    [0.5, '#6fb3ff'],
    [1.0, '#3a7fd0'],
  ].forEach(([off, col]) => {
    g.appendChild(svgEl('stop', { offset: off, 'stop-color': col }));
  });
  defs.appendChild(g);

  const bf = svgEl('filter', {
    id: uid + '_b', x: '-50%', y: '-50%', width: '200%', height: '200%',
  });
  bf.appendChild(svgEl('feGaussianBlur', { stdDeviation: '5' }));
  defs.appendChild(bf);

  svg.appendChild(defs);

  // Shield path — heraldic pointed pentagon
  const shieldD = `
    M ${cx0} ${cy0 - 62}
    L ${cx0 + 52} ${cy0 - 40}
    L ${cx0 + 52} ${cy0 + 6}
    Q ${cx0 + 52} ${cy0 + 54}, ${cx0} ${cy0 + 66}
    Q ${cx0 - 52} ${cy0 + 54}, ${cx0 - 52} ${cy0 + 6}
    L ${cx0 - 52} ${cy0 - 40}
    Z
  `;

  // Soft glow version
  const glow = svgEl('path', {
    d: shieldD, fill: '#6fb3ff', filter: `url(#${uid}_b)`, opacity: 0.55,
  });
  svg.appendChild(glow);

  // Solid shield
  const solid = svgEl('path', {
    d: shieldD, fill: `url(#${uid}_g)`, opacity: 0,
  });
  svg.appendChild(solid);

  // Crisp outline
  const outline = svgEl('path', {
    d: shieldD, fill: 'none',
    stroke: '#dff0ff', 'stroke-width': '2.5', opacity: 0,
  });
  svg.appendChild(outline);

  // Ripple ring
  const ring = svgEl('circle', {
    cx: cx0, cy: cy0, r: 0, fill: 'none',
    stroke: '#6fb3ff', 'stroke-width': '2.5', opacity: 0,
    filter: `url(#${uid}_b)`,
  });
  svg.appendChild(ring);

  document.body.appendChild(svg);

  const t0 = performance.now();
  function frame(now) {
    const t = (now - t0) / duration;
    if (t >= 1) { svg.remove(); return; }

    // Shield rises + fades
    const riseP = easeOutCubic(clamp01(t / 0.35));
    const fade  = clamp01(t < 0.10
      ? t / 0.10
      : 1 - (t - 0.10) / 0.90);
    const rise  = -34 * riseP;

    svg.style.transform = `translateY(${rise.toFixed(1)}px)`;

    solid.setAttribute('opacity', (fade * 0.92).toFixed(3));
    outline.setAttribute('opacity', (fade).toFixed(3));
    glow.setAttribute('opacity', (fade * 0.6).toFixed(3));

    // Ring expands
    const rp = easeOutCubic(clamp01(t / 0.45));
    ring.setAttribute('r', (14 + 60 * rp).toFixed(1));
    ring.setAttribute('opacity', (1 - rp).toFixed(3));

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return svg;
}
