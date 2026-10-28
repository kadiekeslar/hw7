import { createState, movePlayer, nearestRepair, completedCount, completeRepair } from './state.js?v=3';
import { createRenderer } from './render.js?v=3';
import { REPAIR_TASKS } from './repairs.js?v=3';

let state = createState();
const canvas = document.querySelector('#house');
let drawHouse;
try { drawHouse = createRenderer(canvas); } catch (error) {
  document.querySelector('#interaction').textContent = error.message;
  throw error;
}
const counter = document.querySelector('#counter');
const interaction = document.querySelector('#interaction');
const checklist = document.querySelector('#checklist');
const dialog = document.querySelector('#repair-dialog');
const winDialog = document.querySelector('#win-dialog');
const taskContainer = document.querySelector('#repair-task');
const keys = new Set();
let cleanupTask = () => {};

function updateProgress() {
  counter.textContent = `Repairs: ${completedCount(state)} / ${state.repairs.length}`;
  checklist.replaceChildren(...state.repairs.map(repair => {
    const item = document.createElement('li');
    item.textContent = `${repair.repaired ? '✓' : '○'} ${repair.name}`;
    return item;
  }));
}

function closeRepair() {
  if (dialog.open) dialog.close();
  cleanupTask(); cleanupTask = () => {};
  keys.clear(); canvas.focus();
}

function openRepair(repair) {
  keys.clear();
  if (document.pointerLockElement) document.exitPointerLock();
  const task = REPAIR_TASKS[repair.id];
  document.querySelector('#repair-title').textContent = task.title;
  document.querySelector('#repair-instructions').textContent = task.instructions;
  taskContainer.replaceChildren();
  dialog.showModal();
  cleanupTask = task.start(taskContainer, () => {
    if (!completeRepair(state, repair.id)) return;
    closeRepair(); updateProgress();
    if (completedCount(state) === state.repairs.length) winDialog.showModal();
  });
}

document.querySelector('#close-repair').addEventListener('click', closeRepair);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeRepair(); });
winDialog.addEventListener('cancel', event => event.preventDefault());
document.querySelector('#restart').addEventListener('click', () => {
  state = createState(); keys.clear(); updateProgress(); winDialog.close(); canvas.focus();
});
window.addEventListener('keydown', event => {
  if (dialog.open || winDialog.open) return;
  const key = event.key.toLowerCase();
  if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','e'].includes(key)) event.preventDefault();
  keys.add(key);
  if (key === 'e' && !event.repeat) {
    const repair = nearestRepair(state);
    if (repair) openRepair(repair);
  }
});
window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());
document.addEventListener('visibilitychange', () => keys.clear());

canvas.addEventListener('click', async () => {
  if (dialog.open || winDialog.open || document.pointerLockElement === canvas) return;
  try { await canvas.requestPointerLock?.(); } catch { /* Arrow keys remain available if mouse capture is denied. */ }
});
document.addEventListener('pointerlockchange', () => keys.clear());
document.addEventListener('mousemove', event => {
  if (document.pointerLockElement !== canvas || dialog.open || winDialog.open) return;
  state.player.angle += event.movementX * 0.0025;
  state.player.pitch = Math.max(-0.65, Math.min(0.65, state.player.pitch - event.movementY * 0.0025));
});

let lastTime;
function frame(time) {
  // Cap elapsed time so returning to a background tab cannot teleport the player.
  const seconds = lastTime === undefined ? 0 : Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  if (!dialog.open && !winDialog.open) {
    state.player.angle += (Number(keys.has('arrowright')) - Number(keys.has('arrowleft'))) * 1.9 * seconds;
    const strafe = Number(keys.has('d')) - Number(keys.has('a'));
    const forward = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'));
    movePlayer(state, strafe, forward, seconds);
  }
  drawHouse(state, time, document.pointerLockElement === canvas);
  const repair = nearestRepair(state);
  interaction.textContent = repair ? `Press E to repair: ${repair.name}` : 'Explore the house. Face a damaged object and move close to repair it.';
  requestAnimationFrame(frame);
}
updateProgress();
requestAnimationFrame(frame);
