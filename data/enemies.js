export const ENEMIES = {
  'jaw-worm': {
    id: 'jaw-worm', name: 'Jaw Worm', hp: 42,
    deck: ['bite', 'harden', 'chomp', 'bite'],
  },
  louse: {
    id: 'louse', name: 'Louse', hp: 14,
    deck: ['bite', 'spit', 'bite'],
  },
  cultist: {
    id: 'cultist', name: 'Cultist', hp: 48,
    deck: ['ritual', 'dark-strike', 'dark-strike', 'ritual'],
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
