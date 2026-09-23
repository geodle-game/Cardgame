import { randomStartingDeck } from '../data/cards.js';
import { ENCOUNTERS, getEnemyDef } from '../data/enemies.js';
import {
  makeCard, shuffle, draw, makeRng, makeEnemyCard, drawEnemyCard,
} from './deck.js';
import { RELICS } from '../data/relics.js';
import { generateMap, getNode, reachableFrom, startingNodes } from './map.js';
import { rollCoins, rollCardChoices } from './rewards.js';
import { randomEvent } from '../data/events.js';
import { rollShop } from '../data/shop.js';

export const state = {
  screen: 'relicPick',
  rng: null,
  run: null,
  player: null,
  enemies: [],

  // card piles during combat
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

  // reward / event / shop / rest screens carry their data here
  reward: null,
  event: null,
  shop: null,
  rest: null,

  log: [],
  relicChoices: [],
};

export function pushLog(msg) {
  state.log.push(msg);
  if (state.log.length > 60) state.log.shift();
}

// ---------- Run setup ----------

export function newRun(seed = Date.now()) {
  state.rng = makeRng(seed);
  state.run = {
    seed,
    hp: 70, maxHp: 70,
    gold: 99,
    relic: null,
    deckIds: [],
    map: null,
    currentNodeId: null,
    floor: -1,
    cleared: false,
    lastNodeId: null,
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
  state.run.map = generateMap(state.rng);
  state.run.currentNodeId = null;
  state.run.floor = -1;
  state.screen = 'map';
}

// ---------- Map ----------

export function startNode(nodeId) {
  const node = getNode(state.run.map, nodeId);
  if (!node) return;

  // Must be reachable from current node (or first move)
  if (state.run.currentNodeId) {
    const reachable = reachableFrom(state.run.map, state.run.currentNodeId).map(n => n.id);
    if (!reachable.includes(nodeId)) return;
  } else {
    const starters = startingNodes(state.run.map).map(n => n.id);
    if (!starters.includes(nodeId)) return;
  }

  state.run.currentNodeId = nodeId;
  state.run.floor = node.floor;

  if (node.type === 'monster') {
    newCombat(rollEncounter('monster'), 'monster');
  } else if (node.type === 'elite') {
    newCombat(rollEncounter('elite'), 'elite');
  } else if (node.type === 'boss') {
    newCombat(rollEncounter('boss'), 'boss');
  } else if (node.type === 'event') {
    state.event = { data: randomEvent(state.rng) };
    state.screen = 'event';
  } else if (node.type === 'shop') {
    state.shop = { items: rollShop(state.rng, 5), healPrice: 60 };
    state.screen = 'shop';
  } else if (node.type === 'rest') {
    state.rest = { healed: false };
    state.screen = 'rest';
  } else if (node.type === 'treasure') {
    // instant: gain a random relic + gold
    const relicIds = Object.keys(RELICS).filter(id => id !== state.run.relic);
    const r = relicIds[Math.floor(state.rng() * relicIds.length)];
    state.run.relic = r;   // one relic slot for now
    const g = 30 + Math.floor(state.rng() * 20);
    state.run.gold += g;
    state.screen = 'map';
    pushLog(`Treasure: ${RELICS[r].name}, +${g} gold.`);
    return;
  } else {
    state.screen = 'map';
  }
}

function rollEncounter(kind) {
  if (kind === 'monster') {
    const options = ['act1-basic', 'act1-basic', 'act1-cultist'];
    return options[Math.floor(state.rng() * options.length)];
  }
  if (kind === 'elite') return 'act1-cultist';
  return 'act1-basic';
}

export function backToMap() {
  state.run.cleared = false;
  state.screen = 'map';
  state.reward = null;
  state.event = null;
  state.shop = null;
  state.rest = null;
}

// ---------- Combat ----------

export function newCombat(encounterId = 'act1-basic', sourceKind = 'monster') {
  state.player = {
    id: 'player', name: 'You',
    hp: state.run.hp, maxHp: state.run.maxHp,
    block: 0,
    statuses: {},
    nextTurnEnergy: 0,
  };
  state.combatKind = sourceKind;

  const ids = ENCOUNTERS[encounterId];
  state.enemies = ids.map((id, i) => {
    const def = getEnemyDef(id);
    const cardDraw = shuffle(def.deck.map(makeEnemyCard), state.rng);
    return {
      ...def,
      uid: `e${i}`,
      maxHp: def.hp,
      block: 0,
      statuses: {},
      cardDraw,
      cardDiscard: [],
      intentCard: null,
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
  startPlayerTurn(true);
  pushLog('Combat start.');
  state.screen = 'combat';
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

  if (win) {
    const kind = state.combatKind || 'monster';
    const coins = rollCoins(state.rng, kind);
    const cards = rollCardChoices(state.rng, 3);
    state.reward = { coins, cards, taken: false };
    // Boss clears the act
    if (kind === 'boss') state.run.cleared = true;
  }
}

export function rollIntent(enemy) {
  const card = drawEnemyCard(enemy, state.rng);
  enemy.intentCard = card;
}

export function startPlayerTurn(isFirstTurn = false) {
  state.turn = 'player';
  if (!isFirstTurn) state.player.block = 0;
  state.energy = state.maxEnergy + (state.player.nextTurnEnergy || 0);
  state.player.nextTurnEnergy = 0;
  draw(state, 5);
  pushLog(`--- Your turn (${state.energy} energy) ---`);
}

export function livingEnemies() {
  return state.enemies.filter(e => e.hp > 0);
}

// ---------- Rewards ----------

export function claimReward() {
  if (!state.reward) return;
  state.run.gold += state.reward.coins;
  pushLog(`+${state.reward.coins} gold.`);
  state.reward = null;
  backToMap();
}

export function takeRewardCard(defId) {
  if (!state.reward || state.reward.taken) return;
  state.run.deckIds.push(defId);
  state.reward.taken = true;
  pushLog(`Added ${defId} to your deck.`);
}

export function skipRewardCard() {
  if (!state.reward) return;
  state.reward.taken = true;
}

// ---------- Event ----------

export function pickEventChoice(index) {
  if (!state.event) return;
  const ev = state.event.data;
  const choice = ev.choices[index];
  if (!choice) return;
  for (const eff of choice.effects) applyMetaEffect(eff);
  pushLog(`Event: ${ev.name} → ${choice.label}`);
  backToMap();
}

function applyMetaEffect(eff) {
  if (eff.kind === 'heal') {
    state.run.hp = Math.min(state.run.maxHp, state.run.hp + eff.amount);
  } else if (eff.kind === 'gold') {
    state.run.gold = Math.max(0, state.run.gold + eff.amount);
  } else if (eff.kind === 'damageSelf') {
    state.run.hp = Math.max(1, state.run.hp - eff.amount);
  } else if (eff.kind === 'grantRandomCard') {
    const [id] = rollCardChoices(state.rng, 1);
    if (id) state.run.deckIds.push(id);
  }
}

// ---------- Shop ----------

export function buyShopCard(index) {
  if (!state.shop) return;
  const item = state.shop.items[index];
  if (!item) return;
  if (state.run.gold < item.price) return;
  state.run.gold -= item.price;
  state.run.deckIds.push(item.defId);
  state.shop.items.splice(index, 1);
  pushLog(`Bought card for ${item.price} gold.`);
}

export function buyShopHeal() {
  if (!state.shop) return;
  if (state.run.gold < state.shop.healPrice) return;
  state.run.gold -= state.shop.healPrice;
  state.run.hp = Math.min(state.run.maxHp, state.run.hp + 25);
  pushLog('Healed 25 HP.');
}

// ---------- Rest ----------

export function restHeal() {
  const amount = Math.floor(state.run.maxHp * 0.3);
  state.run.hp = Math.min(state.run.maxHp, state.run.hp + amount);
  pushLog(`Rested, healed ${amount}.`);
  backToMap();
}

export function restUpgrade() {
  // Placeholder: no upgrade system yet, just heal a bit less
  const amount = Math.floor(state.run.maxHp * 0.1);
  state.run.hp = Math.min(state.run.maxHp, state.run.hp + amount);
  pushLog(`Meditated, healed ${amount}.`);
  backToMap();
}
