"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Paint, Prop } from "@/lib/types";
import { Sign3D } from "./Sign3D";
import { CarModel } from "./Car3D";
import { Clock, sceneTime } from "./sceneClock";

/* ---------- routes ---------- */

export type Route = { pts: THREE.Vector3[]; cum: number[]; total: number };

export function buildRoute(points: [number, number][]): Route {
  const pts = points.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  return { pts, cum, total: cum[cum.length - 1] || 0.001 };
}

/** Seconds a moving prop needs to finish its route, counted from the moment it starts. */
export function routeDuration(p: Prop): number {
  if (!p.route || p.route.length < 2) return 0;
  return (p.delay ?? 0) + buildRoute(p.route).total / (p.speed ?? 4);
}

/* ---------- traffic light (also used by the junction arms) ---------- */

export function Light({ state }: { state: "red" | "yellow" | "green" }) {
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
          <meshStandardMaterial color={state === name ? c : "#2a2d31"} emissive={state === name ? c : "#000"} emissiveIntensity={state === name ? 2.8 : 0} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- small building blocks ---------- */

const Box = ({ s, p, c, r = 0.6, m = 0 }: { s: [number, number, number]; p: [number, number, number]; c: string; r?: number; m?: number }) => (
  <mesh position={p} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={r} metalness={m} />
  </mesh>
);

const Wheel = ({ x, y, z, r = 0.45, w = 0.3 }: { x: number; y: number; z: number; r?: number; w?: number }) => (
  <mesh position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
    <cylinderGeometry args={[r, r, w, 16]} />
    <meshStandardMaterial color="#111" roughness={0.9} />
  </mesh>
);

/** A flashing light. Colours alternate with the clock so it reads as a beacon. */
function Beacon({ at, a, b, speed = 8 }: { at: [number, number, number]; a: string; b: string; speed?: number }) {
  const ma = useRef<THREE.MeshStandardMaterial>(null);
  const mb = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const on = Math.sin((performance.now() / 1000) * speed) > 0;
    if (ma.current) ma.current.emissiveIntensity = on ? 4 : 0.2;
    if (mb.current) mb.current.emissiveIntensity = on ? 0.2 : 4;
  });
  return (
    <group position={at}>
      <mesh position={[-0.35, 0, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.3]} />
        <meshStandardMaterial ref={ma} color={a} emissive={a} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.35, 0, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.3]} />
        <meshStandardMaterial ref={mb} color={b} emissive={b} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

/** Slow flashing amber warning light for work vehicles. */
function Amber({ at }: { at: [number, number, number] }) {
  const m = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (m.current) m.current.emissiveIntensity = Math.sin((performance.now() / 1000) * 6) > 0 ? 4 : 0.2;
  });
  return (
    <mesh position={at}>
      <boxGeometry args={[0.6, 0.25, 0.4]} />
      <meshStandardMaterial ref={m} color="#ff9500" emissive="#ff9500" emissiveIntensity={2} />
    </mesh>
  );
}

