export const ENEMY_CARDS = {
  'bite': {
    id: 'bite', name: 'Bite', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 11 damage.',
    effects: [{ kind: 'damage', amount: 11 }],
  },
  'chomp': {
    id: 'chomp', name: 'Chomp', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 7 damage.',
    effects: [{ kind: 'damage', amount: 7 }],
  },
  'harden': {
    id: 'harden', name: 'Harden', cost: 1, owner: 'enemy',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 6 Block.',
    effects: [{ kind: 'block', amount: 6 }],
  },
  'spit': {
    id: 'spit', name: 'Spit', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 5 damage. Apply 1 Weak.',
    effects: [
      { kind: 'damage', amount: 5 },
      { kind: 'applyStatus', status: 'weak', amount: 1 },
    ],
  },
  'ritual': {
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
  'lick': {
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
  'whip': {
    id: 'whip', name: 'Whip', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 8 damage. Apply 1 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 8 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 1 },
    ],
  },
  'stab': {
    id: 'stab', name: 'Stab', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 6 damage.',
    effects: [{ kind: 'damage', amount: 6 }],
  },
  'entangle': {
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
  'tackle': {
    id: 'tackle', name: 'Tackle', cost: 1, owner: 'enemy',
    type: 'attack', target: 'player', destination: 'discard',
    text: 'Deal 8 damage.',
    effects: [{ kind: 'damage', amount: 8 }],
  },
  'mug': {
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
};
