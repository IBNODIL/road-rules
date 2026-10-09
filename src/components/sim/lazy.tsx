"use client";

import dynamic from "next/dynamic";

export const ParkingSim = dynamic(() => import("./ParkingSim"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-6xl px-4 pt-32">
      <div className="skeleton h-96 w-full rounded-2xl" aria-hidden />
    </div>
  ),
});
