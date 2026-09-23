export const FLOORS = 15;
export const WIDTH = 7;
export const BOSS_FLOOR = FLOORS;

export const NODE_TYPES = {
  monster:   { id: 'monster',   label: 'Monster',   color: '#ff6b6b', symbol: '⚔' },
  elite:     { id: 'elite',     label: 'Elite',     color: '#ff8f6b', symbol: '★' },
  event:     { id: 'event',     label: 'Event',     color: '#c9a3ff', symbol: '?' },
  shop:      { id: 'shop',      label: 'Shop',      color: '#ffd166', symbol: '$' },
  rest:      { id: 'rest',      label: 'Rest',      color: '#6bff9e', symbol: '☕' },
  treasure:  { id: 'treasure',  label: 'Treasure',  color: '#ffe699', symbol: '◆' },
  boss:      { id: 'boss',      label: 'Boss',      color: '#e05c5c', symbol: '☠' },
};

export function act1Layout() {
  // Weights per floor. First two floors are always monster.
  // Last three before boss lean toward rest/shop/elite.
  return {
    floorWeights: [
      // floor 0 (first)
      { monster: 1 },
      // floor 1
      { monster: 1 },
      // floors 2-5
      { monster: 0.6, event: 0.3, shop: 0.1 },
      { monster: 0.5, event: 0.3, elite: 0.2 },
      { monster: 0.5, event: 0.3, treasure: 0.2 },
      { monster: 0.5, event: 0.3, elite: 0.2 },
      // floors 6-9
      { monster: 0.45, event: 0.25, shop: 0.15, elite: 0.15 },
      { monster: 0.45, event: 0.25, treasure: 0.15, elite: 0.15 },
      { monster: 0.45, event: 0.25, shop: 0.15, elite: 0.15 },
      { monster: 0.45, event: 0.25, elite: 0.15, treasure: 0.15 },
      // floors 10-13
      { monster: 0.5, event: 0.2, elite: 0.2, rest: 0.1 },
      { monster: 0.4, event: 0.2, elite: 0.2, shop: 0.1, rest: 0.1 },
      { monster: 0.4, event: 0.2, elite: 0.2, rest: 0.2 },
      { monster: 0.4, event: 0.2, elite: 0.2, rest: 0.2 },
      // floor 14 (last before boss)
      { rest: 0.6, shop: 0.2, elite: 0.2 },
      // floor 15 is boss
      { boss: 1 },
    ],
  };
}
