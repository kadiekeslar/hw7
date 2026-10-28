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

export const REPAIR_TASKS = {
  drywall: { title: 'Patch the drywall', instructions: 'Click each dark square, or hold the mouse button and sweep across the hole to cover all 40 areas.', start: startDrywall },
  floorboard: { title: 'Secure the floorboard', instructions: 'Click the four marked nail locations to hammer the loose board into place.', start: startFloorboard },
  pipe: {
    title: 'A plumbing job for later',
    instructions: 'This repair is not built yet. The next developer will add the rotating pipe puzzle here. Close this panel and try the drywall or floorboard.',
    // TODO Phase 2: add a pipe grid with rotation and continuous source-to-outlet validation.
    // Call onComplete only when the connection succeeds. Never complete on panel close.
    start: () => () => {},
  },
};
