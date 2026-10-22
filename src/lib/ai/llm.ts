import "server-only";

/**
 * Minimal structured-output LLM client. The course builder asks for JSON that must
 * match a JSON Schema (OpenAI "structured outputs"), so responses can be validated
 * and stored without free-text parsing. Injected as an interface so tests can use a fake.
 */
export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface LlmClient {
  model: string;
  json<T>(request: { system: string; user: string; schemaName: string; schema: Record<string, unknown>; maxTokens?: number }): Promise<{ data: T; usage: LlmUsage }>;
}

export function courseAiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function courseModel(): string {
  return process.env.OPENAI_COURSE_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
}

export function openAiClient(): LlmClient | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = courseModel();
  const base = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, "");
  return {
    model,
    async json<T>({ system, user, schemaName, schema, maxTokens = 6000 }: Parameters<LlmClient["json"]>[0]) {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature: 0.6,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: { type: "json_schema", json_schema: { name: schemaName, strict: true, schema } },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(180_000),
      });
      const body = await res.text();
      if (!res.ok) throw new Error(`OpenAI ${res.status}: ${body.slice(0, 500)}`);
      const json = JSON.parse(body) as {
        choices?: { message?: { content?: string; refusal?: string }; finish_reason?: string }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      const choice = json.choices?.[0];
      if (choice?.message?.refusal) throw new Error(`The model declined: ${choice.message.refusal}`);
      if (choice?.finish_reason === "length") throw new Error("The response was cut off (too long). Try fewer lessons per module.");
      const content = choice?.message?.content;
      if (!content) throw new Error("The model returned an empty response.");
      return {
        data: JSON.parse(content) as T,
        usage: { promptTokens: json.usage?.prompt_tokens ?? 0, completionTokens: json.usage?.completion_tokens ?? 0 },
      };
    },
  };
}
