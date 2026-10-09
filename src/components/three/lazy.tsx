"use client";

import dynamic from "next/dynamic";

const Placeholder = ({ className = "" }: { className?: string }) => (
  <div className={`skeleton ${className}`} aria-hidden />
);

export const RoadScene = dynamic(() => import("./RoadScene"), {
  ssr: false,
  loading: () => <Placeholder className="h-full min-h-72 w-full" />,
});

export const SignGallery = dynamic(() => import("./SignViewer"), {
  ssr: false,
  loading: () => <Placeholder className="h-96 w-full rounded-lg" />,
});

export const SignStage = dynamic(
  () => import("./SignViewer").then((m) => m.SignStage),
  { ssr: false, loading: () => <Placeholder className="h-full min-h-72 w-full" /> },
);
