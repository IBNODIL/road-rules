import type { Metadata } from "next";
import { RulesExam } from "@/components/RulesExam";

export const metadata: Metadata = {
  title: "Rules exam",
  description: "Twenty random questions from every clause of the Road Traffic Rules.",
};

export default function RulesExamPage() {
  return <RulesExam />;
}
