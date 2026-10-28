import { WORLD, nearestRepair } from "./state.js?v=3";
import { buildScene, buildRepair } from "./scene.js?v=3";

const WALL_HEIGHT = 2.8;
const EYE_HEIGHT = 1.62;
const VERTICAL_FIELD_OF_VIEW = Math.PI / 3; // 60 degrees; this is the active camera FOV.
const hex = (value) =>
  [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);

// Column-major matrices, matching WebGL uniforms. World Y points up; map Y is world Z.
function multiply(a, b) {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column++)
    for (let row = 0; row < 4; row++)
      for (let i = 0; i < 4; i++)
        out[column * 4 + row] += a[i * 4 + row] * b[column * 4 + i];
  return out;
}
function perspective(aspect) {
  const f = 1 / Math.tan(VERTICAL_FIELD_OF_VIEW / 2),
    near = 0.05,
    far = 45;
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0,
  ]);
}
function camera(player) {
  const { x, y: z, angle, pitch } = player;
  const right = [-Math.sin(angle), 0, Math.cos(angle)];
  const forward = [
    Math.cos(angle) * Math.cos(pitch),
    Math.sin(pitch),
    Math.sin(angle) * Math.cos(pitch),
  ];
  const back = forward.map((n) => -n);
  const up = [
    back[1] * right[2],
    back[2] * right[0] - back[0] * right[2],
    -back[1] * right[0],
  ];
  const dot = (v) => v[0] * x + v[1] * EYE_HEIGHT + v[2] * z;
  return new Float32Array([
    right[0],
    up[0],
    back[0],
    0,
    right[1],
    up[1],
    back[1],
    0,
    right[2],
    up[2],
    back[2],
    0,
    -dot(right),
    -dot(up),
    -dot(back),
    1,
  ]);
}
function model(item) {
  const a = item.angle || 0,
    c = Math.cos(a),
    s = Math.sin(a);
  return new Float32Array([
    c * item.w,
    0,
    -s * item.w,
    0,
    0,
    item.h,
    0,
    0,
    s * item.d,
    0,
    c * item.d,
    0,
    item.x,
    item.y,
    item.z,
    1,
  ]);
}

function geometry(kind) {
  const data = [];
  const vertex = (p, n, u, v) => data.push(...p, ...n, u, v);
  const quad = (points, normal) => {
    for (const i of [0, 1, 2, 0, 2, 3])
      vertex(points[i], normal, [0, 1, 1, 0][i], [0, 0, 1, 1][i]);
  };
  if (kind === "box") {
    quad(
      [
        [-0.5, -0.5, 0.5],
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0.5],
        [-0.5, 0.5, 0.5],
      ],
      [0, 0, 1],
    );
    quad(
      [
        [0.5, -0.5, -0.5],
        [-0.5, -0.5, -0.5],
        [-0.5, 0.5, -0.5],
        [0.5, 0.5, -0.5],
      ],
      [0, 0, -1],
    );
    quad(
      [
        [0.5, -0.5, 0.5],
        [0.5, -0.5, -0.5],
        [0.5, 0.5, -0.5],
        [0.5, 0.5, 0.5],
      ],
      [1, 0, 0],
    );
    quad(
      [
        [-0.5, -0.5, -0.5],
        [-0.5, -0.5, 0.5],
        [-0.5, 0.5, 0.5],
        [-0.5, 0.5, -0.5],
      ],
      [-1, 0, 0],
    );
    quad(
      [
        [-0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5],
        [0.5, 0.5, -0.5],
        [-0.5, 0.5, -0.5],
      ],
      [0, 1, 0],
    );
    quad(
      [
        [-0.5, -0.5, -0.5],
        [0.5, -0.5, -0.5],
        [0.5, -0.5, 0.5],
        [-0.5, -0.5, 0.5],
      ],
      [0, -1, 0],
    );
  } else {
    for (let i = 0; i < 20; i++) {
      const a = (i * Math.PI) / 10,
        b = ((i + 1) * Math.PI) / 10;
      const p = [Math.cos(a) * 0.5, Math.sin(a) * 0.5],
        q = [Math.cos(b) * 0.5, Math.sin(b) * 0.5];
      const n = [Math.cos((a + b) / 2), 0, Math.sin((a + b) / 2)];
      quad(
        [
          [p[0], -0.5, p[1]],
          [q[0], -0.5, q[1]],
          [q[0], 0.5, q[1]],
          [p[0], 0.5, p[1]],
        ],
        n,
      );
      for (const [sign, order] of [
        [1, [p, q]],
        [-1, [q, p]],
      ]) {
        vertex([0, sign * 0.5, 0], [0, sign, 0], 0.5, 0.5);
        for (const r of order)
          vertex(
            [r[0], sign * 0.5, r[1]],
            [0, sign, 0],
            r[0] + 0.5,
            r[1] + 0.5,
          );
      }
    }
  }
  return new Float32Array(data);
}

