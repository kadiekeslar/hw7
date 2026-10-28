# Phase 1 prompt log

## Tools and model

- Codex desktop coding agent (GPT-6 family; exact model variant not exposed to the assistant).
- GitHub connector to inspect the public repository; Git to clone its existing history.
- Terminal/file tools for implementation; Node's built-in test runner for logic tests.
- Codex in-app browser for a manual movement and repair-task smoke check.

## Initial user prompt (verbatim)

The repository link in the prompt was https://github.com/kadiekeslar/hw7. The user also attached the full HW7 assignment text separately. Their request was:

> [https://github.com/kadiekeslar/hw7](https://github.com/kadiekeslar/hw7) here is my current repo, it has a spec.md in it and here is the assignment  i am currently just working on the in class Basic outline:
>
> - **At the start of class,** we'll collect your repository link, which also serves as your submission for Repository 1. Make sure the repo exists and is public before you arrive.
> - **Commit `SPEC.md` first,** before any code, if you haven't already.
> - **Then build for about 45 minutes.**
> - **Reserve the last 15-25 minutes for documentation,** and make your **final commit before you leave the room.**
>
> this is what i am doing now, help me start building the game

## Implementation record (assistant summary, not additional user prompts)

Read the existing SPEC.md before implementing. Confirmed the public repo's first commit contains only SPEC.md and preserved that history. Kept the spec unchanged. Built plain browser JavaScript with separate state, rendering, task and input modules. Scoped this first pass to movement, interaction, two complete tasks, and an explicit unfinished plumbing task so another developer has a meaningful next step. Added an honest acceptance table and four pure-state tests. Browser check completed the floorboard and drywall and reached 2 / 3.

Subsequent important user prompts are recorded below verbatim. Result sections are assistant-written implementation summaries, not user prompts.


## Follow-up user prompt (verbatim)

> Make all the repairs doable, and make the game view in first person like how you would view a game like micraft it should look like you are actually walking through a house

### Result (assistant summary)

Completed the plumbing task with four rotatable pipe tiles and a fixed source-to-outlet route. Added pure puzzle validation. Changed rendering to a first-person raycaster with textured walls, connected rooms, wood flooring, procedural furniture, mouse/keyboard look, crosshair, held tool and floor-plan HUD. Extended movement collision and interaction checks for walls, viewing direction and line of sight. Preserved the original spec, existing drywall/floorboard tasks and task lifecycle. Updated tests and documentation. Browser playthrough completed all three repairs, reached the win dialog, and restarted.

### Earlier publishing follow-ups (verbatim)

> my repo isnt changed

Pushed the initial local checkpoint to GitHub.

> whats the link to open the game

Provided the local server link.

> how would i get the link from my repo

Explained GitHub Pages configuration. The author enabled Pages on main/root; the first deployment succeeded. The public link is recorded in README.md.


## House detail and additional repairs prompt (verbatim)

> make the house look more realistic and like a real house, and add some repairs that need to be done

### Result (assistant summary)

Replaced the raycast sprites with a dependency-free WebGL scene using solid 3D geometry, procedural wood/tile/fabric/plaster materials, room furnishings, appliances, windows, trim, and warm lighting. Kept the state/movement, original repairs, task registry and win flow. Added three interactive repairs: removing/replacing four window panes, leveling a cabinet and tightening its screws, and replacing a lamp bulb through ordered steps. Completion now requires all six repairs. Kept SPEC.md unchanged and documented expanded scope and remaining limits in README.md. Automated checks cover reachability and the six-task registry; a browser playthrough completed all six repairs and reached the win screen.


## Handoff preparation prompt (verbatim)

> make sure everything is easy and ready to hand off, it should be ready for the next person to start adding to it

### Result (assistant summary)

Reviewed the current setup instructions, code map, task lifecycle, tests, prompt log, and known limits. Formatted source consistently with Prettier 3.6.2 without adding a runtime dependency. Added CONTRIBUTING.md with a first-session checklist, exact steps for adding a repair, rendering/collision coordinate conventions and traps, and a manual smoke checklist. Removed an unused old raycaster FOV constant and named the active WebGL FOV. Made the repair-registry/reachability tests use current state values so they support future additions. Added npm run check for syntax plus tests. Preserved SPEC.md and existing gameplay; verified the handoff checkpoint before pushing it.
