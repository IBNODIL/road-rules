"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ArrowCounterClockwise, Play } from "@phosphor-icons/react";
import type { SceneCar, SceneSpec, Side } from "@/lib/types";
import { Sign3D } from "./Sign3D";
import { CarModel } from "./Car3D";
import { Clock, RELEASE_DELAY, sceneTime } from "./sceneClock";
import { Light, PaintView, PropView, routeDuration } from "./Props";

/* ---------- geometry helpers (top down, x right, z toward the viewer) ---------- */

type V2 = [number, number];
const HEAD: Record<Side, V2> = { S: [0, -1], N: [0, 1], E: [-1, 0], W: [1, 0] };
const rt = (h: V2): V2 => [-h[1], h[0]];
const lf = (h: V2): V2 => [h[1], -h[0]];
const add = (a: V2, b: V2, k = 1): V2 => [a[0] + b[0] * k, a[1] + b[1] * k];
const mul = (a: V2, k: number): V2 => [a[0] * k, a[1] * k];

const SPEED = 5;
const GAP = 2.4;
const HOLD = 8;
const ALL: Side[] = ["N", "E", "S", "W"];

type Path = { pts: THREE.Vector3[]; cum: number[]; total: number };

function buildPath(car: SceneCar): Path {
  const D = car.distance ?? 16;
  const h = HEAD[car.from];
  const lane = mul(rt(h), 1.5);
  const start = add(lane, h, -D);
  const entry = add(lane, h, -3);
  const turn = car.turn ?? "straight";
  let exit: V2, end: V2, ctrl: V2;
  if (turn === "straight") {
    exit = add(lane, h, 3);
    end = add(lane, h, D);
    ctrl = lane;
  } else {
    const h2 = turn === "right" ? rt(h) : lf(h);
    const l2 = mul(rt(h2), 1.5);
    exit = add(l2, h2, 3);
    end = add(l2, h2, D);
    ctrl = add(lane, rt(h2), 1.5);
  }
  const pts: THREE.Vector3[] = [];
  const v = (p: V2) => new THREE.Vector3(p[0], 0, p[1]);
  for (let i = 0; i < 12; i++) pts.push(v(add(start, [entry[0] - start[0], entry[1] - start[1]], i / 12)));
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const c = t * t;
    pts.push(
      new THREE.Vector3(
        a * entry[0] + b * ctrl[0] + c * exit[0],
        0,
        a * entry[1] + b * ctrl[1] + c * exit[1],
      ),
    );
  }
  for (let i = 1; i <= 12; i++) pts.push(v(add(exit, [end[0] - exit[0], end[1] - exit[1]], i / 12)));
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  return { pts, cum, total: cum[cum.length - 1] };
}

function approachTime(car: SceneCar) {
  const hold = (car.distance ?? 16) - HOLD;
  return (hold / SPEED) * 1.7;
}

function goTime(car: SceneCar) {
  return RELEASE_DELAY + (car.order ?? 0) * GAP + (car.delay ?? 0);
}

/** t: seconds since start. tr: seconds since release (negative while held). tf: clock for free cars. */
function distanceAt(car: SceneCar, t: number, tr: number, tf: number): number {
  if (car.free) return tf > 0 ? SPEED * 1.4 * tf : 0;
  const hold = (car.distance ?? 16) - HOLD;
  const tA = approachTime(car);
  if (t < tA) {
    const x = Math.max(t, 0) / tA;
    return hold * (1 - (1 - x) * (1 - x));
  }
  if (car.hold) return hold;
  const tau = tr - (car.order ?? 0) * GAP - (car.delay ?? 0);
  if (tau <= 0) return hold;
  return hold + SPEED * (tau - (1 - Math.exp(-2.5 * tau)) / 2.5);
}

/* ---------- vehicle ---------- */

