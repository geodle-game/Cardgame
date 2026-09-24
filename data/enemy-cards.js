export const ENEMY_CARDS = {
  // -------- Normal enemies --------
  bite: {
    id: 'bite', name: 'Bite', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 11 damage.',
    effects: [{ kind: 'damage', amount: 11 }],
  },
  chomp: {
    id: 'chomp', name: 'Chomp', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 7 damage.',
    effects: [{ kind: 'damage', amount: 7 }],
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
    text: 'Deal 5 damage. Apply 1 Weak.',
    effects: [
      { kind: 'damage', amount: 5 },
      { kind: 'applyStatus', status: 'weak', amount: 1 },
    ],
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
    text: 'Deal 12 damage.',
    effects: [{ kind: 'damage', amount: 12 }],
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
    text: 'Deal 6 damage. Apply 2 Weak.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'applyStatus', status: 'weak', amount: 2 },
    ],
  },
  whip: {
    id: 'whip', name: 'Whip', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 8 damage. Apply 1 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 8 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 1 },
    ],
  },
  stab: {
    id: 'stab', name: 'Stab', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage.',
    effects: [{ kind: 'damage', amount: 6 }],
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
    text: 'Deal 7 damage. Apply 2 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 7 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 2 },
    ],
  },
  tackle: {
    id: 'tackle', name: 'Tackle', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 8 damage.',
    effects: [{ kind: 'damage', amount: 8 }],
  },
  'flame-tackle': {
    id: 'flame-tackle', name: 'Flame Tackle', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage. Add a Burn to your discard pile.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'addCardToPlayerDiscard', cardId: 'burn' },
    ],
  },
  mug: {
    id: 'mug', name: 'Mug', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 10 damage.',
    effects: [{ kind: 'damage', amount: 10 }],
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
    text: 'Deal 5 damage. Apply 1 Weak.',
    effects: [
      { kind: 'damage', amount: 5 },
      { kind: 'applyStatus', status: 'weak', amount: 1 },
    ],
  },
  scratch: {
    id: 'scratch', name: 'Scratch', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 4 damage.',
    effects: [{ kind: 'damage', amount: 4 }],
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
    text: 'Deal 6 damage.',
    effects: [{ kind: 'damage', amount: 6 }],
  },
  puncture: {
    id: 'puncture', name: 'Puncture', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 3 damage. Apply 1 Weak.',
    effects: [
      { kind: 'damage', amount: 3 },
      { kind: 'applyStatus', status: 'weak', amount: 1 },
    ],
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
    text: 'Deal 6 damage. Apply 1 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 1 },
    ],
  },
  peck: {
    id: 'peck', name: 'Peck', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 4 damage.',
    effects: [{ kind: 'damage', amount: 4 }],
  },
  swoop: {
    id: 'swoop', name: 'Swoop', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 12 damage.',
    effects: [{ kind: 'damage', amount: 12 }],
  },
  slash: {
    id: 'slash', name: 'Slash', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 9 damage.',
    effects: [{ kind: 'damage', amount: 9 }],
  },
  fury: {
    id: 'fury', name: 'Fury', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage twice.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'damage', amount: 6 },
    ],
  },

  // -------- Elite --------
  'nob-rush': {
    id: 'nob-rush', name: 'Rush', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 14 damage.',
    effects: [{ kind: 'damage', amount: 14 }],
  },
  'nob-skull-bash': {
    id: 'nob-skull-bash', name: 'Skull Bash', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage. Apply 2 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 2 },
    ],
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
    text: 'Deal 18 damage.',
    effects: [{ kind: 'damage', amount: 18 }],
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
    text: 'Deal 6 damage twice.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'damage', amount: 6 },
    ],
  },
  'single-stab': {
    id: 'single-stab', name: 'Stab', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 8 damage.',
    effects: [{ kind: 'damage', amount: 8 }],
  },
  'heavy-stab': {
    id: 'heavy-stab', name: 'Heavy Stab', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 14 damage.',
    effects: [{ kind: 'damage', amount: 14 }],
  },

  // -------- Boss --------
  'guardian-slam': {
    id: 'guardian-slam', name: 'Slam', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 16 damage.',
    effects: [{ kind: 'damage', amount: 16 }],
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
    text: 'Deal 6 damage 6 times.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'damage', amount: 6 },
      { kind: 'damage', amount: 6 },
      { kind: 'damage', amount: 6 },
      { kind: 'damage', amount: 6 },
      { kind: 'damage', amount: 6 },
    ],
  },
  'hexaghost-sear': {
    id: 'hexaghost-sear', name: 'Sear', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage. Add a Burn to your discard pile.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'addCardToPlayerDiscard', cardId: 'burn' },
    ],
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
    text: 'Deal 5 damage twice.',
    effects: [
      { kind: 'damage', amount: 5 },
      { kind: 'damage', amount: 5 },
    ],
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
    text: 'Deal 24 damage.',
    effects: [{ kind: 'damage', amount: 24 }],
  },
};

// Additions to CARDS that enemy effects reference. Keep these in sync.
export const ENEMY_ADDED_CARDS = {
  slimed: {
    id: 'slimed', name: 'Slimed', cost: 1, rarity: 'status',
    type: 'status', target: 'none', destination: 'exhaust',
    unplayable: false,
    text: 'Play: lose 1 Energy. Exhaust.',
    effects: [{ kind: 'loseEnergy', amount: 1 }],
  },
};
