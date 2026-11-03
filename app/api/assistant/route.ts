import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;
const requestSchema = z.discriminatedUnion("task", [
  z.object({ task: z.literal("marketing_copy"), category: z.enum(["facial", "body", "hair", "nails", "eyebrows", "laser", "massage", "other"]), tone: z.enum(["warm", "elegant", "direct"]) }).strict(),
  z.object({ task: z.literal("schedule_insight") }).strict(),
]);

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Escolha uma tarefa geral do assistente." }, { status: 400 });

  const baseUrl = process.env.NEON_AI_GATEWAY_BASE_URL || process.env.AI_API_BASE_URL || "https://ai-gateway.vercel.sh/v1";
  const apiKey = process.env.NEON_AI_GATEWAY_TOKEN || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!baseUrl || !apiKey || !model) {
    return NextResponse.json({ error: "Assistente generativo indisponível: configure uma credencial do gateway de IA e AI_MODEL no ambiente do app." }, { status: 503 });
  }

  const clinic = await pool.query("INSERT INTO clinics (owner_user_id) VALUES ($1) ON CONFLICT (owner_user_id) DO UPDATE SET owner_user_id = EXCLUDED.owner_user_id RETURNING id", [session.user.id]);
  const clinicId = clinic.rows[0].id as string;
  let inputSummary: Record<string, string | number>;
  let taskDescription: string;
  if (parsed.data.task === "marketing_copy") {
    inputSummary = { category: parsed.data.category, tone: parsed.data.tone };
    taskDescription = `Crie uma legenda curta para redes sociais para a categoria de beleza ${parsed.data.category}, em tom ${parsed.data.tone}. Não faça promessas de resultado, alegações médicas, diagnóstico, nem dê orientação clínica. Use linguagem acolhedora e convide a pessoa a conversar com uma profissional.`;
  } else {
    const counts = await pool.query(
      `SELECT count(*)::int AS total,
       count(*) FILTER (WHERE status = 'pending')::int AS pending,
       count(*) FILTER (WHERE status = 'confirmed')::int AS confirmed,
       count(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
       FROM appointments WHERE clinic_id = $1
       AND starts_at >= date_trunc('week', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
       AND starts_at < (date_trunc('week', now() AT TIME ZONE 'America/Sao_Paulo') + interval '7 days') AT TIME ZONE 'America/Sao_Paulo'`, [clinicId]);
    inputSummary = counts.rows[0];
    taskDescription = `Analise apenas estes totais agregados da semana, sem inferir dados individuais: ${JSON.stringify(inputSummary)}. Responda em português com um resumo breve e até duas sugestões operacionais gerais para organizar a agenda.`;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model, temperature: 0.6, max_tokens: 300, messages: [
        { role: "system", content: "Você é a Assistente Bela, apoio para rotinas administrativas e comunicação genérica de negócios de beleza no Brasil. Nunca peça nem processe nomes, contatos, fotos, observações ou informações clínicas de clientes. Não ofereça diagnóstico, prescrição ou promessa de resultado. Responda em português brasileiro." },
        { role: "user", content: taskDescription },
      ] }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível acessar o provedor de IA configurado." }, { status: 502 });
  }
  if (!response.ok) return NextResponse.json({ error: "O provedor de IA recusou a solicitação. Confira modelo, acesso e créditos." }, { status: 502 });
  const result = await response.json().catch(() => null);
  const text = result?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) return NextResponse.json({ error: "O provedor não retornou um texto válido." }, { status: 502 });
  await pool.query("INSERT INTO ai_generations (clinic_id, task, input_summary, result_text) VALUES ($1,$2,$3,$4)", [clinicId, parsed.data.task, JSON.stringify(inputSummary), text.trim()]);
  return NextResponse.json({ text: text.trim() });
}
