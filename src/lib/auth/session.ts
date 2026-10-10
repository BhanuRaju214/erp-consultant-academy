import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { sessions, users, type User } from "@/lib/db/schema";

export const SESSION_COOKIE = "erp_session";
export const SESSION_TTL_DAYS = 7;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a session and returns the raw token (only the hash is stored). */
export async function createSession(db: Db, userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  await db.insert(sessions).values({ userId, tokenHash: hashToken(token), expiresAt });
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
  // Opportunistic clean-up of expired sessions.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  return { token, expiresAt };
}

export async function getUserByToken(db: Db, token: string | undefined): Promise<User | null> {
  if (!token) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date()), eq(users.active, true)))
    .limit(1);
  return rows[0]?.user ?? null;
}

export async function deleteSession(db: Db, token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}
