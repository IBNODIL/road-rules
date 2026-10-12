import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartPage } from "@/components/PartPage";
import { partKeys } from "@/lib/rules/data";
import { rulesUi } from "@/lib/rules/ui";
import { introEn } from "@/lib/rules/detail.en";

export function generateStaticParams() {
  return partKeys.map((key) => ({ key }));
}

export async function generateMetadata({ params }: PageProps<"/learn/part/[key]">): Promise<Metadata> {
  const { key } = await params;
  return partKeys.includes(key) ? { title: rulesUi.en.chapterNames[key], description: introEn[key] } : {};
}

export default async function PartRoute({ params }: PageProps<"/learn/part/[key]">) {
  const { key } = await params;
  if (!partKeys.includes(key)) notFound();
  return <PartPage partKey={key} />;
}
