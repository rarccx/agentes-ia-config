import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";
export async function GET() {
  try {
    const result = await pool.query("SELECT current_database() AS database, current_setting('server_version_num') AS version");
    return NextResponse.json({ status: "ok", database: result.rows[0].database, postgres: result.rows[0].version });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
