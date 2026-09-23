export const ENEMIES = {
  'jaw-worm': {
    id: 'jaw-worm', name: 'Jaw Worm', hp: 42,
    moves: [
      { kind: 'attack', amount: 11 },
      { kind: 'block',  amount: 6  },
      { kind: 'attack', amount: 7  },
    ],
  },
  louse: {
    id: 'louse', name: 'Louse', hp: 14,
    moves: [
      { kind: 'attack', amount: 5 },
      { kind: 'attack', amount: 6 },
    ],
  },
  cultist: {
    id: 'cultist', name: 'Cultist', hp: 48,
    moves: [
      { kind: 'attack', amount: 6 },
      { kind: 'heal',   amount: 8 },
      { kind: 'attack', amount: 12 },
    ],
  },
};

export const ENCOUNTERS = {
  'act1-basic': ['jaw-worm', 'louse'],
  'act1-cultist': ['cultist'],
};

export function getEnemyDef(id) {
  const def = ENEMIES[id];
  if (!def) throw new Error(`Unknown enemy: ${id}`);
  return def;
}
