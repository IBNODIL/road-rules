export type Side = "N" | "E" | "S" | "W";

export type SignType =
  | "stop"
  | "yield"
  | "noentry"
  | "speed50"
  | "priority"
  | "oneway"
  | "noparking"
  | "crossing"
  | "warning";

export type SceneCar = {
  id: string;
  /** Arm of the junction the car approaches from. */
  from: Side;
  color: string;
  turn?: "left" | "right" | "straight";
  /** Position in the go sequence. Cars with the same order move together. */
  order?: number;
  /** Extra seconds to wait after the car's turn comes up. */
  delay?: number;
  /** Car waits at the stop line for the whole animation. */
  hold?: boolean;
  /** Car drives straight through without stopping (straight roads). */
  free?: boolean;
  distance?: number;
  label?: string;
};

export type PropKind =
  | "car"
  | "truck"
  | "bus"
  | "tram"
  | "ambulance"
  | "police"
  | "person"
  | "child"
  | "blind"
  | "officer"
  | "cyclist"
  | "scooter"
  | "motorbike"
  | "tractor"
  | "cone"
  | "triangle"
  | "barrier"
  | "train"
  | "box"
  | "tree"
  | "building"
  | "sign"
  | "lamp"
  | "label"
  | "dim"
  | "rope"
  | "cabin";

/** A thing in the scene. With a route it moves, without one it stands still. */
export type Prop = {
  kind: PropKind;
  x: number;
  z: number;
  /** Heading in radians. 0 faces +z, π faces −z. */
  rot?: number;
  color?: string;
  /** Label or distance text. */
  text?: string;
  /** Second end of a dimension line or a rope. */
  to?: [number, number];
  sign?: SignType;
  gesture?: "out" | "fwd" | "up";
  state?: "red" | "yellow" | "green" | "down" | "up";
  signal?: "left" | "right" | "hazard";
  beams?: boolean;
  /** Width, height and length for boxes and buildings. */
  size?: [number, number, number];
  /** Seats of a cabin: front left, front right, rear left, rear middle, rear right. */
  seats?: ("belt" | "nobelt" | "child" | "childseat" | "empty")[];
  route?: [number, number][];
  /** Metres per second along the route. */
  speed?: number;
  /** Seconds to wait before moving. */
  delay?: number;
  loop?: boolean;
  /** Lifts the prop off the ground, for example a roof box. */
  y?: number;
  /** Drives backwards: the heading is flipped. */
  reverse?: boolean;
  /** Length in metres of a tow rope reaching forward from this car. */
  towLength?: number;
};

/** A painted rectangle on the ground. */
export type Paint = { x: number; z: number; w: number; l: number; rot?: number; color?: string };

export type SceneSpec = {
  /** Road layout. The default is a four way junction. */
  layout?: "cross" | "road" | "lot" | "railway" | "round";
  /** Width of a straight road in metres. */
  roadWidth?: number;
  /** Length of each junction arm in metres. Default 20. */
  armLength?: number;
  env?: "day" | "night" | "fog";
  /** Tilts the whole scene, in radians, to show a slope. */
  tilt?: number;
  camera?: [number, number, number];
  focus?: [number, number];
  props?: Prop[];
  paint?: Paint[];
  arms?: Side[];
  cars: SceneCar[];
  signs?: { type: SignType; side: Side }[];
  lights?: { side: Side; state: "red" | "yellow" | "green" }[];
  pedestrian?: Side;
};

export type Lesson = {
  slug: string;
  minutes: number;
  icon: "sign" | "intersection" | "light" | "turn" | "walk" | "speed" | "lines" | "parking";
  scene?: SceneSpec;
  signGallery?: boolean;
};

export type Question = {
  id: string;
  lesson: string;
  scene?: SceneSpec;
  sign?: SignType;
  /** Set for questions that come from a rule of the course. */
  rule?: string;
  /** Index of the right option. */
  answer: number;
};
