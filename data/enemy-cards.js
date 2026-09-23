// Enemy cards. Same shape as player cards, but owner: 'enemy'.
// target: 'player' | 'self' | 'all-enemies' (all-enemies means the enemy's own side)

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
  'grow': {
    id: 'grow', name: 'Grow', cost: 1, owner: 'enemy',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 3 Strength.',
    effects: [{ kind: 'applyStatus', status: 'strength', amount: 3 }],
  },
};
