import "server-only";

/**
 * Server-side AI learning assistant.
 *
 * - Calls the OpenAI Chat Completions API only from the server; the key is read
 *   from OPENAI_API_KEY and never sent to the browser.
 * - Answers are grounded on retrieved portal passages (lessons + documentation),
 *   which are passed to the model with their source links.
 * - Without a key, the assistant runs in "offline mode": it returns the most
 *   relevant portal passages instead of a generated answer.
 */

export interface AssistantContext {
  odooVersion: string;
  edition: "Community" | "Enterprise" | "Odoo Online";
  apps: string[];
  mode: "explain" | "troubleshoot" | "test-scenarios" | "spec-review" | "interview" | "hint" | "code";
}

export interface Passage {
  title: string;
  href: string;
  text: string;
}

export interface AssistantReply {
  content: string;
  sources: { title: string; href: string }[];
  /** "scope": the question was outside the course topics and was politely declined. */
  provider: "openai" | "offline" | "scope";
}

/** The model answers with this (and an optional suggestion) when a question is outside the course. */
export const OUT_OF_SCOPE_MARKER = "[[OUT_OF_SCOPE]]";

/** What the assistant covers, used in the prompt and in the out-of-scope reply. */
const COURSE_SCOPE =
  "ERP concepts and implementation methodology; business processes (Order to Cash, Procure to Pay, Record to Report, inventory, manufacturing, projects); " +
  "Odoo apps and their configuration (CRM, Sales, Purchase, Inventory, Accounting incl. Indian GST, Manufacturing, eCommerce); data migration and imports; " +
  "Odoo technical development (Python as used in Odoo, the ORM, models, fields, views, modules); integrations and APIs with Odoo; testing and QA; " +
  "consultant skills, requirement and spec writing, the course projects, assessments and interview preparation";

const MODE_INSTRUCTIONS: Record<AssistantContext["mode"], string> = {
  explain: "Explain the concept in simple language first, then the business purpose, then how it appears in Odoo.",
  troubleshoot: "Diagnose the error: likely causes ranked by probability, how to confirm each, and the fix. Ask for the exact error text if missing.",
  "test-scenarios": "Generate test scenarios in a table: Test Case ID | Scenario | Preconditions | Steps | Expected Result. Include negative tests.",
  "spec-review": "Review the requirement/specification: ambiguity, missing acceptance criteria, standard-vs-custom classification, risks.",
  interview: "Act as an interviewer for an Odoo techno-functional consultant role. Ask one question at a time and give feedback on the trainee's answer.",
  hint: "Give a hint only — do not give the full solution. Guide the trainee to the next step with a question.",
  code: "Explain the code line by line, point out Odoo version-specific constructs, and suggest tests.",
};

export function buildSystemPrompt(ctx: AssistantContext, passages: Passage[]): string {
  const sources = passages.length
    ? passages.map((p, i) => `[S${i + 1}] ${p.title} (${p.href})\n${p.text}`).join("\n\n---\n\n")
    : "(no matching portal content found)";
  return [
    "You are the Nexsademy learning assistant. You coach trainees to become Odoo techno-functional consultants.",
    "You are NOT a general-purpose assistant. You only help with what the Nexsademy Odoo ERP Consultant course teaches:",
    COURSE_SCOPE + ".",
    "SCOPE RULES (mandatory, check these first):",
    `A. If the trainee's latest message is not about those course topics, reply with exactly ${OUT_OF_SCOPE_MARKER} and write nothing else. ` +
      "Only when the question is close to a course topic (for example a generic programming question that has an Odoo equivalent), add after the marker one course question " +
      "about that same subject, written the way the trainee would ask it. For unrelated subjects (weather, sport, letters, news) add nothing after the marker. " +
      "Out of scope includes: weather, news, sport, general knowledge, personal, medical, legal or financial advice, school homework, writing unrelated to ERP work, " +
      "and programming that is not about Odoo or ERP (for example general Python exercises, other frameworks or languages).",
    "B. Do not stretch an unrelated question into an Odoo answer. A generic programming question is out of scope; the same question asked about Odoo (for example integer fields in an Odoo model) is in scope.",
    "C. Greetings, thanks and questions about how to use this assistant or the course are in scope: answer them briefly, without a Verification line.",
    `Trainee context: Odoo ${ctx.odooVersion}, ${ctx.edition} edition, installed apps: ${ctx.apps.join(", ") || "not specified"}.`,
    MODE_INSTRUCTIONS[ctx.mode],
    "ACCURACY RULES (mandatory):",
    "1. Never invent Odoo menu paths, field names, features, settings or API capabilities. If you are not certain something exists in the stated version/edition, say so explicitly.",
    "2. Prefer the portal sources below. Cite them inline as [S1], [S2], and only cite a source you actually used; ignore sources that don't match the question. Official Odoo documentation (odoo.com/documentation) is the authority; portal sources summarise it.",
    "3. End every answer with a line starting 'Verification:' that states either 'Grounded in portal sources [Sx]' or 'General guidance — validate in your training environment', and list anything that is version- or edition-sensitive.",
    "4. Distinguish standard features, Enterprise-only features, configuration, and custom development.",
    "5. Use fictional data in examples. Never ask for or repeat credentials, API keys or real customer data. Recommend test databases, never production, for experiments.",
    "PORTAL SOURCES:",
    sources,
  ].join("\n");
}

