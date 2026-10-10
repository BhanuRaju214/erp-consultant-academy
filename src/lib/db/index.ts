import "server-only";
import { createDb, type Db, type DbHandle } from "./client";

// Re-use a single handle across hot reloads in development (PGlite allows one process per data dir).
const globalForDb = globalThis as unknown as { __erpDb?: Promise<DbHandle> };

export function getHandle(): Promise<DbHandle> {
  if (!globalForDb.__erpDb) globalForDb.__erpDb = createDb();
  return globalForDb.__erpDb;
}

export async function getDb(): Promise<Db> {
  return (await getHandle()).db;
}

export * as schema from "./schema";
export type { Db };
