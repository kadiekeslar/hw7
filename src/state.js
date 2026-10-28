// One tile is one world meter. Map (x, y) becomes 3D (x, height, z=y).
// Keep WORLD rectangular: 1 = solid wall, 0 = walkable floor.
// Each repair ID must have a task in repairs.js and a model in scene.js.
export const WORLD = [
  "11111111111111",
  "10000001000001",
  "10000001000001",
  "10000001000001",
  "10000000000001",
  "11101111110111",
  "10000001000001",
  "10000000000001",
  "10000000000001",
  "10000001000001",
  "10000001000001",
  "11111111111111",
];
export const PLAYER_RADIUS = 0.2;
export const PLAYER_SPEED = 2.5;
export const INTERACTION_DISTANCE = 1.65;

export function createState() {
  return {
    player: { x: 3.5, y: 9.5, angle: -Math.PI / 2, pitch: 0 },
    repairs: [
      {
        id: "drywall",
        name: "Damaged drywall",
        x: 2.5,
        y: 1.18,
        repaired: false,
      },
      { id: "pipe", name: "Leaking pipe", x: 11.75, y: 1.8, repaired: false },
      {
        id: "floorboard",
        name: "Loose floorboard",
        x: 4.5,
        y: 7.3,
        repaired: false,
      },
      { id: "window", name: "Broken window", x: 1.06, y: 7.5, repaired: false },
      {
        id: "cabinet",
        name: "Crooked cabinet door",
        x: 9.45,
        y: 1.3,
        repaired: false,
      },
      {
        id: "light",
        name: "Burned-out lamp",
        x: 11.8,
        y: 9.3,
        repaired: false,
      },
    ],
  };
}

export function isWall(x, y) {
  return WORLD[Math.floor(y)]?.[Math.floor(x)] !== "0";
}

export function canStand(x, y) {
  // Circle versus nearby wall rectangles, including corners and outside the map.
  for (
    let row = Math.floor(y - PLAYER_RADIUS);
    row <= Math.floor(y + PLAYER_RADIUS);
    row++
  ) {
    for (
      let column = Math.floor(x - PLAYER_RADIUS);
      column <= Math.floor(x + PLAYER_RADIUS);
      column++
    ) {
      if (!isWall(column, row)) continue;
      const dx = x - Math.max(column, Math.min(x, column + 1));
      const dy = y - Math.max(row, Math.min(y, row + 1));
      if (dx * dx + dy * dy < PLAYER_RADIUS * PLAYER_RADIUS) return false;
    }
  }
  return true;
}

export function movePlayer(state, strafe, forward, seconds) {
  const length = Math.hypot(strafe, forward);
  if (!length) return;
  const { angle } = state.player;
  const distance = (PLAYER_SPEED * Math.min(seconds, 0.1)) / length;
  const dx = (Math.cos(angle) * forward - Math.sin(angle) * strafe) * distance;
  const dy = (Math.sin(angle) * forward + Math.cos(angle) * strafe) * distance;
  // Axis-separated movement slides along walls; short steps cannot tunnel through them.
  if (canStand(state.player.x + dx, state.player.y)) state.player.x += dx;
  if (canStand(state.player.x, state.player.y + dy)) state.player.y += dy;
}

export function hasLineOfSight(from, to) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.ceil(length / 0.05);
  for (let step = 1; step <= steps; step++) {
    const fraction = step / steps;
    if (
      isWall(
        from.x + (to.x - from.x) * fraction,
        from.y + (to.y - from.y) * fraction,
      )
    )
      return false;
  }
  return true;
}

export function nearestRepair(state) {
  return state.repairs
    .filter((repair) => !repair.repaired)
    .map((repair) => {
      const dx = repair.x - state.player.x,
        dy = repair.y - state.player.y;
      const direction = Math.atan2(dy, dx) - state.player.angle;
      return {
        repair,
        distance: Math.hypot(dx, dy),
        facing: Math.cos(direction),
      };
    })
    .filter(
      ({ repair, distance, facing }) =>
        distance <= INTERACTION_DISTANCE &&
        (distance < 0.45 || facing > 0.55) &&
        hasLineOfSight(state.player, repair),
    )
    .sort((a, b) => a.distance - b.distance)[0]?.repair;
}

export function completedCount(state) {
  return state.repairs.filter((repair) => repair.repaired).length;
}

export function completeRepair(state, id) {
  const repair = state.repairs.find((repair) => repair.id === id);
  if (!repair || repair.repaired) return false;
  repair.repaired = true;
  return true;
}
