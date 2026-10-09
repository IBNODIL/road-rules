import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RulePage } from "@/components/RulePage";
import { allRuleIds, ruleIdFromSlug, ruleSlug } from "@/lib/rules/data";
import { textEn } from "@/lib/rules/text.en";

export function generateStaticParams() {
  return allRuleIds.map((id) => ({ id: ruleSlug(id) }));
}

export async function generateMetadata({ params }: PageProps<"/learn/rules/[id]">): Promise<Metadata> {
  const { id } = await params;
  const rid = ruleIdFromSlug(id);
  return rid ? { title: textEn[rid][0], description: textEn[rid][1] } : {};
}

export default async function RuleRoute({ params }: PageProps<"/learn/rules/[id]">) {
  const { id } = await params;
  if (!ruleIdFromSlug(id)) notFound();
  return <RulePage slug={id} />;
}
