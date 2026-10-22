"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BookCopy, Images, LayoutDashboard, Receipt, TicketPercent, Users } from "lucide-react";
import { Container, cn } from "./ui";

type Role = "student" | "trainer" | "admin";

const TABS: { href: string; label: string; icon: typeof Users; roles: Role[]; match: (p: string) => boolean }[] = [
  { href: "/trainer", label: "Overview", icon: LayoutDashboard, roles: ["trainer", "admin"], match: (p) => p.startsWith("/trainer") },
  {
    href: "/admin/programs",
    label: "Courses",
    icon: BookCopy,
    roles: ["admin"],
    // A course's modules, lessons, quizzes and AI writing all live inside the course.
    match: (p) => ["/admin/programs", "/admin/modules", "/admin/courses", "/admin/lessons", "/admin/ai"].some((x) => p.startsWith(x)),
  },
  { href: "/admin/orders", label: "Orders", icon: Receipt, roles: ["admin"], match: (p) => p.startsWith("/admin/orders") },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent, roles: ["admin"], match: (p) => p.startsWith("/admin/coupons") },
  { href: "/admin/media", label: "Media", icon: Images, roles: ["trainer", "admin"], match: (p) => p.startsWith("/admin/media") },
  { href: "/admin", label: "Users", icon: Users, roles: ["admin"], match: (p) => p === "/admin" },
];

/** Admin area chrome (Oracle MyLearn style): navy title band and section tabs. */
export function AdminFrame({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const tabs = TABS.filter((t) => t.roles.includes(role));
  return (
    <div className="admin-area">
      <section className="bg-[#0b1b3f] text-white">
        <Container className="pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7fb0ff]">{role === "admin" ? "Administration" : "Trainer tools"}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">Admin</h1>
          <nav aria-label="Admin sections" className="mt-6 -mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {tabs.map((t) => {
              const active = t.match(pathname);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-t-md border-b-[3px] px-4 py-3 text-sm font-semibold transition",
                    active ? "border-[#7fb0ff] bg-white/10 text-white" : "border-transparent text-white/70 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <t.icon className="h-4 w-4" aria-hidden /> {t.label}
                </Link>
              );
            })}
          </nav>
        </Container>
      </section>
      <Container className="py-8">{children}</Container>
    </div>
  );
}
