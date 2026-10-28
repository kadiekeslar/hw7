// Directions clockwise: north, east, south, west. Rotating adds one modulo four.
export const PIPE_SHAPES = [
  [1, 3],
  [2, 3],
  [0, 2],
  [0, 1],
];
export const INITIAL_ROTATIONS = [1, 1, 0, 1];
export function pipePorts(index, rotation) {
  return PIPE_SHAPES[index].map((direction) => (direction + rotation) % 4);
}

// A 2 x 2 route: inlet -> top left -> top right -> bottom right -> bottom left -> outlet.
export function pipesConnected(rotations) {
  const route = [0, 1, 3, 2];
  const required = [
    [3, 1],
    [3, 2],
    [0, 3],
    [1, 3],
  ];
  return route.every((index, step) =>
    required[step].every((port) =>
      pipePorts(index, rotations[index]).includes(port),
    ),
  );
}
