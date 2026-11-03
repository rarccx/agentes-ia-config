import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, Check, Clock3, Sparkles, Star } from "lucide-react";

const steps = [
  { number: "01", title: "A cliente escolhe", copy: "Serviço, profissional e horário, pelo link da clínica." },
  { number: "02", title: "A clínica acompanha", copy: "Confirmação, preparo e retorno ficam na mesma jornada." },
  { number: "03", title: "A agenda se recupera", copy: "Se alguém cancelar, a lista de espera ajuda a preencher a vaga." },
];

export default function Home() {
  return (
    <main className="landing-shell">
      <nav className="landing-nav wrap">
        <Image src="/belavez-logo.svg" alt="BelaVez — cuidado no seu tempo" width={196} height={48} priority />
        <div className="nav-links"><a href="#como-funciona">Como funciona</a><a href="#para-clinicas">Para clínicas</a></div>
        <Link className="button button-dark nav-cta" href="/dashboard">Ver demonstração <ArrowRight size={16} /></Link>
      </nav>

      <section className="hero wrap">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> A agenda que acompanha cada cuidado</span>
          <h1>Mais tempo para cuidar.<br /><em>Menos tempo</em> organizando.</h1>
          <p className="hero-description">Agendamentos, sessões e retornos em uma jornada simples para clínicas de estética — do primeiro horário ao próximo cuidado.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/dashboard">Conhecer o BelaVez <ArrowRight size={17} /></Link>
            <a className="text-link" href="#como-funciona">Entenda a proposta <ArrowRight size={15} /></a>
          </div>
          <div className="hero-proof"><span className="proof-stars"><Star /><Star /><Star /><Star /><Star /></span><span>Uma experiência pensada para a rotina real da estética</span></div>
        </div>
        <div className="hero-visual" aria-label="Prévia do painel de agendamentos BelaVez">
          <div className="glow-orb" />
          <div className="preview-card preview-main">
            <div className="preview-topline"><div><span className="tiny-label">QUARTA-FEIRA, 4 DE NOVEMBRO</span><h2>Seu dia, com mais leveza</h2></div><div className="date-pill"><CalendarCheck2 size={16} /> Hoje</div></div>
            <div className="preview-summary"><div><b>08</b><span>atendimentos</span></div><div><b>02</b><span>confirmações</span></div><div><b>01</b><span>vaga recuperada</span></div></div>
            <div className="mini-appointment"><div className="time-col">09:00<span>60 min</span></div><div className="appointment-content"><div className="appointment-dot rose" /><div><b>Limpeza de pele</b><span>Equipe BelaVez · Confirmado</span></div><span className="status-tag confirmed"><Check size={12} /> Confirmado</span></div></div>
            <div className="mini-appointment"><div className="time-col">10:30<span>45 min</span></div><div className="appointment-content"><div className="appointment-dot lilac" /><div><b>Design de sobrancelha</b><span>Equipe BelaVez · Aguardando</span></div><span className="status-tag waiting"><Clock3 size={12} /> Confirmar</span></div></div>
            <div className="mini-appointment"><div className="time-col">13:00<span>90 min</span></div><div className="appointment-content"><div className="appointment-dot gold" /><div><b>Peeling facial</b><span>Equipe BelaVez · Confirmado</span></div><span className="status-tag confirmed"><Check size={12} /> Confirmado</span></div></div>
            <div className="preview-footer"><span className="footer-spark"><Sparkles size={14} /></span><span><b>Uma vaga abriu às 15h</b><small>2 pessoas na lista de espera podem aproveitar</small></span><ArrowRight size={16} /></div>
          </div>
          <div className="floating-note"><span className="floating-icon"><Sparkles size={16} /></span><span><b>Rotina mais inteligente</b><small>Sem perder o toque humano</small></span></div>
        </div>
      </section>

      <section className="trust-strip"><div className="wrap trust-inner"><span>DO PRIMEIRO CONTATO</span><i /> <span>AO PROCEDIMENTO</span><i /> <span>ATÉ O PRÓXIMO RETORNO</span></div></section>

      <section className="journey-section wrap" id="como-funciona">
        <div className="section-heading"><span className="eyebrow">Uma jornada, sem pontas soltas</span><h2>O cuidado começa antes<br />do horário marcado.</h2><p>O BelaVez conecta os passos que hoje costumam ficar espalhados entre mensagens, agenda e anotações.</p></div>
        <div className="steps-grid">{steps.map((step) => <article className="step-card" key={step.number}><span className="step-number">{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p><div className="step-line" /></article>)}</div>
      </section>

      <section className="ai-section" id="para-clinicas"><div className="wrap ai-inner"><div className="ai-symbol"><Sparkles size={23} /></div><div><span className="eyebrow">Inteligência onde ela ajuda</span><h2>Mais clareza para a clínica.<br /><em>Mais presença</em> no atendimento.</h2><p>O assistente pode ajudar com conteúdo para serviços e análises gerais da agenda. As informações pessoais e clínicas dos pacientes ficam fora das tarefas de IA.</p></div><Link className="button button-outline" href="/dashboard">Ver painel <ArrowRight size={16} /></Link></div></section>

      <footer className="landing-footer wrap"><Image src="/belavez-mark.svg" alt="" width={32} height={32} /><span>BelaVez</span><small>Cuidado no seu tempo.</small><span className="footer-demo">Demonstração do conceito</span></footer>
    </main>
  );
}
