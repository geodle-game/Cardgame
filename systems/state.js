import {
  state, chooseRelic, confirmDeck, newRun, startNode, backToMap,
  claimReward, takeRewardCard, skipRewardCard,
  pickEventChoice, buyShopCard, buyShopHeal,
  restHeal, restUpgrade, newCombat,
  toggleDeckOverlay, toggleRelicOverlay, closeOverlays,
} from '../systems/state.js';
import {
  canPlay, playCard, selectCardForPlay, beginEnemyTurn, resolveEnemyTurn,
} from '../systems/combat.js';
import { CARDS } from '../data/cards.js';
import { RELICS } from '../data/relics.js';
import { ENEMY_CARDS } from '../data/enemy-cards.js';
import { NODE_TYPES } from '../data/maps.js';
import { getNode, reachableFrom, startingNodes } from '../systems/map.js';

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  switch (state.screen) {
    case 'relicPick': renderRelicPick(app); break;
    case 'deckView':  renderDeckView(app);  break;
    case 'map':       renderMap(app);       break;
    case 'combat':    renderCombat(app);    break;
    case 'reward':    renderReward(app);    break;
    case 'event':     renderEvent(app);     break;
    case 'shop':      renderShop(app);      break;
    case 'rest':      renderRest(app);      break;
    default:          renderGameOver(app);
  }

  // Overlays on top of whatever screen is showing
  if (state.overlays?.deck) renderDeckOverlay(app);
  if (state.overlays?.relics) renderRelicOverlay(app);
}

// ---------------- Top-right buttons ----------------

function topButtons() {
  const wrap = document.createElement('div');
  wrap.className = 'top-buttons';

  const deckBtn = document.createElement('button');
  deckBtn.className = 'icon-btn';
  deckBtn.title = 'View deck';
  deckBtn.textContent = `🂠 ${state.run.deckIds.length}`;
  deckBtn.addEventListener('click', () => { toggleDeckOverlay(); render(); });
  wrap.appendChild(deckBtn);

  if (state.run.relics?.length) {
    const relicBtn = document.createElement('button');
    relicBtn.className = 'icon-btn';
    relicBtn.title = 'View relics';
    relicBtn.textContent = `★ ${state.run.relics.length}`;
    relicBtn.addEventListener('click', () => { toggleRelicOverlay(); render(); });
    wrap.appendChild(relicBtn);
  }

  return wrap;
}

function renderDeckOverlay(app) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) { closeOverlays(); render(); }
  });

  const panel = document.createElement('div');
  panel.className = 'overlay-panel';
  panel.appendChild(overlayHeader('Your Deck', closeOverlays));

  const grid = document.createElement('div');
  grid.className = 'deck-grid';
  // Sort by type then name for readability
  const ids = state.run.deckIds.slice().sort((a, b) => {
    const A = CARDS[a], B = CARDS[b];
    return (A.type || '').localeCompare(B.type || '') || A.name.localeCompare(B.name);
  });
  for (const id of ids) grid.appendChild(cardFace(id, { small: true, disabled: true }));
  panel.appendChild(grid);

  overlay.appendChild(panel);
  app.appendChild(overlay);
}

function renderRelicOverlay(app) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) { closeOverlays(); render(); }
  });

  const panel = document.createElement('div');
  panel.className = 'overlay-panel';
  panel.appendChild(overlayHeader('Your Relics', closeOverlays));

  const list = document.createElement('div');
  list.className = 'relic-list';
  for (const id of state.run.relics) {
    const r = RELICS[id];
    const el = document.createElement('div');
    el.className = 'relic-row-item';
    el.innerHTML = `
      <div class="relic-name">${r.name}</div>
      <div class="relic-text">${r.text}</div>
    `;
    list.appendChild(el);
  }
  panel.appendChild(list);

  overlay.appendChild(panel);
  app.appendChild(overlay);
}

