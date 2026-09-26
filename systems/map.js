import { FLOORS, WIDTH, act1Layout } from '../data/maps.js';

export function generateMap(rng) {
  const layout = act1Layout();
  const nodes = [];
  const id = (f, c) => `n_${f}_${c}`;

  // 1. Place nodes per floor, roll types with floor-level variety caps.
  for (let f = 0; f < FLOORS; f++) {
    const weights = layout.floorWeights[f] || { monster: 1 };
    const count = f === FLOORS - 1 ? 1 : (2 + Math.floor(rng() * (WIDTH - 3)));
    const cols = pickColumns(rng, count, WIDTH);

    const types = cols.map(() => weightedPick(rng, weights));
    enforceFloorVariety(types, weights, f, rng);

    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      nodes.push({
        id: id(f, c),
        floor: f,
        col: c,
        type: types[i],
        x: 0, y: 0,
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
      const sorted = nxt.slice().sort((a, b) =>
        Math.abs(a.col - n.col) - Math.abs(b.col - n.col));
      const k = 1 + (rng() < 0.4 ? 1 : 0);
      const targets = sorted.slice(0, Math.min(k, sorted.length));
      for (const t of targets) {
        if (!n.next.includes(t.id)) n.next.push(t.id);
      }
    }

    for (const t of nxt) {
      const hasParent = cur.some(n => n.next.includes(t.id));
      if (!hasParent) {
        const closest = cur.slice().sort((a, b) =>
          Math.abs(a.col - t.col) - Math.abs(b.col - t.col))[0];
        closest.next.push(t.id);
      }
    }
  }

  // 3. Guarantee no path can have more than 2 non-combat nodes in a row.
  enforcePathVariety(nodes, FLOORS);

  // 4. Boss floor: single node, all last-floor nodes connect to it.
  const bossFloor = FLOORS;
  const boss = {
    id: 'boss',
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

// Rewrites types in place so that:
//   - No floor has more than 2 of any non-monster type.
//   - Floors 2-13 have at least 1 monster (except floor 14).
//   - Floor 14 stays all-rest (its weights only contain rest).
function enforceFloorVariety(types, weights, floor, rng) {
  const allowMonster = (weights.monster ?? 0) > 0;

  // 1. Break up non-monster clusters of 3+.
  const counts = {};
  for (const t of types) counts[t] = (counts[t] || 0) + 1;
  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    if (t === 'monster') continue;
    if ((counts[t] || 0) > 2) {
      const candidates = Object.keys(weights).filter(k => {
        if (k === t) return false;
        if ((counts[k] || 0) >= 2) return false;
        return true;
      });
      if (candidates.length) {
        const pick = candidates[Math.floor(rng() * candidates.length)];
        counts[t]--;
        counts[pick] = (counts[pick] || 0) + 1;
        types[i] = pick;
      }
    }
  }

  // 2. Force at least 1 monster on floors 2-13.
  if (allowMonster && floor >= 2 && floor <= 13) {
    if (!types.includes('monster')) {
      const c2 = {};
      for (const t of types) c2[t] = (c2[t] || 0) + 1;
      let replaceAt = -1;
      let bestCount = -1;
      for (let i = 0; i < types.length; i++) {
        if (types[i] === 'monster') continue;
        if (c2[types[i]] > bestCount) {
          bestCount = c2[types[i]];
          replaceAt = i;
        }
      }
      if (replaceAt >= 0) types[replaceAt] = 'monster';
    }
  }
}

// Walks the DAG in floor order and caps the maximum consecutive
// non-combat nodes along ANY path at MAX_STREAK. Any node that would
// push a path past that cap gets converted to a monster.
//
// Floor 14 is a reset: it's always rest (guaranteed pre-boss heal),
// so it neither counts toward the streak nor gets converted.
function enforcePathVariety(nodes, floors) {
  const COMBAT = new Set(['monster', 'elite', 'boss']);
  const RESET_FLOOR = 14;
  const MAX_STREAK = 2;

  // Sort nodes by floor so predecessors are always processed first.
  const byFloor = {};
  for (const n of nodes) {
    byFloor[n.floor] = byFloor[n.floor] || [];
    byFloor[n.floor].push(n);
  }

  const streak = {};

  for (let f = 0; f < floors; f++) {
    for (const node of byFloor[f] || []) {
      if (COMBAT.has(node.type)) {
        streak[node.id] = 0;
        continue;
      }

      if (f === RESET_FLOOR) {
        streak[node.id] = 0;
        continue;
      }

      // Max streak ending at any predecessor.
      let best = 0;
      for (const other of nodes) {
        if (other.floor >= f) continue;
        if (!other.next.includes(node.id)) continue;
        const s = streak[other.id] ?? 0;
        if (s > best) best = s;
      }

      const s = best + 1;
      if (s > MAX_STREAK) {
        node.type = 'monster';
        streak[node.id] = 0;
      } else {
        streak[node.id] = s;
      }
    }
  }
}

function pickColumns(rng, count, width) {
  const cols = [];
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
