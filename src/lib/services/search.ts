import { sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";

export interface SearchHit {
  kind: "lesson" | "doc" | "process";
  title: string;
  href: string;
  context: string;
  snippet: string;
  rank: number;
}

/**
 * PostgreSQL full-text search across lessons, documentation and business processes.
 * Uses websearch_to_tsquery so users can type natural queries ("opening stock -lot").
 */
export async function searchContent(db: Db, query: string, limit = 25): Promise<SearchHit[]> {
  const q = query.trim().slice(0, 200);
  if (q.length < 2) return [];
  const result = await db.execute<{
    kind: SearchHit["kind"];
    title: string;
    href: string;
    context: string;
    snippet: string;
    rank: number;
  }>(sql`
    with q as (select websearch_to_tsquery('english', ${q}) as tsq)
    select * from (
      select 'lesson' as kind, l.title, '/courses/' || c.slug || '/' || l.slug as href, c.title as context,
             ts_headline('english', l.body, q.tsq, 'MaxFragments=1,MaxWords=30,MinWords=12,StartSel=«,StopSel=»') as snippet,
             ts_rank(setweight(to_tsvector('english', l.title), 'A') || to_tsvector('english', l.body), q.tsq) as rank
      from lessons l
      join course_modules m on m.id = l.module_id
      join courses c on c.id = m.course_id, q
      where c.published and (setweight(to_tsvector('english', l.title), 'A') || to_tsvector('english', l.body)) @@ q.tsq
      union all
      select 'doc', d.title, '/docs/' || d.slug, d.category,
             ts_headline('english', d.body, q.tsq, 'MaxFragments=1,MaxWords=30,MinWords=12,StartSel=«,StopSel=»'),
             ts_rank(setweight(to_tsvector('english', d.title), 'A') || to_tsvector('english', d.body), q.tsq)
      from doc_resources d, q
      where (setweight(to_tsvector('english', d.title), 'A') || to_tsvector('english', d.body)) @@ q.tsq
      union all
      select 'process', p.title, '/processes/' || p.slug, p.short_name,
             ts_headline('english', p.summary || ' ' || (p.data->>'objective'), q.tsq, 'MaxFragments=1,MaxWords=30,MinWords=12,StartSel=«,StopSel=»'),
             ts_rank(to_tsvector('english', p.title || ' ' || p.data::text), q.tsq)
      from business_processes p, q
      where to_tsvector('english', p.title || ' ' || p.data::text) @@ q.tsq
    ) hits
    order by rank desc
    limit ${limit}
  `);
  return result.rows.map((r) => ({ ...r, rank: Number(r.rank) }));
}

/** Retrieves full-text passages for grounding the AI assistant. */
export async function retrievePassages(db: Db, query: string, limit = 4): Promise<{ title: string; href: string; text: string }[]> {
  const q = query.trim().slice(0, 300);
  if (q.length < 3) return [];
  // OR the meaningful words together so long natural-language questions still match.
  const words = Array.from(new Set(q.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])).slice(0, 12);
  if (!words.length) return [];
  const result = await db.execute<{ title: string; href: string; body: string }>(sql`
    with q as (select to_tsquery('english', ${words.join(" | ")}) as tsq)
    select title, href, body from (
      select l.title, '/courses/' || c.slug || '/' || l.slug as href, l.body,
             ts_rank(setweight(to_tsvector('english', l.title), 'A') || to_tsvector('english', l.body), q.tsq) as rank
      from lessons l join course_modules m on m.id = l.module_id join courses c on c.id = m.course_id, q
      where to_tsvector('english', l.title || ' ' || l.body) @@ q.tsq
      union all
      select d.title, '/docs/' || d.slug, d.body,
             ts_rank(setweight(to_tsvector('english', d.title), 'A') || to_tsvector('english', d.body), q.tsq)
      from doc_resources d, q
      where to_tsvector('english', d.title || ' ' || d.body) @@ q.tsq
    ) hits order by rank desc limit ${limit}
  `);
  return result.rows.map((r) => ({ title: r.title, href: r.href, text: r.body.slice(0, 3500) }));
}
