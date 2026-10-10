import bcrypt from "bcryptjs";

const ROUNDS = 11;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Minimum policy: 10+ chars with letters and digits. */
export function passwordPolicyError(plain: string): string | null {
  if (plain.length < 10) return "Password must be at least 10 characters.";
  if (!/[A-Za-z]/.test(plain) || !/\d/.test(plain)) return "Password must contain letters and numbers.";
  return null;
}
