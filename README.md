# Instagram Agent: pronto pra usar

Kit de instalação em PT-BR das 13 skills do Claude que rodam uma conta de Instagram (repositório original: [Jakeschincariol/instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill), licença MIT), o mesmo mostrado no vídeo.

Grátis, sem cadastro, sem API key. **Nada é postado sozinho: as skills escrevem, você posta.**

## Instalação rápida (30 segundos)

```bash
git clone <URL-DESTE-REPO> instagram-agent-pronto
cd instagram-agent-pronto
./scripts/install.sh
```

Depois preencha `~/.claude/instagram/voice.md` e abra o Claude Code.

Prefere o jeito do vídeo? Cole isto em um chat novo do Claude:

```
https://github.com/Jakeschincariol/instagram-agent-skill

Instale esta skill e confirme que /ig-reel funciona.
```

## Conteúdo

| Caminho | Para quê |
|---|---|
| `scripts/install.sh` | Baixa as 13 skills originais e instala (global ou `--local`) |
| `scripts/verify.sh` | Confere se está tudo instalado |
| `templates/voice.pt-br.md` | Seu perfil de voz em português (todas as skills leem) |
| `docs/rotina-semanal.md` | Qual comando usar em cada dia |
| `TUTORIAL.md` | Passo a passo completo |

## Os 13 comandos

`/ig-reel` `/ig-viral` `/ig-caption` `/ig-carousel` `/ig-story` `/ig-profile` `/ig-plan` `/ig-human` `/ig-comment` `/ig-reply` `/ig-dm` `/ig-repurpose` `/ig-audit`

## Créditos e licença

Skills por Jake Schincariol (MIT). Este kit também é MIT.