function Car({ car, clock, loop, period }: { car: SceneCar; clock: Clock; loop: boolean; period: number }) {
  const path = useMemo(() => buildPath(car), [car]);
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const { t, tr, tf } = sceneTime(clock, loop, period);
    const s = Math.min(Math.max(distanceAt(car, t, tr, tf), 0), path.total);
    let i = 1;
    while (i < path.cum.length - 1 && path.cum[i] < s) i++;
    const a = path.pts[i - 1];
    const b = path.pts[i];
    const seg = path.cum[i] - path.cum[i - 1] || 1;
    const k = (s - path.cum[i - 1]) / seg;
    g.position.set(a.x + (b.x - a.x) * k, 0, a.z + (b.z - a.z) * k);
    g.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
  });

  const blink = car.turn && car.turn !== "straight" ? car.turn : undefined;

  return (
    <group ref={group}>
      <CarModel color={car.color} blink={blink} />
      {car.label && (
        <Html position={[0, 2.6, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div className="grid size-8 place-items-center rounded-full border-2 border-black bg-[#FFB800] text-base font-semibold text-black shadow-lg">
            {car.label}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ---------- environment ---------- */

function Pedestrian({ clock, loop, period }: { clock: Clock; loop: boolean; period: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const { tr } = sceneTime(clock, loop, period);
    const p = Math.min(Math.max((tr - 0.2) * 1.3, 0), 7.2);
    ref.current.position.set(-3.6 + p, 0, 5);
    ref.current.position.y = Math.abs(Math.sin(p * 4)) * 0.04;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.7, 6, 12]} />
        <meshStandardMaterial color="#ffb000" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#e8b894" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Arm({ side, spec, clock, loop, period }: { side: Side; spec: SceneSpec; clock: Clock; loop: boolean; period: number }) {
  const a = mul(HEAD[side], -1);
  const theta = Math.atan2(a[0], a[1]);
  const sign = spec.signs?.filter((s) => s.side === side) ?? [];
  const light = spec.lights?.find((l) => l.side === side);
  const L = spec.armLength ?? 20;
  const dashes = Array.from({ length: Math.max(6, Math.floor((L - 8) / 2.6)) }, (_, i) => 10 + i * 2.6);
  return (
    <group rotation={[0, theta, 0]}>
      <mesh position={[0, 0.02, 3 + L / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, L]} />
        <meshStandardMaterial color="#34373c" roughness={0.95} />
      </mesh>
      {[-3.25, 3.25].map((x) => (
        <mesh key={x} position={[x, 0.1, 3 + L / 2]} receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.2, L]} />
          <meshStandardMaterial color="#6a6e74" roughness={0.9} />
        </mesh>
      ))}
      {dashes.map((z) => (
        <mesh key={z} position={[0, 0.035, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, 1.4]} />
          <meshStandardMaterial color="#f2f2f2" roughness={0.8} />
        </mesh>
      ))}
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x) => (
        <mesh key={x} position={[x, 0.035, 5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.55, 2]} />
          <meshStandardMaterial color="#f2f2f2" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[1.5, 0.035, 6.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 0.3]} />
        <meshStandardMaterial color="#f2f2f2" roughness={0.8} />
      </mesh>
      {sign.map((s) => (
        <Sign3D key={s.type} type={s.type} position={[4.6, 0, 9.5]} scale={0.95} />
      ))}
      {light && (
        <group position={[4.4, 0, 7.4]}>
          <Light state={light.state} />
        </group>
      )}
      {spec.pedestrian === side && <Pedestrian clock={clock} loop={loop} period={period} />}
    </group>
  );
}

function Town() {
  const blocks: [number, number, number, string][] = [
    [-13, -13, 3.5, "#3d4148"],
    [13, -13, 6, "#4a4f57"],
    [-13, 13, 4.5, "#424851"],
    [13, 13, 3, "#383c43"],
  ];
  return (
    <>
      {blocks.map(([x, z, h, c]) => (
        <mesh key={`${x}${z}`} position={[x, h / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[7, h, 7]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}
      {[
        [-5.2, -5.4],
        [5.4, -5.2],
        [-5.4, 5.3],
        [5.2, 5.4],
      ].map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 1.2, 8]} />
            <meshStandardMaterial color="#5b4630" />
          </mesh>
          <mesh position={[0, 1.8, 0]} castShadow>
            <coneGeometry args={[0.9, 2.2, 10]} />
            <meshStandardMaterial color="#2c5a3c" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Ground({ color = "#1e2a20", r = 34 }: { color?: string; r?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[r, 48]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

const Asphalt = ({ x = 0, z = 0, w, l }: { x?: number; z?: number; w: number; l: number }) => (
  <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[w, l]} />
    <meshStandardMaterial color="#34373c" roughness={0.95} />
  </mesh>
);

/** Buildings and trees on both sides of a straight road. */
function Roadside({ half }: { half: number }) {
  const rows: [number, number, number, string][] = [
    [-22, 4, 6, "#3d4148"],
    [-6, 6, 5, "#4a4f57"],
    [10, 5, 7, "#424851"],
    [26, 4, 5, "#383c43"],
  ];
  return (
    <>
      {[-1, 1].map((side) =>
        rows.map(([z, h, w, c], i) => (
          <mesh key={`${side}${i}`} position={[side * (half + 8 + (i % 2) * 2), h / 2, z + (side > 0 ? 4 : 0)]} castShadow receiveShadow>
            <boxGeometry args={[w, h, 7]} />
            <meshStandardMaterial color={c} roughness={0.85} />
          </mesh>
        )),
      )}
      {[-1, 1].flatMap((side) =>
        [-14, 0, 15].map((z) => (
          <group key={`t${side}${z}`} position={[side * (half + 4.2), 0, z]}>
            <mesh position={[0, 0.6, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 1.2, 8]} />
              <meshStandardMaterial color="#5b4630" />
            </mesh>
            <mesh position={[0, 1.8, 0]} castShadow>
              <coneGeometry args={[0.9, 2.2, 10]} />
              <meshStandardMaterial color="#2c5a3c" roughness={0.9} />
            </mesh>
          </group>
        )),
      )}
    </>
  );
}

function RoadLayout({ spec }: { spec: SceneSpec }) {
  const w = spec.roadWidth ?? 8;
  const half = w / 2;
  return (
    <>
      <Asphalt w={w} l={90} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * (half + 0.25), 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.2, 90]} />
            <meshStandardMaterial color="#6a6e74" roughness={0.9} />
          </mesh>
          <mesh position={[side * (half + 2.2), 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[3.4, 90]} />
            <meshStandardMaterial color="#55585c" roughness={0.95} />
          </mesh>
        </group>
      ))}
      <Roadside half={half} />
      {spec.layout === "railway" && (
        <>
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w, 3.6]} />
            <meshStandardMaterial color="#5a4a3a" roughness={1} />
          </mesh>
          {[-0.8, 0.8].map((z) => (
            <mesh key={z} position={[0, 0.16, z]}>
              <boxGeometry args={[70, 0.12, 0.12]} />
              <meshStandardMaterial color="#9aa0a6" metalness={0.7} roughness={0.4} />
            </mesh>
          ))}
          {Array.from({ length: 70 }, (_, i) => (
            <mesh key={i} position={[-34.5 + i, 0.08, 0]}>
              <boxGeometry args={[0.3, 0.08, 2.4]} />
              <meshStandardMaterial color="#4a3b2c" roughness={1} />
            </mesh>
          ))}
        </>
      )}
    </>
  );
}

function LotLayout() {
  return (
    <>
      <Asphalt w={38} l={28} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 20, 3, -6]} castShadow>
          <boxGeometry args={[4, 6, 14]} />
          <meshStandardMaterial color={s > 0 ? "#424851" : "#383c43"} roughness={0.85} />
        </mesh>
      ))}
    </>
  );
}

