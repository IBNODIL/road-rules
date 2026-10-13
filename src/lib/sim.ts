/* Pure simulation logic for the parking simulator. No React, no three.js.
   World units are metres. Forward vector for heading θ is (sin θ, cos θ),
   so θ = 0 faces +z (toward the viewer) and θ = π faces −z (up the screen). */

export type LevelId = "perpendicular" | "reverseBay" | "parallel" | "tightParallel" | "garage" | "carPark" | "coneCourse";
/** In the order they are offered, from the easiest to the hardest. */
export const levelIds: LevelId[] = ["perpendicular", "reverseBay", "parallel", "tightParallel", "garage", "carPark", "coneCourse"];

export type Obstacle = {
  x: number;
  z: number;
  /** Half width (local x) and half length (local z). */
  hw: number;
  hl: number;
  rot: number;
  kind: "car" | "wall" | "cone";
  color?: string;
  height?: number;
};

export type Bay = { cx: number; cz: number; hw: number; hl: number; rot: number };

/** A painted line segment. Solid (unbroken) lines cost points when crossed, dashed ones do not.
    A line that marks the edge of the bay (`bay`) never costs points: it is part of parking. */
export type Line = { x: number; z: number; w: number; l: number; solid: boolean; rot?: number; bay?: boolean };

export type Level = {
  id: LevelId;
  start: { x: number; z: number; theta: number };
  bay: Bay;
  obstacles: Obstacle[];
  lines: Line[];
  /** Asphalt rectangle. Everything outside it (and outside `poly`) is grass. */
  asphalt: { x: number; z: number; w: number; d: number };
  /** Optional asphalt outline as [x, z] points. When set it replaces the rectangle. */
  poly?: [number, number][];
  /** False when the painted lines are only guides and crossing them costs nothing. Defaults to true. */
  lineFines?: boolean;
  center: [number, number];
};

export const START_SCORE = 10;
export const LINE_FINE = 2;
/** Cost of a signal or hazard light violation. */
export const RULE_FINE = 1;
/** A forward turn of more than this (25 degrees) needs the turn signal on. */
const TURN_LIMIT = (25 * Math.PI) / 180;
/** Reversing further than this (metres) needs the hazard lights on. */
const REVERSE_FREE = 1;
/** Signals and hazards are not needed once this share of the car is inside the bay. */
const BAY_FREE_SHARE = 0.2;
/** The exam stops as failed when the score drops below this. */
export const PASS_SCORE = 6;

const CAR_HW = 0.95;
const CAR_HL = 2.05;
const PALETTE = ["#6b7d8f", "#8f6b6b", "#7a8f6b", "#8f8a6b", "#6b6b8f"];

const car = (x: number, z: number, rot: number, i: number): Obstacle => ({
  x,
  z,
  hw: CAR_HW,
  hl: CAR_HL,
  rot,
  kind: "car",
  color: PALETTE[i % PALETTE.length],
});
const cone = (x: number, z: number): Obstacle => ({ x, z, hw: 0.25, hl: 0.25, rot: 0, kind: "cone" });
const wall = (x: number, z: number, hw: number, hl: number, height = 0.4): Obstacle => ({
  x,
  z,
  hw,
  hl,
  rot: 0,
  kind: "wall",
  height,
});

const solid = (x: number, z: number, w: number, l: number): Line => ({ x, z, w, l, solid: true });

/** Broken line along x from x0 to x1: 1.6 m dashes with 1.6 m gaps. */
function dashesX(x0: number, x1: number, z: number): Line[] {
  const out: Line[] = [];
  for (let x = x0; x + 1.6 <= x1 + 0.01; x += 3.2) out.push({ x: x + 0.8, z, w: 1.6, l: 0.14, solid: false });
  return out;
}

