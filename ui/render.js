import { state, chooseRelic, confirmDeck, newCombat, newRun } from '../systems/state.js';
import {
  canPlay, playCard, selectCardForPlay, beginEnemyTurn, resolveEnemyTurn,
} from '../systems/combat.js';
import { CARDS } from '../data/cards.js';
import { RELICS } from '../data/relics.js';
import { makeCard } from '../systems/deck.js';

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (state.screen === 'relicPick') return renderRelicPick(app);
  if (state.screen === 'deckView') return renderDeckView(app);
  if (state.screen === 'combat') return renderCombat(app);
  renderGameOver(app);
}

// ---------- Relic pick ----------

function renderRelicPick(app) {
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const h = document.createElement('h1');
  h.textContent = 'Choose a Relic';
  wrap.appendChild(h);

  const row = document.createElement('div');
  row.className = 'relic-row';
  for (const id of state.relicChoices) {
    const r = RELICS[id];
    const el = document.createElement('button');
    el.className = 'relic-card';
    el.innerHTML = `
      <div class="relic-name">${r.name}</div>
      <div class="relic-text">${r.text}</div>
    `;
    el.addEventListener('click', () => {
      chooseRelic(id);
      render();
    });
    row.appendChild(el);
  }
  wrap.appendChild(row);
  app.appendChild(wrap);
}

// ---------- Deck view ----------

function renderDeckView(app) {
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const relic = RELICS[state.run.relic];
  const h = document.createElement('h1');
  h.textContent = 'Your Starting Deck';
  wrap.appendChild(h);

  const sub = document.createElement('p');
  sub.className = 'muted';
  sub.textContent = `Relic: ${relic.name} — ${relic.text}`;
  wrap.appendChild(sub);

  const grid = document.createElement('div');
  grid.className = 'deck-grid';
  for (const id of state.run.deckIds) {
    grid.appendChild(cardFace(id, { disabled: true, small: true }));
  }
  wrap.appendChild(grid);

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Begin';
  btn.addEventListener('click', () => {
    confirmDeck();
    render();
  });
  wrap.appendChild(btn);

  app.appendChild(wrap);
}

// ---------- Combat ----------

function renderCombat(app) {
  const c = document.createElement('div');
  c.className = 'combat';

  const top = document.createElement('div');
  top.className = 'top';

  const leftPile = pileEl('Draw', state.drawPile.length, 'left');
  const rightPile = pileEl('Discard', state.discardPile.length, 'right');

  const mid = document.createElement('div');
  mid.className = 'top-mid';
  mid.appendChild(playerPanel());

  const enemies = document.createElement('div');
  enemies.className = 'enemies';
  for (const e of state.enemies) enemies.appendChild(enemyPanel(e));
  mid.appendChild(enemies);

  top.appendChild(leftPile);
  top.appendChild(mid);
  top.appendChild(rightPile);
  c.appendChild(top);

  if (state.pendingCardUid) {
    const hint = document.createElement('div');
    hint.className = 'target-hint';
    hint.textContent = 'Choose a target…';
    c.appendChild(hint);
  }

  const hand = document.createElement('div');
  hand.className = 'hand';
  for (const card of state.hand) hand.appendChild(cardInHand(card));
  c.appendChild(hand);

  c.appendChild(bottomBar());
  c.appendChild(logEl());

  if (state.over) c.appendChild(endBanner());

  app.appendChild(c);
}

function pileEl(label, count, side) {
  const el = document.createElement('div');
  el.className = `pile pile-${side}`;
  el.innerHTML = `
    <div class="pile-label">${label}</div>
    <div class="pile-count">${count}</div>
  `;
  return el;
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
  const targetable = !dead && state.pendingCardUid;
  if (selected) el.classList.add('enemy-selected');
  if (targetable) el.classList.add('enemy-targetable');

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
      if (state.pendingCardUid) {
        const card = state.hand.find(c => c.uid === state.pendingCardUid);
        if (card) {
          playCard(card, e.uid);
          render();
          return;
        }
      }
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

function cardInHand(card) {
  const el = cardFace(card.defId);
  const ok = canPlay(card);
  if (!ok) el.classList.add('disabled');
  if (state.pendingCardUid === card.uid) el.classList.add('pending');
  el.addEventListener('click', () => {
    selectCardForPlay(card);
    render();
  });
  return el;
}

function cardFace(defId, { disabled = false, small = false } = {}) {
  const def = CARDS[defId];
  const el = document.createElement('div');
  el.className = 'card' + (disabled ? ' disabled' : '') + (small ? ' card-small' : '');
  el.innerHTML = `
    <div class="cost">${def.cost}</div>
    <div class="cname">${def.name}</div>
    <div class="ctext">${def.text}</div>
  `;
  return el;
}

function bottomBar() {
  const bar = document.createElement('div');
  bar.className = 'bar';

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'End Turn';
  btn.disabled = state.turn !== 'player' || state.over;
  btn.addEventListener('click', () => {
    state.pendingCardUid = null;
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

function endBanner() {
  const el = document.createElement('div');
  el.className = 'banner';
  el.textContent = state.result === 'win' ? 'Victory' : 'Defeat';

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = state.result === 'win' ? 'Continue (placeholder)' : 'New Run';
  btn.addEventListener('click', () => {
    if (state.result === 'win') {
      // Act loop not built yet — just start another combat.
      newCombat();
      render();
    } else {
      newRun();
      render();
    }
  });
  el.appendChild(btn);
  return el;
}

function renderGameOver(app) {
  const el = document.createElement('div');
  el.className = 'screen screen-center';
  el.textContent = 'Game over.';
  app.appendChild(el);
}
