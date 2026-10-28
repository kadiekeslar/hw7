import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, movePlayer, nearestRepair, completedCount, completeRepair, HOUSE, PLAYER_RADIUS } from '../src/state.js';

test('movement stops the entire player at all four outside walls', () => {
  const state = createState();
  movePlayer(state, -1, -1, 100);
  assert.deepEqual(state.player, { x: HOUSE.x + PLAYER_RADIUS, y: HOUSE.y + PLAYER_RADIUS });
  movePlayer(state, 1, 1, 100);
  assert.deepEqual(state.player, { x: HOUSE.x + HOUSE.width - PLAYER_RADIUS, y: HOUSE.y + HOUSE.height - PLAYER_RADIUS });
});
test('diagonal movement has the same speed as straight movement', () => {
  const straight = createState(), diagonal = createState();
  movePlayer(straight, 1, 0, 0.1); movePlayer(diagonal, 1, 1, 0.1);
  assert.ok(Math.abs(Math.hypot(diagonal.player.x-450, diagonal.player.y-400) - (straight.player.x-450)) < 0.00001);
});
test('only nearby unfinished repairs can be selected and completion is counted once', () => {
  const state = createState();
  state.player = { x: 195, y: 180 };
  assert.equal(nearestRepair(state).id, 'drywall');
  assert.equal(completeRepair(state, 'drywall'), true);
  assert.equal(completeRepair(state, 'drywall'), false);
  assert.equal(completeRepair(state, 'missing'), false);
  assert.equal(completedCount(state), 1);
  assert.equal(nearestRepair(state), undefined);
});
test('new game resets all repairs independently of previous state', () => {
  const state = createState();
  for (const repair of state.repairs) completeRepair(state, repair.id);
  assert.equal(completedCount(state), 3);
  assert.equal(completedCount(createState()), 0);
});
