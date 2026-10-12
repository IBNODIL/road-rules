import type { Paint, Prop, PropKind, SceneSpec } from "@/lib/types";
import { sceneRightOfWay } from "@/lib/content";

/* One animated 3D situation for every rule of the course.
   Coordinates are metres. A straight road runs along z with traffic heading north (−z) on the right lane (x > 0)
   and south (+z) on the left lane (x < 0). Heading 0 faces +z and π faces −z. */

type R = [number, number][];
const PI = Math.PI;

const RED = "#d4202a";
const BLUE = "#2f6fdc";
const AMBER = "#f2a516";
const GREEN = "#2e9e62";
const GREY = "#6b7d8f";
const WHITE = "#eef2f6";
const BROWN = "#a67c52";

const road = (o: Partial<SceneSpec> = {}): SceneSpec => ({ layout: "road", cars: [], ...o });
const lot = (o: Partial<SceneSpec> = {}): SceneSpec => ({ layout: "lot", cars: [], camera: [14, 18, 16], ...o });
const cross = (o: Partial<SceneSpec> = {}): SceneSpec => ({ cars: [], ...o });

/** Straight route along z. */
const run = (x: number, z0: number, z1: number): R => [
  [x, z0],
  [x, z1],
];

const mv = (kind: PropKind, color: string, route: R, o: Partial<Prop> = {}): Prop => ({
  kind,
  color,
  x: route[0][0],
  z: route[0][1],
  route,
  ...o,
});
const at = (kind: PropKind, x: number, z: number, rot = 0, o: Partial<Prop> = {}): Prop => ({ kind, x, z, rot, ...o });
const tag = (x: number, z: number, text: string, h = 1.2): Prop => ({ kind: "label", x, z, text, size: [0, h, 0] });
const dim = (x: number, z: number, x2: number, z2: number, text: string): Prop => ({ kind: "dim", x, z, to: [x2, z2], text });

/** Cars heading north (−z) or south (+z). */
const north = (x: number, z0: number, z1: number, color = BLUE, o: Partial<Prop> = {}) => mv("car", color, run(x, z0, z1), { speed: 5, ...o });
const south = (x: number, z0: number, z1: number, color = RED, o: Partial<Prop> = {}) => mv("car", color, run(x, z0, z1), { speed: 5, ...o });
const parked = (x: number, z: number, color = GREY, o: Partial<Prop> = {}) => at("car", x, z, PI, { color, ...o });

const solid = (x: number, z0: number, z1: number, w = 0.18, color?: string): Paint => ({ x, z: (z0 + z1) / 2, w, l: Math.abs(z1 - z0), color });
const band = (x: number, z0: number, z1: number, w: number, color: string): Paint => ({ x, z: (z0 + z1) / 2, w, l: Math.abs(z1 - z0), color });
const dashed = (x: number, z0: number, z1: number, color?: string): Paint[] => {
  const out: Paint[] = [];
  for (let z = z0; z < z1; z += 3.2) out.push({ x, z: z + 0.8, w: 0.16, l: 1.6, color });
  return out;
};
const zebra = (z: number, x0 = -4, x1 = 4): Paint[] => {
  const out: Paint[] = [];
  for (let x = x0 + 0.5; x < x1; x += 1) out.push({ x, z, w: 0.5, l: 3 });
  return out;
};
const arc = (r: number, a0: number, a1: number, n = 16): R =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * PI) / 180;
    return [r * Math.cos(a), -r * Math.sin(a)] as [number, number];
  });
const YEL = "#e8b800";

const follow: SceneSpec = road({
  camera: [24, 17, 30],
  focus: [0, 8],
  props: [
    mv("car", RED, run(2, 10, -8), { speed: 4 }),
    mv("car", BLUE, run(2, 26, 8), { speed: 4 }),
    dim(4.6, 8, 4.6, -8, "safe gap"),
    tag(2, 18, "Same speed, same gap", 2.4),
  ],
});
const walkers: SceneSpec = { pedestrian: "S", cars: [{ id: "A", label: "A", from: "S", color: RED, delay: 6 }] };
const leftTurn: SceneSpec = {
  cars: [
    { id: "A", label: "A", from: "S", color: RED, turn: "left", order: 1 },
    { id: "B", label: "B", from: "N", color: BLUE, order: 0 },
  ],
};
const equalJunction: SceneSpec = {
  cars: [
    { id: "A", label: "A", from: "S", color: RED, order: 1 },
    { id: "B", label: "B", from: "E", color: BLUE, order: 0 },
  ],
};
const overtake = (o: Partial<Prop> = {}, text?: string): SceneSpec =>
  road({
    props: [
      mv("truck", GREY, run(2, 8, -40), { speed: 3 }),
      mv("car", RED, [[2, 30], [2, 17], [-2, 11], [-2, -14], [2, -20], [2, -40]], { speed: 7, signal: "left", ...o, text }),
    ],
  });
const policeStop = (extra: Prop[] = []): SceneSpec =>
  road({
    props: [at("police", 5.4, 0, PI), at("officer", 3.6, -2.5, -PI / 2, { gesture: "out" }), mv("car", BLUE, run(2.2, 26, -1), { speed: 5 }), ...extra],
  });
const cabin = (seats: Prop["seats"], text?: string): SceneSpec =>
  lot({ camera: [0, 15, 9], props: [at("cabin", 0, 0, 0, { seats }), mv("person", AMBER, [[10, 2.6], [3.2, 2.6]], { speed: 1.6 }), ...(text ? [tag(0, 0, text, 3.4)] : [])] });
const wide = (w: number, o: Partial<SceneSpec> = {}) => road({ roadWidth: w, ...o });

