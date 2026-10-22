"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  Boxes,
  Briefcase,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronsDownUp,
  ChevronsUpDown,
  ClipboardCheck,
  Code2,
  DatabaseZap,
  GraduationCap,
  LayoutDashboard,
  Library,
  LibraryBig,
  Menu,
  MessagesSquare,
  Plug,
  Route,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { NAV, PLATFORM_NAV, SECONDARY_NAV, isCoursePath, type NavItem } from "@/lib/nav";
import { copyrightLine } from "@/lib/brand";
import type { NavTree } from "@/lib/services/nav-tree";
import { Wordmark } from "./wordmark";
import { Collapsible, NavTreeList, collectGroupIds, filterNodes, findActivePath } from "./nav-tree";
import { cn } from "./ui";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  GraduationCap,
  Workflow,
  Boxes,
  Route,
  SlidersHorizontal,
  DatabaseZap,
  Code2,
  Plug,
  ClipboardCheck,
  Briefcase,
  Award,
  Library,
  LibraryBig,
  ChartNoAxesCombined,
  ShieldCheck,
  Sparkles,
  MessagesSquare,
};

/**
 * Top-level navigation row. In the collapsed desktop rail (`rail:lg:` variants) only the
 * icon is shown; the label stays available to screen readers and as a native tooltip.
 * In expanded mode, sections with sub-content get a dropdown toggle.
 */
function NavRow({
  item,
  active,
  onNavigate,
  dropdown,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
  dropdown?: { open: boolean; controls: string; onToggle: () => void };
}) {
  const Icon = ICONS[item.icon] ?? LayoutDashboard;
  return (
    <div className={cn("relative flex items-center rounded-lg transition", active ? "bg-sidebar-active" : "hover:bg-white/5")}>
      {active && <span className="absolute inset-y-1.5 left-0 hidden w-0.5 rounded-full bg-accent rail:lg:block" aria-hidden />}
      <Link
        href={item.href}
        onClick={onNavigate}
        title={item.label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-sm rail:lg:justify-center rail:lg:px-0 rail:lg:py-2.5",
          active ? "font-medium text-white" : "text-sidebar-text hover:text-white",
        )}
      >
        <Icon className="h-4 w-4 shrink-0 rail:lg:h-5 rail:lg:w-5" aria-hidden />
        <span className="truncate rail:lg:sr-only">{item.label}</span>
      </Link>
      {dropdown && (
        <button
          type="button"
          onClick={dropdown.onToggle}
          aria-expanded={dropdown.open}
          aria-controls={dropdown.controls}
          aria-label={`${dropdown.open ? "Hide" : "Show"} ${item.label} contents`}
          title={`${dropdown.open ? "Hide" : "Show"} contents`}
          className="mr-1 rounded-md p-1.5 text-sidebar-text transition hover:bg-white/10 hover:text-white rail:lg:hidden"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", dropdown.open && "rotate-180")} aria-hidden />
        </button>
      )}
    </div>
  );
}

const STORAGE_KEY = "sidebar";

