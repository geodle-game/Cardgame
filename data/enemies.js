export const ENEMIES = {
  'jaw-worm': {
    id: 'jaw-worm',
    name: 'Jaw Worm',
    hp: 42,
    moves: [
      { kind: 'attack', amount: 11 },
      { kind: 'block',  amount: 6  },
      { kind: 'attack', amount: 7  },
    ],
  },
};

export function pickEnemy() {
  return 'jaw-worm';
}