function Hazard({ at, width = 1.6 }: { at: [number, number, number]; width?: number }) {
  const m1 = useRef<THREE.MeshStandardMaterial>(null);
  const m2 = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const v = Math.sin((performance.now() / 1000) * 9) > 0 ? 3 : 0.1;
    if (m1.current) m1.current.emissiveIntensity = v;
    if (m2.current) m2.current.emissiveIntensity = v;
  });
  return (
    <group position={at}>
      {[-width / 2, width / 2].map((x, i) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.22, 0.16, 0.12]} />
          <meshStandardMaterial ref={i ? m2 : m1} color="#ffb000" emissive="#ffb000" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

function Beams({ color = "#fff3c4" }: { color?: string }) {
  return (
    <group>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.7, 5.2]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.5, 7, 20, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- vehicles ---------- */

function Truck({ color, load }: { color: string; load?: [number, number, number] }) {
  const [w, h, l] = load ?? [2.5, 2.6, 5.5];
  return (
    <group>
      <Box s={[2.4, 1.9, 2]} p={[0, 1.35, 3]} c="#e8ecf0" r={0.4} />
      <Box s={[2.3, 0.7, 0.1]} p={[0, 1.8, 4.03]} c="#14181d" r={0.1} m={0.6} />
      <Box s={[w, h, l]} p={[0, 0.5 + h / 2 + 0.2, -0.4]} c={color} />
      <Box s={[2.3, 0.3, 8.5]} p={[0, 0.5, 0.2]} c="#3a3d42" />
      {[-1.2, 1.2].flatMap((x) => [3, 0.4, -2.2].map((z) => <Wheel key={`${x}${z}`} x={x} y={0.5} z={z} r={0.55} w={0.4} />))}
    </group>
  );
}

function Bus({ color }: { color: string }) {
  return (
    <group>
      <Box s={[2.6, 3, 9.5]} p={[0, 1.9, 0]} c={color} r={0.4} />
      {[-1.31, 1.31].map((x) => (
        <Box key={x} s={[0.05, 1, 8.4]} p={[x, 2.4, 0]} c="#14181d" r={0.1} m={0.6} />
      ))}
      <Box s={[2.3, 1.1, 0.05]} p={[0, 2.35, 4.78]} c="#14181d" r={0.1} m={0.6} />
      {[-1.25, 1.25].flatMap((x) => [3.2, -3].map((z) => <Wheel key={`${x}${z}`} x={x} y={0.5} z={z} r={0.55} w={0.4} />))}
    </group>
  );
}

function Tram() {
  return (
    <group>
      <Box s={[2.6, 3.2, 15]} p={[0, 2.1, 0]} c="#c9302c" r={0.4} />
      <Box s={[2.62, 0.9, 15.02]} p={[0, 0.9, 0]} c="#e9e9e9" r={0.4} />
      {[-1.31, 1.31].map((x) => (
        <Box key={x} s={[0.05, 1.1, 13.4]} p={[x, 2.5, 0]} c="#14181d" r={0.1} m={0.6} />
      ))}
      <Box s={[1.4, 0.1, 1.2]} p={[0, 3.8, 0]} c="#555" />
      <Beacon at={[0, 3.9, 7.55]} a="#ffffff" b="#ffffff" speed={0} />
    </group>
  );
}

function Train() {
  return (
    <group>
      {[-13, 0, 13].map((z, i) => (
        <group key={z} position={[0, 0, z]}>
          <Box s={[3, 3.5, 12]} p={[0, 2.4, 0]} c={i === 2 ? "#2b4a8a" : "#4b5563"} r={0.5} />
          <Box s={[3.02, 0.7, 12.02]} p={[0, 1.1, 0]} c="#1f2937" />
          {[-1, 1].map((x) => (
            <Box key={x} s={[0.05, 1, 10]} p={[x * 1.51, 2.9, 0]} c="#14181d" r={0.1} m={0.6} />
          ))}
        </group>
      ))}
    </group>
  );
}

function Ambulance() {
  return (
    <group>
      <Box s={[2.1, 2.4, 5.2]} p={[0, 1.6, 0]} c="#f4f6f8" r={0.35} />
      <Box s={[2.12, 0.35, 5.22]} p={[0, 1.4, 0]} c="#d4202a" r={0.4} />
      <Box s={[1.9, 0.8, 0.05]} p={[0, 2.2, 2.62]} c="#14181d" r={0.1} m={0.6} />
      {[-0.95, 0.95].flatMap((x) => [1.6, -1.6].map((z) => <Wheel key={`${x}${z}`} x={x} y={0.45} z={z} />))}
      <Beacon at={[0, 3, 1.6]} a="#2f6fdc" b="#d4202a" />
    </group>
  );
}

function Tractor() {
  return (
    <group>
      <Box s={[1.6, 1.3, 2.4]} p={[0, 1.4, 0.4]} c="#2e9e62" />
      <Box s={[1.5, 1.4, 1.4]} p={[0, 2.5, -0.4]} c="#d9e3dc" r={0.3} />
      <Box s={[1.4, 0.8, 1.5]} p={[0, 1.1, 1.9]} c="#2e9e62" />
      {[-0.95, 0.95].map((x) => (
        <Wheel key={x} x={x} y={0.8} z={-0.6} r={0.8} w={0.5} />
      ))}
      {[-0.7, 0.7].map((x) => (
        <Wheel key={x} x={x} y={0.45} z={1.9} r={0.45} w={0.3} />
      ))}
      <Amber at={[0, 3.4, -0.4]} />
    </group>
  );
}

/* ---------- people and light vehicles ---------- */

function Person({ kind, color, gesture }: { kind: "person" | "child" | "blind" | "officer"; color?: string; gesture?: "out" | "fwd" | "up" }) {
  const s = kind === "child" ? 0.62 : 1;
  const body = kind === "officer" ? "#3b4a63" : (color ?? "#ffb000");
  return (
    <group scale={s}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.7, 6, 12]} />
        <meshStandardMaterial color={body} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#e8b894" roughness={0.7} />
      </mesh>
      {kind === "officer" && (
        <>
          <mesh position={[0, 1.58, 0]}>
            <cylinderGeometry args={[0.24, 0.26, 0.12, 14]} />
            <meshStandardMaterial color="#1c2432" />
          </mesh>
          {gesture === "up" && <Box s={[0.12, 0.9, 0.12]} p={[0.3, 1.5, 0]} c="#3b4a63" />}
          {gesture === "out" && <Box s={[1.5, 0.12, 0.12]} p={[0, 1.15, 0]} c="#3b4a63" />}
          {gesture === "fwd" && (
            <>
              <Box s={[0.12, 0.12, 0.9]} p={[0.3, 1.15, 0.45]} c="#3b4a63" />
              <Box s={[0.12, 0.12, 0.5]} p={[-0.3, 1.0, 0]} c="#3b4a63" />
            </>
          )}
          <Box s={[0.05, 0.4, 0.05]} p={[0, 0.8, 0.24]} c="#ffffff" />
        </>
      )}
      {kind === "blind" && <Box s={[0.04, 1, 0.04]} p={[0.35, 0.5, 0.4]} c="#f4f4f4" />}
    </group>
  );
}

