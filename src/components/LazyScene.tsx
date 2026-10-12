"use client";

import { useEffect, useRef, useState } from "react";
import type { SceneSpec } from "@/lib/types";
import { RoadScene } from "@/components/three/lazy";

/** Mounts the 3D scene only while it is near the screen, so a long page never runs out of WebGL contexts.
    By default the scene loops on its own. With `gated` it plays to the stop line and waits for `released`. */
export function LazyScene({
  spec,
  label,
  className = "",
  gated = false,
  released = false,
}: {
  spec: SceneSpec;
  label: string;
  className?: string;
  gated?: boolean;
  released?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {near ? (
        gated ? (
          <RoadScene spec={spec} label={label} gated released={released} className="h-full w-full rounded-lg" />
        ) : (
          <RoadScene spec={spec} label={label} loop controls={false} className="h-full w-full rounded-lg" />
        )
      ) : (
        <div className="skeleton h-full w-full rounded-lg" aria-hidden />
      )}
    </div>
  );
}
