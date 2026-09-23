import { starterDeck } from '../data/cards.js';
import { ENCOUNTERS, getEnemyDef } from '../data/enemies.js';
import { makeCard, shuffle, draw } from './deck.js';

export const state = {
  player: null,
  enemies: [],
  drawPile: [],
  hand: [],
  discardPile: [],
  exhaustPile: [],
  energy: 0,
  maxEnergy: 3,
  turn: 'player',        // 'player' | 'enemy' | 'over'
  over: false,
  result: null,          // 'win' | 'loss'
  selectedEnemyId: null,
  log: [],
};

export function pushLog(msg) {
  state.log.push(msg);
  if (state.log.length > 60) state.log.shift();
}

export function newCombat(encounterId = 'act1-basic') {
  state.player = {
    id: 'player',
    hp: 70, maxHp: 70,
    block: 0,
    statuses: {},
    nextTurnEnergy: 0,
  };

  const ids = ENCOUNTERS[encounterId];
  state.enemies = ids.map((id, i) => {
    const def = getEnemyDef(id);
    return {
      ...def,
      uid: `e${i}`,
      maxHp: def.hp,
      block: 0,
      statuses: {},
      moveIndex: 0,
      intent: null,
    };
  });

  state.drawPile = shuffle(starterDeck().map(makeCard));
  state.hand = [];
  state.discardPile = [];
  state.exhaustPile = [];
  state.maxEnergy = 3;
  state.turn = 'player';
  state.over = false;
  state.result = null;
  state.selectedEnemyId = state.enemies[0]?.uid ?? null;
  state.log = [];

  for (const e of state.enemies) rollIntent(e);
  startPlayerTurn();
  pushLog('Combat start.');
}

export function rollIntent(enemy) {
  enemy.intent = enemy.moves[enemy.moveIndex % enemy.moves.length];
  enemy.moveIndex++;
}

export function startPlayerTurn() {
  state.turn = 'player';
  state.player.block = 0;
  state.energy = state.maxEnergy + (state.player.nextTurnEnergy || 0);
  state.player.nextTurnEnergy = 0;
  draw(state, 5);
  pushLog(`--- Your turn (${state.energy} energy) ---`);
}

export function livingEnemies() {
  return state.enemies.filter(e => e.hp > 0);
}