function Bike({ kind }: { kind: "cyclist" | "scooter" | "motorbike" }) {
  const r = kind === "scooter" ? 0.18 : kind === "motorbike" ? 0.4 : 0.38;
  const len = kind === "scooter" ? 0.45 : kind === "motorbike" ? 0.75 : 0.55;
  return (
    <group>
      {[len, -len].map((z) => (
        <mesh key={z} position={[0, r, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[r, 0.05, 8, 20]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}
      <Box s={[0.06, 0.06, len * 2]} p={[0, r + 0.25, 0]} c={kind === "motorbike" ? "#2f6fdc" : "#ffb000"} />
      {kind === "scooter" ? (
        <Box s={[0.06, 1, 0.06]} p={[0, 0.7, len - 0.05]} c="#cfd3d8" />
      ) : (
        <Box s={[0.5, 0.06, 0.06]} p={[0, r + 0.65, len - 0.1]} c="#222" />
      )}
      <group position={[0, kind === "scooter" ? 0.2 : 0.35, kind === "scooter" ? -0.1 : -0.05]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.55, 6, 10]} />
          <meshStandardMaterial color={kind === "motorbike" ? "#222" : "#d4202a"} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <sphereGeometry args={[kind === "motorbike" ? 0.24 : 0.2, 14, 14]} />
          <meshStandardMaterial color={kind === "motorbike" ? "#111" : "#e8b894"} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- static things ---------- */

function Triangle() {
  const shape = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0.9);
    sh.lineTo(0.5, 0);
    sh.lineTo(-0.5, 0);
    sh.closePath();
    return sh;
  }, []);
  return (
    <group position={[0, 0.05, 0]}>
      <mesh rotation={[0, 0, 0]}>
        <extrudeGeometry args={[shape, { depth: 0.06, bevelEnabled: false }]} />
        <meshStandardMaterial color="#d4202a" emissive="#d4202a" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0.3, 0.07]} scale={0.55}>
        <extrudeGeometry args={[shape, { depth: 0.02, bevelEnabled: false }]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Cone() {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <coneGeometry args={[0.28, 0.7, 14]} />
        <meshStandardMaterial color="#ff6a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.17, 0.2, 0.1, 14]} />
        <meshStandardMaterial color="#f2f2f2" />
      </mesh>
    </group>
  );
}

function Barrier({ state }: { state: "down" | "up" }) {
  const arm = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!arm.current) return;
    const target = state === "down" ? 0 : -1.2;
    arm.current.rotation.z += (target - arm.current.rotation.z) * Math.min(1, dt * 3);
  });
  return (
    <group>
      <Box s={[0.4, 1.2, 0.4]} p={[0, 0.6, 0]} c="#3a3d42" />
      <group ref={arm} position={[0, 1.2, 0]}>
        {Array.from({ length: 8 }, (_, i) => (
          <Box key={i} s={[0.7, 0.14, 0.14]} p={[0.35 + i * 0.7, 0, 0]} c={i % 2 ? "#ffffff" : "#d4202a"} />
        ))}
      </group>
    </group>
  );
}

