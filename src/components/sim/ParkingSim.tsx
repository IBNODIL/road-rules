"use client";

/* The simulator mutates three.js objects and game state inside frame and pointer callbacks on purpose. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowCounterClockwise,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CornersIn,
  CornersOut,
  Car as CarIcon,
  Keyboard,
  Star,
  VideoCamera,
  Warning,
} from "@phosphor-icons/react";
import { StaticCar, carKinds, carPaint, useCar, type CarKind, type CarRig, type Signal } from "@/components/three/CarGLB";
import {
  Game,
  PASS_SCORE,
  START_SCORE,
  getLevel,
  levelIds,
  type Hud,
  type Input,
  type LevelId,
  type Obstacle,
  type Result,
} from "@/lib/sim";
import { update, useData } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n/en";

/* ---------- controls ---------- */

/** W gas, S brake. Up and Down arrows pick the gear. Nothing here reverses the car. */
class Controls {
  keys = new Set<string>();
  touchGas = false;
  touchBrake = false;
  touchSteer = 0;
  touchHand = false;
  pendingShift: -1 | 0 | 1 = 0;
  signal: Signal = 0;
  pendingFinish = false;
  armed = false;

  press(k: string) {
    this.keys.add(k);
  }
  release(k: string) {
    this.keys.delete(k);
  }
  clear() {
    this.keys.clear();
    this.touchGas = false;
    this.touchBrake = false;
    this.touchSteer = 0;
    this.touchHand = false;
  }
  shift(n: -1 | 1) {
    this.pendingShift = n;
  }
  finish() {
    this.pendingFinish = true;
  }
  toggleSignal(n: 1 | 2 | 3) {
    this.signal = this.signal === n ? 0 : n;
    this.armed = false;
  }
  /** Like a real stalk: a left or right signal switches itself off once the wheel comes back after the turn. */
  autoCancel(steer: number) {
    if (this.signal !== 1 && this.signal !== 2) return;
    const turn = this.signal === 1 ? steer : -steer;
    if (turn > 0.25) this.armed = true;
    else if (this.armed && turn < 0.05) {
      this.signal = 0;
      this.armed = false;
    }
  }
  setGas(v: boolean) {
    this.touchGas = v;
  }
  setBrake(v: boolean) {
    this.touchBrake = v;
  }
  setSteer(n: number) {
    this.touchSteer = n;
  }

  get(): Input {
    const k = this.keys;
    const left = k.has("arrowleft") || k.has("a");
    const right = k.has("arrowright") || k.has("d");
    const shift = this.pendingShift;
    this.pendingShift = 0;
    const finish = this.pendingFinish;
    this.pendingFinish = false;
    return {
      gas: k.has("w") || this.touchGas ? 1 : 0,
      brake: k.has("s") || this.touchBrake,
      steer: Math.max(-1, Math.min(1, (left ? 1 : 0) - (right ? 1 : 0) + this.touchSteer)),
      handbrake: k.has(" ") || this.touchHand,
      signal: this.signal,
      finish,
      shift,
    };
  }
}

/** Where the driver is looking. yaw is positive to the left. */
class Look {
  yaw = 0;
  pitch = 0;
  dragged = false;
  dragging = false;
  /** Chase camera orbit around the car, added to its default spot behind the car. */
  orbitYaw = 0;
  orbitPitch = 0;
  lastX = 0;
  lastY = 0;
  move(dx: number, dy: number) {
    this.yaw = Math.max(-2.3, Math.min(2.3, this.yaw - dx * 0.004));
    this.pitch = Math.max(-0.5, Math.min(0.6, this.pitch - dy * 0.004));
    this.dragged = true;
  }
  orbit(dx: number, dy: number) {
    this.orbitYaw -= dx * 0.006;
    this.orbitPitch = Math.max(-0.45, Math.min(0.8, this.orbitPitch + dy * 0.005));
  }
  center() {
    this.orbitYaw = 0;
    this.orbitPitch = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.dragged = false;
  }
}

/* ---------- 3D bits ---------- */