export const ruleScenes: Record<string, SceneSpec> = {
  /* ---------- 2. General provisions ---------- */
  "2": road({ props: [north(2, 26, -30), south(-2, -30, 26, RED), tag(5.3, 0, "Keep right", 1.4)], paint: dashed(0, -40, 40) }),
  "3": cross({
    cars: [
      { id: "A", label: "A", from: "S", color: RED, hold: true },
      { id: "B", label: "B", from: "W", color: BLUE, order: 0 },
    ],
    props: [at("officer", 0, 0, 0, { gesture: "out" })],
  }),
  "4": road({
    props: [
      at("truck", 3, 8, PI, { color: GREY, signal: "hazard", size: [2.5, 2.6, 5.5] }),
      at("box", 2, -1, 0.4, { size: [1.4, 1.2, 1.4], color: BROWN }),
      at("triangle", 2, -8),
      mv("person", AMBER, [[3.4, 3], [2.2, -6]], { speed: 1.6, delay: 1 }),
      tag(2, -1, "Remove it, warn, call the police", 2.4),
    ],
  }),
  "d-yield": cross({
    signs: [{ type: "yield", side: "W" }],
    cars: [
      { id: "A", label: "A", from: "W", color: RED, order: 1 },
      { id: "B", label: "B", from: "N", color: BLUE, order: 0 },
    ],
  }),
  "d-main": cross({
    cars: [
      { id: "A", label: "A", from: "E", color: RED, order: 1 },
      { id: "B", label: "B", from: "S", color: BLUE, order: 0 },
    ],
    signs: [
      { type: "priority", side: "S" },
      { type: "priority", side: "N" },
    ],
  }),
  "d-stop": road({
    props: [
      mv("car", BLUE, [[2, 20], [3.3, 6]], { speed: 3, text: "stop: up to 10 min" }),
      parked(3.3, -8, AMBER, { text: "parking: over 10 min" }),
      mv("person", AMBER, [[4.6, 6.4], [6, 6.4]], { speed: 1.2, delay: 7 }),
    ],
  }),
  "d-vis": road({ env: "fog", props: [mv("car", BLUE, run(2, 22, -30), { speed: 3, beams: true }), tag(2, -3, "Visibility under 300 m", 2.6)] }),

  /* ---------- 3. Drivers ---------- */
  "7": policeStop([tag(5.4, 0, "Documents, please", 2.8)]),
  "8": lot({
    props: [ mv("person", AMBER, [[-14, 5], [14, 5]], { speed: 2 }),
      at("motorbike", -9, 0, PI, { text: "A" }),
      at("car", -4.5, 0, PI, { color: BLUE, text: "B" }),
      at("truck", 1.5, 0, PI, { color: GREY, text: "C" }),
      at("bus", 8, 0, PI, { color: AMBER, text: "D" }),
    ],
  }),
  "9": cabin(["belt", "belt", "empty", "belt", "empty"], "Belts before moving off"),
  "11": cabin(["belt", "belt", "belt", "empty", "empty"], "Passengers seated, doors closed"),
  "12": road({
    props: [
      mv("car", RED, [[2, 28], [0.2, 18], [3.4, 9], [0, 0], [3.4, -9], [1, -20], [3, -35]], { speed: 5, text: "Never after alcohol" }),
      at("police", 5.6, -14, PI),
    ],
  }),
  "12p": road({ props: [north(2, 24, -30, BLUE, { text: "Phone: hands free only" })] }),
  "13": road({
    props: [
      at("car", 1.5, 0, 2.2, { color: RED, signal: "hazard" }),
      at("car", -1.6, -3.2, 0.9, { color: BLUE, signal: "hazard" }),
      at("triangle", 2.2, 7),
      mv("ambulance", WHITE, run(2, 44, 8), { speed: 9, delay: 2 }),
      mv("person", AMBER, [[5, 4], [2.6, 1.2]], { speed: 1.5, delay: 1 }),
    ],
  }),

  /* ---------- 4. Pedestrians ---------- */
  "15": road({ props: [south(-2, -26, 26, RED, { speed: 4 }), mv("person", AMBER, run(-3.4, 14, -14), { speed: 1.5 }), tag(-3.4, 4, "Face the traffic", 2.2)] }),
  "16": road({
    props: [
      mv("person", AMBER, run(1.2, 14, -14), { speed: 1.4 }),
      mv("person", "#2f6fdc", run(2.0, 14, -14), { speed: 1.4 }),
      mv("person", "#30a46c", run(2.8, 14, -14), { speed: 1.4 }),
      mv("person", "#e5484d", run(3.6, 14, -14), { speed: 1.4 }),
      mv("officer", RED, run(4.4, 16, -12), { speed: 1.4 }),
      mv("officer", RED, run(4.4, 12, -16), { speed: 1.4 }),
      tag(2.4, 0, "At most four abreast", 2.4),
    ],
  }),
  "17": walkers,
  "18": cross({ pedestrian: "S", lights: [{ side: "S", state: "red" }], cars: [{ id: "A", label: "A", from: "S", color: RED, hold: true }] }),
  "19": road({
    paint: zebra(7, 0, 4.5),
    props: [at("bus", 2.4, 0, PI, { color: AMBER }), mv("person", AMBER, [[5.5, 8], [-5.5, 8]], { speed: 1.4 }), tag(0, 8, "Pass behind the bus", 1.6)],
  }),
  "20": wide(10, {
    props: [at("box", 0, 0, 0, { size: [1.6, 0.25, 7], color: "#6a6e74" }), mv("person", AMBER, [[6, 0], [0, 0]], { speed: 1.4 }), north(3.7, 24, -30), south(-3.7, -30, 24, RED)],
  }),
  "21": road({ props: [mv("person", AMBER, [[2.4, 3], [6, 3]], { speed: 1.5 }), mv("ambulance", WHITE, run(2, 40, -24), { speed: 9, delay: 1 })] }),
  "22": road({
    props: [
      mv("bus", AMBER, [[2.4, 24], [2.4, 2]], { speed: 5 }),
      mv("person", AMBER, [[5.8, -1], [3.7, 3]], { speed: 1.2, delay: 5 }),
      at("box", 5.4, 1.5, 0, { size: [1.2, 1.4, 3], color: "#6a6e74" }),
    ],
  }),

  /* ---------- 5. Passengers ---------- */
  "23": road({
    props: [at("bus", 2.4, 0, PI, { color: AMBER }), mv("person", AMBER, [[3.9, 1.5], [5.8, 2.5]], { speed: 1.2, delay: 1 }), mv("person", "#2f6fdc", [[3.9, -1], [5.8, -2]], { speed: 1.2, delay: 1.8 })],
  }),
  "24": cabin(["belt", "belt", "belt", "nobelt", "empty"], "Do not lean out or open doors"),

  /* ---------- 6. Special vehicles ---------- */
  "25": cross({
    lights: [
      { side: "S", state: "red" },
      { side: "E", state: "red" },
    ],
    cars: [
      { id: "A", label: "A", from: "S", color: RED, hold: true },
      { id: "B", label: "B", from: "E", color: BLUE, hold: true },
    ],
    props: [mv("ambulance", WHITE, run(1.5, 26, -26), { speed: 9, delay: 3 })],
  }),
  "26": road({ props: [mv("car", BLUE, [[2, 14], [2, 4], [4.2, -2]], { speed: 3, signal: "right" }), mv("ambulance", WHITE, run(2, 34, -34), { speed: 9, delay: 2.5 })] }),
  "27": road({ props: [at("ambulance", 3.4, 0, PI), mv("car", BLUE, run(1.2, 26, -26), { speed: 2.4 }), tag(1.2, 8, "Slow down", 2.4)] }),
  "28": road({ props: [at("truck", 2, 0, PI, { color: GREY, signal: "hazard" }), tag(2, 0, "Give way to cars on duty", 3.4), mv("car", BLUE, [[2, 24], [2, 9], [-1, 3], [-1, -6], [2, -12], [2, -30]], { speed: 3 })] }),

  /* ---------- 7. Signals ---------- */
  "31": cross({ cars: [{ id: "A", label: "A", from: "S", color: RED, hold: true }], lights: [{ side: "S", state: "yellow" }] }),
  "31r": cross({
    cars: [
      { id: "A", label: "A", from: "S", color: RED, hold: true },
      { id: "B", label: "B", from: "E", color: BLUE, order: 0 },
    ],
    lights: [
      { side: "S", state: "red" },
      { side: "E", state: "green" },
    ],
  }),
  "32": cross({
    cars: [{ id: "A", label: "A", from: "S", color: RED, turn: "left", order: 0 }],
    lights: [{ side: "S", state: "green" }],
    props: [tag(5, 9, "Green left arrow", 3.8)],
  }),
  "34": cross({
    lights: [{ side: "S", state: "red" }],
    cars: [{ id: "A", label: "A", from: "S", color: RED, hold: true }],
    props: [mv("cyclist", AMBER, [[-5, 5], [5, 5]], { speed: 3, delay: 3 }), tag(-5, 5, "Bicycle light", 2)],
  }),
  "35": wide(12, {
    paint: [...dashed(-2, -40, 40), ...dashed(2, -40, 40)],
    props: [mv("car", BLUE, run(4, 26, -30), { speed: 5 }), tag(0, 0, "Red X: closed", 2), tag(-4, 0, "Green arrow: open", 2)],
  }),
  "37": road({
    layout: "railway",
    props: [
      at("barrier", 4.2, 3.9, PI, { state: "down" }),
      at("barrier", -4.2, -3.9, 0, { state: "down" }),
      at("lamp", 5.2, 5.5, 0, { state: "red" }),
      parked(2, 10, BLUE),
      mv("train", GREY, [[-44, 0], [44, 0]], { speed: 12, delay: 2 }),
      tag(0, 6, "Flashing red: stop", 3),
    ],
  }),
  "38": cross({
    cars: [
      { id: "A", label: "A", from: "S", color: RED, hold: true },
      { id: "B", label: "B", from: "N", color: AMBER, hold: true },
      { id: "C", label: "C", from: "W", color: BLUE, order: 0 },
    ],
    props: [at("officer", 0, 0, 0, { gesture: "out" })],
  }),
  "39": policeStop([tag(3.6, -2.5, "Stop here", 2.6)]),
  "41": cross({ cars: [{ id: "A", label: "A", from: "S", color: RED, hold: true }], lights: [{ side: "S", state: "red" }] }),
  "42": cross({ cars: [{ id: "A", label: "A", from: "S", color: RED, order: 0 }], lights: [{ side: "S", state: "yellow" }], props: [tag(1.5, 12, "Too close to brake safely", 2.6)] }),
  "43": cross({
    cars: [{ id: "A", label: "A", from: "S", color: RED, order: 0 }],
    lights: [{ side: "S", state: "red" }],
    props: [at("officer", 3.6, 6, -PI / 2, { gesture: "out" }), tag(3.6, 6, "Officer beats the light", 3.2)],
  }),

  /* ---------- 8. Warning signals ---------- */
  "44": road({
    props: [mv("truck", GREY, run(2, 6, -40), { speed: 3 }), mv("car", RED, [[2, 30], [2, 16], [-2, 10], [-2, -14], [2, -20], [2, -40]], { speed: 7, beams: true, text: "Flashes headlights" })],
  }),
  "45": cross({ cars: [{ id: "A", label: "A", from: "S", color: RED, turn: "left", order: 0 }], props: [tag(1.5, 9, "Signal first", 2.8)] }),
  "46": road({ props: [mv("car", RED, [[2, 18], [2, 6], [3.8, -2]], { speed: 3, signal: "right" }), north(-1.2, 30, -30, BLUE, { speed: 6 }), tag(2, 14, "A signal gives no priority", 2.6)] }),
  "47": road({
    props: [mv("car", BLUE, [[2, 8], [2, -2], [-1.2, -8]], { speed: 2.4, signal: "left" }), mv("car", RED, run(-2, 34, -34), { speed: 8, delay: 1 }), tag(2, 14, "Check behind first", 2.6)],
  }),
  "48": overtake({}, "Horn: outside towns, to warn"),
  "50": road({ props: [at("car", 3.2, 0, PI, { color: RED, signal: "hazard" }), at("triangle", 3.2, 6), north(0.4, 26, -30, BLUE, { speed: 3 }), tag(3.2, 0, "Hazard lights", 2.6)] }),
  "51": road({
    camera: [28, 26, 40],
    focus: [3, 14],
    props: [at("car", 3.2, 0, PI, { color: RED, signal: "hazard" }), at("triangle", 3.2, 33), dim(3.2, 2.2, 3.2, 32.4, "at least 30 m"), north(0.4, 60, -20, BLUE, { speed: 6 })],
  }),

  /* ---------- 9. Manoeuvres ---------- */
  "53": road({
    props: [
      mv("car", RED, [[3.3, 0], [2.2, -6], [2.2, -28]], { speed: 3, delay: 6.5, signal: "left" }),
      mv("cyclist", AMBER, run(1.2, 22, -26), { speed: 4 }),
      tag(3.3, 0, "Signal, check, then pull out", 2.4),
    ],
  }),
  "54": road({
    props: [
      mv("bus", AMBER, run(2, 28, -36), { speed: 6 }),
      mv("car", BLUE, [[8.5, 1.5], [5.2, 1.5], [2.4, -2], [2.4, -24]], { speed: 3, delay: 6 }),
      mv("person", AMBER, [[7, 4.5], [7, -1.5]], { speed: 1.4, delay: 1 }),
      at("building", 11, 2, 0, { size: [6, 4, 8] }),
    ],
  }),
  "55": road({
    props: [mv("car", BLUE, [[-2, 16], [-2, 6], [1.8, -4], [2, -26]], { speed: 3, signal: "right", delay: 2 }), mv("car", RED, run(2, 26, -30), { speed: 5 }), tag(0, 6, "Right side goes first", 2.4)],
  }),
  "56": cross({ cars: [{ id: "A", label: "A", from: "S", color: RED, turn: "left", order: 0 }], props: [tag(-1.5, 12, "Left lane first", 2.4)] }),
  "57": cross({ cars: [{ id: "A", label: "A", from: "S", color: RED, turn: "right", order: 0 }], props: [tag(2.5, 11, "Stay near the right edge", 2.4)] }),
  "59": road({
    props: [mv("car", BLUE, [[2, 14], [2, 3], [-3.4, -2], [-9, -2]], { speed: 3, signal: "left", delay: 4.5 }), south(-2, -30, 30, RED, { speed: 6 })],
    paint: [band(-6, -4, 0, 4, "#3b3f45")],
  }),
  "60": equalJunction,
  "62": road({ paint: zebra(0, -4, 4), props: [north(2, 24, -30, BLUE, { speed: 4 }), tag(0, 3, "No U turn here", 2.2)] }),
  "63": road({
    props: [mv("car", RED, [[8, 2], [4, 2], [2, 6]], { speed: 1.6, reverse: true, signal: "hazard" }), at("officer", 4.8, 5, PI, { gesture: "out" }), tag(4.8, 5, "Use a helper", 3.2), at("building", 11, 3, 0, { size: [6, 4, 8] })],
  }),

  /* ---------- 10. Position ---------- */
  "64": road({ paint: [solid(0, -44, 44)], props: [north(2, 28, -30), south(-2, -30, 28, RED), tag(0, 6, "Do not cross", 2)] }),
  "65": wide(14, { paint: [solid(-0.2, -44, 44), solid(0.2, -44, 44), ...dashed(-3.5, -44, 44), ...dashed(3.5, -44, 44)], props: [north(5.2, 26, -30), north(1.8, 30, -34, GREEN, { speed: 6 }), south(-1.8, -30, 26, RED), south(-5.2, -34, 26, AMBER)] }),
  "66": wide(12, {
    paint: [...dashed(-2, -44, 44), ...dashed(2, -44, 44)],
    props: [mv("car", BLUE, [[4, 26], [4, 14], [0, 8], [0, -8], [4, -14], [4, -30]], { speed: 6 }), south(-4, -30, 26, RED, { speed: 4 }), tag(0, 0, "Shared middle lane", 2)],
  }),
  "67": wide(12, { paint: [...dashed(-2, -44, 44), ...dashed(2, -44, 44)], props: [north(4, 28, -30), tag(0, 4, "Keep right", 2)] }),
  "68": wide(12, { paint: [...dashed(-2, -44, 44), ...dashed(2, -44, 44)], props: [mv("tractor", GREEN, run(4, 22, -30), { speed: 2.4 }), north(0, 30, -34, RED, { speed: 8 })] }),
  "69": wide(12, {
    paint: [solid(-3.7, -44, 44, 0.12, "#9aa0a6"), solid(-2.9, -44, 44, 0.12, "#9aa0a6")],
    props: [mv("tram", RED, run(-3.3, 44, -44), { speed: 8, delay: 2.5 }), mv("car", BLUE, [[-3.3, 16], [-3.3, 6], [-0.5, 0], [-0.5, -30]], { speed: 3 })],
  }),
  "70": wide(10, { paint: [...dashed(1, -44, 44)], props: [mv("car", BLUE, [[3, 22], [3, 10], [-1, 4], [-1, -26]], { speed: 5 }), tag(1, 12, "Dashed: cross once to change lane", 2.4)] }),
  "71": cross({ cars: [{ id: "A", label: "A", from: "S", color: RED, turn: "right", order: 0 }], props: [tag(7, -1.5, "Finish in the extreme right lane", 2.6)] }),
  "72": road({ props: [north(2, 26, -30), at("box", 6, 4, 0, { size: [0.5, 0.6, 0.5], color: "#d4202a" }), mv("person", AMBER, run(6.2, 10, -12), { speed: 1.4 }), tag(6.2, 0, "Sidewalk: pedestrians only", 2.2)] }),
  "73": follow,
  "75": road({
    roadWidth: 7,
    props: [
      at("truck", 2, 0, PI, { color: GREY }),
      mv("car", BLUE, [[2, 12], [2, 8], [-0.6, 3], [-0.6, -5], [2, -10], [2, -28]], { speed: 3.5, delay: 7 }),
      south(-1.8, -30, 28, RED, { speed: 5 }),
    ],
  }),

  /* ---------- 11. Speed ---------- */
  "77": road({ env: "fog", props: [mv("car", GREEN, run(2, 26, -30), { speed: 2.6, beams: true, text: "Slower in bad weather" })] }),
  "78": cross({ arms: ["N", "S"], signs: [{ type: "crossing", side: "S" }], cars: [{ id: "A", label: "A", from: "S", color: BLUE, free: true, distance: 10 }], props: [tag(1.5, 6, "School zone: 30", 3)] }),
  "78b": road({ props: [north(2, 26, -30, BLUE, { speed: 4.5, text: "up to 60 km/h" }), at("building", -10, -4, 0, { size: [7, 9, 8] })] }),
  "79": road({ props: [north(2, 30, -34, BLUE, { speed: 9, text: "car 100" }), mv("truck", GREY, run(2, 42, -34), { speed: 6, text: "truck + trailer 70" })] }),
  "80": road({ props: [mv("car", RED, run(2, 24, -34), { speed: 3 }), mv("car", BLUE, run(2, 30.4, -27.6), { speed: 3, towLength: 2.8 }), tag(2, 12, "Towing: 50 km/h", 2.6)] }),
  "81": road({ props: [north(2, 20, -34, RED, { speed: 1.2, text: "Needless crawling" }), north(2, 32, -34, BLUE, { speed: 3.4 })] }),

  /* ---------- 12. Overtaking ---------- */
  "82": overtake({ signal: "left" }),
  "83": road({ props: [mv("car", BLUE, [[2, 12], [2, 4], [-3.2, -1.5], [-9, -1.5]], { speed: 3, signal: "left" }), mv("car", RED, run(3.8, 32, -30), { speed: 7, delay: 1.2 }), tag(3.8, 10, "Pass on the right", 2.4)], paint: [band(-6, -4, 1, 4, "#3b3f45")] }),
  "84": road({ props: [mv("car", BLUE, [[2, 8], [2, -40]], { speed: 3.5, text: "Do not speed up" }), mv("car", RED, [[2, 30], [2, 17], [-2, 11], [-2, -12], [2, -18], [2, -40]], { speed: 6.5, signal: "left" })] }),
  "85": overtake({ signal: "right" }, "Return to your lane"),
  "86": road({
    paint: zebra(0, -4, 4),
    props: [mv("car", BLUE, run(2, 22, 7), { speed: 4 }), mv("car", RED, run(2, 32, 14), { speed: 5, text: "No overtaking" }), mv("person", AMBER, [[5.5, 0], [-5.5, 0]], { speed: 1.3, delay: 3.6 })],
  }),
  "87": road({
    props: [mv("tractor", GREEN, [[2, 14], [2, 6], [4.6, 0], [4.6, -16]], { speed: 2.6 }), north(1.2, 28, -34, BLUE, { delay: 6, speed: 5 }), north(1.2, 36, -26, RED, { delay: 6.6, speed: 5 })],
  }),

  /* ---------- 13. Stopping and parking ---------- */
  "88": road({ props: [parked(3.4, -8), parked(3.4, -14, AMBER), mv("car", BLUE, [[2, 22], [3.4, 6], [3.4, 2]], { speed: 3 }), tag(5.6, 0, "Right side", 1.6)] }),
  "89": road({ props: [ mv("car", BLUE, [[2, 32], [3.4, 15]], { speed: 3 }),parked(3.4, -9, GREY), parked(3.4, -3, RED), parked(3.4, 3, BLUE), parked(3.4, 9, AMBER), tag(5.6, 0, "One row, parallel", 1.6)] }),
  "91": road({ layout: "railway", props: [at("barrier", 4.2, 3.9, PI, { state: "up" }), at("barrier", -4.2, -3.9, 0, { state: "up" }), north(2, 26, -30, BLUE, { speed: 5 }), tag(0, 0, "Never stop on the crossing", 2.6)] }),
  "91b": cross({
    pedestrian: "S",
    cars: [{ id: "A", label: "A", from: "S", color: AMBER, hold: true }],
    props: [dim(3.2, 6.2, 3.2, 16.2, "10 m"), tag(3.2, 3, "No stopping", 1.6)],
    paint: [band(2.2, 6.4, 16.4, 1.4, "#7a2328")],
  }),
  "91c": cross({
    arms: ["S"],
    armLength: 36,
    camera: [26, 28, 40],
    focus: [0, 14],
    props: [ mv("car", BLUE, run(1.5, 34, 3), { speed: 4 }),dim(4.2, 3.2, 4.2, 33.2, "30 m"), parked(8.5, 38, GREY)],
    paint: [band(2.4, 3.2, 33.2, 1.6, "#7a2328")],
    cars: [],
  }),
  "91d": road({
    camera: [28, 26, 28],
    props: [ mv("car", RED, run(-2, -30, 30), { speed: 5 }),at("bus", 2.6, 0, PI, { color: AMBER }), dim(5.4, 5, 5.4, 20, "15 m"), dim(5.4, -5, 5.4, -20, "15 m"), parked(3.4, 26, BLUE)],
    paint: [band(4.1, 5, 20, 1.2, "#7a2328"), band(4.1, -20, -5, 1.2, "#7a2328")],
  }),
  "91e": road({ paint: [solid(-0.4, -44, 44)], props: [ mv("car", RED, run(-2, -30, 30), { speed: 5 }),parked(3, 0, RED), dim(3, -2.8, -0.4, -2.8, "gap under 3 m"), tag(3, 0, "No stopping here", 2.6)] }),
  "92": road({
    layout: "railway",
    camera: [34, 34, 42],
    props: [ mv("train", GREY, [[-44, 0], [44, 0]], { speed: 12, delay: 2 }),at("barrier", 4.2, 3.9, PI, { state: "up" }), at("barrier", -4.2, -3.9, 0, { state: "up" }), dim(5.8, 5, 5.8, 32, "50 m (not to scale)"), parked(3.4, -26, BLUE)],
    paint: [band(4.3, 5, 32, 1.2, "#7a2328"), band(4.3, -32, -5, 1.2, "#7a2328")],
  }),
  "93": road({
    paint: [band(4.3, -10, 10, 1.2, "#7a2328")],
    props: [mv("car", RED, [[3.4, 0], [3.4, -22]], { speed: 1.4, signal: "hazard", text: "Move away from the zone" }), at("triangle", 3.4, 6)],
  }),
  "94": road({
    props: [parked(3.2, 0, RED), at("box", 1.9, 0.6, 0.7, { size: [0.1, 1, 1.3], color: "#a8141c" }), mv("cyclist", AMBER, run(1.0, 24, -24), { speed: 4, delay: 1 }), tag(3.2, 0, "Look before opening the door", 2.8)],
  }),
  "95": lot({
    props: [at("car", 0, 0, PI, { color: BLUE }), mv("person", AMBER, [[1.6, 0], [6, 4]], { speed: 1.6, delay: 1 }), tag(0, 0, "Handbrake, engine off, lock", 2.8)],
  }),

  /* ---------- 14. Junctions ---------- */
  "96": cross({ pedestrian: "E", cars: [{ id: "A", label: "A", from: "S", color: RED, turn: "right", delay: 6 }] }),
  "97": cross({
    lights: [{ side: "N", state: "green" }],
    cars: [{ id: "A", label: "A", from: "N", color: RED, hold: true }],
    props: [parked(-1.5, 8, GREY, { rot: 0 }), parked(-1.5, 13, BLUE, { rot: 0 }), parked(-1.5, 18, AMBER, { rot: 0 }), tag(-1.5, -8, "Do not block the junction", 2.6)],
  }),
  "98": road({
    layout: "round",
    camera: [22, 24, 26],
    props: [mv("car", RED, [...arc(7.6, 150, 300, 20)], { speed: 6 }), mv("car", BLUE, [[1.6, 26], [1.6, 12], [1.2, 8], ...arc(7.6, 280, 340, 8)], { speed: 4, delay: 3.2 }), tag(0, 0, "Circle first", 2)],
  }),
  "99": cross({ ...leftTurn, lights: [{ side: "S", state: "green" }, { side: "N", state: "green" }] }),
  "100": cross({
    lights: [{ side: "S", state: "red" }],
    cars: [
      { id: "A", label: "A", from: "S", color: RED, turn: "right", delay: 3 },
      { id: "B", label: "B", from: "W", color: BLUE, order: 0 },
    ],
    props: [tag(5, 9, "Green arrow, red main light", 3.8)],
  }),
  "101": cross({
    lights: [{ side: "S", state: "green" }, { side: "W", state: "green" }],
    cars: [{ id: "A", label: "A", from: "W", color: RED, order: 0, delay: 5 }],
    props: [mv("tram", RED, run(1.5, 40, -40), { speed: 7, delay: 2 })],
  }),
  "102": cross({ lights: [{ side: "S", state: "green" }], cars: [{ id: "A", label: "A", from: "S", color: RED, order: 0 }], props: [tag(1.5, 11, "Entered on green: keep going", 2.8)] }),
  "103": { ...walkers, lights: [{ side: "S", state: "green" }] },

  /* ---------- 15. Unregulated junctions ---------- */
  "104": cross({
    cars: [
      { id: "A", label: "A", from: "E", color: RED, order: 1 },
      { id: "B", label: "B", from: "S", color: BLUE, order: 0 },
    ],
    signs: [
      { type: "priority", side: "S" },
      { type: "priority", side: "N" },
    ],
  }),
  "105": sceneRightOfWay,
  "106": cross({
    signs: [
      { type: "priority", side: "S" },
      { type: "priority", side: "E" },
    ],
    cars: [
      { id: "A", label: "A", from: "S", color: RED, turn: "right", order: 1 },
      { id: "B", label: "B", from: "E", color: BLUE, order: 0 },
    ],
  }),
  "107": leftTurn,
  "108": cross({
    env: "fog",
    cars: [
      { id: "A", label: "A", from: "S", color: RED, order: 1 },
      { id: "B", label: "B", from: "E", color: BLUE, order: 0 },
    ],
    props: [tag(0, 12, "Unknown surface: secondary road", 3)],
  }),

  /* ---------- 16. Crossings ---------- */
  "109": walkers,
  "110": wide(10, {
    paint: zebra(0, 0, 5),
    props: [mv("car", BLUE, run(3.75, 22, 7), { speed: 4 }), mv("car", RED, run(1.25, 30, 7), { speed: 5 }), mv("person", AMBER, [[6, 0], [-6, 0]], { speed: 1.3, delay: 3 })],
  }),
  "111": { ...walkers, lights: [{ side: "S", state: "green" }] },
  "112": road({
    paint: zebra(0, -4, 4),
    props: [parked(2, -8, GREY, { rot: PI }), parked(2, -13, BLUE), mv("car", RED, run(2, 22, 6.4), { speed: 4 }), tag(2, 10, "Do not enter the crossing", 2.4)],
  }),
  "113": road({ paint: zebra(0, -4, 4), props: [mv("car", BLUE, run(2, 22, 6), { speed: 4 }), mv("blind", "#fff", [[5.8, 0], [-5.8, 0]], { speed: 1.1 }), tag(2, 10, "White cane: stop", 2.4)] }),
  "114": road({
    props: [at("tram", -1.4, 0, PI), mv("car", BLUE, run(2.8, 24, 9), { speed: 4 }), mv("person", AMBER, [[5.8, 0.5], [0.4, 0.5]], { speed: 1.2, delay: 1 }), mv("person", "#2f6fdc", [[5.8, -2], [0.4, -2]], { speed: 1.2, delay: 2 })],
  }),
  "115": road({
    props: [at("bus", 2.6, 0, PI, { color: AMBER, signal: "hazard" }), mv("child", "#e5484d", [[5.2, 0], [-4.4, 4]], { speed: 1.6, delay: 1.5 }), mv("car", BLUE, run(0.2, 28, 8), { speed: 4 })],
  }),
  "1152": road({
    paint: [band(4, -44, 44, 2, "#8a2f33")],
    props: [mv("bus", AMBER, run(4, 28, -44), { speed: 5 }), north(0.2, 26, -30, BLUE), tag(4, 6, "Bus lane", 3)],
  }),

  /* ---------- 17. Railway crossings ---------- */
  "116": road({ layout: "railway", props: [at("barrier", 4.2, 3.9, PI, { state: "up" }), at("barrier", -4.2, -3.9, 0, { state: "up" }), north(2, 26, -30, BLUE, { speed: 4 }), tag(0, 0, "Cross only here", 2.2)] }),
  "117": road({
    layout: "railway",
    props: [mv("train", GREY, [[-44, 0], [44, 0]], { speed: 10, delay: 1 }), mv("car", BLUE, run(2, 12, -30), { speed: 3, delay: 9 }), tag(2, 14, "Look, listen, then go", 2.4)],
  }),
  "118": road({
    layout: "railway",
    props: [at("barrier", 4.2, 3.9, PI, { state: "down" }), at("barrier", -4.2, -3.9, 0, { state: "down" }), at("lamp", 5.2, 5.5, 0, { state: "red" }), parked(2, 11, RED), mv("train", GREY, [[-44, 0], [44, 0]], { speed: 11, delay: 3 }), tag(2, 14, "Barrier closing: no entry", 2.6)],
  }),
  "119": road({
    layout: "railway",
    props: [ mv("train", GREY, [[-44, 0], [44, 0]], { speed: 12, delay: 4 }),at("barrier", 4.2, 3.9, PI, { state: "down" }), at("barrier", -4.2, -3.9, 0, { state: "down" }), parked(2, 10.3, BLUE), dim(2, 3.9, 2, 8.2, "at least 5 m")],
  }),
  "120": road({
    layout: "railway",
    props: [
      at("car", 2, 0, PI, { color: RED, signal: "hazard" }),
      mv("person", AMBER, [[3.4, 0.5], [6, 6]], { speed: 1.6, delay: 0.5 }),
      mv("person", "#2f6fdc", [[3.4, -0.5], [6, -6]], { speed: 1.6, delay: 0.8 }),
      mv("train", GREY, [[-70, 0], [44, 0]], { speed: 11, delay: 2 }),
      tag(2, 0, "People out first", 2.8),
    ],
  }),

  /* ---------- 18. Motorways ---------- */
  "121": wide(16, {
    paint: [solid(-0.2, -44, 44), solid(0.2, -44, 44), ...dashed(-4, -44, 44), ...dashed(4, -44, 44), solid(7.4, -44, 44)],
    props: [north(2, 30, -34, BLUE, { speed: 10 }), north(6, 36, -34, GREY, { speed: 7 }), south(-2, -34, 30, RED, { speed: 10 }), tag(9.5, 0, "No reversing, no stopping", 2)],
  }),
  "122": wide(16, {
    paint: [solid(-0.2, -44, 44), solid(0.2, -44, 44), ...dashed(-4, -44, 44), ...dashed(4, -44, 44), solid(7.4, -44, 44)],
    props: [mv("car", RED, [[6, 20], [9.5, 6], [9.5, 2]], { speed: 4, signal: "hazard" }), at("triangle", 9.5, 12), north(2, 34, -34, BLUE, { speed: 10 })],
  }),

  /* ---------- 19. Residential zones ---------- */
  "123": road({
    roadWidth: 6,
    props: [mv("child", "#e5484d", [[-1, 4], [1.2, -4], [-1.4, -8]], { speed: 1.4, loop: true }), mv("child", "#2f6fdc", [[1, -6], [-1.2, 2], [1.2, 8]], { speed: 1.3, loop: true }), north(1.6, 24, -26, BLUE, { speed: 1.8 }), tag(0, 0, "People first, 20 km/h", 2.4)],
  }),
  "124": road({ roadWidth: 6, props: [ mv("person", AMBER, [[3.4, 1.6], [5.8, 5]], { speed: 1.4, delay: 1 }),parked(2.2, 0, BLUE), tag(2.2, 0, "Engine off", 2.8)] }),
  "125": road({ roadWidth: 6, props: [mv("car", BLUE, [[1.6, 22], [1.6, 8], [0, 1], [-0.6, -8], [1.4, -22]], { speed: 2 }), at("box", 2.6, -1.5, 0, { size: [1.6, 0.3, 2.4], color: "#2c5a3c" }), at("tree", 3.6, 4)] }),
  "126": road({
    roadWidth: 6,
    props: [mv("car", BLUE, [[8, 1.5], [5, 1.5], [1.6, -2], [1.6, -24]], { speed: 3, delay: 5 }), north(1.6, 24, -26, RED, { speed: 4 }), at("building", 11, 2, 0, { size: [6, 4, 8] })],
  }),

  /* ---------- 20. Slopes ---------- */
  "128": road({
    tilt: -0.16,
    props: [parked(3, 0, GREY), mv("car", RED, run(-1.4, -26, 26), { speed: 3 }), mv("car", BLUE, [[1.4, 26], [1.4, 8]], { speed: 3 }), tag(0, 6, "Going down gives way", 2.4)],
  }),
  "129": road({
    tilt: -0.2,
    paint: [band(8, -44, 44, 3, "#8b7b5a")],
    props: [mv("car", RED, [[1, -26], [1, -6], [5, 4], [8, 16], [8, 30]], { speed: 6, signal: "hazard" }), tag(8, 6, "Escape lane", 2.4)],
  }),

  /* ---------- 21. Route vehicles ---------- */
  "131": road({
    layout: "railway",
    props: [mv("tram", RED, [[-46, 0], [46, 0]], { speed: 8, delay: 1 }), parked(2, 9, BLUE), tag(0, 6, "Tram first", 3)],
  }),
  "132": wide(10, { paint: [band(4, -44, 44, 2, "#8a2f33")], props: [mv("bus", AMBER, run(4, 28, -44), { speed: 5 }), north(0.5, 30, -34, BLUE), tag(4, 4, "Reserved lane", 3.2)] }),
  "133": road({ props: [mv("bus", AMBER, [[3, 0], [2.2, -5], [2, -30]], { speed: 3, delay: 3, signal: "left" }), mv("car", BLUE, run(2, 30, 10), { speed: 4 })] }),

  /* ---------- 22. Lights ---------- */
  "134": road({ env: "night", props: [north(2, 24, -34, BLUE, { beams: true, speed: 5 }), tag(2, -3, "Headlights on", 2.6)] }),
  "135": road({ env: "night", props: [north(2, 34, -34, BLUE, { beams: true, speed: 5 }), south(-2, -34, 34, RED, { beams: true, speed: 5 }), dim(-2, 0, 2, 0, "dip within 150 m")] }),
  "136": road({ env: "night", props: [ mv("person", AMBER, [[5.4, 6], [5.4, -6]], { speed: 1.3 }),parked(3.3, 0, BLUE), tag(3.3, 0, "Parking lights on", 2.8)] }),
  "138": road({ env: "fog", props: [mv("car", BLUE, run(2, 26, -34), { speed: 3, beams: true }), tag(2, 0, "Heavy rain or snow: low beam", 2.8)] }),
  "140": road({ env: "fog", props: [mv("car", RED, run(2, 24, -34), { speed: 2.6, beams: true }), tag(2, -1, "Rear fog light: only in fog", 2.8)] }),

  /* ---------- 23. Towing ---------- */
  "142": road({ props: [mv("car", RED, run(2, 24, -34), { speed: 3 }), mv("car", BLUE, run(2, 30.2, -27.8), { speed: 3, towLength: 2 }), tag(2, 10, "A driver steers the towed car", 2.6)] }),
  "143": road({ props: [mv("car", RED, run(2, 24, -34), { speed: 3 }), mv("bus", AMBER, run(2, 33.4, -24.6), { speed: 3, text: "No passengers" })] }),
  "144": road({ props: [mv("car", RED, run(2, 24, -34), { speed: 3 }), mv("car", BLUE, run(2, 31.6, -26.4), { speed: 3, towLength: 4 }), tag(2, 12, "Flexible hitch: 4 to 6 m", 2.6)] }),
  "145": road({ env: "fog", props: [mv("car", RED, run(2, 24, -34), { speed: 2.4 }), mv("car", BLUE, run(2, 31.6, -26.4), { speed: 2.4, towLength: 4 }), tag(2, 12, "Icy road: no flexible hitch", 2.6)] }),

  /* ---------- 24. Learner driving ---------- */
  "146": lot({
    props: [
      mv("car", AMBER, [[-9, 8], [-5, 4], [-1, 8], [3, 4], [7, 8], [11, 4]], { speed: 3, text: "Learner" }),
      ...[-7, -3, 1, 5, 9].map((x) => at("cone", x, 6)),
    ],
  }),
  "147": road({ props: [north(2, 24, -34, AMBER, { speed: 3.4, text: "Instructor + learner" })] }),
  "149": lot({
    props: [ mv("person", AMBER, [[-14, 5], [14, 5]], { speed: 2 }),at("motorbike", -9, 0, PI, { text: "A: 16" }), at("car", -4.5, 0, PI, { color: BLUE, text: "B: 18" }), at("truck", 1.5, 0, PI, { color: GREY, text: "C: 18" }), at("bus", 8, 0, PI, { color: AMBER, text: "D: 21" })],
  }),
  "150": cabin(["belt", "belt", "empty", "empty", "empty"], "Instructor pedals, mirror, GPS"),

  /* ---------- 25. Carrying people ---------- */
  "157": cabin(["belt", "belt", "belt", "empty", "belt"], "Explain the safety rules first"),
  "158": road({
    props: [at("bus", 2.4, 0, PI, { color: AMBER }), mv("person", AMBER, [[3.9, 1.5], [5.8, 2.5]], { speed: 1.2, delay: 1 }), tag(2.4, 0, "Move off only when everyone is seated", 3.6)],
  }),
  "159": cabin(["belt", "empty", "childseat", "empty", "child"], "Children: seat or restraint"),

  /* ---------- 26. Cargo ---------- */
  "161": road({
    props: [at("truck", 3, 0, PI, { color: GREY, size: [2.5, 2.6, 5.5] }), mv("person", AMBER, [[5, 6], [3.8, 3]], { speed: 1.4 }), tag(3, 0, "Secure the load", 4.4)],
  }),
  "162": road({
    props: [mv("car", BLUE, run(2, 24, -34), { speed: 4 }), mv("box", BROWN, run(2, 24.2, -33.8), { speed: 4, y: 1.7, size: [1.5, 1, 2.2] }), tag(2, 6, "Up to 1 m high", 3.8)],
  }),
  "163": road({
    props: [
      mv("truck", GREY, run(2, 20, -40), { speed: 3 }),
      mv("box", "#9aa0a6", run(2, 28.4, -31.6), { speed: 3, y: 1.7, size: [0.3, 0.3, 3] }),
      mv("box", RED, run(2, 30.2, -29.8), { speed: 3, y: 1.7, size: [0.3, 0.3, 0.4] }),
      tag(2, 8, "Oversize load sign", 4.8),
    ],
  }),
  "164": road({ props: [mv("truck", GREY, run(2, 24, -34), { speed: 2.5, size: [3.2, 4, 5.5] }), dim(5, -3, 5, 3, "tall: over 4 m"), tag(2, 0, "Agree it with the police", 6)] }),

  /* ---------- 27. Cyclists ---------- */
  "165": road({ props: [mv("cyclist", AMBER, run(3.6, 22, -26), { speed: 3, text: "Bike: age 14" }), mv("scooter", RED, run(2.4, 28, -22), { speed: 4, text: "Moped: age 16" })] }),
  "166": road({
    props: [mv("cyclist", AMBER, run(3.7, 20, -30), { speed: 3.2 }), mv("cyclist", "#2f6fdc", run(3.7, 24, -26), { speed: 3.2 }), mv("cyclist", "#30a46c", run(3.7, 28, -22), { speed: 3.2 }), north(1.2, 34, -34, RED, { speed: 6 })],
  }),
  "167": road({ env: "night", props: [mv("cyclist", AMBER, run(3.6, 22, -26), { speed: 3, beams: true }), tag(3.6, 0, "Lights and reflectors", 2.6)] }),
  "168": road({ paint: zebra(0, -4, 4), props: [mv("cyclist", AMBER, [[6, 0], [-6, 0]], { speed: 1.1, text: "Walk the bike" }), north(2, 24, 6, BLUE, { speed: 4 })] }),
  "169": road({ paint: [band(0, -2, 2, 12, "#8a2f33")], props: [mv("cyclist", AMBER, [[7, 6], [7, 3.5]], { speed: 1.2 }), north(2, 24, -30, BLUE, { speed: 5 }), tag(5, 0, "Cyclist gives way", 2.6)] }),
  pmd122: road({ props: [mv("scooter", AMBER, run(6, 20, -22), { speed: 2.7, text: "10 km/h on the sidewalk" }), mv("person", "#2f6fdc", run(7, 12, -12), { speed: 1.3 })] }),
  pmd123: road({ props: [mv("scooter", AMBER, [[6, 16], [6, 5]], { speed: 3 }), mv("person", "#2f6fdc", [[8.5, 0], [4, 0]], { speed: 1.1 }), tag(6, 2, "Pedestrians first", 2.4)] }),

  /* ---------- 28. Vehicles ---------- */
  "176": road({
    props: [ mv("car", RED, run(-2, -30, 30), { speed: 4 }),at("car", 2.4, 0, PI, { color: BLUE }), at("box", 2.4, -2.45, 0, { y: 1.1, size: [0.5, 0.5, 0.06], color: "#ffd21a" }), tag(2.4, 0, "New driver sign", 3)],
  }),

  /* ---------- 29. Road markings ---------- */
  "m1.1": road({ paint: [solid(0, -44, 44)], props: [north(2, 28, -30), south(-2, -30, 28, RED), tag(0, 0, "1.1: do not cross", 2)] }),
  "m1.3": wide(14, { paint: [solid(-0.2, -44, 44), solid(0.2, -44, 44), ...dashed(-3.5, -44, 44), ...dashed(3.5, -44, 44)], props: [north(1.8, 28, -30), south(-1.8, -30, 28, RED), tag(0, 0, "1.3: four or more lanes", 2)] }),
  "m1.4": road({ paint: [solid(4.15, -44, 44, 0.2, YEL)], props: [north(1.6, 26, -30), tag(5.8, 0, "1.4: no stopping", 1.8)] }),
  "m1.5": road({ paint: [...dashed(0, -44, 44)], props: [mv("car", BLUE, [[2, 26], [2, 12], [-2, 6], [-2, -12], [2, -18], [2, -34]], { speed: 6 }), tag(0, 0, "1.5: may cross", 2)] }),
  "m1.9": wide(12, { paint: [solid(-2, -44, 44), solid(2, -44, 44)], props: [at("lamp", 6, -6, 0, { state: "red" }), north(4, 28, -30), tag(0, 0, "1.9: reversible lane", 2)] }),
  "m1.10": road({ paint: [solid(4.15, -44, 44, 0.2, YEL)], props: [mv("car", BLUE, [[2, 20], [3.2, 6]], { speed: 3 }), tag(5.8, 0, "1.10: no parking", 1.8)] }),
  "m1.11": road({ paint: [solid(-0.15, -44, 44), ...dashed(0.2, -44, 44)], props: [north(2, 28, -30), south(-2, -30, 28, RED), tag(0, 0, "1.11: broken side may be crossed", 2)] }),
  "m1.12": cross({ cars: [{ id: "A", label: "A", from: "S", color: RED, hold: true }], lights: [{ side: "S", state: "red" }], props: [tag(1.5, 6.6, "1.12: stop line", 1.6)] }),
  "m1.14": road({ paint: zebra(0, -4, 4), props: [mv("person", AMBER, [[5.5, 0], [-5.5, 0]], { speed: 1.4 }), north(2, 24, 6, BLUE, { speed: 4 }), tag(0, 3, "1.14: zebra", 2)] }),
  "m-conflict": road({ paint: [...dashed(0, -44, 44, YEL)], props: [at("sign", 5, 6, PI / 2, { sign: "warning" }), north(2, 26, -30, BLUE, { speed: 3 }), tag(0, 0, "Sign beats marking", 2)] }),

  /* ---------- 30. Technical conditions ---------- */
  "t-tyre": lot({ camera: [10, 10, 12], props: [ mv("person", AMBER, [[-8, 6], [8, 6]], { speed: 1.8 }),at("car", 0, 0, PI, { color: BLUE }), tag(0, 0, "Tread at least 1.6 mm", 2.8)] }),
  "t-kit": lot({
    camera: [10, 11, 12],
    props: [ mv("person", AMBER, [[-8, 6], [8, 6]], { speed: 1.8 }),
      at("car", 0, 0, PI, { color: BLUE }),
      at("box", 3.6, 1, 0, { size: [0.5, 0.9, 0.5], color: "#d4202a", text: "extinguisher" }),
      at("box", 3.6, -1, 0, { size: [0.6, 0.4, 0.4], color: "#f4f6f8", text: "first aid kit" }),
      at("triangle", 5, 0),
      at("box", 5, 2, 0, { size: [0.5, 0.2, 0.4], color: "#ffd21a", text: "vest" }),
    ],
  }),
  "t-glass": lot({ camera: [10, 10, 12], props: [ mv("person", AMBER, [[-8, 6], [8, 6]], { speed: 1.8 }),at("car", 0, 0, PI, { color: GREY }), tag(0, 0, "Front windows: 70% light", 2.8)] }),
};

