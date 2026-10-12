import { notFound, redirect } from "next/navigation";
import { allRuleIds, ruleHref, ruleIdFromSlug, ruleSlug } from "@/lib/rules/data";

/* A chapter is one page now. Old rule links land on the right lesson of that chapter. */
export function generateStaticParams() {
  return allRuleIds.map((id) => ({ id: ruleSlug(id) }));
}

export default async function RuleRedirect({ params }: PageProps<"/learn/rules/[id]">) {
  const { id } = await params;
  const rid = ruleIdFromSlug(id);
  if (!rid) notFound();
  redirect(ruleHref(rid));
}
