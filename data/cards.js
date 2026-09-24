// destination controls what happens AFTER a card is played:
//   'draw'    = shuffles back into draw pile (recycles)
//   'discard' = goes to discard pile
//   'exhaust' = removed from combat entirely (only for powers)
// retain: true means the card stays in hand if UNPLAYED at end of turn.
// Retained cards do NOT count against the 5 cards you draw next turn.

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
  neutralize: {
    id: 'neutralize', name: 'Neutralize', cost: 0, rarity: 'starter',
    type: 'attack', target: 'enemy', destination: 'draw',
    text: 'Deal 3 damage. Apply 1 Weak.',
    effects: [
      { kind: 'damage', amount: 3 },
      { kind: 'applyStatus', status: 'weak', amount: 1 },
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
    type: 'attack', target: 'enemy', destination: 'draw',
    text: 'Deal 6 damage. Retain.',
    effects: [{ kind: 'damage', amount: 6 }],
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
  clothesline: {
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
  'sword-boomerang': {
    id: 'sword-boomerang', name: 'Sword Boomerang', cost: 1, rarity: 'common',
    type: 'attack', target: 'random-enemy', destination: 'discard',
    text: 'Deal 3 damage to a random enemy 3 times.',
    effects: [
      { kind: 'damageRandom', amount: 3 },
      { kind: 'damageRandom', amount: 3 },
      { kind: 'damageRandom', amount: 3 },
    ],
  },
  headbutt: {
    id: 'headbutt', name: 'Headbutt', cost: 1, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 9 damage. Put a random card from your discard pile on top of your draw pile.',
    effects: [
      { kind: 'damage', amount: 9 },
      { kind: 'recoverFromDiscard' },
    ],
  },
  'perfected-strike': {
    id: 'perfected-strike', name: 'Perfected Strike', cost: 1, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 6 damage. +2 damage per card with "Strike" in your deck.',
    effects: [{ kind: 'perfectedStrike', base: 6, perStrike: 2 }],
  },
  'reckless-charge': {
    id: 'reckless-charge', name: 'Reckless Charge', cost: 0, rarity: 'common',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 7 damage. Shuffle a Dazed into your draw pile.',
    effects: [
      { kind: 'damage', amount: 7 },
      { kind: 'addCardToDraw', cardId: 'dazed' },
    ],
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
    text: 'Gain 2 Strength. Stay.',
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
  armaments: {
    id: 'armaments', name: 'Armaments', cost: 1, rarity: 'common',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Gain 5 Block.',
    effects: [{ kind: 'block', amount: 5 }],
  },
  warcry: {
    id: 'warcry', name: 'Warcry', cost: 0, rarity: 'common',
    type: 'skill', target: 'self', destination: 'exhaust',
    text: 'Draw 2. Put a card from your hand on top of your draw pile.',
    effects: [
      { kind: 'draw', amount: 2 },
      { kind: 'topDeckRandom' },
    ],
  },
  'battle-trance': {
    id: 'battle-trance', name: 'Battle Trance', cost: 0, rarity: 'common',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Draw 3. Apply 1 No Draw.',
    effects: [
      { kind: 'draw', amount: 3 },
      { kind: 'applyStatus', status: 'noDraw', amount: 1, target: 'player' },
    ],
  },
  'seeing-red': {
    id: 'seeing-red', name: 'Seeing Red', cost: 1, rarity: 'common',
    type: 'skill', target: 'self', destination: 'exhaust',
    text: 'Gain 2 Energy.',
    effects: [{ kind: 'gainEnergy', amount: 2 }],
  },
  'burning-pact': {
    id: 'burning-pact', name: 'Burning Pact', cost: 1, rarity: 'common',
    type: 'skill', target: 'self', destination: 'discard',
    text: 'Exhaust a random card in your hand. Draw 2.',
    effects: [
      { kind: 'exhaustRandom' },
      { kind: 'draw', amount: 2 },
    ],
  },
  'ghostly-armor': {
    id: 'ghostly-armor', name: 'Ghostly Armor', cost: 1, rarity: 'common',
    type: 'skill', target: 'self', destination: 'exhaust',
    text: 'Gain 10 Block.',
    effects: [{ kind: 'block', amount: 10 }],
  },

  // -------- Rare --------
  adrenaline: {
    id: 'adrenaline', name: 'Adrenaline', cost: 0, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'Gain 3 Energy next turn. Remove from deck this combat.',
    effects: [{ kind: 'gainEnergyNextTurn', amount: 3 }],
  },
  inflame: {
    id: 'inflame', name: 'Inflame', cost: 1, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'Gain 3 Strength. Remove from deck this combat.',
    effects: [{ kind: 'applyStatus', status: 'strength', amount: 3 }],
  },
  'limit-break': {
    id: 'limit-break', name: 'Limit Break', cost: 1, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'Gain 5 Strength. Remove from deck this combat.',
    effects: [{ kind: 'applyStatus', status: 'strength', amount: 5 }],
  },
  bludgeon: {
    id: 'bludgeon', name: 'Bludgeon', cost: 3, rarity: 'rare',
    type: 'attack', target: 'enemy', destination: 'discard',
    text: 'Deal 32 damage.',
    effects: [{ kind: 'damage', amount: 32 }],
  },
  impervious: {
    id: 'impervious', name: 'Impervious', cost: 2, rarity: 'rare',
    type: 'skill', target: 'self', destination: 'exhaust',
    text: 'Gain 30 Block. Remove from deck this combat.',
    effects: [{ kind: 'block', amount: 30 }],
  },
  feed: {
    id: 'feed', name: 'Feed', cost: 1, rarity: 'rare',
    type: 'attack', target: 'enemy', destination: 'exhaust',
    text: 'Deal 10 damage. If this kills, gain 3 Max HP.',
    effects: [
      { kind: 'damage', amount: 10 },
      { kind: 'feed', amount: 3 },
    ],
  },
  'demon-form': {
    id: 'demon-form', name: 'Demon Form', cost: 3, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'Each turn, gain 2 Strength.',
    effects: [{ kind: 'gainStatusPerTurn', status: 'strength', amount: 2 }],
  },
  reaper: {
    id: 'reaper', name: 'Reaper', cost: 2, rarity: 'rare',
    type: 'attack', target: 'all-enemies', destination: 'exhaust',
    text: 'Deal 4 damage to all enemies. Heal HP equal to unblocked damage dealt.',
    effects: [{ kind: 'reaper', amount: 4 }],
  },
  offering: {
    id: 'offering', name: 'Offering', cost: 0, rarity: 'rare',
    type: 'skill', target: 'self', destination: 'exhaust',
    text: 'Lose 6 HP. Gain 2 Energy. Draw 3.',
    effects: [
      { kind: 'loseHpSelf', amount: 6 },
      { kind: 'gainEnergy', amount: 2 },
      { kind: 'draw', amount: 3 },
    ],
  },
  berserk: {
    id: 'berserk', name: 'Berserk', cost: 0, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'Gain 1 Energy each turn. At the start of each turn, take 2 damage.',
    effects: [{ kind: 'gainEnergyPerTurn', amount: 1, selfDamagePerTurn: 2 }],
  },
  'double-tap': {
    id: 'double-tap', name: 'Double Tap', cost: 1, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'This turn, your next Attack is played twice.',
    effects: [{ kind: 'doubleTapNextAttack' }],
  },
  juggernaut: {
    id: 'juggernaut', name: 'Juggernaut', cost: 2, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'Whenever you gain Block, deal 5 damage to a random enemy.',
    effects: [{ kind: 'juggernaut', amount: 5 }],
  },
  rupture: {
    id: 'rupture', name: 'Rupture', cost: 1, rarity: 'rare',
    type: 'power', target: 'self', destination: 'exhaust',
    text: 'Whenever you lose HP from a card, gain 1 Strength.',
    effects: [{ kind: 'rupture' }],
  },

  // -------- Statuses / curses --------
  dazed: {
    id: 'dazed', name: 'Dazed', cost: 999, rarity: 'status',
    type: 'status', target: 'none', destination: 'draw',
    unplayable: true, ethereal: true,
    text: 'Unplayable. Ethereal.',
    effects: [],
  },
  wound: {
    id: 'wound', name: 'Wound', cost: 999, rarity: 'status',
    type: 'status', target: 'none', destination: 'discard',
    unplayable: true,
    text: 'Unplayable.',
    effects: [],
  },
  burn: {
    id: 'burn', name: 'Burn', cost: 999, rarity: 'status',
    type: 'status', target: 'none', destination: 'discard',
    unplayable: true, endOfTurnDamage: 2,
    text: 'Unplayable. At the end of your turn, take 2 damage.',
    effects: [],
  },
  slimed: {
    id: 'slimed', name: 'Slimed', cost: 1, rarity: 'status',
    type: 'status', target: 'none', destination: 'exhaust',
    text: 'Play: lose 1 Energy. Exhaust.',
    effects: [{ kind: 'loseEnergy', amount: 1 }],
  },
};

export function starterDeck() {
  return [
    ...Array(3).fill('strike'),
    ...Array(2).fill('defend'),
    'bash',
    'neutralize',
    'iron-wave',
  ];
}

export function randomStartingDeck(rng, size = 8) {
  // Fixed basics: 3 Strike, 2 Defend.
  // Remaining slots filled with random commons/rares, 75% common / 25% rare.
  const strikes = 3;
  const defends = 2;
  const rest = size - strikes - defends;   // 3 slots

  const commons = Object.keys(CARDS).filter(id => CARDS[id].rarity === 'common');
  const rares   = Object.keys(CARDS).filter(id => CARDS[id].rarity === 'rare');

  const ids = [
    ...Array(strikes).fill('strike'),
    ...Array(defends).fill('defend'),
  ];

  for (let i = 0; i < rest; i++) {
    const useCommon = rng() < 0.75;
    const pool = useCommon ? commons : rares;
    if (!pool.length) continue;
    const idx = Math.floor(rng() * pool.length);
    ids.push(pool.splice(idx, 1)[0]);
  }
  return ids;
}
