#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Deploy do Chatbot Portoplan na droplet da DigitalOcean
#
# Automatiza: git pull (reset ao origin) + npm ci + npm run build +
# cópia do dist/ para o web root do Nginx + reload do Nginx.
#
# Se qualquer etapa crítica falhar antes da cópia, o script aborta com exit 1
# SEM tocar no WEB_ROOT: o site atual continua no ar.
# =============================================================================

set -uo pipefail

# -----------------------------------------------------------------------------
# CONFIGURAÇÃO
# -----------------------------------------------------------------------------

# Diretório do projeto clonado no servidor (precisa ser um repositório git).
APP_DIR="/root/portoplan-chatbot"

# Branch do GitHub que será publicada. O deploy sempre reflete origin/GIT_BRANCH.
GIT_BRANCH="main"

# Diretório servido pelo Nginx (destino do build).
WEB_ROOT="/var/www/html"

# "sim" se o usuário que roda o script NÃO é root (usa sudo nas operações em WEB_ROOT
# e no reload do Nginx). "não" se roda como root.
USE_SUDO="não"

# "sim" para guardar a versão anterior de WEB_ROOT em WEB_ROOT.backup antes de
# cada deploy (uma só cópia, sobrescrita a cada deploy), para rollback manual.
BACKUP="sim"

# -----------------------------------------------------------------------------
# FUNÇÕES AUXILIARES
# -----------------------------------------------------------------------------

if [ "$USE_SUDO" = "sim" ]; then
  SUDO="sudo"
else
  SUDO=""
fi

passo() {
  echo ""
  echo "==> $1"
}

aviso() {
  echo "AVISO: $1"
}

# Mensagem de erro clara em português e saída com código 1.
falha() {
  echo ""
  echo "ERRO: $1" >&2
  echo "O site atual NÃO foi alterado e continua no ar." >&2
  exit 1
}

# -----------------------------------------------------------------------------
# 1. DIRETÓRIO DO PROJETO
# -----------------------------------------------------------------------------

passo "Verificando o diretório do projeto: $APP_DIR"

if [ ! -d "$APP_DIR" ]; then
  falha "O diretório do projeto não existe: $APP_DIR. Ajuste APP_DIR no topo do deploy.sh."
fi

cd "$APP_DIR" || falha "Não foi possível entrar no diretório: $APP_DIR."

if [ ! -d ".git" ]; then
  falha "$APP_DIR não é um repositório git. Clone o projeto antes de rodar o deploy."
fi

# -----------------------------------------------------------------------------
# 2. ATUALIZAR CÓDIGO DO GITHUB
# -----------------------------------------------------------------------------

passo "Buscando atualizações do GitHub (branch $GIT_BRANCH)"

if ! git fetch origin "$GIT_BRANCH"; then
  falha "Falha ao buscar atualizações do GitHub (git fetch). Verifique a conexão com a internet e as credenciais do repositório."
fi

passo "Atualizando o código para origin/$GIT_BRANCH (mudanças locais são descartadas)"

if ! git reset --hard "origin/$GIT_BRANCH"; then
  falha "Falha ao atualizar o código (git reset --hard origin/$GIT_BRANCH). Verifique se a branch $GIT_BRANCH existe no repositório."
fi

COMMIT_ATUAL="$(git rev-parse --short HEAD 2>/dev/null || echo desconhecido)"
echo "Código atualizado para o commit: $COMMIT_ATUAL"

# -----------------------------------------------------------------------------
# 3. DEPENDÊNCIAS
# -----------------------------------------------------------------------------

passo "Instalando dependências (npm ci)"

if ! npm ci; then
  aviso "npm ci falhou. Tentando npm install como alternativa."
  if ! npm install; then
    falha "Falha ao instalar as dependências (npm ci e npm install falharam)."
  fi
fi

# -----------------------------------------------------------------------------
# 4. BUILD
# -----------------------------------------------------------------------------

passo "Gerando o build de produção (npm run build)"

if ! npm run build; then
  falha "O build falhou (npm run build). Corrija o erro acima e rode o deploy novamente."
fi

if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
  falha "O build terminou, mas a pasta dist/ está vazia ou não existe."
fi

# -----------------------------------------------------------------------------
# 5. PUBLICAÇÃO NO WEB ROOT (só depois do build com sucesso)
# -----------------------------------------------------------------------------

passo "Preparando o destino: $WEB_ROOT"

if ! $SUDO mkdir -p "$WEB_ROOT"; then
  falha "Não foi possível criar ou acessar $WEB_ROOT. Verifique permissões (USE_SUDO)."
fi

if [ "$BACKUP" = "sim" ] && [ -n "$(ls -A "$WEB_ROOT" 2>/dev/null)" ]; then
  passo "Guardando a versão anterior em $WEB_ROOT.backup"
  if ! $SUDO rm -rf "$WEB_ROOT.backup" || ! $SUDO cp -a "$WEB_ROOT" "$WEB_ROOT.backup"; then
    falha "Não foi possível criar o backup em $WEB_ROOT.backup. Nada foi copiado."
  fi
fi

passo "Copiando o build (dist/) para $WEB_ROOT"

if command -v rsync >/dev/null 2>&1; then
  if ! $SUDO rsync -a --delete dist/ "$WEB_ROOT/"; then
    falha "Falha ao copiar o build com rsync para $WEB_ROOT. Use o backup em $WEB_ROOT.backup se necessário."
  fi
else
  aviso "rsync não encontrado. Usando cp como alternativa."
  $SUDO rm -rf "$WEB_ROOT"/* 2>/dev/null
  if ! $SUDO cp -a dist/. "$WEB_ROOT/"; then
    falha "Falha ao copiar o build com cp para $WEB_ROOT. Use o backup em $WEB_ROOT.backup se necessário."
  fi
fi

# -----------------------------------------------------------------------------
# 6. RECARREGAR NGINX (somente se o serviço existir)
# -----------------------------------------------------------------------------

if command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files nginx.service 2>/dev/null | grep -q "nginx.service"; then
  passo "Recarregando o Nginx"
  if ! $SUDO systemctl reload nginx; then
    aviso "Não foi possível recarregar o Nginx. Os arquivos novos já estão em $WEB_ROOT; recarregue manualmente com: sudo systemctl reload nginx"
  fi
else
  aviso "Serviço nginx não encontrado. Pulando o reload."
fi

# -----------------------------------------------------------------------------
# 7. FINAL
# -----------------------------------------------------------------------------

echo ""
echo "Deploy concluído em $(date '+%d/%m/%Y %H:%M:%S')"
echo "Commit deployado: $(git rev-parse --short HEAD)"
