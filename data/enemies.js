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
  'fungi-beast': {
    id: 'fungi-beast', name: 'Fungi Beast', hp: 22,
    deck: ['bite', 'spore-burst', 'harden'],
  },
  'slaver': {
    id: 'slaver', name: 'Slaver', hp: 46,
    deck: ['whip', 'entangle', 'whip', 'stab'],
  },
  'acid-slime-m': {
    id: 'acid-slime-m', name: 'Acid Slime (M)', hp: 28,
    deck: ['corrosive-spit', 'lick', 'tackle'],
  },
  'looter': {
    id: 'looter', name: 'Looter', hp: 44,
    deck: ['mug', 'mug', 'smoke-bomb'],
  },
  'the-guardian': {
    id: 'the-guardian', name: 'The Guardian', hp: 120,
    deck: ['guardian-slam', 'guardian-mode', 'guardian-slam', 'guardian-vent'],
  },
};

export const ENCOUNTERS = {
  'act1-basic':     ['jaw-worm', 'louse'],
  'act1-cultist':   ['cultist'],
  'act1-fungi':     ['fungi-beast', 'fungi-beast'],
  'act1-slaver':    ['slaver', 'louse'],
  'act1-slimes':    ['acid-slime-m', 'acid-slime-m', 'louse'],
  'act1-looter':    ['looter'],
  'act1-elite-1':   ['slaver', 'slaver'],
  'act1-elite-2':   ['looter', 'fungi-beast'],
  'act1-boss':      ['the-guardian'],
};

export function getEnemyDef(id) {
  const def = ENEMIES[id];
  if (!def) throw new Error(`Unknown enemy: ${id}`);
  return def;
}
