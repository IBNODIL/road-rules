import { SIGN_ORDER } from "./signs";
import type { Dict, QuestionText } from "./i18n/en";
import type { Lesson, Question, SceneSpec, SignType } from "./types";

/* Course convention: right hand traffic, priority to the right at unmarked
   junctions (Vienna Convention style). Local law always wins.
   All user facing text lives in src/lib/i18n. */

const RED = "#d4202a";
const BLUE = "#2f6fdc";
const AMBER = "#f2a516";
const GREEN = "#2e9e62";

export const sceneRightOfWay: SceneSpec = {
  cars: [
    { id: "A", label: "A", from: "S", color: RED, order: 2 },
    { id: "B", label: "B", from: "E", color: BLUE, order: 1 },
    { id: "C", label: "C", from: "N", color: AMBER, order: 0 },
  ],
};

export const heroScene: SceneSpec = {
  cars: [
    { id: "A", from: "S", color: RED, order: 0, turn: "straight" },
    { id: "B", from: "N", color: BLUE, order: 0, turn: "right" },
    { id: "C", from: "E", color: AMBER, order: 2, turn: "left" },
    { id: "D", from: "W", color: GREEN, order: 3, turn: "straight" },
  ],
  signs: [
    { type: "stop", side: "E" },
    { type: "yield", side: "W" },
    { type: "crossing", side: "S" },
    { type: "speed50", side: "N" },
  ],
};

const followScene: SceneSpec = {
  arms: ["N", "S"],
  cars: [
    { id: "A", label: "A", from: "S", color: BLUE, free: true, distance: 9 },
    { id: "B", label: "B", from: "S", color: RED, free: true, distance: 15 },
  ],
};

const pedestrianScene: SceneSpec = {
  pedestrian: "S",
  cars: [{ id: "A", label: "A", from: "S", color: RED, delay: 6 }],
};

export const lessons: Lesson[] = [
  { slug: "road-signs", minutes: 8, icon: "sign", signGallery: true },
  { slug: "right-of-way", minutes: 7, icon: "intersection", scene: sceneRightOfWay },
  {
    slug: "traffic-lights",
    minutes: 5,
    icon: "light",
    scene: {
      cars: [
        { id: "A", label: "A", from: "S", color: RED, hold: true },
        { id: "B", label: "B", from: "E", color: BLUE, order: 0 },
      ],
      lights: [
        { side: "S", state: "red" },
        { side: "E", state: "green" },
      ],
    },
  },
  {
    slug: "turning",
    minutes: 6,
    icon: "turn",
    scene: {
      cars: [
        { id: "A", label: "A", from: "S", color: RED, turn: "left", order: 1 },
        { id: "B", label: "B", from: "N", color: BLUE, turn: "straight", order: 0 },
      ],
    },
  },
  { slug: "pedestrians", minutes: 5, icon: "walk", scene: pedestrianScene },
  { slug: "speed-distance", minutes: 6, icon: "speed", scene: followScene },
  {
    slug: "road-markings",
    minutes: 5,
    icon: "lines",
    scene: { arms: ["N", "S"], cars: [{ id: "A", label: "A", from: "S", color: GREEN, free: true, distance: 10 }] },
  },
  {
    slug: "parking",
    minutes: 5,
    icon: "parking",
    scene: {
      arms: ["N", "S"],
      signs: [{ type: "noparking", side: "S" }],
      cars: [{ id: "A", label: "A", from: "S", color: AMBER, hold: true }],
    },
  },
];

const cross = (cars: SceneSpec["cars"], extra: Partial<SceneSpec> = {}): SceneSpec => ({ cars, ...extra });

const signQuestion = (type: SignType, i: number): Question => ({
  id: `sign-${type}`,
  lesson: "road-signs",
  sign: type,
  answer: i % 4,
});

