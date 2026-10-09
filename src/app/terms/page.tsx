import type { Metadata } from "next";
import { Legal } from "@/components/Legal";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return <Legal kind="terms" />;
}
