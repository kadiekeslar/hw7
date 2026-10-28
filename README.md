# Fixer Upper

Designed by Kadie Keslar. A small house-repair game based on the original, unchanged `SPEC.md`.

**Play online:** https://kadiekeslar.github.io/hw7/

Walk through a first-person house and finish three jobs: patch drywall in the workroom, fix the kitchen sink, and secure a loose living-room floorboard. All three repairs are playable. Completing them shows **House Repaired!** and a restart button.

## Run locally

Requires Python 3 and a recent desktop browser. No dependencies to install or build step.

```sh
git clone https://github.com/kadiekeslar/hw7.git
cd hw7
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000. Stop the server with Ctrl+C. On Windows, use `py` instead of `python3` if needed. If 8000 is busy, use 8001 and open that port instead. ES modules require a server; do not open `index.html` directly as a file.

GitHub Pages publishes the root of `main`. Pushing to that branch starts a deployment; wait for its Actions check to succeed, then refresh the public game link.

## Controls and repairs

- W/S or up/down arrows: walk forward/backward.
- A/D: step sideways.
- Left/right arrows: turn your view.
- Click the game view: capture the mouse to look around. Esc releases the mouse. Click the view again to resume mouse look. Arrow-key turning works without mouse capture.
- E: start a nearby unfinished repair you are facing. You cannot interact through a wall.
- Esc or the close button in a repair: leave the task; unfinished task progress resets.
- Complete all three repairs, then choose **Start again** to reset the house and your position. Refresh also resets progress.

The small floor plan in the upper right shows walls, your position and viewing direction. Orange marks are unfinished jobs; green marks are completed jobs. Opening a repair releases the mouse and pauses movement.

**Drywall:** click all 40 dark areas, or hold the left mouse button and sweep across them. **Floorboard:** click all four nail locations. **Pipe:** rotate the four pipe tiles clockwise until water can travel from the left edge of the top-left tile, across the top row, down the right side, and across the bottom row to the left outlet. Completion is automatic once connected.

## Acceptance criteria from SPEC.md

| # | Status | Current behavior |
|---|---|---|
| 1 | Met | Opens directly into a first-person house with connected rooms. |
| 2 | Met | WASD walks; arrows provide forward/backward movement and turning. |
| 3 | Met | Player collision blocks outside walls, interior walls, and corners. |
| 4 | Met | Damaged drywall, a leaking sink/pipe, and a loose floorboard are present in separate areas. |
| 5 | Met | Facing a nearby unfinished object shows an E prompt. |
| 6 | Met | E opens that object's playable repair task. |
| 7 | Met | Drywall requires covering 40 areas. |
| 8 | Met | Drywall becomes a pale patched wall on completion. |
| 9 | Met | Four pipe pieces rotate to connect the inlet and outlet. |
| 10 | Met | Successful plumbing removes the sink's water stream and puddle. |
| 11 | Met | Floorboard requires four separate nail targets. |
| 12 | Met | The repaired board changes its surface and gains secured nail marks. |
| 13 | Met | Completed objects cannot be selected again; completion is counted once. |
| 14 | Met | Counter starts at 0 / 3. |
| 15 | Met | Each successful task increments the counter once. |
| 16 | Met | Completing the third repair opens House Repaired! |
| 17 | Met | Start again resets all repairs, counter, position, and view direction. |

## Code map

- `index.html`: game canvas, progress/checklist, repair and win dialogs.
- `style.css`: page layout, dialogs, drywall grid, nail targets, pipe tiles.
- `src/state.js`: tile map, fresh state, camera-relative movement, circle/wall collision, line of sight, interaction selection, completion count. Pure functions independent of browser APIs.
- `src/render.js`: dependency-free first-person software raycaster. Casts walls into a column depth buffer, projects floor polygons, and draws procedural object sprites with wall occlusion. Also draws the held hammer, crosshair, room name and floor plan.
- `src/repairs.js`: task registry and DOM mini-games. Each task receives `(container, onComplete)` and returns cleanup; success updates the shared state in `main.js`.
- `src/pipes.js`: pipe orientations and inlet-to-outlet connection validation for the fixed 2×2 puzzle.
- `src/main.js`: input, pointer lock, animation loop, task lifecycle, progress UI, win/restart.
- `tests/state.test.js`: collision, doorway passage, diagonal speed, interaction visibility, repair reachability, duplicate completion/reset, pipe success and failure cases.

## Changes after the initial foundation

The initial Phase 1 checkpoint had a top-down room and two playable tasks. At the author's request, this version adds the pipe puzzle and replaces the top-down rendering/movement with an eye-level, first-person house. The existing drywall and floorboard tasks, task registry, shared repair state, counter and dialog lifecycle were extended. The original spec remains unchanged.

## Known limits and shortcuts

- Rendering is a lightweight raycast perspective with pixel graphics, fixed-height walls and camera-facing object sprites; it does not implement Minecraft's block-building, jumping, or fully modeled 3D furniture.
- Walls block movement; decorative furniture and repair props can be walked through. Objects can disappear when you stand directly inside them. Back up to view/interact with them.
- Keyboard and mouse are required; there are no touch movement controls.
- Mouse look depends on browser pointer-lock support and permission. Use arrow-key turning if capture is unavailable. Up/down mouse look is a limited vertical view offset.
- Unfinished tasks reset on close. Refresh loses all progress. No save system.
- Drywall uses a cell grid and each nail needs one click. The pipe puzzle has a fixed layout, not procedural generation.
- Timer, budget, extra repair types, and sound remain unimplemented optional features from the spec.

## Validation

Optional automated checks require Node.js 18 or later; no npm install:

```sh
npm test
```

Seven tests pass, covering the logic listed in the code map. Browser playthrough verified walking through connected rooms, approaching all three jobs, completing drywall/floorboard/plumbing, reaching the win dialog, and restarting to 0 / 3. Keyboard turning was checked separately. Mouse capture is optional; test mouse look in your own desktop browser because embedded-browser support varies.

## Possible next work

1. Playtest movement speed, interaction range, and puzzle difficulty with another person.
2. Give furniture collision and improve object rendering at very close range.
3. Add the optional completion timer, then audio or more detailed graphics if class time remains.

Before the class handoff, review this documentation and the prompt log, then make the final commit/push within the class period.
