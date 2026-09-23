export function makeCard(defId) {
  return { uid: `c${++uidCounter}`, defId };
}

let uidCounter = 0;

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function draw(state, n) {
  for (let i = 0; i < n; i++) {
    if (state.drawPile.length === 0) {
      if (state.discardPile.length === 0) return;
      state.drawPile = shuffle(state.discardPile);
      state.discardPile = [];
    }
    state.hand.push(state.drawPile.pop());
  }
}

export function recycleHand(state) {
  state.drawPile.push(...state.hand);
  state.hand = [];
  state.drawPile = shuffle(state.drawPile);
}
