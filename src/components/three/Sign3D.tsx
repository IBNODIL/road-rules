"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SignType } from "@/lib/types";
import { makeSignTexture } from "./signTexture";

type Props = {
  type: SignType;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  spin?: boolean;
  height?: number;
};

export function Sign3D({
  type,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  spin = false,
  height = 2.4,
}: Props) {
  const tex = useMemo(() => makeSignTexture(type), [type]);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (spin && ref.current) ref.current.rotation.y += dt * 0.6;
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={ref}>
        <mesh position={[0, height / 2, -0.04]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, height, 10]} />
          <meshStandardMaterial color="#8d9196" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, height + 0.3, 0]} castShadow>
          <planeGeometry args={[1.5, 1.5]} />
          <meshStandardMaterial
            map={tex}
            transparent
            alphaTest={0.5}
            side={THREE.DoubleSide}
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>
      </group>
    </group>
  );
}
