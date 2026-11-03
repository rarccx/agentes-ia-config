# BelaVez

Aplicativo de agendamento para clínicas e profissionais de estética e beleza, com Neon Postgres e Neon Auth.

## O que inclui

- Agendamentos com estados pendente, confirmado, cancelado e concluído.
- Fotos privadas de procedimentos armazenadas no Postgres para o MVP.
- Assistente de IA para textos genéricos de divulgação e resumos da agenda com métricas agregadas. Dados pessoais, fotos e informações clínicas de clientes não são enviados ao modelo.
- Aplicação Next.js publicada na Vercel, com Postgres no Neon.

## Desenvolvimento local

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env.local` e configure as variáveis locais. Nunca envie `.env.local` ao GitHub.
3. Aplique as migrações com `npm run db:migrate`.
4. Inicie com `npm run dev`.

## Publicação

Consulte [DEPLOYMENT.md](DEPLOYMENT.md) para configurar Vercel, Neon e o assistente de IA. As credenciais devem permanecer apenas nas variáveis de ambiente da plataforma.
