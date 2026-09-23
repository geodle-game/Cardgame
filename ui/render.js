import { state } from '../systems/state.js';
import { CARDS } from '../data/cards.js';
import { canPlay, playCard, endTurn } from '../systems/combat.js';
import { newCombat } from '../systems/state.js';

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (state.turn === 'over') {
    const banner = document.createElement('div');
    banner.className = 'banner';
    banner.textContent = state.player.hp <= 0 ? 'Defeat' : 'Victory';
    app.appendChild(banner);

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'New Combat';
    btn.addEventListener('click', () => {
      newCombat();
      render();
    });
    app.appendChild(btn);
    return;
  }

  const top = document.createElement('div');
  top.className = 'top';
  top.appendChild(playerPanel());
  top.appendChild(enemyPanel());
  app.appendChild(top);

  const hand = document.createElement('div');
  hand.className = 'hand';
  for (const card of state.hand) hand.appendChild(cardEl(card));
  app.appendChild(hand);

  const bar = document.createElement('div');
  bar.className = 'bar';

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'End Turn';
  btn.disabled = state.turn !== 'player';
  btn.addEventListener('click', () => {
    endTurn();
    render();
    setTimeout(render, 450);
  });
  bar.appendChild(btn);

  const piles = document.createElement('span');
  piles.className = 'piles';
  piles.textContent = `Draw ${state.drawPile.length} · Discard ${state.discardPile.length}`;
  bar.appendChild(piles);
  app.appendChild(bar);

  const log = document.createElement('div');
  log.className = 'log';
  log.textContent = state.log.slice(-6).join('\n');
  app.appendChild(log);
}

function playerPanel() {
  const p = state.player;
  const el = document.createElement('div');
  el.className = 'panel';
  el.innerHTML = `
    <div><strong>You</strong></div>
    <div class="hp">HP ${p.hp} / ${p.maxHp}</div>
    <div class="block">Block ${p.block}</div>
    <div class="energy">Energy ${state.energy} / ${state.maxEnergy}</div>
  `;
  return el;
}

function enemyPanel() {
  const e = state.enemy;
  const el = document.createElement('div');
  el.className = 'panel';
  el.innerHTML = `
    <div><strong>${e.name}</strong></div>
    <div class="hp">HP ${e.hp} / ${e.maxHp}</div>
    <div class="block">Block ${e.block}</div>
    <div class="intent">Intent: ${e.intent.kind} ${e.intent.amount}</div>
  `;
  return el;
}

function cardEl(card) {
  const def = CARDS[card.defId];
  const ok = canPlay(card);
  const el = document.createElement('div');
  el.className = 'card' + (ok ? '' : ' disabled');
  el.innerHTML = `
    <div class="cost">${def.cost}</div>
    <div class="cname">${def.name}</div>
    <div class="ctext">${def.text}</div>
  `;
  el.addEventListener('click', () => {
    if (playCard(card)) render();
  });
  return el;
}
