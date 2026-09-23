import { randomStartingDeck } from '../data/cards.js';
import { ENCOUNTERS, getEnemyDef } from '../data/enemies.js';
import { makeCard, shuffle, draw, makeRng } from './deck.js';
import { RELICS } from '../data/relics.js';

export const state = {
  screen: 'relicPick',
  rng: null,
  run: null,
  player: null,
  enemies: [],
  drawPile: [],
  hand: [],
  discardPile: [],
  exhaustPile: [],
  energy: 0,
  maxEnergy: 3,
  turn: 'player',
  over: false,
  result: null,
  selectedEnemyId: null,
  pendingCardUid: null,
  log: [],
  relicChoices: [],
};

export function pushLog(msg) {
  state.log.push(msg);
  if (state.log.length > 60) state.log.shift();
}

export function newRun(seed = Date.now()) {
  state.rng = makeRng(seed);
  state.run = {
    seed,
    hp: 70, maxHp: 70,
    relic: null,
    deckIds: [],
  };
  state.relicChoices = pickRelicChoices();
  state.screen = 'relicPick';
  state.log = [];
  state.over = false;
  state.result = null;
}

function pickRelicChoices() {
  const pool = Object.keys(RELICS);
  const out = [];
  const copy = pool.slice();
  for (let i = 0; i < 3 && copy.length; i++) {
    const idx = Math.floor(state.rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export function chooseRelic(relicId) {
  state.run.relic = relicId;
  state.run.deckIds = randomStartingDeck(state.rng, 10);
  state.screen = 'deckView';
}

export function confirmDeck() {
  state.screen = 'combat';
  newCombat();
}

export function newCombat(encounterId = 'act1-basic') {
  state.player = {
    id: 'player',
    hp: state.run.hp, maxHp: state.run.maxHp,
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

  state.drawPile = shuffle(state.run.deckIds.map(makeCard), state.rng);
  state.hand = [];
  state.discardPile = [];
  state.exhaustPile = [];
  state.maxEnergy = 3;
  state.turn = 'player';
  state.over = false;
  state.result = null;
  state.pendingCardUid = null;
  state.selectedEnemyId = state.enemies[0]?.uid ?? null;
  state.log = [];

  const relic = state.run.relic ? RELICS[state.run.relic] : null;
  if (relic?.trigger === 'combatStart') {
    if (relic.block) state.player.block += relic.block;
    if (relic.heal) state.player.hp = Math.min(state.player.maxHp, state.player.hp + relic.heal);
  }
  if (relic?.trigger === 'firstTurn') {
    state.player.nextTurnEnergy += relic.energy || 0;
  }

  for (const e of state.enemies) rollIntent(e);
  startPlayerTurn();
  pushLog('Combat start.');
}

export function endCombat(win) {
  state.run.hp = state.player.hp;
  const relic = state.run.relic ? RELICS[state.run.relic] : null;
  if (win && relic?.trigger === 'combatEnd' && relic.amount) {
    state.run.hp = Math.min(state.run.maxHp, state.run.hp + relic.amount);
  }
  state.over = true;
  state.result = win ? 'win' : 'loss';
  state.turn = 'over';
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
