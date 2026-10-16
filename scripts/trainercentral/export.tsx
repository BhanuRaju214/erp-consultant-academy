/**
 * Exports the course content for Zoho TrainerCentral (one course, one chapter per portal course).
 *
 *   npx tsx --tsconfig scripts/trainercentral/tsconfig.json scripts/trainercentral/export.tsx [outDir]
 *
 * Writes to exports/trainercentral/ by default:
 *   manifest.json            chapters ▸ lessons (title, description, HTML with {{FIG:id}} placeholders, figures) + test file
 *   figures/<chapter>.html   static render of every diagram in the chapter (screenshot each [data-fig] to PNG)
 *   tests/<course>.xlsx      the course's final assessment in TrainerCentral's "Upload Test" format
 *
 * Diagrams render in "static mode": flows list every step's details, hubs list every module's note,
 * decision trees are fully expanded. Practice questions, step lists and takeaways become text.
 */
import React from "react";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import ExcelJS from "exceljs";
import { allCourses } from "../../src/content";
import { parseVisual, type VisualData } from "../../src/lib/visuals/schemas";
import { VisualBlock } from "../../src/components/visuals/visual-block";
import { StaticRenderContext } from "../../src/components/visuals/static-context";

const ROOT = path.resolve(__dirname, "../..");
const OUT = path.resolve(process.argv[2] ?? path.join(ROOT, "exports/trainercentral"));
const TEXT_TYPES = new Set(["takeaways", "steps", "check"]);

type Figure = { id: string; type: string; title: string; alt: string; file: string };
type LessonOut = { slug: string; title: string; module: string; durationMin?: number; description: string; html: string; figures: Figure[] };
type ChapterOut = { slug: string; title: string; summary: string; lessons: LessonOut[]; test?: { file: string; title: string; questions: number; passMark: number } };

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/* ---------- visual blocks that read better as text ---------- */
function blockAsMarkdown(type: string, data: unknown): string {
  if (type === "takeaways") {
    const d = data as VisualData<"takeaways">;
    return `**${d.title ?? "Key takeaways"}**\n\n${d.items.map((i) => `- ${i}`).join("\n")}`;
  }
  if (type === "steps") {
    const d = data as VisualData<"steps">;
    const head = d.title ? `**${d.title}**\n\n` : "";
    return head + d.steps.map((s, i) => `${i + 1}. **${s.title}**${s.path ? ` (${s.path})` : ""}${s.body ? ` — ${s.body}` : ""}${s.result ? ` ✔ ${s.result}` : ""}`).join("\n");
  }
  const d = data as VisualData<"check">;
  const letters = "ABCDEF";
  return `> **Check your understanding:** ${d.question}\n>\n${d.options.map((o, i) => `> ${letters[i]}. ${o}  `).join("\n")}\n>\n> *Answer: ${letters[d.correct]}. ${d.explanation}*`;
}

function figureTitle(type: string, data: Record<string, unknown>): string {
  const t = (data.title as string) || (data.company as string) || (data.question as string) || "";
  const label = { hero: "Lesson overview", hub: "Concept map", flow: "Process flow", mockup: "Screen walkthrough", compare: "Comparison", beforeafter: "Before and after", decision: "Decision tree", timeline: "Timeline", cards: "Key concepts", dodont: "Do and don't", scenario: "Real-world example", journal: "Accounting impact", layers: "Architecture", trend: "Trend" }[type] ?? "Diagram";
  return t ? `${label}: ${t}` : label;
}

