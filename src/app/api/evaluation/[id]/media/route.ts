import path from "node:path";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { projectEvaluations } from "@/lib/db/schema";
import { statUpload, streamUpload } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".pdf": "application/pdf",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".ppt": "application/vnd.ms-powerpoint",
};

/**
 * Streams an evaluation file to its owner or to trainers/admins, with HTTP Range support so the
 * recordings can be played and seeked in the browser. Query: kind=video|camera|audio|slides|answer, q=index.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ev = await (await getDb()).query.projectEvaluations.findFirst({ where: eq(projectEvaluations.id, id) });
  if (!ev || (ev.userId !== user.id && !can(user.role, "trainer:review"))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const relPath =
    kind === "video" ? ev.videoPath
    : kind === "camera" ? ev.cameraPath
    : kind === "audio" ? ev.audioPath
    : kind === "slides" ? ev.slidesPath
    : kind === "answer" ? ev.questions[Number(url.searchParams.get("q"))]?.answerPath
    : null;
  const size = relPath ? await statUpload(relPath) : null;
  if (!relPath || size === null) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": TYPES[path.extname(relPath)] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (kind === "slides") headers["Content-Disposition"] = `attachment; filename="${(ev.slidesName ?? `slides${path.extname(relPath)}`).replace(/["\\\r\n]/g, "_")}"`;

  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (range && size > 0) {
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end) return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    return new NextResponse(streamUpload(relPath, start, end), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }
  return new NextResponse(streamUpload(relPath), { headers: { ...headers, "Content-Length": String(size) } });
}
