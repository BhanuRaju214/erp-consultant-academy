/**
 * Media library: upload validation, access rules, Mux webhook handling and signing.
 */
import { createHmac, generateKeyPairSync, createVerify } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createDb, type DbHandle } from "@/lib/db/client";
import { mediaAssets } from "@/lib/db/schema";
import { applyMuxEvent, canViewMedia, embedSnippet, syncPendingMuxAsset, validateUploadRequest } from "@/lib/services/media";
import { signPlaybackToken, verifyMuxWebhook } from "@/lib/mux";

describe("upload validation", () => {
  it("derives kind and content type from the extension", () => {
    const res = validateUploadRequest({ fileName: "Chart of Accounts.PDF", size: 1000 });
    expect(res.ok && res.value).toMatchObject({ kind: "document", contentType: "application/pdf", visibility: "enrolled" });
    const video = validateUploadRequest({ fileName: "intro.mp4", size: 2_000_000_000 });
    expect(video.ok && video.value.kind).toBe("video");
  });

  it("rejects unsupported types and oversized files", () => {
    expect(validateUploadRequest({ fileName: "page.html", size: 10 }).ok).toBe(false);
    expect(validateUploadRequest({ fileName: "logo.svg", size: 10 }).ok).toBe(false);
    expect(validateUploadRequest({ fileName: "big.pdf", size: 300 * 1024 * 1024 }).ok).toBe(false);
    expect(validateUploadRequest({ fileName: "x.pdf", size: 0 }).ok).toBe(false);
  });

  it("builds lesson embeds", () => {
    expect(embedSnippet({ id: "a", kind: "image", title: "", fileName: "flow.webp" })).toBe("![flow.webp](/media/a)");
    expect(embedSnippet({ id: "b", kind: "video", title: "Intro", fileName: "i.mp4" })).toBe("```media-video\nb\n```");
    expect(embedSnippet({ id: "c", kind: "document", title: "Guide", fileName: "g.pdf" })).toBe("[Download Guide](/media/c)");
  });
});

describe("access rules", () => {
  const student = { id: "s1", role: "student" as const };
  const trainer = { id: "t1", role: "trainer" as const };
  const ready = { status: "ready" as const, uploadedById: "t1" };

  it("applies visibility levels", () => {
    expect(canViewMedia(null, { ...ready, visibility: "public" })).toBe(true);
    expect(canViewMedia(null, { ...ready, visibility: "authenticated" })).toBe(false);
    expect(canViewMedia(student, { ...ready, visibility: "authenticated" })).toBe(true);
    expect(canViewMedia(student, { ...ready, visibility: "private" })).toBe(false);
    expect(canViewMedia(trainer, { ...ready, visibility: "private" })).toBe(true);
    expect(canViewMedia(student, { ...ready, visibility: "private", uploadedById: "s1" })).toBe(true);
    // Paid course content: signed in is not enough, an enrolment is needed.
    expect(canViewMedia(student, { ...ready, visibility: "enrolled" })).toBe(false);
    expect(canViewMedia(student, { ...ready, visibility: "enrolled" }, true)).toBe(true);
    expect(canViewMedia(null, { ...ready, visibility: "enrolled" }, true)).toBe(false);
    expect(canViewMedia(trainer, { ...ready, visibility: "enrolled" })).toBe(true);
  });

  it("hides unfinished uploads from learners", () => {
    expect(canViewMedia(student, { status: "pending", visibility: "public", uploadedById: "t1" })).toBe(false);
    expect(canViewMedia(trainer, { status: "pending", visibility: "public", uploadedById: "t1" })).toBe(true);
  });
});

describe("Mux", () => {
  it("verifies webhook signatures and rejects tampering or stale timestamps", () => {
    const secret = "whsec_test";
    const body = JSON.stringify({ type: "video.asset.ready" });
    const t = Math.floor(Date.now() / 1000);
    const sig = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
    expect(verifyMuxWebhook(body, `t=${t},v1=${sig}`, secret)).toBe(true);
    expect(verifyMuxWebhook(body + " ", `t=${t},v1=${sig}`, secret)).toBe(false);
    expect(verifyMuxWebhook(body, `t=${t},v1=${sig}`, "other")).toBe(false);
    const old = t - 3600;
    const oldSig = createHmac("sha256", secret).update(`${old}.${body}`).digest("hex");
    expect(verifyMuxWebhook(body, `t=${old},v1=${oldSig}`, secret)).toBe(false);
    expect(verifyMuxWebhook(body, null, secret)).toBe(false);
  });

  it("signs RS256 playback tokens that verify with the public key", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    process.env.MUX_SIGNING_KEY_ID = "kid-1";
    process.env.MUX_SIGNING_KEY_PRIVATE = Buffer.from(privateKey.export({ type: "pkcs1", format: "pem" })).toString("base64");
    const [h, p, s] = signPlaybackToken("play-123", "v", 60).split(".");
    expect(JSON.parse(Buffer.from(h, "base64url").toString())).toEqual({ alg: "RS256", typ: "JWT", kid: "kid-1" });
    expect(JSON.parse(Buffer.from(p, "base64url").toString())).toMatchObject({ sub: "play-123", aud: "v" });
    expect(createVerify("RSA-SHA256").update(`${h}.${p}`).verify(publicKey, Buffer.from(s, "base64url"))).toBe(true);
  });
});

