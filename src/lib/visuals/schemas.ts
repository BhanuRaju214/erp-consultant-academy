import { z } from "zod";

/**
 * Schemas for visual blocks embedded in lesson Markdown as ```visual-<type> JSON fences.
 * See docs/visual-learning/visual-blocks.md for the authoring guide.
 */

const text = z.string().trim().min(1);
const icon = z.string().optional();
/** A rectangle on a screenshot, in % of its width and height. */
const box = z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100), w: z.number().positive().max(100), h: z.number().positive().max(100) });
const tone = z.enum(["success", "warning", "danger", "info", "neutral"]).optional();

const hubSpec = z.object({
  center: z.object({ label: text, icon }),
  nodes: z.array(z.object({ label: text, icon, detail: z.string().optional() })).min(2).max(12),
});

export const visualSchemas = {
  hero: z.object({
    eyebrow: z.string().optional(),
    title: text,
    subtitle: z.string().optional(),
    objectives: z.array(text).min(1).max(8),
    hub: hubSpec.optional(),
  }),
  hub: hubSpec.extend({ title: z.string().optional(), caption: z.string().optional() }),
  flow: z.object({
    title: z.string().optional(),
    caption: z.string().optional(),
    compact: z.boolean().optional(),
    /** Shown as a "repeat" band under the steps, e.g. iterative trial loads. */
    loop: z.string().optional(),
    steps: z
      .array(
        z.object({
          title: text,
          icon,
          /** Short Odoo app (or system) tag shown on the step card. */
          app: z.string().max(24).optional(),
          actor: z.string().optional(),
          detail: z.string().optional(),
          document: z.string().optional(),
          odoo: z.string().optional(),
          impact: z.string().optional(),
          /** A side exit from this step, e.g. "Not qualified → Lost". */
          branch: z.object({ when: text, result: text, tone }).optional(),
          /** Work that happens in parallel at this step, e.g. delivery and invoicing. */
          parallel: z.array(z.object({ title: text, app: z.string().max(24).optional(), icon, detail: z.string().optional() })).min(2).max(4).optional(),
        }),
      )
      .min(2)
      .max(14),
  }),
  layers: z.object({
    title: z.string().optional(),
    caption: z.string().optional(),
    layers: z
      .array(z.object({ title: text, subtitle: z.string().optional(), icon, items: z.array(text).max(12).default([]), detail: z.string().optional() }))
      .min(2)
      .max(7),
    /** Things that connect to the stack from outside (reporting, external systems). */
    connects: z.array(z.object({ title: text, detail: z.string().optional(), icon })).max(4).default([]),
  }),
  /** Animated 3D walkthrough of a business scenario: the transaction travels between departments scene by scene. */
  story: z.object({
    title: text,
    company: z.string().optional(),
    /** "ring": departments as blocks on an isometric board. "timeline": departments as lanes, steps as gates in time order. */
    layout: z.enum(["ring", "timeline"]).optional(),
    /** What travels between departments by default: a parcel (document) or a truck (goods). */
    token: z.enum(["box", "truck"]).optional(),
    /** Seconds per scene when playing. */
    pace: z.number().min(3).max(20).optional(),
    /** Spoken before step 1 when narration is on: explains how to read the board. */
    intro: z.string().optional(),
    /** Short line under the board explaining what boxes, parcel and numbers mean. */
    legend: z.string().optional(),
    stations: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]+$/),
          label: text,
          icon,
          app: z.string().max(24).optional(),
          /** Position on a 5×5 isometric grid (ring layout only). */
          x: z.number().int().min(0).max(4).optional(),
          y: z.number().int().min(0).max(4).optional(),
          /** Outside the company (customer, vendor, bank): drawn with a different tint. */
          outside: z.boolean().optional(),
        }),
      )
      .min(2)
      .max(8),
    scenes: z
      .array(
        z.object({
          at: text,
          from: z.string().optional(),
          to: text,
          title: text,
          text: text,
          carry: z.string().max(28).optional(),
          /** Overrides the story's token for this step, e.g. a truck for a goods transfer. */
          token: z.enum(["box", "truck"]).optional(),
          /** What happens on the spot once the token arrives, e.g. "Counting zone A". */
          action: z.string().max(40).optional(),
          /** Spoken explanation for this step (defaults to title + text). Plain text, no Markdown. */
          say: z.string().optional(),
          document: z.string().optional(),
          entries: z.array(z.object({ account: text, debit: z.string().optional(), credit: z.string().optional() })).max(8).default([]),
          tone,
        }),
      )
      .min(2)
      .max(20),
    /** Running figures shown under the stage; one value per scene. */
    counters: z.array(z.object({ label: text, values: z.array(z.string()) })).max(4).default([]),
    results: z.array(z.object({ label: text, value: text })).max(6).default([]),
  }),
  trend: z.object({
    title: z.string().optional(),
    caption: z.string().optional(),
    xLabel: z.string().optional(),
    yLabel: z.string().optional(),
    points: z.array(text).min(2).max(12),
    series: z.array(z.object({ label: text, values: z.array(z.number().min(0)), tone })).min(1).max(4),
  }),
  steps: z.object({
    title: z.string().optional(),
    steps: z.array(z.object({ title: text, body: z.string().optional(), path: z.string().optional(), result: z.string().optional() })).min(1).max(20),
  }),
  mockup: z.object({
    title: z.string().optional(),
    app: text,
    breadcrumb: z.array(text).min(1).max(4),
    buttons: z.array(z.object({ label: text, primary: z.boolean().optional(), marker: z.number().int().positive().optional() })).max(6).default([]),
    status: z.object({ steps: z.array(text).min(2).max(6), current: z.number().int().min(0) }).optional(),
    fields: z.array(z.object({ label: text, value: z.string(), marker: z.number().int().positive().optional() })).max(14).default([]),
    lines: z.object({ columns: z.array(text).min(1).max(8), rows: z.array(z.array(z.string())).max(8), marker: z.number().int().positive().optional() }).optional(),
    annotations: z.array(z.object({ marker: z.number().int().positive(), title: text, text: text })).max(10).default([]),
    note: z.string().optional(),
  }),
  compare: z.object({
    title: z.string().optional(),
    caption: z.string().optional(),
    columns: z.array(text).min(2).max(5),
    rows: z.array(z.object({ label: text, values: z.array(z.union([z.string(), z.boolean()])) })).min(1).max(16),
    highlight: z.number().int().min(0).optional(),
  }),
  beforeafter: z.object({
    title: z.string().optional(),
    before: z.object({ title: text, points: z.array(text).min(1).max(8) }),
    after: z.object({ title: text, points: z.array(text).min(1).max(8) }),
  }),
  decision: z.object({
    title: z.string().optional(),
    caption: z.string().optional(),
    start: text,
    nodes: z.record(
      z.string(),
      z.union([
        z.object({ question: text, options: z.array(z.object({ label: text, next: text })).min(2).max(5) }),
        z.object({ result: text, tone, detail: z.string().optional() }),
      ]),
    ),
  }),
  timeline: z.object({
    title: z.string().optional(),
    items: z.array(z.object({ when: text, title: text, detail: z.string().optional(), icon })).min(2).max(12),
  }),
  cards: z.object({
    label: z.string().max(24).optional(),
    title: z.string().optional(),
    columns: z.number().int().min(1).max(4).optional(),
    cards: z.array(z.object({ icon, title: text, body: z.string().optional(), tone })).min(1).max(12),
  }),
  dodont: z.object({ title: z.string().optional(), do: z.array(text).min(1).max(8), dont: z.array(text).min(1).max(8) }),
  scenario: z.object({
    title: z.string().optional(),
    company: text,
    industry: z.string().optional(),
    situation: text,
    steps: z.array(text).max(10).default([]),
    metrics: z.array(z.object({ label: text, before: z.string().optional(), after: text })).max(6).default([]),
  }),
  journal: z.object({
    title: text,
    lines: z.array(z.object({ account: text, debit: z.string().optional(), credit: z.string().optional() })).min(2).max(10),
    note: z.string().optional(),
  }),
  check: z.object({ question: text, options: z.array(text).min(2).max(6), correct: z.number().int().min(0), explanation: text }),
  figure: z.object({
    src: z.string().regex(/^\/visuals\/[a-z0-9/_.-]+\.(svg|png|webp|jpg)$/, "src must be a file under /visuals/ (svg, png, webp or jpg)"),
    alt: z.string().trim().min(10, "alt text must describe the visual (10+ characters)"),
    caption: z.string().optional(),
    credit: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  }),
  /** A real Odoo screenshot with numbered callouts placed by position (% of the image). */
  screen: z.object({
    src: z.string().regex(/^\/visuals\/[a-z0-9/_.-]+\.(png|webp|jpg)$/, "src must be a screenshot under /visuals/ (png, webp or jpg)"),
    alt: z.string().trim().min(10, "alt text must describe the screen (10+ characters)"),
    title: z.string().optional(),
    caption: z.string().optional(),
    /** Menu path shown as a chip, e.g. "Inventory ▸ Operations ▸ Receipts". */
    path: z.string().optional(),
    /** Odoo version the screen was captured from, e.g. "Odoo 20". */
    version: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    callouts: z
      .array(
        z.object({
          /** Centre of the highlighted data, in % of the image. */
          x: z.number().min(0).max(100),
          y: z.number().min(0).max(100),
          /** Size of the highlight box around the data (% of the image); a small default box when omitted. */
          w: z.number().positive().max(100).optional(),
          h: z.number().positive().max(100).optional(),
          /** Side of the box where the number tag sits, so it never covers the data. */
          tag: z.enum(["top", "bottom", "left", "right"]).optional(),
          title: text,
          text: z.string().optional(),
        }),
      )
      .max(12)
      .default([]),
  }),
  /** Click-through practice on real screenshots: the learner clicks (and types) to complete a process. */
  simulate: z.object({
    title: z.string().optional(),
    intro: z.string().optional(),
    caption: z.string().optional(),
    version: z.string().optional(),
    /** Shown on the completion card. */
    outcome: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    steps: z
      .array(
        z.object({
          src: z.string().regex(/^\/visuals\/[a-z0-9/_.-]+\.(png|webp|jpg)$/, "src must be a screenshot under /visuals/ (png, webp or jpg)"),
          alt: z.string().trim().min(10, "alt text must describe the screen (10+ characters)"),
          path: z.string().optional(),
          /** What the learner must do on this screen. */
          task: text,
          /** Where to click. A step without a target is a "look" step with a Next button. */
          target: box.extend({ label: text }).optional(),
          /** Other areas that also count as correct (e.g. a second button doing the same thing). */
          also: z.array(box).max(4).default([]),
          /** After the correct click, ask the learner to type a value. */
          input: z.object({ label: text, answer: text, placeholder: z.string().optional() }).optional(),
          hint: z.string().optional(),
          /** Plausible wrong clicks with a specific explanation. */
          traps: z.array(box.extend({ feedback: text })).max(6).default([]),
          /** Shown once the step is done: what Odoo just did and why. */
          explain: text,
        }),
      )
      .min(2)
      .max(16),
  }),
  /** Narrated training video (MP4 under /videos/) with a poster image and clickable chapters (seconds). */
  video: z.object({
    src: z.string().regex(/^\/videos\/[a-z0-9_.-]+\.mp4$/, "src must be an MP4 under /videos/"),
    poster: z.string().regex(/^\/videos\/[a-z0-9_.-]+\.(webp|jpg|png)$/).optional(),
    title: text,
    caption: z.string().optional(),
    duration: z.string().optional(),
    chapters: z.array(z.object({ t: z.number().min(0), label: text })).max(30).default([]),
  }),
  /** Exercise: put the items in the right order (items are authored in the correct order and shuffled on screen). */
  order: z.object({ title: z.string().optional(), prompt: text, items: z.array(text).min(3).max(10), explanation: z.string().optional() }),
  /** Exercise: match each left item to its right item (pairs authored correctly; the right side is shuffled). */
  match: z.object({
    title: z.string().optional(),
    prompt: text,
    leftLabel: z.string().optional(),
    rightLabel: z.string().optional(),
    pairs: z.array(z.object({ left: text, right: text })).min(3).max(10),
    explanation: z.string().optional(),
  }),
  /** Indian GST calculator: intra-state (CGST + SGST) vs inter-state (IGST) from the place of supply. */
  gst: z.object({
    title: z.string().optional(),
    sellerState: text,
    states: z.array(text).min(2).max(40),
    amount: z.number().positive().default(10000),
    rate: z.number().min(0).max(40).default(18),
    rates: z.array(z.number().min(0).max(40)).min(1).max(8).default([0, 5, 12, 18, 28]),
    caption: z.string().optional(),
  }),
  /** Sequence diagram, stepped through message by message (REST calls, OAuth, webhooks, RPC). */
  sequence: z.object({
    title: z.string().optional(),
    caption: z.string().optional(),
    actors: z.array(text).min(2).max(5),
    messages: z
      .array(z.object({ from: text, to: text, label: text, note: z.string().optional(), kind: z.enum(["request", "response", "async", "self"]).default("request") }))
      .min(1)
      .max(16),
  }),
  /** Annotated code: click a note to highlight its lines. Write code with single quotes and no backslashes. */
  codewalk: z.object({
    title: z.string().optional(),
    language: z.string().default("text"),
    file: z.string().optional(),
    code: z.array(z.string()).min(1).max(80),
    notes: z.array(z.object({ lines: z.string().regex(/^\d+(-\d+)?$/, "lines must look like 3 or 3-7"), title: text, text: z.string().optional() })).min(1).max(12),
    caption: z.string().optional(),
  }),
  /** Consultant role-play: the client speaks, the learner picks an answer, each answer gets feedback. */
  roleplay: z.object({
    title: z.string().optional(),
    setting: text,
    client: z.string().default("Client"),
    rounds: z
      .array(z.object({ says: text, options: z.array(z.object({ text, quality: z.enum(["best", "ok", "poor"]), feedback: text })).min(2).max(4) }))
      .min(1)
      .max(8),
    wrapup: z.string().optional(),
  }),
  takeaways: z.object({ title: z.string().optional(), items: z.array(text).min(1).max(12) }),
} as const;

