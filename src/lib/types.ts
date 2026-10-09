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

export type SceneSpec = {
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
  /** Index of the right option. */
  answer: number;
};
