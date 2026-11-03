import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

const globalForPool = globalThis as unknown as { belavezPool?: Pool; belavezPoolAttached?: boolean };
export const pool = globalForPool.belavezPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 5_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: true },
});

if (process.env.NODE_ENV !== "production") globalForPool.belavezPool = pool;
if (!globalForPool.belavezPoolAttached) {
  attachDatabasePool(pool);
  globalForPool.belavezPoolAttached = true;
}
