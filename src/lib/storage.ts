import "server-only";
import { randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

/**
 * Private file storage for submissions. Files live outside /public and are only
 * served through an authorised route handler. Swap this module for S3/GCS/Azure
 * Blob in production deployments with ephemeral disks.
 */
const ROOT = path.resolve(process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage"));

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".csv", ".zip", ".png", ".jpg", ".jpeg", ".txt", ".md", ".py", ".xml"];

export function validateUpload(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) return "File is larger than 5 MB.";
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return `File type ${ext || "(none)"} is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
  return null;
}

export async function saveUpload(folder: string, file: File): Promise<{ relPath: string; fileName: string }> {
  const ext = path.extname(file.name).toLowerCase();
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const relPath = path.posix.join(safeFolder, `${randomUUID()}${ext}`);
  const abs = path.join(ROOT, relPath);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, Buffer.from(await file.arrayBuffer()));
  return { relPath, fileName: path.basename(file.name).slice(0, 200) };
}

export async function readUpload(relPath: string): Promise<Buffer> {
  const abs = path.resolve(ROOT, relPath);
  if (!abs.startsWith(ROOT + path.sep)) throw new Error("Invalid path");
  return readFile(abs);
}

/* ------------------------------------------------------------------ */
/* Large media (final evaluation recordings): streamed, never buffered */
/* ------------------------------------------------------------------ */

function resolveStored(relPath: string): string {
  const abs = path.resolve(ROOT, relPath);
  if (!abs.startsWith(ROOT + path.sep)) throw new Error("Invalid path");
  return abs;
}

/** Streams a request body to private storage, aborting (and deleting the partial file) above maxBytes. */
export async function saveStream(folder: string, ext: string, body: ReadableStream<Uint8Array>, maxBytes: number): Promise<{ relPath: string; bytes: number }> {
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const relPath = path.posix.join(safeFolder, `${randomUUID()}${ext}`);
  const abs = path.join(ROOT, relPath);
  await mkdir(path.dirname(abs), { recursive: true });
  let bytes = 0;
  const limit = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      bytes += chunk.length;
      cb(bytes > maxBytes ? new Error(`File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`) : null, chunk);
    },
  });
  try {
    await pipeline(Readable.fromWeb(body as import("node:stream/web").ReadableStream), limit, createWriteStream(abs));
  } catch (err) {
    await rm(abs, { force: true });
    throw err;
  }
  return { relPath, bytes };
}

/** Size of a stored file, or null when it is missing. */
export async function statUpload(relPath: string): Promise<number | null> {
  try {
    return (await stat(resolveStored(relPath))).size;
  } catch {
    return null;
  }
}

/** A web stream over (part of) a stored file, for ranged media playback. */
export function streamUpload(relPath: string, start?: number, end?: number): ReadableStream<Uint8Array> {
  return Readable.toWeb(createReadStream(resolveStored(relPath), { start, end })) as ReadableStream<Uint8Array>;
}

/** Deletes a stored file; missing files are ignored. */
export async function deleteUpload(relPath: string): Promise<void> {
  await rm(resolveStored(relPath), { force: true });
}
