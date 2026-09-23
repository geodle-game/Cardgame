export const CARDS = {
  strike: {
    id: 'strike', name: 'Strike', cost: 1,
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 6 damage.',
    effects: [{ kind: 'damage', amount: 6 }],
  },
  defend: {
    id: 'defend', name: 'Defend', cost: 1,
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 5 Block.',
    effects: [{ kind: 'block', amount: 5 }],
  },
  bash: {
    id: 'bash', name: 'Bash', cost: 2,
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 8 damage. Apply 2 Vulnerable.',
    effects: [
      { kind: 'damage', amount: 8 },
      { kind: 'applyStatus', status: 'vulnerable', amount: 2 },
    ],
  },
  cleave: {
    id: 'cleave', name: 'Cleave', cost: 1,
    type: 'attack', target: 'all-enemies', destination: 'discard',
    text: 'Deal 8 damage to all enemies.',
    effects: [{ kind: 'damage', amount: 8 }],
  },
  'body-slam': {
    id: 'body-slam', name: 'Body Slam', cost: 1,
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal damage equal to your Block.',
    effects: [{ kind: 'damageEqualToBlock' }],
  },
  'iron-wave': {
    id: 'iron-wave', name: 'Iron Wave', cost: 1,
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Gain 5 Block. Deal 5 damage.',
    effects: [
      { kind: 'block', amount: 5 },
      { kind: 'damage', amount: 5 },
    ],
  },
  recover: {
    id: 'recover', name: 'Recover', cost: 1,
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Heal 6.',
    effects: [{ kind: 'heal', amount: 6 }],
  },
  adrenaline: {
    id: 'adrenaline', name: 'Adrenaline', cost: 0,
    type: 'skill', target: 'self', destination: 'draw',
    text: 'Gain 3 Energy next turn. Shuffle this back into your draw pile.',
    effects: [{ kind: 'gainEnergyNextTurn', amount: 3 }],
  },
  'shrug-it-off': {
    id: 'shrug-it-off', name: 'Shrug It Off', cost: 1,
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 8 Block. Draw 1.',
    effects: [
      { kind: 'block', amount: 8 },
      { kind: 'draw', amount: 1 },
    ],
  },
};

export function starterDeck() {
  return [
    ...Array(4).fill('strike'),
    ...Array(4).fill('defend'),
    'bash',
    'iron-wave',
    'recover',
    'body-slam',
    'cleave',
    'adrenaline',
    'shrug-it-off',
  ];
}
