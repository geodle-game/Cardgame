import { CARDS } from '../data/cards.js';

export function rollCoins(rng, kind) {
  if (kind === 'elite') return 40 + Math.floor(rng() * 30);   // 40-70
  if (kind === 'boss')  return 80 + Math.floor(rng() * 40);   // 80-120
  return 12 + Math.floor(rng() * 14);                          // 12-26
}

export function rollCardChoices(rng, count = 3) {
  const pool = Object.keys(CARDS).filter(id => {
    const r = CARDS[id].rarity;
    return r === 'common' || r === 'rare';
  });
  const out = [];
  const copy = pool.slice();
  for (let i = 0; i < count && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
