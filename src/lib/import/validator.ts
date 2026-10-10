import { REFERENCE_DATA, type ImportTemplate, type TemplateField, type TemplateKey } from "./templates";

/**
 * Import validation SIMULATOR.
 *
 * Reproduces the most common checks Odoo performs when you click "Test" on the
 * import screen (required fields, data types, selection values, relational
 * lookups, uniqueness) plus consultant-level data quality checks (duplicates,
 * whitespace, dependency order). It never connects to or writes into Odoo.
 */

export type Severity = "error" | "warning" | "info";

export type IssueCode =
  | "missing_column"
  | "unknown_column"
  | "duplicate_column"
  | "required"
  | "type"
  | "selection"
  | "duplicate_key"
  | "possible_duplicate"
  | "existing_record"
  | "invalid_reference"
  | "dependency_order"
  | "whitespace"
  | "length"
  | "empty_file"
  | "negative";

export interface ValidationIssue {
  /** 1-based data row; 0 = header; null = file level. */
  row: number | null;
  column: string | null;
  severity: Severity;
  code: IssueCode;
  message: string;
  fix: string;
}

export interface ValidationContext {
  /** External IDs already "imported" into the simulated database, per template. */
  knownIds: Partial<Record<TemplateKey, string[]>>;
}

export interface ValidationResult {
  template: TemplateKey;
  rowCount: number;
  validRows: number;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
  /** External IDs that would exist after import (only when there are no errors). */
  createdIds: string[];
  /** Rows with safe mechanical cleansing applied (trimmed, normalised booleans/emails/case). */
  cleansed: Record<string, string>[];
  canImport: boolean;
  simulated: true;
}

