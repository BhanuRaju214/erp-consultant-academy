import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { toCsv } from "@/lib/import/csv";
import { getTemplate } from "@/lib/import/templates";
import type { ProjectContent } from "@/content/types";

/** GET /api/projects/:slug/files/:index — downloads a project master data file as CSV. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string; index: string }> }) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, index } = await params;
  const project = await (await getDb()).query.projects.findFirst({ where: eq(projects.slug, slug) });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = project.data as ProjectContent;
  const file = data.masterDataFiles[Number(index)];
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Use the template's column order when the file maps to an import template.
  const template = file.templateKey ? getTemplate(file.templateKey) : undefined;
  const header = template ? template.fields.map((f) => f.column) : Array.from(new Set(file.rows.flatMap((r) => Object.keys(r))));
  const name = `${slug}_${file.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}.csv`;
  return new NextResponse("﻿" + toCsv(header, file.rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"` },
  });
}
