import "server-only";
import { createHmac, createSign, timingSafeEqual } from "node:crypto";

/**
 * Mux Video: browsers upload directly to Mux (the file never touches this server),
 * Mux encodes it into adaptive HLS, and playback uses signed tokens so a copied
 * playback URL stops working after it expires.
 *
 * Env: MUX_TOKEN_ID / MUX_TOKEN_SECRET (API access token), MUX_WEBHOOK_SECRET,
 * MUX_SIGNING_KEY_ID / MUX_SIGNING_KEY_PRIVATE (base64 PEM from Mux "Signing keys").
 */
const API = "https://api.mux.com";

export function muxEnabled(): boolean {
  const e = process.env;
  return Boolean(e.MUX_TOKEN_ID && e.MUX_TOKEN_SECRET && e.MUX_SIGNING_KEY_ID && e.MUX_SIGNING_KEY_PRIVATE);
}

async function muxApi<T>(pathname: string, init: RequestInit = {}): Promise<T> {
  const auth = Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString("base64");
  const res = await fetch(`${API}${pathname}`, {
    ...init,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) throw new Error(`Mux ${init.method ?? "GET"} ${pathname} failed (${res.status}): ${await res.text()}`);
  return res.status === 204 ? (undefined as T) : ((await res.json()) as { data: T }).data;
}

/**
 * Creates a direct-upload URL. `passthrough` is our media_assets id; Mux echoes it in
 * webhooks so we can match the asset without extra lookups.
 */
export async function createDirectUpload(opts: { corsOrigin: string; passthrough: string }): Promise<{ id: string; url: string }> {
  return muxApi("/video/v1/uploads", {
    method: "POST",
    body: JSON.stringify({
      cors_origin: opts.corsOrigin,
      new_asset_settings: { playback_policy: ["signed"], video_quality: "basic", passthrough: opts.passthrough },
    }),
  });
}

export interface MuxUpload {
  id: string;
  status: "waiting" | "asset_created" | "errored" | "cancelled" | "timed_out";
  asset_id?: string;
}

export interface MuxAsset {
  id: string;
  status: "preparing" | "ready" | "errored";
  passthrough?: string;
  duration?: number;
  playback_ids?: { id: string; policy: string }[];
  errors?: { messages?: string[] };
}

export function getDirectUpload(uploadId: string): Promise<MuxUpload> {
  return muxApi(`/video/v1/uploads/${encodeURIComponent(uploadId)}`);
}

export function getMuxAsset(assetId: string): Promise<MuxAsset> {
  return muxApi(`/video/v1/assets/${encodeURIComponent(assetId)}`);
}

/** Status lookups used to sync pending videos when no webhook arrives. */
export const MUX_STATUS_API = { getUpload: getDirectUpload, getAsset: getMuxAsset };

export async function deleteMuxAsset(assetId: string): Promise<void> {
  await muxApi(`/video/v1/assets/${encodeURIComponent(assetId)}`, { method: "DELETE" });
}

export async function cancelDirectUpload(uploadId: string): Promise<void> {
  await muxApi(`/video/v1/uploads/${encodeURIComponent(uploadId)}/cancel`, { method: "PUT" }).catch(() => undefined);
}

/** Verifies the `mux-signature` header (`t=<unix>,v1=<hex hmac>`) over `${t}.${rawBody}`. */
export function verifyMuxWebhook(rawBody: string, header: string | null, secret: string, toleranceSec = 300): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=", 2) as [string, string]));
  const t = Number(parts.t);
  if (!parts.t || !parts.v1 || !Number.isFinite(t) || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${parts.t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

/** RS256 JWT for a signed playback ID. audience: "v" video, "t" thumbnail, "s" storyboard. */
export function signPlaybackToken(playbackId: string, audience: "v" | "t" | "s", expiresInSec = 6 * 3600): string {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT", kid: process.env.MUX_SIGNING_KEY_ID }));
  const payload = b64url(JSON.stringify({ sub: playbackId, aud: audience, exp: Math.floor(Date.now() / 1000) + expiresInSec }));
  const pem = Buffer.from(process.env.MUX_SIGNING_KEY_PRIVATE ?? "", "base64").toString("utf8");
  const signature = createSign("RSA-SHA256").update(`${header}.${payload}`).sign(pem);
  return `${header}.${payload}.${b64url(signature)}`;
}
