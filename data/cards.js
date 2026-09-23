export const CARDS = {
  strike: {
    id: 'strike', name: 'Strike', cost: 1, rarity: 'starter',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 6 damage.',
    effects: [{ kind: 'damage', amount: 6 }],
  },
  defend: {
    id: 'defend', name: 'Defend', cost: 1, rarity: 'starter',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 5 Block.',
    effects: [{ kind: 'block', amount: 5 }],
  },
  bash: {
    id: 'bash', name: 'Bash', cost: 2, rarity: 'starter',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 8 damage. Apply 2 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 8 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 2 },
    ],
  },
  cleave: {
    id: 'cleave', name: 'Cleave', cost: 1, rarity: 'common',
    type: 'attack', target: 'all-enemies', destination: 'discard',
    text: 'Deal 8 damage to all enemies.',
    effects: [{ kind: 'damage', amount: 8 }],
  },
  'body-slam': {
    id: 'body-slam', name: 'Body Slam', cost: 1, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal damage equal to your Block.',
    effects: [{ kind: 'damageEqualToBlock' }],
  },
  'iron-wave': {
    id: 'iron-wave', name: 'Iron Wave', cost: 1, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Gain 5 Block. Deal 5 damage.',
    effects: [
      { kind: 'block', amount: 5 },
      { kind: 'damage', amount: 5 },
    ],
  },
  recover: {
    id: 'recover', name: 'Recover', cost: 1, rarity: 'common',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Heal 6.',
    effects: [{ kind: 'heal', amount: 6 }],
  },
  adrenaline: {
    id: 'adrenaline', name: 'Adrenaline', cost: 0, rarity: 'rare',
    type: 'skill', target: 'self', destination: 'draw',
    text: 'Gain 3 Energy next turn. Shuffle this back into your draw pile.',
    effects: [{ kind: 'gainEnergyNextTurn', amount: 3 }],
  },
  'shrug-it-off': {
    id: 'shrug-it-off', name: 'Shrug It Off', cost: 1, rarity: 'common',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 8 Block. Draw 1.',
    effects: [
      { kind: 'block', amount: 8 },
      { kind: 'draw', amount: 1 },
    ],
  },
  'pommel-strike': {
    id: 'pommel-strike', name: 'Pommel Strike', cost: 1, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 9 damage. Draw 1.',
    effects: [
      { kind: 'damage', amount: 9 },
      { kind: 'draw', amount: 1 },
    ],
  },
  'twin-strike': {
    id: 'twin-strike', name: 'Twin Strike', cost: 1, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 5 damage twice.',
    effects: [
      { kind: 'damage', amount: 5 },
      { kind: 'damage', amount: 5 },
    ],
  },
  'anger': {
    id: 'anger', name: 'Anger', cost: 0, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 6 damage. Add a copy of this into your discard pile.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'addCopyToDiscard' },
    ],
  },
  'flex': {
    id: 'flex', name: 'Flex', cost: 0, rarity: 'common',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 2 Strength. Lose it at end of turn.',
    effects: [{ kind: 'applyStatus', status: 'strength', amount: 2, target: 'self' }],
  },
  'true-grit': {
    id: 'true-grit', name: 'True Grit', cost: 1, rarity: 'common',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 7 Block. Exhaust a random card in your hand.',
    effects: [
      { kind: 'block', amount: 7 },
      { kind: 'exhaustRandom' },
    ],
  },
};

export function starterDeck() {
  return [
    ...Array(4).fill('strike'),
    ...Array(4).fill('defend'),
    'bash',
    'iron-wave',
  ];
}

export function randomStartingDeck(rng, size = 10) {
  // 4-6 strikes, 3-4 defends, rest from common/rare pool.
  const strikes = 4 + Math.floor(rng() * 3);   // 4-6
  const defends = 3 + Math.floor(rng() * 2);   // 3-4
  const rest = size - strikes - defends;

  const pool = Object.keys(CARDS).filter(id => {
    const c = CARDS[id];
    return c.rarity === 'common' || c.rarity === 'rare';
  });

  const ids = [
    ...Array(strikes).fill('strike'),
    ...Array(defends).fill('defend'),
  ];

  for (let i = 0; i < rest && pool.length; i++) {
    const idx = Math.floor(rng() * pool.length);
    ids.push(pool.splice(idx, 1)[0]);
  }
  return ids;
}
