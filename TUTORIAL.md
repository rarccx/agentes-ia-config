# Tutorial: do zero ao primeiro Reel com o Instagram Agent

Tempo total: cerca de 20 minutos.

## O que é

Treze skills do Claude, cada uma ativada por um comando `/ig-...`. Cinco delas rodam scripts Python locais (sem rede, sem dependências) que pontuam ganchos, cronometram roteiros, validam legendas, limpam "cara de IA" do texto e ranqueiam reels virais.

## Antes de começar

- Claude (claude.ai) **ou** Claude Code (recomendado: só ele roda os scripts Python).
- `git` e `python3` instalados.
- Uma conta de Instagram. Não precisa conectar nada.

## Passo 1: Instalar

### Opção A: colando o link no Claude (o método do vídeo)

1. Abra um novo chat.
2. Cole:
   ```
   https://github.com/Jakeschincariol/instagram-agent-skill

   Instale esta skill e confirme que /ig-reel funciona.
   ```
3. Aguarde a confirmação.

### Opção B: pelo terminal (este repositório)

```bash
git clone <URL-DESTE-REPO> instagram-agent-pronto
cd instagram-agent-pronto
./scripts/install.sh            # global: ~/.claude/skills
./scripts/install.sh --local    # ou só no projeto atual
```

O script termina rodando `verify.sh`. Esperado: `Skills encontradas: 13/13`.

### Opção C: como plugin do Claude Code

```
/plugin marketplace add Jakeschincariol/instagram-agent-skill
/plugin install instagram-agent
```

### Sem Claude Code?

Cole o conteúdo de um único `SKILL.md` no começo do chat e ele funciona como um modo. Você perde as ferramentas Python, que são a parte mais forte de `/ig-reel` e `/ig-human`.

## Passo 2: Preencher seu voice.md (10 minutos, o passo mais importante)

Todas as skills leem `~/.claude/instagram/voice.md`. Sem ele, o texto sai genérico.

**Jeito 1:** abra o arquivo e preencha o modelo (quem você é, público, tom, opiniões fortes, histórias reais, CTA).

**Jeito 2:** mande 3 reels seus (roteiros ou transcrições) e diga:
> Escreva meu voice.md a partir destes.

Regras: use apenas números e histórias reais. As skills não inventam métricas e devolvem `{{seu número}}` quando faltar dado.

## Passo 3: Descobrir o que funciona no seu nicho

```
/ig-viral
```

A skill pede 10 contas do seu nicho e cerca de 12 reels de cada. Ela:

- lê com você dirigindo o seu navegador, sem pedir senha e sem logar por você;
- ranqueia pelo **múltiplo sobre a mediana da própria conta** (400 mil views em conta de 4 mil seguidores vale mais que em conta de 2 milhões);
- nomeia a fórmula de gancho e gera o swipe file.

Se você já tem os dados em TSV, rode direto:

```bash
python3 swipe.py captured.tsv --out ~/.claude/instagram/swipe.md
```

## Passo 4: Criar o Reel

```
/ig-reel
```

Dê uma ideia. Você recebe:

1. 3 ganchos escolhidos entre 26 fórmulas, já pontuados;
2. o roteiro;
3. o texto na tela;
4. a beat sheet com tempo de cada fala.

Teste ganchos por conta própria:

```bash
python3 hookscore.py ganchos.txt            # ranqueia suas opções
python3 beats.py roteiro.txt --target 30    # cronometra antes de gravar
```

O `beats.py` avisa sobre os quatro erros que matam um Reel: gancho acima de 3 s, beat longo demais, trecho sem nada concreto e falta de loop com a primeira frase.

**Limite honesto (do próprio autor):** o `hookscore` é bom para barrar ganchos ruins (AUC 0,83) e fraco para escolher o vencedor entre dois bons (AUC 0,56). Use para cortar o óbvio e confie no seu gráfico de retenção.

## Passo 5: Legenda

```
/ig-caption
```

Ou direto:

```bash
python3 caption.py legenda.txt --keywords "termo 1,termo 2"
```

Mostra o que o feed exibe antes do "... mais" (cerca de 125 caracteres) e valida tamanho, primeira linha, hook concreto, hashtags (**máximo 5**, regra de dezembro de 2025), um único CTA e termos de busca.

## Passo 6: Humanizar antes de postar

```
/ig-human
```

Ou:

```bash
python3 humanize.py rascunho.txt --report   # limpa e mostra cada mudança
python3 detect.py rascunho.txt              # nota em 5 checagens
python3 detect.py antes.txt depois.txt      # prova a diferença
```

Remove caracteres invisíveis, travessões, aspas curvas e 154 palavras/frases típicas de IA (lista editável em `slop.json`). Estruturas como "não é só X, é Y" e tríades são só sinalizadas, para você reescrever.

Atenção: as 5 checagens são heurísticas locais. Não são GPTZero, Originality ou similares e não prometem o veredito delas.

## Passo 7: Perfil e planejamento

```
/ig-profile    # nota de 0 a 100 em 12 critérios + reescrita (bio, nome, link, destaques, fixados)
/ig-plan       # a semana: formato, horário, 10 contas para engajar
```

## Passo 8: Dia a dia

| Comando | Quando |
|---|---|
| `/ig-carousel` | Carrossel: capa, copy dos slides, arquivos 1080x1350 |
| `/ig-story` | Sequência diária de stories e funil de DM |
| `/ig-comment` | Comentar em posts de outras contas (9 tipos, nunca "🔥🔥🔥") |
| `/ig-reply` | Responder o seu próprio post (palavra-chave, lead, dúvida, ruído) |
| `/ig-dm` | Entrega por palavra-chave, primeira mensagem, pitch de collab, 2 follow-ups |
| `/ig-repurpose` | Um vídeo/podcast/newsletter vira uma semana de conteúdo |
| `/ig-audit` | Post-mortem do que você já postou, por alcance e envios |

Veja `docs/rotina-semanal.md` para uma sequência sugerida.

## Passo 9: Postar

Toda skill termina com um bloco pronto para copiar e a pergunta "publico ou mudo?". **Você** publica manualmente. Automatizar postagem, comentário, follow ou DM por navegador viola os Termos do Instagram e leva a bloqueios. A única exceção é a resposta automática por palavra-chave em DM, via ferramentas oficiais do Instagram.

## Problemas comuns

| Sintoma | Solução |
|---|---|
| `Skills encontradas: 10/13` | Rode `./scripts/install.sh` de novo; confira `git` e a conexão |
| `/ig-reel` não aparece | Reinicie o Claude Code; confira `~/.claude/skills/ig-reel/SKILL.md` |
| Textos genéricos | Preencha melhor o `voice.md` |
| `python3: command not found` | Instale Python 3 (as skills funcionam, mas sem as ferramentas locais) |
| Hashtags reprovadas | O limite agora é 5 por post |
| Números do Instagram divergem | O Instagram está certo; confira regras atuais |

## Dica final

Rode o ciclo `/ig-viral` → `/ig-reel` → `/ig-caption` → `/ig-human` toda semana e use o `/ig-audit` para ver o que realmente performou. O que decide o alcance continua sendo seu rosto, sua edição, seu áudio e quem o Instagram escolhe mostrar.