function RoundLayout() {
  return (
    <>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[4.6, 10.4, 56]} />
        <meshStandardMaterial color="#34373c" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.4, 4.6, 0.4, 40]} />
        <meshStandardMaterial color="#2c5a3c" roughness={1} />
      </mesh>
      {[
        [0, 17, 0],
        [0, -17, 0],
        [17, 0, Math.PI / 2],
        [-17, 0, Math.PI / 2],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.025, z]} rotation={[-Math.PI / 2, 0, r]} receiveShadow>
          <planeGeometry args={[6, 14]} />
          <meshStandardMaterial color="#34373c" roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}

function World({
  spec,
  clock,
  loop,
  period,
  autoRotate,
}: {
  spec: SceneSpec;
  clock: Clock;
  loop: boolean;
  period: number;
  autoRotate: boolean;
}) {
  const layout = spec.layout ?? "cross";
  const arms = spec.arms ?? ALL;
  const night = spec.env === "night";
  const fog = spec.env === "fog";
  const focus = spec.focus ?? [0, 0];
  return (
    <>
      {night && <color attach="background" args={["#060914"]} />}
      {fog && (
        <>
          <color attach="background" args={["#b6bfc6"]} />
          <fog attach="fog" args={["#b6bfc6", 6, 34]} />
        </>
      )}
      <ambientLight intensity={night ? 0.3 : fog ? 0.95 : 0.75} />
      <hemisphereLight args={[night ? "#5b6ea8" : "#bcd3ff", "#1b2418", night ? 0.25 : 0.6]} />
      <directionalLight
        position={[12, 20, 8]}
        intensity={night ? 0.6 : fog ? 1.1 : 2.1}
        color={night ? "#8fa8ff" : "#ffffff"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />
      <group rotation={[spec.tilt ?? 0, 0, 0]}>
        <Ground color={fog ? "#7b8a80" : "#1e2a20"} />
        {layout === "cross" && (
          <>
            <Asphalt w={6} l={6} />
            {arms.map((s) => (
              <Arm key={s} side={s} spec={spec} clock={clock} loop={loop} period={period} />
            ))}
            <Town />
          </>
        )}
        {(layout === "road" || layout === "railway") && <RoadLayout spec={spec} />}
        {layout === "lot" && <LotLayout />}
        {layout === "round" && <RoundLayout />}
        {spec.paint && <PaintView paint={spec.paint} />}
        {spec.cars.map((c) => (
          <Car key={c.id} car={c} clock={clock} loop={loop} period={period} />
        ))}
        {spec.props?.map((p, i) => (
          <PropView key={i} prop={p} clock={clock} loop={loop} period={period} />
        ))}
      </group>
      <OrbitControls
        enablePan={false}
        target={[focus[0], 0, focus[1]]}
        minDistance={10}
        maxDistance={42}
        maxPolarAngle={1.42}
        minPolarAngle={0.35}
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
        enableDamping
      />
    </>
  );
}

/* ---------- public view ---------- */

const RM = "(prefers-reduced-motion: reduce)";
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(RM);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(RM).matches,
    () => false,
  );
}

