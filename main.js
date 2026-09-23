import { state, newRun } from './systems/state.js';
import { render } from './ui/render.js';

newRun();
render();

window.__game = { state };
