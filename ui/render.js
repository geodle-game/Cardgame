import { state, newCombat } from '../systems/state.js';
import {
  canPlay, playCard, beginEnemyTurn, resolveEnemyTurn,
} from '../systems/combat.js';
import { CARDS } from '../data/cards.js';

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (state.over) return renderEnd(app);

  app.appendChild(topRow());
  app.appendChild(handRow());
  app.appendChild(bottomBar());
  app.appendChild(logEl());
}

function topRow() {
  const row = document.createElement('div');
  row.className = 'top';
  row.appendChild(playerPanel());

  const enemies = document.createElement('div');
  enemies.className = 'enemies';
  for (const e of state.enemies) enemies.appendChild(enemyPanel(e));
  row.appendChild(enemies);
  return row;
}

function playerPanel() {
  const p = state.player;
  const el = document.createElement('div');
  el.className = 'panel player';
  el.innerHTML = `
    <div class="panel-name">You</div>
    <div class="hp">HP ${p.hp} / ${p.maxHp}</div>
    <div class="block">Block ${p.block}</div>
    <div class="energy">Energy ${state.energy} / ${state.maxEnergy}</div>
    ${statusRow(p.statuses)}
  `;
  return el;
}

function enemyPanel(e) {
  const dead = e.hp <= 0;
  const el = document.createElement('div');
  el.className = 'panel enemy' + (dead ? ' enemy-dead' : '');
  if (!dead) el.dataset.uid = e.uid;

  const selected = !dead && state.selectedEnemyId === e.uid;
  if (selected) el.classList.add('enemy-selected');

  const intent = dead
    ? '—'
    : `${e.intent.kind} ${e.intent.amount ?? ''}`.trim();

  el.innerHTML = `
    <div class="panel-name">${e.name}</div>
    <div class="hp">HP ${e.hp} / ${e.maxHp}</div>
    <div class="block">Block ${e.block}</div>
    <div class="intent">Intent: ${intent}</div>
    ${statusRow(e.statuses)}
  `;

  if (!dead) {
    el.addEventListener('click', () => {
      state.selectedEnemyId = e.uid;
      render();
    });
  }
  return el;
}

function statusRow(statuses) {
  const keys = Object.keys(statuses || {});
  if (!keys.length) return '';
  return `<div class="statuses">${keys
    .map(k => `<span class="status">${k} ${statuses[k]}</span>`)
    .join('')}</div>`;
}

function handRow() {
  const hand = document.createElement('div');
  hand.className = 'hand';
  for (const card of state.hand) hand.appendChild(cardEl(card));
  return hand;
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

function bottomBar() {
  const bar = document.createElement('div');
  bar.className = 'bar';

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'End Turn';
  btn.disabled = state.turn !== 'player';
  btn.addEventListener('click', () => {
    beginEnemyTurn();
    render();
    setTimeout(() => {
      resolveEnemyTurn();
      render();
    }, 450);
  });
  bar.appendChild(btn);

  const piles = document.createElement('span');
  piles.className = 'piles';
  piles.textContent =
    `Draw ${state.drawPile.length} · Discard ${state.discardPile.length} · Exhaust ${state.exhaustPile.length}`;
  bar.appendChild(piles);

  return bar;
}

function logEl() {
  const el = document.createElement('div');
  el.className = 'log';
  el.textContent = state.log.slice(-8).join('\n');
  return el;
}

function renderEnd(app) {
  const banner = document.createElement('div');
  banner.className = 'banner';
  banner.textContent = state.result === 'win' ? 'Victory' : 'Defeat';
  app.appendChild(banner);

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'New Combat';
  btn.addEventListener('click', () => {
    newCombat();
    render();
  });
  app.appendChild(btn);

  const log = document.createElement('div');
  log.className = 'log';
  log.textContent = state.log.slice(-12).join('\n');
  app.appendChild(log);
}
