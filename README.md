# Fixer Upper

Designed by Kadie Keslar. A small house-repair game based on the original, unchanged `SPEC.md`.

**Play online:** https://kadiekeslar.github.io/hw7/

**Taking over development?** Read `SPEC.md`, run the game using the steps below, then read [CONTRIBUTING.md](CONTRIBUTING.md) for the first-session checklist, exact extension steps, and code traps.

Walk through a first-person house and finish six jobs: patch drywall, fix the kitchen sink, secure a floorboard, replace a broken window, straighten a cabinet door, and replace a lamp bulb. All six repairs are playable. Completing them shows **House Repaired!** and a restart button.

## Run locally

Requires Python 3 and a recent desktop browser. No dependencies to install or build step.

```sh
git clone https://github.com/kadiekeslar/hw7.git
cd hw7
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000. Stop the server with Ctrl+C. On Windows, use `py` instead of `python3` if needed. If 8000 is busy, use 8001 and open that port instead. ES modules require a server; do not open `index.html` directly as a file.

GitHub Pages publishes the root of `main`. Pushing to that branch starts a deployment; wait for its Actions check to succeed, then refresh the public game link. Browser entry points and module imports carry a release query (`?v=3`) to avoid mixing cached files from an older release; bump these together when publishing another code update.

## Controls and repairs

- W/S or up/down arrows: walk forward/backward.
- A/D: step sideways.
- Left/right arrows: turn your view.
- Click the game view: capture the mouse to look around. Esc releases the mouse. Click the view again to resume mouse look. Arrow-key turning works without mouse capture.
- E: start a nearby unfinished repair you are facing. You cannot interact through a wall.
- Esc or the close button in a repair: leave the task; unfinished task progress resets.
- Complete all six repairs, then choose **Start again** to reset the house and your position. Refresh also resets progress.

Requires WebGL (normally enabled in current desktop browsers). The small floor plan in the upper right shows walls, your position and viewing direction. Orange marks are unfinished jobs; green marks are completed jobs. Opening a repair releases the mouse and pauses movement.

**Drywall:** click all 40 dark areas, or hold the left mouse button and sweep across them. **Floorboard:** click all four nail locations. **Pipe:** rotate the four pipe tiles clockwise until water can travel from the left edge of the top-left tile, across the top row, down the right side, and across the bottom row to the left outlet. Completion is automatic once connected.

**Window:** remove all four cracked panes, then click the four empty frames to fit new panes. **Cabinet:** level the door with the slider (within 1° of zero), then turn each of three screws three times. Alignment locks once you start tightening. **Lamp:** switch off the lamp, remove the old bulb, fit a new bulb, and switch it back on, in that order. The repaired lamp adds warm light to the dining room.

## Acceptance criteria from SPEC.md

| # | Status | Current behavior |
|---|---|---|
| 1 | Met | Opens directly into a first-person house with connected rooms. |
| 2 | Met | WASD walks; arrows provide forward/backward movement and turning. |
| 3 | Met | Player collision blocks outside walls, interior walls, and corners. Doorways connect the rooms. |
| 4 | Met | The three original jobs and three additional repairs are present across the house. |
| 5 | Met | Facing a nearby unfinished object shows an E prompt. |
| 6 | Met | E opens that object's playable repair task. |
| 7 | Met | Drywall requires covering 40 areas. |
| 8 | Met | Drywall becomes a pale patched wall on completion. |
| 9 | Met | Four pipe pieces rotate to connect the inlet and outlet. |
| 10 | Met | Successful plumbing removes the sink's water stream and puddle. |
| 11 | Met | Floorboard requires four separate nail targets. |
| 12 | Met | The repaired board changes its surface and gains secured nail marks. |
| 13 | Met | Completed objects cannot be selected again; completion is counted once. |
| 14 | Met | Counter starts at 0 / 6. |
| 15 | Met | Each successful task increments the counter once. |
| 16 | Met | Completing all six repairs opens House Repaired! |
| 17 | Met | Start again resets all repairs, counter, position, and view direction. |

## Code map

- `index.html`: game canvas, progress/checklist, repair and win dialogs.
- `style.css`: page layout, HUD, dialogs, and all six repair task styles.
- `src/state.js`: tile map, fresh state, camera-relative movement, circle/wall collision, line of sight, interaction selection, completion count. Pure functions independent of browser APIs.
- `src/render.js`: dependency-free WebGL renderer, mesh geometry, camera matrices, materials, procedural textures, lighting, and floor plan. Uses depth-tested solid geometry and a true perspective camera with vertical mouse look.
- `src/scene.js`: furniture and repair models built from boxes/cylinders. `buildScene` creates static furnishings; `buildRepair` creates broken/repaired fixtures. Change the house décor here.
- `src/repairs.js`: task registry and DOM mini-games. Each task receives `(container, onComplete)` and returns cleanup; success updates the shared state in `main.js`.
- `src/pipes.js`: pipe orientations and inlet-to-outlet connection validation for the fixed 2×2 puzzle.
- `src/main.js`: input, pointer lock, animation loop, task lifecycle, progress UI, win/restart.
- `tests/state.test.js`: collision, doorway passage, diagonal speed, interaction visibility, repair reachability, duplicate completion/reset, pipe success and failure cases, and the repair registry. Tests derive the spawn, repair count and interaction range from state so a new repair does not require changing those assertions.
- `CONTRIBUTING.md`: next-developer walkthrough, repair extension recipe, architecture traps, and manual validation checklist.
- `prompt_log.md`: important user prompts verbatim and clearly labeled implementation summaries.

## Changes after the initial foundation

The initial Phase 1 checkpoint had a top-down room and two playable tasks. At the author's request, a later version completed plumbing and added first-person exploration. This version responds to the author's next request for a more realistic house and more repairs: it upgrades the renderer from flat raycast sprites to solid 3D WebGL furniture and architecture, and adds window, cabinet, and lamp tasks. The existing state/movement, original mini-games, task lifecycle, counters, and win/restart logic were extended. The original spec remains unchanged; the added jobs expand the required count to six.

The scene has room-specific wood/tile surfaces, door trim, molding, windows and curtains, a kitchen with cabinets/oven/refrigerator, a sofa and coffee table, bookshelves, workbench, dining table/chairs, plants and framed art. Lamp completion changes the local light as well as the object appearance.

## Known limits and shortcuts

- Rendering uses solid 3D boxes/cylinders and procedural materials. It is a stylized house, with approximate lighting and contact-shadow patches, not photorealistic graphics or a Minecraft block-building system. Walls have a fixed 2.8m height; there is no jumping.
- Walls block movement; decorative furniture and repair props can be walked through. At very close range, the camera can clip inside a prop. Back up to inspect it. Props do not block interaction; walls do.
- Keyboard and mouse are required; there are no touch movement controls.
- Mouse look depends on browser pointer-lock support and permission. Use arrow-key turning if capture is unavailable. Vertical mouse look rotates the 3D camera and is clamped to a comfortable range.
- Unfinished tasks reset on close. Refresh loses all progress. No save system.
- Drywall uses a cell grid and each nail needs one click. The pipe puzzle has a fixed layout, not procedural generation.
- Timer, budget, sound, and additional repairs beyond the six jobs remain optional future work. The three added tasks implement the spec's optional window/cabinet/light ideas.

## Validation

Optional automated checks require Node.js 18 or later; no npm install:

```sh
npm run check
```

`npm run check` checks syntax in every source module and runs the same eight tests as `npm test`. Eight tests pass, covering the logic listed in the code map. Browser playthrough verified walking through connected rooms, approaching all six jobs, completing all six tasks (including staged pane removal/installation, level-before-screws, and ordered bulb replacement), reaching the win dialog after the sixth repair, and restarting to 0 / 6. Keyboard turning works in the preview. Mouse capture is optional; test mouse look in your own desktop browser because embedded-browser support varies.

A fresh export of the tracked repository files (without `.git` or `node_modules`) also passed `npm run check` and opened through the documented Python server. The clean-copy browser check verified 3D rendering, movement, proximity interaction, cancelling a partial floorboard task without counting it, and reopening with its progress reset.

## Author-requested next work (not implemented)

These requests are for the next developer to build. The current game still has **one floor and six playable repairs**; the original SPEC.md is unchanged.

1. **Make repairs obvious at a glance.** The player should see a damaged object and understand it needs fixing before discovering the E prompt. Emphasize visible holes, cracks, leaks/puddles, raised boards, a hanging cabinet door, and a dark/broken lamp. Clear repair labels or markers can reinforce the damage. Repaired objects should look clearly fixed and lose their unfinished marker.
2. **Add multiple floors the player can visit.** Build an upstairs and a clear way to travel between levels, such as stairs. Give each floor rooms and repair locations, identify the current floor, and preserve repair progress when changing floors. Keep collision, repair selection, the floor plan, win count, and restart consistent across levels.
3. Playtest those changes, then consider furniture collision, the optional timer, audio, or further visual detail.

**For the next person:** you can play the current working baseline immediately at **https://kadiekeslar.github.io/hw7/**. Local setup is only needed to develop your changes. See [CONTRIBUTING.md](CONTRIBUTING.md#author-requested-next-build) for implementation starting points and checks. If you publish your own repository, give it its own Pages link; the URL above serves this original repository.

The current checkpoint is ready for another developer to extend. Keep the original `SPEC.md` as the design baseline; this README records the actual implemented scope and remaining limitations. Follow the course instructions for creating an unmodified baseline in your own Phase 2 repository before making changes. Review the next-developer guide for concrete starting points.
