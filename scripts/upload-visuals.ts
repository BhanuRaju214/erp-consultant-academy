/**
 * Uploads the lesson images in public/visuals to R2 (same paths, under `visuals/`)
 * and registers each one in media_assets. Safe to re-run: unchanged files are skipped.
 *
 *   npm run media:upload-visuals
 *
 * Afterwards set VISUALS_ON_R2=true (with R2_PUBLIC_URL) and rebuild, so /visuals/*
 * requests redirect to the bucket and the images no longer need to ship with the app.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createDb } from "../src/lib/db/client";
import { mediaAssets } from "../src/lib/db/schema";
import { headObject, putObject, storageDriver } from "../src/lib/storage";
import { classifyFile } from "../src/lib/services/media";

const ROOT = path.join(process.cwd(), "public", "visuals");

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])));
  return nested.flat();
}

async function main() {
  if (storageDriver() !== "r2") {
    console.error("R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET in .env.local.");
    process.exit(1);
  }
  const files = (await walk(ROOT)).filter((f) => classifyFile(f)?.kind === "image");
  const handle = await createDb();
  let uploaded = 0;
  let skipped = 0;

  const queue = [...files];
  const worker = async () => {
    for (let file = queue.shift(); file; file = queue.shift()) {
      const key = `visuals/${path.relative(ROOT, file).split(path.sep).join("/")}`;
      const body = await readFile(file);
      const type = classifyFile(file)!;
      if ((await headObject(key)) === body.byteLength) {
        skipped++;
      } else {
        await putObject(key, body, type.contentType);
        uploaded++;
      }
      await handle.db
        .insert(mediaAssets)
        .values({
          kind: "image",
          status: "ready",
          visibility: "public",
          title: path.basename(file),
          fileName: path.basename(file),
          contentType: type.contentType,
          sizeBytes: body.byteLength,
          storage: "r2",
          storageKey: key,
        })
        .onConflictDoUpdate({ target: [mediaAssets.storage, mediaAssets.storageKey], set: { sizeBytes: body.byteLength, status: "ready" } });
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  await handle.close();
  console.log(`Done: ${uploaded} uploaded, ${skipped} already up to date, ${files.length} registered in media_assets.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
