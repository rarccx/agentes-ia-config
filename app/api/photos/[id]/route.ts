import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const photo = await pool.query(
    `SELECT p.media_type, p.image_bytes FROM client_photos p
     JOIN clinics c ON c.id = p.clinic_id WHERE p.id = $1 AND c.owner_user_id = $2`,
    [id, session.user.id],
  );
  if (!photo.rowCount) return Response.json({ error: "Foto não encontrada" }, { status: 404 });
  return new Response(photo.rows[0].image_bytes, {
    headers: { "Content-Type": photo.rows[0].media_type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}
