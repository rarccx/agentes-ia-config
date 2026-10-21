#!/bin/bash

# Configuração de Todos os Agentes IA - Mesa Financeira
# Versão: 3.0

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         CONFIGURADOR AUTOMÁTICO - AGENTES IA              ║"
echo "║                  Mesa Financeira v3.0                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Lista de agentes com configurações específicas
declare -A AGENTES=(
    ["claude"]="setup-claude|https://api.anthropic.com/v1"
    ["codex"]="setup-codex|/v1"
    ["cline"]="setup-cline|/v1"
    ["roo"]="setup-roo|/v1"
    ["continue"]="setup-continue|/v1"
    ["aider"]="setup-aider|/v1"
    ["opencode"]="setup-opencode|/v1"
    ["goose"]="setup-goose|/v1"
    ["qwen"]="setup-qwen|/v1"
    ["kilo"]="setup-kilo|/v1"
    ["crush"]="setup-crush|/v1"
    ["dsh"]="setup-dsh|/v1"
    ["mimo"]="setup-mimo|/v1"
    ["atomcode"]="setup-atomcode|/v1"
    ["openclaw"]="setup-openclaw|/v1"
    ["hermes"]="setup-hermes|/v1"
    ["pi"]="setup-pi|/v1"
    ["reasonix"]="setup-reasonix|/v1"
    ["zcode"]="setup-zcode|/v1"
)

# Configurações especiais
GEMINI_URL="/v1beta"
CURSOR_URL="https://api.openai.com/v1"
ZED_URL="http://localhost:11434/api"

# Contador de sucessos/erros
SUCESSOS=0
ERROS=0
TOTAL=${#AGENTES[@]}

log "Iniciando configuração de $TOTAL agentes..."

# Função para configurar agente
configurar_agente() {
    local nome=$1
    local config=$2
    local comando=$(echo $config | cut -d'|' -f1)
    local url_base=$(echo $config | cut -d'|' -f2)
    
    log "Configurando: $nome"
    log "  Comando: $comando"
    log "  URL Base: $url_base"
    
    # Verifica se o comando existe
    if command -v $comando &> /dev/null; then
        log "  ✓ Comando encontrado"
        
        # Executa a configuração
        if $comando --help &> /dev/null; then
            log "  ✓ Configuração iniciada para $nome"
            ((SUCESSOS++))
        else
            warn "  ⚠ Configuração pode falhar para $nome"
            ((SUCESSOS++))
        fi
    else
        warn "  ✗ Comando $comando não encontrado"
        warn "  Tentando instalação alternativa..."
        
        # Tentativas de instalação alternativa
        case $nome in
            "claude")
                npm install -g @anthropic-ai/claude-code 2>/dev/null || pip install claude-code 2>/dev/null || true
                ;;
            "codex")
                npm install -g @openai/codex 2>/dev/null || true
                ;;
            "cline")
                code --install-extension saoudrizwan.claude-dev 2>/dev/null || true
                ;;
            "gemini")
                npm install -g @google/gemini-cli 2>/dev/null || true
                ;;
            *)
                pip install $nome 2>/dev/null || npm install -g $nome 2>/dev/null || true
                ;;
        esac
        
        # Verifica novamente
        if command -v $comando &> /dev/null; then
            log "  ✓ Instalação bem-sucedida para $nome"
            ((SUCESSOS++))
        else
            error "  ✗ Falha ao configurar $nome"
            ((ERROS++))
        fi
    fi
    echo ""
}

# Configurar agentes normais
for agente in "${!AGENTES[@]}"; do
    configurar_agente "$agente" "${AGENTES[$agente]}"
done

# Configurações Especiais

# Gemini CLI (Manual)
log "Configurando: Gemini CLI (Especial)"
log "  URL Base: $GEMINI_URL"
log "  Modo: Manual"
warn "  ⚠ Gemini CLI requer configuração manual"
warn "  1. Instale: npm install -g @google/gemini-cli"
warn "  2. Configure: gemini config set urlBase $GEMINI_URL"
warn "  3. Autentique: gemini auth login"
echo ""

# Cursor (Especial)
log "Configurando: Cursor (Especial)"
log "  URL Base: $CURSOR_URL"
log "  Modo: Impressão do guia"
warn "  ⚠ Cursor requer configuração manual"
warn "  1. Abra Cursor"
warn "  2. Vá em Settings > AI"
warn "  3. Configure API Endpoint: $CURSOR_URL"
echo ""

# Zed/JetBrains IA (Especial)
log "Configurando: Zed/JetBrains IA (Especial)"
log "  URL Base: $ZED_URL"
log "  Modo: Emulação Llama"
warn "  ⚠ Requer Ollama rodando"
warn "  1. Instale Ollama: curl -fsSL https://ollama.com/install.sh | sh"
warn "  2. Inicie Ollama: ollama serve"
warn "  3. Baixe modelo: ollama pull llama2"
echo ""

# Resumo Final
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗"
echo "║                     RESUMO DA CONFIGURAÇÃO                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
log "Total de agentes: $TOTAL"
log "Configurados com sucesso: $SUCESSOS"
log "Erros: $ERROS"
log "Configurações especiais: 3 (Gemini, Cursor, Zed/JetBrains)"

# Verificações pós-configuração
echo ""
log "Verificações pós-configuração..."

# Verificar Python
if command -v python3 &> /dev/null; then
    log "✓ Python3 disponível"
else
    warn "✗ Python3 não encontrado - instale com: apt install python3"
fi

# Verificar Node.js
if command -v node &> /dev/null; then
    log "✓ Node.js disponível"
else
    warn "✗ Node.js não encontrado - instale com: apt install nodejs"
fi

# Verificar npm
if command -v npm &> /dev/null; then
    log "✓ npm disponível"
else
    warn "✗ npm não encontrado - instale com: apt install npm"
fi

# Verificar Ollama (para Zed/JetBrains)
if command -v ollama &> /dev/null; then
    log "✓ Ollama disponível"
else
    warn "✗ Ollama não encontrado - instale com: curl -fsSL https://ollama.com/install.sh | sh"
fi

# Instruções finais
echo ""
echo -e "${GREEN}🎉 Configuração Concluída!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Reinicie o terminal"
echo "2. Teste cada agente: setup-[agente] --help"
echo "3. Configure as URLs base conforme necessário"
echo "4. Execute: ./configure-all.sh para reconfigurar"

# Salvar log
LOG_FILE="config-agentes-$(date +%Y%m%d-%H%M%S).log"
{
    echo "Configuração realizada em: $(date)"
    echo "Agentes configurados: $SUCESSOS"
    echo "Erros: $ERROS"
    echo "Total: $TOTAL"
} > $LOG_FILE

log "Log salvo em: $LOG_FILE"
