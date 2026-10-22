/**
 * Password reset and OAuth account linking against in-memory PostgreSQL (PGlite).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createDb, type DbHandle } from "@/lib/db/client";
import { oauthAccounts, passwordResetTokens, users } from "@/lib/db/schema";
import { OAUTH_ERRORS, authenticate, registerUser, signInWithOAuth } from "@/lib/services/users";
import { createSession, getUserByToken } from "@/lib/auth/session";
import { createPasswordResetToken, isResetTokenValid, resetPassword } from "@/lib/services/password-reset";

let h: DbHandle;

beforeAll(async () => {
  h = await createDb({ dataDir: "memory://", url: "" });
  await h.migrate();
});

afterAll(async () => {
  await h?.close();
});

describe("password reset", () => {
  it("returns null for unknown emails", async () => {
    expect(await createPasswordResetToken(h.db, "nobody@example.test")).toBeNull();
  });

  it("resets the password once, signs out existing sessions and invalidates the link", async () => {
    const reg = await registerUser(h.db, { name: "Ravi Kumar", email: "ravi@example.test", password: "OldPassword2026" });
    if (!reg.ok) throw new Error(reg.error);
    const { token: sessionToken } = await createSession(h.db, reg.value.id);

    const first = await createPasswordResetToken(h.db, "RAVI@example.test");
    const second = await createPasswordResetToken(h.db, "ravi@example.test");
    if (!first || !second) throw new Error("expected tokens");
    // Requesting a new link invalidates the previous one.
    expect(await isResetTokenValid(h.db, first.token)).toBe(false);
    expect(await isResetTokenValid(h.db, second.token)).toBe(true);

    expect((await resetPassword(h.db, second.token, "short")).ok).toBe(false);
    expect((await resetPassword(h.db, second.token, "NewPassword2026")).ok).toBe(true);
    expect((await resetPassword(h.db, second.token, "AnotherPass2026")).ok).toBe(false);

    expect(await getUserByToken(h.db, sessionToken)).toBeNull();
    expect((await authenticate(h.db, "ravi@example.test", "OldPassword2026")).ok).toBe(false);
    expect((await authenticate(h.db, "ravi@example.test", "NewPassword2026")).ok).toBe(true);
  });

  it("rejects expired tokens", async () => {
    const t = await createPasswordResetToken(h.db, "ravi@example.test");
    if (!t) throw new Error("expected token");
    await h.db.update(passwordResetTokens).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(passwordResetTokens.userId, t.userId));
    expect((await resetPassword(h.db, t.token, "LaterPassword2026")).ok).toBe(false);
  });
});

describe("Google sign-in", () => {
  const google = { provider: "google", providerAccountId: "g-123", email: "Priya@Example.test", emailVerified: true, name: "Priya Shah" };

  it("creates a password-less student on first sign-in and reuses it after", async () => {
    const a = await signInWithOAuth(h.db, google, { allowRegistration: true });
    if (!a.ok) throw new Error(a.error);
    expect(a.value.role).toBe("student");
    expect(a.value.passwordHash).toBeNull();
    expect(a.value.email).toBe("priya@example.test");
    // No password means password login always fails.
    expect((await authenticate(h.db, "priya@example.test", "")).ok).toBe(false);

    const b = await signInWithOAuth(h.db, google, { allowRegistration: false });
    expect(b.ok && b.value.id).toBe(a.value.id);
  });

  it("links to an existing email account only when Google verified the email", async () => {
    const identity = { ...google, providerAccountId: "g-456", email: "ravi@example.test", name: "Ravi" };
    const unverified = await signInWithOAuth(h.db, { ...identity, emailVerified: false }, { allowRegistration: true });
    expect(unverified.ok).toBe(false);

    const res = await signInWithOAuth(h.db, identity, { allowRegistration: true });
    if (!res.ok) throw new Error(res.error);
    const [ravi] = await h.db.select().from(users).where(eq(users.email, "ravi@example.test"));
    expect(res.value.id).toBe(ravi.id);
    const links = await h.db.select().from(oauthAccounts).where(eq(oauthAccounts.userId, ravi.id));
    expect(links).toHaveLength(1);
    // The existing password still works.
    expect((await authenticate(h.db, "ravi@example.test", "NewPassword2026")).ok).toBe(true);
  });

  it("respects closed registration and disabled accounts", async () => {
    const closed = await signInWithOAuth(h.db, { ...google, providerAccountId: "g-789", email: "new@example.test" }, { allowRegistration: false });
    expect(!closed.ok && closed.error).toBe(OAUTH_ERRORS.registration_closed);

    await h.db.update(users).set({ active: false }).where(eq(users.email, "priya@example.test"));
    const disabled = await signInWithOAuth(h.db, google, { allowRegistration: true });
    expect(!disabled.ok && disabled.error).toBe(OAUTH_ERRORS.account_disabled);
  });
});
