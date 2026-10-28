import { INITIAL_ROTATIONS, pipePorts, pipesConnected } from './pipes.js';

// Each task calls onComplete only on success and returns cleanup for its listeners.
// Closing a task discards its unfinished progress; completed repairs live in state.js.
export function startDrywall(container, onComplete) {
  const grid = document.createElement('div');
  grid.className = 'patch-grid';
  const covered = new Set();
  for (let index = 0; index < 40; index++) {
    const cell = document.createElement('button');
    cell.className = 'patch-cell';
    cell.setAttribute('aria-label', `Patch area ${index + 1}`);
    cell.setAttribute('aria-pressed', 'false');
    const cover = () => {
      if (covered.has(index)) return;
      covered.add(index); cell.classList.add('covered');
      cell.setAttribute('aria-pressed', 'true');
      if (covered.size === 40) onComplete();
    };
    cell.addEventListener('pointerdown', event => { if (event.button === 0) cover(); });
    cell.addEventListener('pointerenter', event => { if (event.buttons === 1) cover(); });
    cell.addEventListener('click', cover);
    grid.append(cell);
  }
  container.append(grid);
  return () => grid.remove();
}

export function startFloorboard(container, onComplete) {
  const board = document.createElement('div'); board.className = 'board';
  let secured = 0;
  for (let index = 0; index < 4; index++) {
    const nail = document.createElement('button'); nail.className = 'nail';
    nail.textContent = '+'; nail.setAttribute('aria-label', `Hammer nail ${index + 1}`);
    nail.addEventListener('click', () => {
      if (nail.disabled) return;
      nail.disabled = true; nail.textContent = '✓'; secured++;
      if (secured === 4) onComplete();
    });
    board.append(nail);
  }
  container.append(board);
  return () => board.remove();
}

export function startPipe(container, onComplete) {
  const rotations = [...INITIAL_ROTATIONS];
  const panel = document.createElement('div'); panel.className = 'pipe-panel';
  const inlet = document.createElement('p'); inlet.className = 'pipe-end'; inlet.textContent = 'WATER IN →';
  const grid = document.createElement('div'); grid.className = 'pipe-grid';
  const outlet = document.createElement('p'); outlet.className = 'pipe-end'; outlet.textContent = '← WATER OUT';
  const directions = ['north', 'east', 'south', 'west'];
  for (let index = 0; index < 4; index++) {
    const button = document.createElement('button'); button.className = 'pipe-tile';
    const paint = () => {
      const ports = pipePorts(index, rotations[index]);
      button.setAttribute('aria-label', `Rotate pipe ${index + 1}, connects ${ports.map(port => directions[port]).join(' and ')}`);
      button.replaceChildren();
      for (const port of ports) {
        const arm = document.createElement('span'); arm.className = `pipe-arm port-${port}`; button.append(arm);
      }
      const joint = document.createElement('span'); joint.className = 'pipe-joint'; button.append(joint);
    };
    button.addEventListener('click', () => {
      rotations[index] = (rotations[index] + 1) % 4; paint();
      if (pipesConnected(rotations)) onComplete();
    });
    paint(); grid.append(button);
  }
  panel.append(inlet, grid, outlet); container.append(panel);
  return () => panel.remove();
}

export const REPAIR_TASKS = {
  drywall: { title: 'Patch the drywall', instructions: 'Click each dark square, or hold the mouse button and sweep across the hole to cover all 40 areas.', start: startDrywall },
  floorboard: { title: 'Secure the floorboard', instructions: 'Click the four marked nail locations to hammer the loose board into place.', start: startFloorboard },
  pipe: {
    title: 'Stop the leak',
    instructions: 'Click a pipe to rotate it clockwise. Connect WATER IN at the top left to WATER OUT at the bottom left, using all four pieces. The route goes across the top, down, then back across the bottom.',
    start: startPipe,
  },
};