function Lamp({ state }: { state: "red" | "yellow" | "green" }) {
  return <Light state={state} />;
}

/** Top down cut away of a car cabin with seats, people and belts. */
function Cabin({ seats }: { seats: Prop["seats"] }) {
  const pos: [number, number][] = [
    [0.55, 0.9],
    [-0.55, 0.9],
    [0.55, -0.7],
    [0, -0.7],
    [-0.55, -0.7],
  ];
  return (
    <group scale={2.1}>
      <Box s={[1.6, 0.1, 3.2]} p={[0, 0.3, 0]} c="#2a2d31" />
      <Box s={[0.1, 0.5, 3.2]} p={[0.85, 0.5, 0]} c="#ffb000" />
      <Box s={[0.1, 0.5, 3.2]} p={[-0.85, 0.5, 0]} c="#ffb000" />
      <Box s={[1.6, 0.5, 0.1]} p={[0, 0.5, 1.65]} c="#ffb000" />
      <Box s={[1.6, 0.5, 0.1]} p={[0, 0.5, -1.65]} c="#ffb000" />
      <Box s={[1.4, 0.1, 0.4]} p={[0, 0.5, 1.2]} c="#15171a" />
      <mesh position={[0.55, 0.62, 1.05]} rotation={[-1.1, 0, 0]}>
        <torusGeometry args={[0.2, 0.025, 8, 20]} />
        <meshStandardMaterial color="#0c0d0f" />
      </mesh>
      {pos.map(([x, z], i) => {
        const s = seats?.[i] ?? "empty";
        return (
          <group key={i} position={[x, 0.35, z]}>
            <Box s={[0.45, 0.2, 0.45]} p={[0, 0.1, 0]} c="#3a3f47" />
            <Box s={[0.45, 0.5, 0.1]} p={[0, 0.4, -0.25]} c="#3a3f47" />
            {s !== "empty" && (
              <group scale={s === "child" || s === "childseat" ? 0.6 : 1} position={[0, 0.1, 0.03]}>
                <mesh position={[0, 0.45, 0]} castShadow>
                  <capsuleGeometry args={[0.15, 0.3, 6, 10]} />
                  <meshStandardMaterial color={i === 0 ? "#2f6fdc" : "#e8e8e8"} roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.88, 0]}>
                  <sphereGeometry args={[0.13, 14, 14]} />
                  <meshStandardMaterial color="#e8b894" />
                </mesh>
                {(s === "belt" || s === "childseat") && (
                  <mesh position={[0.02, 0.5, 0.16]} rotation={[0, 0, 0.6]}>
                    <boxGeometry args={[0.04, 0.55, 0.03]} />
                    <meshStandardMaterial color="#d4202a" emissive="#d4202a" emissiveIntensity={0.5} />
                  </mesh>
                )}
                {s === "childseat" && <Box s={[0.5, 0.25, 0.5]} p={[0, 0.15, 0]} c="#ffb000" />}
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ---------- labels and dimensions ---------- */

function Tag({ text, y = 2.4 }: { text: string; y?: number }) {
  return (
    <Html position={[0, y, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div className="whitespace-nowrap rounded-lg border-2 border-black bg-[#FFB800] px-2 py-1 text-sm font-semibold text-black shadow-lg">{text}</div>
    </Html>
  );
}

function Dim({ a, b, text }: { a: [number, number]; b: [number, number]; text?: string }) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz) || 0.01;
  const yaw = Math.atan2(dx, dz);
  return (
    <group position={[a[0], 0.12, a[1]]} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0, len / 2]}>
        <boxGeometry args={[0.12, 0.05, len]} />
        <meshStandardMaterial color="#ffb000" emissive="#ffb000" emissiveIntensity={0.8} />
      </mesh>
      {[0, len].map((z) => (
        <mesh key={z} position={[0, 0.05, z]}>
          <boxGeometry args={[1, 0.05, 0.1]} />
          <meshStandardMaterial color="#ffb000" emissive="#ffb000" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {text && (
        <Html position={[0, 0.8, len / 2]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-lg border-2 border-black bg-[#FFB000] px-2 py-1 text-sm font-semibold text-black shadow-lg">{text}</div>
        </Html>
      )}
    </group>
  );
}

function Rope({ a, b }: { a: [number, number]; b: [number, number] }) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz) || 0.01;
  return (
    <group position={[a[0], 0.6, a[1]]} rotation={[0, Math.atan2(dx, dz), 0]}>
      <mesh position={[0, 0, len / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, len, 8]} />
        <meshStandardMaterial color="#d4202a" />
      </mesh>
      <Box s={[0.35, 0.3, 0.02]} p={[0, 0.2, len / 2]} c="#ffffff" />
    </group>
  );
}

/* ---------- paint ---------- */

export function PaintView({ paint }: { paint: Paint[] }) {
  return (
    <>
      {paint.map((p, i) => (
        <mesh key={i} position={[p.x, 0.045, p.z]} rotation={[-Math.PI / 2, 0, p.rot ?? 0]}>
          <planeGeometry args={[p.w, p.l]} />
          <meshStandardMaterial color={p.color ?? "#f2f2f2"} roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

/* ---------- one prop ---------- */

const VEHICLE = new Set(["car", "truck", "bus", "tram", "ambulance", "police", "tractor", "train"]);

export function PropView({ prop, clock, loop, period }: { prop: Prop; clock: Clock; loop: boolean; period: number }) {
  const g = useRef<THREE.Group>(null);
  const route = useMemo(() => (prop.route && prop.route.length >= 2 ? buildRoute(prop.route) : null), [prop.route]);
  const speed = prop.speed ?? 4;

  useFrame(() => {
    const grp = g.current;
    if (!grp || !route) return;
    const { tf } = sceneTime(clock, loop, period);
    let s = Math.max(0, tf - (prop.delay ?? 0)) * speed;
    s = prop.loop ? s % route.total : Math.min(s, route.total);
    let i = 1;
    while (i < route.cum.length - 1 && route.cum[i] < s) i++;
    const a = route.pts[i - 1];
    const b = route.pts[i];
    const seg = route.cum[i] - route.cum[i - 1] || 1;
    const k = (s - route.cum[i - 1]) / seg;
    grp.position.set(a.x + (b.x - a.x) * k, 0, a.z + (b.z - a.z) * k);
    grp.rotation.y = Math.atan2(b.x - a.x, b.z - a.z) + (prop.reverse ? Math.PI : 0);
    if (!VEHICLE.has(prop.kind) && s > 0 && s < route.total) grp.position.y = Math.abs(Math.sin(s * 3.2)) * 0.06;
  });

  const k = prop.kind;
  if (k === "dim") return <Dim a={[prop.x, prop.z]} b={prop.to ?? [prop.x, prop.z + 1]} text={prop.text} />;
  if (k === "rope") return <Rope a={[prop.x, prop.z]} b={prop.to ?? [prop.x, prop.z + 4]} />;

  const start = route ? route.pts[0] : null;
  const pos: [number, number, number] = start ? [start.x, prop.y ?? 0, start.z] : [prop.x, prop.y ?? 0, prop.z];
  let rot = prop.rot ?? 0;
  if (route) rot = Math.atan2(route.pts[1].x - route.pts[0].x, route.pts[1].z - route.pts[0].z);
  if (prop.reverse) rot += Math.PI;

  return (
    <group ref={g} position={pos} rotation={[0, rot, 0]}>
      {k === "car" && (
        <>
          <group scale={1.28}>
            <CarModel color={prop.color ?? "#6b7d8f"} blink={prop.signal} />
          </group>
          {prop.signal === "hazard" && <Hazard at={[0, 0.9, 2.1]} />}
          {prop.beams && <Beams />}
        </>
      )}
      {prop.towLength ? (
        <mesh position={[0, 0.6, 2.1 + prop.towLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, prop.towLength, 8]} />
          <meshStandardMaterial color="#d4202a" />
        </mesh>
      ) : null}
      {k === "police" && (
        <>
          <group scale={1.28}>
            <CarModel color="#eef2f6" />
          </group>
          <Beacon at={[0, 2.15, 0]} a="#2f6fdc" b="#d4202a" />
          <Box s={[0.05, 0.4, 3.2]} p={[0.99, 0.9, 0]} c="#2f6fdc" />
          <Box s={[0.05, 0.4, 3.2]} p={[-0.99, 0.9, 0]} c="#2f6fdc" />
        </>
      )}
      {k === "truck" && (
        <>
          <Truck color={prop.color ?? "#6b7d8f"} load={prop.size} />
          {prop.signal === "hazard" && <Hazard at={[0, 1, 4.1]} width={2} />}
          {prop.text === "amber" && <Amber at={[0, 3.6, 3]} />}
        </>
      )}
      {k === "bus" && <Bus color={prop.color ?? "#f2a516"} />}
      {k === "tram" && <Tram />}
      {k === "train" && <Train />}
      {k === "ambulance" && <Ambulance />}
      {k === "tractor" && <Tractor />}
      {(k === "person" || k === "child" || k === "blind" || k === "officer") && <Person kind={k} color={prop.color} gesture={prop.gesture} />}
      {(k === "cyclist" || k === "scooter" || k === "motorbike") && <Bike kind={k} />}
      {k === "cone" && <Cone />}
      {k === "triangle" && <Triangle />}
      {k === "barrier" && <Barrier state={prop.state === "up" ? "up" : "down"} />}
      {k === "lamp" && <Lamp state={prop.state === "red" || prop.state === "yellow" || prop.state === "green" ? prop.state : "red"} />}
      {k === "sign" && prop.sign && <Sign3D type={prop.sign} scale={0.95} />}
      {k === "box" && <Box s={prop.size ?? [1, 1, 1]} p={[0, (prop.size?.[1] ?? 1) / 2, 0]} c={prop.color ?? "#a67c52"} />}
      {k === "building" && <Box s={prop.size ?? [7, 5, 7]} p={[0, (prop.size?.[1] ?? 5) / 2, 0]} c={prop.color ?? "#424851"} r={0.85} />}
      {k === "tree" && (
        <>
          <Box s={[0.3, 1.2, 0.3]} p={[0, 0.6, 0]} c="#5b4630" />
          <mesh position={[0, 2.1, 0]} castShadow>
            <coneGeometry args={[1, 2.4, 10]} />
            <meshStandardMaterial color="#2c5a3c" roughness={0.9} />
          </mesh>
        </>
      )}
      {k === "cabin" && <Cabin seats={prop.seats} />}
      {k === "label" && <Tag text={prop.text ?? ""} y={prop.size?.[1] ?? 0.4} />}
      {k !== "label" && k !== "tree" && k !== "cone" && prop.text && k !== "car" && k !== "truck" && <Tag text={prop.text === "amber" ? "" : prop.text} y={k === "bus" || k === "tram" || k === "train" ? 4.4 : 3.4} />}
      {k === "car" && prop.text && <Tag text={prop.text} y={2.8} />}
      {k === "truck" && prop.text && prop.text !== "amber" && <Tag text={prop.text} y={4.4} />}
    </group>
  );
}
