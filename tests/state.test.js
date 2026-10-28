import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, movePlayer, nearestRepair, completedCount, completeRepair, canStand, hasLineOfSight } from '../src/state.js';
import { INITIAL_ROTATIONS, pipePorts, pipesConnected } from '../src/pipes.js';

function walk(state, strafe, forward, steps) {
  for (let i=0;i<steps;i++) movePlayer(state,strafe,forward,0.02);
}

test('player remains inside outer walls when walking in each direction', () => {
  for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]) {
    const state=createState(); state.player.angle=angle;
    walk(state,0,1,500);
    assert.ok(canStand(state.player.x,state.player.y));
    assert.ok(state.player.x>1 && state.player.x<13 && state.player.y>1 && state.player.y<11);
  }
});
test('interior wall blocks movement but the doorway permits passage', () => {
  const state=createState(); state.player={x:6.5,y:6.5,angle:0,pitch:0};
  walk(state,0,1,50); assert.ok(state.player.x<7);
  state.player={x:6.5,y:7.5,angle:0,pitch:0};
  walk(state,0,1,50); assert.ok(state.player.x>8);
});
test('diagonal movement is normalized', () => {
  const straight=createState(), diagonal=createState();
  movePlayer(straight,0,1,.05); movePlayer(diagonal,1,1,.05);
  const distance = state=>Math.hypot(state.player.x-3.5,state.player.y-9.5);
  assert.ok(Math.abs(distance(straight)-distance(diagonal))<1e-8);
});
test('repairs require proximity, facing, and unobstructed line of sight', () => {
  const state=createState(); state.player={x:2.5,y:2.5,angle:-Math.PI/2,pitch:0};
  assert.equal(nearestRepair(state)?.id,'drywall');
  state.player.angle=Math.PI/2; assert.equal(nearestRepair(state),undefined);
  assert.equal(hasLineOfSight({x:6.5,y:3},{x:7.5,y:3}),false);
  assert.equal(hasLineOfSight({x:6.5,y:7.5},{x:8,y:7.5}),true);
});
test('all repair approaches are reachable through doorways from spawn', () => {
  const visited=new Set(), queue=[[3,9]];
  for(let i=0;i<queue.length;i++) {
    const [x,y]=queue[i], key=`${x},${y}`;
    if(visited.has(key)||!canStand(x+.5,y+.5))continue;
    visited.add(key); queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  for(const repair of createState().repairs) {
    assert.ok([...visited].some(key=>{const [x,y]=key.split(',').map(Number); const from={x:x+.5,y:y+.5};return Math.hypot(from.x-repair.x,from.y-repair.y)<1.65&&hasLineOfSight(from,repair);}),repair.id);
  }
});
test('completion is counted once and new game resets all objects', () => {
  const state=createState();
  for(const repair of state.repairs) {
    assert.equal(completeRepair(state,repair.id),true);
    assert.equal(completeRepair(state,repair.id),false);
  }
  assert.equal(completedCount(state),state.repairs.length);
  assert.equal(completedCount(createState()),0);
  assert.equal(completeRepair(state,'missing'),false);
});
test('pipe puzzle starts unsolved, accepts its continuous route, rejects any broken piece', () => {
  assert.equal(pipesConnected(INITIAL_ROTATIONS),false);
  const solution=[0,0,1,3];
  assert.equal(pipesConnected(solution),true);
  for(let i=0;i<4;i++) {const broken=[...solution];broken[i]=(broken[i]+1)%4;assert.equal(pipesConnected(broken),false);}
  assert.deepEqual(pipePorts(0,1),[2,0]);
});


test('all six repair locations have registered playable tasks', async () => {
  const { REPAIR_TASKS } = await import('../src/repairs.js');
  const state=createState();
  assert.equal(state.repairs.length,6);
  assert.equal(new Set(state.repairs.map(r=>r.id)).size,6);
  for(const repair of state.repairs) assert.equal(typeof REPAIR_TASKS[repair.id]?.start,'function',repair.id);
});
