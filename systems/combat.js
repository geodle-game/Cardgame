import { state, pushLog, rollIntent } from './state.js';
import { draw, discardHand } from './deck.js';
import { CARDS } from '../data/cards.js';

export function canPlay(card) {
  if (state.turn !== 'player') return false;
  return state.energy >= CARDS[card.defId].cost;
}

function dealDamage(attacker, target, amount) {
  const blocked = Math.min(target.block, amount);
  target.block -= blocked;
  const dealt = amount - blocked;
  target.hp = Math.max(0, target.hp - dealt);
  return { dealt, blocked };
}

export function playCard(card) {
  if (!canPlay(card)) return;

  const def = CARDS[card.defId];
  state.energy -= def.cost;

  for (const eff of def.effects) {
    if (eff.kind === 'damage') {
      const r = dealDamage(state.player, state.enemy, eff.amount);
      pushLog(`You dealt ${r.dealt} (blocked ${r.blocked}).`);
    } else if (eff.kind === 'block') {
      state.player.block += eff.amount;
      pushLog(`You gained ${eff.amount} block.`);
    }
  }

  state.hand = state.hand.filter(c => c.uid !== card.uid);
  state.discardPile.push(card);

  if (state.enemy.hp <= 0) {
    state.turn = 'over';
    pushLog('Victory.');
  }
}

export function endTurn() {
  if (state.turn !== 'player') return;

  discardHand(state);
  state.turn = 'enemy';

  setTimeout(() => {
    if (state.turn === 'over') return;

    const e = state.enemy;
    const intent = e.intent;

    if (intent.kind === 'attack') {
      const r = dealDamage(e, state.player, intent.amount);
      pushLog(`Enemy hit you for ${r.dealt} (blocked ${r.blocked}).`);
    } else if (intent.kind === 'block') {
      e.block += intent.amount;
      pushLog(`Enemy gained ${intent.amount} block.`);
    }

    if (state.player.hp <= 0) {
      state.turn = 'over';
      pushLog('Defeat.');
      return;
    }

    rollIntent();
    state.player.block = 0;
    state.energy = state.maxEnergy;
    state.turn = 'player';
    draw(state, 5);
    pushLog('Your turn.');
  }, 400);
}
