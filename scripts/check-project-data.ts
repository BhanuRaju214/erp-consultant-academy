/**
 * Validates a project's master data files with the Import Lab simulator, in
 * dependency order, and checks structural rules. Used by content authors.
 *
 *   npx tsx scripts/check-project-data.ts src/content/projects/manufacturing-company.ts manufacturingProject
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { IMPORT_TEMPLATES, STANDARD_EXTERNAL_IDS } from "../src/lib/import/templates";
import { validateImport } from "../src/lib/import/validator";
import type { ProjectContent } from "../src/content/types";

async function main() {
  const [file, exportName] = process.argv.slice(2);
  if (!file || !exportName) throw new Error("usage: check-project-data.ts <file> <exportName>");
  const mod = (await import(pathToFileURL(path.resolve(file)).href)) as Record<string, ProjectContent>;
  const p = mod[exportName];
  if (!p) throw new Error(`export ${exportName} not found in ${file}`);
  let errors = 0;
  const fail = (msg: string) => {
    errors++;
    console.log("ERROR", msg);
  };

  // Master data files with a templateKey must import cleanly, in dependency order.
  const known: Record<string, string[]> = Object.fromEntries(Object.entries(STANDARD_EXTERNAL_IDS).map(([k, v]) => [k, [...(v ?? [])]]));
  for (const t of [...IMPORT_TEMPLATES].sort((a, b) => a.order - b.order)) {
    for (const f of p.masterDataFiles.filter((x) => x.templateKey === t.key)) {
      if (!f.rows.length) {
        fail(`${f.name}: no rows`);
        continue;
      }
      const header = Object.keys(f.rows[0]);
      const res = validateImport(t, header, f.rows, { knownIds: known });
      for (const i of res.issues.filter((x) => x.severity === "error")) fail(`${f.name} (${t.key}) row ${i.row} ${i.column}: ${i.message}`);
      for (const i of res.issues.filter((x) => x.severity === "warning")) console.log("WARN ", `${f.name} row ${i.row} ${i.column}: ${i.message}`);
      if (res.canImport) known[t.key] = [...(known[t.key] ?? []), ...res.createdIds];
      console.log(`${res.canImport ? "ok   " : "FAIL "} ${f.name} → ${t.key}: ${res.rowCount} rows, ${res.errorCount} errors, ${res.warningCount} warnings`);
    }
  }
  for (const f of p.masterDataFiles) if (f.templateKey && !IMPORT_TEMPLATES.some((t) => t.key === f.templateKey)) fail(`${f.name}: unknown templateKey ${f.templateKey}`);

  // Structural rules.
  const reqIds = new Set(p.requirements.map((r) => r.id));
  if (reqIds.size !== p.requirements.length) fail("duplicate requirement ids");
  const tcIds = new Set(p.testCases.map((t) => t.id));
  if (tcIds.size !== p.testCases.length) fail("duplicate test case ids");
  for (const t of p.testCases) if (!reqIds.has(t.requirementId)) fail(`${t.id} references unknown requirement ${t.requirementId}`);
  // Project A keeps its original TC-### ids (learners may already have copied them); B–E are prefixed.
  if (p.code !== "A") for (const t of p.testCases) if (!t.id.startsWith(`${p.code}-`)) fail(`${t.id}: test case ids must start with "${p.code}-" (unique across projects)`);
  const weights = p.rubric.reduce((n, r) => n + r.weight, 0);
  if (weights !== 100) fail(`rubric weights sum to ${weights}, expected 100`);
  const phaseKeys = p.phases.map((ph) => ph.key);
  for (const k of ["discovery", "requirements", "design", "configuration", "migration", "testing", "golive"]) if (!phaseKeys.includes(k)) fail(`missing phase "${k}"`);
  console.log(`\n${p.code} ${p.title}: ${p.requirements.length} requirements, ${p.phases.reduce((n, ph) => n + ph.tasks.length, 0)} tasks, ${p.transactionScenarios.length} scenarios, ${p.testCases.length} test cases, ${p.masterDataFiles.length} data files`);
  console.log(errors ? `✗ ${errors} error(s)` : "✓ project data OK");
  process.exit(errors ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
