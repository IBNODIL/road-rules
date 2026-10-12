"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* Cars built in Blender (scripts/blender/make_cars.py). The node names below are part of that script's contract. */

export type CarKind = "sedan" | "hatch" | "suv" | "van";
export const carKinds: CarKind[] = ["sedan", "hatch", "suv", "van"];
export const carPaint: Record<CarKind, string> = { sedan: "#e6a000", hatch: "#2a66bf", suv: "#b3201f", van: "#e1e1e6" };
const WHEEL_R: Record<CarKind, number> = { sedan: 0.31, hatch: 0.3, suv: 0.37, van: 0.33 };
const url = (k: CarKind) => `/models/${k}.glb`;
carKinds.forEach((k) => useGLTF.preload(url(k)));

export type Signal = 0 | 1 | 2 | 3; // off, left, right, hazard

export type CarRig = {
  root: THREE.Group;
  wheelR: number;
  wheels: THREE.Object3D[];
  steerFront: THREE.Object3D[];
  steeringWheel: THREE.Object3D | null;
  stalk: THREE.Object3D | null;
  eye: THREE.Vector3;
  mirrorRear: THREE.Vector3;
  mirrorL: THREE.Vector3;
  mirrorR: THREE.Vector3;
  lamps: Record<string, THREE.MeshStandardMaterial[]>;
  /** Spin, steer and light the car. dist is the signed distance rolled since the last call. */
  update: (s: { dist: number; steer: number; signal: Signal; blink: boolean; braking: boolean; reversing: boolean }) => void;
};

const INTERIOR = /^(Int_|SteeringWheel|StalkMesh|Ind_)/;

function lampMats(root: THREE.Object3D, name: string): THREE.MeshStandardMaterial[] {
  const out: THREE.MeshStandardMaterial[] = [];
  root.traverse((o) => {
    if (o.name !== name) return;
    o.traverse((c) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && "emissive" in m) out.push(m);
    });
  });
  return out;
}

const glow = (mats: THREE.MeshStandardMaterial[] | undefined, v: number) => {
  if (mats) for (const m of mats) m.emissiveIntensity = v;
};

/** Clones the loaded scene, recolours the paint, gives each lamp its own material and finds the moving parts. */
export function rigCar(source: THREE.Object3D, kind: CarKind, color: string, layers: boolean): CarRig {
  const root = clone(source) as THREE.Group;
  const paint = new THREE.Color(color);
  const wheels: THREE.Object3D[] = [];
  const steerFront: THREE.Object3D[] = [];
  let steeringWheel: THREE.Object3D | null = null;
  let stalk: THREE.Object3D | null = null;

  root.traverse((o) => {
    // a multi-material mesh loads as a group with same-named children, so only take the outer node
    const dup = o.parent?.name === o.name;
    if (dup) {
      // fall through to the mesh setup below
    } else if (/^Wheel_/.test(o.name)) wheels.push(o);
    else if (/^Steer_/.test(o.name)) steerFront.push(o);
    else if (o.name === "SteeringWheel") steeringWheel = o;
    else if (o.name === "Stalk") stalk = o;

    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    // every mesh owns its materials so each lamp can glow alone
    const own = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((m) => {
      const c = (m as THREE.MeshStandardMaterial).clone();
      if (c.name === "Paint") c.color.copy(paint);
      if (c.name === "Glass") {
        c.transparent = true;
        c.opacity = 0.2;
        c.depthWrite = false;
        c.side = THREE.DoubleSide;
      }
      return c;
    });
    mesh.material = Array.isArray(mesh.material) ? own : own[0];
    const inside = INTERIOR.test(mesh.name) || INTERIOR.test(mesh.parent?.name ?? "");
    mesh.castShadow = /^(Body|Roof|Wheel_)/.test(mesh.name) || /^Wheel_/.test(mesh.parent?.name ?? "");
    mesh.receiveShadow = !inside;
    if (layers) mesh.layers.set(inside ? 2 : 1);
  });

  root.updateMatrixWorld(true);
  const at = (name: string) => {
    const n = root.getObjectByName(name);
    return n ? n.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3();
  };

  const names = ["Head_L", "Head_R", "Tail_L", "Tail_R", "Rev_L", "Rev_R", "Sig_FL", "Sig_FR", "Sig_RL", "Sig_RR", "Sig_SL", "Sig_SR", "Ind_L", "Ind_R"];
  const lamps: Record<string, THREE.MeshStandardMaterial[]> = {};
  for (const n of names) lamps[n] = lampMats(root, n);
  // set the glow colours here so a lamp lights whatever the exporter wrote
  const tint: [string[], string][] = [
    [["Head_L", "Head_R"], "#fff2cc"],
    [["Tail_L", "Tail_R"], "#ff1010"],
    [["Rev_L", "Rev_R"], "#ffffff"],
    [["Sig_FL", "Sig_FR", "Sig_RL", "Sig_RR", "Sig_SL", "Sig_SR"], "#ff8a00"],
    [["Ind_L", "Ind_R"], "#22ff44"],
  ];
  for (const [ns, c] of tint) for (const n of ns) for (const m of lamps[n]) m.emissive.set(c);
  glow(lamps.Head_L, 0.6);
  glow(lamps.Head_R, 0.6);

  let spin = 0;
  const rig: CarRig = {
    root,
    wheelR: WHEEL_R[kind],
    wheels,
    steerFront,
    steeringWheel,
    stalk,
    eye: at("Eye"),
    mirrorRear: at("MirrorRear"),
    mirrorL: at("MirrorL"),
    mirrorR: at("MirrorR"),
    lamps,
    update: ({ dist, steer, signal, blink, braking, reversing }) => {
      spin += dist / WHEEL_R[kind];
      for (const w of wheels) w.rotation.x = spin;
      for (const p of steerFront) p.rotation.y = steer;
      // left turn is counter-clockwise for the driver, whose view runs along local -Z
      if (steeringWheel) steeringWheel.rotation.z = -steer * 6;
      if (stalk) stalk.rotation.x = signal === 1 ? -0.3 : signal === 2 ? 0.3 : 0;
      const left = (signal === 1 || signal === 3) && blink;
      const right = (signal === 2 || signal === 3) && blink;
      for (const n of ["Sig_FL", "Sig_RL", "Sig_SL", "Ind_L"]) glow(lamps[n], left ? 3 : 0);
      for (const n of ["Sig_FR", "Sig_RR", "Sig_SR", "Ind_R"]) glow(lamps[n], right ? 3 : 0);
      for (const n of ["Tail_L", "Tail_R"]) glow(lamps[n], braking ? 2.6 : 0.35);
      for (const n of ["Rev_L", "Rev_R"]) glow(lamps[n], reversing ? 2.5 : 0);
    },
  };
  return rig;
}

