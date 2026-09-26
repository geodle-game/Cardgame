// ============================================================
// ui/animations.js
// Orchestrates combat feedback. Shape primitives come from
// ./effects.js; this file handles timing, panel reactions,
// screen shake, floating text, and hit-stop.
// ============================================================

import {
  spawnCrescent,
  spawnImpactBurst,
  spawnShieldBurst,
} from './effects.js';

const rng = () => Math.random();

function panelForUid(uid) {
  if (!uid || uid === 'player')
    return document.querySelector('[data-panel="player"]');
  return document.querySelector(`[data-panel="enemy"][data-uid="${uid}"]`);
}

export function getPanelElement(uid) { return panelForUid(uid); }

function center(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, rect: r };
}

// ---------- Panel reactions ----------------------------------------------

function windupAttacker(el, dirX) {
  if (!el) return;
  el.classList.remove('attacking');
  void el.offsetWidth;
  el.style.setProperty('--windup-x',   `${dirX * 10}px`);
  el.style.setProperty('--windup-rot', `${dirX * 2.5}deg`);
  el.classList.add('attacking');
  setTimeout(() => el.classList.remove('attacking'), 500);
}

function knockbackTarget(el, dirX, dmg) {
  if (!el) return;
  const strength = Math.min(14, 4 + dmg * 0.15);
  el.classList.remove('knocked');
  void el.offsetWidth;
  el.style.setProperty('--kb-x', `${dirX * strength}px`);
  el.classList.add('knocked');
  setTimeout(() => el.classList.remove('knocked'), 460);
}

function flashPanelEl(el) {
  if (!el) return;
  el.classList.remove('hit-flash');
  void el.offsetWidth;
  el.classList.add('hit-flash');
  setTimeout(() => el.classList.remove('hit-flash'), 420);
}

// ---------- Screen effects -----------------------------------------------

export function screenShake(intensity = 1) {
  const app = document.getElementById('app');
  if (!app) return;
  app.classList.remove('screen-shake');
  void app.offsetWidth;
  app.style.setProperty('--shake-power', intensity.toFixed(2));
  app.classList.add('screen-shake');
  setTimeout(() => app.classList.remove('screen-shake'), 400);
}

export function screenFlash(color = 'rgba(255,255,255,0.35)') {
  const el = document.createElement('div');
  el.className = 'screen-flash';
  el.style.background = color;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 240);
}

function hitStop(ms = 70) {
  const app = document.getElementById('app');
  if (!app) return;
  app.classList.add('hit-stop');
  setTimeout(() => app.classList.remove('hit-stop'), ms);
}

// ---------- Numbers & labels ---------------------------------------------

export function spawnDamageNumber(el, amount, { kind = 'slash' } = {}) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const jitter = (rng() - 0.5) * 30;
  const scale  = 1 + Math.min(1.2, amount / 25);

  const node = document.createElement('div');
  node.className = `float-text damage kind-${kind}`;
  node.textContent = amount;
  node.style.left = (r.left + r.width / 2 + jitter) + 'px';
  node.style.top  = (r.top + r.height / 2) + 'px';
  node.style.fontSize = `${Math.round(38 * scale)}px`;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 1000);
}

export function spawnFloatText(el, text, kind = 'damage') {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const node = document.createElement('div');
  node.className = `float-text ${kind}`;
  node.textContent = text;
  node.style.left = (r.left + r.width / 2) + 'px';
  node.style.top  = (r.top + 20) + 'px';
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 950);
}

export function spawnBlockedIndicator(targetEl) {
  if (!targetEl) return;
  const c = center(targetEl);
  spawnShieldBurst(c.x, c.y, { duration: 900 });

  const label = document.createElement('div');
  label.className = 'float-text blocked';
  label.textContent = 'BLOCKED';
  label.style.left = (c.x + 40) + 'px';
  label.style.top  = (c.y - 30) + 'px';
  document.body.appendChild(label);
  setTimeout(() => label.remove(), 950);
}

export function spawnBlockEffect(playerEl) {
  if (!playerEl) return;
  const c = center(playerEl);
  spawnShieldBurst(c.x + 70, c.y, { duration: 1400 });
}

// ---------- Hit orchestrator ---------------------------------------------

const WINDUP_MS  = 130;
const STAGGER_MS = 190;

function kindFor(animation) {
  if (animation === 'heavy')  return 'heavy';
  if (animation === 'magic')  return 'magic';
  if (animation === 'pierce') return 'pierce';
  return 'slash';
}

export function playHit(hit, { delay = 0 } = {}) {
  setTimeout(() => {
    const attackerEl = panelForUid(hit.attackerUid);
    const targetEl   = panelForUid(hit.targetUid);
    if (!targetEl) return;

    const targetC = center(targetEl);
    const dirX = attackerEl
      ? (Math.sign(targetC.x - center(attackerEl).x) || 1)
      : 1;

    const kind = kindFor(hit.animation);

    // 1) Attacker winds up.
    if (attackerEl) windupAttacker(attackerEl, dirX);

    // 2) Contact — everything lands on the same beat.
    setTimeout(() => {
      const c = center(targetEl);

      if (hit.dealt > 0 || hit.blocked === 0) {
        spawnCrescent(c.x, c.y, { kind, dirX, duration: 470 });
        spawnImpactBurst(c.x, c.y, { kind, damage: hit.dealt });
      }

      if (hit.blocked > 0) {
        spawnBlockedIndicator(targetEl);
      }

      // 3) Hit-stop — the single biggest "juice" lever.
      if (hit.dealt > 0) hitStop(hit.dealt >= 15 ? 90 : 60);

      // 4) Target + screen feedback.
      if (hit.dealt > 0) {
        spawnDamageNumber(targetEl, hit.dealt, { kind });
        knockbackTarget(targetEl, dirX, hit.dealt);
        flashPanelEl(targetEl);

        const intensity = Math.min(1.4, 0.4 + hit.dealt / 40);
        screenShake(intensity);

        if (hit.dealt >= 15) {
          const tint = {
            heavy:  'rgba(255,80,80,0.35)',
            magic:  'rgba(180,140,255,0.35)',
            pierce: 'rgba(255,255,255,0.45)',
            slash:  'rgba(255,180,120,0.35)',
          }[kind];
          screenFlash(tint);
        }
      }
    }, WINDUP_MS);
  }, delay);
}

export function animateHits(hits) {
  if (!hits || !hits.length) return;
  const stagger = hits.length > 2 ? 150 : STAGGER_MS;
  hits.forEach((hit, i) => playHit(hit, { delay: i * stagger }));
}

// ---------- Legacy compat (do not remove until call sites migrate) -------

export function shakePanel(uid) {
  const el = panelForUid(uid);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 420);
}
