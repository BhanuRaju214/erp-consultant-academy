"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { BookOpenCheck, ChevronDown, House, Library, LogOut, Receipt, Search, ShieldCheck, UserRound } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { isCoursePath } from "@/lib/nav";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./wordmark";
import { cn } from "./ui";

interface Props {
  user: { name: string; email: string; role: "student" | "trainer" | "admin" };
  hasCourse: boolean;
  isStaff: boolean;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Oracle MyLearn-style application bar: brand, central search, icon navigation, account. */
export function TopNav({ user, hasCourse, isStaff }: Props) {
  const pathname = usePathname();
  const inCourse = isCoursePath(pathname);
  const menu = useRef<HTMLDetailsElement>(null);
  const links = [
    { href: "/dashboard", label: "Home", icon: House, match: (p: string) => p === "/dashboard" },
    { href: "/catalog", label: "Library", icon: Library, match: (p: string) => p.startsWith("/catalog") },
    ...(hasCourse ? [{ href: "/learn", label: "My course", icon: BookOpenCheck, match: (p: string) => isCoursePath(p) }] : []),
    ...(isStaff ? [{ href: "/trainer", label: "Admin", icon: ShieldCheck, match: (p: string) => p.startsWith("/trainer") || p.startsWith("/admin") }] : []),
  ];

  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 bg-[#0b1b3f] text-white no-print">
      <div className={cn("flex h-16 items-center gap-4 px-4 sm:px-6", inCourse ? "pl-16 lg:pl-6" : "mx-auto max-w-7xl lg:px-8")}>
        <Link href="/dashboard" className={cn("shrink-0", inCourse && "lg:hidden")} aria-label="Nexsademy home">
          <span className="hidden sm:block">
            <Wordmark inverse />
          </span>
          <span className="block sm:hidden">
            <Wordmark inverse compact />
          </span>
        </Link>

        <form action="/catalog" role="search" className="relative mx-auto hidden w-full max-w-xl md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/70" aria-hidden />
          <input
            name="q"
            type="search"
            placeholder="What do you want to learn?"
            aria-label="Search the library"
            className="w-full rounded-full border border-white/10 bg-white/10 py-2.5 pl-11 pr-4 text-[0.9375rem] text-white placeholder:text-white/65 transition focus:border-white/40 focus:bg-white/15 focus:outline-none"
          />
        </form>

        <nav aria-label="Primary" className="ml-auto flex items-stretch gap-1 md:ml-0">
          {links.map((l) => {
            const active = l.match(pathname);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative hidden min-w-16 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[0.6875rem] font-semibold transition sm:flex",
                  active ? "text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <l.icon className="h-5 w-5" aria-hidden />
                {l.label}
                <span className={cn("absolute inset-x-2.5 -bottom-[7px] h-[3px] rounded-full", active ? "bg-[#7fb0ff]" : "bg-transparent")} aria-hidden />
              </Link>
            );
          })}

          <details ref={menu} className="group relative">
            <summary className="flex h-full min-w-16 cursor-pointer list-none flex-col items-center justify-center gap-0.5 rounded-md px-2.5 py-1.5 text-[0.6875rem] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white [&::-webkit-details-marker]:hidden">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7fb0ff] text-[0.5625rem] font-bold text-[#0b1b3f]">
                {initials(user.name) || <UserRound className="h-3.5 w-3.5" />}
              </span>
              <span className="flex items-center gap-0.5">
                Account <ChevronDown className="h-3 w-3 transition group-open:rotate-180" aria-hidden />
              </span>
            </summary>
            <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-lg border border-border bg-surface text-fg shadow-[0_12px_32px_-8px_rgb(15_23_42/0.35)]">
              <div className="border-b border-border px-4 py-3">
                <div className="truncate text-sm font-bold">{user.name}</div>
                <div className="truncate text-xs text-muted">{user.email}</div>
                <span className="mt-2 inline-flex rounded bg-primary-soft px-1.5 py-0.5 text-[0.6875rem] font-bold capitalize text-primary">{user.role}</span>
              </div>
              <nav className="p-1.5 text-sm" aria-label="Account">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-2 sm:hidden">
                    <l.icon className="h-4 w-4 text-muted" aria-hidden /> {l.label}
                  </Link>
                ))}
                <Link href="/orders" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-2">
                  <Receipt className="h-4 w-4 text-muted" aria-hidden /> My orders
                </Link>
                <div className="flex items-center justify-between rounded-md px-3 py-1.5">
                  <span>Theme</span>
                  <ThemeToggle />
                </div>
                <form action={logoutAction} className="border-t border-border pt-1.5">
                  <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-surface-2">
                    <LogOut className="h-4 w-4 text-muted" aria-hidden /> Sign out
                  </button>
                </form>
              </nav>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
