import { describe, expect, it } from "vitest";
import { allCourses } from "@/content";
import { businessProcesses } from "@/content/processes";
import { enhanceMarkdown, extractToc, slugify } from "@/lib/visuals/enhance";
import { extractVisualBlocks, parseVisual } from "@/lib/visuals/schemas";

const lessons = allCourses.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => ({ course: c.slug, ...l }))));

describe("visual blocks in seeded content", () => {
  it("every visual block in every lesson is valid", () => {
    let count = 0;
    for (const l of lessons) {
      for (const b of extractVisualBlocks(l.body)) {
        count++;
        const r = parseVisual(b.type, b.source);
        expect(r.ok, `${l.course}/${l.slug} visual-${b.type}: ${r.ok ? "" : r.error}`).toBe(true);
      }
    }
    expect(count).toBeGreaterThan(20); // the three prototype lessons alone contain 30+ blocks
  });

  it("prototype lessons follow the visual lesson structure", () => {
    for (const [course, slug] of [
      ["erp-fundamentals", "what-is-erp"],
      ["odoo-sales", "master-data-and-transactions"],
      ["odoo-sales", "troubleshooting-practice-interview"],
    ]) {
      const l = lessons.find((x) => x.course === course && x.slug === slug)!;
      const types = extractVisualBlocks(l.body).map((b) => b.type);
      // A narrated lesson video may come first; the hero still opens the written lesson.
      expect(types.find((t) => t !== "video"), slug).toBe("hero");
      expect(types, slug).toContain("check");
      expect(new Set(types).size, slug).toBeGreaterThanOrEqual(5);
      expect(l.body, slug).toMatch(/^## Key takeaways/m);
    }
  });

  it("automatic enhancements still produce valid blocks for every lesson", () => {
    for (const l of lessons) {
      for (const b of extractVisualBlocks(enhanceMarkdown(l.body))) {
        const r = parseVisual(b.type, b.source);
        expect(r.ok, `${l.course}/${l.slug} enhanced visual-${b.type}: ${r.ok ? "" : r.error}`).toBe(true);
      }
    }
  });
});

describe("parseVisual", () => {
  it("reports JSON, schema and reference errors with a path", () => {
    expect(parseVisual("flow", "{ not json")).toMatchObject({ ok: false });
    expect(parseVisual("nope", "{}")).toMatchObject({ ok: false, error: expect.stringContaining("Unknown visual type") });
    expect(parseVisual("check", JSON.stringify({ question: "Q", options: ["a", "b"], correct: 5, explanation: "x" }))).toMatchObject({
      ok: false,
      error: expect.stringContaining("correct"),
    });
    const tree = { start: "a", nodes: { a: { question: "?", options: [{ label: "x", next: "b" }, { label: "y", next: "missing" }] }, b: { result: "ok" } } };
    expect(parseVisual("decision", JSON.stringify(tree))).toMatchObject({ ok: false, error: expect.stringContaining("missing") });
    expect(parseVisual("figure", JSON.stringify({ src: "https://evil.example/x.png", alt: "A long enough alt text" }))).toMatchObject({ ok: false });
    expect(parseVisual("compare", JSON.stringify({ columns: ["A", "B"], rows: [{ label: "r", values: ["1"] }] }))).toMatchObject({ ok: false });
    expect(parseVisual("trend", JSON.stringify({ points: ["a", "b"], series: [{ label: "s", values: [1] }] }))).toMatchObject({
      ok: false,
      error: expect.stringContaining("values"),
    });
  });
});

describe("visual blocks in business processes", () => {
  it("every block in a process scenario is valid", () => {
    for (const p of businessProcesses)
      for (const b of extractVisualBlocks(p.example.narrative)) {
        const r = parseVisual(b.type, b.source);
        expect(r.ok, `${p.slug} visual-${b.type}: ${r.ok ? "" : r.error}`).toBe(true);
      }
  });
  it("scenario narration never counts steps aloud", () => {
    for (const p of businessProcesses)
      for (const b of extractVisualBlocks(p.example.narrative).filter((x) => x.type === "story")) {
        const story = JSON.parse(b.source) as { intro?: string; scenes: { say?: string }[] };
        for (const line of [story.intro ?? "", ...story.scenes.map((s) => s.say ?? "")]) expect(line, p.slug).not.toMatch(/\bstep \d+|\bstep (one|two|three)\b/i);
      }
  });
  it("timeline stories need no grid positions; ring stories do", () => {
    const stations = [{ id: "a", label: "A" }, { id: "b", label: "B" }];
    const scenes = [{ at: "1", to: "a", title: "x", text: "y" }, { at: "2", from: "a", to: "b", title: "x", text: "y" }];
    expect(parseVisual("story", JSON.stringify({ title: "T", layout: "timeline", stations, scenes })).ok).toBe(true);
    expect(parseVisual("story", JSON.stringify({ title: "T", stations, scenes }))).toMatchObject({ ok: false, error: expect.stringContaining("needs x and y") });
  });
  it("story blocks reject unknown stations and mismatched counters", () => {
    const base = { title: "T", stations: [{ id: "a", label: "A", x: 0, y: 0 }, { id: "b", label: "B", x: 1, y: 0 }], scenes: [{ at: "1", to: "a", title: "x", text: "y" }, { at: "2", from: "a", to: "b", title: "x", text: "y" }] };
    expect(parseVisual("story", JSON.stringify(base)).ok).toBe(true);
    expect(parseVisual("story", JSON.stringify({ ...base, scenes: [...base.scenes, { at: "3", to: "zz", title: "x", text: "y" }] }))).toMatchObject({ ok: false, error: expect.stringContaining("zz") });
    expect(parseVisual("story", JSON.stringify({ ...base, counters: [{ label: "c", values: ["1"] }] }))).toMatchObject({ ok: false, error: expect.stringContaining("counters") });
  });
});

describe("no ASCII-art diagrams", () => {
  // Box drawings and arrow sketches in text fences read badly; use a visual block instead.
  const ASCII_DIAGRAM = /(\+-{6,}\+|-{2,}>|[─═]+\S*[►▶]|[◄<][-─]{4,}|^[ \t]*[|│v▼][ \t]*$)/m;
  it("no lesson uses a plain-text diagram", () => {
    for (const l of lessons) {
      let lang: string | null = null;
      let buf: string[] = [];
      for (const line of l.body.split("\n")) {
        const fence = line.match(/^```(\S*)\s*$/);
        if (fence && lang === null) {
          lang = fence[1];
          buf = [];
        } else if (fence) {
          if (lang === "" || lang === "text") expect(ASCII_DIAGRAM.test(buf.join("\n")), `${l.course}/${l.slug} has an ASCII diagram:\n${buf.join("\n")}`).toBe(false);
          lang = null;
        } else if (lang !== null) buf.push(line);
      }
    }
  });
});

describe("enhanceMarkdown", () => {
  it("turns Key takeaways lists into a takeaways block", () => {
    const out = enhanceMarkdown("Intro\n\n## Key takeaways\n\n- One **bold**\n- Two\n");
    const [b] = extractVisualBlocks(out);
    expect(b.type).toBe("takeaways");
    expect(JSON.parse(b.source).items).toEqual(["One **bold**", "Two"]);
    expect(out).not.toMatch(/^## Key takeaways/m);
  });

  it("turns standalone arrow chains into compact flows, but not inside tables, lists or code", () => {
    const md = ["Text", "", "Lead → Opportunity → **Quotation**.", "", "| a → b → c |", "- x → y → z", "```text", "A → B → C", "```"].join("\n");
    const blocks = extractVisualBlocks(enhanceMarkdown(md));
    expect(blocks).toHaveLength(1);
    expect(JSON.parse(blocks[0].source)).toEqual({ compact: true, steps: [{ title: "Lead" }, { title: "Opportunity" }, { title: "Quotation" }] });
  });

  it("leaves two-step arrows and long sentences alone", () => {
    const md = "\nCash → bank\n\n" + "A very long sentence that is clearly prose and not a process step at all, really → B → C\n";
    expect(extractVisualBlocks(enhanceMarkdown(md))).toHaveLength(0);
  });

  it("builds the on-page outline from level-2 headings outside code", () => {
    expect(extractToc("## 7. Master data\n```\n## not a heading\n```\n## **Key** takeaways")).toEqual([
      { id: "7-master-data", text: "7. Master data" },
      { id: "key-takeaways", text: "Key takeaways" },
    ]);
    expect(slugify("What ERP is *not*")).toBe("what-erp-is-not");
  });
});
