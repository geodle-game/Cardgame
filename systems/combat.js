import {
  state, pushLog, startPlayerTurn, livingEnemies, rollIntent, endCombat, cardDef,
} from './state.js';
import { draw, recycleHand, shuffle, makeCard } from './deck.js';
import {
  applyStatus, outgoingMultiplier, incomingMultiplier,
  outgoingFlatBonus, tickStatuses,
} from './statuses.js';
import { CARDS } from '../data/cards.js';
import { ENEMY_CARDS } from '../data/enemy-cards.js';

export function canPlay(card) {
  if (state.turn !== 'player' || state.over) return false;
  const def = CARDS[card.defId];
  if (def.unplayable) return false;
  return state.energy >= def.cost;
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

  if (state.player.doubleTapNextAttack && def.type === 'attack') {
    state.player.doubleTapNextAttack = false;
    for (const eff of def.effects) applyEffect(eff, targets, card, state.player);
    pushLog('Double Tap! Attack played twice.');
  }

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
  if (targetKind === 'random-enemy') {
    const pool = livingEnemies();
    if (!pool.length) return [];
    return [pool[Math.floor(state.rng() * pool.length)]];
  }
  const pool = livingEnemies();
  if (!pool.length) return [];
  const chosen =
    pool.find(e => e.uid === explicitId) ||
    pool.find(e => e.uid === state.selectedEnemyId) ||
    pool[0];
  return [chosen];
}

function resolveEnemyTargets(enemy, kind) {
  if (kind === 'self') return [enemy];
  if (kind === 'all-enemies') return livingEnemies();
  return [state.player];
}