/* ---------- Markdown → HTML that survives TrainerCentral's rich-text editor ---------- */
const cell = "border:1px solid #d5dbe5;padding:6px 10px;vertical-align:top;text-align:left;";
const tcComponents: Components = {
  table: ({ children }) => <table style={{ borderCollapse: "collapse", width: "100%", margin: "12px 0" }}>{children}</table>,
  th: ({ children }) => <th style={{ ...css(cell), background: "#eef3f7", fontWeight: 600 }}>{children}</th>,
  td: ({ children }) => <td style={css(cell)}>{children}</td>,
  pre: ({ children }) => (
    <pre style={{ background: "#f4f6f9", border: "1px solid #d5dbe5", borderRadius: 6, padding: "10px 12px", fontFamily: "Consolas, monospace", fontSize: 13, whiteSpace: "pre-wrap" }}>{children}</pre>
  ),
  code: ({ children, className }) => (className ? <code>{children}</code> : <code style={{ background: "#f0f2f5", padding: "1px 4px", borderRadius: 3, fontFamily: "Consolas, monospace" }}>{children}</code>),
  blockquote: ({ children }) => <div style={{ borderLeft: "4px solid #0a6d84", background: "#e6f8fc", padding: "10px 14px", margin: "12px 0", borderRadius: 4 }}>{children}</div>,
  // Portal-internal links mean nothing inside TrainerCentral: keep the text only.
  a: ({ href = "", children }) => (/^https?:\/\//.test(href) ? <a href={href}>{children}</a> : <span>{children}</span>),
  input: ({ type }) => (type === "checkbox" ? <span>☐ </span> : null),
  h2: ({ children }) => <h2 style={{ color: "#0a6d84", marginTop: 22 }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ marginTop: 16 }}>{children}</h3>,
};
function css(s: string): React.CSSProperties {
  return Object.fromEntries(
    s.split(";").filter(Boolean).map((d) => {
      const [k, v] = d.split(":");
      return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.trim()];
    }),
  );
}

function convertLesson(courseSlug: string, body: string, figStart: number): { markdown: string; figures: Figure[]; sources: { id: string; type: string; source: string }[] } {
  const figures: Figure[] = [];
  const sources: { id: string; type: string; source: string }[] = [];
  let n = figStart;
  const markdown = body.replace(/^```visual-([a-z]+)\s*\n([\s\S]*?)^```\s*$/gm, (_m, type: string, source: string) => {
    const parsed = parseVisual(type, source);
    if (!parsed.ok) return "";
    if (TEXT_TYPES.has(type)) return blockAsMarkdown(type, parsed.data);
    if (type === "figure") {
      const d = parsed.data as VisualData<"figure">;
      return `![${d.alt}](${d.src})`;
    }
    const id = `${courseSlug}-${String(++n).padStart(2, "0")}`;
    const title = figureTitle(type, parsed.data as Record<string, unknown>);
    figures.push({ id, type, title, alt: title, file: `figures/${id}.png` });
    sources.push({ id, type, source });
    return `\n\nTCFIG${id}TCFIG\n\n`;
  });
  return { markdown, figures, sources };
}

function lessonHtml(markdown: string): string {
  const html = renderToStaticMarkup(
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={tcComponents}>
      {markdown}
    </ReactMarkdown>,
  );
  return html.replace(/<p>TCFIG([a-z0-9-]+)TCFIG<\/p>/g, "{{FIG:$1}}");
}

