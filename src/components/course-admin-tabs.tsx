"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Settings, Sparkles, Users } from "lucide-react";
import { cn } from "./ui";

/** Sub-tabs inside one course in the admin: content, details, learners (and AI progress for AI-built courses). */
export function CourseAdminTabs({ programId, learners, hasAi }: { programId: string; learners: number; hasAi: boolean }) {
  const pathname = usePathname();
  const base = `/admin/programs/${programId}`;
  const tabs = [
    { href: base, label: "Content", icon: Layers, active: pathname === base || pathname.startsWith(`${base}/quiz`) || pathname.startsWith(`${base}/modules`) },
    { href: `${base}/details`, label: "Details & pricing", icon: Settings, active: pathname.startsWith(`${base}/details`) },
    { href: `${base}/learners`, label: `Learners (${learners})`, icon: Users, active: pathname.startsWith(`${base}/learners`) },
    ...(hasAi ? [{ href: `${base}/ai`, label: "AI writing", icon: Sparkles, active: pathname.startsWith(`${base}/ai`) }] : []),
  ];
  return (
    <nav aria-label="Course sections" className="flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none]">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition",
            t.active ? "border-primary text-primary" : "border-transparent text-muted hover:text-fg",
          )}
        >
          <t.icon className="h-4 w-4" aria-hidden /> {t.label}
        </Link>
      ))}
    </nav>
  );
}
