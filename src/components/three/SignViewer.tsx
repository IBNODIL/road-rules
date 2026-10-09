"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SIGN_ORDER } from "@/lib/signs";
import { useI18n } from "@/lib/i18n";
import type { SignType } from "@/lib/types";
import { Sign3D } from "./Sign3D";

/** Single sign on a rotating stand. Used in the test and the sign gallery. */
export function SignStage({ type, className = "" }: { type: SignType; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`bg-[#131209] ${className}`}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 3.4, 8.2], fov: 36 }}
        role="img"
        aria-label={t.scene.signLabel}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />
        <hemisphereLight args={["#bcd3ff", "#1b2418", 0.5]} />
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.4, 48]} />
          <meshStandardMaterial color="#272727" roughness={1} />
        </mesh>
        <Sign3D type={type} spin height={2.3} scale={1.15} position={[0, 0, 0]} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          target={[0, 1.9, 0]}
          minPolarAngle={0.9}
          maxPolarAngle={1.7}
        />
      </Canvas>
    </div>
  );
}

export default function SignGallery() {
  const { t } = useI18n();
  const [active, setActive] = useState<SignType>("stop");
  const info = t.signs[active];
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <SignStage type={active} className="aspect-square max-h-[520px] w-full overflow-hidden rounded-lg lg:aspect-auto lg:min-h-[420px]" />
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#FFB800]">{info.category}</p>
          <h3 className="mt-1 text-3xl font-semibold text-white">{info.name}</h3>
          <p className="mt-2 text-base text-[#9B9B9B]">{info.meaning}</p>
        </div>
        <ul className="grid grid-cols-3 gap-2" aria-label={t.learn.signsChoose}>
          {SIGN_ORDER.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setActive(s)}
                aria-pressed={active === s}
                className={`w-full rounded-lg border px-2 py-3 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.98] ${
                  active === s
                    ? "border-[#FFB800] bg-[#272727] text-white"
                    : "border-white/10 bg-[#1F1F1F] text-[#9B9B9B] hover:bg-[#272727] hover:text-white"
                }`}
              >
                {t.signs[s].name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
