/**
 * Presentation-only Markdown enhancements applied to every lesson at render time.
 * The stored lesson text is never changed.
 *
 * - "## Key takeaways" + bullet list  → visual-takeaways block (summary cards)
 * - Standalone "A → B → C" lines      → compact visual-flow block (process chips)
 */

const FENCE = /^\s*```/;

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[*_`~]/g, "")
      .replace(/&[a-z]+;/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "section"
  );
}

const stripInline = (s: string) => s.replace(/\*\*|__|`/g, "").replace(/\s+/g, " ").trim();

function fence(type: string, data: unknown): string[] {
  return ["```visual-" + type, JSON.stringify(data), "```"];
}

export function enhanceMarkdown(body: string): string {
  const lines = body.split(/\r?\n/);
  const out: string[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (FENCE.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }

    // Key takeaways heading followed by a bullet list.
    const kt = line.match(/^(#{2,3})\s+key takeaways\s*:?\s*$/i);
    if (kt) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      const items: string[] = [];
      while (j < lines.length && /^\s*[-*]\s+/.test(lines[j])) {
        let item = lines[j].replace(/^\s*[-*]\s+/, "");
        // Continuation lines indented under the bullet.
        while (j + 1 < lines.length && /^\s{2,}\S/.test(lines[j + 1]) && !/^\s*[-*]\s+/.test(lines[j + 1])) {
          item += " " + lines[++j].trim();
        }
        items.push(item.trim());
        j++;
      }
      if (items.length) {
        out.push(...fence("takeaways", { items }));
        i = j - 1;
        continue;
      }
    }

    // Standalone arrow chain: "Lead → Opportunity → Quotation".
    const prevBlank = i === 0 || lines[i - 1].trim() === "";
    const nextBlank = i === lines.length - 1 || lines[i + 1].trim() === "";
    if (prevBlank && nextBlank && !/^\s*(#|[-*+]\s|\d+\.\s|\||>)/.test(line)) {
      const parts = line
        .split(/\s*(?:→|->)\s*/)
        .map((p) => stripInline(p).replace(/[.;:]$/, ""))
        .filter(Boolean);
      if (parts.length >= 3 && parts.length <= 12 && parts.every((p) => p.length <= 60)) {
        out.push(...fence("flow", { compact: true, steps: parts.map((title) => ({ title })) }));
        continue;
      }
    }
    out.push(line);
  }
  return out.join("\n");
}

export interface TocItem {
  id: string;
  text: string;
}

/** Level-2 headings (outside code fences) for the "On this page" outline. */
export function extractToc(body: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of body.split(/\r?\n/)) {
    if (FENCE.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (m) {
      const text = stripInline(m[1]);
      items.push({ id: slugify(text), text });
    }
  }
  return items;
}
