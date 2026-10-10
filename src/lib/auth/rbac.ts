import type { Role } from "@/lib/db/schema";

/** Permission matrix. Keep checks in one place so new roles are easy to add. */
const PERMISSIONS = {
  "learn": ["student", "trainer", "admin"],
  "trainer:dashboard": ["trainer", "admin"],
  "trainer:review": ["trainer", "admin"],
  "admin:content": ["admin"],
  "admin:users": ["admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
