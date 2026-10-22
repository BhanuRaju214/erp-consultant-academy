"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";
import type { TocItem } from "@/lib/visuals/enhance";
import { cn } from "./ui";

/** "On this page" outline with the section currently in view highlighted. */
export function LessonToc({ items, variant = "sidebar" }: { items: TocItem[]; variant?: "sidebar" | "inline" }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  const list = (
    <ol className="space-y-0.5 border-l border-border">
      {items.map((i) => (
        <li key={i.id}>
          <a
            href={`#${i.id}`}
            aria-current={active === i.id ? "location" : undefined}
            className={cn(
              "-ml-px block border-l-2 py-1 pl-3 text-[0.8125rem] leading-snug transition",
              active === i.id ? "border-primary font-medium text-primary" : "border-transparent text-muted hover:border-border hover:text-fg",
            )}
          >
            {i.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "inline") {
    return (
      <details className="mb-6 rounded-xl border border-border bg-surface p-3 xl:hidden">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-fg">
          <ListTree className="h-4 w-4 text-primary" aria-hidden /> On this page ({items.length} sections)
        </summary>
        <nav className="mt-3" aria-label="On this page">
          {list}
        </nav>
      </details>
    );
  }
  return (
    <nav aria-label="On this page">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <ListTree className="h-3.5 w-3.5" aria-hidden /> On this page
      </div>
      {list}
    </nav>
  );
}
