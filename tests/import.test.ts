import { describe, expect, it } from "vitest";
import { parseCsv, rowsToRecords, toCsv, detectDelimiter } from "@/lib/import/csv";
import { generateDataset } from "@/lib/import/generator";
import { IMPORT_TEMPLATES, STANDARD_EXTERNAL_IDS, getTemplate } from "@/lib/import/templates";
import { isEan13Valid, validateImport } from "@/lib/import/validator";
import { allProjects } from "@/content";

const tpl = (k: string) => getTemplate(k)!;
const validate = (key: string, csv: string, knownIds = {}) => {
  const { header, records } = rowsToRecords(parseCsv(csv, detectDelimiter(csv)));
  return validateImport(tpl(key), header, records, { knownIds });
};

describe("csv", () => {
  it("parses quoted fields, escaped quotes, CRLF and BOM", () => {
    const rows = parseCsv('﻿a,b\r\n"x, y","say ""hi"""\r\n\r\n');
    expect(rows).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
    ]);
  });
  it("round-trips through toCsv and neutralises formula injection", () => {
    const csv = toCsv(["name", "note", "phone", "qty", "evil"], [{ name: "A, B", note: "=HYPERLINK(1)", phone: "+1 555 0100", qty: "-4", evil: "+SUM(A1)" }]);
    expect(parseCsv(csv)[1]).toEqual(["A, B", "'=HYPERLINK(1)", "+1 555 0100", "-4", "'+SUM(A1)"]);
  });
  it("detects semicolon delimiters", () => {
    expect(detectDelimiter("id;name\n1;x")).toBe(";");
  });
});

