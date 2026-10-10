import ExcelJS from "exceljs";
import type { ImportTemplate } from "./templates";

/** Builds an import workbook: "Data" sheet (Odoo-ready) + "Field Guide" sheet. */
export async function buildTemplateWorkbook(template: ImportTemplate, rows: Record<string, string>[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ERP Consultant Academy";
  const header = template.fields.map((f) => f.column);

  const data = wb.addWorksheet("Data");
  data.addRow(header);
  for (const r of rows) data.addRow(header.map((h) => r[h] ?? ""));
  data.getRow(1).font = { bold: true };
  header.forEach((h, i) => {
    const col = data.getColumn(i + 1);
    col.width = Math.max(14, h.length + 4);
    // Text format keeps leading zeros in ZIP codes and barcodes.
    col.numFmt = "@";
    const f = template.fields[i];
    if (f.required) data.getCell(1, i + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE68A" } };
  });

  const guide = wb.addWorksheet("Field Guide");
  guide.addRow(["Column", "Label", "Required", "Type", "Allowed values / reference", "Description", "Example"]);
  guide.getRow(1).font = { bold: true };
  for (const f of template.fields) {
    guide.addRow([
      f.column,
      f.label,
      f.required ? "Yes" : "No",
      f.type,
      f.options?.join(", ") ?? (f.refTemplate ? `External ID from ${f.refTemplate}` : f.refData ? `Name of existing ${f.refData}` : ""),
      f.description,
      f.example,
    ]);
  }
  [18, 26, 10, 12, 30, 70, 22].forEach((w, i) => (guide.getColumn(i + 1).width = w));
  guide.addRow([]);
  guide.addRow([`Import in Odoo: ${template.odooImportPath}`]);
  guide.addRow(["Training template — fictional sample data. Delete sample rows before loading real, authorised data."]);

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out as ArrayBuffer);
}

/** Reads the first worksheet of an uploaded XLSX into string rows. */
export async function parseWorkbook(buffer: ArrayBuffer): Promise<string[][]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const sheet = wb.worksheets[0];
  if (!sheet) return [];
  const rows: string[][] = [];
  const width = sheet.columnCount;
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];
    for (let c = 1; c <= width; c++) {
      const v = row.getCell(c).value;
      cells.push(cellToString(v));
    }
    rows.push(cells);
  });
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function cellToString(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    if ("text" in v && typeof v.text === "string") return v.text;
    if ("result" in v && v.result !== undefined) return String(v.result);
    if ("richText" in v) return v.richText.map((r) => r.text).join("");
  }
  return String(v);
}
