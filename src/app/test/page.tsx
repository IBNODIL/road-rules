import type { Metadata } from "next";
import { TestRunner } from "@/components/TestRunner";

export const metadata: Metadata = {
  title: "Practice test",
  description: "Ten random questions on 3D junction and sign schemas, with an explanation after every answer.",
};

export default function TestPage() {
  return <TestRunner />;
}
