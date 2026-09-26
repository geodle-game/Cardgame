import {
  state, chooseRelic, confirmDeck, newRun, startNode, backToMap,
  claimReward, takeRewardCard, skipRewardCard,
  pickEventChoice, buyShopCard, buyShopHeal,
  restHeal, restEnchantStart, applyEnchant, skipEnchant, newCombat,
  toggleDeckOverlay, toggleRelicOverlay,
  toggleDrawOverlay, toggleDiscardOverlay, toggleExhaustOverlay,
  closeOverlays,
  nextAct, claimActReward, takeActRewardCard, skipActRewardCard,
  takeActRewardRelic, finishRun,
  pickTreasureRelic, skipTreasure,
} from '../systems/state.js';
import {
  canPlay, playCard, selectCardForPlay, beginEnemyTurn, resolveEnemyTurn, costOf,
} from '../systems/combat.js';
import { CARDS } from '../data/cards.js';
import { RELICS } from '../data/relics.js';
import { ENEMY_CARDS } from '../data/enemy-cards.js';
import { NODE_TYPES } from '../data/maps.js';
import { getNode, reachableFrom, startingNodes } from '../systems/map.js';
import { getEnchant } from '../data/enchants.js';

const LONG_PRESS_MS = 450;
const DRAG_THRESHOLD = 14;

export function render() {
  const app = document.getElementById('app');
  document.querySelectorAll('.card-preview-overlay').forEach(el => el.remove());
  app.innerHTML = '';

  switch (state.screen) {
    case 'relicPick':   renderRelicPick(app);   break;
    case 'deckView':    renderDeckView(app);    break;
    case 'map':         renderMap(app);         break;
    case 'combat':      renderCombat(app);      break;
    case 'reward':      renderReward(app);      break;
    case 'actReward':   renderActReward(app);   break;
    case 'treasure':    renderTreasure(app);    break;
    case 'event':       renderEvent(app);       break;
    case 'shop':        renderShop(app);        break;
    case 'rest':        renderRest(app);        break;
    case 'enchantPick': renderEnchantPick(app); break;
    case 'victory':     renderVictory(app);     break;
    default:            renderGameOver(app);
  }

  if (state.overlays?.deck)    renderDeckOverlay(app);
  if (state.overlays?.relics)  renderRelicOverlay(app);
  if (state.overlays?.draw)    renderCardPileOverlay(app, 'Draw Pile', state.drawPile);
  if (state.overlays?.discard) renderCardPileOverlay(app, 'Discard Pile', state.discardPile);
  if (state.overlays?.exhaust) renderCardPileOverlay(app, 'Exhausted', state.exhaustPile);
}

// ---------------- Card text resolution ----------------

function resolveCardText(def, ctx) {
  let text = def.text;
  if (!def.liveValues) return text;
  let vals;
  try {
    vals = def.liveValues(state, ctx) || {};
  } catch (e) {
    return text;
  }
  for (const [key, raw] of Object.entries(vals)) {
    const value = raw == null ? '' : String(raw);
    const html = value ? `<span class="live">${value}</span>` : '';
    text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), html);
  }
  text = text.replace(/\{[a-zA-Z0-9_]+\}/g, '');
  return text;
}

function playerCardContext() {
  const attacker = state.player;
  const living = (state.enemies || []).filter(e => e.hp > 0);
  const target = living.find(e => e.uid === state.selectedEnemyId) || living[0] || null;
  return { attacker, target };
}

function enemyCardContext(enemy) {
  return { attacker: enemy, target: state.player };
}

// ---------------- Gold coin stack helper ----------------

function coinStackClass(gold) {
  if (gold >= 250) return 'coin-5';
  if (gold >= 100) return 'coin-4';
  if (gold >= 50)  return 'coin-3';
  if (gold >= 10)  return 'coin-2';
  return 'coin-1';
}

