import { state, chooseRelic, confirmDeck, newCombat, newRun } from '../systems/state.js';
import {
  canPlay, playCard, selectCardForPlay, beginEnemyTurn, resolveEnemyTurn,
} from '../systems/combat.js';
import { CARDS } from '../data/cards.js';
import { RELICS } from '../data/relics.js';

let lastRelicTrigger = 0;

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (state.screen === 'relicPick') return renderRelicPick(app);
  if (state.screen === 'deckView') return renderDeckView(app);
  if (state.screen === 'combat') return renderCombat(app);
  renderGameOver(app);
}

export function flashRelic() {
  lastRelicTrigger = Date.now();
}

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

function renderDeckView(app) {
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const relic = RELICS[state.run.relic];
  const h = document.createElement('h1');
  h.textContent = 'Your Starting Deck';
  wrap.appendChild(h);

  const sub = document.createElement('p');
  sub.className = 'muted';
  sub.innerHTML = `<strong style="color:#c9a3ff">${relic.name}</strong> — ${relic.text}`;
  wrap.appendChild(sub);

  const grid = document.createElement('div');
  grid.className = 'deck-grid';
  state.run.deckIds.forEach((id, i) => {
    const el = cardFace(id, { disabled: true, small: true });
    el.style.animationDelay = `${i * 30}ms`;
    grid.appendChild(el);
  });
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

function renderCombat(app) {
  const c = document.createElement('div');
  c.className = 'combat';

  const top = document.createElement('div');
  top.className = 'top';

  top.appendChild(pileEl('Draw', state.drawPile.length, 'left'));

  const mid = document.createElement('div');
  mid.className = 'top-mid';
  mid.appendChild(playerPanel());

  const enemies = document.createElement('div');
  enemies.className = 'enemies';
  for (const e of state.enemies) enemies.appendChild(enemyPanel(e));
  mid.appendChild(enemies);

  top.appendChild(mid);
  top.appendChild(pileEl('Discard', state.discardPile.length, 'right'));
  c.appendChild(top);

  if (state.pendingCardUid) {
    const hint = document.createElement('div');
    hint.className = 'target-hint';
    hint.textContent = 'Choose a target…';
    c.appendChild(hint);
  }

  const hand = document.createElement('div');
  hand.className = 'hand';
  state.hand.forEach((card, i) => {
    const el = cardInHand(card);
    el.style.animationDelay = `${i * 40}ms`;
    hand.appendChild(el);
  });
  c.appendChild(hand);

  c.appendChild(bottomBar());
  c.appendChild(logEl());

  if (state.over) c.appendChild(endBanner());

  if (state.run.relic) c.appendChild(relicChip());

  app.appendChild(c);
}

function relicChip() {
  const r = RELICS[state.run.relic];
  const el = document.createElement('div');
  el.className = 'relic-chip';
  if (Date.now() - lastRelicTrigger < 700) el.classList.add('triggered');
  el.innerHTML = `
    <div class="relic-name">${r.name}</div>
    <div class="relic-text">${r.text}</div>
  `;
  return el;
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
  el.dataset.panel = 'player';
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
  el.dataset.panel = 'enemy';
  el.dataset.uid = e.uid;

  if (!dead && state.selectedEnemyId === e.uid) el.classList.add('enemy-selected');
  if (!dead && state.pendingCardUid) el.classList.add('enemy-targetable');

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
          const rect = el.getBoundingClientRect();
          playCard(card, e.uid);
          render();
          spawnFloat(rect.left + rect.width / 2, rect.top + 20, `-${CARDS[card.defId].effects[0]?.amount ?? '?'}`, 'damage');
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
    .map(k => `<span class="status ${k}">${k} ${statuses[k]}</span>`)
    .join('')}</div>`;
}

function cardInHand(card) {
  const def = CARDS[card.defId];
  const el = cardFace(card.defId);
  el.classList.add(`rarity-${def.rarity || 'common'}`);
  if (!canPlay(card)) el.classList.add('disabled');
  if (state.pendingCardUid === card.uid) el.classList.add('pending');
  el.addEventListener('click', () => {
    const rect = el.getBoundingClientRect();
    const wasPending = state.pendingCardUid;
    selectCardForPlay(card);
    if (!state.pendingCardUid && !wasPending) {
      // card actually played
      el.classList.add('played');
      setTimeout(render, 180);
    } else {
      render();
    }
  });
  return el;
}

function cardFace(defId, { disabled = false, small = false } = {}) {
  const def = CARDS[defId];
  const el = document.createElement('div');
  el.className = 'card' + (disabled ? ' disabled' : '') + (small ? ' card-small' : '');
  el.classList.add(`rarity-${def.rarity || 'common'}`);
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
      const before = state.player.hp;
      resolveEnemyTurn();
      render();
      if (state.player.hp < before) shakePanel('player');
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
  el.scrollTop = el.scrollHeight;
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

// ---------- Animations ----------

export function spawnFloat(x, y, text, kind = 'damage') {
  const el = document.createElement('div');
  el.className = `float-text ${kind}`;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

export function shakePanel(which) {
  const el = document.querySelector(`[data-panel="${which}"]`);
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 400);
}
