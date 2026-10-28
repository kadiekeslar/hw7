import { createState, movePlayer, nearestRepair, completedCount, completeRepair } from './state.js';
import { drawHouse } from './render.js';
import { REPAIR_TASKS } from './repairs.js';

let state = createState();
const canvas = document.querySelector('#house');
const context = canvas.getContext('2d');
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
    item.textContent = `${repair.repaired ? '✓' : '○'} ${repair.name}${repair.id === 'pipe' && !repair.repaired ? ' · coming next' : ''}`;
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

let lastTime;
function frame(time) {
  // Cap elapsed time so returning to a background tab cannot teleport the player.
  const seconds = lastTime === undefined ? 0 : Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  if (!dialog.open && !winDialog.open) {
    const horizontal = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
    const vertical = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
    movePlayer(state, horizontal, vertical, seconds);
  }
  drawHouse(context, state);
  const repair = nearestRepair(state);
  interaction.textContent = repair ? `Press E to repair: ${repair.name}${repair.id === 'pipe' ? ' (not built yet)' : ''}` : 'Walk up to a damaged object to get started.';
  requestAnimationFrame(frame);
}
updateProgress();
requestAnimationFrame(frame);