/** Angled (45 degree) bays along a kerb, entered nose first from the lane in front of them. */
function perpendicular(): Level {
  const angle = Math.PI / 4;
  const rowZ = -3.6;
  const pitch = 4; // along the row; 2.83 m between bay lines measured square to them
  const occupied = [-2, -1, 1, 2].map((k) => k * pitch);
  const bounds = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((k) => k * pitch);
  return {
    id: "perpendicular",
    lineFines: false,
    start: { x: 11, z: 2.2, theta: -Math.PI / 2 },
    bay: { cx: 0, cz: rowZ, hw: 1.4, hl: 2.6, rot: angle },
    obstacles: [
      wall(0, -6.8, 17, 0.3),
      ...occupied.map((x, i) => car(x, rowZ, angle, i)),
      cone(-12.5, -3),
      cone(12.5, -3),
      cone(-15, 6),
      cone(-13, 7),
    ],
    lines: [
      ...bounds.map((x): Line => ({ x, z: rowZ, w: 0.12, l: 5.4, solid: true, rot: angle })),
      ...dashesX(-16, 16, 4.6),
    ],
    asphalt: { x: 0, z: 3, w: 34, d: 20 },
    poly: [
      [-11, -7],
      [11, -7],
      [17, 2],
      [17, 13],
      [-17, 13],
      [-17, 2],
    ],
    center: [0, 1],
  };
}

function parallel(): Level {
  return {
    id: "parallel",
    start: { x: 11, z: -0.5, theta: -Math.PI / 2 },
    bay: { cx: 0, cz: -4.5, hw: 1.3, hl: 3.6, rot: Math.PI / 2 },
    obstacles: [
      wall(0, -6.3, 20, 0.3),
      car(-5.7, -4.5, Math.PI / 2, 0),
      car(5.7, -4.5, Math.PI / 2, 2),
      car(-13, -4.5, Math.PI / 2, 3),
      cone(15, -4.5),
      cone(-9.6, 4.5),
    ],
    lines: [solid(0, 2, 16, 0.15), ...dashesX(-20, -8, 2), ...dashesX(8, 20, 2)],
    asphalt: { x: 0, z: -1, w: 40, d: 13 },
    center: [0, -2],
  };
}

function garage(): Level {
  return {
    id: "garage",
    start: { x: 5.2, z: -2.5, theta: -Math.PI / 2 },
    bay: { cx: 0, cz: -9.2, hw: 1.9, hl: 2.7, rot: 0 },
    obstacles: [
      wall(-2.2, -9.2, 0.2, 2.8, 2.2),
      wall(2.2, -9.2, 0.2, 2.8, 2.2),
      wall(0, -12.2, 2.4, 0.2, 2.2),
      car(-7, -8, 0, 1),
      car(7, -8, 0, 4),
      cone(-10, -4.5),
      cone(10, -4.5),
      cone(-12, 2),
    ],
    lines: [solid(-5.2, -5.2, 5.6, 0.15), solid(5.2, -5.2, 5.6, 0.15), ...dashesX(-14, 14, 1.2)],
    asphalt: { x: 0, z: -1, w: 30, d: 24 },
    center: [0, -3],
  };
}

/** Straight 90 degree bays along a wall: back in between two parked cars from the lane. */
function reverseBay(): Level {
  const rowZ = -4.6;
  const pitch = 2.7; // one bay is 2.7 m wide
  const occupied = [-3, -2, -1, 1, 2, 3].map((k) => k * pitch);
  return {
    id: "reverseBay",
    start: { x: 12.5, z: 2.6, theta: -Math.PI / 2 },
    bay: { cx: 0, cz: rowZ, hw: 1.35, hl: 2.6, rot: 0 },
    obstacles: [wall(0, -7.6, 13, 0.3), ...occupied.map((x, i) => car(x, rowZ, 0, i)), cone(-12.5, 3), cone(-12.5, 0.5)],
    lines: [
      ...[-1.35, 1.35].map((x): Line => ({ x, z: rowZ, w: 0.12, l: 5.2, solid: true, bay: true })),
      ...dashesX(-14, 14, 5.6),
    ],
    asphalt: { x: 0, z: 1, w: 30, d: 17 },
    center: [0, 0],
  };
}

