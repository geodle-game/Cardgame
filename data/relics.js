export const RELICS = {
  'burning-blood': {
    id: 'burning-blood',
    name: 'Burning Blood',
    text: 'At the end of combat, heal 6 HP.',
    trigger: 'combatEnd',
    amount: 6,
  },
  'vajra': {
    id: 'vajra',
    name: 'Vajra',
    text: 'Start each combat with 1 Strength.',
    trigger: 'combatStart',
    strength: 1,
  },
  'anchor': {
    id: 'anchor',
    name: 'Anchor',
    text: 'Start each combat with 10 Block.',
    trigger: 'combatStart',
    block: 10,
  },
  'lantern': {
    id: 'lantern',
    name: 'Lantern',
    text: 'Gain 1 extra Energy on your first turn each combat.',
    trigger: 'firstTurn',
    energy: 1,
  },
  'blood-vial': {
    id: 'blood-vial',
    name: 'Blood Vial',
    text: 'At the start of each combat, heal 2 HP.',
    trigger: 'combatStart',
    heal: 2,
  },
};

export function randomRelicChoices(rng, count = 3) {
  const pool = Object.keys(RELICS);
  const out = [];
  const copy = pool.slice();
  for (let i = 0; i < count && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
