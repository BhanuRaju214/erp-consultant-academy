/**
 * Seeds platforms, learning paths, courses, business processes, lab scenarios,
 * projects, documentation and demo accounts.
 *
 *   npm run db:seed                               → inserts missing content, keeps admin edits
 *   npm run db:seed -- --refresh=slug-a,slug-b    → updates those courses in place from the
 *                                                   content files (keeps learner progress;
 *                                                   overwrites admin edits to those courses)
 *   npm run db:seed -- --force                    → rebuilds all seeded content (deletes related progress!)
 */
import { createDb } from "../src/lib/db/client";
import { seedAll } from "../src/lib/seed";

async function main() {
  const force = process.argv.includes("--force");
  const refreshArg = process.argv.find((a) => a.startsWith("--refresh="));
  const refresh = refreshArg ? refreshArg.slice("--refresh=".length).split(",").map((s) => s.trim()).filter(Boolean) : [];
  const handle = await createDb();
  await handle.migrate();
  const log = await seedAll(handle.db, { force, refresh });
  for (const line of log) console.log(line);
  await handle.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