/** Parallel parking in a gap about one and a half car lengths long, with cars parked across the street. */
function tightParallel(): Level {
  return {
    id: "tightParallel",
    start: { x: 13, z: -0.5, theta: -Math.PI / 2 },
    bay: { cx: 0, cz: -4.5, hw: 1.3, hl: 3.2, rot: Math.PI / 2 },
    obstacles: [
      wall(0, -6.3, 20, 0.3),
      car(-5.3, -4.5, Math.PI / 2, 0),
      car(5.3, -4.5, Math.PI / 2, 2),
      car(-12.5, -4.5, Math.PI / 2, 3),
      car(-4, 4.3, Math.PI / 2, 4),
      car(6.5, 4.3, -Math.PI / 2, 1),
      cone(15.5, -4.5),
    ],
    lines: dashesX(-20, 20, 0.8),
    asphalt: { x: 0, z: -0.5, w: 40, d: 14 },
    center: [0, -1],
  };
}

/** A car park: an aisle only about 6.5 m wide with cars on both sides and pillars, and a bay to back into. */
function carPark(): Level {
  const pitch = 2.7;
  const top = [-3, -2, -1, 1, 2, 3].map((k) => k * pitch);
  const bottom = [-3, -1, 0, 2, 3].map((k) => k * pitch);
  const pillar = (x: number, z: number): Obstacle => ({ x, z, hw: 0.3, hl: 0.3, rot: 0, kind: "wall", height: 2.6 });
  return {
    id: "carPark",
    start: { x: 14.5, z: 1.5, theta: -Math.PI / 2 },
    bay: { cx: 0, cz: -4.6, hw: 1.35, hl: 2.6, rot: 0 },
    obstacles: [
      wall(0, -7.6, 18, 0.3, 2.6),
      wall(0, 9.9, 18, 0.3, 2.6),
      wall(-18, 1.1, 0.3, 9, 2.6),
      wall(18, 1.1, 0.3, 9, 2.6),
      ...top.map((x, i) => car(x, -4.6, 0, i)),
      ...bottom.map((x, i) => car(x, 6.7, Math.PI, i + 2)),
      pillar(-9.45, -2.3),
      pillar(-4.05, -2.3),
      pillar(4.05, -2.3),
      pillar(9.45, -2.3),
      pillar(-6.75, 4.5),
      pillar(6.75, 4.5),
    ],
    lines: [...[-1.35, 1.35].map((x): Line => ({ x, z: -4.6, w: 0.12, l: 5.2, solid: true, bay: true })), ...dashesX(-16, 16, 1.4)],
    asphalt: { x: 0, z: 1.1, w: 36, d: 19 },
    center: [0, 1],
  };
}

/** Three gates of cones to weave through, then forward into a box between low walls. */
function coneCourse(): Level {
  const gate = (x: number, z: number): Obstacle[] => [cone(x, z - 1.6), cone(x, z + 1.6)];
  return {
    id: "coneCourse",
    lineFines: false,
    start: { x: -16, z: 4, theta: Math.PI / 2 },
    bay: { cx: 15.4, cz: 4, hw: 1.5, hl: 3.0, rot: Math.PI / 2 },
    obstacles: [
      ...gate(-9, 4.8),
      ...gate(0, 3.2),
      ...gate(9, 4.8),
      wall(15.4, 2.3, 3.2, 0.2, 1),
      wall(15.4, 5.7, 3.2, 0.2, 1),
      wall(18.6, 4, 0.2, 1.9, 1),
    ],
    lines: dashesX(12.8, 17.6, 4),
    asphalt: { x: 0, z: 4, w: 40, d: 14 },
    center: [0, 4],
  };
}

export function getLevel(id: LevelId): Level {
  return { perpendicular, reverseBay, parallel, tightParallel, garage, carPark, coneCourse }[id]();
}

/* ---------- geometry ---------- */

type Pt = [number, number];

/** Corners of an oriented box. rot has the same meaning as heading. */
export function corners(x: number, z: number, hw: number, hl: number, rot: number): Pt[] {
  const fx = Math.sin(rot);
  const fz = Math.cos(rot);
  const rx = Math.cos(rot);
  const rz = -Math.sin(rot);
  return [
    [x + fx * hl + rx * hw, z + fz * hl + rz * hw],
    [x + fx * hl - rx * hw, z + fz * hl - rz * hw],
    [x - fx * hl - rx * hw, z - fz * hl - rz * hw],
    [x - fx * hl + rx * hw, z - fz * hl + rz * hw],
  ];
}

