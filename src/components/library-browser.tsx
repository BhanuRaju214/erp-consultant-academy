"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, FilterX, Search, SlidersHorizontal } from "lucide-react";
import { ITEM_TYPES, ROLES, TYPE_LABEL, type ItemType, type LibraryItem } from "@/lib/services/library";
import { LibraryThumb, TYPE_COLORS } from "./library-thumb";
import { cn } from "./ui";

const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const SECTION_TITLE: Record<ItemType, string> = {
  course: "Modules",
  process: "Business processes",
  lab: "Hands-on labs",
  project: "Real-time projects",
  assessment: "Assessments & certification",
};

/** Oracle MyLearn-style card: type badge, title, summary, facts and roles. */
export function LibraryCard({ item }: { item: LibraryItem }) {
  const [main] = TYPE_COLORS[item.type];
  const pct = item.progress?.total ? Math.round((item.progress.done / item.progress.total) * 100) : 0;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgb(15_23_42/0.08)] transition hover:shadow-[0_6px_20px_-6px_rgb(15_23_42/0.25)]">
      <LibraryThumb type={item.type} title={item.title} category={item.category} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded px-1.5 py-0.5 text-[0.6875rem] font-bold text-white" style={{ backgroundColor: main }}>
            {TYPE_LABEL[item.type]}
          </span>
          {item.level && <span className="rounded border border-border px-1.5 py-0.5 text-[0.6875rem] font-semibold capitalize text-muted">{item.level}</span>}
          {pct === 100 && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[0.6875rem] font-bold text-success">Completed</span>}
        </div>
        <h3 className="mt-2.5 text-[0.9375rem] font-bold leading-snug text-fg">
          <Link href={item.href} className="after:absolute after:inset-0 group-hover:text-primary group-hover:underline">
            {item.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted">{item.summary}</p>
        <dl className="mt-auto grid grid-cols-2 gap-3 pt-4 text-xs">
          <div>
            <dt className="text-muted">{item.type === "course" ? "Duration" : "Details"}</dt>
            <dd className="mt-0.5 truncate font-semibold text-fg">{item.meta.join(" · ")}</dd>
          </div>
          <div>
            <dt className="text-muted">Roles</dt>
            <dd className="mt-0.5 truncate font-semibold text-fg" title={item.roles.join(", ")}>
              {item.roles.join(", ") || "All learners"}
            </dd>
          </div>
        </dl>
        {item.progress && item.progress.done > 0 && pct < 100 && (
          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-[0.6875rem] text-muted">{pct}% complete</div>
          </div>
        )}
      </div>
    </article>
  );
}

function FilterGroup<T extends string>({
  title,
  options,
  selected,
  counts,
  label,
  onToggle,
}: {
  title: string;
  options: readonly T[];
  selected: Set<T>;
  counts: Map<T, number>;
  label: (v: T) => string;
  onToggle: (v: T) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-fg" aria-expanded={open}>
        {title}
        <ChevronDown className={cn("h-4 w-4 text-muted transition", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <ul className="mt-3 space-y-2">
          {options.map((o) => (
            <li key={o}>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-fg">
                <input type="checkbox" checked={selected.has(o)} onChange={() => onToggle(o)} className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--primary)]" />
                <span className="flex-1">{label(o)}</span>
                <span className="text-xs text-muted">{counts.get(o) ?? 0}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LibraryBrowser({ items, initialQuery = "", initialRole }: { items: LibraryItem[]; initialQuery?: string; initialRole?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [roles, setRoles] = useState<Set<(typeof ROLES)[number]>>(() => new Set(ROLES.filter((r) => r === initialRole)));
  const [types, setTypes] = useState<Set<ItemType>>(new Set());
  const [levels, setLevels] = useState<Set<(typeof LEVELS)[number]>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const toggle = <T,>(set: Set<T>, setter: (s: Set<T>) => void, v: T) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  };

  const q = query.trim().toLowerCase();
  const matches = (i: LibraryItem, ignore?: "role" | "type" | "level") =>
    (!q || `${i.title} ${i.summary} ${i.category}`.toLowerCase().includes(q)) &&
    (ignore === "role" || roles.size === 0 || i.roles.some((r) => roles.has(r))) &&
    (ignore === "type" || types.size === 0 || types.has(i.type)) &&
    (ignore === "level" || levels.size === 0 || (i.level !== null && levels.has(i.level)));

  const results = useMemo(() => items.filter((i) => matches(i)), [items, q, roles, types, levels]); // eslint-disable-line react-hooks/exhaustive-deps
  const count = <T extends string>(field: "role" | "type" | "level", values: readonly T[]) =>
    new Map(
      values.map((v) => [
        v,
        items.filter((i) => matches(i, field) && (field === "role" ? i.roles.includes(v as never) : field === "type" ? i.type === v : i.level === v)).length,
      ]),
    );
  const activeFilters = roles.size + types.size + levels.size;
  const clear = () => {
    setRoles(new Set());
    setTypes(new Set());
    setLevels(new Set());
    setQuery("");
  };
  const grouped = activeFilters === 0 && !q;

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      <aside className={cn("lg:block", showFilters ? "block" : "hidden")} aria-label="Filters">
        <div className="sticky top-24 rounded-lg border border-border bg-surface px-4">
          <div className="flex items-center justify-between border-b border-border py-3">
            <span className="flex items-center gap-2 text-sm font-bold text-fg">
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filter ({activeFilters})
            </span>
            <button type="button" onClick={clear} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:text-muted disabled:no-underline" disabled={!activeFilters && !q}>
              <FilterX className="h-3.5 w-3.5" aria-hidden /> Clear
            </button>
          </div>
          <FilterGroup title="Role" options={ROLES} selected={roles} counts={count("role", ROLES)} label={(v) => v} onToggle={(v) => toggle(roles, setRoles, v)} />
          <FilterGroup title="Type" options={ITEM_TYPES} selected={types} counts={count("type", ITEM_TYPES)} label={(v) => TYPE_LABEL[v]} onToggle={(v) => toggle(types, setTypes, v)} />
          <FilterGroup title="Level" options={LEVELS} selected={levels} counts={count("level", LEVELS)} label={(v) => v[0].toUpperCase() + v.slice(1)} onToggle={(v) => toggle(levels, setLevels, v)} />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search the library</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules, processes, labs, projects…"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-fg shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
            />
          </label>
          <button type="button" onClick={() => setShowFilters((s) => !s)} className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-fg lg:hidden">
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters {activeFilters ? `(${activeFilters})` : ""}
          </button>
        </div>

        {grouped ? (
          ITEM_TYPES.map((t) => {
            const list = items.filter((i) => i.type === t);
            if (!list.length) return null;
            return (
              <section key={t} className="mt-10 first:mt-8">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-xl font-extrabold tracking-[-0.02em] text-fg">{SECTION_TITLE[t]}</h2>
                  <button type="button" onClick={() => setTypes(new Set([t]))} className="text-sm font-semibold text-primary hover:underline">
                    View all {list.length}
                  </button>
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {list.slice(0, 6).map((i) => (
                    <LibraryCard key={i.id} item={i} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <section className="mt-6">
            <p className="text-sm text-muted" aria-live="polite">
              {results.length} {results.length === 1 ? "result" : "results"}
            </p>
            {results.length ? (
              <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((i) => (
                  <LibraryCard key={i.id} item={i} />
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
                Nothing matches those filters.{" "}
                <button type="button" onClick={clear} className="font-semibold text-primary hover:underline">
                  Clear filters
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
