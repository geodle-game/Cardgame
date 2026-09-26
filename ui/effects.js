// ============================================================
// ui/effects.js
// Procedural SVG combat effects. The slash and block visuals
// are PNG-based and live in animations.js; only the impact
// burst is built here.
// ============================================================

const NS = 'http://www.w3.org/2000/svg';
const TAU = Math.PI * 2;
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const easeOutCubic = x => 1 - Math.pow(1 - x, 3);
const easeOutQuint = x => 1 - Math.pow(1 - x, 5);

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ============================================================
// IMPACT BURST
// ============================================================

const BURST_PALETTES = {
  slash:  { core: '#ffffff', mid: '#ffcf7a', glow: '#ff5a20' },
  heavy:  { core: '#ffffff', mid: '#ffb0b0', glow: '#ff2020' },
  magic:  { core: '#ffffff', mid: '#d0a8ff', glow: '#7020ff' },
  pierce: { core: '#ffffff', mid: '#ffffff', glow: '#b0c4d8' },
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

  const bf = svgEl('filter', {
    id: uid + '_b',
    x: '-50%', y: '-50%', width: '200%', height: '200%',
  });
  bf.appendChild(svgEl('feGaussianBlur', { stdDeviation: '2.5' }));
  defs.appendChild(bf);

  svg.appendChild(defs);

  const flash = svgEl('circle', {
    cx: cx0, cy: cy0, r: 0,
    fill: `url(#${uid}_rg)`,
  });
  svg.appendChild(flash);

  const glowRing = svgEl('circle', {
    cx: cx0, cy: cy0, r: 0,
    fill: 'none',
    stroke: pal.core,
    'stroke-width': '3',
    filter: `url(#${uid}_b)`,
  });
  svg.appendChild(glowRing);

  const innerRing = svgEl('circle', {
    cx: cx0, cy: cy0, r: 0,
    fill: 'none',
    stroke: pal.mid,
    'stroke-width': '1.4',
  });
  svg.appendChild(innerRing);

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
  const DURATION = 530;

  function frame(now) {
    const t = (now - t0) / DURATION;
    if (t >= 1) { svg.remove(); return; }

    const fp = easeOutCubic(clamp01(t / 0.35));
    flash.setAttribute('r', (maxR * (0.35 + fp * 0.85)).toFixed(1));
    flash.setAttribute('opacity',
      clamp01(t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88).toFixed(3));

    const rp = easeOutQuint(clamp01(t / 0.65));
    const rr = maxR * 1.55 * rp;
    const ro = clamp01(t < 0.08 ? t / 0.08 : 1 - (t - 0.08) / 0.92);
    glowRing.setAttribute('r', rr.toFixed(1));
    glowRing.setAttribute('opacity', (ro * 0.9).toFixed(3));
    innerRing.setAttribute('r', (rr * 0.65).toFixed(1));
    innerRing.setAttribute('opacity', (ro * 0.55).toFixed(3));

    for (const s of shards) {
      const local = clamp01((t - s.delay) / 0.55);
      const sp = easeOutCubic(local);
      const so = local < 0.05 ? local / 0.05 : 1 - clamp01((local - 0.05) / 0.95);
      const a = maxR * 0.35;
      const b = a + maxR * 0.9 * s.reach * sp;
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
