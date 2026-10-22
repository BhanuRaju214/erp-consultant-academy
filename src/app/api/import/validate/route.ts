import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { courseApiUser } from "@/lib/auth/course-access";
import { detectDelimiter, parseCsv, rowsToRecords } from "@/lib/import/csv";
import { getTemplate, type TemplateKey } from "@/lib/import/templates";
import { validateImport } from "@/lib/import/validator";
import { parseWorkbook } from "@/lib/import/xlsx";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 5000;

const knownIdsSchema = z.record(z.string(), z.array(z.string().max(200)).max(20_000)).default({});

/**
 * POST /api/import/validate (multipart/form-data)
 *   template: template key
 *   file: .csv or .xlsx upload   — or —   csv: pasted CSV text
 *   knownIds: JSON object of External IDs already loaded in the simulated database
 *
 * Runs the import SIMULATOR. Nothing is written to Odoo or to the portal database.
 */
export async function POST(req: NextRequest) {
  const gate = await courseApiUser();
  if (!gate.ok) return gate.response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }
  const template = getTemplate(String(form.get("template") ?? ""));
  if (!template) return NextResponse.json({ error: "Choose a valid template." }, { status: 400 });

  let rows: string[][];
  const file = form.get("file");
  try {
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 2 MB for the simulator)." }, { status: 413 });
      const name = file.name.toLowerCase();
      if (name.endsWith(".xlsx")) {
        rows = await parseWorkbook(await file.arrayBuffer());
      } else if (name.endsWith(".csv") || name.endsWith(".txt")) {
        const text = await file.text();
        rows = parseCsv(text, detectDelimiter(text));
      } else {
        return NextResponse.json({ error: "Upload a .csv or .xlsx file." }, { status: 400 });
      }
    } else {
      const text = String(form.get("csv") ?? "");
      if (!text.trim()) return NextResponse.json({ error: "Upload a file or paste CSV content." }, { status: 400 });
      if (text.length > MAX_BYTES) return NextResponse.json({ error: "Content too large." }, { status: 413 });
      rows = parseCsv(text, detectDelimiter(text));
    }
  } catch {
    return NextResponse.json({ error: "The file could not be read. Check that it is a valid CSV (UTF-8) or XLSX file." }, { status: 400 });
  }

  if (rows.length - 1 > MAX_ROWS) return NextResponse.json({ error: `The simulator accepts up to ${MAX_ROWS} rows.` }, { status: 413 });

  let knownIds: Partial<Record<TemplateKey, string[]>> = {};
  try {
    knownIds = knownIdsSchema.parse(JSON.parse(String(form.get("knownIds") ?? "{}"))) as Partial<Record<TemplateKey, string[]>>;
  } catch {
    knownIds = {};
  }

  const { header, records } = rowsToRecords(rows);
  const result = validateImport(template, header, records, { knownIds });
  return NextResponse.json({ header, ...result });
}
