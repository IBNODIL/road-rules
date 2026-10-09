"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function CarModel({ color, blink }: { color: string; blink?: "left" | "right" }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (mat.current) mat.current.emissiveIntensity = Math.sin(performance.now() / 110) > 0 ? 3 : 0.2;
  });
  const wheel = (x: number, z: number) => (
    <mesh key={`${x}${z}`} position={[x, 0.3, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 0.22, 16]} />
      <meshStandardMaterial color="#111" roughness={0.9} />
    </mesh>
  );
  return (
    <group>
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[1.5, 0.55, 3.2]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.08, -0.2]} castShadow>
        <boxGeometry args={[1.3, 0.5, 1.7]} />
        <meshStandardMaterial color="#cfd6dd" roughness={0.15} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.06, -0.2]}>
        <boxGeometry args={[1.34, 0.36, 1.74]} />
        <meshStandardMaterial color="#14181d" roughness={0.1} metalness={0.6} />
      </mesh>
      {wheel(-0.78, 1.0)}
      {wheel(0.78, 1.0)}
      {wheel(-0.78, -1.0)}
      {wheel(0.78, -1.0)}
      {[-0.5, 0.5].map((x) => (
        <mesh key={`h${x}`} position={[x, 0.62, 1.6]}>
          <boxGeometry args={[0.3, 0.14, 0.05]} />
          <meshStandardMaterial color="#fff6d6" emissive="#fff0b8" emissiveIntensity={1.5} />
        </mesh>
      ))}
      {[-0.5, 0.5].map((x) => (
        <mesh key={`t${x}`} position={[x, 0.62, -1.6]}>
          <boxGeometry args={[0.3, 0.14, 0.05]} />
          <meshStandardMaterial color="#8c0f16" emissive="#ff1a24" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {blink && (
        <mesh position={[blink === "right" ? -0.78 : 0.78, 0.7, 1.55]}>
          <boxGeometry args={[0.2, 0.14, 0.12]} />
          <meshStandardMaterial ref={mat} color="#ffb000" emissive="#ffb000" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
}
