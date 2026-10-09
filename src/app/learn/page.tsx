import type { Metadata } from "next";
import { LearnIndex } from "@/components/LearnViews";

export const metadata: Metadata = {
  title: "Lessons",
  description:
    "Eight short lessons on signs, right of way, lights, turning, crossings, speed, markings and parking, each with a 3D scene.",
};

export default function LearnPage() {
  return <LearnIndex />;
}