type ViewProps = {
  spec: SceneSpec;
  loop?: boolean;
  autoRotate?: boolean;
  controls?: boolean;
  className?: string;
  label: string;
  /** Test mode: cars drive to the stop line on mount and wait there until `released` is true. */
  gated?: boolean;
  released?: boolean;
};

export default function RoadSceneView({
  spec,
  loop = false,
  autoRotate = false,
  controls = true,
  className = "",
  label,
  gated = false,
  released = false,
}: ViewProps) {
  const { t } = useI18n();
  const [clock] = useState(() => new Clock());
  const reduced = useReducedMotion();
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    if (gated && !reduced) clock.start(true);
  }, [gated, reduced, clock]);

  useEffect(() => {
    if (gated && released) clock.release();
  }, [gated, released, clock]);

  const period = useMemo(() => {
    let max = 0;
    for (const c of spec.cars) {
      const run = c.free ? 9 : goTime(c) + 9;
      max = Math.max(max, run);
    }
    for (const p of spec.props ?? []) max = Math.max(max, routeDuration(p) + 2);
    return Math.max(max, 6) + 1.5;
  }, [spec]);

  const doLoop = loop && !reduced;
  const moves = spec.cars.length > 0 || !!spec.pedestrian || !!spec.props?.some((p) => p.route);

  const play = () => {
    clock.start(false);
    setPlayed(true);
  };
  const reset = () => {
    clock.reset();
    setPlayed(false);
  };

  return (
    <div className={`relative overflow-hidden bg-[#131209] ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: spec.camera ?? ((spec.layout ?? "cross") === "cross" ? [19, 17, 19] : spec.layout === "round" ? [22, 22, 22] : [26, 21, 17]), fov: 38 }}
        role="img"
        aria-label={label}
      >
        <World spec={spec} clock={clock} loop={doLoop} period={period} autoRotate={autoRotate && !reduced} />
      </Canvas>
      {(controls || gated) && moves && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <div className="pointer-events-auto flex gap-2">
            {gated ? (
              <button
                type="button"
                onClick={() => clock.start(false)}
                className="btn btn-primary"
                disabled={!released}
              >
                <Play weight="fill" size={18} aria-hidden />
                {t.scene.replaySolution}
              </button>
            ) : (
              <>
                <button type="button" onClick={play} className="btn btn-primary">
                  <Play weight="fill" size={18} aria-hidden />
                  {played ? t.scene.replay : t.scene.play}
                </button>
                <button type="button" onClick={reset} className="btn btn-ghost" disabled={!played}>
                  <ArrowCounterClockwise size={18} aria-hidden />
                  {t.scene.reset}
                </button>
              </>
            )}
          </div>
          <p className="hidden rounded-lg bg-black/60 px-2 py-1 text-xs text-[#9B9B9B] sm:block">{t.scene.hint}</p>
        </div>
      )}
    </div>
  );
}