function applyEffect(eff, targets, card, source) {
  switch (eff.kind) {
    case 'damage':
      for (const t of targets) {
        const r = dealDamage(source, t, eff.amount, eff.strengthMultiplier);
        pushLog(`  ${t.name} took ${r.dealt} (blocked ${r.blocked}).`);
      }
      break;

    case 'damageRandom': {
      const pool = livingEnemies();
      if (!pool.length) break;
      const t = pool[Math.floor(state.rng() * pool.length)];
      const r = dealDamage(source, t, eff.amount);
      pushLog(`  ${t.name} took ${r.dealt} (blocked ${r.blocked}).`);
      break;
    }

    case 'damageEqualToBlock': {
      const amount = Math.floor(source.block * (eff.multiplier ?? 1));
      for (const t of targets) {
        const r = dealDamage(source, t, amount);
        pushLog(`  ${t.name} took ${r.dealt} (blocked ${r.blocked}).`);
      }
      break;
    }

    case 'perfectedStrike': {
      const strikeCount = state.run.deckIds.filter(id => id.includes('strike')).length;
      const amount = eff.base + eff.perStrike * strikeCount;
      for (const t of targets) {
        const r = dealDamage(source, t, amount);
        pushLog(`  ${t.name} took ${r.dealt} (blocked ${r.blocked}). [${strikeCount} strikes]`);
      }
      break;
    }

    case 'reaper': {
      let totalDealt = 0;
      for (const t of livingEnemies()) {
        const r = dealDamage(source, t, eff.amount);
        totalDealt += r.dealt;
      }
      if (totalDealt > 0) {
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + totalDealt);
        pushLog(`  Reaper healed ${totalDealt}.`);
      }
      break;
    }

    case 'block':
      source.block += eff.amount;
      pushLog(`  ${source.name || 'You'} gained ${eff.amount} block.`);
      if (state.player.juggernaut && source === state.player) {
        const pool = livingEnemies();
        if (pool.length) {
          const t = pool[Math.floor(state.rng() * pool.length)];
          const r = dealDamage(state.player, t, state.player.juggernaut);
          pushLog(`  Juggernaut: ${t.name} took ${r.dealt}.`);
        }
      }
      break;

    case 'heal':
      source.hp = Math.min(source.maxHp, source.hp + eff.amount);
      pushLog(`  ${source.name || 'You'} healed ${eff.amount}.`);
      break;

    case 'loseHpSelf':
      state.player.hp = Math.max(0, state.player.hp - eff.amount);
      pushLog(`  Lost ${eff.amount} HP.`);
      if (state.player.rupture) {
        applyStatus(state.player, 'strength', state.player.rupture);
        pushLog(`  Rupture: +${state.player.rupture} Strength.`);
      }
      break;

    case 'loseEnergy':
      state.energy = Math.max(0, state.energy - eff.amount);
      pushLog(`  Lost ${eff.amount} Energy.`);
      break;

    case 'gainEnergy':
      state.energy += eff.amount;
      pushLog(`  Gained ${eff.amount} Energy.`);
      break;

    case 'applyStatus':
      for (const t of targets) {
        applyStatus(t, eff.status, eff.amount);
        pushLog(`  ${t.name || 'You'} gained ${eff.amount} ${eff.status}.`);
      }
      break;

    case 'gainEnergyNextTurn':
      if (source.nextTurnEnergy !== undefined) source.nextTurnEnergy += eff.amount;
      pushLog(`  +${eff.amount} energy next turn.`);
      break;

    case 'gainEnergyPerTurn':
      state.player.perTurnEnergy = (state.player.perTurnEnergy || 0) + eff.amount;
      if (eff.selfDamagePerTurn) {
        state.player.perTurnHooks.push({ kind: 'selfDamage', amount: eff.selfDamagePerTurn });
      }
      pushLog(`  +${eff.amount} energy each turn.`);
      break;

    case 'draw':
      if (source === state.player) {
        draw(state, eff.amount);
        pushLog(`  Drew ${eff.amount}.`);
      }
      break;

    case 'recoverFromDiscard': {
      if (state.discardPile.length) {
        const idx = Math.floor(state.rng() * state.discardPile.length);
        const c = state.discardPile.splice(idx, 1)[0];
        state.drawPile.push(c);
        pushLog(`  Recovered ${CARDS[c.defId].name} from discard.`);
      }
      break;
    }

    case 'topDeckRandom': {
      if (state.hand.length) {
        const idx = Math.floor(state.rng() * state.hand.length);
        const c = state.hand.splice(idx, 1)[0];
        state.drawPile.push(c);
        pushLog(`  Put ${CARDS[c.defId].name} on top of draw pile.`);
      }
      break;
    }

    case 'addCardToDraw': {
      const c = makeCard(eff.cardId);
      state.drawPile.push(c);
      state.drawPile = shuffle(state.drawPile, state.rng);
      pushLog(`  Added ${CARDS[eff.cardId].name} to draw pile.`);
      break;
    }

    case 'addCardToPlayerDraw': {
      const c = makeCard(eff.cardId);
      state.drawPile.push(c);
      state.drawPile = shuffle(state.drawPile, state.rng);
      pushLog(`  Added ${CARDS[eff.cardId].name} to your draw pile.`);
      break;
    }

    case 'addCardToPlayerDiscard': {
      state.discardPile.push(makeCard(eff.cardId));
      pushLog(`  Added ${CARDS[eff.cardId].name} to your discard pile.`);
      break;
    }

    case 'exhaustRandom': {
      if (state.hand.length) {
        const idx = Math.floor(state.rng() * state.hand.length);
        const removed = state.hand.splice(idx, 1)[0];
        state.exhaustPile.push(removed);
        pushLog(`  Exhausted ${CARDS[removed.defId].name}.`);
      }
      break;
    }

    case 'feed': {
      const killed = targets.some(t => t.hp <= 0);
      if (killed) {
        state.player.maxHp += eff.amount;
        state.player.hp += eff.amount;
        state.run.maxHp += eff.amount;
        pushLog(`  Feed! Max HP +${eff.amount}.`);
      }
      break;
    }

    case 'gainStatusPerTurn':
      if (!state.player.perTurnStatuses) state.player.perTurnStatuses = [];
      state.player.perTurnStatuses.push({ status: eff.status, amount: eff.amount });
      pushLog(`  Will gain ${eff.amount} ${eff.status} each turn.`);
      break;

    case 'doubleTapNextAttack':
      state.player.doubleTapNextAttack = true;
      pushLog('  Next attack this turn will play twice.');
      break;

    case 'juggernaut':
      state.player.juggernaut = (state.player.juggernaut || 0) + eff.amount;
      pushLog(`  Juggernaut ${eff.amount}.`);
      break;

    case 'rupture':
      state.player.rupture = (state.player.rupture || 0) + 1;
      pushLog('  Rupture active.');
      break;

    default:
      pushLog(`  Unknown effect: ${eff.kind}`);
  }
}

export function dealDamage(attacker, target, base, strengthMultiplier) {
  const strBonus = outgoingFlatBonus(attacker) * (strengthMultiplier ?? 1);
  let dmg = base + strBonus;
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

  // End-of-turn self-damage cards (Burn)
  for (const c of state.hand) {
    const def = CARDS[c.defId];
    if (def.endOfTurnDamage) {
      state.player.hp = Math.max(0, state.player.hp - def.endOfTurnDamage);
      pushLog(`${def.name}: took ${def.endOfTurnDamage}.`);
    }
  }
  if (state.player.hp <= 0) { endCombat(false); return; }

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
    e.cardDiscard.push(card);
    tickStatuses(e);
    rollIntent(e);
  }

  if (state.player.hp <= 0) {
    pushLog('Defeat.');
    endCombat(false);
    return;
  }

  // Per-turn player effects
  if (state.player.perTurnStatuses) {
    for (const entry of state.player.perTurnStatuses) {
      applyStatus(state.player, entry.status, entry.amount);
    }
  }
  if (state.player.perTurnHooks) {
    for (const h of state.player.perTurnHooks) {
      if (h.kind === 'selfDamage') {
        state.player.hp = Math.max(0, state.player.hp - h.amount);
      }
    }
  }
  if (state.player.hp <= 0) { endCombat(false); return; }

  // Bonus energy per turn
  if (state.player.perTurnEnergy) {
    state.player.nextTurnEnergy += state.player.perTurnEnergy;
  }

  startPlayerTurn();
}
