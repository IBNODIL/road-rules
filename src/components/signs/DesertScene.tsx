"use client";

/* The scene mutates three.js objects every frame; the React Compiler lint rules for
   immutability and render-time refs do not fit that imperative style. */
/* eslint-disable react-hooks/immutability, react-hooks/refs */

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { UZ_SIGNS } from "@/lib/uzSigns";
import { SECONDS_PER_HOUR, START_HOUR, sceneStore } from "./sceneStore";

const TILE = 120;
const ROAD_HALF = 3.8;
const SIGN_SPACING = 26;
const BASE_SPEED = 12;

const smooth = THREE.MathUtils.smoothstep;
const lerp = THREE.MathUtils.lerp;

/** Shared with every part of the scene: how fast the world is rolling past, in m/s. */
const motion = { speed: BASE_SPEED, reduced: false };

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Dune height. Periodic along x so tiles join seamlessly, and flat beside the road. */
function heightAt(x: number, z: number) {
  const w = Math.abs(z);
  const edge = smooth(w, 7, 24);
  const k = (Math.PI * 2) / TILE;
  const dunes =
    Math.sin(k * x + z * 0.06) * 2.4 + Math.sin(k * 2 * x - z * 0.09 + 1.3) * 1.4 + Math.sin(k * 3 * x + z * 0.17) * 0.6;
  const ripples = Math.sin(k * 19 * x + z * 0.5) * 0.05;
  return (dunes * (0.55 + 0.45 * smooth(w, 12, 60)) + ripples) * edge;
}

