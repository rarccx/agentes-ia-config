import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());

const origin = "http://localhost:3000";
const noAuthAppointments = await fetch(`${origin}/api/appointments`);
const noAuthAssistant = await fetch(`${origin}/api/assistant`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ task: "schedule_insight" }) });
if (noAuthAppointments.status !== 401 || noAuthAssistant.status !== 401) throw new Error("Protected APIs did not deny unauthenticated access");
const email = `belavez-smoke-${randomUUID()}@example.invalid`;
const signUp = await fetch(`${origin}/api/auth/sign-up/email`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "Conta de teste BelaVez", email, password: `T-${randomUUID()}-aA9!` }),
});
if (!signUp.ok) throw new Error(`Neon Auth signup failed with HTTP ${signUp.status}`);
const userResult = await signUp.json();
const cookies = signUp.headers.getSetCookie().map((v) => v.split(";")[0]).join("; ");
if (!cookies) throw new Error("Neon Auth did not establish a session cookie");

const sessionResponse = await fetch(`${origin}/api/auth/get-session`, { headers: { cookie: cookies } });
if (!sessionResponse.ok) throw new Error(`Neon Auth session failed with HTTP ${sessionResponse.status}`);
const session = await sessionResponse.json();
if (!session?.user?.id) throw new Error("Neon Auth session did not return the test user");
console.log("Neon Auth signup and session: PASS");

const start = new Date(Date.now() + 2 * 60 * 60 * 1000);
const form = new FormData();
form.set("clientName", "Cliente de teste");
form.set("clientContact", "teste@example.invalid");
form.set("service", "Serviço fictício de teste");
form.set("startsAt", start.toISOString());
form.set("durationMinutes", "30");
form.set("privateNotes", "Registro fictício de validação; sem dados reais.");
form.set("photo", new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: "image/jpeg" }), "teste.jpg");
const created = await fetch(`${origin}/api/appointments`, { method: "POST", headers: { cookie: cookies }, body: form });
if (created.status !== 201) throw new Error(`Appointment create failed with HTTP ${created.status}`);
const createdAppointment = await created.json();
console.log("Authenticated appointment + Postgres photo insert: PASS");

const read = await fetch(`${origin}/api/appointments`, { headers: { cookie: cookies } });
if (!read.ok) throw new Error(`Appointment read failed with HTTP ${read.status}`);
const result = await read.json();
const testAppointment = result.appointments.find((a) => a.service === "Serviço fictício de teste");
if (!testAppointment?.photoId) throw new Error("Created appointment or its photo reference was not returned from Postgres");
console.log("Appointment read back from Postgres: PASS");
const photoRead = await fetch(`${origin}/api/photos/${testAppointment.photoId}`, { headers: { cookie: cookies } });
const photoBytes = new Uint8Array(await photoRead.arrayBuffer());
if (!photoRead.ok || photoRead.headers.get("content-type") !== "image/jpeg" || photoBytes.length !== 4 || photoBytes[0] !== 0xff) throw new Error("Photo could not be read back from Postgres");
console.log("Private photo read back from Postgres: PASS");

const confirm = await fetch(`${origin}/api/appointments`, { method: "PATCH", headers: { cookie: cookies, "content-type": "application/json" }, body: JSON.stringify({ id: createdAppointment.id, status: "confirmed" }) });
if (!confirm.ok || (await confirm.json()).status !== "confirmed") throw new Error("Appointment confirmation failed");
const complete = await fetch(`${origin}/api/appointments`, { method: "PATCH", headers: { cookie: cookies, "content-type": "application/json" }, body: JSON.stringify({ id: createdAppointment.id, status: "completed" }) });
if (!complete.ok || (await complete.json()).status !== "completed") throw new Error("Appointment completion failed");
const invalidTransition = await fetch(`${origin}/api/appointments`, { method: "PATCH", headers: { cookie: cookies, "content-type": "application/json" }, body: JSON.stringify({ id: createdAppointment.id, status: "cancelled" }) });
if (invalidTransition.status !== 409) throw new Error("Invalid appointment transition was accepted");
console.log("Appointment confirm/complete state transitions: PASS");

const cancelForm = new FormData();
cancelForm.set("clientName", "Segunda cliente de teste"); cancelForm.set("service", "Serviço de teste cancelável");
cancelForm.set("startsAt", new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()); cancelForm.set("durationMinutes", "30");
const secondCreated = await fetch(`${origin}/api/appointments`, { method: "POST", headers: { cookie: cookies }, body: cancelForm });
if (secondCreated.status !== 201) throw new Error("Second test appointment failed to create");
const secondId = (await secondCreated.json()).id;
const cancel = await fetch(`${origin}/api/appointments`, { method: "PATCH", headers: { cookie: cookies, "content-type": "application/json" }, body: JSON.stringify({ id: secondId, status: "cancelled" }) });
if (!cancel.ok || (await cancel.json()).status !== "cancelled") throw new Error("Appointment cancellation failed");
console.log("Appointment cancellation: PASS");

const copyResponse = await fetch(`${origin}/api/assistant`, { method: "POST", headers: { cookie: cookies, "content-type": "application/json" }, body: JSON.stringify({ task: "marketing_copy", category: "facial", tone: "warm" }) });
if (!copyResponse.ok || !(await copyResponse.json()).text) throw new Error(`Generic AI content flow failed with HTTP ${copyResponse.status}`);
const insightResponse = await fetch(`${origin}/api/assistant`, { method: "POST", headers: { cookie: cookies, "content-type": "application/json" }, body: JSON.stringify({ task: "schedule_insight" }) });
if (!insightResponse.ok || !(await insightResponse.json()).text) throw new Error(`Aggregate AI insight flow failed with HTTP ${insightResponse.status}`);
const unsafeAI = await fetch(`${origin}/api/assistant`, { method: "POST", headers: { cookie: cookies, "content-type": "application/json" }, body: JSON.stringify({ task: "marketing_copy", category: "facial", tone: "warm", clientName: "Cliente de teste" }) });
if (unsafeAI.status !== 400) throw new Error("AI endpoint accepted unexpected user data");
console.log("Safe generic and aggregate AI flows: PASS");

const signOut = await fetch(`${origin}/api/auth/sign-out`, { method: "POST", headers: { cookie: cookies, "content-type": "application/json" }, body: "{}" });
if (!signOut.ok) throw new Error(`Neon Auth sign-out failed with HTTP ${signOut.status}`);
const clearedCookies = signOut.headers.getSetCookie().map((v) => v.split(";")[0]).join("; ");
const afterSignOut = await fetch(`${origin}/api/auth/get-session`, { headers: { cookie: clearedCookies } });
const noSession = await afterSignOut.json();
if (noSession?.user?.id) throw new Error("Neon Auth still returned a user after sign-out");
console.log("Neon Auth sign-out: PASS");

const db = new pg.Client({ connectionString: process.env.DATABASE_URL_UNPOOLED, ssl: { rejectUnauthorized: true } });
try {
  await db.connect();
  const saved = await db.query("SELECT count(*)::int AS count FROM ai_generations g JOIN clinics c ON c.id = g.clinic_id WHERE c.owner_user_id = $1", [session.user.id]);
  if (saved.rows[0].count < 2) throw new Error("AI results were not stored in Neon Postgres");
  console.log("AI results persisted in Neon Postgres: PASS");
} finally { await db.end(); }
