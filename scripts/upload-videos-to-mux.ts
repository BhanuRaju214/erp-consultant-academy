/**
 * Uploads the narrated lesson videos (public/videos/*.mp4) to Mux and records each one
 * in media_assets with storage "mux" and storageKey "/videos/<name>.mp4", the path the
 * course content uses. The video player then streams them from Mux, so the web server
 * never serves the MP4s. Safe to re-run: videos already on Mux are skipped.
 *
 *   npx tsx --conditions=react-server --env-file=.env.local scripts/upload-videos-to-mux.ts [videoDir]
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { createDb } from "@/lib/db/client";
import { mediaAssets } from "@/lib/db/schema";
import { MUX_STATUS_API, createDirectUpload, muxEnabled } from "@/lib/mux";
import { syncPendingMuxAsset } from "@/lib/services/media";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 4 MB pieces (Mux needs multiples of 256 KB); small enough to finish on slow connections. */
const CHUNK = 4 * 1024 * 1024;

/**
 * Resumable upload to a Mux direct-upload URL: one PUT per chunk with a Content-Range
 * header (Mux answers 308 until the last chunk). Each chunk is retried a few times.
 */
async function putInChunks(url: string, bytes: Buffer, label: string): Promise<void> {
  const total = bytes.length;
  for (let start = 0; start < total; start += CHUNK) {
    const end = Math.min(start + CHUNK, total);
    for (let attempt = 1; ; attempt++) {
      try {
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "video/mp4", "Content-Range": `bytes ${start}-${end - 1}/${total}` },
          body: new Uint8Array(bytes.subarray(start, end)),
          signal: AbortSignal.timeout(15 * 60_000),
        });
        if (res.ok || res.status === 308) break;
        throw new Error(`HTTP ${res.status} ${await res.text()}`);
      } catch (err) {
        if (attempt >= 5) throw new Error(`${label}: chunk ${start}-${end} failed: ${(err as Error).message}`);
        console.log(`${label}: chunk retry ${attempt} (${(err as Error).message})`);
        await sleep(5000 * attempt);
      }
    }
    if (end < total) console.log(`${label}: ${Math.round((end / total) * 100)}%`);
  }
}

/** Video titles as written in the course content ("src" followed by "title"). */
async function titlesFromContent(): Promise<Map<string, string>> {
  const titles = new Map<string, string>();
  const walk = async (dir: string): Promise<void> => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith(".ts")) {
        const text = await readFile(full, "utf8");
        for (const m of text.matchAll(/"src":\s*"(\/videos\/[a-z0-9_.-]+\.mp4)"[\s\S]{0,300}?"title":\s*"([^"]+)"/g)) titles.set(m[1], m[2]);
      }
    }
  };
  await walk(path.join(process.cwd(), "src", "content"));
  return titles;
}

async function main() {
  if (!muxEnabled()) throw new Error("Set MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUX_SIGNING_KEY_ID and MUX_SIGNING_KEY_PRIVATE first.");
  const dir = process.argv[2] ?? path.join(process.cwd(), "public", "videos");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mp4")).sort();
  const titles = await titlesFromContent();
  const h = await createDb();
  const db = h.db;
  const pending: string[] = [];

  for (const [i, file] of files.entries()) {
    const src = `/videos/${file}`;
    const label = `[${i + 1}/${files.length}] ${file}`;
    let asset = await db.query.mediaAssets.findFirst({ where: and(eq(mediaAssets.storage, "mux"), eq(mediaAssets.storageKey, src)) });
    if (asset?.status === "ready") {
      console.log(`${label}: already on Mux`);
      continue;
    }
    if (asset?.muxUploadId && asset.status === "pending") {
      console.log(`${label}: uploaded earlier, waiting for Mux`);
      pending.push(asset.id);
      continue;
    }
    const bytes = await readFile(path.join(dir, file));
    if (bytes.subarray(0, 40).toString().startsWith("version https://git-lfs")) throw new Error(`${file} is a Git LFS pointer. Run "git lfs pull" first.`);
    const title = titles.get(src) ?? file.replace(/\.mp4$/, "").replace(/-/g, " ");
    if (!asset) {
      [asset] = await db
        .insert(mediaAssets)
        .values({ kind: "video", status: "pending", visibility: "enrolled", title, fileName: file, contentType: "video/mp4", sizeBytes: (await stat(path.join(dir, file))).size, storage: "mux", storageKey: src })
        .returning();
    }
    const upload = await createDirectUpload({ corsOrigin: "*", passthrough: asset.id });
    const started = Date.now();
    await putInChunks(upload.url, bytes, label);
    await db.update(mediaAssets).set({ muxUploadId: upload.id, status: "pending", error: null }).where(eq(mediaAssets.id, asset.id));
    const secs = (Date.now() - started) / 1000;
    console.log(`${label}: uploaded ${(bytes.length / 1048576).toFixed(1)} MB in ${secs.toFixed(0)} s (${(bytes.length / 1024 / secs).toFixed(0)} KB/s) "${title}"`);
    pending.push(asset.id);
  }

  // Mux encodes in the background; wait until every video can be played.
  for (let round = 0; pending.length && round < 120; round++) {
    await sleep(10_000);
    for (const id of [...pending]) {
      const row = await db.query.mediaAssets.findFirst({ where: eq(mediaAssets.id, id) });
      if (!row) continue;
      const synced = await syncPendingMuxAsset(db, row, MUX_STATUS_API, 0);
      if (synced.status !== "pending") {
        pending.splice(pending.indexOf(id), 1);
        console.log(`${synced.fileName}: ${synced.status}${synced.error ? ` (${synced.error})` : ""}`);
      }
    }
  }
  console.log(pending.length ? `${pending.length} video(s) still encoding; re-run later to check.` : "All videos are ready on Mux.");
  await h.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
