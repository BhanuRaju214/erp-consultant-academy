import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { generateDataset } from "@/lib/import/generator";
import { getTemplate, isTemplateKey } from "@/lib/import/templates";
import { toCsv } from "@/lib/import/csv";

const schema = z.object({
  business: z.enum(["trading", "retail", "manufacturing", "services"]).default("trading"),
  seed: z.coerce.number().int().min(1).max(999_999).default(42),
  customers: z.coerce.number().int().min(1).max(500).default(20),
  vendors: z.coerce.number().int().min(1).max(200).default(8),
  products: z.coerce.number().int().min(1).max(500).default(24),
  inject: z.enum(["0", "1"]).default("0"),
  file: z.string().optional(),
});

/**
 * GET /api/sample-data?business=trading&seed=42&inject=1           → JSON dataset (+ answer key)
 * GET /api/sample-data?...&file=customers                           → CSV download of one file
 */
export async function GET(req: NextRequest) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const o = parsed.data;
  const data = generateDataset({ business: o.business, seed: o.seed, customers: o.customers, vendors: o.vendors, products: o.products, injectErrors: o.inject === "1" });

  if (o.file) {
    if (!isTemplateKey(o.file)) return NextResponse.json({ error: "Unknown file" }, { status: 404 });
    const t = getTemplate(o.file)!;
    const header = t.fields.map((f) => f.column);
    return new NextResponse("﻿" + toCsv(header, data.files[o.file]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${o.business}_${o.file}_seed${o.seed}${o.inject === "1" ? "_with_errors" : ""}.csv"`,
      },
    });
  }
  return NextResponse.json(data);
}
