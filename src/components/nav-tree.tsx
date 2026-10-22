"use client";

import Link from "next/link";
import { ChevronRight, CircleCheck, Circle } from "lucide-react";
import type { NavNode } from "@/lib/services/nav-tree";
import { cn } from "./ui";

/** Path (list of node ids) from the root to the node whose href matches the current page. */
export function findActivePath(nodes: NavNode[], pathname: string, trail: string[] = []): string[] | null {
  for (const n of nodes) {
    const here = [...trail, n.id];
    if (n.href && !n.href.includes("#") && n.href === pathname) return here;
    if (n.children) {
      const found = findActivePath(n.children, pathname, here);
      if (found) return found;
    }
  }
  return null;
}

/** Keeps nodes whose label matches the query, or that contain matching descendants. */
export function filterNodes(nodes: NavNode[], q: string): NavNode[] {
  if (!q) return nodes;
  const out: NavNode[] = [];
  for (const n of nodes) {
    if (n.label.toLowerCase().includes(q)) {
      out.push(n);
      continue;
    }
    const kids = n.children ? filterNodes(n.children, q) : [];
    if (kids.length) out.push({ ...n, children: kids });
  }
  return out;
}

export function collectGroupIds(nodes: NavNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.children?.length) {
      acc.push(n.id);
      collectGroupIds(n.children, acc);
    }
  }
  return acc;
}

/** Animated expand/collapse wrapper; closed content is inert so it can't receive focus. */
export function Collapsible({ open, id, children, className }: { open: boolean; id: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

interface TreeProps {
  nodes: NavNode[];
  depth: number;
  pathname: string;
  expanded: Set<string>;
  forceOpen: boolean;
  onToggle: (id: string) => void;
  onNavigate: () => void;
}

export function NavTreeList({ nodes, depth, pathname, expanded, forceOpen, onToggle, onNavigate }: TreeProps) {
  return (
    <ul className={cn("space-y-0.5", depth > 0 && "ml-2 border-l border-white/10 pl-2")} role="list">
      {nodes.map((n) => {
        const hasKids = Boolean(n.children?.length);
        const isOpen = forceOpen || expanded.has(n.id);
        const active = Boolean(n.href && !n.href.includes("#") && n.href === pathname);
        const panelId = `nav-${n.id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

        const status =
          n.done === undefined ? null : n.done ? (
            <CircleCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-label="Completed" />
          ) : (
            <Circle className="h-3.5 w-3.5 shrink-0 text-sidebar-text/40" aria-label="Not completed" />
          );

        const badge = n.badge && <span className="ml-auto shrink-0 rounded bg-white/10 px-1.5 py-px text-[0.625rem] tabular-nums text-sidebar-text">{n.badge}</span>;

        return (
          <li key={n.id}>
            {hasKids && !n.href ? (
              <button
                type="button"
                onClick={() => onToggle(n.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                title={n.label}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[0.8125rem] text-sidebar-text transition hover:bg-white/5 hover:text-white"
              >
                <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-200", isOpen && "rotate-90")} aria-hidden />
                <span className="truncate font-medium">{n.label}</span>
                {badge}
              </button>
            ) : (
              <div className="flex items-center">
                <Link
                  href={n.href!}
                  onClick={onNavigate}
                  title={n.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-[0.8125rem] transition",
                    active ? "bg-white/10 font-medium text-white shadow-[inset_2px_0_0_var(--accent)]" : "text-sidebar-text hover:bg-white/5 hover:text-white",
                  )}
                >
                  {status}
                  <span className="truncate">{n.label}</span>
                  {badge}
                </Link>
                {hasKids && (
                  <button
                    type="button"
                    onClick={() => onToggle(n.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${n.label}`}
                    className="rounded-md p-1.5 text-sidebar-text hover:bg-white/5 hover:text-white"
                  >
                    <ChevronRight className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-90")} aria-hidden />
                  </button>
                )}
              </div>
            )}
            {hasKids && (
              <Collapsible open={isOpen} id={panelId}>
                <div className="pt-0.5">
                  <NavTreeList
                    nodes={n.children!}
                    depth={depth + 1}
                    pathname={pathname}
                    expanded={expanded}
                    forceOpen={forceOpen}
                    onToggle={onToggle}
                    onNavigate={onNavigate}
                  />
                </div>
              </Collapsible>
            )}
          </li>
        );
      })}
    </ul>
  );
}
