import { FLOORS, WIDTH, act1Layout } from '../data/maps.js';

export function generateMap(rng) {
  const layout = act1Layout();
  const nodes = [];
  const id = (f, c) => `n_${f}_${c}`;

  // 1. Place nodes per floor.
  for (let f = 0; f < FLOORS; f++) {
    const weights = layout.floorWeights[f] || { monster: 1 };
    const count = f === FLOORS - 1 ? 1 : (2 + Math.floor(rng() * (WIDTH - 3)));
    // Pick columns spaced out across the width
    const cols = pickColumns(rng, count, WIDTH);
    for (const c of cols) {
      const type = weightedPick(rng, weights);
      nodes.push({
        id: id(f, c),
        floor: f,
        col: c,
        type,
        x: 0, y: 0,       // filled in at render time
        next: [],
      });
    }
  }

  // 2. Connect each node to 1-2 nodes on the next floor.
  const byFloor = {};
  for (const n of nodes) {
    byFloor[n.floor] = byFloor[n.floor] || [];
    byFloor[n.floor].push(n);
  }

  for (let f = 0; f < FLOORS - 1; f++) {
    const cur = byFloor[f];
    const nxt = byFloor[f + 1];
    if (!cur || !nxt) continue;

    for (const n of cur) {
      // Prefer the next-floor nodes closest in column, pick 1 or 2
      const sorted = nxt.slice().sort((a, b) =>
        Math.abs(a.col - n.col) - Math.abs(b.col - n.col));
      const k = 1 + (rng() < 0.4 ? 1 : 0);
      const targets = sorted.slice(0, Math.min(k, sorted.length));
      for (const t of targets) {
        if (!n.next.includes(t.id)) n.next.push(t.id);
      }
    }

    // Guarantee every next-floor node has at least one parent
    for (const t of nxt) {
      const hasParent = cur.some(n => n.next.includes(t.id));
      if (!hasParent) {
        const closest = cur.slice().sort((a, b) =>
          Math.abs(a.col - t.col) - Math.abs(b.col - t.col))[0];
        closest.next.push(t.id);
      }
    }
  }

  // 3. Boss floor: single node, all last-floor nodes connect to it.
  const bossFloor = FLOORS; // 1 past the last regular floor
  const boss = {
    id: `boss`,
    floor: bossFloor,
    col: Math.floor(WIDTH / 2),
    type: 'boss',
    x: 0, y: 0,
    next: [],
  };
  nodes.push(boss);
  const topRegular = nodes.filter(n => n.floor === FLOORS - 1);
  for (const n of topRegular) n.next.push(boss.id);

  return {
    floors: FLOORS + 1,
    width: WIDTH,
    nodes,
    bossId: boss.id,
  };
}

function pickColumns(rng, count, width) {
  const cols = [];
  // Reserve slots across the width, then jitter
  const step = width / count;
  for (let i = 0; i < count; i++) {
    const base = Math.floor(i * step + step / 2);
    const jitter = Math.floor(rng() * 2) - 1;
    const c = Math.max(0, Math.min(width - 1, base + jitter));
    if (!cols.includes(c)) cols.push(c);
  }
  return cols;
}

function weightedPick(rng, weights) {
  const keys = Object.keys(weights);
  const total = keys.reduce((s, k) => s + weights[k], 0);
  let r = rng() * total;
  for (const k of keys) {
    r -= weights[k];
    if (r <= 0) return k;
  }
  return keys[0];
}

export function getNode(map, nodeId) {
  return map.nodes.find(n => n.id === nodeId);
}

export function reachableFrom(map, nodeId) {
  const node = getNode(map, nodeId);
  if (!node) return [];
  return node.next.map(id => getNode(map, id)).filter(Boolean);
}

export function startingNodes(map) {
  return map.nodes.filter(n => n.floor === 0);
}
