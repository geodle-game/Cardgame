export const CARDS = {
  // -------- Starter --------
  strike: {
    id: 'strike', name: 'Strike', cost: 1, rarity: 'starter',
    type: 'attack', target: 'enemy', destination: 'draw',
    text: 'Deal 6 damage.',
    effects: [{ kind: 'damage', amount: 6 }],
  },
  defend: {
    id: 'defend', name: 'Defend', cost: 1, rarity: 'starter',
    type: 'skill', target: 'self', destination: 'draw',
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

  // -------- Common attacks --------
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
  anger: {
    id: 'anger', name: 'Anger', cost: 0, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 6 damage. Add a copy of this into your draw pile.',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'addCopyToDraw' },
    ],
  },
  'quick-slash': {
    id: 'quick-slash', name: 'Quick Slash', cost: 1, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 8 damage. Draw 2.',
    effects: [
      { kind: 'damage', amount: 8 },
      { kind: 'draw', amount: 2 },
    ],
  },
  'clothesline': {
    id: 'clothesline', name: 'Clothesline', cost: 2, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 12 damage. Apply 2 Weak.',
    effects: [
      { kind: 'damage', amount: 12 },
      { kind: 'applyStatus', status: 'weak', amount: 2 },
    ],
  },
  'heavy-blade': {
    id: 'heavy-blade', name: 'Heavy Blade', cost: 2, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 14 damage. Strength counts 3× for this attack.',
    effects: [{ kind: 'damage', amount: 14, strengthMultiplier: 3 }],
  },

  // -------- Common skills --------
  recover: {
    id: 'recover', name: 'Recover', cost: 1, rarity: 'common',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Heal 6.',
    effects: [{ kind: 'heal', amount: 6 }],
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
  flex: {
    id: 'flex', name: 'Flex', cost: 0, rarity: 'common',
    type: 'skill', target: 'self', destination: 'discard', retain: true,
    text: 'Gain 2 Strength. Retain.',
    effects: [{ kind: 'applyStatus', status: 'strength', amount: 2 }],
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
  'armaments': {
    id: 'armaments', name: 'Armaments', cost: 1, rarity: 'common',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 5 Block.',
    effects: [{ kind: 'block', amount: 5 }],
  },

  // -------- Rare / powers --------
  adrenaline: {
    id: 'adrenaline', name: 'Adrenaline', cost: 0, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'Gain 3 Energy next turn. Exhaust.',
    effects: [{ kind: 'gainEnergyNextTurn', amount: 3 }],
  },
  'inflame': {
    id: 'inflame', name: 'Inflame', cost: 1, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'Gain 3 Strength. Exhaust.',
    effects: [{ kind: 'applyStatus', status: 'strength', amount: 3 }],
  },
  'limit-break': {
    id: 'limit-break', name: 'Limit Break', cost: 1, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'Gain 5 Strength. Exhaust.',
    effects: [{ kind: 'applyStatus', status: 'strength', amount: 5 }],
  },
  'bludgeon': {
    id: 'bludgeon', name: 'Bludgeon', cost: 3, rarity: 'rare',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 32 damage.',
    effects: [{ kind: 'damage', amount: 32 }],
  },
  'impervious': {
    id: 'impervious', name: 'Impervious', cost: 2, rarity: 'rare',
    type: 'skill', target: 'self', destination: 'exhaust',
    text: 'Gain 30 Block. Exhaust.',
    effects: [{ kind: 'block', amount: 30 }],
  },
  'feed': {
    id: 'feed', name: 'Feed', cost: 1, rarity: 'rare',
    type: 'attack', target: 'enemy', destination: 'exhaust',
    text: 'Deal 10 damage. If this kills, gain 3 Max HP. Exhaust.',
    effects: [
      { kind: 'damage', amount: 10 },
      { kind: 'feed', amount: 3 },
    ],
  },
  'demon-form': {
    id: 'demon-form', name: 'Demon Form', cost: 3, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'At the start of each turn, gain 2 Strength. Exhaust.',
    effects: [{ kind: 'gainStatusPerTurn', status: 'strength', amount: 2 }],
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
  const strikes = 4 + Math.floor(rng() * 3);
  const defends = 3 + Math.floor(rng() * 2);
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