function project(c: Pt[], ax: number, az: number): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const [x, z] of c) {
    const p = x * ax + z * az;
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return [min, max];
}

export function overlap(a: Pt[], b: Pt[], rotA: number, rotB: number): boolean {
  const axes: Pt[] = [
    [Math.sin(rotA), Math.cos(rotA)],
    [Math.cos(rotA), -Math.sin(rotA)],
    [Math.sin(rotB), Math.cos(rotB)],
    [Math.cos(rotB), -Math.sin(rotB)],
  ];
  for (const [ax, az] of axes) {
    const [a0, a1] = project(a, ax, az);
    const [b0, b1] = project(b, ax, az);
    if (a1 < b0 || b1 < a0) return false;
  }
  return true;
}

/** Smallest difference between a heading and a bay axis, treating front and back alike. */
export function axisError(theta: number, rot: number): number {
  let d = (theta - rot) % Math.PI;
  if (d > Math.PI / 2) d -= Math.PI;
  if (d < -Math.PI / 2) d += Math.PI;
  return d;
}

/* ---------- vehicle ---------- */

export type Gear = "D" | "R";

export type Input = {
  /** 0 to 1. */
  gas: number;
  brake: boolean;
  /** -1 right, +1 left. */
  steer: number;
  handbrake: boolean;
  /** Lights lever: 0 off, 1 left, 2 right, 3 hazards. */
  signal: 0 | 1 | 2 | 3;
  /** One shot request to end the exam, honoured only while the car is parked and held still. */
  finish: boolean;
  /** One shot gear request: +1 selects D, -1 selects R. */
  shift: -1 | 0 | 1;
};

export type Hud = {
  time: number;
  score: number;
  gear: Gear;
  speed: number;
  inBay: boolean;
  hold: number;
  /** Seconds since the last line fine and since the last refused gear change. */
  sinceFine: number;
  sinceDenied: number;
  fineKind: FineKind;
  /** Parked and held still, so the exam can be finished. */
  ready: boolean;
};

export type FineKind = "line" | "signal" | "hazard";

export type EndReason = "parked" | "crash" | "fines";

export type Result = {
  passed: boolean;
  reason: EndReason;
  score: number;
  stars: number;
  seconds: number;
  linesCrossed: number;
  ruleFines: number;
  askew: number;
  angle: number;
  offset: number;
};

const WHEELBASE = 2.7;
const ACC = 3.2;
const BRAKE = 8;
const HANDBRAKE = 12;
const DRAG = 1.4;
const MAX_FWD = 7;
const MAX_REV = 3;
const HOLD_TIME = 1;

export class Game {
  x = 0;
  z = 0;
  theta = 0;
  v = 0;
  steer = 0;
  gear: Gear = "D";
  score = START_SCORE;
  linesCrossed = 0;
  ruleFines = 0;
  fineKind: FineKind = "line";
  turnAcc = 0;
  turnLatch = false;
  revDist = 0;
  revLatch = false;
  ready = false;
  fineAt = -99;
  deniedAt = -99;
  clock = 0;
  time = 0;
  hold = 0;
  started = false;
  finished = false;
  inBay = false;
  level: Level;
  private carsBox: Pt[][] = [];
  private lineBox: Pt[][] = [];
  private touching: boolean[] = [];

  constructor(level: Level) {
    this.level = level;
    this.reset();
  }

  reset() {
    const s = this.level.start;
    this.x = s.x;
    this.z = s.z;
    this.theta = s.theta;
    this.v = 0;
    this.steer = 0;
    this.gear = "D";
    this.score = START_SCORE;
    this.linesCrossed = 0;
    this.ruleFines = 0;
    this.fineKind = "line";
    this.turnAcc = 0;
    this.turnLatch = false;
    this.revDist = 0;
    this.revLatch = false;
    this.ready = false;
    this.fineAt = -99;
    this.deniedAt = -99;
    this.clock = 0;
    this.time = 0;
    this.hold = 0;
    this.started = false;
    this.finished = false;
    this.inBay = false;
    this.carsBox = this.level.obstacles.map((o) => corners(o.x, o.z, o.hw, o.hl, o.rot));
    this.lineBox = this.level.lines.map((l) => corners(l.x, l.z, l.w / 2, l.l / 2, l.rot ?? 0));
    this.touching = this.level.lines.map(() => false);
  }

