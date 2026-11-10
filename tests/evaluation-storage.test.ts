/**
 * Final-evaluation recordings are streamed to local disk, even when submissions use R2.
 * Reading one back (for transcription) must use the same place, not R2.
 */
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "eval-storage-"));
  vi.stubEnv("STORAGE_DIR", dir);
  // Production has R2 configured for submissions.
  vi.stubEnv("R2_ACCOUNT_ID", "test-account");
  vi.stubEnv("R2_ACCESS_KEY_ID", "test-key");
  vi.stubEnv("R2_SECRET_ACCESS_KEY", "test-secret");
  vi.stubEnv("R2_BUCKET", "test-bucket");
  vi.resetModules();
});

afterAll(async () => {
  vi.unstubAllEnvs();
  await rm(dir, { recursive: true, force: true });
});

describe("evaluation recording storage", () => {
  it("reads a streamed recording back from disk while R2 is configured", async () => {
    const { deleteUpload, readStored, saveStream, statUpload, storageDriver } = await import("@/lib/storage");
    expect(storageDriver()).toBe("r2");
    const bytes = new TextEncoder().encode("fake webm audio");
    const stored = await saveStream("evaluations-user-1", ".webm", new Blob([bytes]).stream(), 1024);
    expect(stored.bytes).toBe(bytes.length);
    expect((await readStored(stored.relPath)).toString()).toBe("fake webm audio");
    expect(await statUpload(stored.relPath)).toBe(bytes.length);
    await deleteUpload(stored.relPath);
    expect(await statUpload(stored.relPath)).toBeNull();
  });

  it("rejects paths outside the storage folder", async () => {
    const { readStored } = await import("@/lib/storage");
    await expect(readStored("../outside.webm")).rejects.toThrow("Invalid path");
  });
});
