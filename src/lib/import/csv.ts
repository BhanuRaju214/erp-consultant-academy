/** Minimal RFC 4180 CSV parser/serializer (quoted fields, escaped quotes, CRLF, BOM). */

export function parseCsv(input: string, delimiter = ","): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"' && field === "") {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop fully empty lines.
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Guess the delimiter from the header line (Odoo accepts comma, semicolon and tab). */
export function detectDelimiter(input: string): string {
  const firstLine = input.split(/\r?\n/, 1)[0] ?? "";
  const counts = [",", ";", "\t"].map((d) => [d, firstLine.split(d).length - 1] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

function escapeCell(value: string): string {
  // Neutralise spreadsheet formula injection when the file is opened in Excel,
  // without corrupting legitimate values such as "+1 555 0100" or "-4".
  const phoneOrNumber = /^[+-][\d\s().-]*$/.test(value);
  const safe = /^[=@\t\r]/.test(value) || (/^[+-]/.test(value) && !phoneOrNumber) ? "'" + value : value;
  return /[",\r\n]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe;
}

export function toCsv(header: string[], rows: Record<string, string>[]): string {
  const lines = [header.map(escapeCell).join(",")];
  for (const r of rows) lines.push(header.map((h) => escapeCell(r[h] ?? "")).join(","));
  return lines.join("\r\n") + "\r\n";
}

/** Converts parsed rows (first row = header) into records keyed by header. */
export function rowsToRecords(rows: string[][]): { header: string[]; records: Record<string, string>[] } {
  const [header = [], ...body] = rows;
  const cleanHeader = header.map((h) => h.trim());
  const records = body.map((cells) => {
    const rec: Record<string, string> = {};
    cleanHeader.forEach((h, i) => {
      rec[h] = cells[i] ?? "";
    });
    return rec;
  });
  return { header: cleanHeader, records };
}
