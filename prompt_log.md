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

Continue appending future significant prompts verbatim, with their model/tool and result. This file currently records only the first implementation request.
