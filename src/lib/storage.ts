import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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
