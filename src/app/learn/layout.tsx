import { LearnSidebar } from "@/components/LearnSidebar";

export default function LearnLayout({ children }: LayoutProps<"/learn">) {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-24 pt-32 lg:grid-cols-[300px_minmax(0,1fr)]">
      <LearnSidebar />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
