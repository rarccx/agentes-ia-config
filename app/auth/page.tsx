"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin"); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const form = new FormData(event.currentTarget);
    try {
      const result = mode === "signup"
        ? await authClient.signUp.email({ name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")) })
        : await authClient.signIn.email({ email: String(form.get("email")), password: String(form.get("password")) });
      if (result.error) throw new Error(result.error.message || "Não foi possível acessar sua conta.");
      router.push("/dashboard"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Confira seus dados e tente novamente."); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell"><Link href="/" className="auth-back">← Voltar ao início</Link><section className="auth-card"><Image src="/belavez-logo.svg" alt="BelaVez" width={196} height={48}/><span className="eyebrow">CUIDADO NO SEU TEMPO</span><h1>{mode === "signin" ? "Que bom ter você de volta." : "Seu espaço começa aqui."}</h1><p>Acesse sua agenda de beleza com segurança.</p><form onSubmit={submit} className="auth-form">{mode === "signup" && <label>Seu nome<input name="name" required autoComplete="name" minLength={2}/></label>}<label>E-mail<input name="email" type="email" required autoComplete="email"/></label><label>Senha<input name="password" type="password" required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"}/></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary auth-submit" disabled={busy}>{busy ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}</button></form><button className="auth-toggle" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>{mode === "signin" ? "Ainda não tem conta? Criar acesso" : "Já tem conta? Entrar"}</button><small className="auth-privacy">Sua conta é protegida pelo Neon Auth.</small></section></main>;
}