export function useCar(kind: CarKind, color: string, layers = false): CarRig {
  const gltf = useGLTF(url(kind));
  return useMemo(() => rigCar(gltf.scene, kind, color, layers), [gltf.scene, kind, color, layers]);
}

/**
 * A parked car for the scenery. The player never sees its cabin, so the interior is dropped and every remaining
 * mesh is merged per material, which turns about 55 draw calls into about 12.
 */
function staticCar(source: THREE.Object3D, color: string): THREE.Group {
  source.updateMatrixWorld(true);
  const byMat = new Map<string, { mat: THREE.Material; geos: THREE.BufferGeometry[] }>();
  source.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || INTERIOR.test(mesh.name) || INTERIOR.test(mesh.parent?.name ?? "")) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const groups = mesh.geometry.groups.length ? mesh.geometry.groups : [{ start: 0, count: Infinity, materialIndex: 0 }];
    mats.forEach((m, i) => {
      for (const g of groups.filter((x) => (x.materialIndex ?? 0) === i)) {
        const geo = mesh.geometry.clone();
        geo.clearGroups();
        for (const k of Object.keys(geo.attributes)) if (k !== "position" && k !== "normal") geo.deleteAttribute(k);
        if (!geo.index) geo.setIndex([...Array(geo.attributes.position.count).keys()]);
        if (mats.length > 1 || g.count !== Infinity) {
          const idx = geo.index!.array;
          const end = Math.min(g.start + g.count, idx.length);
          geo.setIndex(Array.from(idx.slice(g.start, end)));
        }
        geo.applyMatrix4(mesh.matrixWorld);
        const entry = byMat.get(m.name) ?? { mat: m, geos: [] };
        entry.geos.push(geo);
        byMat.set(m.name, entry);
      }
    });
  });
  const root = new THREE.Group();
  for (const { mat, geos } of byMat.values()) {
    const m = (mat as THREE.MeshStandardMaterial).clone();
    if (m.name === "Paint") m.color.set(color);
    if (m.name === "Glass") {
      m.transparent = true;
      m.opacity = 0.2;
      m.depthWrite = false;
      m.side = THREE.DoubleSide;
    }
    const mesh = new THREE.Mesh(mergeGeometries(geos, false), m);
    mesh.castShadow = m.name === "Paint" || m.name === "Tire";
    mesh.receiveShadow = true;
    root.add(mesh);
  }
  return root;
}

/** A parked car. Wheels are straight and the lamps are off. */
export function StaticCar({ kind, color }: { kind: CarKind; color: string }) {
  const gltf = useGLTF(url(kind));
  const car = useMemo(() => staticCar(gltf.scene, color), [gltf.scene, color]);
  return <primitive object={car} />;
}
