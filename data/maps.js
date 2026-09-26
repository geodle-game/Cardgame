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

// Per-floor type weights. Higher weight = more likely that a node on
// that floor rolls that type. Floors generate 2-5 nodes, so a 15%
// weight on a 4-node floor means roughly 0-1 rest nodes there.
//
// Rest distribution: starts ~10% at floor 3, ramps to ~20-25% mid-act,
// and lands at ~40-50% right before the boss.
export function act1Layout() {
  return {
    floorWeights: [
      // 0-1: safe opener, monsters only.
      { monster: 1 },                                              // 0
      { monster: 1 },                                              // 1

      // 2-5: early act. Events and shops start showing up, first rests.
      { monster: 0.6,  event: 0.3,  shop: 0.1 },                   // 2
      { monster: 0.5,  event: 0.25, elite: 0.15, rest: 0.1 },      // 3
      { monster: 0.45, event: 0.25, treasure: 0.15, rest: 0.15 },  // 4
      { monster: 0.45, event: 0.25, elite: 0.15, rest: 0.15 },     // 5

      // 6-9: mid act. Rest is a regular option here.
      { monster: 0.4,  event: 0.25, shop: 0.15, rest: 0.2 },       // 6
      { monster: 0.4,  event: 0.25, elite: 0.15, treasure: 0.1, rest: 0.1 }, // 7
      { monster: 0.4,  event: 0.2,  shop: 0.15, elite: 0.1, rest: 0.15 },    // 8
      { monster: 0.4,  event: 0.2,  elite: 0.2, rest: 0.2 },       // 9

      // 10-11: late act. More rest, more elites for challenge.
      { monster: 0.35, event: 0.2,  elite: 0.15, rest: 0.2, shop: 0.1 }, // 10
      { monster: 0.35, event: 0.2,  elite: 0.15, rest: 0.2, shop: 0.1 }, // 11

      // 12-13: final stretch. Rest is common so the player can heal up.
      { monster: 0.3,  event: 0.2,  elite: 0.15, rest: 0.25, treasure: 0.1 }, // 12
      { monster: 0.25, event: 0.15, elite: 0.15, rest: 0.35, shop: 0.1 },      // 13

      // 14: guaranteed rest/shop/elite before the boss.
      { rest: 1 },            // 14

      // 15: boss.
      { boss: 1 },                                                 // 15
    ],
  };
}
