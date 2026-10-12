import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartTestPage } from "@/components/PartTestPage";
import { partKeys } from "@/lib/rules/data";
import { rulesUi } from "@/lib/rules/ui";

export function generateStaticParams() {
  return partKeys.map((key) => ({ key }));
}

export async function generateMetadata({ params }: PageProps<"/learn/part/[key]/test">): Promise<Metadata> {
  const { key } = await params;
  return partKeys.includes(key) ? { title: `${rulesUi.en.testTitle}: ${rulesUi.en.chapterNames[key]}` } : {};
}

export default async function PartTestRoute({ params }: PageProps<"/learn/part/[key]/test">) {
  const { key } = await params;
  if (!partKeys.includes(key)) notFound();
  return <PartTestPage partKey={key} />;
}
