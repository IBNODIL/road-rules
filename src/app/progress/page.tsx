import type { Metadata } from "next";
import { ProgressView } from "@/components/ProgressView";

export const metadata: Metadata = {
  title: "Progress",
  description: "Your finished lessons and test history, stored in this browser.",
};

export default function ProgressPage() {
  return <ProgressView />;
}
