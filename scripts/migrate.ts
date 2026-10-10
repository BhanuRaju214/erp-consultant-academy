import { createDb } from "../src/lib/db/client";

async function main() {
  const handle = await createDb();
  console.log(`Running migrations on ${handle.driver}...`);
  await handle.migrate();
  await handle.close();
  console.log("Migrations complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
