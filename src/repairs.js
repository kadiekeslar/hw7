import { INITIAL_ROTATIONS, pipePorts, pipesConnected } from "./pipes.js?v=3";

// Each task calls onComplete only on success and returns cleanup for its listeners.
// Closing a task discards its unfinished progress; completed repairs live in state.js.
export function startDrywall(container, onComplete) {
  const grid = document.createElement("div");
  grid.className = "patch-grid";
  const covered = new Set();
  for (let index = 0; index < 40; index++) {
    const cell = document.createElement("button");
    cell.className = "patch-cell";
    cell.setAttribute("aria-label", `Patch area ${index + 1}`);
    cell.setAttribute("aria-pressed", "false");
    const cover = () => {
      if (covered.has(index)) return;
      covered.add(index);
      cell.classList.add("covered");
      cell.setAttribute("aria-pressed", "true");
      if (covered.size === 40) onComplete();
    };
    cell.addEventListener("pointerdown", (event) => {
      if (event.button === 0) cover();
    });
    cell.addEventListener("pointerenter", (event) => {
      if (event.buttons === 1) cover();
    });
    cell.addEventListener("click", cover);
    grid.append(cell);
  }
  container.append(grid);
  return () => grid.remove();
}

export function startFloorboard(container, onComplete) {
  const board = document.createElement("div");
  board.className = "board";
  let secured = 0;
  for (let index = 0; index < 4; index++) {
    const nail = document.createElement("button");
    nail.className = "nail";
    nail.textContent = "+";
    nail.setAttribute("aria-label", `Hammer nail ${index + 1}`);
    nail.addEventListener("click", () => {
      if (nail.disabled) return;
      nail.disabled = true;
      nail.textContent = "✓";
      secured++;
      if (secured === 4) onComplete();
    });
    board.append(nail);
  }
  container.append(board);
  return () => board.remove();
}

export function startPipe(container, onComplete) {
  const rotations = [...INITIAL_ROTATIONS];
  const panel = document.createElement("div");
  panel.className = "pipe-panel";
  const inlet = document.createElement("p");
  inlet.className = "pipe-end";
  inlet.textContent = "WATER IN →";
  const grid = document.createElement("div");
  grid.className = "pipe-grid";
  const outlet = document.createElement("p");
  outlet.className = "pipe-end";
  outlet.textContent = "← WATER OUT";
  const directions = ["north", "east", "south", "west"];
  for (let index = 0; index < 4; index++) {
    const button = document.createElement("button");
    button.className = "pipe-tile";
    const paint = () => {
      const ports = pipePorts(index, rotations[index]);
      button.setAttribute(
        "aria-label",
        `Rotate pipe ${index + 1}, connects ${ports.map((port) => directions[port]).join(" and ")}`,
      );
      button.replaceChildren();
      for (const port of ports) {
        const arm = document.createElement("span");
        arm.className = `pipe-arm port-${port}`;
        button.append(arm);
      }
      const joint = document.createElement("span");
      joint.className = "pipe-joint";
      button.append(joint);
    };
    button.addEventListener("click", () => {
      rotations[index] = (rotations[index] + 1) % 4;
      paint();
      if (pipesConnected(rotations)) onComplete();
    });
    paint();
    grid.append(button);
  }
  panel.append(inlet, grid, outlet);
  container.append(panel);
  return () => panel.remove();
}

export function startWindow(container, onComplete) {
  const panel = document.createElement("div");
  panel.className = "window-task";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const grid = document.createElement("div");
  grid.className = "window-panes";
  let removed = 0,
    installed = 0;
  const panes = [];
  status.textContent = "Remove the four cracked panes first.";
  for (let index = 0; index < 4; index++) {
    const pane = document.createElement("button");
    pane.className = "glass-pane cracked";
    pane.textContent = "╱";
    pane.setAttribute("aria-label", `Remove cracked pane ${index + 1}`);
    pane.addEventListener("click", () => {
      if (removed < 4) {
        if (pane.dataset.removed) return;
        pane.dataset.removed = "true";
        pane.textContent = "";
        pane.className = "glass-pane empty";
        pane.disabled = true;
        removed++;
        status.textContent = `Old panes removed: ${removed} / 4`;
        if (removed === 4) {
          status.textContent = "Now fit a new pane into each empty frame.";
          panes.forEach((p, i) => {
            p.disabled = false;
            p.textContent = "+";
            p.setAttribute("aria-label", `Install new pane ${i + 1}`);
          });
        }
      } else {
        if (pane.dataset.installed) return;
        pane.dataset.installed = "true";
        pane.textContent = "✓";
        pane.className = "glass-pane fitted";
        pane.disabled = true;
        installed++;
        status.textContent = `New panes fitted: ${installed} / 4`;
        if (installed === 4) onComplete();
      }
    });
    panes.push(pane);
    grid.append(pane);
  }
  panel.append(status, grid);
  container.append(panel);
  return () => panel.remove();
}