function isEditable(el: EventTarget | null) {
  return el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

/** Ids to expand so the current page is visible in the tree (top-level href + ancestor groups). */
function activeIds(items: NavItem[], tree: NavTree, pathname: string): string[] {
  const ids: string[] = [];
  for (const item of items) {
    const sub = tree[item.href] ?? [];
    const path = findActivePath(sub, pathname);
    if (path) ids.push(item.href, ...path.slice(0, -1));
    else if (sub.length && (pathname === item.href || pathname.startsWith(item.href + "/"))) ids.push(item.href);
  }
  return ids;
}

export function Sidebar({ role, tree, courseTitle }: { role: "student" | "trainer" | "admin"; tree: NavTree; courseTitle: string }) {
  const pathname = usePathname();
  // Inside the course: its 14 sections. Elsewhere: platform pages (dashboard, catalogue, admin).
  const inCourse = isCoursePath(pathname);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const items = useMemo(() => (inCourse ? NAV : PLATFORM_NAV).filter((i) => !i.roles || i.roles.includes(role)), [role, inCourse]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(activeIds(items, tree, pathname)));
  const [query, setQuery] = useState("");
  useEffect(() => setOpen(false), [pathname]);

  // Reveal the current page's branch on navigation (never closes branches the user opened).
  useEffect(() => {
    const ids = activeIds(items, tree, pathname);
    if (ids.length) setExpanded((prev) => (ids.every((id) => prev.has(id)) ? prev : new Set([...prev, ...ids])));
    const t = setTimeout(() => {
      document.querySelector('#desktop-sidebar nav [aria-current="page"]')?.scrollIntoView({ block: "nearest" });
    }, 250);
    return () => clearTimeout(t);
  }, [pathname, items, tree]);

  // The pre-paint script in the root layout already applied the saved state; sync React with it.
  useEffect(() => setCollapsed(document.documentElement.dataset.sidebar === "collapsed"), []);

  const toggleCollapsed = useCallback(() => {
    const next = document.documentElement.dataset.sidebar !== "collapsed";
    if (next) document.documentElement.dataset.sidebar = "collapsed";
    else delete document.documentElement.dataset.sidebar;
    try {
      localStorage.setItem(STORAGE_KEY, next ? "collapsed" : "expanded");
    } catch {
      /* storage unavailable — state still applies for this page view */
    }
    setCollapsed(next);
  }, []);

  // Ctrl/⌘ + B toggles the navigation (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "b" && !isEditable(e.target)) {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allGroupIds = useMemo(() => items.flatMap((i) => (tree[i.href]?.length ? [i.href, ...collectGroupIds(tree[i.href])] : [])), [items, tree]);

  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/"));
  const q = query.trim().toLowerCase();
  const closeDrawer = () => setOpen(false);

  // Visible top-level sections and their (possibly filtered) sub-trees.
  const sections = items
    .map((item, idx) => {
      const label = inCourse ? `${idx + 1}. ${item.label}` : item.label;
      const sub = tree[item.href] ?? [];
      const matchesSelf = q !== "" && label.toLowerCase().includes(q);
      const visibleSub = q && !matchesSelf ? filterNodes(sub, q) : sub;
      return { item, idx, label, visibleSub, hidden: Boolean(q) && !matchesSelf && visibleSub.length === 0 };
    })
    .filter((s) => !s.hidden);

  const nav = (
    <nav aria-label="Main" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 pb-6 [scrollbar-width:thin] rail:lg:px-2">
      {inCourse && (
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          title="All courses"
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-[0.8125rem] text-sidebar-text hover:bg-white/5 hover:text-white rail:lg:justify-center rail:lg:px-0"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          <span className="rail:lg:sr-only">All courses</span>
        </Link>
      )}
      {inCourse && (
      <div className="mb-2 flex items-center gap-1 rail:lg:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-text/60" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Filter sections & lessons…"
            aria-label="Filter navigation"
            className="w-full rounded-md border border-white/10 bg-white/5 py-1.5 pl-8 pr-2 text-[0.8125rem] text-white placeholder:text-sidebar-text/60 focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(new Set(allGroupIds))}
          title="Expand all"
          aria-label="Expand all sections"
          className="rounded-md p-1.5 text-sidebar-text hover:bg-white/10 hover:text-white"
        >
          <ChevronsUpDown className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setExpanded(new Set())}
          title="Collapse all"
          aria-label="Collapse all sections"
          className="rounded-md p-1.5 text-sidebar-text hover:bg-white/10 hover:text-white"
        >
          <ChevronsDownUp className="h-4 w-4" aria-hidden />
        </button>
      </div>
      )}

      <ul className="space-y-1" role="list">
        {sections.map(({ item, idx, label, visibleSub }) => {
          const hasSub = visibleSub.length > 0;
          const isOpen = Boolean(q) || expanded.has(item.href);
          const panelId = `nav-sub-${idx}`;
          return (
            <li key={item.href}>
              <NavRow
                item={{ ...item, label }}
                active={isActive(item)}
                onNavigate={closeDrawer}
                dropdown={hasSub ? { open: isOpen, controls: panelId, onToggle: () => toggle(item.href) } : undefined}
              />
              {hasSub && (
                <Collapsible open={isOpen} id={panelId} className="rail:lg:hidden">
                  <div className="pb-1 pl-4 pt-0.5">
                    <NavTreeList
                      nodes={visibleSub}
                      depth={1}
                      pathname={pathname}
                      expanded={expanded}
                      forceOpen={Boolean(q)}
                      onToggle={toggle}
                      onNavigate={closeDrawer}
                    />
                  </div>
                </Collapsible>
              )}
            </li>
          );
        })}
      </ul>
      {q && sections.length === 0 && <p className="px-3 py-2 text-xs text-sidebar-text/70 rail:lg:hidden">No sections or lessons match “{query}”.</p>}

      {inCourse && (
        <>
          <div className="mx-3 my-3 border-t border-white/10 rail:lg:mx-1" />
          {SECONDARY_NAV.map((item) => (
            <NavRow key={item.href} item={item} active={isActive(item)} onNavigate={closeDrawer} />
          ))}
        </>
      )}
      <p className="mt-auto px-3 pt-6 text-[0.6875rem] leading-snug text-sidebar-text/80 rail:lg:hidden">{copyrightLine()}</p>
    </nav>
  );

  const brand = (
    <div className="px-5 pb-4 pt-5 rail:lg:px-0 rail:lg:py-4">
      <Link href="/dashboard" className="block rail:lg:flex rail:lg:justify-center" aria-label="Nexsademy dashboard">
        {/* Full logo normally, monogram only in the collapsed rail. Visibility is set on wrappers so it can't clash with the logo's own display class. */}
        <span className="block rail:lg:hidden">
          <Wordmark inverse />
        </span>
        <span className="hidden rail:lg:block">
          <Wordmark compact />
        </span>
      </Link>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-3 rail:lg:hidden">
        <div className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[#f2c35b]">Your course</div>
        <div className="mt-1 font-display text-[0.9375rem] font-semibold leading-snug text-white">{courseTitle}</div>
      </div>
    </div>
  );

  const toggleLabel = collapsed ? "Expand navigation" : "Collapse navigation";

  // Platform pages (dashboard, catalogue, admin) use the top navigation only.
  if (!inCourse) return null;

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-3 z-40 rounded-lg border border-border bg-surface p-2 text-fg shadow lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside
        id="desktop-sidebar"
        className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-sidebar transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex rail:lg:w-[4.5rem] no-print"
      >
        {brand}
        {nav}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-controls="desktop-sidebar"
          aria-expanded={!collapsed}
          aria-label={toggleLabel}
          title={`${toggleLabel} (Ctrl+B)`}
          className="absolute -right-3.5 top-[18px] z-40 flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-[#0b1b3f] text-white/80 shadow-md transition hover:scale-110 hover:border-[#7fb0ff] hover:text-white focus-visible:scale-110"
        >
          <ChevronLeft className="h-4 w-4 transition-transform duration-200 rail:rotate-180" aria-hidden />
        </button>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />
          <aside className="absolute inset-y-0 left-0 flex w-80 max-w-[88vw] flex-col bg-sidebar">
            <div className="flex items-center justify-between pr-3">
              {brand}
              <button type="button" onClick={closeDrawer} className="rounded p-2 text-sidebar-text hover:text-white" aria-label="Close navigation">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