function overlayHeader(title, onClose) {
  const head = document.createElement('div');
  head.className = 'overlay-header';
  const h = document.createElement('h2');
  h.textContent = title;
  head.appendChild(h);
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Close';
  btn.addEventListener('click', () => { onClose(); render(); });
  head.appendChild(btn);
  return head;
}

// ---------------- Relic pick / deck view ----------------

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
    el.innerHTML = `<div class="relic-name">${r.name}</div><div class="relic-text">${r.text}</div>`;
    el.addEventListener('click', () => { chooseRelic(id); render(); });
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
  btn.addEventListener('click', () => { confirmDeck(); render(); });
  wrap.appendChild(btn);
  app.appendChild(wrap);
}

// ---------------- Map ----------------

function renderMap(app) {
  const map = state.run.map;
  const wrap = document.createElement('div');
  wrap.className = 'screen map-screen';

  const header = document.createElement('div');
  header.className = 'map-header';
  header.innerHTML = `
    <div>HP <span class="hp">${state.run.hp}/${state.run.maxHp}</span></div>
    <div>Gold <span class="gold">${state.run.gold}</span></div>
    <div>Floor ${state.run.floor + 1} / ${map.floors}</div>
  `;
  wrap.appendChild(header);
  wrap.appendChild(topButtons());

  const board = document.createElement('div');
  board.className = 'map-board';

  const rowH = 64;
  const colW = 92;
  const padX = 40;
  const padY = 30;

  const maxCol = Math.max(...map.nodes.map(n => n.col));
  const width = padX * 2 + (maxCol + 1) * colW;
  const height = padY * 2 + (map.floors + 1) * rowH;
  board.style.width = width + 'px';
  board.style.height = height + 'px';

  const pos = (n) => ({
    x: padX + n.col * colW + colW / 2,
    y: height - (padY + n.floor * rowH + rowH / 2),
  });

  const currentNode = state.run.currentNodeId ? getNode(map, state.run.currentNodeId) : null;
  const reachableIds = currentNode
    ? reachableFrom(map, currentNode.id).map(n => n.id)
    : startingNodes(map).map(n => n.id);
  const reachSet = new Set(reachableIds);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'map-edges');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  for (const n of map.nodes) {
    const a = pos(n);
    for (const nextId of n.next) {
      const t = getNode(map, nextId);
      if (!t) continue;
      const b = pos(t);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const mx = (a.x + b.x) / 2;
      const d = `M ${a.x} ${a.y} Q ${mx} ${a.y} ${b.x} ${b.y}`;
      path.setAttribute('d', d);
      path.setAttribute('stroke', reachSet.has(nextId) ? '#8f6bff' : '#2a2f3a');
      path.setAttribute('stroke-width', reachSet.has(nextId) ? 2.5 : 1.5);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
    }
  }
  board.appendChild(svg);

  for (const n of map.nodes) {
    const { x, y } = pos(n);
    const info = NODE_TYPES[n.type];
    const el = document.createElement('button');
    el.className = 'map-node';
    el.style.left = (x - 26) + 'px';
    el.style.top = (y - 26) + 'px';
    el.style.borderColor = info.color;
    el.style.color = info.color;
    el.title = info.label;
    el.textContent = info.symbol;

    if (state.run.currentNodeId === n.id) el.classList.add('map-node-current');
    if (reachSet.has(n.id)) {
      el.classList.add('map-node-reachable');
      el.addEventListener('click', () => { startNode(n.id); render(); });
    } else {
      el.classList.add('map-node-locked');
    }
    board.appendChild(el);
  }

  wrap.appendChild(board);
  app.appendChild(wrap);
}

// ---------------- Reward / Event / Shop / Rest ----------------

