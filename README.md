# Fixer Upper — Phase 1 foundation

Designed by Kadie Keslar. A small house-repair game based on the original, unchanged `SPEC.md`.

**Current build:** walk around one room, patch drywall, and secure a floorboard. The leaking pipe is visible and opens an explicit unfinished-task panel. **Only 2 of 3 repairs can currently be completed, so you cannot win yet.**

## Run on another machine

Requires Python 3 and a recent desktop browser. No dependencies to install or build step.

```sh
git clone https://github.com/kadiekeslar/hw7.git
cd hw7
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000 in your browser. Stop the server with Ctrl+C. On Windows, `py -m http.server 8000 --bind 127.0.0.1` may be the appropriate command. If the port is busy, use 8001 and open that port instead. Opening `index.html` directly as a file will not reliably load ES modules; use the server.

## Play

- WASD or arrow keys: move. Your character wears an orange cap.
- E: open the nearest unfinished repair within 85 world pixels.
- Drywall: click all 40 dark areas or hold the mouse button and sweep across them.
- Floorboard: click all four nail locations.
- Esc or the close button: leave a task. Unfinished task progress is discarded.
- Refresh the browser to reset the current prototype.

Movement pauses while a task is open. Completed objects change appearance, update the checklist/counter, and cannot be repaired again.

## Acceptance criteria from SPEC.md

| # | Status | Current behavior |
|---|---|---|
| 1 | Met | Opens directly into one playable room. |
| 2 | Met | WASD and arrow keys move the player. |
| 3 | Met | The player's full circle stays inside the outside walls. |
| 4 | Met | Drywall, a leaking sink/pipe, and a floorboard are visible. |
| 5 | Met | A nearby unfinished object shows an E prompt. |
| 6 | Partial | E opens each object's panel; the pipe panel contains only a placeholder. |
| 7 | Met | Drywall requires covering 40 areas. |
| 8 | Met | Completed drywall becomes a pale patched wall. |
| 9 | Not met | Rotating/connecting pipe puzzle is the primary Phase 2 TODO. |
| 10 | Not met | Rendering supports a repaired sink, but no playable task can trigger it yet. |
| 11 | Met | Floorboard requires clicking four separate nail targets. |
| 12 | Met | Completed board becomes straight and its nails change color. |
| 13 | Met | Completed objects are excluded from interaction and completion is idempotent. |
| 14 | Met | Counter starts at 0 / 3. |
| 15 | Met | Each successful task increments the counter exactly once. |
| 16 | Not met in play | All-repaired win dialog is wired, but unreachable until pipe completion exists. |
| 17 | Not met in play | Win-dialog restart resets state, but the dialog is currently unreachable. |

## Code map

- `index.html`: game canvas, progress/checklist, repair and win dialogs.
- `style.css`: page layout, modal styling, drywall grid and nail targets.
- `src/state.js`: world dimensions, fresh state, normalized movement, outside wall collision, nearest unfinished repair, completion counting. Pure functions, independent of browser APIs.
- `src/render.js`: canvas house, objects and player. Object appearances are derived from `repaired` flags. Change graphics here.
- `src/repairs.js`: task registry and DOM-based mini-games. Each task receives `(container, onComplete)` and returns cleanup. Add the pipe puzzle in the registry's `pipe.start` function (or extract another function/file).
- `src/main.js`: keyboard input, animation loop, task lifecycle, progress UI, win/restart wiring.
- `tests/state.test.js`: movement/collision, normalized speed, repair selection, duplicate completion and fresh-state tests.

## Next steps, in priority order

1. Implement `pipe.start` in `src/repairs.js`: show rotatable pipe pieces and check a continuous connection from source to outlet. Call `onComplete()` only after solving it, return cleanup, and leave completion/counting to `main.js`. Keep it small; budget, sound and extra repairs are low priority in the spec.
2. Play through all three repairs. Verify the leak stops, the counter reaches 3 / 3, the win dialog appears, and Start again resets all objects and position.
3. Update this README's acceptance table and remove the Phase 1 placeholder copy in `index.html` and `main.js` when it becomes inaccurate.
4. If time remains, tune task feel and visuals; an optional timer comes after the core loop.

## Known limits and shortcuts

- This is an intentionally incomplete Phase 1 foundation. The plumbing puzzle, playable win/restart flow, timer, budget, extra repairs and audio are unfinished.
- One open room; only outside walls block movement. Furniture and repair objects are decorative and can be walked over. No internal walls were added.
- Refresh loses all progress. Closing an unfinished task also resets its task progress.
- Keyboard and mouse are the primary controls. The page scales to narrow windows, but there are no touch movement buttons; mobile play is not supported.
- Drywall uses a cell grid rather than freeform painting so completion is deterministic and easy to extend.
- Nail targets each take one click; there is no hammer timing mechanic.
- Visuals use canvas primitives and CSS, with no external assets or libraries.
- State tests cover logic, not the win dialog or DOM tasks. Do not claim the full game is complete until the pipe and full playthrough are verified.

## Validation

Optional automated checks require Node.js 18 or later (no npm install):

```sh
npm test
```

Four state tests pass. Browser smoke check during Phase 1 verified movement, proximity prompts, opening tasks with E, completing all four floorboard nails, completing all 40 drywall areas, closing automatically after success, and reaching 2 / 3 with both checklist entries checked. Full win/restart flow has not been browser-tested because the pipe puzzle is missing.

Before handoff, also manually check arrow-key movement, all four walls, Esc cancellation, held-mouse drywall sweeping, and reopening partial tasks. Reserve class time to review this documentation and commit/push the final version before leaving.