export async function askAssistant(
  history: { role: "user" | "assistant"; content: string }[],
  ctx: AssistantContext,
  passages: Passage[],
): Promise<AssistantReply> {
  const sources = passages.map((p) => ({ title: p.title, href: p.href }));
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return offlineReply(history.at(-1)?.content ?? "", passages);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch(`${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 1200,
        messages: [{ role: "system", content: buildSystemPrompt(ctx, passages) }, ...history.slice(-12)],
      }),
    });
    if (!res.ok) {
      console.error("[assistant] provider error", res.status, (await res.text()).slice(0, 300));
      return {
        content: `The AI service returned an error (HTTP ${res.status}). Showing related portal content instead.\n\n${offlineReply("", passages).content}`,
        sources,
        provider: "offline",
      };
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return finalizeReply(json.choices?.[0]?.message?.content?.trim() || "No answer was returned.", sources);
  } catch (err) {
    console.error("[assistant] request failed", err);
    return { ...offlineReply("", passages), content: `The AI service is unreachable right now.\n\n${offlineReply("", passages).content}` };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Turns the model's raw answer into what the learner sees: an out-of-scope marker
 * becomes the standard "outside your course" reply (no sources, no verification line),
 * and only the portal sources the answer actually cites are listed, renumbered in order.
 */
export function finalizeReply(raw: string, sources: { title: string; href: string }[]): AssistantReply {
  const text = raw.trim();
  if (text.includes(OUT_OF_SCOPE_MARKER)) {
    const suggestion = text
      .slice(text.indexOf(OUT_OF_SCOPE_MARKER) + OUT_OF_SCOPE_MARKER.length)
      .replace(/^[\s:–—-]+/, "")
      .split("\n")[0]
      .trim()
      .slice(0, 200);
    return {
      content: [
        "That question is outside your Nexsademy course, so I can't help with it here. I only answer questions about what the course teaches:",
        "",
        "- ERP concepts, business processes and implementation methodology",
        "- Odoo apps and configuration, data imports and Indian GST",
        "- Odoo development (Python in Odoo, models, views), integrations and testing",
        "- Consultant skills, course projects, assessments and interview preparation",
        ...(suggestion ? ["", `You could ask, for example: *${suggestion.replace(/\*/g, "")}*`] : []),
      ].join("\n"),
      sources: [],
      provider: "scope",
    };
  }
  // Keep only cited sources, in citation order, and renumber [Sx] to match the list.
  const order: number[] = [];
  for (const m of text.matchAll(/\[S(\d+)\]/g)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= sources.length && !order.includes(n)) order.push(n);
  }
  const content = text.replace(/\[S(\d+)\]/g, (all, d: string) => (order.includes(Number(d)) ? `[S${order.indexOf(Number(d)) + 1}]` : all));
  return { content, sources: order.map((n) => sources[n - 1]), provider: "openai" };
}

export function offlineReply(question: string, passages: Passage[]): AssistantReply {
  const sources = passages.map((p) => ({ title: p.title, href: p.href }));
  if (!passages.length) {
    return {
      content:
        "**Offline mode** — the AI provider is not configured (set `OPENAI_API_KEY` on the server).\n\n" +
        `I could not find portal content matching${question ? ` "${question.slice(0, 80)}"` : " your question"}. Try different keywords or use Search.\n\nVerification: General guidance — validate in your training environment.`,
      sources,
      provider: "offline",
    };
  }
  const body = passages
    .map((p, i) => {
      const excerpt = p.text.replace(/\s+/g, " ").slice(0, 420);
      return `**[S${i + 1}] [${p.title}](${p.href})**\n\n> ${excerpt}…`;
    })
    .join("\n\n");
  return {
    content:
      "**Offline mode** — the AI provider is not configured, so here are the most relevant portal passages:\n\n" +
      body +
      "\n\nVerification: Grounded in portal sources — open them for the full explanation.",
    sources,
    provider: "offline",
  };
}