export type VisualType = keyof typeof visualSchemas;
export type VisualData<T extends VisualType> = z.infer<(typeof visualSchemas)[T]>;

export function isVisualType(t: string): t is VisualType {
  return Object.prototype.hasOwnProperty.call(visualSchemas, t);
}

export type ParsedVisual = { ok: true; type: VisualType; data: unknown } | { ok: false; type: string; error: string };

/** Parses the JSON body of a ```visual-<type> fence. Extra semantic checks run after schema validation. */
export function parseVisual(type: string, source: string): ParsedVisual {
  if (!isVisualType(type)) return { ok: false, type, error: `Unknown visual type "visual-${type}".` };
  let json: unknown;
  try {
    json = JSON.parse(source);
  } catch (e) {
    return { ok: false, type, error: `Invalid JSON: ${(e as Error).message}` };
  }
  const res = visualSchemas[type].safeParse(json);
  if (!res.success) {
    const i = res.error.issues[0];
    return { ok: false, type, error: `${i.path.join(".") || "(root)"}: ${i.message}` };
  }
  const data = res.data as Record<string, unknown>;
  if (type === "check") {
    const d = data as VisualData<"check">;
    if (d.correct >= d.options.length) return { ok: false, type, error: "correct: index is outside the options list" };
  }
  if (type === "decision") {
    const d = data as VisualData<"decision">;
    if (!d.nodes[d.start]) return { ok: false, type, error: `start: node "${d.start}" does not exist` };
    for (const [id, n] of Object.entries(d.nodes)) {
      if ("options" in n) for (const o of n.options) if (!d.nodes[o.next]) return { ok: false, type, error: `nodes.${id}: option "${o.label}" points to missing node "${o.next}"` };
    }
  }
  if (type === "sequence") {
    const d = data as VisualData<"sequence">;
    const bad = d.messages.find((m) => !d.actors.includes(m.from) || !d.actors.includes(m.to));
    if (bad) return { ok: false, type, error: `messages: "${bad.label}" uses an actor that is not in actors (${d.actors.join(", ")})` };
  }
  if (type === "codewalk") {
    const d = data as VisualData<"codewalk">;
    for (const n of d.notes) {
      const [a, b = a] = n.lines.split("-").map(Number);
      if (a < 1 || b < a || b > d.code.length) return { ok: false, type, error: `notes: "${n.title}" points to lines ${n.lines} but the code has ${d.code.length} lines` };
    }
  }
  if (type === "match") {
    const d = data as VisualData<"match">;
    if (new Set(d.pairs.map((p) => p.right)).size !== d.pairs.length) return { ok: false, type, error: "pairs: right-hand values must be unique" };
  }
  if (type === "roleplay") {
    const d = data as VisualData<"roleplay">;
    const i = d.rounds.findIndex((r) => !r.options.some((o) => o.quality === "best"));
    if (i >= 0) return { ok: false, type, error: `rounds[${i}]: needs at least one option with quality "best"` };
  }
  if (type === "gst") {
    const d = data as VisualData<"gst">;
    if (!d.states.includes(d.sellerState)) return { ok: false, type, error: "states: must include sellerState" };
  }
  if (type === "compare") {
    const d = data as VisualData<"compare">;
    const bad = d.rows.find((r) => r.values.length !== d.columns.length);
    if (bad) return { ok: false, type, error: `rows: "${bad.label}" has ${bad.values.length} values for ${d.columns.length} columns` };
  }
  if (type === "story") {
    const d = data as VisualData<"story">;
    const ids = new Set(d.stations.map((s) => s.id));
    if (ids.size !== d.stations.length) return { ok: false, type, error: "stations: ids must be unique" };
    if (d.layout !== "timeline") {
      const missing = d.stations.find((s) => s.x === undefined || s.y === undefined);
      if (missing) return { ok: false, type, error: `stations: "${missing.id}" needs x and y for the ring layout` };
      const spots = new Set(d.stations.map((s) => `${s.x},${s.y}`));
      if (spots.size !== d.stations.length) return { ok: false, type, error: "stations: two stations share the same x/y position" };
    }
    for (const [i, s] of d.scenes.entries()) {
      for (const ref of [s.to, s.from]) if (ref && !ids.has(ref)) return { ok: false, type, error: `scenes.${i}: station "${ref}" does not exist` };
    }
    const bad = d.counters.find((c) => c.values.length !== d.scenes.length);
    if (bad) return { ok: false, type, error: `counters: "${bad.label}" has ${bad.values.length} values for ${d.scenes.length} scenes` };
  }
  if (type === "trend") {
    const d = data as VisualData<"trend">;
    const bad = d.series.find((s) => s.values.length !== d.points.length);
    if (bad) return { ok: false, type, error: `series: "${bad.label}" has ${bad.values.length} values for ${d.points.length} points` };
  }
  if (type === "mockup") {
    const d = data as VisualData<"mockup">;
    if (d.status && d.status.current >= d.status.steps.length) return { ok: false, type, error: "status.current is outside status.steps" };
  }
  return { ok: true, type, data };
}

/** Extracts every visual block from a Markdown body (used by tests, audits and the asset register). */
export function extractVisualBlocks(body: string): { type: string; source: string }[] {
  const out: { type: string; source: string }[] = [];
  const re = /^```visual-([a-z]+)\s*\n([\s\S]*?)^```\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) out.push({ type: m[1], source: m[2] });
  return out;
}