function renderReward(app) {
  const r = state.reward;
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const h = document.createElement('h1');
  h.textContent = 'Victory';
  wrap.appendChild(h);

  const gold = document.createElement('p');
  gold.className = 'gold';
  gold.textContent = `+${r.coins} gold`;
  wrap.appendChild(gold);

  if (!r.taken) {
    const sub = document.createElement('p');
    sub.className = 'muted';
    sub.textContent = 'Choose a card:';
    wrap.appendChild(sub);

    const grid = document.createElement('div');
    grid.className = 'deck-grid';
    for (const id of r.cards) {
      const el = cardFace(id);
      el.addEventListener('click', () => { takeRewardCard(id); render(); });
      grid.appendChild(el);
    }
    wrap.appendChild(grid);

    const skip = document.createElement('button');
    skip.className = 'btn';
    skip.textContent = 'Skip';
    skip.addEventListener('click', () => { skipRewardCard(); render(); });
    wrap.appendChild(skip);
  }

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Continue';
  btn.addEventListener('click', () => { claimReward(); render(); });
  wrap.appendChild(btn);
  app.appendChild(wrap);
}

function renderEvent(app) {
  const ev = state.event.data;
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const h = document.createElement('h1');
  h.textContent = ev.name;
  wrap.appendChild(h);

  const p = document.createElement('p');
  p.className = 'event-text';
  p.textContent = ev.text;
  wrap.appendChild(p);

  const choices = document.createElement('div');
  choices.className = 'choice-col';
  ev.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn choice-btn';
    btn.textContent = c.label;
    btn.addEventListener('click', () => { pickEventChoice(i); render(); });
    choices.appendChild(btn);
  });
  wrap.appendChild(choices);
  app.appendChild(wrap);
}