  private bayLocal(px: number, pz: number): Pt {
    const b = this.level.bay;
    const dx = px - b.cx;
    const dz = pz - b.cz;
    return [dx * Math.cos(b.rot) - dz * Math.sin(b.rot), dx * Math.sin(b.rot) + dz * Math.cos(b.rot)];
  }

  /** Lateral offset of the car centre from the bay axis, metres. */
  offset() {
    return Math.abs(this.bayLocal(this.x, this.z)[0]);
  }

  angle() {
    return Math.abs(axisError(this.theta, this.level.bay.rot));
  }

  private cornersInBay(tol: number) {
    const b = this.level.bay;
    return corners(this.x, this.z, CAR_HW, CAR_HL, this.theta).every((c) => {
      const [lx, lz] = this.bayLocal(c[0], c[1]);
      return Math.abs(lx) <= b.hw + tol && Math.abs(lz) <= b.hl + tol;
    });
  }

  /** Share of the car's footprint that lies inside the bay, 0 to 1. */
  private bayShare() {
    const NX = 6;
    const NZ = 12;
    const s = Math.sin(this.theta);
    const c = Math.cos(this.theta);
    const b = this.level.bay;
    let n = 0;
    for (let i = 0; i < NX; i++) {
      for (let j = 0; j < NZ; j++) {
        const lx = -CAR_HW + ((i + 0.5) / NX) * 2 * CAR_HW;
        const lz = -CAR_HL + ((j + 0.5) / NZ) * 2 * CAR_HL;
        const [bx, bz] = this.bayLocal(this.x + lx * c + lz * s, this.z - lx * s + lz * c);
        if (Math.abs(bx) <= b.hw && Math.abs(bz) <= b.hl) n++;
      }
    }
    return n / (NX * NZ);
  }

  private fine(kind: FineKind, points: number) {
    this.score -= points;
    this.fineKind = kind;
    this.fineAt = this.clock;
    if (kind === "line") this.linesCrossed++;
    else this.ruleFines++;
  }

  private end(reason: EndReason, askew = 0): Result {
    this.finished = true;
    this.v = 0;
    const angleDeg = (this.angle() * 180) / Math.PI;
    const score = Math.max(0, this.score - askew);
    const passed = reason === "parked" && score >= PASS_SCORE;
    return {
      passed,
      reason,
      score,
      stars: !passed ? 0 : score >= 10 ? 3 : score >= 8 ? 2 : 1,
      seconds: Math.round(this.time),
      linesCrossed: this.linesCrossed,
      ruleFines: this.ruleFines,
      askew,
      angle: Math.round(angleDeg * 10) / 10,
      offset: Math.round(this.offset() * 100) / 100,
    };
  }

