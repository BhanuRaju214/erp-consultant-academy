import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { searchContent } from "@/lib/services/search";
import { Badge, Card, EmptyState, PageHeader, buttonClass, inputClass } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

export const metadata = { title: "Search" };

/** Renders ts_headline output safely: «…» markers become <mark>, everything else is plain text. */
function Snippet({ text }: { text: string }) {
  const parts = text.split(/(«[^»]*»)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("«") ? (
          <mark key={i} className="rounded bg-warning-soft px-0.5 text-fg">
            {p.slice(1, -1)}
          </mark>
        ) : (
          <span key={i}>{p.replace(/[#*_`>|]/g, " ")}</span>
        ),
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireCourseUser();
  await requireUser();
  const q = ((await searchParams).q ?? "").trim();
  const hits = q ? await searchContent(await getDb(), q) : [];
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Search" description="Full-text search across lessons, business processes and documentation." />
      <form className="mb-6 flex gap-2" role="search">
        <label htmlFor="search-q" className="sr-only">
          Search
        </label>
        <input id="search-q" name="q" defaultValue={q} placeholder='e.g. "opening stock" valuation' className={inputClass} autoFocus />
        <button className={buttonClass("primary")}>Search</button>
      </form>
      {q && !hits.length && <EmptyState title={`No results for "${q}"`}>Try fewer or different words, or ask the AI learning assistant.</EmptyState>}
      {hits.length > 0 && (
        <ul className="space-y-3">
          {hits.map((h, i) => (
            <li key={i}>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Badge tone={h.kind === "lesson" ? "primary" : h.kind === "doc" ? "info" : "success"}>{h.kind}</Badge>
                  <span className="text-xs text-muted">{h.context}</span>
                </div>
                <Link href={h.href} className="mt-1 block font-medium text-fg hover:text-primary">
                  {h.title}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  <Snippet text={h.snippet} />
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
