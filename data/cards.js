export const CARDS = {
  strike: {
    id: 'strike',
    name: 'Strike',
    cost: 1,
    text: 'Deal 6 damage.',
    effects: [{ kind: 'damage', amount: 6 }],
  },
  defend: {
    id: 'defend',
    name: 'Defend',
    cost: 1,
    text: 'Gain 5 Block.',
    effects: [{ kind: 'block', amount: 5 }],
  },
  bash: {
    id: 'bash',
    name: 'Bash',
    cost: 2,
    text: 'Deal 8 damage.',
    effects: [{ kind: 'damage', amount: 8 }],
  },
};

export function starterDeck() {
  return [
    ...Array(5).fill('strike'),
    ...Array(4).fill('defend'),
    'bash',
  ];
}
