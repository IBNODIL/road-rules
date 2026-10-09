import {
  Signpost,
  ArrowsSplit,
  TrafficSignal,
  ArrowBendUpLeft,
  PersonSimpleWalk,
  Gauge,
  RoadHorizon,
  Park,
} from "@phosphor-icons/react/dist/ssr";

export const iconMap = {
  sign: Signpost,
  intersection: ArrowsSplit,
  light: TrafficSignal,
  turn: ArrowBendUpLeft,
  walk: PersonSimpleWalk,
  speed: Gauge,
  lines: RoadHorizon,
  parking: Park,
} as const;
