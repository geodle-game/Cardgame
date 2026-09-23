import { state, newCombat } from './systems/state.js';
import { render } from './ui/render.js';

newCombat();
render();

window.__game = { state };
