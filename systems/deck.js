let uidCounter = 0;

export function makeCard(defId) {
  return { uid: `c${++uidCounter}`, defId };
}

export function makeEnemyCard(defId) {
  return { uid: `ec${++uidCounter}`, defId };
}

export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 0xffffffff;
  };
}

export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Draw n. If the draw pile runs dry mid-draw, shuffle the discard pile in
// to keep drawing. No other reshuffle happens here.
export function draw(state, n) {
  for (let i = 0; i < n; i++) {
    if (state.drawPile.length === 0) {
      if (state.discardPile.length === 0) return;
      state.drawPile = shuffle(state.discardPile, state.rng);
      state.discardPile = [];
    }
    state.hand.push(state.drawPile.pop());
  }
}

// End of turn.
// 1. Cards with retain:true always stay.
// 2. Plus a random 50% of the rest stay (rounded down).
// 3. The other 50% go to the discard pile.
// 4. If the draw pile has fewer than 5 cards left, shuffle the entire
//    discard pile into it.
export function recycleHand(state) {
  const retained = [];
  const rest = [];

  for (const card of state.hand) {
    const def = state.cardDef(card);
    if (def?.retain) {
      retained.push(card);
    } else {
      rest.push(card);
    }
  }

  const keepCount = Math.floor(rest.length / 2);
  const shuffled = shuffle(rest, state.rng);
  for (let i = 0; i < keepCount; i++) retained.push(shuffled[i]);

  const discarded = shuffled.slice(keepCount);
  state.discardPile.push(...discarded);

  state.hand = retained;

  // Low-pile reset at end of turn
  if (state.drawPile.length < 5 && state.discardPile.length > 0) {
    state.drawPile = shuffle(
      state.drawPile.concat(state.discardPile),
      state.rng
    );
    state.discardPile = [];
  }
}

export function drawEnemyCard(enemy, rng) {
  if (enemy.cardDraw.length === 0) {
    if (enemy.cardDiscard.length === 0) return null;
    enemy.cardDraw = shuffle(enemy.cardDiscard, rng);
    enemy.cardDiscard = [];
  }
  return enemy.cardDraw.pop();
}
