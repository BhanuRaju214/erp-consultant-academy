import { randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { passwordResetTokens, sessions, users } from "@/lib/db/schema";
import { hashPassword, passwordPolicyError } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { BRAND } from "@/lib/brand";
import { findUserByEmail, type ServiceResult } from "./users";

export const RESET_TTL_MINUTES = 30;

/**
 * Creates a reset token for an active account and returns the raw token, or null
 * when no active account matches. Callers must not reveal which case happened.
 * Any earlier unused tokens for the user are invalidated.
 */
export async function createPasswordResetToken(db: Db, email: string): Promise<{ token: string; userId: string; name: string; email: string } | null> {
  const user = await findUserByEmail(db, email);
  if (!user || !user.active) return null;
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
  const token = randomBytes(32).toString("base64url");
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60_000),
  });
  return { token, userId: user.id, name: user.name, email: user.email };
}

/**
 * Creates a reset link for an active account and emails it. Returns whether an
 * email was sent; callers must show the same message either way.
 */
export async function requestPasswordReset(db: Db, email: string, baseUrl: string): Promise<{ sent: boolean; error?: string }> {
  const created = await createPasswordResetToken(db, email);
  if (!created) return { sent: false };
  const link = `${baseUrl}/reset-password?token=${encodeURIComponent(created.token)}`;
  const result = await sendEmail({
    to: created.email,
    subject: `Reset your ${BRAND.productName} password`,
    text: [
      `Hi ${created.name},`,
      "",
      "We received a request to reset your password. Open this link to choose a new one:",
      link,
      "",
      `The link expires in ${RESET_TTL_MINUTES} minutes and can only be used once.`,
      "If you didn't ask for this, you can ignore this email; your password won't change.",
    ].join("\n"),
  });
  return { sent: result.ok, error: result.ok ? undefined : result.error };
}

async function findValidToken(db: Db, token: string) {
  const rows = await db
    .select({ id: passwordResetTokens.id, userId: passwordResetTokens.userId })
    .from(passwordResetTokens)
    .innerJoin(users, eq(users.id, passwordResetTokens.userId))
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
        eq(users.active, true),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function isResetTokenValid(db: Db, token: string): Promise<boolean> {
  return token ? (await findValidToken(db, token)) !== null : false;
}

/** Sets a new password, consumes the token and signs the user out everywhere. */
export async function resetPassword(db: Db, token: string, password: string): Promise<ServiceResult<{ userId: string }>> {
  const policy = passwordPolicyError(password);
  if (policy) return { ok: false, error: policy };
  const row = token ? await findValidToken(db, token) : null;
  if (!row) return { ok: false, error: "This reset link is invalid or has expired. Request a new one." };
  // Mark used first so a token can only ever be redeemed once.
  const used = await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(passwordResetTokens.id, row.id), isNull(passwordResetTokens.usedAt)))
    .returning({ id: passwordResetTokens.id });
  if (used.length === 0) return { ok: false, error: "This reset link has already been used." };
  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, row.userId));
  await db.delete(sessions).where(eq(sessions.userId, row.userId));
  return { ok: true, value: { userId: row.userId } };
}
