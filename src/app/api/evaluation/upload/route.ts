import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { transcribe } from "@/lib/evaluation/ai";
import { rateLimit } from "@/lib/rate-limit";
import { attachMedia, getLatestEvaluation, saveAnswer, type MediaKind } from "@/lib/services/evaluation";
import { deleteUpload, saveStream } from "@/lib/storage";

export const maxDuration = 300;

const MB = 1024 * 1024;
/** Allowed extensions and size limits per upload kind. */
const KINDS: Record<MediaKind | "answer", { exts: string[]; max: number }> = {
  slides: { exts: [".pptx", ".ppt", ".pdf"], max: 50 * MB },
  video: { exts: [".webm", ".mp4"], max: 1024 * MB },
  camera: { exts: [".webm", ".mp4"], max: 300 * MB },
  audio: { exts: [".webm", ".ogg", ".mp4", ".m4a"], max: 25 * MB },
  answer: { exts: [".webm", ".ogg", ".mp4", ".m4a"], max: 10 * MB },
};

/**
 * Streams a final-evaluation file (slides, screen recording, webcam, narration audio or a spoken answer)
 * to private storage. The raw request body is the file. This path is excluded from the middleware so the
 * body is never buffered in memory; the session is checked here instead.
 * Query: kind, ext (e.g. .webm), name (slides file name), q (answer index).
 */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(`evaluation-upload:${user.id}`, 30, 60_000)) return NextResponse.json({ error: "Too many uploads. Wait a minute." }, { status: 429 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") as keyof typeof KINDS;
  const ext = (url.searchParams.get("ext") ?? "").toLowerCase();
  const rule = KINDS[kind];
  if (!rule) return NextResponse.json({ error: "Unknown upload kind." }, { status: 400 });
  if (!rule.exts.includes(ext)) return NextResponse.json({ error: `File type ${ext || "(none)"} is not allowed. Allowed: ${rule.exts.join(", ")}` }, { status: 400 });
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > rule.max) return NextResponse.json({ error: `File is larger than ${rule.max / MB} MB.` }, { status: 413 });
  if (!req.body) return NextResponse.json({ error: "Empty upload." }, { status: 400 });

  const db = await getDb();
  const ev = await getLatestEvaluation(db, user.id);
  const open = kind === "answer" ? ev?.status === "questions" : ev?.status === "recording";
  if (!ev || !open) return NextResponse.json({ error: "This evaluation step is not open." }, { status: 409 });

  let stored: { relPath: string; bytes: number };
  try {
    stored = await saveStream(`evaluations-${user.id}`, ext, req.body, rule.max);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 413 });
  }
  if (stored.bytes === 0) {
    await deleteUpload(stored.relPath);
    return NextResponse.json({ error: "Empty upload." }, { status: 400 });
  }

  try {
    if (kind === "answer") {
      const index = Number(url.searchParams.get("q"));
      const { previous, transcript } = await saveAnswer(db, ev, index, stored.relPath, { transcribe, chatJson: async () => null });
      if (previous) await deleteUpload(previous);
      return NextResponse.json({ ok: true, transcript });
    }
    const name = (url.searchParams.get("name") ?? "").replace(/[\r\n"\\/]/g, "_").slice(0, 200) || `slides${ext}`;
    const previous = await attachMedia(db, ev, kind, stored.relPath, name);
    if (previous) await deleteUpload(previous);
    return NextResponse.json({ ok: true });
  } catch (err) {
    await deleteUpload(stored.relPath);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 409 });
  }
}