export const questions: Question[] = [
  {
    id: "row-two",
    lesson: "right-of-way",
    scene: cross([
      { id: "A", label: "A", from: "S", color: RED, order: 1 },
      { id: "B", label: "B", from: "E", color: BLUE, order: 0 },
    ]),
    answer: 1,
  },
  { id: "row-three", lesson: "right-of-way", scene: sceneRightOfWay, answer: 2 },
  {
    id: "left-oncoming",
    lesson: "turning",
    scene: cross([
      { id: "A", label: "A", from: "S", color: RED, turn: "left", order: 1 },
      { id: "B", label: "B", from: "N", color: BLUE, order: 0 },
    ]),
    answer: 1,
  },
  {
    id: "stop-sign",
    lesson: "right-of-way",
    scene: cross(
      [
        { id: "A", label: "A", from: "S", color: RED, order: 1 },
        { id: "B", label: "B", from: "E", color: BLUE, order: 0 },
      ],
      { signs: [{ type: "stop", side: "S" }] },
    ),
    answer: 1,
  },
  {
    id: "yield-beats-right",
    lesson: "right-of-way",
    scene: cross(
      [
        { id: "A", label: "A", from: "W", color: RED, order: 1 },
        { id: "B", label: "B", from: "N", color: BLUE, order: 0 },
      ],
      { signs: [{ type: "yield", side: "W" }] },
    ),
    answer: 1,
  },
  {
    id: "priority-road",
    lesson: "road-signs",
    scene: cross(
      [
        { id: "A", label: "A", from: "S", color: RED, order: 0 },
        { id: "B", label: "B", from: "E", color: BLUE, order: 1 },
      ],
      {
        signs: [
          { type: "priority", side: "S" },
          { type: "priority", side: "N" },
        ],
      },
    ),
    answer: 0,
  },
  {
    id: "red-light",
    lesson: "traffic-lights",
    scene: cross(
      [
        { id: "A", label: "A", from: "S", color: RED, hold: true },
        { id: "B", label: "B", from: "E", color: BLUE, order: 0 },
      ],
      {
        lights: [
          { side: "S", state: "red" },
          { side: "E", state: "green" },
        ],
      },
    ),
    answer: 0,
  },
  {
    id: "yellow-light",
    lesson: "traffic-lights",
    scene: cross([{ id: "A", label: "A", from: "S", color: RED, hold: true }], {
      lights: [{ side: "S", state: "yellow" }],
    }),
    answer: 0,
  },
  { id: "pedestrian-crossing", lesson: "pedestrians", scene: pedestrianScene, answer: 0 },
  {
    id: "no-entry-scene",
    lesson: "road-signs",
    scene: cross([{ id: "A", label: "A", from: "N", color: RED, hold: true }], {
      signs: [{ type: "noentry", side: "N" }],
    }),
    answer: 0,
  },
  { id: "two-seconds", lesson: "speed-distance", scene: followScene, answer: 0 },
  {
    id: "braking-square",
    lesson: "speed-distance",
    scene: { arms: ["N", "S"], cars: [{ id: "A", label: "A", from: "S", color: GREEN, free: true, distance: 10 }] },
    answer: 2,
  },
  {
    id: "signal-early",
    lesson: "turning",
    scene: cross([{ id: "A", label: "A", from: "S", color: RED, turn: "right", order: 0 }]),
    answer: 0,
  },
  {
    id: "no-parking-scene",
    lesson: "parking",
    scene: {
      arms: ["N", "S"],
      signs: [{ type: "noparking", side: "S" }],
      cars: [{ id: "A", label: "A", from: "S", color: AMBER, hold: true }],
    },
    answer: 0,
  },
  {
    id: "park-crossing",
    lesson: "parking",
    scene: {
      pedestrian: "S",
      cars: [{ id: "A", label: "A", from: "S", color: AMBER, hold: true }],
    },
    answer: 1,
  },
  {
    id: "speed-settlement",
    lesson: "speed-distance",
    scene: { arms: ["N", "S"], cars: [{ id: "A", label: "A", from: "S", color: GREEN, free: true, distance: 10 }] },
    answer: 2,
  },
  {
    id: "speed-school",
    lesson: "speed-distance",
    scene: {
      arms: ["N", "S"],
      signs: [{ type: "crossing", side: "S" }],
      cars: [{ id: "A", label: "A", from: "S", color: BLUE, free: true, distance: 10 }],
    },
    answer: 1,
  },
  {
    id: "stop-crossing-distance",
    lesson: "parking",
    scene: { pedestrian: "S", cars: [{ id: "A", label: "A", from: "S", color: AMBER, hold: true }] },
    answer: 1,
  },
  {
    id: "green-pedestrian",
    lesson: "pedestrians",
    scene: {
      pedestrian: "S",
      lights: [{ side: "S", state: "green" }],
      cars: [{ id: "A", label: "A", from: "S", color: RED, delay: 6 }],
    },
    answer: 0,
  },
  {
    id: "warning-triangle",
    lesson: "parking",
    scene: { arms: ["N", "S"], cars: [{ id: "A", label: "A", from: "S", color: AMBER, hold: true }] },
    answer: 2,
  },
  ...SIGN_ORDER.map((t, i) => signQuestion(t, i)),
];

export const PASS_MARK = 0.8;
export const TEST_LENGTH = 10;

export const questionById = (id: string) => questions.find((q) => q.id === id);
export const lessonBySlug = (slug: string) => lessons.find((l) => l.slug === slug);

/** Localised text for a question. Sign questions are built from the sign dictionary. */
export function questionText(q: Question, d: Dict): QuestionText {
  if (!q.sign) return d.questions[q.id];
  const idx = SIGN_ORDER.indexOf(q.sign);
  const others = [1, 2, 3].map((k) => d.signs[SIGN_ORDER[(idx + k * 2) % SIGN_ORDER.length]].meaning);
  const options = [...others];
  options.splice(q.answer, 0, d.signs[q.sign].meaning);
  return {
    text: d.test.signQuestion,
    options,
    explanation: `${d.signs[q.sign].name}: ${d.signs[q.sign].meaning}`,
  };
}