function createTexture(gl, material) {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 128;
  const c = tile.getContext("2d");
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, 128, 128);
  // Deterministic grain avoids random changes across launches and has no asset downloads.
  let seed = 29;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  if (material === "wood") {
    c.fillStyle = "#e3c49b";
    c.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 250; i++) {
      c.strokeStyle = `rgba(93,61,34,${0.04 + random() * 0.16})`;
      c.lineWidth = 0.5 + random();
      const y = random() * 128;
      c.beginPath();
      c.moveTo(0, y);
      c.bezierCurveTo(35, y + random() * 7, 85, y - random() * 7, 128, y);
      c.stroke();
    }
    c.fillStyle = "#745638";
    c.fillRect(0, 0, 128, 1);
    c.fillRect(0, 0, 1, 128);
  } else if (material === "tile") {
    c.fillStyle = "#ece8de";
    c.fillRect(0, 0, 128, 128);
    c.strokeStyle = "#b5b6a6";
    c.lineWidth = 2;
    c.strokeRect(0, 0, 128, 128);
    for (let i = 0; i < 200; i++) {
      c.fillStyle = `rgba(116,108,93,${random() * 0.08})`;
      c.fillRect(random() * 128, random() * 128, 2, 2);
    }
  } else if (material === "fabric") {
    c.fillStyle = "#f2ede1";
    c.fillRect(0, 0, 128, 128);
    c.strokeStyle = "#8d8c7e33";
    c.lineWidth = 0.6;
    for (let i = 0; i < 128; i += 3) {
      c.beginPath();
      c.moveTo(i, 0);
      c.lineTo(i, 128);
      c.moveTo(0, i);
      c.lineTo(128, i);
      c.stroke();
    }
  } else if (material === "plaster" || material === "stone") {
    for (let i = 0; i < 3500; i++) {
      const shade = Math.floor(
        (material === "stone" ? 230 : 246) +
          random() * (material === "stone" ? 25 : 9),
      );
      c.fillStyle = `rgb(${shade},${shade},${shade})`;
      c.fillRect(
        random() * 128,
        random() * 128,
        material === "stone" ? 2 : 1,
        1,
      );
    }
  }
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tile);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR,
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
}

