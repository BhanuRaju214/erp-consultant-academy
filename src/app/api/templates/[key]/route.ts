import { NextResponse, type NextRequest } from "next/server";
import { courseApiUser } from "@/lib/auth/course-access";
import { getTemplate } from "@/lib/import/templates";
import { toCsv } from "@/lib/import/csv";
import { buildTemplateWorkbook } from "@/lib/import/xlsx";

/** GET /api/templates/:key?format=csv|xlsx&sample=0|1 — downloadable import templates. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const gate = await courseApiUser();
  if (!gate.ok) return gate.response;
  const { key } = await params;
  const template = getTemplate(key);
  if (!template) return NextResponse.json({ error: "Unknown template" }, { status: 404 });

  const format = req.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  const withSample = req.nextUrl.searchParams.get("sample") !== "0";
  const rows = withSample ? template.sampleRows : [];
  const header = template.fields.map((f) => f.column);
  const base = `odoo17_${template.key.replace(/-/g, "_")}_template`;

  if (format === "xlsx") {
    const buf = await buildTemplateWorkbook(template, rows);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${base}.xlsx"`,
      },
    });
  }
  return new NextResponse("﻿" + toCsv(header, rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${base}.csv"` },
  });
}