function useInstances(
  ref: React.RefObject<THREE.InstancedMesh | null>,
  items: { p: [number, number, number]; s: [number, number, number]; r?: number; c?: THREE.Color }[],
) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    items.forEach((it, i) => {
      q.setFromEuler(new THREE.Euler(0, it.r ?? 0, 0));
      m.compose(new THREE.Vector3(...it.p), q, new THREE.Vector3(...it.s));
      mesh.setMatrixAt(i, m);
      if (it.c) mesh.setColorAt(i, it.c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [ref, items]);
}

/* ------------------------------------------------------------------ world */

function Tile() {
  const terrain = useMemo(() => {
    const g = new THREE.PlaneGeometry(TILE, 170, 120, 85);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const normals = new Float32Array(pos.count * 3);
    const e = 0.5;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, heightAt(x, z));
      const dx = heightAt(x + e, z) - heightAt(x - e, z);
      const dz = heightAt(x, z + e) - heightAt(x, z - e);
      const n = new THREE.Vector3(-dx, 2 * e, -dz).normalize();
      normals.set([n.x, n.y, n.z], i * 3);
    }
    g.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    return g;
  }, []);

  const scenery = useMemo(() => {
    const rnd = mulberry32(7);
    const pickZ = (min: number, max: number) => (rnd() < 0.5 ? -1 : 1) * (min + rnd() * (max - min));
    const shrubs = Array.from({ length: 60 }, () => {
      const x = (rnd() - 0.5) * TILE;
      const z = pickZ(8, 60);
      const s = 0.5 + rnd() * 1.1;
      return {
        p: [x, heightAt(x, z) + 0.15 * s, z] as [number, number, number],
        s: [s * 1.2, s * 0.7, s * 1.2] as [number, number, number],
        r: rnd() * 6,
        c: new THREE.Color().setHSL(0.14 + rnd() * 0.05, 0.28, 0.28 + rnd() * 0.1),
      };
    });
    const rocks = Array.from({ length: 36 }, () => {
      const x = (rnd() - 0.5) * TILE;
      const z = pickZ(6, 50);
      const s = 0.25 + rnd() * 0.8;
      return {
        p: [x, heightAt(x, z) + 0.1 * s, z] as [number, number, number],
        s: [s * 1.3, s * 0.8, s] as [number, number, number],
        r: rnd() * 6,
        c: new THREE.Color().setHSL(0.08 + rnd() * 0.03, 0.2, 0.32 + rnd() * 0.12),
      };
    });
    const dashes = Array.from({ length: 20 }, (_, i) => ({
      p: [-TILE / 2 + i * 6 + 3, 0.05, 0] as [number, number, number],
      s: [2.8, 0.02, 0.2] as [number, number, number],
    }));
    const posts = Array.from({ length: 20 }, (_, i) => ({
      p: [-TILE / 2 + (i >> 1) * 12 + 2, 0.45, i % 2 ? ROAD_HALF + 0.7 : -ROAD_HALF - 0.7] as [number, number, number],
      s: [0.14, 0.9, 0.14] as [number, number, number],
    }));
    return { shrubs, rocks, dashes, posts };
  }, []);

  const shrubRef = useRef<THREE.InstancedMesh>(null);
  const rockRef = useRef<THREE.InstancedMesh>(null);
  const dashRef = useRef<THREE.InstancedMesh>(null);
  const postRef = useRef<THREE.InstancedMesh>(null);
  useInstances(shrubRef, scenery.shrubs);
  useInstances(rockRef, scenery.rocks);
  useInstances(dashRef, scenery.dashes);
  useInstances(postRef, scenery.posts);

  const poleXs = [-45, -15, 15, 45];

  return (
    <group>
      <mesh geometry={terrain} receiveShadow>
        <meshStandardMaterial color="#cba46a" roughness={1} />
      </mesh>

      {/* road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[TILE, ROAD_HALF * 2]} />
        <meshStandardMaterial color="#2a2a2d" roughness={0.92} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, s * (ROAD_HALF - 0.3)]}>
          <planeGeometry args={[TILE, 0.14]} />
          <meshStandardMaterial color="#e8e8e0" roughness={0.8} />
        </mesh>
      ))}
      <instancedMesh ref={dashRef} args={[undefined, undefined, scenery.dashes.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#f1e6b0" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={postRef} args={[undefined, undefined, scenery.posts.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#f4f1e8" roughness={0.7} />
      </instancedMesh>

      {/* scrub and rocks */}
      <instancedMesh ref={shrubRef} args={[undefined, undefined, scenery.shrubs.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={rockRef} args={[undefined, undefined, scenery.rocks.length]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={1} flatShading />
      </instancedMesh>

      {/* telegraph line along the far side of the road */}
      {poleXs.map((x) => (
        <group key={x} position={[x, 0, -ROAD_HALF - 2.4]}>
          <mesh position={[0, 3.4, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.12, 6.8, 8]} />
            <meshStandardMaterial color="#4a3b2e" roughness={1} />
          </mesh>
          <mesh position={[0, 6.4, 0]} castShadow>
            <boxGeometry args={[0.15, 0.15, 1.8]} />
            <meshStandardMaterial color="#4a3b2e" roughness={1} />
          </mesh>
        </group>
      ))}
      {[-0.7, 0, 0.7].map((dz) => (
        <mesh key={dz} position={[0, 6.2, -ROAD_HALF - 2.4 + dz]}>
          <boxGeometry args={[TILE, 0.02, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

function World() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const phase = useRef(0);

  useFrame((state, dt) => {
    phase.current = (phase.current + motion.speed * Math.min(dt, 0.05)) % TILE;
    refs.current.forEach((g, i) => g?.position.set((i - 1) * TILE - phase.current, 0, 0));
    void state;
  });

  return (
    <>
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <Tile />
        </group>
      ))}
      {/* endless sand beyond the tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <planeGeometry args={[1800, 1800]} />
        <meshStandardMaterial color="#c49e63" roughness={1} />
      </mesh>
      <Mountains />
    </>
  );
}

function Mountains() {
  const items = useMemo(() => {
    const rnd = mulberry32(21);
    return Array.from({ length: 16 }, (_, i) => ({
      x: -340 + i * 45 + rnd() * 20,
      z: -190 - rnd() * 60,
      r: 35 + rnd() * 45,
      h: 22 + rnd() * 48,
      c: new THREE.Color().setHSL(0.07 + rnd() * 0.03, 0.28, 0.34 + rnd() * 0.08),
    }));
  }, []);
  return (
    <group>
      {items.map((m, i) => (
        <mesh key={i} position={[m.x, m.h / 2 - 2, m.z]}>
          <coneGeometry args={[m.r, m.h, 6]} />
          <meshStandardMaterial color={m.c} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------- sky */

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const SKY_FRAG = /* glsl */ `
uniform vec3 zenith;
uniform vec3 horizon;
uniform vec3 sunDir;
uniform vec3 moonDir;
uniform vec3 sunGlow;
uniform float sunAmt;
uniform float moonAmt;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 col = mix(horizon, zenith, pow(h, 0.55));
  float s = max(dot(d, sunDir), 0.0);
  col += sunGlow * (pow(s, 6.0) * 0.28 + pow(s, 90.0) * 0.9) * sunAmt;
  float m = max(dot(d, moonDir), 0.0);
  col += vec3(0.55, 0.65, 1.0) * (pow(m, 14.0) * 0.18 + pow(m, 160.0) * 0.4) * moonAmt;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const C = {
  zenNight: new THREE.Color("#040716"),
  zenDay: new THREE.Color("#2d74d6"),
  zenTwi: new THREE.Color("#3b3f86"),
  horNight: new THREE.Color("#0d1530"),
  horDay: new THREE.Color("#d8e4ea"),
  horTwi: new THREE.Color("#ff9a4a"),
  sunLow: new THREE.Color("#ffb070"),
  sunHigh: new THREE.Color("#fff3da"),
  moon: new THREE.Color("#8fa8ff"),
};

function DayCycle() {
  const scene = useThree((s) => s.scene);
  const sunLight = useRef<THREE.DirectionalLight>(null);
  const moonLight = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sunMesh = useRef<THREE.Mesh>(null);
  const moonMesh = useRef<THREE.Mesh>(null);
  const stars = useRef<THREE.Points>(null);

  const sky = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        uniforms: {
          zenith: { value: new THREE.Color() },
          horizon: { value: new THREE.Color() },
          sunDir: { value: new THREE.Vector3() },
          moonDir: { value: new THREE.Vector3() },
          sunGlow: { value: new THREE.Color() },
          sunAmt: { value: 1 },
          moonAmt: { value: 0 },
        },
      }),
    [],
  );

  const starGeo = useMemo(() => {
    const rnd = mulberry32(99);
    const n = 1400;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = rnd();
      const v = rnd();
      const theta = u * Math.PI * 2;
      const y = 0.02 + v * 0.98;
      const r = Math.sqrt(1 - y * y);
      arr.set([Math.cos(theta) * r * 450, y * 450, Math.sin(theta) * r * 450], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  const fog = useMemo(() => new THREE.Fog("#d8e4ea", 70, 330), []);
  useLayoutEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  const tmp = useMemo(
    () => ({ sun: new THREE.Vector3(), moon: new THREE.Vector3(), zen: new THREE.Color(), hor: new THREE.Color() }),
    [],
  );

  useFrame((state) => {
    const hour = (START_HOUR + state.clock.elapsedTime / SECONDS_PER_HOUR) % 24;
    sceneStore.hour = hour;
    const a = ((hour - 6) / 12) * Math.PI;
    tmp.sun.set(-Math.cos(a), Math.sin(a) * 0.95, -0.95).normalize();
    tmp.moon.set(-tmp.sun.x, -tmp.sun.y, tmp.sun.z).normalize();
    const e = tmp.sun.y;

    const day = smooth(e, -0.05, 0.35);
    const twi = 1 - smooth(Math.abs(e), 0.0, 0.3);
    const night = 1 - smooth(e, -0.12, 0.08);

    tmp.zen.copy(C.zenNight).lerp(C.zenDay, day).lerp(C.zenTwi, twi * 0.55);
    tmp.hor.copy(C.horNight).lerp(C.horDay, day).lerp(C.horTwi, twi * 0.85);

    const u = sky.uniforms;
    (u.zenith.value as THREE.Color).copy(tmp.zen);
    (u.horizon.value as THREE.Color).copy(tmp.hor);
    (u.sunDir.value as THREE.Vector3).copy(tmp.sun);
    (u.moonDir.value as THREE.Vector3).copy(tmp.moon);
    (u.sunGlow.value as THREE.Color).copy(C.sunLow).lerp(C.sunHigh, smooth(e, 0.1, 0.6));
    u.sunAmt.value = smooth(e, -0.12, 0.05);
    u.moonAmt.value = smooth(-e, -0.05, 0.1);
    fog.color.copy(tmp.hor);

    if (sunLight.current) {
      sunLight.current.position.copy(tmp.sun).multiplyScalar(60);
      sunLight.current.intensity = 3.4 * smooth(e, -0.02, 0.22);
      sunLight.current.color.copy(C.sunLow).lerp(C.sunHigh, smooth(e, 0.05, 0.5));
    }
    if (moonLight.current) {
      moonLight.current.position.copy(tmp.moon).multiplyScalar(60);
      moonLight.current.intensity = 0.7 * smooth(-e, -0.02, 0.25);
    }
    if (hemi.current) {
      hemi.current.intensity = 0.12 + 0.75 * day + 0.12 * twi;
      hemi.current.color.copy(tmp.zen).lerp(tmp.hor, 0.4);
    }
    if (sunMesh.current) {
      sunMesh.current.position.copy(tmp.sun).multiplyScalar(330);
      sunMesh.current.visible = e > -0.08;
    }
    if (moonMesh.current) {
      moonMesh.current.position.copy(tmp.moon).multiplyScalar(330);
      moonMesh.current.visible = tmp.moon.y > -0.08;
    }
    if (stars.current) (stars.current.material as THREE.PointsMaterial).opacity = night * 0.95;
    state.gl.toneMappingExposure = lerp(1.15, 0.85, day);
    sceneStore.night = night;
  });

  return (
    <>
      <mesh material={sky} renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[500, 32, 16]} />
      </mesh>
      <points ref={stars} geometry={starGeo} frustumCulled={false} renderOrder={-9}>
        <pointsMaterial color="#ffffff" size={1.7} sizeAttenuation={false} transparent depthWrite={false} fog={false} opacity={0} />
      </points>
      <mesh ref={sunMesh} frustumCulled={false}>
        <sphereGeometry args={[15, 24, 12]} />
        <meshBasicMaterial color="#fff4cf" toneMapped={false} fog={false} />
      </mesh>
      <mesh ref={moonMesh} frustumCulled={false}>
        <sphereGeometry args={[10, 24, 12]} />
        <meshBasicMaterial color="#e6ebff" toneMapped={false} fog={false} />
      </mesh>

      <hemisphereLight ref={hemi} args={["#9bb7e8", "#b08a52", 0.8]} />
      <directionalLight
        ref={sunLight}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0006}
      />
      <directionalLight ref={moonLight} color={C.moon} />
    </>
  );
}

/* -------------------------------------------------------------------- car */

function Wheel({ x, z }: { x: number; z: number }) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.z -= (motion.speed * Math.min(dt, 0.05)) / 0.38;
  });
  return (
    <group position={[x, 0.38, z]}>
      <group ref={spin}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.3, 20]} />
          <meshStandardMaterial color="#141414" roughness={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.32, 16]} />
          <meshStandardMaterial color="#b9bec4" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, z > 0 ? 0.17 : -0.17]}>
          <boxGeometry args={[0.44, 0.07, 0.02]} />
          <meshStandardMaterial color="#2b2f33" />
        </mesh>
        <mesh position={[0, 0, z > 0 ? 0.17 : -0.17]}>
          <boxGeometry args={[0.07, 0.44, 0.02]} />
          <meshStandardMaterial color="#2b2f33" />
        </mesh>
      </group>
    </group>
  );
}

function Car({ x }: { x: number }) {
  const body = useRef<THREE.Group>(null);
  const headlight = useRef<THREE.PointLight>(null);
  const lamps = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (body.current) body.current.position.y = motion.reduced ? 0 : Math.sin(state.clock.elapsedTime * 13) * 0.012 * Math.min(motion.speed / BASE_SPEED, 3);
    const night = sceneStore.night;
    if (headlight.current) headlight.current.intensity = 55 * night;
    if (lamps.current) lamps.current.emissiveIntensity = 0.6 + 2.2 * night;
  });

  return (
    <group position={[x, 0, 1.75]}>
      <group ref={body}>
        <mesh position={[0, 0.62, 0]} castShadow>
          <boxGeometry args={[3.5, 0.6, 1.6]} />
          <meshStandardMaterial color="#ffb800" metalness={0.45} roughness={0.35} />
        </mesh>
        <mesh position={[-0.2, 1.15, 0]} castShadow>
          <boxGeometry args={[1.9, 0.5, 1.42]} />
          <meshStandardMaterial color="#ffb800" metalness={0.45} roughness={0.35} />
        </mesh>
        <mesh position={[-0.2, 1.17, 0]}>
          <boxGeometry args={[1.94, 0.34, 1.46]} />
          <meshStandardMaterial color="#10161d" metalness={0.9} roughness={0.12} />
        </mesh>
        <mesh position={[1.76, 0.7, 0.5]}>
          <boxGeometry args={[0.06, 0.16, 0.3]} />
          <meshStandardMaterial ref={lamps} color="#fff6d0" emissive="#fff0b0" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[1.76, 0.7, -0.5]}>
          <boxGeometry args={[0.06, 0.16, 0.3]} />
          <meshStandardMaterial color="#fff6d0" emissive="#fff0b0" emissiveIntensity={1.6} />
        </mesh>
        {[0.55, -0.55].map((z) => (
          <mesh key={z} position={[-1.76, 0.7, z]}>
            <boxGeometry args={[0.06, 0.14, 0.3]} />
            <meshStandardMaterial color="#d22" emissive="#f22" emissiveIntensity={1.2} />
          </mesh>
        ))}
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[3.55, 0.12, 1.62]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <pointLight ref={headlight} position={[3.4, 0.8, 0]} color="#fff0c8" distance={22} decay={2} intensity={0} />
      </group>
      <Wheel x={1.1} z={0.82} />
      <Wheel x={1.1} z={-0.82} />
      <Wheel x={-1.1} z={0.82} />
      <Wheel x={-1.1} z={-0.82} />
    </group>
  );
}

/* ------------------------------------------------------------------ signs */

const POLE_TOP = 1.5;

function SignPlate({ file, rel, signX, size }: { file: string; rel: number; signX: number; size: number }) {
  const tex = useTexture(`/signs/${file}`, (t) => {
    const tt = (Array.isArray(t) ? t[0] : t) as THREE.Texture;
    tt.anisotropy = 8;
  });
  const group = useRef<THREE.Group>(null);
  const face = useRef<THREE.MeshStandardMaterial>(null);
  const img = tex.image as { width: number; height: number };
  const aspect = img.width / img.height;
  const w = aspect >= 1 ? size : size * aspect;
  const h = aspect >= 1 ? size / aspect : size;

  const x = useRef(rel * SIGN_SPACING + signX);
  useFrame((_, dt) => {
    const target = rel * SIGN_SPACING + signX;
    x.current = THREE.MathUtils.damp(x.current, target, 4.2, Math.min(dt, 0.05));
    if (group.current) {
      group.current.position.x = x.current;
      group.current.rotation.y = THREE.MathUtils.clamp((x.current - signX) * -0.012, -0.5, 0.5);
    }
    if (face.current) face.current.emissiveIntensity = 0.12 + 0.55 * sceneStore.night;
  });

  return (
    <group ref={group} position={[x.current, 0, ROAD_HALF + 1.5]}>
      <mesh position={[0, POLE_TOP / 2, -0.05]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, POLE_TOP + 0.1, 10]} />
        <meshStandardMaterial color="#9aa0a6" metalness={0.7} roughness={0.4} />
      </mesh>
      <group position={[0, POLE_TOP + h / 2 - 0.05, 0]}>
        <mesh castShadow>
          <boxGeometry args={[w + 0.1, h + 0.1, 0.05]} />
          <meshStandardMaterial color="#f4f4f0" roughness={0.65} emissive="#ffffff" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial ref={face} map={tex} emissiveMap={tex} transparent alphaTest={0.05} emissive="#ffffff" emissiveIntensity={0.15} roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}

function Signs({ index, signX, size }: { index: number; signX: number; size: number }) {
  return (
    <>
      {UZ_SIGNS.map((s, i) => {
        const rel = i - index;
        if (Math.abs(rel) > 2) return null;
        return (
          <Suspense key={s.id} fallback={null}>
            <SignPlate file={s.file} rel={rel} signX={signX} size={size} />
          </Suspense>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------- rig */

function Rig({ index }: { index: number }) {
  const size = useThree((s) => s.size);
  const aspect = size.width / size.height;
  const wide = aspect > 1.25;

  const lastY = useRef<number | null>(null);

  useFrame((state, dt) => {
    // Faster world while the page is being scrolled.
    const y = window.scrollY;
    const last = lastY.current ?? y;
    lastY.current = y;
    const scrollSpeed = Math.abs(y - last) / Math.max(dt, 0.001);
    const target = motion.reduced ? 0 : BASE_SPEED + Math.min(scrollSpeed * 0.04, 70);
    motion.speed += (target - motion.speed) * Math.min(1, dt * 3.5);

    const cam = state.camera;
    cam.position.set(0, wide ? 3.2 : 3.6, wide ? 16 : 20);
    cam.lookAt(0, wide ? 5.4 : 5.8, -8);
  });

  void index;
  return (
    <>
      <Car x={wide ? -5.6 : -2.2} />
      <Signs index={index} signX={wide ? 3.4 : 0.4} size={wide ? 2.8 : 2.4} />
    </>
  );
}

export default function DesertScene({ index, active }: { index: number; active: boolean }) {
  useLayoutEffect(() => {
    motion.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 3.2, 16], fov: 36, near: 0.5, far: 900 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden
    >
      <DayCycle />
      <World />
      <Rig index={index} />
    </Canvas>
  );
}
