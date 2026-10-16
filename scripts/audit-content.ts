/**
 * Content audit: measures how text-heavy each lesson is and which visual
 * structures already exist. Output: docs/visual-learning/audit-data.json and a
 * console summary. Run with: npx tsx scripts/audit-content.ts
 */
import fs from "node:fs";
import path from "node:path";
import { allCourses } from "../src/content";

interface LessonStats {
  course: string;
  lesson: string;
  title: string;
  words: number;
  readingMin: number;
  h2: number;
  tables: number;
  lists: number;
  codeFences: number;
  asciiDiagrams: number;
  arrowChains: number;
  blockquotes: number;
  keyTakeaways: boolean;
  flashcards: number;
  images: number;
  visualBlocks: number;
  longestTextRun: number;
}

function stats(course: string, slug: string, title: string, body: string, flashcards: number): LessonStats {
  const lines = body.split(/\r?\n/);
  let inFence = false;
  let fenceLang = "";
  let fenceHasArrows = false;
  let codeFences = 0;
  let asciiDiagrams = 0;
  let arrowChains = 0;
  let run = 0;
  let longestTextRun = 0;
  let visualBlocks = 0;
  for (const line of lines) {
    const fence = line.match(/^\s*```(\S*)/);
    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceLang = fence[1];
        fenceHasArrows = false;
        codeFences++;
        if (fenceLang.startsWith("visual-")) visualBlocks++;
      } else {
        if (fenceHasArrows && !fenceLang.startsWith("visual-")) asciiDiagrams++;
        inFence = false;
      }
      continue;
    }
    if (inFence) {
      if (/[→↓↑<>]|-->|\|/.test(line) && /[→↓]|-->|─|│|┌|└/.test(line)) fenceHasArrows = true;
      continue;
    }
    if ((line.match(/→/g) ?? []).length >= 2 && !line.trim().startsWith("|")) arrowChains++;
    // A "text run" = consecutive plain paragraph lines (no heading, list, table, quote).
    const plain = line.trim() !== "" && !/^\s*(#|[-*+]\s|\d+\.\s|\||>)/.test(line);
    if (plain) run += line.split(/\s+/).length;
    else if (/^\s*(#|\|)/.test(line)) {
      longestTextRun = Math.max(longestTextRun, run);
      run = 0;
    }
  }
  longestTextRun = Math.max(longestTextRun, run);
  const prose = body.replace(/```[\s\S]*?```/g, " ");
  const words = prose.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
  return {
    course,
    lesson: slug,
    title,
    words,
    readingMin: Math.round(words / 200),
    h2: (body.match(/^## /gm) ?? []).length,
    tables: (body.match(/^\|.*\|\s*\n\|[\s:|-]+\|/gm) ?? []).length,
    lists: (body.match(/^(\s*[-*]\s|\s*\d+\.\s)/gm) ?? []).length,
    codeFences,
    asciiDiagrams,
    arrowChains,
    blockquotes: (body.match(/^>\s/gm) ?? []).length,
    keyTakeaways: /^##+\s*key takeaways/im.test(body),
    flashcards,
    images: (body.match(/!\[[^\]]*\]\(/g) ?? []).length,
    visualBlocks,
    longestTextRun,
  };
}

const rows: LessonStats[] = [];
for (const c of allCourses) {
  for (const m of c.modules) for (const l of m.lessons) rows.push(stats(c.slug, l.slug, l.title, l.body, l.flashcards?.length ?? 0));
}

const out = path.join(process.cwd(), "docs", "visual-learning");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "audit-data.json"), JSON.stringify(rows, null, 2));

const sum = (k: keyof LessonStats) => rows.reduce((n, r) => n + Number(r[k]), 0);
console.log(`lessons: ${rows.length}`);
console.log(`total words: ${sum("words").toLocaleString()} | avg ${Math.round(sum("words") / rows.length)} | max ${Math.max(...rows.map((r) => r.words))}`);
console.log(`lessons > 900 words: ${rows.filter((r) => r.words > 900).length} | > 1200: ${rows.filter((r) => r.words > 1200).length}`);
console.log(`images: ${sum("images")} | visual blocks: ${sum("visualBlocks")} | ASCII diagrams in code fences: ${sum("asciiDiagrams")} | inline arrow chains: ${sum("arrowChains")}`);
console.log(`tables: ${sum("tables")} | blockquotes (tips): ${sum("blockquotes")} | lessons with Key takeaways: ${rows.filter((r) => r.keyTakeaways).length}`);
console.log(`lessons with flashcards: ${rows.filter((r) => r.flashcards > 0).length}`);
console.log(`lessons with a text run > 250 words (wall of text): ${rows.filter((r) => r.longestTextRun > 250).length}`);
console.log("\nper course (lessons | avg words | tables | ascii diagrams | arrow chains | images):");
for (const c of allCourses) {
  const r = rows.filter((x) => x.course === c.slug);
  const avg = Math.round(r.reduce((n, x) => n + x.words, 0) / r.length);
  console.log(
    `  ${c.slug.padEnd(30)} ${String(r.length).padStart(3)} | ${String(avg).padStart(5)} | ${String(r.reduce((n, x) => n + x.tables, 0)).padStart(3)} | ${String(r.reduce((n, x) => n + x.asciiDiagrams, 0)).padStart(3)} | ${String(r.reduce((n, x) => n + x.arrowChains, 0)).padStart(3)} | ${r.reduce((n, x) => n + x.images, 0)}`,
  );
}
