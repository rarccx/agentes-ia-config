import nextEnv from "@next/env";
import { readdir, readFile } from "node:fs/promises";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const client = new pg.Client({ connectionString: process.env.DATABASE_URL_UNPOOLED, ssl: { rejectUnauthorized: true } });
try {
  await client.connect();
  await client.query("SELECT pg_advisory_lock(724051210)");
  await client.query("CREATE TABLE IF NOT EXISTS belavez_migrations (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const names = (await readdir(new URL("../db/migrations/", import.meta.url))).filter((name) => name.endsWith(".sql")).sort();
  for (const filename of names) {
    const applied = await client.query("SELECT 1 FROM belavez_migrations WHERE filename = $1", [filename]);
    if (applied.rowCount) continue;
    await client.query("BEGIN");
    try {
      await client.query(await readFile(new URL(`../db/migrations/${filename}`, import.meta.url), "utf8"));
      await client.query("INSERT INTO belavez_migrations (filename) VALUES ($1)", [filename]);
      await client.query("COMMIT");
      console.log(`Applied ${filename}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  try { await client.query("SELECT pg_advisory_unlock(724051210)"); } catch {}
  await client.end();
}
