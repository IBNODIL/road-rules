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

/** Seconds after Play before cars are released, so they reach the stop line first. */
const RELEASE_DELAY = 3.2;

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

class Clock {
  t0: number | null = null;
  rel: number | null = null;
  gated = false;
  /** gated: hold the cars at the stop line until release() is called. */
  start(gated: boolean) {
    const now = performance.now() / 1000;
    this.t0 = now;
    this.gated = gated;
    this.rel = gated ? null : now + RELEASE_DELAY;
  }
  release() {
    if (this.t0 != null && this.rel == null) this.rel = performance.now() / 1000;
  }
  reset() {
    this.t0 = null;
    this.rel = null;
  }
}

function sceneTime(clock: Clock, loop: boolean, period: number) {
  const now = performance.now() / 1000;
  if (loop) {
    const t = now % period;
    return { t, tr: t - RELEASE_DELAY, tf: t };
  }
  if (clock.t0 == null) return { t: 0, tr: -1, tf: 0 };
  const t = now - clock.t0;
  const tr = clock.rel == null ? -1 : now - clock.rel;
  return { t, tr, tf: clock.gated ? tr : t };
}

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

function Light({ state }: { state: "red" | "yellow" | "green" }) {
  const lamps: [string, "red" | "yellow" | "green", number][] = [
    ["#ff2b2b", "red", 3.1],
    ["#ffbf1f", "yellow", 2.75],
    ["#2bd46b", "green", 2.4],
  ];
  return (
    <group>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 3.2, 10]} />
        <meshStandardMaterial color="#6d7176" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.75, 0.05]} castShadow>
        <boxGeometry args={[0.55, 1.2, 0.3]} />
        <meshStandardMaterial color="#15171a" roughness={0.6} />
      </mesh>
      {lamps.map(([c, name, y]) => (
        <mesh key={name} position={[0, y, 0.22]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color={state === name ? c : "#2a2d31"}
            emissive={state === name ? c : "#000"}
            emissiveIntensity={state === name ? 2.8 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

function Arm({ side, spec, clock, loop, period }: { side: Side; spec: SceneSpec; clock: Clock; loop: boolean; period: number }) {
  const a = mul(HEAD[side], -1);
  const theta = Math.atan2(a[0], a[1]);
  const sign = spec.signs?.filter((s) => s.side === side) ?? [];
  const light = spec.lights?.find((l) => l.side === side);
  const dashes = Array.from({ length: 6 }, (_, i) => 10 + i * 2.6);
  return (
    <group rotation={[0, theta, 0]}>
      <mesh position={[0, 0.02, 13]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 20]} />
        <meshStandardMaterial color="#34373c" roughness={0.95} />
      </mesh>
      {[-3.25, 3.25].map((x) => (
        <mesh key={x} position={[x, 0.1, 13]} receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.2, 20]} />
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

function World({ spec, clock, loop, period, autoRotate }: { spec: SceneSpec; clock: Clock; loop: boolean; period: number; autoRotate: boolean }) {
  const arms = spec.arms ?? ALL;
  return (
    <>
      <ambientLight intensity={0.75} />
      <hemisphereLight args={["#bcd3ff", "#1b2418", 0.6]} />
      <directionalLight
        position={[12, 20, 8]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[34, 48]} />
        <meshStandardMaterial color="#1e2a20" roughness={1} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#34373c" roughness={0.95} />
      </mesh>
      {arms.map((s) => (
        <Arm key={s} side={s} spec={spec} clock={clock} loop={loop} period={period} />
      ))}
      <Town />
      {spec.cars.map((c) => (
        <Car key={c.id} car={c} clock={clock} loop={loop} period={period} />
      ))}
      <OrbitControls
        enablePan={false}
        minDistance={14}
        maxDistance={38}
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
    return Math.max(max, 6) + 1.5;
  }, [spec]);

  const doLoop = loop && !reduced;

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
        camera={{ position: [19, 17, 19], fov: 38 }}
        role="img"
        aria-label={label}
      >
        <World spec={spec} clock={clock} loop={doLoop} period={period} autoRotate={autoRotate && !reduced} />
      </Canvas>
      {(controls || gated) && (
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
