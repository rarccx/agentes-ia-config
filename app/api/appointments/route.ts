import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";
const schema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientContact: z.string().trim().max(120).optional(),
  service: z.string().trim().min(2).max(120),
  startsAt: z.string().datetime(),
  durationMinutes: z.coerce.number().int().min(5).max(600),
  privateNotes: z.string().trim().max(2000).optional(),
});
const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(["confirmed", "cancelled", "completed"]) }).strict();

async function clinicFor(userId: string) {
  const result = await pool.query(
    "INSERT INTO clinics (owner_user_id) VALUES ($1) ON CONFLICT (owner_user_id) DO UPDATE SET owner_user_id = EXCLUDED.owner_user_id RETURNING id",
    [userId],
  );
  return result.rows[0].id as string;
}

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const clinicId = await clinicFor(session.user.id);
  const [appointments, metrics] = await Promise.all([
    pool.query(
      `SELECT a.id, a.client_name AS "clientName", a.client_contact AS "clientContact", a.starts_at AS "startsAt",
        a.duration_minutes AS "durationMinutes", a.status, a.private_notes AS "privateNotes", s.name AS service,
        (SELECT p.id FROM client_photos p WHERE p.appointment_id = a.id ORDER BY p.created_at LIMIT 1) AS "photoId"
       FROM appointments a LEFT JOIN services s ON s.id = a.service_id
       WHERE a.clinic_id = $1 AND a.starts_at >= date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
         AND a.starts_at < (date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') + interval '7 days') AT TIME ZONE 'America/Sao_Paulo'
       ORDER BY a.starts_at LIMIT 100`, [clinicId]),
    pool.query(
      `SELECT count(*) FILTER (WHERE starts_at >= date_trunc('week', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
          AND starts_at < (date_trunc('week', now() AT TIME ZONE 'America/Sao_Paulo') + interval '7 days') AT TIME ZONE 'America/Sao_Paulo')::int AS week_count,
        count(*) FILTER (WHERE status = 'pending')::int AS pending_count FROM appointments WHERE clinic_id = $1`, [clinicId]),
  ]);
  return NextResponse.json({ appointments: appointments.rows, metrics: metrics.rows[0] });
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const form = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return NextResponse.json({ error: "Confira os campos do agendamento." }, { status: 400 });
  const photo = form.get("photo");
  if (photo instanceof File && photo.size > 0 && (photo.size > 5_000_000 || !["image/jpeg", "image/png", "image/webp"].includes(photo.type))) {
    return NextResponse.json({ error: "A foto deve ser JPG, PNG ou WebP e ter até 5 MB." }, { status: 400 });
  }
  const clinicId = await clinicFor(session.user.id);
  const input = parsed.data;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const service = await client.query(
      `INSERT INTO services (clinic_id, name, duration_minutes) VALUES ($1, $2, $3)
       ON CONFLICT (clinic_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [clinicId, input.service, input.durationMinutes],
    );
    const appointment = await client.query(
      `INSERT INTO appointments (clinic_id, service_id, client_name, client_contact, starts_at, duration_minutes, private_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [clinicId, service.rows[0].id, input.clientName, input.clientContact || null, input.startsAt, input.durationMinutes, input.privateNotes || null],
    );
    if (photo instanceof File && photo.size) {
      await client.query("INSERT INTO client_photos (clinic_id, appointment_id, media_type, image_bytes) VALUES ($1,$2,$3,$4)",
        [clinicId, appointment.rows[0].id, photo.type, Buffer.from(await photo.arrayBuffer())]);
    }
    await client.query("COMMIT");
    return NextResponse.json({ id: appointment.rows[0].id }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function PATCH(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Atualização de status inválida." }, { status: 400 });
  const clinicId = await clinicFor(session.user.id);
  const updated = await pool.query(
    `UPDATE appointments SET status = $1
     WHERE id = $2 AND clinic_id = $3
       AND ((status = 'pending' AND $1 IN ('confirmed', 'cancelled'))
         OR (status = 'confirmed' AND $1 IN ('cancelled', 'completed')))
     RETURNING id, status`,
    [parsed.data.status, parsed.data.id, clinicId],
  );
  if (!updated.rowCount) return NextResponse.json({ error: "Agendamento não encontrado ou transição de status inválida." }, { status: 409 });
  return NextResponse.json({ id: updated.rows[0].id, status: updated.rows[0].status });
}