  step(dt: number, inp: Input): Result | null {
    if (this.finished) return null;
    this.clock += dt;

    // gear: only while (almost) stopped
    if (inp.shift !== 0) {
      if (Math.abs(this.v) < 0.4) {
        this.gear = inp.shift > 0 ? "D" : "R";
        this.v = 0;
      } else {
        this.deniedAt = this.clock;
      }
    }

    if (!this.started && (inp.gas > 0 || inp.steer !== 0)) this.started = true;
    if (this.started) this.time += dt;

    // W is gas in the selected gear. S is brake and never reverses the car.
    const dir = this.gear === "D" ? 1 : -1;
    const limit = this.gear === "D" ? MAX_FWD : MAX_REV;
    const stopBy = (rate: number) => {
      const dv = Math.min(Math.abs(this.v), rate * dt);
      this.v -= Math.sign(this.v) * dv;
    };
    if (inp.handbrake) stopBy(HANDBRAKE);
    else if (inp.brake) stopBy(BRAKE);
    else if (inp.gas > 0) {
      this.v += dir * ACC * inp.gas * dt;
      if (this.v * dir > limit) this.v = dir * limit;
    } else stopBy(DRAG);

    // steering, tighter at speed
    const maxSteer = 0.62 / (1 + Math.abs(this.v) * 0.14);
    const target = inp.steer * maxSteer;
    const d = target - this.steer;
    this.steer += Math.max(-3 * dt, Math.min(3 * dt, d));

    const px = this.x;
    const pz = this.z;
    const pt = this.theta;
    this.theta += ((this.v * Math.tan(this.steer)) / WHEELBASE) * dt;
    this.x += Math.sin(this.theta) * this.v * dt;
    this.z += Math.cos(this.theta) * this.v * dt;

    const me = corners(this.x, this.z, CAR_HW, CAR_HL, this.theta);

    // any collision ends the exam
    for (let i = 0; i < this.carsBox.length; i++) {
      if (overlap(me, this.carsBox[i], this.theta, this.level.obstacles[i].rot)) {
        this.x = px;
        this.z = pz;
        this.theta = pt;
        return this.end("crash");
      }
    }

    // turn signal: one forward turn of more than 25 degrees needs the matching signal on
    if (this.v > 0.1 && Math.abs(this.steer) > 0.03) {
      if (!this.turnLatch) {
        this.turnAcc += this.theta - pt;
        if (Math.abs(this.turnAcc) > TURN_LIMIT) {
          const need = this.turnAcc > 0 ? 1 : 2;
          if (inp.signal !== need && this.bayShare() < BAY_FREE_SHARE) this.fine("signal", RULE_FINE);
          this.turnLatch = true;
          this.turnAcc = 0;
        }
      }
    } else if (Math.abs(this.steer) <= 0.03) {
      this.turnAcc = 0;
      this.turnLatch = false;
    }

    // hazard lights: reversing further than a metre needs them on
    if (this.gear === "D" || inp.signal === 3) {
      this.revDist = 0;
      this.revLatch = false;
    } else if (this.v < -0.05 && !this.revLatch) {
      this.revDist += -this.v * dt;
      if (this.revDist > REVERSE_FREE && this.bayShare() < BAY_FREE_SHARE) {
        this.fine("hazard", RULE_FINE);
        this.revLatch = true;
      }
    }

    // painted lines: each new contact with a solid line costs points, except the lines of the bay itself and
    // while the car is already parking (the same share of the car in the bay that frees the signals)
    const linesCount = this.level.lineFines !== false;
    let parking: boolean | null = null;
    for (let i = 0; i < this.lineBox.length; i++) {
      const line = this.level.lines[i];
      const hit = overlap(me, this.lineBox[i], this.theta, line.rot ?? 0);
      if (hit && !this.touching[i] && line.solid && !line.bay && linesCount) {
        parking ??= this.bayShare() >= BAY_FREE_SHARE;
        if (!parking) this.fine("line", LINE_FINE);
      }
      this.touching[i] = hit;
    }
    if (this.score < PASS_SCORE) return this.end("fines");

    // parked?
    this.inBay = this.cornersInBay(0.2) && this.angle() < 0.2;
    if (this.inBay && Math.abs(this.v) < 0.15) this.hold += dt;
    else this.hold = 0;

    // holding still in the bay unlocks the Finish button, the exam only ends when it is pressed
    this.ready = this.hold >= HOLD_TIME;
    if (inp.finish && this.ready) {
      const deg = (this.angle() * 180) / Math.PI;
      return this.end("parked", deg > 7 ? 2 : deg > 3 ? 1 : 0);
    }
    return null;
  }

  hud(): Hud {
    return {
      time: this.time,
      score: this.score,
      gear: this.gear,
      speed: Math.abs(this.v) * 3.6,
      inBay: this.inBay,
      hold: Math.min(this.hold / HOLD_TIME, 1),
      sinceFine: this.clock - this.fineAt,
      sinceDenied: this.clock - this.deniedAt,
      fineKind: this.fineKind,
      ready: this.ready,
    };
  }
}