function goldDisplay(gold) {
  const cls = coinStackClass(gold);
  return `<span class="gold-display"><span class="gold-coin ${cls}"></span><span class="gold">${gold}</span></span>`;
}

// ---------------- Top-right buttons ----------------

function topButtons() {
  const wrap = document.createElement('div');
  wrap.className = 'top-buttons';

  const deckBtn = document.createElement('button');
  deckBtn.className = 'icon-btn';
  deckBtn.title = 'View deck';
  deckBtn.textContent = `Deck ${state.run.deck.length}`;
  deckBtn.addEventListener('click', () => { toggleDeckOverlay(); render(); });
  wrap.appendChild(deckBtn);

  if (state.run.relics?.length) {
    const relicBtn = document.createElement('button');
    relicBtn.className = 'icon-btn';
    relicBtn.title = 'View relics';
    relicBtn.textContent = `Relics ${state.run.relics.length}`;
    relicBtn.addEventListener('click', () => { toggleRelicOverlay(); render(); });
    wrap.appendChild(relicBtn);
  }

  return wrap;
}

// ---------------- Overlays ----------------

function renderDeckOverlay(app) {
  const overlay = cardGridOverlay('Your Deck', sortDeckEntries(state.run.deck));
  app.appendChild(overlay);
}

function renderCardPileOverlay(app, title, pile) {
  const entries = pile.map(c => ({ defId: c.defId, enchant: c.enchant }));
  const overlay = cardGridOverlay(title, entries, { emptyMessage: 'Nothing here yet.' });
  app.appendChild(overlay);
}

function sortDeckEntries(entries) {
  return entries.slice().sort((a, b) => {
    const A = CARDS[a.defId], B = CARDS[b.defId];
    return (A.type || '').localeCompare(B.type || '') || A.name.localeCompare(B.name);
  });
}

function cardGridOverlay(title, entries, { emptyMessage } = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) { closeOverlays(); render(); }
  });

  const panel = document.createElement('div');
  panel.className = 'overlay-panel';
  panel.appendChild(overlayHeader(title, closeOverlays));

  if (!entries.length && emptyMessage) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = emptyMessage;
    panel.appendChild(empty);
  } else {
    const grid = document.createElement('div');
    grid.className = 'deck-grid';
    for (const entry of entries) {
      grid.appendChild(cardFace(entry.defId, {
        small: true, disabled: true, enchant: entry.enchant,
      }));
    }
    panel.appendChild(grid);
  }

  overlay.appendChild(panel);
  return overlay;
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
    el.className = `relic-row-item rarity-${r.rarity || 'common'}`;
    el.innerHTML = `
      <div class="relic-name">${r.name} <span class="relic-rarity">${r.rarity || 'common'}</span></div>
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

function relicCard(r, onClick) {
  const el = document.createElement('button');
  el.className = `relic-card rarity-${r.rarity || 'common'}`;
  el.innerHTML = `
    <div class="relic-rarity-badge">${r.rarity || 'common'}</div>
    <div class="relic-name">${r.name}</div>
    <div class="relic-text">${r.text}</div>
  `;
  if (onClick) el.addEventListener('click', onClick);
  return el;
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
    row.appendChild(relicCard(r, () => { chooseRelic(id); render(); }));
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
  state.run.deck.forEach((entry, i) => {
    const el = cardFace(entry.defId, { disabled: true, small: true, enchant: entry.enchant });
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
    <div>Act ${state.run.act}</div>
    <div>HP <span class="hp">${state.run.hp}/${state.run.maxHp}</span></div>
    <div>${goldDisplay(state.run.gold)}</div>
    <div>Floor ${state.run.floor + 1} / ${map.floors}</div>
  `;
  wrap.appendChild(header);
  wrap.appendChild(topButtons());

  const board = document.createElement('div');
  board.className = 'map-board';

  const rowH = 64;
  const colW = 92;
  const padX = 110;
  const padY = 150;

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

