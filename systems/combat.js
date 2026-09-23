import {
  state, pushLog, startPlayerTurn, livingEnemies, rollIntent, endCombat,
} from './state.js';
import { draw, recycleHand, shuffle, makeCard, makeEnemyCard } from './deck.js';
import {
  applyStatus, outgoingMultiplier, incomingMultiplier,
  outgoingFlatBonus, tickStatuses,
} from './statuses.js';
import { CARDS } from '../data/cards.js';
import { ENEMY_CARDS } from '../data/enemy-cards.js';

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
  for (const eff of def.effects) applyEffect(eff, targets, card, state.player);

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

// Resolve targets for an enemy card. From the enemy's perspective:
//   'player'       → the player
//   'self'         → itself
//   'all-enemies'  → all living enemies (its own side)
function resolveEnemyTargets(enemy, kind) {
  if (kind === 'self') return [enemy];
  if (kind === 'all-enemies') return livingEnemies();
  return [state.player];
}

function applyEffect(eff, targets, card, source) {
  switch (eff.kind) {
    case 'damage':
      for (const t of targets) {
        const r = dealDamage(source, t, eff.amount);
        pushLog(`  ${t.name} took ${r.dealt} (blocked ${r.blocked}).`);
      }
      break;

    case 'damageEqualToBlock': {
      const amount = Math.floor(source.block * (eff.multiplier ?? 1));
      for (const t of targets) {
        const r = dealDamage(source, t, amount);
        pushLog(`  ${t.name} took ${r.dealt} (blocked ${r.blocked}).`);
      }
      break;
    }

    case 'block':
      source.block += eff.amount;
      pushLog(`  ${source.name || 'You'} gained ${eff.amount} block.`);
      break;

    case 'heal':
      source.hp = Math.min(source.maxHp, source.hp + eff.amount);
      pushLog(`  ${source.name || 'You'} healed ${eff.amount}.`);
      break;

    case 'applyStatus':
      for (const t of targets) {
        applyStatus(t, eff.status, eff.amount);
        pushLog(`  ${t.name || 'You'} gained ${eff.amount} ${eff.status}.`);
      }
      break;

    case 'gainEnergyNextTurn':
      if (source.nextTurnEnergy !== undefined) {
        source.nextTurnEnergy += eff.amount;
      }
      pushLog(`  +${eff.amount} energy next turn.`);
      break;

    case 'draw':
      if (source === state.player) {
        draw(state, eff.amount);
        pushLog(`  Drew ${eff.amount}.`);
      }
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

    default:
      pushLog(`  Unknown effect: ${eff.kind}`);
  }
}

export function dealDamage(attacker, target, base) {
  let dmg = base + outgoingFlatBonus(attacker);
  dmg *= outgoingMultiplier(attacker);
  dmg *= incomingMultiplier(target);
  dmg = Math.floor(dmg);
  if (dmg < 0) dmg = 0;

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
    const card = e.intentCard;
    if (!card) continue;

    const def = ENEMY_CARDS[card.defId];
    const targets = resolveEnemyTargets(e, def.target);

    pushLog(`${e.name} plays ${def.name}.`);
    for (const eff of def.effects) applyEffect(eff, targets, card, e);

    // Enemy's card goes back into its own discard, recycled each turn
    e.cardDiscard.push(card);

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
