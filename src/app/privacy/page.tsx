import type { Metadata } from "next";
import { Legal } from "@/components/Legal";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return <Legal kind="privacy" />;
}