function renderShop(app) {
  const s = state.shop;
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const h = document.createElement('h1');
  h.textContent = 'Shop';
  wrap.appendChild(h);

  const gold = document.createElement('p');
  gold.className = 'gold';
  gold.textContent = `Gold: ${state.run.gold}`;
  wrap.appendChild(gold);

  const grid = document.createElement('div');
  grid.className = 'shop-grid';
  s.items.forEach((item, i) => {
    const cell = document.createElement('div');
    cell.className = 'shop-cell';
    const card = cardFace(item.defId, { small: true });
    card.classList.add('shop-card');
    cell.appendChild(card);
    const price = document.createElement('div');
    price.className = 'shop-price';
    price.textContent = `${item.price}g`;
    cell.appendChild(price);
    const affordable = state.run.gold >= item.price;
    if (!affordable) cell.classList.add('shop-unaffordable');
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Buy';
    btn.disabled = !affordable;
    btn.addEventListener('click', () => { buyShopCard(i); render(); });
    cell.appendChild(btn);
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);

  const healRow = document.createElement('div');
  healRow.className = 'shop-heal';
  const healBtn = document.createElement('button');
  healBtn.className = 'btn';
  healBtn.textContent = `Heal 25 HP — ${s.healPrice}g`;
  healBtn.disabled = state.run.gold < s.healPrice;
  healBtn.addEventListener('click', () => { buyShopHeal(); render(); });
  healRow.appendChild(healBtn);
  wrap.appendChild(healRow);

  const leave = document.createElement('button');
  leave.className = 'btn';
  leave.textContent = 'Leave';
  leave.addEventListener('click', () => { backToMap(); render(); });
  wrap.appendChild(leave);
  app.appendChild(wrap);
}

function renderRest(app) {
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';
  const h = document.createElement('h1');
  h.textContent = 'Rest Site';
  wrap.appendChild(h);

  const healBtn = document.createElement('button');
  healBtn.className = 'btn';
  healBtn.textContent = 'Rest — heal 30%';
  healBtn.addEventListener('click', () => { restHeal(); render(); });
  wrap.appendChild(healBtn);

  const medBtn = document.createElement('button');
  medBtn.className = 'btn';
  medBtn.textContent = 'Meditate — heal 10%';
  medBtn.addEventListener('click', () => { restUpgrade(); render(); });
  wrap.appendChild(medBtn);
  app.appendChild(wrap);
}

// ---------------- Combat ----------------

function renderCombat(app) {
  const c = document.createElement('div');
  c.className = 'combat';

  c.appendChild(topButtons());

  const top = document.createElement('div');
  top.className = 'top';

  const mid = document.createElement('div');
  mid.className = 'top-mid';
  mid.appendChild(playerPanel());

  const enemies = document.createElement('div');
  enemies.className = 'enemies';
  for (const e of state.enemies) enemies.appendChild(enemyPanel(e));
  mid.appendChild(enemies);
  top.appendChild(mid);
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

  if (state.over) c.appendChild(endBanner());
  app.appendChild(c);
}

function pileEl(label, count) {
  const el = document.createElement('div');
  el.className = 'pile pile-bottom';
  el.innerHTML = `<div class="pile-label">${label}</div><div class="pile-count">${count}</div>`;
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
        if (card) { doPlayCard(card, null, e.uid); return; }
      }
      state.selectedEnemyId = e.uid;
      render();
    });
  }
  wrap.appendChild(el);

  if (!dead && e.intentCard) wrap.appendChild(enemyIntentCard(e.intentCard));
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
    if (def.target === 'enemy') {
      const living = state.enemies.filter(x => x.hp > 0);
      if (living.length > 1) { selectCardForPlay(card); render(); return; }
      if (living.length === 1) { doPlayCard(card, el, living[0].uid); return; }
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

  if (sourceEl) {
    const sRect = sourceEl.getBoundingClientRect();
    const tRect = targetEl ? targetEl.getBoundingClientRect() : sRect;
    const dx = (tRect.left + tRect.width / 2) - (sRect.left + sRect.width / 2);
    const dy = (tRect.top + tRect.height / 2) - (sRect.top + sRect.height / 2);
    sourceEl.style.setProperty('--fly-x', `${dx}px`);
    sourceEl.style.setProperty('--fly-y', `${dy}px`);
    sourceEl.classList.add('playing');
  }

  setTimeout(() => {
    playCard(card, targetUid);
    render();
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
        if (p) { const pr = p.getBoundingClientRect(); spawnFloat(pr.left + pr.width / 2, pr.top + 20, '+BLOCK', 'block'); }
      }
      if (hasHeal) {
        const p = document.querySelector('[data-panel="player"]');
        if (p) { const pr = p.getBoundingClientRect(); spawnFloat(pr.left + pr.width / 2, pr.top + 20, '+HP', 'heal'); }
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
  if (def.retain) el.classList.add('card-retain');
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

  bar.appendChild(pileEl('Draw', state.drawPile.length));

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'End Turn';
  btn.disabled = state.turn !== 'player' || state.over;
  btn.addEventListener('click', () => {
    state.pendingCardUid = null;
    beginEnemyTurn();
    render();
    setTimeout(() => { resolveEnemyTurn(); render(); }, 450);
  });
  bar.appendChild(btn);

  bar.appendChild(pileEl('Discard', state.discardPile.length));
  return bar;
}

function endBanner() {
  const el = document.createElement('div');
  el.className = 'banner';
  el.textContent = state.result === 'win' ? 'Victory' : 'Defeat';

  const btn = document.createElement('button');
  btn.className = 'btn';
  if (state.result === 'win') {
    btn.textContent = 'Rewards';
    btn.addEventListener('click', () => { state.screen = 'reward'; render(); });
  } else {
    btn.textContent = 'New Run';
    btn.addEventListener('click', () => { newRun(); render(); });
  }
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
  const sel = uid ? `[data-panel="enemy"][data-uid="${uid}"]` : `[data-panel="player"]`;
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 420);
}

export function flashPanel(uid) {
  const sel = uid ? `[data-panel="enemy"][data-uid="${uid}"]` : `[data-panel="player"]`;
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.add('hit-flash');
  setTimeout(() => el.classList.remove('hit-flash'), 420);
}