function describe(body: string, module: string, minutes?: number): string {
  const para =
    body
      .replace(/^```[\s\S]*?^```\s*$/gm, "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith("#") && !p.startsWith("|") && !p.startsWith(">") && !p.startsWith("-")) ?? "";
  const plain = para.replace(/\*\*|\*|`|\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ");
  const short = plain.length > 280 ? plain.slice(0, 277).replace(/\s\S*$/, "") + "…" : plain;
  return `<p><strong>${esc(module)}</strong>${minutes ? ` · about ${minutes} min` : ""}</p><p>${esc(short)}</p>`;
}

/* ---------- tests in TrainerCentral's Upload Test format ---------- */
async function writeTest(file: string, course: (typeof allCourses)[number]) {
  const a = course.assessment!;
  const wb = new ExcelJS.Workbook();
  const qs = wb.addWorksheet("Questions");
  qs.addRow(["QUESTION", "QUESTION_TYPE", "POINTS", "EVALUATION_DATA", "CASE_SENSITIVE", "CORRECT_OPTIONS", "OPTION_A", "OPTION_B", "OPTION_C", "OPTION_D", "FEEDBACK_TYPE", "FEEDBACK_ANYCHOICE", "FEEDBACK_CORRECT", "FEEDBACK_INCORRECT", "FEEDBACK_OPTION_A", "FEEDBACK_OPTION_B", "FEEDBACK_OPTION_C", "FEEDBACK_OPTION_D"]);
  const L = "ABCD";
  for (const q of a.questions) {
    if (q.options.length > 4) throw new Error(`${course.slug}: more than 4 options in "${q.prompt}"`);
    const type = q.kind === "multiple" ? "MULTIPLE_CHOICE" : q.kind === "truefalse" ? "BOOLEAN" : "SINGLE_CHOICE";
    const opts = q.kind === "truefalse" ? q.options.map((o) => (/^t/i.test(o) ? "TRUE" : "FALSE")) : q.options;
    const correct = q.correct.map((i) => L[i]).join(",");
    qs.addRow([q.prompt, type, 1, null, null, correct, opts[0] ?? null, opts[1] ?? null, opts[2] ?? null, opts[3] ?? null, "ANY_CHOICE", q.explanation ?? null]);
  }
  const st = wb.addWorksheet("Settings");
  st.addRow(["Description", "Enable grading", "Pass percentage", "Enable negative marking", "Specify percentage/points", "Negative mark", "Enable timed test", "Test duration", "Enable questions shuffle", "Number of questions per attempt when shuffling enabled", "Enable answers shuffle", "Number of retakes", "Enable retake failed user only", "Enable display test results", "Enable display test score", "Enable display test outline", "Enable response correct or incorrect", "Enable correct answer", "Enable answer feedback", "General Feedback", "Feedback when a learner passes this test", "Feedback when a learner fails this test"]);
  st.addRow([`Final assessment for ${course.title}. Pass mark ${a.passMark}%.`, true, a.passMark, false, "POINTS", 0, false, null, false, null, true, 3, true, "ALL", "ALL", "ALL", "ALL", "ALL", "ALL", null, "Well done — you passed this assessment.", "Not yet. Review the lessons in this chapter and try again."]);
  await wb.xlsx.writeFile(file);
}

/* ---------- figure render pages ---------- */
async function compileCss(): Promise<string> {
  const from = path.join(ROOT, "src/app/globals.css");
  const res = await postcss([tailwind({ base: ROOT }) as postcss.AcceptedPlugin]).process(fs.readFileSync(from, "utf8"), { from });
  return res.css;
}
function figurePage(css: string, title: string, sources: { id: string; type: string; source: string }[]): string {
  const blocks = sources
    .map((s) => `<div data-fig="${s.id}" style="padding:4px 2px">${renderToStaticMarkup(<StaticRenderContext.Provider value={true}><VisualBlock type={s.type} source={s.source} /></StaticRenderContext.Provider>)}</div>`)
    .join("\n");
  return `<!doctype html><html data-theme="light"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style>
<style>body{background:#ffffff;margin:0;padding:24px;font-family:ui-sans-serif,system-ui,"Segoe UI",sans-serif}main{width:960px;margin:0 auto}figure{margin:0!important}</style></head>
<body><main>${blocks}</main></body></html>`;
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  for (const d of ["figures", "tests"]) fs.mkdirSync(path.join(OUT, d), { recursive: true });
  const css = await compileCss();
  const chapters: ChapterOut[] = [];
  let figTotal = 0;
  for (const course of allCourses) {
    const chapter: ChapterOut = { slug: course.slug, title: course.title, summary: course.summary, lessons: [] };
    const pageSources: { id: string; type: string; source: string }[] = [];
    let figCount = 0;
    for (const m of course.modules) {
      for (const l of m.lessons) {
        const { markdown, figures, sources } = convertLesson(course.slug, l.body, figCount);
        figCount += figures.length;
        pageSources.push(...sources);
        chapter.lessons.push({ slug: l.slug, title: l.title, module: m.title, durationMin: l.durationMin, description: describe(l.body, m.title, l.durationMin), html: lessonHtml(markdown), figures });
      }
    }
    figTotal += figCount;
    if (pageSources.length) fs.writeFileSync(path.join(OUT, "figures", `${course.slug}.html`), figurePage(css, course.title, pageSources));
    if (course.assessment?.questions.length) {
      const file = `tests/${course.slug}.xlsx`;
      await writeTest(path.join(OUT, file), course);
      chapter.test = { file, title: course.assessment.title, questions: course.assessment.questions.length, passMark: course.assessment.passMark };
    }
    chapters.push(chapter);
  }
  const extras = await exportExtras(css);
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), course: "Odoo ERP Consultant", chapters, extras }, null, 2));
  const lessons = chapters.reduce((n, c) => n + c.lessons.length, 0);
  console.log(`Exported ${chapters.length} chapters, ${lessons} lessons, ${figTotal} figures, ${chapters.filter((c) => c.test).length} tests → ${OUT}`);
  for (const x of extras) console.log(`  + ${x.title}: ${x.lessons.length} lessons, ${x.lessons.reduce((n, l) => n + l.parts.length, 0)} parts`);
}

/* ---------- Business Configuration Lab and Real-Time Implementation Projects ---------- */
// Each scenario/project becomes one lesson whose parts (sub-lessons) are separate Text materials.
type PartOut = { title: string; html: string; figures: Figure[] };
type ExtraLesson = { slug: string; title: string; description: string; parts: PartOut[]; workbook?: string };
type ExtraChapter = { slug: string; title: string; summary: string; lessons: ExtraLesson[] };

const cellText = (t: string | number | undefined) => String(t ?? "").replace(/\|/g, "\\|").replace(/\s*\n\s*/g, "<br>");
const mdTable = (head: string[], rows: (string | number | undefined)[][]) =>
  `| ${head.join(" | ")} |\n|${head.map(() => "---").join("|")}|\n${rows.map((r) => `| ${r.map(cellText).join(" | ")} |`).join("\n")}`;
const bullets = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

async function exportExtras(css: string): Promise<ExtraChapter[]> {
  const { configScenarios, allProjects } = await import("../../src/content");
  const sources: { id: string; type: string; source: string }[] = [];
  const makePart = (prefix: string, title: string, markdown: string, figCounter: { n: number }): PartOut => {
    const { markdown: md, figures, sources: src } = convertLesson(prefix, markdown, figCounter.n);
    figCounter.n += figures.length;
    sources.push(...src);
    return { title, html: lessonHtml(md), figures };
  };
  const describeParts = (summary: string, parts: PartOut[]) =>
    `<p>${esc(summary)}</p><p><strong>${parts.length} parts</strong> (open them in order from the lesson's materials):</p><ol>${parts.map((p) => `<li>${esc(p.title.replace(/^\d+\.\s*/, ""))}</li>`).join("")}</ol>`;

  // Business Configuration Lab
  const lab: ExtraChapter = {
    slug: "config-lab",
    title: "Business Configuration Lab",
    summary: "Guided configuration scenarios: set up a complete Odoo company step by step, with the business reason, where to click, how to check the result and the mistakes to avoid.",
    lessons: [],
  };
  for (const s of configScenarios) {
    const fc = { n: 0 };
    const parts: PartOut[] = [];
    parts.push(
      makePart(`lab-${s.slug}`, "1. Overview: company, apps and expected result", [
        `**Business type:** ${s.businessType} · **Level:** ${s.level} · **Odoo:** ${s.odooVersion}`,
        s.summary,
        `## Company profile\n\n${s.companyProfile}`,
        `## Odoo apps used\n\n${bullets(s.odooApps)}`,
        `## Before you start\n\n${bullets(s.prerequisites)}`,
        `## Configuration steps\n\n${s.steps.map((st, i) => `${i + 1}. ${st.title}`).join("\n")}`,
        `## Expected result\n\n${s.expectedResult}`,
        `## Common mistakes in this scenario\n\n${bullets(s.commonMistakes)}`,
      ].join("\n\n"), fc),
    );
    s.steps.forEach((st, i) => {
      const md = [
        `**Why this step:** ${st.why}`,
        st.odooPath ? `**Where in Odoo:** \`${st.odooPath}\`` : "",
        st.dependsOn?.length ? `**Do first:** step ${st.dependsOn.join(", step ")}` : "",
        `### What to do\n\n${st.instructions}`,
        `### Check that it worked\n\n${st.validation}`,
        st.commonMistakes.length ? `### Common mistakes\n\n${bullets(st.commonMistakes)}` : "",
      ].filter(Boolean).join("\n\n");
      parts.push(makePart(`lab-${s.slug}`, `${i + 2}. Step ${i + 1}: ${st.title}`, md, fc));
    });
    lab.lessons.push({ slug: s.slug, title: s.title, description: describeParts(s.summary, parts), parts });
  }

  // Real-Time Implementation Projects
  fs.mkdirSync(path.join(OUT, "projects"), { recursive: true });
  const projects: ExtraChapter = {
    slug: "projects",
    title: "Real-Time Implementation Projects",
    summary: "End-to-end implementation projects for fictional companies, from requirements to go-live readiness, with data files, test cases and an assessment rubric.",
    lessons: [],
  };
  for (const pr of allProjects) {
    const fc = { n: 0 };
    const pre = `project-${pr.code.toLowerCase()}`;
    const parts: PartOut[] = [
      makePart(pre, "1. Company profile and requirements", [
        `**Industry:** ${pr.industry} · **Level:** ${pr.level} · **Odoo:** ${pr.odooVersion}`,
        `## ${pr.company.name}\n\n${pr.company.profile}`,
        `**Locations:** ${pr.company.locations.join("; ")} · **Employees:** ${pr.company.employees} · **Currency:** ${pr.company.currency}`,
        `## Requirements (${pr.requirements.length})\n\n${mdTable(["ID", "Area", "Requirement", "Type", "Priority"], pr.requirements.map((r) => [r.id, r.area, r.description, r.type, r.priority]))}`,
      ].join("\n\n"), fc),
      makePart(pre, "2. AS-IS and TO-BE processes", `## AS-IS (today)\n\n${pr.asIs}\n\n## TO-BE (in Odoo)\n\n${pr.toBe}`, fc),
      makePart(pre, "3. Implementation plan", pr.phases.map((ph) => `## ${ph.title}\n\n${mdTable(["#", "Task", "Description", "Deliverable"], ph.tasks.map((t, i) => [i + 1, t.title, t.description, t.deliverable]))}`).join("\n\n"), fc),
      makePart(pre, "4. Master data and migration files", [
        `The data files are attached to this lesson as one spreadsheet, **${pr.title.split(" — ")[0]} - data files.xlsx**, with one sheet per file.`,
        ...pr.masterDataFiles.map((f) => `### ${f.name}\n\n${f.description}\n\n${f.rows.length} rows${f.templateKey ? ` · import template: \`${f.templateKey}\`` : ""}`),
      ].join("\n\n"), fc),
      makePart(pre, "5. Transaction scenarios", pr.transactionScenarios.map((t) => `### ${t.id} · ${t.title}\n\n${t.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n**Expected:** ${t.expected}`).join("\n\n"), fc),
      makePart(pre, "6. Customization specifications", pr.customizations.length ? pr.customizations.map((c) => `### ${c.id} · ${c.title}\n\n${c.spec}`).join("\n\n") : "No customizations in this project: everything is standard configuration.", fc),
      makePart(pre, "7. Test cases", mdTable(["ID", "Req.", "Module", "Scenario", "Preconditions", "Test data", "Steps", "Expected result"], pr.testCases.map((t) => [t.id, t.requirementId, t.module, t.scenario, t.preconditions, t.testData, t.steps, t.expected])), fc),
      makePart(pre, "8. Acceptance criteria, deliverables and assessment rubric", [
        `## Acceptance criteria\n\n${bullets(pr.acceptanceCriteria)}`,
        `## Deliverables\n\n${bullets(pr.documentation)}`,
        `## Assessment rubric\n\n${mdTable(["Criterion", "Weight", "Excellent", "Adequate", "Poor"], pr.rubric.map((r) => [r.criterion, `${r.weight}%`, r.excellent, r.adequate, r.poor]))}`,
      ].join("\n\n"), fc),
    ];
    // Data files workbook: an index sheet plus one sheet per file.
    const wb = new ExcelJS.Workbook();
    const idx = wb.addWorksheet("Index");
    idx.addRow(["Sheet", "File", "Description", "Rows", "Import template"]);
    const used = new Set<string>(["Index"]);
    pr.masterDataFiles.forEach((f, i) => {
      let name = `${String(i + 1).padStart(2, "0")} ${f.name.replace(/\.[a-z]+$/i, "")}`.replace(/[\\/*?:[\]]/g, "-").slice(0, 31);
      while (used.has(name)) name = name.slice(0, 29) + "_" + i;
      used.add(name);
      idx.addRow([name, f.name, f.description, f.rows.length, f.templateKey ?? ""]);
      const ws = wb.addWorksheet(name);
      const cols = Object.keys(f.rows[0] ?? {});
      ws.addRow(cols);
      for (const r of f.rows) ws.addRow(cols.map((c) => r[c]));
      ws.getRow(1).font = { bold: true };
    });
    idx.getRow(1).font = { bold: true };
    const workbook = `projects/project-${pr.code.toLowerCase()}-data.xlsx`;
    await wb.xlsx.writeFile(path.join(OUT, workbook));
    projects.lessons.push({ slug: pr.slug, title: `Project ${pr.code}: ${pr.title}`, description: describeParts(pr.summary, parts), parts, workbook });
  }
  if (sources.length) fs.writeFileSync(path.join(OUT, "figures", "extras.html"), figurePage(css, "Configuration Lab and Projects", sources));
  return [lab, projects];
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
