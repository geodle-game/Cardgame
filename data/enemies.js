export const ENEMIES = {
  // -------- Normal --------
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
  slaver: {
    id: 'slaver', name: 'Slaver', hp: 46,
    deck: ['whip', 'entangle', 'whip', 'stab'],
  },
  'acid-slime-m': {
    id: 'acid-slime-m', name: 'Acid Slime (M)', hp: 28,
    deck: ['corrosive-spit', 'lick', 'tackle'],
  },
  'spike-slime': {
    id: 'spike-slime', name: 'Spike Slime', hp: 32,
    deck: ['flame-tackle', 'lick', 'tackle'],
  },
  looter: {
    id: 'looter', name: 'Looter', hp: 44,
    deck: ['mug', 'mug', 'smoke-bomb'],
  },
  'fat-gremlin': {
    id: 'fat-gremlin', name: 'Fat Gremlin', hp: 13,
    deck: ['smash'],
  },
  'mad-gremlin': {
    id: 'mad-gremlin', name: 'Mad Gremlin', hp: 20,
    deck: ['scratch', 'scratch'],
  },
  'shield-gremlin': {
    id: 'shield-gremlin', name: 'Shield Gremlin', hp: 12,
    deck: ['protect', 'shield-bash'],
  },
  'sneaky-gremlin': {
    id: 'sneaky-gremlin', name: 'Sneaky Gremlin', hp: 10,
    deck: ['puncture', 'puncture'],
  },
  chosen: {
    id: 'chosen', name: 'Chosen', hp: 60,
    deck: ['chosen-hex', 'chosen-strike', 'chosen-hex', 'chosen-strike'],
  },
  byrd: {
    id: 'byrd', name: 'Byrd', hp: 26,
    deck: ['peck', 'swoop', 'peck'],
  },
  centurion: {
    id: 'centurion', name: 'Centurion', hp: 76,
    deck: ['slash', 'fury', 'slash', 'shield-bash'],
  },

  // -------- Elites --------
  'gremlin-nob': {
    id: 'gremlin-nob', name: 'Gremlin Nob', hp: 82,
    deck: ['nob-rush', 'nob-skull-bash', 'nob-rush', 'nob-bellow'],
  },
  'lagavulin': {
    id: 'lagavulin', name: 'Lagavulin', hp: 109,
    deck: ['lagavulin-attack', 'lagavulin-siphon', 'lagavulin-attack', 'lagavulin-attack'],
  },
  'book-of-stabbing': {
    id: 'book-of-stabbing', name: 'Book of Stabbing', hp: 160,
    deck: ['multi-stab', 'single-stab', 'multi-stab', 'heavy-stab'],
  },

  // -------- Boss --------
  'the-guardian': {
    id: 'the-guardian', name: 'The Guardian', hp: 140,
    deck: ['guardian-slam', 'guardian-mode', 'guardian-slam', 'guardian-vent'],
  },
  'hexaghost': {
    id: 'hexaghost', name: 'Hexaghost', hp: 180,
    deck: ['hexaghost-divider', 'hexaghost-sear', 'hexaghost-inflame', 'hexaghost-tackle'],
  },
  'slime-boss': {
    id: 'slime-boss', name: 'Slime Boss', hp: 140,
    deck: ['slime-goop', 'slime-prep', 'slime-slam', 'slime-goop'],
  },
};

export const ENCOUNTERS = {
  // Normal
  'act1-basic':     ['jaw-worm', 'louse'],
  'act1-cultist':   ['cultist'],
  'act1-fungi':     ['fungi-beast', 'fungi-beast'],
  'act1-slaver':    ['slaver', 'louse'],
  'act1-slimes':    ['acid-slime-m', 'acid-slime-m', 'louse'],
  'act1-spike':     ['spike-slime', 'louse'],
  'act1-looter':    ['looter'],
  'act1-gremlins':  ['fat-gremlin', 'mad-gremlin', 'shield-gremlin', 'sneaky-gremlin'],
  'act1-chosen':    ['chosen', 'byrd'],
  'act1-byrd':      ['byrd', 'byrd', 'byrd'],
  'act1-centurion': ['centurion', 'louse'],

  // Elites
  'act1-elite-1':   ['gremlin-nob'],
  'act1-elite-2':   ['lagavulin'],
  'act1-elite-3':   ['book-of-stabbing'],
  'act1-elite-4':   ['slaver', 'slaver'],

  // Bosses
  'act1-boss':      ['the-guardian'],
  'act1-boss-2':    ['hexaghost'],
  'act1-boss-3':    ['slime-boss'],
};

export function getEnemyDef(id) {
  const def = ENEMIES[id];
  if (!def) throw new Error(`Unknown enemy: ${id}`);
  return def;
}
