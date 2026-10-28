# Next developer: start here

This is a working six-repair baseline, with no downloaded assets, runtime packages, API keys, database, or build step. Extend the existing modules in small steps.

## Your first 10–15 minutes

1. Read `SPEC.md` for the original design and priorities. The README acceptance table reports current behavior; three optional repair ideas have already been added, so winning now requires six jobs.
2. Run `python3 -m http.server 8000 --bind 127.0.0.1` at the repository root and open http://127.0.0.1:8000. Use `py` on Windows if needed. You need desktop WebGL, a keyboard and a mouse. Do not double-click the HTML file.
3. Play a repair before editing. Read `src/main.js` to see how a successful task changes shared state.
4. With Node.js 18+ installed, run `npm run check`. No `npm install` is needed. This checks JavaScript syntax and runs eight logic tests; it does **not** test WebGL or click through the task UIs.
5. Pick one change from the priority list below, make a small commit, and update the README if behavior changes.

For the course's Phase 2, follow its instructions for saving the received, unmodified baseline in your own repository before editing. The original design is in `SPEC.md`; record implementation changes in README rather than silently rewriting that spec.

## Where to make a change

| Change | Start here | Watch out for |
|---|---|---|
| Movement speed/range | Constants in `src/state.js` | Movement is meters per second, with diagonal normalization. |
| Room layout/wall collision | `WORLD` in `src/state.js` | Keep rows equal length, the outside boundary closed, and paths to every repair. |
| Furniture or repair appearance | `buildScene` / `buildRepair` in `src/scene.js` | Furniture is decorative; walls own collision. |
| Task interaction/difficulty | Functions and `REPAIR_TASKS` in `src/repairs.js` | The success callback, not panel close, completes a job. |
| Pipe puzzle rules | `src/pipes.js` | Fixed 2×2 route, not a generic pipe-network solver. |
| Camera/lighting/materials | `src/render.js` | Active FOV and eye height are at the top; lamp light also has a fixed world position in the shader. |
| Controls, timer, restart, counter | `src/main.js` | Pause time/input during dialogs; reset new state when restarting. |
| Page/dialog appearance | `index.html` and `style.css` | Keep canvas and HUD element IDs used by the renderer. |

## Add one repair, step by step

1. Add a fresh entry to `createState().repairs` in `src/state.js`:

   ```js
   { id: "newRepair", name: "Player-facing job name", x: 5.5, y: 3.5, repaired: false }
   ```

   Pick walkable coordinates near the intended prop. IDs must be unique. Do not reuse an existing job's ID or remove the original IDs without reviewing the renderer dependencies below.

2. Add its task function in `src/repairs.js`, then register that ID in `REPAIR_TASKS`. Follow the existing functions. The lifecycle contract is:

   ```js
   function startNewRepair(container, onComplete) {
     const panel = document.createElement("div");
     // Build a task with a real completion rule and scoped event listeners.
     // On success only: onComplete();
     container.append(panel);
     return () => panel.remove();
   }
   ```

   Register `{ title, instructions, start: startNewRepair }`. Do not increment the counter, set `repaired`, open the win dialog, or call `onComplete` when cancelling: `main.js` owns completion. Return cleanup for any window/document listeners, timers or animations you create. Task-local partial progress is intentionally discarded on close.

3. Add a matching branch to `buildRepair(add, repair)` in `src/scene.js`. Use the supplied `x`, `y` and `repaired` values for both broken and fixed appearances. Existing helpers accept positions **relative** to that repair, except their vertical-height argument.
4. Update `style.css` for the new task, if needed. The checklist, floor-plan marker, total counter and win requirement automatically follow `state.repairs.length`; do not hardcode seven into `main.js`.
5. Run `npm run check`. The registry test catches missing task registrations and duplicate IDs; reachability checks for an unobstructed nearby approach. These tests cannot verify that your model is visible or that your UI is solvable: play the new task, cancel/reopen it, finish it, and finish a full game.
6. Update README scope/controls/limits and append the important prompt verbatim to `prompt_log.md`. Follow the publishing notes below if this is a public code update.

