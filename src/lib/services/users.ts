import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/lib/db/client";
import { learningPaths, oauthAccounts, users, type Role, type User } from "@/lib/db/schema";
import { hashPassword, passwordPolicyError, verifyPassword } from "@/lib/auth/password";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().max(200),
  pathSlug: z.string().optional(),
});

export type ServiceResult<T> = { ok: true; value: T } | { ok: false; error: string };

export async function findUserByEmail(db: Db, email: string): Promise<User | null> {
  const rows = await db.select().from(users).where(sql`lower(${users.email}) = ${email.trim().toLowerCase()}`).limit(1);
  return rows[0] ?? null;
}

export async function registerUser(
  db: Db,
  input: z.input<typeof registerSchema>,
  role: Role = "student",
): Promise<ServiceResult<User>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const policy = passwordPolicyError(parsed.data.password);
  if (policy) return { ok: false, error: policy };
  if (await findUserByEmail(db, parsed.data.email)) return { ok: false, error: "An account with this email already exists." };

  let learningPathId: string | null = null;
  if (parsed.data.pathSlug) {
    const p = await db.select({ id: learningPaths.id }).from(learningPaths).where(eq(learningPaths.slug, parsed.data.pathSlug)).limit(1);
    learningPathId = p[0]?.id ?? null;
  }
  const [user] = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role,
      learningPathId,
    })
    .returning();
  return { ok: true, value: user };
}

/** Error codes (used in redirect URLs) and the messages shown for them. */
export const OAUTH_ERRORS = {
  account_disabled: "This account is disabled.",
  email_unverified: "Your Google email address is not verified.",
  registration_closed: "Self-registration is disabled. Ask your trainer for an account.",
} as const;

export interface OAuthIdentity {
  provider: string;
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

/**
 * Resolves an external identity to a user: an already-linked account wins; otherwise
 * a verified email links to the existing user with that email; otherwise a new
 * student is created (when self-registration is allowed). OAuth-only users have no password.
 */
export async function signInWithOAuth(
  db: Db,
  identity: OAuthIdentity,
  opts: { allowRegistration: boolean },
): Promise<ServiceResult<User>> {
  const linked = await db
    .select({ user: users })
    .from(oauthAccounts)
    .innerJoin(users, eq(users.id, oauthAccounts.userId))
    .where(and(eq(oauthAccounts.provider, identity.provider), eq(oauthAccounts.providerAccountId, identity.providerAccountId)))
    .limit(1);
  if (linked[0]) {
    return linked[0].user.active ? { ok: true, value: linked[0].user } : { ok: false, error: OAUTH_ERRORS.account_disabled };
  }
  if (!identity.emailVerified) return { ok: false, error: OAUTH_ERRORS.email_unverified };

  let user = await findUserByEmail(db, identity.email);
  if (user && !user.active) return { ok: false, error: OAUTH_ERRORS.account_disabled };
  if (!user) {
    if (!opts.allowRegistration) return { ok: false, error: OAUTH_ERRORS.registration_closed };
    const email = identity.email.trim().toLowerCase();
    [user] = await db.insert(users).values({ name: identity.name.slice(0, 80), email, passwordHash: null, role: "student" }).returning();
  }
  await db
    .insert(oauthAccounts)
    .values({ userId: user.id, provider: identity.provider, providerAccountId: identity.providerAccountId, email: identity.email })
    .onConflictDoNothing();
  return { ok: true, value: user };
}

/** Constant-ish time login: always runs bcrypt, generic error message. */
export async function authenticate(db: Db, email: string, password: string): Promise<ServiceResult<User>> {
  const user = await findUserByEmail(db, email);
  const hash = user?.passwordHash ?? "$2b$11$C6UzMDM.H6dfI/f/IKcEeO7mNaeGyAkMR0dV4D7xyLlY8Hb5GJ4fG";
  const valid = await verifyPassword(password, hash);
  if (!user || !valid || !user.active) return { ok: false, error: "Invalid email or password." };
  return { ok: true, value: user };
}