describe("Mux webhook events", () => {
  let h: DbHandle;
  let id = "";

  beforeAll(async () => {
    h = await createDb({ dataDir: "memory://", url: "" });
    await h.migrate();
    const [row] = await h.db
      .insert(mediaAssets)
      .values({ kind: "video", status: "pending", fileName: "intro.mp4", contentType: "video/mp4", storage: "mux", muxUploadId: "up-1" })
      .returning();
    id = row.id;
  });

  afterAll(async () => {
    await h?.close();
  });

  it("moves an upload through asset_created → ready", async () => {
    expect(await applyMuxEvent(h.db, { type: "video.upload.asset_created", data: { id: "up-1", asset_id: "as-1", new_asset_settings: { passthrough: id } } })).toBe(true);
    expect(
      await applyMuxEvent(h.db, {
        type: "video.asset.ready",
        data: { id: "as-1", passthrough: id, duration: 125.4, playback_ids: [{ id: "pb-1", policy: "signed" }] },
      }),
    ).toBe(true);
    const [row] = await h.db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    expect(row).toMatchObject({ status: "ready", muxAssetId: "as-1", muxPlaybackId: "pb-1", durationSeconds: 125 });
  });

  it("records failures and ignores unrelated events", async () => {
    expect(await applyMuxEvent(h.db, { type: "video.asset.errored", data: { id: "as-1", errors: { messages: ["bad codec"] } } })).toBe(true);
    const [row] = await h.db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    expect(row).toMatchObject({ status: "errored", error: "bad codec" });
    expect(await applyMuxEvent(h.db, { type: "video.asset.created", data: { id: "as-1" } })).toBe(false);
    expect(await applyMuxEvent(h.db, { type: "video.asset.ready", data: { passthrough: "not-a-uuid" } })).toBe(false);
  });
});

describe("Mux status sync (no webhook)", () => {
  let h: DbHandle;

  beforeAll(async () => {
    h = await createDb({ dataDir: "memory://", url: "" });
    await h.migrate();
  });

  afterAll(async () => {
    await h?.close();
  });

  it("follows an upload to a ready asset by polling Mux, and throttles repeat calls", async () => {
    const [row] = await h.db
      .insert(mediaAssets)
      .values({ kind: "video", status: "pending", fileName: "lesson.mp4", contentType: "video/mp4", storage: "mux", muxUploadId: "up-9" })
      .returning();
    let calls = 0;
    let assetStatus = "preparing";
    const api = {
      getUpload: async (id: string) => (calls++, { id, status: "asset_created", asset_id: "as-9" }),
      getAsset: async (id: string) => (calls++, { id, status: assetStatus, duration: 61, playback_ids: [{ id: "pb-9", policy: "signed" }] }),
    };

    const first = await syncPendingMuxAsset(h.db, row, api, 0);
    expect(first).toMatchObject({ status: "pending", muxAssetId: "as-9" });

    assetStatus = "ready";
    const second = await syncPendingMuxAsset(h.db, first, api, 0);
    expect(second).toMatchObject({ status: "ready", muxPlaybackId: "pb-9", durationSeconds: 61 });

    // Ready assets and calls inside the throttle window don't hit Mux again.
    const before = calls;
    await syncPendingMuxAsset(h.db, second, api, 0);
    await syncPendingMuxAsset(h.db, { ...first }, api, 60_000);
    expect(calls).toBe(before);
  });

  it("marks failed uploads as errored", async () => {
    const [row] = await h.db
      .insert(mediaAssets)
      .values({ kind: "video", status: "pending", fileName: "bad.mp4", contentType: "video/mp4", storage: "mux", muxUploadId: "up-x" })
      .returning();
    const api = { getUpload: async (id: string) => ({ id, status: "timed_out" }), getAsset: async () => { throw new Error("not called"); } };
    expect(await syncPendingMuxAsset(h.db, row, api, 0)).toMatchObject({ status: "errored", error: "Upload failed." });
  });
});
