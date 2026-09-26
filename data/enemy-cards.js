import { liveDamage, liveAoE } from './cards.js';
import { BOSSES } from './bosses/index.js';

export const ENEMY_CARDS = {
  // ============================================================
  // NORMAL ENEMIES
  // ============================================================
  bite: {
    id: 'bite', name: 'Bite', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 11 damage.{live}',
    effects: [{ kind: 'damage', amount: 11 }],
    liveValues: liveDamage(11),
  },
  chomp: {
    id: 'chomp', name: 'Chomp', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 7 damage.{live}',
    effects: [{ kind: 'damage', amount: 7 }],
    liveValues: liveDamage(7),
  },
  harden: {
    id: 'harden', name: 'Harden', cost: 1, owner: 'enemy',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 6 Block.',
    effects: [{ kind: 'block', amount: 6 }],
  },
  spit: {
    id: 'spit', name: 'Spit', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 5 damage.{live} Apply 1 Weak.',
    effects: [
      { kind: 'damage', amount: 5 },
      { kind: 'applyStatus', status: 'weak', amount: 1 },
    ],
    liveValues: liveDamage(5),
  },
  ritual: {
    id: 'ritual', name: 'Ritual', cost: 1, owner: 'enemy',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 2 Strength.',
    effects: [{ kind: 'applyStatus', status: 'strength', amount: 2 }],
  },
  'dark-strike': {
    id: 'dark-strike', name: 'Dark Strike', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 12 damage.{live}',
    effects: [{ kind: 'damage', amount: 12 }],
    liveValues: liveDamage(12),
  },
  lick: {
    id: 'lick', name: 'Lick', cost: 1, owner: 'enemy',
    type: 'skill', target: 'player', destination: 'discard',
    text: 'Apply 1 Weak.',
    effects: [{ kind: 'applyStatus', status: 'weak', amount: 1 }],
  },
  'spore-burst': {
    id: 'spore-burst', name: 'Spore Burst', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage.{live} Apply 2 Weak.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'applyStatus', status: 'weak', amount: 2 },
    ],
    liveValues: liveDamage(6),
  },
  whip: {
    id: 'whip', name: 'Whip', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 8 damage.{live} Apply 1 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 8 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 1 },
    ],
    liveValues: liveDamage(8),
  },
  stab: {
    id: 'stab', name: 'Stab', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage.{live}',
    effects: [{ kind: 'damage', amount: 6 }],
    liveValues: liveDamage(6),
  },
  entangle: {
    id: 'entangle', name: 'Entangle', cost: 1, owner: 'enemy',
    type: 'skill', target: 'player', destination: 'discard',
    text: 'Apply 2 Weak.',
    effects: [{ kind: 'applyStatus', status: 'weak', amount: 2 }],
  },
  'corrosive-spit': {
    id: 'corrosive-spit', name: 'Corrosive Spit', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 7 damage.{live} Apply 2 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 7 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 2 },
    ],
    liveValues: liveDamage(7),
  },
  tackle: {
    id: 'tackle', name: 'Tackle', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 8 damage.{live}',
    effects: [{ kind: 'damage', amount: 8 }],
    liveValues: liveDamage(8),
  },
  'flame-tackle': {
    id: 'flame-tackle', name: 'Flame Tackle', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage.{live} Add a Burn to your discard pile.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'addCardToPlayerDiscard', cardId: 'burn' },
    ],
    liveValues: liveDamage(6),
  },
  mug: {
    id: 'mug', name: 'Mug', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 10 damage.{live}',
    effects: [{ kind: 'damage', amount: 10 }],
    liveValues: liveDamage(10),
  },
  'smoke-bomb': {
    id: 'smoke-bomb', name: 'Smoke Bomb', cost: 1, owner: 'enemy',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 6 Block.',
    effects: [{ kind: 'block', amount: 6 }],
  },
  smash: {
    id: 'smash', name: 'Smash', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 5 damage.{live} Apply 1 Weak.',
    effects: [
      { kind: 'damage', amount: 5 },
      { kind: 'applyStatus', status: 'weak', amount: 1 },
    ],
    liveValues: liveDamage(5),
  },
  scratch: {
    id: 'scratch', name: 'Scratch', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 4 damage.{live}',
    effects: [{ kind: 'damage', amount: 4 }],
    liveValues: liveDamage(4),
  },
  protect: {
    id: 'protect', name: 'Protect', cost: 1, owner: 'enemy',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 7 Block.',
    effects: [{ kind: 'block', amount: 7 }],
  },
  'shield-bash': {
    id: 'shield-bash', name: 'Shield Bash', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage.{live}',
    effects: [{ kind: 'damage', amount: 6 }],
    liveValues: liveDamage(6),
  },
  puncture: {
    id: 'puncture', name: 'Puncture', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 3 damage.{live} Apply 1 Weak.',
    effects: [
      { kind: 'damage', amount: 3 },
      { kind: 'applyStatus', status: 'weak', amount: 1 },
    ],
    liveValues: liveDamage(3),
  },
  'chosen-hex': {
    id: 'chosen-hex', name: 'Hex', cost: 1, owner: 'enemy',
    type: 'skill', target: 'player', destination: 'discard',
    text: 'Shuffle a Dazed into your draw pile.',
    effects: [{ kind: 'addCardToPlayerDraw', cardId: 'dazed' }],
  },
  'chosen-strike': {
    id: 'chosen-strike', name: 'Chosen Strike', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage.{live} Apply 1 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 1 },
    ],
    liveValues: liveDamage(6),
  },
  peck: {
    id: 'peck', name: 'Peck', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 4 damage.{live}',
    effects: [{ kind: 'damage', amount: 4 }],
    liveValues: liveDamage(4),
  },
  swoop: {
    id: 'swoop', name: 'Swoop', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 12 damage.{live}',
    effects: [{ kind: 'damage', amount: 12 }],
    liveValues: liveDamage(12),
  },
  slash: {
    id: 'slash', name: 'Slash', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 9 damage.{live}',
    effects: [{ kind: 'damage', amount: 9 }],
    liveValues: liveDamage(9),
  },
  fury: {
    id: 'fury', name: 'Fury', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage twice.{live}',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'damage', amount: 6 },
    ],
    liveValues: (s, ctx) => {
      if (!ctx?.attacker || !ctx?.target) return { live: '' };
      const per = liveDamage(6)(s, ctx).live;
      if (!per) return { live: '' };
      return { live: `${per.replace(')', '')} each)` };
    },
  },

  // ============================================================
  // ELITES
  // ============================================================
  'nob-rush': {
    id: 'nob-rush', name: 'Rush', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 14 damage.{live}',
    effects: [{ kind: 'damage', amount: 14 }],
    liveValues: liveDamage(14),
  },
  'nob-skull-bash': {
    id: 'nob-skull-bash', name: 'Skull Bash', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage.{live} Apply 2 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 2 },
    ],
    liveValues: liveDamage(6),
  },
  'nob-bellow': {
    id: 'nob-bellow', name: 'Bellow', cost: 1, owner: 'enemy',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 3 Strength.',
    effects: [{ kind: 'applyStatus', status: 'strength', amount: 3 }],
  },
  'lagavulin-attack': {
    id: 'lagavulin-attack', name: 'Lagavulin Strike', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 18 damage.{live}',
    effects: [{ kind: 'damage', amount: 18 }],
    liveValues: liveDamage(18),
  },
  'lagavulin-siphon': {
    id: 'lagavulin-siphon', name: 'Siphon Soul', cost: 1, owner: 'enemy',
    type: 'skill', target: 'player', destination: 'discard',
    text: 'Apply 2 Weak and 2 Vulnerable.',
    effects: [
      { kind: 'applyStatus', status: 'weak', amount: 2 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 2 },
    ],
  },
  'multi-stab': {
    id: 'multi-stab', name: 'Multi-Stab', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage twice.{live}',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'damage', amount: 6 },
    ],
    liveValues: (s, ctx) => {
      if (!ctx?.attacker || !ctx?.target) return { live: '' };
      const per = liveDamage(6)(s, ctx).live;
      if (!per) return { live: '' };
      return { live: `${per.replace(')', '')} each)` };
    },
  },
  'single-stab': {
    id: 'single-stab', name: 'Stab', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 8 damage.{live}',
    effects: [{ kind: 'damage', amount: 8 }],
    liveValues: liveDamage(8),
  },
  'heavy-stab': {
    id: 'heavy-stab', name: 'Heavy Stab', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 14 damage.{live}',
    effects: [{ kind: 'damage', amount: 14 }],
    liveValues: liveDamage(14),
  },

  // ============================================================
  // ACT BOSSES
  // ============================================================
  'guardian-slam': {
    id: 'guardian-slam', name: 'Slam', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 16 damage.{live}',
    effects: [{ kind: 'damage', amount: 16 }],
    liveValues: liveDamage(16),
  },
  'guardian-mode': {
    id: 'guardian-mode', name: 'Defensive Mode', cost: 1, owner: 'enemy',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 20 Block. Gain 3 Strength.',
    effects: [
      { kind: 'block', amount: 20 },
      { kind: 'applyStatus', status: 'strength', amount: 3 },
    ],
  },
  'guardian-vent': {
    id: 'guardian-vent', name: 'Vent Steam', cost: 1, owner: 'enemy',
    type: 'skill', target: 'player', destination: 'discard',
    text: 'Apply 2 Weak and 2 Vulnerable.',
    effects: [
      { kind: 'applyStatus', status: 'weak', amount: 2 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 2 },
    ],
  },
  'hexaghost-divider': {
    id: 'hexaghost-divider', name: 'Divider', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal damage equal to half your max HP.',
    effects: [{ kind: 'damagePercentMaxHp', percent: 0.5 }],
  },
  'hexaghost-sear': {
    id: 'hexaghost-sear', name: 'Sear', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 5 damage.{live} Add a Burn to your discard pile.',
    effects: [
      { kind: 'damage', amount: 5 },
      { kind: 'addCardToPlayerDiscard', cardId: 'burn' },
    ],
    liveValues: liveDamage(5),
  },
  'hexaghost-inflame': {
    id: 'hexaghost-inflame', name: 'Inflame', cost: 1, owner: 'enemy',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 2 Strength.',
    effects: [{ kind: 'applyStatus', status: 'strength', amount: 2 }],
  },
  'hexaghost-tackle': {
    id: 'hexaghost-tackle', name: 'Tackle', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 4 damage twice.{live}',
    effects: [
      { kind: 'damage', amount: 4 },
      { kind: 'damage', amount: 4 },
    ],
    liveValues: (s, ctx) => {
      if (!ctx?.attacker || !ctx?.target) return { live: '' };
      const per = liveDamage(4)(s, ctx).live;
      if (!per) return { live: '' };
      return { live: `${per.replace(')', '')} each)` };
    },
  },
  'slime-goop': {
    id: 'slime-goop', name: 'Goop Spray', cost: 1, owner: 'enemy',
    type: 'skill', target: 'player', destination: 'discard',
    text: 'Shuffle 2 Slimed into your draw pile.',
    effects: [
      { kind: 'addCardToPlayerDraw', cardId: 'slimed' },
      { kind: 'addCardToPlayerDraw', cardId: 'slimed' },
    ],
  },
  'slime-prep': {
    id: 'slime-prep', name: 'Prepare', cost: 1, owner: 'enemy',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 10 Block.',
    effects: [{ kind: 'block', amount: 10 }],
  },
  'slime-slam': {
    id: 'slime-slam', name: 'Slam', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 24 damage.{live}',
    effects: [{ kind: 'damage', amount: 24 }],
    liveValues: liveDamage(24),
  },
};

// Merge boss-specific cards into ENEMY_CARDS.
for (const bossModule of BOSSES) {
  if (bossModule.CARDS) {
    Object.assign(ENEMY_CARDS, bossModule.CARDS);
  }
}

export const ENEMY_ADDED_CARDS = {
  slimed: {
    id: 'slimed', name: 'Slimed', cost: 1, rarity: 'status',
    type: 'status', target: 'none', destination: 'exhaust',
    text: 'Play: lose 1 Energy. Exhaust.',
    effects: [{ kind: 'loseEnergy', amount: 1 }],
  },
};