const BOOL_TRUE = new Set(["1", "true", "yes", "y"]);
const BOOL_FALSE = new Set(["0", "false", "no", "n"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DECIMAL_RE = /^-?\d+(\.\d+)?$/;
const INTEGER_RE = /^-?\d+$/;
const EXTERNAL_ID_RE = /^[A-Za-z0-9_.]+$/;

export function isEan13Valid(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  const digits = code.split("").map(Number);
  const sum = digits.slice(0, 12).reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10 === digits[12];
}

function referenceList(field: TemplateField): readonly string[] {
  return field.refData ? REFERENCE_DATA[field.refData] : [];
}

export function validateImport(
  template: ImportTemplate,
  header: string[],
  records: Record<string, string>[],
  ctx: ValidationContext = { knownIds: {} },
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const fieldsByColumn = new Map(template.fields.map((f) => [f.column, f]));

  if (records.length === 0) {
    issues.push({ row: null, column: null, severity: "error", code: "empty_file", message: "The file has no data rows.", fix: "Add at least one record below the header row." });
  }

  // ---- Header checks ---------------------------------------------------------
  const seenHeaders = new Set<string>();
  for (const h of header) {
    if (seenHeaders.has(h)) {
      issues.push({ row: 0, column: h, severity: "error", code: "duplicate_column", message: `Column "${h}" appears more than once.`, fix: "Remove the duplicate column." });
    }
    seenHeaders.add(h);
    if (!fieldsByColumn.has(h)) {
      issues.push({
        row: 0,
        column: h,
        severity: "warning",
        code: "unknown_column",
        message: `Column "${h}" is not part of the ${template.title} template.`,
        fix: "Rename it to an Odoo technical field name or remove it. Odoo will ask you to map or skip unknown columns.",
      });
    }
  }
  for (const f of template.fields) {
    if (f.required && !seenHeaders.has(f.column)) {
      issues.push({ row: 0, column: f.column, severity: "error", code: "missing_column", message: `Required column "${f.column}" (${f.label}) is missing.`, fix: `Add a "${f.column}" column. ${f.description}` });
    }
  }

  // ---- Dependency order --------------------------------------------------------
  for (const dep of template.dependsOn) {
    const usesDep = template.fields.some((f) => f.refTemplate === dep && seenHeaders.has(f.column));
    if (usesDep && !ctx.knownIds[dep]?.length) {
      issues.push({
        row: null,
        column: null,
        severity: "error",
        code: "dependency_order",
        message: `This file references ${dep} records, but none exist in the simulated database yet.`,
        fix: `Validate and load the ${dep} file first — Odoo can only link to records that already exist.`,
      });
    }
  }

  // ---- Row checks --------------------------------------------------------------
  const uniqueSeen = new Map<string, Map<string, number>>();
  const idsSoFar = new Set<string>();
  const rowsWithErrors = new Set<number>();
  const cleansed: Record<string, string>[] = [];
  const quantKeys = new Map<string, number>();
  const knownForTemplate = new Set(ctx.knownIds[template.key] ?? []);

  records.forEach((rec, idx) => {
    const rowNo = idx + 1;
    const clean: Record<string, string> = {};
    const error = (column: string, code: IssueCode, message: string, fix: string) => {
      rowsWithErrors.add(rowNo);
      issues.push({ row: rowNo, column, severity: "error", code, message, fix });
    };
    const warn = (column: string, code: IssueCode, message: string, fix: string) =>
      issues.push({ row: rowNo, column, severity: "warning", code, message, fix });

    for (const h of header) {
      const raw = rec[h] ?? "";
      const value = raw.trim();
      clean[h] = value;
      const f = fieldsByColumn.get(h);
      if (!f) continue;

      if (raw !== value && value !== "") {
        warn(h, "whitespace", `Leading/trailing spaces in "${raw}".`, "Trim values — spaces break name matching and create look-alike duplicates.");
      }
      if (value === "") {
        if (f.required) error(h, "required", `${f.label} is required but empty.`, f.description);
        continue;
      }
      if (f.maxLength && value.length > f.maxLength) {
        warn(h, "length", `${f.label} is ${value.length} characters (recommended max ${f.maxLength}).`, "Shorten the value; long names truncate on printed documents.");
      }

      switch (f.type) {
        case "externalId":
          if (!EXTERNAL_ID_RE.test(value)) {
            error(h, "type", `External ID "${value}" contains invalid characters.`, "Use letters, digits, underscores and dots only (e.g. cust_0001).");
          }
          break;
        case "boolean": {
          const v = value.toLowerCase();
          if (BOOL_TRUE.has(v)) clean[h] = "1";
          else if (BOOL_FALSE.has(v)) clean[h] = "0";
          else error(h, "type", `"${value}" is not a valid true/false value.`, "Use 1 or 0 (true/false also work).");
          break;
        }
        case "integer":
          if (!INTEGER_RE.test(value)) error(h, "type", `"${value}" is not a whole number.`, "Remove decimals, spaces and text.");
          break;
        case "decimal":
          if (!DECIMAL_RE.test(value)) {
            error(
              h,
              "type",
              `"${value}" is not a valid number.`,
              value.includes(",") ? "Use a dot as decimal separator and no thousands separator (1234.50)." : "Remove currency symbols and text.",
            );
          } else if (template.key === "opening-stock" && Number(value) < 0) {
            error(h, "negative", "Opening quantities cannot be negative.", "Investigate the source count; negative stock must be corrected before cut-over.");
          }
          break;
        case "email": {
          const lower = value.toLowerCase();
          if (!EMAIL_RE.test(lower)) error(h, "type", `"${value}" is not a valid email address.`, "Correct the address or leave it empty.");
          else clean[h] = lower;
          break;
        }
        case "barcode":
          if (!/^\d{8,14}$/.test(value)) {
            error(h, "type", `Barcode "${value}" must be 8–14 digits.`, "Remove spaces/letters and keep the column formatted as text so leading zeros survive.");
          } else if (value.length === 13 && !isEan13Valid(value)) {
            warn(h, "type", `Barcode "${value}" fails the EAN-13 check digit.`, "Verify the barcode with the supplier; scanners will reject it.");
          }
          break;
        case "selection":
          if (f.options && !f.options.includes(value)) {
            const ci = f.options.find((o) => o.toLowerCase() === value.toLowerCase());
            if (ci) {
              clean[h] = ci;
              warn(h, "selection", `"${value}" differs in case from "${ci}".`, `Use "${ci}".`);
            } else {
              error(h, "selection", `"${value}" is not an allowed value for ${f.label}.`, `Allowed technical values: ${f.options.join(", ")}.`);
            }
          }
          break;
        case "refName": {
          const list = referenceList(f);
          const exact = list.find((v) => v === value);
          const ci = exact ?? list.find((v) => v.toLowerCase() === value.toLowerCase());
          if (!ci) {
            error(
              h,
              "invalid_reference",
              `No matching record found for name "${value}" in field ${f.label}.`,
              `Use a value that exists in Odoo (e.g. ${list.slice(0, 4).join(", ")}) or create the missing record before importing.`,
            );
          } else if (!exact) {
            clean[h] = ci;
          }
          break;
        }
        case "refId": {
          const known = new Set(ctx.knownIds[f.refTemplate!] ?? []);
          const inFileEarlier = f.selfReference === true && idsSoFar.has(value);
          if (!known.has(value) && !inFileEarlier) {
            const laterInFile = f.selfReference === true && records.slice(idx + 1).some((r) => (r.id ?? "").trim() === value);
            if (laterInFile) {
              error(h, "dependency_order", `"${value}" is defined on a later row of this file.`, "Move the referenced row above this one.");
            } else {
              error(
                h,
                "invalid_reference",
                `No matching record found for external id "${value}" in field ${f.label}.`,
                `Load the ${f.refTemplate} record with External ID "${value}" first, or fix the typo.`,
              );
            }
          }
          break;
        }
        default:
          break;
      }

      if (f.unique) {
        const key = value.toLowerCase();
        const seen = uniqueSeen.get(h) ?? new Map<string, number>();
        const firstRow = seen.get(key);
        if (firstRow !== undefined) {
          const msg = `"${value}" duplicates row ${firstRow}.`;
          if (f.unique === "error") error(h, "duplicate_key", msg, `${f.label} must be unique. Merge or renumber the duplicate.`);
          else warn(h, "possible_duplicate", `Possible duplicate: ${msg}`, "Confirm with the business whether these are the same record and merge before import.");
        } else {
          seen.set(key, rowNo);
        }
        uniqueSeen.set(h, seen);
      }
    }

    const extId = clean.id;
    if (extId && knownForTemplate.has(extId)) {
      issues.push({
        row: rowNo,
        column: "id",
        severity: "info",
        code: "existing_record",
        message: `External ID "${extId}" already exists — Odoo would UPDATE that record instead of creating a new one.`,
        fix: "Expected for a re-import. Use a new External ID only if you intend a new record.",
      });
    }
    if (extId) idsSoFar.add(extId);

    if (template.key === "opening-stock") {
      const key = [clean["product_id/id"], clean.location_id, clean.lot_id ?? ""].join("|");
      const first = quantKeys.get(key);
      if (first !== undefined) error("product_id/id", "duplicate_key", `Same product, location and lot as row ${first}.`, "Sum the quantities into a single line.");
      else quantKeys.set(key, rowNo);
    }
    cleansed.push(clean);
  });

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const canImport = errorCount === 0 && records.length > 0;
  const createdIds = canImport && header.includes("id") ? cleansed.map((r) => r.id).filter(Boolean) : [];

  return {
    template: template.key,
    rowCount: records.length,
    validRows: records.length - rowsWithErrors.size,
    errorCount,
    warningCount,
    issues,
    createdIds,
    cleansed,
    canImport,
    simulated: true,
  };
}
