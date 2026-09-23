import {
  state, pushLog, startPlayerTurn, livingEnemies, rollIntent, endCombat,
} from './state.js';
import { draw, recycleHand, shuffle, makeCard } from './deck.js';
import {
  applyStatus, outgoingMultiplier, incomingMultiplier, tickStatuses,
} from './statuses.js';
import { CARDS } from '../data/cards.js';

export function canPlay(card) {
  if (state.turn !== 'player' || state.over) return false;
  return state.energy >= CARDS[card.defId].cost;
}

export function selectCardForPlay(card) {
  const def = CARDS[card.defId];
  if (!canPlay(card)) return;

  if (def.target === 'enemy' && livingEnemies().length > 1) {
    state.pendingCardUid = card.uid;
    pushLog(`Choose a target for ${def.name}.`);
    return;
  }
  playCard(card);
}

export function playCard(card, explicitTargetId = null) {
  if (!canPlay(card)) return false;
  const def = CARDS[card.defId];
  state.energy -= def.cost;
  state.pendingCardUid = null;

  state.hand = state.hand.filter(c => c.uid !== card.uid);

  const targets = resolveTargets(def.target, explicitTargetId);
  for (const eff of def.effects) applyEffect(eff, targets, card);

  const dest = def.destination ?? 'discard';
  if (dest === 'draw') {
    state.drawPile.push(card);
    state.drawPile = shuffle(state.drawPile, state.rng);
  } else if (dest === 'exhaust') {
    state.exhaustPile.push(card);
  } else {
    state.discardPile.push(card);
  }

  pushLog(`You played ${def.name}.`);
  checkEnemiesDead();
  return true;
}

function resolveTargets(targetKind, explicitId) {
  if (targetKind === 'self' || targetKind === 'none') return [state.player];
  if (targetKind === 'all-enemies') return livingEnemies();
  const pool = livingEnemies();
  if (!pool.length) return [];
  const chosen =
    pool.find(e => e.uid === explicitId) ||
    pool.find(e => e.uid === state.selectedEnemyId) ||
    pool[0];
  return [chosen];
}

function applyEffect(eff, targets, card) {
  switch (eff.kind) {
    case 'damage':
      for (const t of targets) {
        const r = dealDamage(state.player, t, eff.amount);
        pushLog(`  ${t.name} took ${r.dealt} (blocked ${r.blocked}).`);
      }
      break;

    case 'damageEqualToBlock': {
      const amount = Math.floor(state.player.block * (eff.multiplier ?? 1));
      for (const t of targets) {
        const r = dealDamage(state.player, t, amount);
        pushLog(`  ${t.name} took ${r.dealt} (blocked ${r.blocked}).`);
      }
      break;
    }

    case 'block':
      state.player.block += eff.amount;
      pushLog(`  Gained ${eff.amount} block.`);
      break;

    case 'heal':
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + eff.amount);
      pushLog(`  Healed ${eff.amount}.`);
      break;

    case 'applyStatus':
      for (const t of targets) {
        applyStatus(t, eff.status, eff.amount);
        pushLog(`  ${t.name} gained ${eff.amount} ${eff.status}.`);
      }
      break;

    case 'gainEnergyNextTurn':
      state.player.nextTurnEnergy += eff.amount;
      pushLog(`  +${eff.amount} energy next turn.`);
      break;

    case 'draw':
      draw(state, eff.amount);
      pushLog(`  Drew ${eff.amount}.`);
      break;

    case 'addCopyToDiscard':
      state.discardPile.push(makeCard(card.defId));
      pushLog(`  A copy of ${CARDS[card.defId].name} entered the discard pile.`);
      break;

    case 'exhaustRandom': {
      if (state.hand.length) {
        const idx = Math.floor(state.rng() * state.hand.length);
        const removed = state.hand.splice(idx, 1)[0];
        state.exhaustPile.push(removed);
        pushLog(`  Exhausted ${CARDS[removed.defId].name}.`);
      }
      break;
    }

    case 'endTurn':
      pushLog('  (End turn effect — not wired yet.)');
      break;

    default:
      pushLog(`  Unknown effect: ${eff.kind}`);
  }
}

export function dealDamage(attacker, target, base) {
  let dmg = base;
  dmg *= outgoingMultiplier(attacker);
  dmg *= incomingMultiplier(target);
  dmg = Math.floor(dmg);

  const blocked = Math.min(target.block, dmg);
  target.block -= blocked;
  const dealt = dmg - blocked;
  target.hp = Math.max(0, target.hp - dealt);
  return { dealt, blocked };
}

function checkEnemiesDead() {
  if (livingEnemies().length === 0) {
    pushLog('Victory.');
    endCombat(true);
  }
}

export function beginEnemyTurn() {
  if (state.turn !== 'player' || state.over) return;
  recycleHand(state);
  tickStatuses(state.player);
  state.turn = 'enemy';
}

export function resolveEnemyTurn() {
  if (state.over) return;

  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    const intent = e.intent;
    if (!intent) continue;

    if (intent.kind === 'attack') {
      const r = dealDamage(e, state.player, intent.amount);
      pushLog(`${e.name} hits you for ${r.dealt} (blocked ${r.blocked}).`);
    } else if (intent.kind === 'block') {
      e.block += intent.amount;
      pushLog(`${e.name} gains ${intent.amount} block.`);
    } else if (intent.kind === 'heal') {
      e.hp = Math.min(e.maxHp, e.hp + intent.amount);
      pushLog(`${e.name} heals ${intent.amount}.`);
    }
    tickStatuses(e);
    rollIntent(e);
  }

  if (state.player.hp <= 0) {
    pushLog('Defeat.');
    endCombat(false);
    return;
  }

  startPlayerTurn();
}