export function createRenderer(canvas) {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
  if (!gl)
    throw new Error(
      "This game needs WebGL. Try a recent desktop browser with hardware acceleration enabled.",
    );
  const vertexSource = `
    attribute vec3 aPosition; attribute vec3 aNormal; attribute vec2 aUV;
    uniform mat4 uModel; uniform mat4 uViewProjection;
    varying vec3 vPosition; varying vec3 vNormal; varying vec2 vUV;
    void main(){vec4 world=uModel*vec4(aPosition,1.0);vPosition=world.xyz;vNormal=normalize(mat3(uModel)*aNormal);vUV=aUV;gl_Position=uViewProjection*world;}`;
  const fragmentSource = `
    precision mediump float;
    varying vec3 vPosition; varying vec3 vNormal; varying vec2 vUV;
    uniform sampler2D uTexture; uniform vec3 uColor; uniform vec2 uRepeat;
    uniform vec3 uEye; uniform float uGlow; uniform float uShine; uniform float uLamp;
    void main(){
      vec3 normal=normalize(vNormal);vec3 tex=texture2D(uTexture,vUV*uRepeat).rgb;
      vec3 light=vec3(.46,.44,.38);
      vec3 sun=normalize(vec3(.4,.65,.2));light+=vec3(.43,.43,.37)*max(0.0,dot(normal,sun));
      vec3 lamp=vec3(3.6,2.35,8.5)-vPosition;
      light+=vec3(.62,.44,.22)*max(0.0,dot(normal,normalize(lamp)))/(1.0+dot(lamp,lamp)*.15);
      lamp=vec3(10.5,2.35,3.0)-vPosition;
      light+=vec3(.46,.43,.29)*max(0.0,dot(normal,normalize(lamp)))/(1.0+dot(lamp,lamp)*.12);
      lamp=vec3(11.8,1.65,9.3)-vPosition;
      light+=uLamp*vec3(.9,.59,.22)*max(0.0,dot(normal,normalize(lamp)))/(1.0+dot(lamp,lamp)*1.2);
      vec3 color=uColor*tex*light;
      vec3 reflected=reflect(-sun,normal);float spec=pow(max(0.0,dot(normalize(uEye-vPosition),reflected)),32.0);
      color+=uShine*spec*vec3(.3,.3,.26);color=mix(color,uColor*1.35,uGlow);
      float fog=1.0-exp(-length(uEye-vPosition)*.012);
      color=mix(color,vec3(.71,.69,.61),fog);
      gl_FragColor=vec4(color,1.0);
    }`;
  function shader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  const names = [
    "uModel",
    "uViewProjection",
    "uTexture",
    "uColor",
    "uRepeat",
    "uEye",
    "uGlow",
    "uShine",
    "uLamp",
  ];
  const uniforms = Object.fromEntries(
    names.map((name) => [name, gl.getUniformLocation(program, name)]),
  );
  const attributes = ["aPosition", "aNormal", "aUV"].map((name) =>
    gl.getAttribLocation(program, name),
  );
  const meshes = {};
  for (const kind of ["box", "cylinder"]) {
    const data = geometry(kind),
      buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    meshes[kind] = { buffer, count: data.length / 8 };
  }
  const textures = Object.fromEntries(
    [
      "plain",
      "wood",
      "tile",
      "fabric",
      "plaster",
      "stone",
      "metal",
      "glass",
      "glow",
    ].map((name) => [name, createTexture(gl, name)]),
  );
  const staticItems = [];
  const add = (kind, item) => staticItems.push({ kind, ...item });
  const box = (x, y, z, w, h, d, color, material = "plain", repeat = [1, 1]) =>
    add("box", { x, y, z, w, h, d, color, material, repeat });
  // Room-specific surfaces, physical baseboards, and crown molding.
  for (const room of [
    { x: 4, z: 8, w: 6, d: 6, color: "#c7ac87", floor: "wood" },
    { x: 4, z: 3, w: 6, d: 4, color: "#b49b77", floor: "wood" },
    { x: 10.5, z: 3, w: 5, d: 4, color: "#d8d4c6", floor: "tile" },
    { x: 10.5, z: 8, w: 5, d: 6, color: "#c0a27b", floor: "wood" },
  ]) {
    box(room.x, -0.05, room.z, room.w, 0.1, room.d, room.color, room.floor, [
      room.w,
      room.d * 2,
    ]);
    box(room.x, 2.85, room.z, room.w, 0.1, room.d, "#e8e4d8", "plaster");
  }
  WORLD.forEach((row, z) =>
    [...row].forEach((cell, x) => {
      if (cell !== "1") return;
      const color =
        x >= 7
          ? z < 6
            ? "#dce1d1"
            : "#d2dbce"
          : z < 6
            ? "#e4dfd1"
            : "#e3dccc";
      box(
        x + 0.5,
        WALL_HEIGHT / 2,
        z + 0.5,
        1,
        WALL_HEIGHT,
        1,
        color,
        "plaster",
      );
      box(x + 0.5, 0.08, z + 0.5, 1.035, 0.16, 1.035, "#f0e9d7");
      box(x + 0.5, 2.71, z + 0.5, 1.045, 0.13, 1.045, "#eee7d7");
    }),
  );
  // Door openings receive a header and wood trim instead of reading as missing walls.
  for (const [x, z, alongX] of [
    [3.5, 5.5, false],
    [10.5, 5.5, false],
    [7.5, 4.5, true],
    [7.5, 7.5, true],
    [7.5, 8.5, true],
  ]) {
    box(x, 2.55, z, 1, 0.5, 1, "#e3dfcf", "plaster");
    if (alongX) {
      for (const dz of [-0.46, 0.46])
        box(x, 1.18, z + dz, 1.025, 2.36, 0.08, "#c7b394", "wood");
    } else {
      for (const dx of [-0.46, 0.46])
        box(x + dx, 1.18, z, 0.08, 2.36, 1.025, "#c7b394", "wood");
    }
    box(
      x,
      2.3,
      z,
      alongX ? 1.025 : 1.05,
      0.09,
      alongX ? 1.05 : 1.025,
      "#c7b394",
      "wood",
    );
  }
  // Flat rugs and contact shadows anchor furniture to the floor.
  box(2.7, 0.006, 9, 3, 0.012, 3.2, "#7d8d81", "fabric", [2, 2]);
  box(2.7, 0.014, 9, 2.7, 0.009, 2.9, "#9ba591", "fabric", [3, 3]);
  for (const [x, z, w, d] of [
    [1.6, 9.1, 1, 2.55],
    [3, 9.05, 0.9, 1.5],
    [10.35, 7.65, 1.7, 2.2],
  ])
    box(x, 0.021, z, w, 0.005, d, "#8b8065");
  buildScene(add);
  let repairKey = "",
    repairItems = [];
  const mapCanvas = document.querySelector("#floor-plan"),
    mapContext = mapCanvas.getContext("2d");
  const roomLabel = document.querySelector("#room-name");
  const reticle = document.querySelector("#crosshair");

  function draw(item) {
    const mesh = meshes[item.kind];
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
    for (let i = 0; i < 3; i++) {
      gl.enableVertexAttribArray(attributes[i]);
      gl.vertexAttribPointer(
        attributes[i],
        i === 2 ? 2 : 3,
        gl.FLOAT,
        false,
        32,
        i === 0 ? 0 : i === 1 ? 12 : 24,
      );
    }
    gl.uniformMatrix4fv(uniforms.uModel, false, model(item));
    gl.uniform3fv(uniforms.uColor, hex(item.color));
    gl.uniform2fv(uniforms.uRepeat, item.repeat || [1, 1]);
    gl.uniform1f(uniforms.uGlow, item.material === "glow" ? 1 : 0);
    gl.uniform1f(
      uniforms.uShine,
      ["metal", "glass", "stone"].includes(item.material) ? 0.65 : 0,
    );
    gl.bindTexture(gl.TEXTURE_2D, textures[item.material || "plain"]);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }
  return function drawHouse(state, time, mouseLocked) {
    const p = state.player;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.72, 0.67, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(
      uniforms.uViewProjection,
      false,
      multiply(perspective(canvas.width / canvas.height), camera(p)),
    );
    gl.uniform3f(uniforms.uEye, p.x, EYE_HEIGHT, p.y);
    gl.uniform1f(
      uniforms.uLamp,
      state.repairs.find((r) => r.id === "light").repaired ? 1 : 0,
    );
    gl.uniform1i(uniforms.uTexture, 0);
    for (const item of staticItems) draw(item);
    const key = state.repairs.map((r) => Number(r.repaired)).join("");
    if (key !== repairKey) {
      repairKey = key;
      repairItems = [];
      for (const r of state.repairs)
        buildRepair((kind, item) => repairItems.push({ kind, ...item }), r);
    }
    for (const item of repairItems) draw(item);
    const board = state.repairs.find((r) => r.id === "floorboard");
    draw({
      kind: "box",
      x: 4.5,
      y: 0.028,
      z: 7.3,
      w: 1,
      h: 0.018,
      d: 0.58,
      color: board.repaired ? "#b69c76" : "#48382a",
      material: "wood",
    });
    draw({
      kind: "box",
      x: 4.5,
      y: board.repaired ? 0.045 : 0.085,
      z: 7.3,
      w: 0.94,
      h: 0.04,
      d: 0.49,
      color: board.repaired ? "#c9ac82" : "#8e6d4a",
      material: "wood",
      angle: board.repaired ? 0 : 0.12,
    });
    if (board.repaired)
      for (const x of [4.12, 4.88])
        for (const z of [7.12, 7.48])
          draw({
            kind: "cylinder",
            x,
            y: 0.07,
            z,
            w: 0.025,
            h: 0.01,
            d: 0.025,
            color: "#6b7169",
            material: "metal",
          });
    // A discreet held hammer in camera space remains visible as you look up/down.
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(
      uniforms.uViewProjection,
      false,
      perspective(canvas.width / canvas.height),
    );
    draw({
      kind: "cylinder",
      x: 0.26,
      y: -0.27,
      z: -0.54,
      w: 0.1,
      h: 0.1,
      d: 0.12,
      color: "#c79f79",
      material: "plain",
    });
    draw({
      kind: "box",
      x: 0.26,
      y: -0.36,
      z: -0.54,
      w: 0.14,
      h: 0.13,
      d: 0.14,
      color: "#6b8475",
      material: "fabric",
    });
    draw({
      kind: "box",
      x: 0.26,
      y: -0.23,
      z: -0.58,
      w: 0.035,
      h: 0.33,
      d: 0.04,
      color: "#b69160",
      material: "wood",
      angle: 0.15,
    });
    draw({
      kind: "box",
      x: 0.26,
      y: -0.07,
      z: -0.58,
      w: 0.19,
      h: 0.065,
      d: 0.065,
      color: "#89918b",
      material: "metal",
    });
    const active = nearestRepair(state);
    reticle.classList.toggle("ready", Boolean(active));
    roomLabel.textContent =
      p.y < 5
        ? p.x < 7
          ? "WORKROOM"
          : "KITCHEN"
        : p.x < 7
          ? "LIVING ROOM"
          : "DINING ROOM";
    document.querySelector("#look-hint").hidden = mouseLocked;
    drawMap(mapContext, state);
  };
}

function drawMap(c, state) {
  const unit = 10,
    ox = 5,
    oy = 5;
  c.clearRect(0, 0, 150, 130);
  c.fillStyle = "#f5efe2e8";
  c.fillRect(0, 0, 150, 130);
  WORLD.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      if (cell === "1") {
        c.fillStyle = "#65766a";
        c.fillRect(ox + x * unit, oy + y * unit, unit, unit);
      }
    }),
  );
  for (const r of state.repairs) {
    c.fillStyle = r.repaired ? "#5a9c69" : "#bf7044";
    c.beginPath();
    c.arc(ox + r.x * unit, oy + r.y * unit, 3, 0, Math.PI * 2);
    c.fill();
  }
  const p = state.player;
  c.fillStyle = "#315e7a";
  c.beginPath();
  c.arc(ox + p.x * unit, oy + p.y * unit, 3, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#315e7a";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(ox + p.x * unit, oy + p.y * unit);
  c.lineTo(
    ox + (p.x + Math.cos(p.angle)) * unit,
    oy + (p.y + Math.sin(p.angle)) * unit,
  );
  c.stroke();
}
