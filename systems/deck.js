let uidCounter = 0;

export function makeCard(defId) {
  return { uid: `c${++uidCounter}`, defId };
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

export function recycleHand(state) {
  state.drawPile.push(...state.hand);
  state.hand = [];
  state.drawPile = shuffle(state.drawPile, state.rng);
}
