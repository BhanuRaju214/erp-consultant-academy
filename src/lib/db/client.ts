import path from "node:path";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema";

/**
 * Both drivers expose the same Drizzle query API. We type everything against the
 * PGlite flavour; node-postgres is structurally compatible for our usage.
 */
export type Db = PgliteDatabase<typeof schema>;

export interface DbHandle {
  db: Db;
  driver: "postgres" | "pglite";
  migrate: () => Promise<void>;
  close: () => Promise<void>;
}

const MIGRATIONS = path.join(process.cwd(), "drizzle");

/**
 * Creates a database handle.
 * - `DATABASE_URL` set → real PostgreSQL via node-postgres (production, CI, team dev).
 * - otherwise → embedded PGlite (PostgreSQL compiled to WASM) persisted in `PGLITE_DIR`
 *   (default `.data/pglite`), or in-memory when `dataDir` is "memory://".
 */
export async function createDb(opts: { url?: string; dataDir?: string } = {}): Promise<DbHandle> {
  const url = opts.url ?? process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: Number(process.env.DATABASE_POOL_MAX ?? 10) });
    const db = drizzlePg(pool, { schema }) as unknown as Db;
    return {
      db,
      driver: "postgres",
      migrate: () => migratePg(db as never, { migrationsFolder: MIGRATIONS }),
      close: () => pool.end(),
    };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = opts.dataDir ?? process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  if (dataDir !== "memory://") {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(path.dirname(dataDir), { recursive: true });
  }
  const client = dataDir === "memory://" ? new PGlite() : new PGlite(dataDir);
  await client.waitReady;
  const db = drizzlePglite(client, { schema });
  return {
    db,
    driver: "pglite",
    migrate: () => migratePglite(db, { migrationsFolder: MIGRATIONS }),
    close: () => client.close(),
  };
}
