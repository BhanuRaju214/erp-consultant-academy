import "server-only";
import path from "node:path";
import { readStored } from "@/lib/storage";

/**
 * Server-side calls to the AI provider for the final evaluation: speech-to-text for the
 * recorded presentation and answers, and JSON chat completions for questions and scoring.
 * Uses the same OPENAI_API_KEY / OPENAI_BASE_URL as the learning assistant; the key never
 * reaches the browser. Every function returns null when the provider is unavailable so the
 * caller can fall back to a trainer-only review.
 */

const AUDIO_TYPES: Record<string, string> = { ".webm": "audio/webm", ".ogg": "audio/ogg", ".mp4": "audio/mp4", ".m4a": "audio/mp4" };
const BASE_URL = () => process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

export function aiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** Transcribes a stored audio file. Returns the text and, when the provider reports it, the duration in seconds. */
export async function transcribe(relPath: string): Promise<{ text: string; durationSec: number | null } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1";
  try {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(await readStored(relPath))], { type: AUDIO_TYPES[path.extname(relPath)] ?? "audio/webm" }), path.basename(relPath));
    form.append("model", model);
    // verbose_json (whisper-1) includes the audio duration, which verifies the minimum length server-side.
    form.append("response_format", model === "whisper-1" ? "verbose_json" : "json");
    form.append("language", "en");
    const res = await fetch(`${BASE_URL()}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(180_000),
    });
    if (!res.ok) {
      console.error("[evaluation] transcription error", res.status, (await res.text()).slice(0, 300));
      return null;
    }
    const json = (await res.json()) as { text?: string; duration?: number };
    return { text: (json.text ?? "").trim(), durationSec: typeof json.duration === "number" ? json.duration : null };
  } catch (err) {
    console.error("[evaluation] transcription failed", err);
    return null;
  }
}

/** A chat completion that must return a JSON object; returns the raw content string. */
export async function chatJson(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`${BASE_URL()}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 1800,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error("[evaluation] chat error", res.status, (await res.text()).slice(0, 300));
      return null;
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error("[evaluation] chat failed", err);
    return null;
  }
}
