import { starterDeck } from '../data/cards.js';
import { ENEMIES, pickEnemy } from '../data/enemies.js';
import { shuffle, makeCard, draw } from './deck.js';

export const state = {
  player: null,
  enemy: null,
  drawPile: [],
  hand: [],
  discardPile: [],
  energy: 3,
  maxEnergy: 3,
  turn: 'player',   // 'player' | 'enemy' | 'over'
  log: [],
};

export function pushLog(msg) {
  state.log.push(msg);
  if (state.log.length > 40) state.log.shift();
}

export function newCombat() {
  state.player = { hp: 70, maxHp: 70, block: 0 };
  state.energy = state.maxEnergy;
  state.turn = 'player';
  state.drawPile = shuffle(starterDeck().map(makeCard));
  state.hand = [];
  state.discardPile = [];
  state.log = [];

  const def = ENEMIES[pickEnemy()];
  state.enemy = {
    ...def,
    maxHp: def.hp,
    block: 0,
    moveIndex: 0,
    intent: null,
  };

  rollIntent();
  draw(state, 5);
  pushLog('Combat start.');
}

export function rollIntent() {
  const e = state.enemy;
  e.intent = e.moves[e.moveIndex % e.moves.length];
  e.moveIndex++;
}