// ---------------- Reward ----------------

function renderReward(app) {
  const r = state.reward;
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const h = document.createElement('h1');
  h.textContent = 'Victory';
  wrap.appendChild(h);

  const gold = document.createElement('p');
  gold.innerHTML = goldDisplay(r.coins) + ' gold';
  wrap.appendChild(gold);

  if (!r.taken) {
    const sub = document.createElement('p');
    sub.className = 'muted';
    sub.textContent = 'Choose a card:';
    wrap.appendChild(sub);

    const grid = document.createElement('div');
    grid.className = 'deck-grid';
    for (const id of r.cards) {
      const el = cardFace(id, { small: true });
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

// ---------------- Act transition ----------------

function renderActReward(app) {
  const r = state.actReward;
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const h = document.createElement('h1');
  h.textContent = `Act ${state.run.act}`;
  wrap.appendChild(h);

  if (r.healAmount != null) {
    const heal = document.createElement('p');
    heal.className = 'heal';
    heal.textContent = `+${r.healAmount} HP (30% of max)`;
    wrap.appendChild(heal);
  }

  const gold = document.createElement('p');
  gold.innerHTML = goldDisplay(r.coins) + ' gold';
  wrap.appendChild(gold);

  if (!r.relicTaken) {
    const sub = document.createElement('p');
    sub.className = 'muted';
    sub.textContent = 'Choose a relic:';
    wrap.appendChild(sub);

    const row = document.createElement('div');
    row.className = 'relic-row';
    for (const id of r.relicChoices) {
      const relic = RELICS[id];
      row.appendChild(relicCard(relic, () => { takeActRewardRelic(id); render(); }));
    }
    wrap.appendChild(row);
  } else {
    const taken = document.createElement('p');
    taken.className = 'muted';
    taken.textContent = `Relic chosen: ${RELICS[r.relicTaken].name}`;
    wrap.appendChild(taken);

    if (!r.cardTaken) {
      const sub = document.createElement('p');
      sub.className = 'muted';
      sub.textContent = 'Add a card to your deck:';
      wrap.appendChild(sub);

      const grid = document.createElement('div');
      grid.className = 'deck-grid';
      for (const id of r.cards) {
        const el = cardFace(id, { small: true });
        el.addEventListener('click', () => { takeActRewardCard(id); render(); });
        grid.appendChild(el);
      }
      wrap.appendChild(grid);

      const skip = document.createElement('button');
      skip.className = 'btn';
      skip.textContent = 'Skip';
      skip.addEventListener('click', () => { skipActRewardCard(); render(); });
      wrap.appendChild(skip);
    } else {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Onward';
      btn.addEventListener('click', () => { claimActReward(); render(); });
      wrap.appendChild(btn);
    }
  }

  app.appendChild(wrap);
}

// ---------------- Treasure ----------------

function renderTreasure(app) {
  const t = state.treasure;
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const h = document.createElement('h1');
  h.textContent = 'Treasure';
  wrap.appendChild(h);

  const gold = document.createElement('p');
  gold.innerHTML = goldDisplay(t.gold) + ' gold';
  wrap.appendChild(gold);

  const sub = document.createElement('p');
  sub.className = 'muted';
  sub.textContent = 'Choose a relic:';
  wrap.appendChild(sub);

  const row = document.createElement('div');
  row.className = 'relic-row';
  for (const id of t.relicChoices) {
    const relic = RELICS[id];
    row.appendChild(relicCard(relic, () => { pickTreasureRelic(id); render(); }));
  }
  wrap.appendChild(row);

  const skip = document.createElement('button');
  skip.className = 'btn';
  skip.textContent = 'Skip Relic';
  skip.addEventListener('click', () => { skipTreasure(); render(); });
  wrap.appendChild(skip);

  app.appendChild(wrap);
}

// ---------------- Victory ----------------

function renderVictory(app) {
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const h = document.createElement('h1');
  h.textContent = 'You Win';
  h.style.color = '#ffd166';
  wrap.appendChild(h);

  const stats = document.createElement('div');
  stats.className = 'victory-stats';
  stats.innerHTML = `
    <div>Acts cleared: <strong>${state.run.act}</strong></div>
    <div>Final HP: <strong class="hp">${state.run.hp} / ${state.run.maxHp}</strong></div>
    <div>Gold: <strong>${goldDisplay(state.run.gold)}</strong></div>
    <div>Deck size: <strong>${state.run.deck.length}</strong></div>
    <div>Relics: <strong style="color:#c9a3ff">${state.run.relics.length}</strong></div>
  `;
  wrap.appendChild(stats);

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'New Run';
  btn.addEventListener('click', () => { newRun(); render(); });
  wrap.appendChild(btn);

  app.appendChild(wrap);
}

// ---------------- Event ----------------

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

// ---------------- Shop ----------------

function renderShop(app) {
  const s = state.shop;
  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center shop-screen';

  const h = document.createElement('h1');
  h.textContent = 'Shop';
  wrap.appendChild(h);

  const gold = document.createElement('p');
  gold.innerHTML = 'Gold: ' + goldDisplay(state.run.gold);
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

// ---------------- Rest ----------------

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

  const enchantBtn = document.createElement('button');
  enchantBtn.className = 'btn';
  enchantBtn.textContent = 'Enchant a card';
  enchantBtn.addEventListener('click', () => { restEnchantStart(); render(); });
  wrap.appendChild(enchantBtn);

  app.appendChild(wrap);
}

// ---------------- Enchant pick ----------------

function renderEnchantPick(app) {
  const pe = state.pendingEnchant;
  if (!pe) { renderMap(app); return; }
  const enchant = getEnchant(pe.enchantId);
  if (!enchant) { backToMap(); render(); return; }

  const wrap = document.createElement('div');
  wrap.className = 'screen screen-center';

  const h = document.createElement('h1');
  h.textContent = 'Enchant a Card';
  wrap.appendChild(h);

  const info = document.createElement('div');
  info.className = `enchant-info rarity-${enchant.rarity}`;
  info.innerHTML = `
    <div class="enchant-rarity-badge">${enchant.rarity}</div>
    <div class="enchant-name">${enchant.name}</div>
    <div class="enchant-text">${enchant.text}</div>
  `;
  wrap.appendChild(info);

  const sub = document.createElement('p');
  sub.className = 'muted';
  sub.textContent = 'Choose a card to enchant:';
  wrap.appendChild(sub);

  const grid = document.createElement('div');
  grid.className = 'deck-grid';
  state.run.deck.forEach((entry, i) => {
    const eligible = pe.eligibleIndices.includes(i);
    const el = cardFace(entry.defId, {
      small: true,
      enchant: entry.enchant,
      disabled: !eligible,
    });
    if (eligible) {
      el.classList.add('enchant-target');
      el.addEventListener('click', () => { applyEnchant(i); render(); });
    }
    grid.appendChild(el);
  });
  wrap.appendChild(grid);

  const skip = document.createElement('button');
  skip.className = 'btn';
  skip.textContent = 'Skip Enchant';
  skip.addEventListener('click', () => { skipEnchant(); render(); });
  wrap.appendChild(skip);

  app.appendChild(wrap);
}

// ---------------- Combat ----------------

function renderCombat(app) {
  const c = document.createElement('div');
  c.className = 'combat';

  if (state.combatBanner) {
    const img = document.createElement('img');
    img.className = 'combat-banner';
    img.src = state.combatBanner;
    img.alt = '';
    c.appendChild(img);
  }

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
  const n = state.hand.length;
  state.hand.forEach((card, i) => {
    const el = cardInHand(card);
    const t = n === 1 ? 0 : (i - (n - 1) / 2) / ((n - 1) / 2);
    const maxAngle = 14;
    const maxDrop = 34;
    const rot = t * maxAngle;
    const drop = Math.pow(Math.abs(t), 1.8) * maxDrop;
    el.style.setProperty('--card-rot', rot.toFixed(2) + 'deg');
    el.style.setProperty('--card-offy', drop.toFixed(1) + 'px');
    el.style.setProperty('--card-delay', (i * 55) + 'ms');
    hand.appendChild(el);
  });
  c.appendChild(hand);

  c.appendChild(bottomBar());

  app.appendChild(c);

  if (state.over) app.appendChild(endBanner());
}

function pileEl(label, count, onClick) {
  const el = document.createElement('button');
  el.className = 'pile pile-bottom';
  el.innerHTML = `<div class="pile-label">${label}</div><div class="pile-count">${count}</div>`;
  if (onClick) {
    el.classList.add('pile-clickable');
    el.addEventListener('click', onClick);
  }
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
    <div class="block${p.block > 0 ? '' : ' block-empty'}">
      <span class="block-icon"></span>${p.block}
    </div>
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
    <div class="block${e.block > 0 ? '' : ' block-empty'}">
      <span class="block-icon"></span>${e.block}
    </div>
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

  if (!dead && e.intentCard) wrap.appendChild(enemyIntentCard(e.intentCard, e));
  return wrap;
}

function enemyIntentCard(card, enemy) {
  const def = ENEMY_CARDS[card.defId];
  const ctx = enemyCardContext(enemy);
  const text = resolveCardText(def, ctx);
  const el = document.createElement('div');
  el.className = 'enemy-card';
  el.innerHTML = `
    <div class="enemy-card-name">${def.name}</div>
    <div class="enemy-card-text">${text}</div>
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

function tryPlayCard(card, sourceEl) {
  const def = CARDS[card.defId];
  if (!canPlay(card)) return;
  if (def.target === 'enemy') {
    const living = state.enemies.filter(x => x.hp > 0);
    if (living.length > 1) { selectCardForPlay(card); render(); return; }
    if (living.length === 1) { doPlayCard(card, sourceEl, living[0].uid); return; }
  }
  doPlayCard(card, sourceEl, null);
}

function showPreviewOverlay(card) {
  document.querySelectorAll('.card-preview-overlay').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = 'card-preview-overlay';

  let dismissable = false;
  setTimeout(() => { dismissable = true; }, 250);

  const dismiss = (e) => {
    if (!dismissable) return;
    if (e) e.stopPropagation();
    overlay.remove();
  };

  overlay.addEventListener('pointerdown', dismiss);
  overlay.addEventListener('click', dismiss);

  const wrapper = document.createElement('div');
  wrapper.className = 'card-preview-wrapper';
  wrapper.appendChild(cardFace(card.defId, { big: true, enchant: card.enchant }));

  const hint = document.createElement('div');
  hint.className = 'card-preview-hint';
  hint.textContent = 'Tap anywhere to close';
  wrapper.appendChild(hint);

  overlay.appendChild(wrapper);
  document.body.appendChild(overlay);
}

function cardInHand(card) {
  const def = CARDS[card.defId];
  const el = cardFace(card.defId, { enchant: card.enchant });
  if (!canPlay(card)) el.classList.add('disabled');
  if (state.pendingCardUid === card.uid) el.classList.add('pending');

  if (state.newlyDrawn?.has(card.uid)) {
    el.classList.add('drawing');
    state.newlyDrawn.delete(card.uid);
  }

  let pressTimer = null;
  let longPressFired = false;
  let startX = 0;
  let startY = 0;
  let active = false;

  el.addEventListener('pointerdown', (e) => {
    if (!canPlay(card)) return;
    active = true;
    longPressFired = false;
    startX = e.clientX;
    startY = e.clientY;

    if (pressTimer) clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      longPressFired = true;
      pressTimer = null;
      showPreviewOverlay(card);
    }, LONG_PRESS_MS);
  });

  el.addEventListener('pointerup', (e) => {
    if (!active) return;
    active = false;
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    if (longPressFired) return;
    if (!canPlay(card)) return;

    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) return;

    tryPlayCard(card, el);
  });

  el.addEventListener('pointerleave', () => {
    active = false;
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
  });

  el.addEventListener('pointercancel', () => {
    active = false;
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
  });

  el.addEventListener('contextmenu', (e) => e.preventDefault());

  return el;
}

function doPlayCard(card, sourceEl, targetUid) {
  const def = CARDS[card.defId];
  const targetEl = targetUid
    ? document.querySelector(`[data-panel="enemy"][data-uid="${targetUid}"]`)
    : document.querySelector('[data-panel="player"]');

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
    state.lastHits = [];
    const wasPlayed = playCard(card, targetUid);
    const hits = state.lastHits || [];
    state.lastHits = [];

    render();
    animateHits(hits);

    const hasBlock = def.effects.some(e => e.kind === 'block');
    if (hasBlock) {
      const p = document.querySelector('[data-panel="player"]');
      if (p) {
        spawnFloatOn(p, '+BLOCK', 'block');
        setTimeout(() => spawnBlockEffect(p), 60);
      }
    }

    const hasHeal = def.effects.some(e => e.kind === 'heal' || e.kind === 'reaper');
    if (hasHeal) {
      const p = document.querySelector('[data-panel="player"]');
      if (p) spawnFloatOn(p, '+HP', 'heal');
    }

    if (wasPlayed && def.endsTurn && !state.over) {
      state.pendingCardUid = null;
      setTimeout(() => {
        if (state.over) return;
        state.lastHits = [];
        beginEnemyTurn();
        render();
        setTimeout(() => {
          resolveEnemyTurn();
          const enemyHits = state.lastHits || [];
          state.lastHits = [];
          render();
          animateHits(enemyHits);
        }, 450);
      }, 300);
    }
  }, 220);
}

function cardFace(defId, { disabled = false, small = false, big = false, enchant = null } = {}) {
  const def = CARDS[defId];
  const enchantDef = enchant ? getEnchant(enchant) : null;

  const el = document.createElement('div');
  el.className = 'card';
  if (disabled) el.classList.add('disabled');
  if (small) el.classList.add('card-small');
  if (big) el.classList.add('card-big');
  if (enchantDef) el.classList.add('has-enchant');
  el.classList.add(`rarity-${def.rarity || 'common'}`);
  el.classList.add(`type-${def.type || 'skill'}`);
  if (def.retain) el.classList.add('card-retain');

  const ctx = playerCardContext();
  const text = resolveCardText(def, ctx);

  el.innerHTML = `
    <div class="cost">${def.unplayable ? '–' : def.cost}</div>
    <div class="cname">${def.name}</div>
    <div class="ctext">${text}</div>
    ${enchantDef ? `
      <div class="card-enchant rarity-${enchantDef.rarity}">
        <span class="card-enchant-name">${enchantDef.name}</span>
        <span class="card-enchant-text">${enchantDef.text}</span>
      </div>
    ` : ''}
  `;
  return el;
}

function bottomBar() {
  const bar = document.createElement('div');
  bar.className = 'bar';

  bar.appendChild(pileEl('Draw', state.drawPile.length, () => {
    toggleDrawOverlay(); render();
  }));

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'End Turn';
  btn.disabled = state.turn !== 'player' || state.over;
  btn.addEventListener('click', () => {
    state.pendingCardUid = null;
    state.lastHits = [];
    beginEnemyTurn();
    render();
    setTimeout(() => {
      resolveEnemyTurn();
      const hits = state.lastHits || [];
      state.lastHits = [];
      render();
      animateHits(hits);
    }, 450);
  });
  bar.appendChild(btn);

  bar.appendChild(pileEl('Discard', state.discardPile.length, () => {
    toggleDiscardOverlay(); render();
  }));

  if (state.exhaustPile.length) {
    bar.appendChild(pileEl('Exhaust', state.exhaustPile.length, () => {
      toggleExhaustOverlay(); render();
    }));
  }

  return bar;
}

function endBanner() {
  const overlay = document.createElement('div');
  overlay.className = 'victory-overlay';

  const card = document.createElement('div');
  card.className = 'victory-card';

  if (state.result === 'win') {
    const title = document.createElement('h1');
    title.className = 'victory-title win';
    title.textContent = 'Victory';
    card.appendChild(title);

    const btn = document.createElement('button');
    btn.className = 'btn';

    if (state.combatKind === 'boss') {
      if (state.run.act >= 2) {
        btn.textContent = 'See Final Results';
        btn.addEventListener('click', () => { finishRun(); render(); });
      } else {
        btn.textContent = 'Continue to Act 2';
        btn.addEventListener('click', () => { nextAct(); render(); });
      }
    } else {
      btn.textContent = 'Rewards';
      btn.addEventListener('click', () => { state.screen = 'reward'; render(); });
    }
    card.appendChild(btn);
  } else {
    // Loss → the resurrection narrative.
    const text = document.createElement('div');
    text.className = 'death-text';
    text.innerHTML = `
      <p>The dungeon reaches for you. Cold. Patient. Certain.</p>

      <p>If it takes you, there is no one else. The Drawn are hunted
      the moment they are found. There is no second hero waiting in
      the wings. There is no army coming to finish what you could not.</p>

      <p class="death-emphasis">If the dungeon consumes you,
      the world ends with you.</p>

      <p>But you remember them.</p>

      <p>The people who taught you how to hold a card. The village that
      sent you off with nothing but hope. Everyone still breathing above
      you who will not survive the week if you fall here.</p>

      <p class="death-emphasis">You are filled with determination.</p>

      <p>Your hand closes around the amulet at your chest — the last gift
      your family gave you before you left. A small thing. Worn smooth by
      other hands long before yours.</p>

      <p>You vow, one more time, that the dungeon will end.</p>

      <p>The amulet answers.</p>

      <p class="death-emphasis">A burst of light.</p>

      <p class="death-last">You are back at the beginning.</p>
    `;
    card.appendChild(text);

    const btn = document.createElement('button');
    btn.className = 'btn death-btn';
    btn.textContent = 'New Run?';
    btn.addEventListener('click', () => { newRun(); render(); });
    card.appendChild(btn);
  }

  overlay.appendChild(card);
  return overlay;
}

function renderGameOver(app) {
  const el = document.createElement('div');
  el.className = 'screen screen-center';
  el.textContent = 'Game over.';
  app.appendChild(el);
}

// ---------------- Animation helpers ----------------

function getPanelElement(uid) {
  if (!uid || uid === 'player') {
    return document.querySelector('[data-panel="player"]');
  }
  return document.querySelector(`[data-panel="enemy"][data-uid="${uid}"]`);
}

function animateHits(hits) {
  hits.forEach((hit, i) => {
    setTimeout(() => {
      const targetEl = getPanelElement(hit.targetUid);
      if (!targetEl) return;

      spawnSlash(targetEl, hit.animation || 'slash');

      const r = targetEl.getBoundingClientRect();
      spawnSpark(r.left + r.width / 2, r.top + r.height / 2);

      if (hit.blocked > 0) spawnBlockedIndicator(targetEl);
      if (hit.dealt > 0) {
        spawnDamageNumber(targetEl, hit.dealt);
        shakePanel(hit.targetUid);
        flashPanel(hit.targetUid);
      }
    }, i * 280);
  });
}

export function spawnFloatOn(el, text, kind = 'damage') {
  if (!el) return;
  const r = el.getBoundingClientRect();
  spawnFloat(r.left + r.width / 2, r.top + 20, text, kind);
}

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

export function spawnSlash(targetEl, kind = 'slash') {
  const r = targetEl.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const baseAngle = -45 + (Math.random() - 0.5) * 60;
  const flip = Math.random() < 0.5 ? 1 : -1;
  const sweepAngle = (baseAngle + 90) * flip;
  const rad = (sweepAngle * Math.PI) / 180;
  const dist = 180;
  const dx = Math.cos(rad) * dist;
  const dy = Math.sin(rad) * dist;

  spawnOneSlash(cx, cy, baseAngle, dx, dy, kind, 0, false);
  spawnOneSlash(cx, cy, baseAngle, dx, dy, kind, 45, true);
  spawnOneSlash(cx, cy, baseAngle, dx, dy, kind, 90, true);

  setTimeout(() => spawnSlashFlash(cx, cy), 130);
}

function spawnOneSlash(cx, cy, baseAngle, dx, dy, kind, delay, isTrail) {
  const el = document.createElement('div');
  el.className = 'slash-effect ' + kind + (isTrail ? ' trail' : ' main');
  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  el.style.setProperty('--slash-rot', baseAngle.toFixed(1) + 'deg');
  el.style.setProperty('--from-x', (-dx).toFixed(0) + 'px');
  el.style.setProperty('--from-y', (-dy).toFixed(0) + 'px');
  el.style.setProperty('--to-x', dx.toFixed(0) + 'px');
  el.style.setProperty('--to-y', dy.toFixed(0) + 'px');
  if (delay) el.style.animationDelay = delay + 'ms';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900 + delay);
}

function spawnSlashFlash(cx, cy) {
  const el = document.createElement('div');
  el.className = 'slash-flash';
  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 300);
}

export function spawnBlockedIndicator(targetEl) {
  const r = targetEl.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const shield = document.createElement('img');
  shield.src = 'assets/shield.png';
  shield.className = 'block-impact';
  shield.style.left = cx + 'px';
  shield.style.top = cy + 'px';
  document.body.appendChild(shield);
  setTimeout(() => shield.remove(), 900);

  const label = document.createElement('div');
  label.className = 'float-text blocked';
  label.textContent = 'Blocked';
  label.style.left = (cx + 40) + 'px';
  label.style.top = (cy - 30) + 'px';
  document.body.appendChild(label);
  setTimeout(() => label.remove(), 950);
}

export function spawnDamageNumber(targetEl, amount) {
  const r = targetEl.getBoundingClientRect();
  const jitterX = (Math.random() - 0.5) * 40;
  const cx = r.left + r.width / 2 + jitterX;
  const cy = r.top + r.height / 2;

  const el = document.createElement('div');
  el.className = 'float-text damage';
  el.textContent = '-' + amount;
  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

export function spawnBlockEffect(playerEl) {
  const r = playerEl.getBoundingClientRect();
  const cx = r.right + 90;
  const cy = r.top + r.height / 2;

  const img = document.createElement('img');
  img.src = 'assets/block.png';
  img.className = 'block-effect';
  img.style.left = cx + 'px';
  img.style.top  = cy + 'px';
  document.body.appendChild(img);
  setTimeout(() => img.remove(), 1500);

  const ring = document.createElement('div');
  ring.className = 'block-ring';
  ring.style.left = cx + 'px';
  ring.style.top  = cy + 'px';
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 1500);
}

export function shakePanel(uid) {
  const sel = uid ? `[data-panel="enemy"][data-uid="${uid}"]` : '[data-panel="player"]';
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 420);
}

export function flashPanel(uid) {
  const sel = uid ? `[data-panel="enemy"][data-uid="${uid}"]` : '[data-panel="player"]';
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.add('hit-flash');
  setTimeout(() => el.classList.remove('hit-flash'), 420);
}