## Coordinate and renderer traps

- Map coordinates are `(x, y)` on the floor. One tile is one meter. In the 3D renderer they become `(x, verticalHeight, z = mapY)`; WebGL Y is up. Player angle 0 faces east; `-Math.PI / 2` faces north. Spawn is defined by `createState()`.
- `WORLD` drives walls, collision and the floor plan. Floor/ceiling room rectangles and door headers/trim in `createRenderer` are currently authored separately. If you move walls or doors, update those surfaces and the prop placement too.
- Repair meshes are cached and rebuilt when completion flags change. Static furniture is built once when the renderer starts. Reload after source/placement changes. Runtime animation or moving props needs explicit cache invalidation or a per-frame model update.
- `floorboard` has special drawing code in `src/render.js`, because its board sits on the floor. Its model coordinates are currently fixed there. Moving the repair entry alone will move its interaction/marker but not the board; change both.
- The renderer expects the `floorboard` and `light` IDs to exist. The lamp's shader light position is fixed at `(11.8, 1.65, 9.3)`; move that if you move its model. Removing either repair requires changing these lookups/rendering paths first.
- The sink and cabinet models sit inside static kitchen cabinetry from `buildScene`. When moving them, move the surrounding cabinet/counter pieces too.
- Furniture is solid visually but does not block the player or line of sight. Wall collision uses a 0.2m player radius. If you add furniture collision, test narrow doorways and access to all jobs.
- The renderer uses approximate lighting, no shadow-map system, and small contact-shadow floor patches. It is intentionally dependency-free. Shader strings in `src/render.js` are GLSL, not JavaScript; `node --check` cannot validate them. Test renderer changes in a real browser.
- `FIELD_OF_VIEW` from the old raycaster was removed. `VERTICAL_FIELD_OF_VIEW` in `src/render.js` is the active value.

## Manual smoke checklist

- Open a fresh session at 0/6; movement and turning work. Click to capture the mouse, move it, then Esc to release it. Arrow turning is the fallback if capture is unavailable.
- Walk into an outside wall and an interior wall. Pass through the doorways. Face a nearby job for the E prompt; a wall should block interaction.
- Start a task, make partial progress, close with Esc, and reopen: partial progress resets and the counter stays unchanged.
- Complete each job once: drywall (40 areas), floorboard (4 nails), pipe (continuous inlet/outlet route), window (4 removals then 4 installations), cabinet (level slider then 3 turns on 3 screws), lamp (4 steps in order).
- Check each prop's repaired appearance and the checklist/count. The lamp adds warm light; the sink stops leaking. Repaired jobs cannot be selected again.
- Confirm the sixth repair opens **House Repaired!**; **Start again** resets all six objects, count, position and view.
- Resize the browser. The game/HUD/dialogs should remain usable. Small-screen touch play is not supported.

The last implementation playthrough completed all six tasks and verified win/restart. The automated suite covers logic and task registrations, not task DOM interactions or visual quality.

## Recommended next change

1. **Completion timer** (a small optional feature from SPEC): track active play time in `main.js`, show it in the HUD/win dialog, pause in dialogs or when hidden, and reset on restart. Decide and document whether task time should count before implementing.
2. **Furniture collision**: add a small set of collision rectangles to the movement layer without coupling state to WebGL. Verify every repair stays reachable.
3. **Audio or task feedback**: add explicit player controls for sound, or brief visible feedback. Keep browser audio activation rules in mind.

## Publishing and cache

GitHub Pages currently deploys `main` / repository root. A recipient working in their own repository must configure their own Pages URL; update README accordingly. Never assume the original author's public URL hosts your fork.

Browser imports and the script/stylesheet in `index.html` include `?v=3`. For a gameplay release, change that version consistently in **index.html and all versioned imports in src/** so Pages/browser caches cannot mix old/new modules. Then push, wait for the Pages Actions job to succeed, refresh and inspect the live game. Documentation/formatting-only changes do not need a version bump.

No credentials or third-party services are required. Formatting follows Prettier 3.6.2 defaults; it is an optional developer tool, not a runtime dependency.
