import { state, chooseRelic, confirmDeck, newCombat, newRun } from '../systems/state.js';
import {
  canPlay, playCard, selectCardForPlay, beginEnemyTurn, resolveEnemyTurn,
} from '../systems/combat.js';
import { CARDS } from '../data/cards.js';
import { RELICS } from '../data/relics.js';
import { ENEMY_CARDS } from '../data/enemy-cards.js';

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (state.screen === 'relicPick') return renderRelicPick(app);
  if (state.screen === 'deckView') return renderDeckView(app);
  if (state.screen === 'combat') return renderCombat(app);
  renderGameOver(app);
}

// ---------------- Relic pick ----------------

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

// ---------------- Deck view ----------------

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

// ---------------- Combat ----------------

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
  const wrap = document.createElement('div');
  wrap.className = 'enemy-wrap' + (dead ? ' enemy-wrap-dead' : '');

  const el = document.createElement('div');
  el.className = 'panel enemy' + (dead ? ' enemy-dead' : '');
  el.dataset.panel = 'enemy';
  el.dataset.uid = e.uid;

  if (!dead && state.selectedEnemyId === e.uid) el.classList.add('enemy-selected');
  if (!dead && state.pendingCardUid) el.classList.add('enemy-targetable');

  el.innerHTML = `
    <div class="panel-name">${e.name}</div>
    <div class="hp">HP ${e.hp} / ${e.maxHp}</div>
    <div class="block">Block ${e.block}</div>
    ${statusRow(e.statuses)}
  `;

  if (!dead) {
    el.addEventListener('click', () => {
      if (state.pendingCardUid) {
        const card = state.hand.find(c => c.uid === state.pendingCardUid);
        if (card) {
          doPlayCard(card, el, e.uid);
          return;
        }
      }
      state.selectedEnemyId = e.uid;
      render();
    });
  }
  wrap.appendChild(el);

  if (!dead && e.intentCard) {
    wrap.appendChild(enemyIntentCard(e.intentCard));
  }

  return wrap;
}

function enemyIntentCard(card) {
  const def = ENEMY_CARDS[card.defId];
  const el = document.createElement('div');
  el.className = 'enemy-card';
  el.innerHTML = `
    <div class="enemy-card-name">${def.name}</div>
    <div class="enemy-card-text">${def.text}</div>
  `;
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
  if (!canPlay(card)) el.classList.add('disabled');
  if (state.pendingCardUid === card.uid) el.classList.add('pending');

  el.addEventListener('click', () => {
    if (!canPlay(card)) return;

    // If targeting, we need a target. If only one enemy alive, auto-target it.
    if (def.target === 'enemy') {
      const living = state.enemies.filter(x => x.hp > 0);
      if (living.length > 1) {
        selectCardForPlay(card);
        render();
        return;
      }
      if (living.length === 1) {
        const targetEl = document.querySelector(`[data-panel="enemy"][data-uid="${living[0].uid}"]`);
        doPlayCard(card, el, living[0].uid);
        return;
      }
    }

    doPlayCard(card, el, null);
  });

  return el;
}

function doPlayCard(card, sourceEl, targetUid) {
  const def = CARDS[card.defId];
  const targetEl = targetUid
    ? document.querySelector(`[data-panel="enemy"][data-uid="${targetUid}"]`)
    : document.querySelector(`[data-panel="player"]`);

  // Capture source position for the flight animation.
  if (sourceEl) {
    const sRect = sourceEl.getBoundingClientRect();
    const tRect = targetEl ? targetEl.getBoundingClientRect() : sRect;
    const dx = (tRect.left + tRect.width / 2) - (sRect.left + sRect.width / 2);
    const dy = (tRect.top + tRect.height / 2) - (sRect.top + sRect.height / 2);
    sourceEl.style.setProperty('--fly-x', `${dx}px`);
    sourceEl.style.setProperty('--fly-y', `${dy}px`);
    sourceEl.classList.add('playing');
  }

  // Wait for the flight to be most of the way there, then resolve.
  setTimeout(() => {
    playCard(card, targetUid);
    render();

    // Impact effects
    if (targetEl) {
      const r = targetEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      spawnSpark(cx, cy);

      const hasDamage = def.effects.some(e => e.kind === 'damage' || e.kind === 'damageEqualToBlock');
      const hasBlock = def.effects.some(e => e.kind === 'block');
      const hasHeal = def.effects.some(e => e.kind === 'heal');

      if (hasDamage && targetUid) {
        shakePanel(targetUid);
        flashPanel(targetUid);
        spawnFloat(cx, cy - 20, 'HIT', 'damage');
      }
      if (hasBlock) {
        const p = document.querySelector('[data-panel="player"]');
        if (p) {
          const pr = p.getBoundingClientRect();
          spawnFloat(pr.left + pr.width / 2, pr.top + 20, '+BLOCK', 'block');
        }
      }
      if (hasHeal) {
        const p = document.querySelector('[data-panel="player"]');
        if (p) {
          const pr = p.getBoundingClientRect();
          spawnFloat(pr.left + pr.width / 2, pr.top + 20, '+HP', 'heal');
        }
      }
    }
  }, 220);
}

function cardFace(defId, { disabled = false, small = false } = {}) {
  const def = CARDS[defId];
  const el = document.createElement('div');
  el.className = 'card';
  if (disabled) el.classList.add('disabled');
  if (small) el.classList.add('card-small');
  el.classList.add(`rarity-${def.rarity || 'common'}`);
  el.classList.add(`type-${def.type || 'skill'}`);
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

// ---------------- Animation helpers ----------------

export function spawnFloat(x, y, text, kind = 'damage') {
  const el = document.createElement('div');
  el.className = `float-text ${kind}`;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

export function spawnSpark(x, y) {
  const el = document.createElement('div');
  el.className = 'hit-spark';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 450);
}

export function shakePanel(uid) {
  const sel = uid
    ? `[data-panel="enemy"][data-uid="${uid}"]`
    : `[data-panel="player"]`;
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 420);
}

export function flashPanel(uid) {
  const sel = uid
    ? `[data-panel="enemy"][data-uid="${uid}"]`
    : `[data-panel="player"]`;
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.add('hit-flash');
  setTimeout(() => el.classList.remove('hit-flash'), 420);
}