/** Scenes for the first chapter's lessons, where the generic ones were hard to read. */
export const lessonScenes: Record<string, SceneSpec> = {
  "speed-distance": follow,
  "road-markings": road({
    camera: [32, 26, 20],
    focus: [0, -4],
    paint: [solid(0, 6, 40), ...dashed(0, -40, 6)],
    props: [
      mv("truck", GREY, run(2, -4, -34), { speed: 1.6 }),
      mv("car", RED, [[2, 24], [2, -8], [-2, -12], [-2, -26], [2, -30], [2, -36]], { speed: 5, signal: "left" }),
      tag(0, 14, "Solid line: do not cross", 2.4),
      tag(0, -22, "Broken line: may overtake", 2.4),
    ],
  }),
  parking: road({
    camera: [32, 26, 30],
    focus: [0, 6],
    paint: [band(4.3, -34, -20, 1.2, "#7a2328")],
    props: [
      parked(3.4, -8, GREY),
      parked(3.4, -14, AMBER),
      mv("car", BLUE, [[2, 30], [2, 12], [3.4, 4], [3.4, 0]], { speed: 3, signal: "right" }),
      tag(5.8, 8, "Park on the right, parallel to the kerb", 2),
      tag(5.8, -27, "No parking zone", 1.6),
    ],
  }),
};
