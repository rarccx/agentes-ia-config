#!/usr/bin/env bash
# Confere se as 13 skills estão instaladas.
DEST="${1:-$HOME/.claude/skills}"
SKILLS=(ig-reel ig-viral ig-caption ig-carousel ig-story ig-profile ig-plan ig-human ig-comment ig-reply ig-dm ig-repurpose ig-audit)
ok=0; miss=0
for s in "${SKILLS[@]}"; do
  if [[ -f "$DEST/$s/SKILL.md" ]]; then ok=$((ok+1)); else miss=$((miss+1)); echo "FALTA: $s"; fi
done
echo "Skills encontradas: $ok/13"
[[ -f "$HOME/.claude/instagram/voice.md" ]] && echo "voice.md: OK" || echo "voice.md: FALTA"
[[ $miss -eq 0 ]] && echo "Pronto. Abra o Claude Code e rode /ig-reel" || exit 1
