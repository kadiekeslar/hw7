// World coordinates stay fixed when the canvas is resized by CSS.
export const HOUSE = { x: 50, y: 65, width: 800, height: 425 };
export const PLAYER_RADIUS = 14;
export const PLAYER_SPEED = 190;
export const INTERACTION_DISTANCE = 85;

export function createState() {
  return {
    player: { x: 450, y: 400 },
    repairs: [
      { id: 'drywall', name: 'Damaged drywall', x: 195, y: 140, repaired: false },
      { id: 'pipe', name: 'Leaking pipe', x: 710, y: 160, repaired: false },
      { id: 'floorboard', name: 'Loose floorboard', x: 365, y: 330, repaired: false },
    ],
  };
}

export function movePlayer(state, horizontal, vertical, seconds) {
  const length = Math.hypot(horizontal, vertical);
  if (!length) return;
  const distance = PLAYER_SPEED * seconds / length;
  // Clamp the player's entire circle inside the four outside walls.
  state.player.x = Math.max(HOUSE.x + PLAYER_RADIUS, Math.min(HOUSE.x + HOUSE.width - PLAYER_RADIUS, state.player.x + horizontal * distance));
  state.player.y = Math.max(HOUSE.y + PLAYER_RADIUS, Math.min(HOUSE.y + HOUSE.height - PLAYER_RADIUS, state.player.y + vertical * distance));
}

export function nearestRepair(state) {
  return state.repairs.filter(repair => !repair.repaired)
    .map(repair => ({ repair, distance: Math.hypot(repair.x - state.player.x, repair.y - state.player.y) }))
    .filter(candidate => candidate.distance <= INTERACTION_DISTANCE)
    .sort((a, b) => a.distance - b.distance)[0]?.repair;
}

export function completedCount(state) {
  return state.repairs.filter(repair => repair.repaired).length;
}

export function completeRepair(state, id) {
  const repair = state.repairs.find(repair => repair.id === id);
  if (!repair || repair.repaired) return false;
  repair.repaired = true;
  return true;
}
