import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { User } from "@/lib/db/schema";
import { can, type Permission } from "./rbac";
import { SESSION_COOKIE, getUserByToken } from "./session";

/** Current user for this request (memoised per request). */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return getUserByToken(await getDb(), token);
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(permission: Permission): Promise<User> {
  const user = await requireUser();
  if (!can(user.role, permission)) redirect("/dashboard?denied=1");
  return user;
}

export type PublicUser = Pick<User, "id" | "name" | "email" | "role">;
export function toPublicUser(u: User): PublicUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}