export function startCabinet(container, onComplete) {
  const panel = document.createElement("div");
  panel.className = "cabinet-task";
  const preview = document.createElement("div");
  preview.className = "cabinet-preview";
  const door = document.createElement("div");
  door.className = "cabinet-door";
  preview.append(door);
  const label = document.createElement("label");
  label.textContent = "Door angle";
  label.htmlFor = "door-angle";
  const slider = document.createElement("input");
  slider.id = "door-angle";
  slider.type = "range";
  slider.min = "-15";
  slider.max = "15";
  slider.value = "12";
  slider.step = "1";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const screws = document.createElement("div");
  screws.className = "screw-targets";
  const turns = [0, 0, 0];
  const update = () => {
    const angle = Number(slider.value);
    door.style.transform = `rotate(${angle}deg)`;
    status.textContent =
      Math.abs(angle) <= 1
        ? "Door is level. Give each hinge screw three turns."
        : `Door tilt: ${angle}°. Move the slider to level it (0°).`;
    [...screws.children].forEach(
      (button, index) =>
        (button.disabled = Math.abs(angle) > 1 || turns[index] === 3),
    );
  };
  for (let index = 0; index < 3; index++) {
    const button = document.createElement("button");
    button.textContent = `Screw ${index + 1}: 0 / 3`;
    button.setAttribute("aria-label", `Tighten hinge screw ${index + 1}`);
    button.addEventListener("click", () => {
      turns[index]++;
      button.textContent = `Screw ${index + 1}: ${turns[index]} / 3`;
      // Lock alignment after the first screw so the repaired door cannot be tilted again.
      slider.disabled = true;
      update();
      if (turns.every((n) => n === 3)) onComplete();
    });
    screws.append(button);
  }
  slider.addEventListener("input", update);
  update();
  panel.append(preview, label, slider, status, screws);
  container.append(panel);
  return () => panel.remove();
}

export function startLight(container, onComplete) {
  const panel = document.createElement("div");
  panel.className = "lamp-task";
  const bulb = document.createElement("div");
  bulb.className = "bulb-preview";
  bulb.textContent = "◉";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  status.textContent = "Start by switching off the lamp.";
  const steps = [
    "Switch off lamp",
    "Remove old bulb",
    "Fit new bulb",
    "Switch lamp on",
  ];
  let current = 0;
  const buttons = steps.map((text, index) => {
    const button = document.createElement("button");
    button.textContent = text;
    button.disabled = index !== 0;
    button.addEventListener("click", () => {
      if (index !== current) return;
      button.disabled = true;
      button.textContent = `✓ ${text}`;
      current++;
      bulb.textContent = current === 2 ? "○" : "◉";
      bulb.classList.toggle("new-bulb", current >= 3);
      if (current === steps.length) onComplete();
      else {
        buttons[current].disabled = false;
        status.textContent = `Next: ${steps[current].toLowerCase()}.`;
      }
    });
    return button;
  });
  panel.append(bulb, status, ...buttons);
  container.append(panel);
  return () => panel.remove();
}

export const REPAIR_TASKS = {
  drywall: {
    title: "Patch the drywall",
    instructions:
      "Click each dark square, or hold the mouse button and sweep across the hole to cover all 40 areas.",
    start: startDrywall,
  },
  floorboard: {
    title: "Secure the floorboard",
    instructions:
      "Click the four marked nail locations to hammer the loose board into place.",
    start: startFloorboard,
  },
  window: {
    title: "Replace the broken glass",
    instructions:
      "Click to remove all four cracked panes, then fit four new panes into the frame.",
    start: startWindow,
  },
  cabinet: {
    title: "Straighten the cabinet door",
    instructions:
      "Slide the door until it is level, then tighten each of the three hinge screws with three clicks.",
    start: startCabinet,
  },
  light: {
    title: "Bring the lamp back to life",
    instructions:
      "Complete the four steps in order to replace the burned-out bulb.",
    start: startLight,
  },
  pipe: {
    title: "Stop the leak",
    instructions:
      "Click a pipe to rotate it clockwise. Connect WATER IN at the top left to WATER OUT at the bottom left, using all four pieces. The route goes across the top, down, then back across the bottom.",
    start: startPipe,
  },
};