describe("import validator", () => {
  it("accepts every template's own sample rows in dependency order", () => {
    const known: Record<string, string[]> = { ...STANDARD_EXTERNAL_IDS } as Record<string, string[]>;
    for (const t of [...IMPORT_TEMPLATES].sort((a, b) => a.order - b.order)) {
      const header = t.fields.map((f) => f.column);
      const res = validateImport(t, header, t.sampleRows, { knownIds: known });
      expect(res.errorCount, `${t.key}: ${JSON.stringify(res.issues)}`).toBe(0);
      if (res.createdIds.length) known[t.key] = res.createdIds;
    }
  });

  it("flags missing required columns and empty required values", () => {
    const res = validate("customers", "id,email\ncust_1,a@b.example\n,c@d.example");
    expect(res.issues.some((i) => i.code === "missing_column" && i.column === "name")).toBe(true);
    expect(res.issues.some((i) => i.code === "required" && i.column === "id" && i.row === 2)).toBe(true);
    expect(res.canImport).toBe(false);
  });

  it("detects duplicates, bad types, bad selections and unknown references", () => {
    const res = validate(
      "customers",
      ["id,name,email,is_company,country_id,customer_rank", "cust_1,Acme,acme@x.example,1,United States,1", "cust_1,Acme,acme@x.example,maybe,USA,one"].join("\n"),
    );
    const codes = res.issues.map((i) => `${i.code}:${i.column}`);
    expect(codes).toContain("duplicate_key:id");
    expect(codes).toContain("possible_duplicate:name");
    expect(codes).toContain("type:is_company");
    expect(codes).toContain("invalid_reference:country_id");
    expect(codes).toContain("type:customer_rank");
  });

  it("enforces dependency order for products → categories", () => {
    const csv = "id,name,detailed_type,categ_id/id\nprod_1,Kettle,product,categ_x";
    expect(validate("products", csv).issues.some((i) => i.code === "dependency_order")).toBe(true);
    const ok = validate("products", csv, { "product-categories": ["categ_x"] });
    expect(ok.errorCount).toBe(0);
    expect(ok.createdIds).toEqual(["prod_1"]);
  });

  it("allows category parents defined on earlier rows but not later rows", () => {
    const good = validate("product-categories", "id,name,parent_id/id\nc_parent,Parent,\nc_child,Child,c_parent");
    expect(good.errorCount).toBe(0);
    const bad = validate("product-categories", "id,name,parent_id/id\nc_child,Child,c_parent\nc_parent,Parent,");
    expect(bad.issues.find((i) => i.row === 1)?.code).toBe("dependency_order");
  });

  it("normalises safe values in the cleansed output and warns on whitespace", () => {
    const res = validate("customers", "id,name,email,is_company\ncust_1,  Acme  ,ACME@X.EXAMPLE,yes");
    expect(res.cleansed[0]).toMatchObject({ name: "Acme", email: "acme@x.example", is_company: "1" });
    expect(res.issues.some((i) => i.code === "whitespace")).toBe(true);
    expect(res.canImport).toBe(true);
  });

  it("rejects negative and duplicate opening stock lines", () => {
    const res = validate(
      "opening-stock",
      "product_id/id,location_id,inventory_quantity\nprod_1,WH/Stock,-3\nprod_1,WH/Stock,4",
      { products: ["prod_1"] },
    );
    expect(res.issues.some((i) => i.code === "negative")).toBe(true);
    expect(res.issues.some((i) => i.code === "duplicate_key")).toBe(true);
  });

  it("reports re-imports of existing External IDs as updates", () => {
    const res = validate("vendors", "id,name\nvend_1,Apex", { vendors: ["vend_1"] });
    expect(res.issues.some((i) => i.code === "existing_record")).toBe(true);
    expect(res.canImport).toBe(true);
  });

  it("validates EAN-13 check digits", () => {
    expect(isEan13Valid("4006381333931")).toBe(true);
    expect(isEan13Valid("4006381333932")).toBe(false);
  });

  it.each(allProjects.map((p) => [p.code, p] as const))("validates Project %s master data files end to end", (_code, project) => {
    const known: Record<string, string[]> = Object.fromEntries(Object.entries(STANDARD_EXTERNAL_IDS).map(([k, v]) => [k, [...(v ?? [])]]));
    let validated = 0;
    for (const t of [...IMPORT_TEMPLATES].sort((x, y) => x.order - y.order)) {
      for (const file of project.masterDataFiles.filter((f) => f.templateKey === t.key)) {
        const res = validateImport(t, Object.keys(file.rows[0]), file.rows, { knownIds: known });
        expect(res.errorCount, `${project.code} ${file.name}: ${JSON.stringify(res.issues.filter((i) => i.severity === "error"))}`).toBe(0);
        known[t.key] = [...(known[t.key] ?? []), ...res.createdIds];
        validated++;
      }
    }
    expect(validated).toBeGreaterThanOrEqual(5);
  });

  it("projects have unique codes, slugs and test-case ids", () => {
    expect(new Set(allProjects.map((p) => p.code)).size).toBe(5);
    expect(new Set(allProjects.map((p) => p.slug)).size).toBe(5);
    const ids = allProjects.flatMap((p) => p.testCases.map((t) => t.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("sample data generator", () => {
  it("is deterministic for a seed and produces valid data", () => {
    const a = generateDataset({ business: "trading", seed: 7, customers: 15, vendors: 5, products: 20, injectErrors: false });
    const b = generateDataset({ business: "trading", seed: 7, customers: 15, vendors: 5, products: 20, injectErrors: false });
    expect(a).toEqual(b);
    expect(a.files.customers).toHaveLength(15);
    expect(a.files.products).toHaveLength(20);

    const known: Record<string, string[]> = {};
    for (const t of [...IMPORT_TEMPLATES].sort((x, y) => x.order - y.order)) {
      const res = validateImport(t, t.fields.map((f) => f.column), a.files[t.key], { knownIds: known });
      expect(res.errorCount, `${t.key}: ${JSON.stringify(res.issues.filter((i) => i.severity === "error"))}`).toBe(0);
      known[t.key] = res.createdIds;
    }
  });

  it("injects detectable errors with an answer key", () => {
    const d = generateDataset({ business: "retail", seed: 3, customers: 10, vendors: 4, products: 10, injectErrors: true });
    expect(d.injected.length).toBeGreaterThan(5);
    const res = validateImport(tpl("customers"), tpl("customers").fields.map((f) => f.column), d.files.customers);
    expect(res.errorCount).toBeGreaterThan(0);
  });
});
