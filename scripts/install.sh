#!/usr/bin/env bash
# Instala as 13 skills do instagram-agent-skill (Jakeschincariol, MIT) no Claude Code.
# Uso:  ./scripts/install.sh            -> instalação global (~/.claude/skills)
#       ./scripts/install.sh --local    -> instalação só neste projeto (.claude/skills)
set -euo pipefail

UPSTREAM="https://github.com/Jakeschincariol/instagram-agent-skill.git"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [[ "${1:-}" == "--local" ]]; then DEST="$PWD/.claude/skills"; else DEST="$HOME/.claude/skills"; fi
VOICE_DIR="$HOME/.claude/instagram"

command -v git >/dev/null || { echo "ERRO: instale o git primeiro."; exit 1; }
command -v python3 >/dev/null || echo "AVISO: python3 não encontrado. As 5 ferramentas (hookscore, beats, caption, humanize, detect, swipe) precisam dele."

echo ">> Baixando $UPSTREAM"
git clone --depth 1 "$UPSTREAM" "$TMP/upstream" >/dev/null 2>&1

mkdir -p "$DEST" "$VOICE_DIR"
echo ">> Copiando skills para $DEST"
cp -r "$TMP"/upstream/skills/ig-* "$DEST"/

if [[ ! -f "$VOICE_DIR/voice.md" ]]; then
  if [[ -f "$HERE/templates/voice.pt-br.md" ]]; then
    cp "$HERE/templates/voice.pt-br.md" "$VOICE_DIR/voice.md"
  else
    cp "$TMP/upstream/templates/voice.md" "$VOICE_DIR/voice.md"
  fi
  echo ">> Criado $VOICE_DIR/voice.md (preencha antes de usar!)"
else
  echo ">> $VOICE_DIR/voice.md já existe, mantido."
fi

"$HERE/scripts/verify.sh" "$DEST"