const toWorld = (g: Game, lx: number, ly: number, lz: number, out: THREE.Vector3) => {
  const s = Math.sin(g.theta);
  const c = Math.cos(g.theta);
  return out.set(g.x + lx * c + lz * s, ly, g.z - lx * s + lz * c);
};

function ObstacleMesh({ o, i }: { o: Obstacle; i: number }) {
  if (o.kind === "car") {
    return (
      <group position={[o.x, 0, o.z]} rotation={[0, o.rot, 0]}>
        <StaticCar kind={carKinds[i % carKinds.length]} color={o.color ?? "#667"} />
      </group>
    );
  }
  if (o.kind === "cone") {
    return (
      <group position={[o.x, 0, o.z]}>
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
  const h = o.height ?? 0.4;
  return (
    <mesh position={[o.x, h / 2, o.z]} rotation={[0, o.rot, 0]} castShadow receiveShadow>
      <boxGeometry args={[o.hw * 2, h, o.hl * 2]} />
      <meshStandardMaterial color="#6b6f75" roughness={0.9} />
    </mesh>
  );
}

type MirrorDef = {
  key: "left" | "right" | "rear";
  /** Camera yaw relative to the car heading. */
  yaw: number;
  fov: number;
  w: number;
  h: number;
  seesCar: boolean;
};

const MIRRORS: MirrorDef[] = [
  { key: "rear", yaw: 0, fov: 30, w: 576, h: 144, seesCar: false },
  { key: "left", yaw: -0.3, fov: 42, w: 288, h: 216, seesCar: true },
  { key: "right", yaw: 0.3, fov: 42, w: 288, h: 216, seesCar: true },
];

/** Where each mirror panel sits in the driver's view: straight over the mirror glass of the car model. */
function mirrorPanels(car: CarRig) {
  const mk = (m: THREE.Vector3, glassW: number, zoom: number, aspect: number) => {
    const dx = m.x - car.eye.x;
    const dz = m.z - car.eye.z;
    const d = Math.hypot(dx, dz);
    const pw = ((glassW * 0.9) / d) * zoom;
    return { angle: Math.atan2(dx, dz), y: ((m.y - car.eye.y) / d) * 0.9, pw, ph: pw * aspect };
  };
  return {
    rear: mk(car.mirrorRear, 0.42, 1.1, 0.25),
    left: mk(car.mirrorL, 0.2, 2.2, 0.75),
    right: mk(car.mirrorR, 0.2, 2.2, 0.75),
  };
}

function Scene({
  game,
  controls,
  look,
  cam,
  carKind,
  onHud,
  onDone,
}: {
  game: Game;
  carKind: CarKind;
  controls: Controls;
  look: Look;
  cam: 0 | 1 | 2;
  onHud: (h: Hud) => void;
  onDone: (r: Result) => void;
}) {
  const { gl, scene, camera } = useThree();
  const level = game.level;
  const carRef = useRef<THREE.Group>(null);
  const car = useCar(carKind, carPaint[carKind], true);
  const panels = useMemo(() => mirrorPanels(car), [car]);
  const rigRef = useRef<THREE.Group>(null);
  const bayMat = useRef<THREE.MeshBasicMaterial>(null);
  const hudT = useRef(0);
  const mirrorTurn = useRef(0);
  const lookAt = useRef(new THREE.Vector3());
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3() }), []);
  const lastCam = useRef<0 | 1 | 2>(0);

  const rearFbo = useFBO(MIRRORS[0].w, MIRRORS[0].h);
  const leftFbo = useFBO(MIRRORS[1].w, MIRRORS[1].h);
  const rightFbo = useFBO(MIRRORS[2].w, MIRRORS[2].h);
  const fbos = { rear: rearFbo, left: leftFbo, right: rightFbo };

  const mirrorCams = useMemo(
    () =>
      MIRRORS.map((m) => {
        const c = new THREE.PerspectiveCamera(m.fov, m.w / m.h, 0.2, 120);
        c.rotation.order = "YXZ";
        c.layers.set(0);
        if (m.seesCar) c.layers.enable(1);
        return c;
      }),
    [],
  );

  useEffect(() => {
    // layer 0 world, 1 outside of the player car, 2 cockpit, 3 mirror panels (the car sets 1 and 2 itself)
    rigRef.current?.traverse((o) => o.layers.set(3));
    for (const f of [rearFbo, leftFbo, rightFbo]) {
      f.texture.wrapS = THREE.RepeatWrapping;
      f.texture.repeat.set(-1, 1);
      f.texture.offset.set(1, 0);
    }
    scene.add(camera);
    return () => {
      scene.remove(camera);
      camera.layers.set(0);
    };
  }, [scene, camera, rearFbo, leftFbo, rightFbo]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const inp = controls.get();
    controls.autoCancel(game.steer / 0.62);
    const steps = Math.max(1, Math.ceil(dt / 0.01));
    for (let i = 0; i < steps; i++) {
      const r = game.step(dt / steps, i === 0 ? inp : { ...inp, shift: 0, finish: false });
      if (r) {
        onDone(r);
        break;
      }
    }

    // head look: dragging turns the head, letting go springs it back to centre
    if (!look.dragging) {
      look.yaw *= Math.exp(-8 * dt);
      look.pitch *= Math.exp(-8 * dt);
    }

    const g = carRef.current;
    if (g) {
      g.position.set(game.x, 0, game.z);
      g.rotation.y = game.theta;
    }
    car.update({
      dist: game.v * dt,
      steer: game.steer,
      signal: controls.signal,
      blink: Math.sin(state.clock.elapsedTime * Math.PI * 3) > 0,
      braking: inp.brake || inp.handbrake,
      reversing: game.gear === "R",
    });
    if (bayMat.current) bayMat.current.color.set(game.inBay ? "#30a46c" : "#ffb800");

    const cm = state.camera as THREE.PerspectiveCamera;
    const fx = Math.sin(game.theta);
    const fz = Math.cos(game.theta);

    if (cam === 0) {
      cm.layers.mask = 1 | 2 | 4 | 8;
      if (cm.fov !== 72) {
        cm.fov = 72;
        cm.near = 0.1;
        cm.updateProjectionMatrix();
      }
      toWorld(game, car.eye.x, car.eye.y, car.eye.z, tmp.a);
      cm.position.copy(tmp.a);
      cm.rotation.order = "YXZ";
      cm.rotation.set(look.pitch, game.theta + Math.PI + look.yaw, 0);
      if (rigRef.current) {
        rigRef.current.rotation.order = "XYZ";
        rigRef.current.rotation.set(-look.pitch, -look.yaw, 0);
      }

      // mirrors: render the world from each mirror into its texture
      const au = gl.shadowMap.autoUpdate;
      gl.shadowMap.autoUpdate = false;
      const prev = gl.getRenderTarget();
      // one mirror per frame keeps the cost of three extra scene renders down
      mirrorTurn.current = (mirrorTurn.current + 1) % MIRRORS.length;
      MIRRORS.forEach((m, i) => {
        if (i !== mirrorTurn.current) return;
        const c = mirrorCams[i];
        const at = m.key === "left" ? car.mirrorL : m.key === "right" ? car.mirrorR : car.mirrorRear;
        toWorld(game, at.x, at.y, at.z, c.position);
        c.rotation.set(0, game.theta + m.yaw, 0);
        c.updateMatrixWorld();
        gl.setRenderTarget(fbos[m.key]);
        gl.render(scene, c);
      });
      gl.setRenderTarget(prev);
      gl.shadowMap.autoUpdate = au;
    } else {
      cm.layers.mask = 1 | 2 | 4;
      if (cm.fov !== 45) {
        cm.fov = 45;
        cm.near = 0.1;
        cm.updateProjectionMatrix();
      }
      cm.rotation.order = "XYZ";
      if (cam === 1) {
        // orbit around the car: drag to swing the camera, it keeps following the car's heading
        const pitch = Math.max(0.12, Math.min(1.4, 0.58 + look.orbitPitch));
        const ang = game.theta + Math.PI + look.orbitYaw;
        const D = 11.9;
        tmp.a.set(game.x + Math.sin(ang) * Math.cos(pitch) * D, Math.sin(pitch) * D, game.z + Math.cos(ang) * Math.cos(pitch) * D);
        tmp.b.set(game.x + fx * 3, 0.5, game.z + fz * 3);
      } else {
        // top down, locked to the car
        tmp.a.set(game.x, 30, game.z + 11);
        tmp.b.set(game.x, 0, game.z);
      }
      if (lastCam.current === 0) {
        // coming from the cockpit: start the glide where the driver was looking, not at a stale point
        cm.getWorldDirection(tmp.c);
        lookAt.current.copy(cm.position).addScaledVector(tmp.c, 8);
      }
      cm.position.lerp(tmp.a, 1 - Math.exp(-4 * dt));
      cm.position.y = Math.max(cm.position.y, 0.8);
      lookAt.current.lerp(tmp.b, 1 - Math.exp(-6 * dt));
      cm.lookAt(lookAt.current);
    }

    lastCam.current = cam;
    hudT.current += dt;
    if (hudT.current > 0.1) {
      hudT.current = 0;
      onHud(game.hud());
    }
  });

  const b = level.bay;
  const a = level.asphalt;
  const asphaltShape = useMemo(() => {
    if (!level.poly) return null;
    // the mesh is laid flat by rotating -90 degrees about x, which sends shape y to -z
    const shape = new THREE.Shape(level.poly.map(([x, z]) => new THREE.Vector2(x, -z)));
    return new THREE.ShapeGeometry(shape);
  }, [level]);
  return (
    <>
      <color attach="background" args={["#a9c7e6"]} />
      <fog attach="fog" args={["#a9c7e6", 45, 120]} />
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#bcd3ff", "#1b2418", 0.6]} />
      <directionalLight
        position={[12, 24, 10]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[70, 48]} />
        <meshStandardMaterial color="#4a7a38" roughness={1} />
      </mesh>
      {asphaltShape ? (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={asphaltShape} receiveShadow>
          <meshStandardMaterial color="#34373c" roughness={0.95} />
        </mesh>
      ) : (
        <mesh position={[a.x, 0.02, a.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[a.w, a.d]} />
          <meshStandardMaterial color="#34373c" roughness={0.95} />
        </mesh>
      )}
      {level.lines.map((l, i) => (
        <mesh key={i} position={[l.x, 0.04, l.z]} rotation={[-Math.PI / 2, 0, l.rot ?? 0]}>
          <planeGeometry args={[l.w, l.l]} />
          <meshStandardMaterial color={l.solid ? "#ffffff" : "#e6e6e6"} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[b.cx, 0.05, b.cz]} rotation={[-Math.PI / 2, 0, b.rot]}>
        <planeGeometry args={[b.hw * 2, b.hl * 2]} />
        <meshBasicMaterial ref={bayMat} color="#ffb800" transparent opacity={0.28} />
      </mesh>
      {level.obstacles.map((o, i) => (
        <ObstacleMesh key={i} o={o} i={i} />
      ))}

      <group ref={carRef}>
        <primitive object={car.root} />
      </group>

      {/* mirror panels ride on the camera and stay fixed to the car heading */}
      <primitive object={camera}>
        <group ref={rigRef} visible={cam === 0}>
          {MIRRORS.map((m) => (
            <group key={m.key} rotation={[0, panels[m.key].angle, 0]}>
              <mesh position={[0, panels[m.key].y, -0.9]} renderOrder={998}>
                <planeGeometry args={[panels[m.key].pw + 0.03, panels[m.key].ph + 0.03]} />
                <meshBasicMaterial color="#0b0c0e" depthTest={false} depthWrite={false} toneMapped={false} />
              </mesh>
              <mesh position={[0, panels[m.key].y, -0.899]} renderOrder={999}>
                <planeGeometry args={[panels[m.key].pw, panels[m.key].ph]} />
                <meshBasicMaterial map={fbos[m.key].texture} depthTest={false} depthWrite={false} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      </primitive>
    </>
  );
}

/* ---------- UI ---------- */

/** A floating panel with every control as a key. The keys also work when clicked or touched. */
function Key({ controls, k, label, hold, onClick, children, wide }: { controls: Controls; k?: string; label: string; hold?: boolean; onClick?: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
  <div className="flex items-center gap-2">
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        if (onClick) onClick();
        else if (k) controls.press(k);
      }}
      onPointerUp={() => hold && k && controls.release(k)}
      onPointerCancel={() => hold && k && controls.release(k)}
      onContextMenu={(e) => e.preventDefault()}
      className={`grid h-8 touch-none select-none place-items-center rounded-md border border-white/20 border-b-4 bg-[#272727] text-sm font-bold text-white active:translate-y-0.5 active:border-b-2 active:bg-[#FFB800] active:text-black ${wide ? "min-w-16 px-2" : "w-8"}`}
    >
      {children}
    </button>
    <span className="text-sm text-[#d8d8d8]">{label}</span>
  </div>
);
}

function KeyPanel({ controls, s }: { controls: Controls; s: Dict["sim"] }) {
  return (
    <div className="absolute bottom-3 left-3 w-[20rem] rounded-2xl border border-white/10 bg-black/65 p-3 backdrop-blur [@media(pointer:coarse)]:bottom-24" role="group" aria-label={s.controlsTitle}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#FFB800]">{s.controlsTitle}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <Key controls={controls} k="w" hold label={s.touchGas}>W</Key>
        <Key controls={controls} k="s" hold label={s.touchBrake}>S</Key>
        <Key controls={controls} k="arrowleft" hold label={s.touchLeft}><ArrowLeft size={16} weight="bold" /></Key>
        <Key controls={controls} k="arrowright" hold label={s.touchRight}><ArrowRight size={16} weight="bold" /></Key>
        <Key controls={controls} k=" " hold wide label={s.keyHand}>Space</Key>
        <Key controls={controls} onClick={() => controls.shift(1)} label={s.touchD}><ArrowUp size={16} weight="bold" /></Key>
        <Key controls={controls} onClick={() => controls.shift(-1)} label={s.touchR}><ArrowDown size={16} weight="bold" /></Key>
        <Key controls={controls} onClick={() => controls.toggleSignal(1)} label={s.signalLeft}>Q</Key>
        <Key controls={controls} onClick={() => controls.toggleSignal(2)} label={s.signalRight}>E</Key>
        <Key controls={controls} onClick={() => controls.toggleSignal(3)} label={s.hazard}>X</Key>
      </div>
    </div>
  );
}

function TouchBtn({
  label,
  onDown,
  onUp,
  children,
  wide = false,
}: {
  label: string;
  onDown: () => void;
  onUp?: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        onDown();
      }}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onContextMenu={(e) => e.preventDefault()}
      className={`grid h-14 touch-none select-none place-items-center rounded-2xl border border-white/10 bg-black/60 text-base font-semibold text-white backdrop-blur active:bg-[#FFB800] active:text-black ${
        wide ? "w-16" : "w-14"
      }`}
    >
      {children}
    </button>
  );
}

/** Physical key name, so the controls keep working on a Russian or Uzbek keyboard layout. */
function keyName(e: KeyboardEvent): string {
  const c = e.code;
  if (c.startsWith("Key")) return c.slice(3).toLowerCase();
  if (c.startsWith("Digit")) return c.slice(5);
  if (c === "Space") return " ";
  if (c === "NumpadEnter") return "enter";
  if (c.startsWith("Arrow") || c === "Enter") return c.toLowerCase();
  return e.key.toLowerCase();
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function Drive({ id, onExit, onNext }: { id: LevelId; onExit: () => void; onNext: (() => void) | null }) {
  const { t } = useI18n();
  const s = t.sim;
  const [game] = useState(() => new Game(getLevel(id)));
  const [controls] = useState(() => new Controls());
  const [look] = useState(() => new Look());
  const [hud, setHud] = useState<Hud>(() => game.hud());
  const [result, setResult] = useState<Result | null>(null);
  const [cam, setCam] = useState<0 | 1 | 2>(0);
  const [isFs, setIsFs] = useState(false);
  const [showKeys, setShowKeys] = useState(true);
  const [carKind, setCarKind] = useState<CarKind>("sedan");
  const box = useRef<HTMLDivElement>(null);

  const restart = () => {
    game.reset();
    look.center();
    setResult(null);
    setHud(game.hud());
  };

  const done = (r: Result) => {
    setResult(r);
    if (!r.passed) return;
    update((d) => {
      const prev = d.sim[id];
      return !prev || prev.score > 10 || r.score > prev.score
        ? { ...d, sim: { ...d.sim, [id]: { score: r.score, stars: r.stars, seconds: r.seconds } } }
        : d;
    });
  };

  const toggleFs = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void box.current?.requestFullscreen?.();
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = keyName(e);
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
      if (e.repeat) return;
      if (k === "c") setCam((c) => ((c + 1) % 3) as 0 | 1 | 2);
      else if (k === "r") restart();
      else if (k === "f") toggleFs();
      else if (k === "x") controls.toggleSignal(3);
      else if (k === "enter") controls.finish();
      else if (k === "q" || k === "1") controls.toggleSignal(1);
      else if (k === "e" || k === "2") controls.toggleSignal(2);
      else if (k === "arrowup") controls.shift(1);
      else if (k === "arrowdown") controls.shift(-1);
      else controls.press(k);
    };
    const up = (e: KeyboardEvent) => controls.release(keyName(e));
    const blur = () => controls.clear();
    const fs = () => setIsFs(!!document.fullscreenElement);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    document.addEventListener("fullscreenchange", fs);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      document.removeEventListener("fullscreenchange", fs);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    look.dragging = true;
    look.lastX = e.clientX;
    look.lastY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!look.dragging || cam === 2) return;
    if (cam === 0) look.move(e.clientX - look.lastX, e.clientY - look.lastY);
    else look.orbit(e.clientX - look.lastX, e.clientY - look.lastY);
    look.lastX = e.clientX;
    look.lastY = e.clientY;
  };
  const onUp = () => {
    look.dragging = false;
    look.dragged = false;
  };

  const failed = result && !result.passed;
  const title = !result
    ? ""
    : result.reason === "crash"
      ? s.crashTitle
      : result.reason === "fines"
        ? s.finesTitle
        : result.passed
          ? s.passedTitle
          : s.failedTitle;
  const body = !result
    ? ""
    : result.reason === "crash"
      ? s.crashBody
      : result.reason === "fines"
        ? s.finesBody
        : "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32">
      <button type="button" onClick={onExit} className="inline-flex items-center gap-1 text-sm text-[#9B9B9B] hover:text-white">
        <ArrowLeft size={16} aria-hidden />
        {s.back}
      </button>
      <h1 className="mt-4 text-4xl font-semibold">{s.levels[id].name}</h1>
      <p className="mt-2 max-w-[680px] text-base text-[#9B9B9B]">{s.levels[id].desc}</p>
      <p className="mt-2 max-w-[680px] text-sm text-[#9B9B9B]">{s.rules}</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#181818] p-2">
        <div
          ref={box}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="relative h-[480px] touch-none select-none overflow-hidden rounded-lg bg-[#131209] md:h-[600px] [&:fullscreen]:h-screen [&:fullscreen]:rounded-none"
        >
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.5, 0], fov: 72, near: 0.1 }} role="img" aria-label={s.canvasLabel}>
            <Scene game={game} controls={controls} look={look} cam={cam} carKind={carKind} onHud={setHud} onDone={done} />
          </Canvas>

          {/* HUD */}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-lg bg-black/60 px-2 py-1">
              {s.time} {fmt(hud.time)}
            </span>
            <span className="rounded-lg bg-black/60 px-2 py-1">{Math.round(hud.speed)} km/h</span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-14 flex flex-col items-center gap-2 lg:top-3">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-lg px-3 py-1 text-lg font-semibold ${hud.score >= START_SCORE ? "bg-black/60" : hud.score >= PASS_SCORE + 2 ? "bg-[#7a5a00]" : "bg-[#8a2a2d]"}`}
                aria-label={s.score}
              >
                {s.scoreOf(hud.score)}
              </span>
              <span className="flex gap-1 rounded-xl bg-black/60 p-1" role="img" aria-label={`${s.gear} ${hud.gear}`}>
                {(["D", "R"] as const).map((g) => (
                  <span
                    key={g}
                    className={`grid size-12 place-items-center rounded-lg text-4xl font-bold leading-none transition-colors duration-300 ${
                      hud.gear === g ? "bg-[#FFB800] text-black" : "text-white/35"
                    }`}
                  >
                    {g}
                  </span>
                ))}
              </span>
            </div>
            {hud.sinceFine < 2 && (
              <p className="flex items-center gap-1 rounded-lg bg-[#8a2a2d] px-2 py-1 text-sm font-semibold" role="status">
                <Warning size={16} weight="fill" aria-hidden />
                {hud.fineKind === "line" ? s.fine : hud.fineKind === "signal" ? s.fineSignal : s.fineHazard}
              </p>
            )}
            {hud.sinceDenied < 2 && (
              <p className="rounded-lg bg-black/70 px-2 py-1 text-sm font-semibold" role="status">
                {s.shiftDenied}
              </p>
            )}
            {hud.inBay && !result && (
              <div className="w-48 rounded-lg bg-black/70 p-2 text-center text-sm font-semibold">
                {hud.ready ? s.readyEnd : hud.hold > 0 ? s.holdIn : s.parked}
                <div className="mt-1 h-1.5 rounded-full bg-[#272727]">
                  <div className="h-1.5 rounded-full bg-[#30a46c]" style={{ width: `${hud.hold * 100}%` }} />
                </div>
                {hud.ready && (
                  <button type="button" onClick={() => controls.finish()} className="btn btn-primary pointer-events-auto mt-2 w-full">
                    {s.finish}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="absolute right-3 top-3 flex gap-2">
            <button type="button" onClick={() => setCam((c) => ((c + 1) % 3) as 0 | 1 | 2)} className="btn btn-ghost !px-2">
              <VideoCamera size={18} aria-hidden />
              <span className="hidden lg:inline">{s.cams[cam]}</span>
              <span className="sr-only">{s.camera}</span>
            </button>
            <button type="button" onClick={() => setCarKind((c) => carKinds[(carKinds.indexOf(c) + 1) % carKinds.length])} className="btn btn-ghost !px-2" aria-label={s.car}>
              <CarIcon size={18} aria-hidden />
              <span className="hidden lg:inline">{s.cars[carKind]}</span>
            </button>
            <button type="button" onClick={() => setShowKeys((v) => !v)} aria-pressed={showKeys} className="btn btn-ghost !px-2">
              <Keyboard size={18} aria-hidden />
              <span className="hidden lg:inline">{showKeys ? s.hideControls : s.showControls}</span>
              <span className="sr-only lg:hidden">{showKeys ? s.hideControls : s.showControls}</span>
            </button>
            <button type="button" onClick={toggleFs} className="btn btn-ghost !px-2" aria-label={isFs ? s.exitFullscreen : s.fullscreen}>
              {isFs ? <CornersIn size={18} aria-hidden /> : <CornersOut size={18} aria-hidden />}
            </button>
            <button type="button" onClick={restart} className="btn btn-ghost !px-2" aria-label={s.retry}>
              <ArrowCounterClockwise size={18} aria-hidden />
            </button>
          </div>

          {showKeys && <KeyPanel controls={controls} s={s} />}

          {/* touch controls */}
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between [@media(pointer:fine)]:hidden">
            <div className="flex gap-2">
              <TouchBtn label={s.signalLeft} onDown={() => controls.toggleSignal(1)}>
                <span className="text-2xl font-bold">&lt;</span>
              </TouchBtn>
              <TouchBtn label={s.signalRight} onDown={() => controls.toggleSignal(2)}>
                <span className="text-2xl font-bold">&gt;</span>
              </TouchBtn>
              <TouchBtn label={s.touchLeft} onDown={() => controls.setSteer(1)} onUp={() => controls.setSteer(0)}>
                <ArrowLeft size={24} />
              </TouchBtn>
              <TouchBtn label={s.touchRight} onDown={() => controls.setSteer(-1)} onUp={() => controls.setSteer(0)}>
                <ArrowRight size={24} />
              </TouchBtn>
            </div>
            <div className="flex gap-2">
              <TouchBtn label={s.touchD} onDown={() => controls.shift(1)}>
                <span className="text-3xl font-bold">D</span>
              </TouchBtn>
              <TouchBtn label={s.touchR} onDown={() => controls.shift(-1)}>
                <span className="text-3xl font-bold">R</span>
              </TouchBtn>
              <TouchBtn label={s.touchBrake} onDown={() => controls.setBrake(true)} onUp={() => controls.setBrake(false)}>
                <ArrowDown size={24} />
              </TouchBtn>
              <TouchBtn label={s.touchGas} onDown={() => controls.setGas(true)} onUp={() => controls.setGas(false)}>
                <ArrowUp size={24} />
              </TouchBtn>
            </div>
          </div>

          {/* result */}
          {result && (
            <div className="absolute inset-0 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-label={s.result}>
              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#181818] p-6">
                {result.passed ? (
                  <div className="flex gap-1" aria-label={s.stars(result.stars)}>
                    {[1, 2, 3].map((n) => (
                      <Star key={n} size={32} weight={n <= result.stars ? "fill" : "regular"} className={n <= result.stars ? "text-[#FFB800]" : "text-[#9B9B9B]"} />
                    ))}
                  </div>
                ) : (
                  <Warning size={32} weight="fill" className="text-[#e5484d]" aria-hidden />
                )}
                <p className="mt-4 text-2xl font-semibold">{title}</p>
                {body && <p className="mt-2 text-sm text-[#9B9B9B]">{body}</p>}
                <p className="mt-3 text-3xl font-semibold">
                  {s.score}: {s.scoreOf(result.score)}
                </p>
                <p className="mt-2 text-sm text-[#9B9B9B]">
                  {s.time} {fmt(result.seconds)} · {s.lineFines(result.linesCrossed)} · {s.ruleFines(result.ruleFines)}
                </p>
                {result.reason === "parked" && (
                  <p className="mt-1 text-sm text-[#9B9B9B]">
                    {s.askew(result.askew)} · {s.angle} {result.angle}°
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-primary" onClick={restart}>
                    {s.retry}
                  </button>
                  {!failed && onNext && (
                    <button type="button" className="btn btn-ghost" onClick={onNext}>
                      {s.nextLevel}
                    </button>
                  )}
                  <button type="button" className="btn btn-ghost" onClick={onExit}>
                    {s.back}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 hidden text-sm text-[#9B9B9B] [@media(pointer:fine)]:block">{s.controls}</p>
    </div>
  );
}

export default function ParkingSim() {
  const { t } = useI18n();
  const data = useData();
  const [level, setLevel] = useState<LevelId | null>(null);

  if (level) {
    const i = levelIds.indexOf(level);
    const next = levelIds[i + 1];
    return <Drive key={level} id={level} onExit={() => setLevel(null)} onNext={next ? () => setLevel(next) : null} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32">
      <h1 className="max-w-[680px] text-5xl font-semibold">{t.sim.title}</h1>
      <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{t.sim.sub}</p>
      <p className="mt-2 max-w-[680px] text-sm text-[#9B9B9B]">{t.sim.rules}</p>
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {levelIds.map((id, i) => {
          const best = data.sim[id];
          const valid = best && best.score <= 10;
          return (
            <li key={id}>
              <button type="button" onClick={() => setLevel(id)} className="card flex h-full w-full flex-col gap-4 text-left hover:-translate-y-1 hover:bg-[#1F1F1F]">
                <p className="font-mono text-sm text-[#FFB800]">{String(i + 1).padStart(2, "0")}</p>
                <div>
                  <h2 className="text-2xl font-semibold">{t.sim.levels[id].name}</h2>
                  <p className="mt-2 text-base text-[#9B9B9B]">{t.sim.levels[id].desc}</p>
                </div>
                <p className="mt-auto text-sm text-[#9B9B9B]">
                  {valid ? `${t.sim.best}: ${t.sim.scoreOf(best.score)} · ${"★".repeat(best.stars)}${"☆".repeat(3 - best.stars)}` : t.progress.simNone}
                </p>
                <span className="btn btn-primary self-start">{t.sim.start}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
