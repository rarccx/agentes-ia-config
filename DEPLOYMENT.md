# Publicação do BelaVez na Vercel

O projeto usa Next.js e está configurado para Functions da Vercel na região `gru1` (São Paulo), próxima ao Postgres Neon em `aws-sa-east-1`. O pool `pg` é reutilizado entre solicitações e conectado ao ciclo de suspensão do Fluid Compute.

## Configuração

1. Importe o repositório do BelaVez na Vercel, mantendo a raiz do projeto como diretório raiz. O comando de build é `npm run build`.
2. No ambiente **Production** da Vercel, configure `DATABASE_URL`, `NEON_AUTH_BASE_URL` e um `NEON_AUTH_COOKIE_SECRET` aleatório com pelo menos 32 caracteres. Para obter as duas primeiras variáveis, execute `neon checkout production` e depois `neon env pull`; gere o segredo de cookie separadamente para o ambiente hospedado.
3. Para ativar o assistente generativo, crie uma chave no AI Gateway da Vercel e configure `AI_GATEWAY_API_KEY` e um `AI_MODEL` habilitado no catálogo. Opcionalmente, use `AI_API_BASE_URL` e `AI_API_KEY` para outro provedor compatível com Chat Completions. Deixe as chaves apenas nas variáveis de ambiente server-side da Vercel.
4. Depois do primeiro deploy, adicione o domínio de produção da Vercel aos domínios confiáveis do Neon Auth.

As variáveis locais estão em `.env.local`, ignorado pelo Git. Não copie esse arquivo para o repositório. O assistente envia somente categorias genéricas ou métricas agregadas; não envia dados pessoais ou clínicos de pacientes.

O AI Gateway do Neon não está disponível para o projeto na região `aws-sa-east-1`; o endpoint padrão do assistente usa o AI Gateway da Vercel, compatível com esta hospedagem. A geração de texto fica desativada até configurar uma chave e um modelo.
