export const EVENTS = [
  {
    id: 'shrine',
    name: 'Ancient Shrine',
    text: 'A glowing shrine hums in the dark. Do you touch it?',
    choices: [
      { label: 'Pray (heal 15)', effects: [{ kind: 'heal', amount: 15 }] },
      { label: 'Desecrate (gain 100 gold, lose 8 HP)', effects: [
        { kind: 'gold', amount: 100 },
        { kind: 'damageSelf', amount: 8 },
      ] },
      { label: 'Walk away', effects: [] },
    ],
  },
  {
    id: 'wanderer',
    name: 'Wandering Merchant',
    text: 'A hooded figure offers you a deal.',
    choices: [
      { label: 'Buy a potion (30 gold, heal 20)', effects: [
        { kind: 'gold', amount: -30 },
        { kind: 'heal', amount: 20 },
      ] },
      { label: 'Buy a card (50 gold)', effects: [
        { kind: 'gold', amount: -50 },
        { kind: 'grantRandomCard' },
      ] },
      { label: 'Decline', effects: [] },
    ],
  },
  {
    id: 'campfire-lore',
    name: 'Abandoned Campfire',
    text: 'Embers still glow. Someone left in a hurry.',
    choices: [
      { label: 'Rest (heal 12)', effects: [{ kind: 'heal', amount: 12 }] },
      { label: 'Search (gain 40 gold, lose 5 HP)', effects: [
        { kind: 'gold', amount: 40 },
        { kind: 'damageSelf', amount: 5 },
      ] },
    ],
  },
];

export function randomEvent(rng) {
  return EVENTS[Math.floor(rng() * EVENTS.length)];
}
