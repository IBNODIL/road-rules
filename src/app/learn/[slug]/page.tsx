import { notFound, redirect } from "next/navigation";
import { lessonBySlug, lessons } from "@/lib/content";
import { lessonHref } from "@/lib/rules/data";

/* Lessons now live inside the first chapter of the course. Old links land on the right lesson. */
export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}

export default async function LessonRedirect({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  if (!lessonBySlug(slug)) notFound();
  redirect(lessonHref(slug));
}
