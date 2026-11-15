# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo.

## [0.0.12] — 2026-11-15

### Diversos

- Bump de versão (0.0.12) para forçar a sincronização do snapshot completo e mais recente do código com o repositório GitHub (Irubinger/portoplan-chatbot), usado no deploy da DigitalOcean.
- Nenhuma alteração de funcionalidade, tela ou comportamento.

## Deploy na DigitalOcean

Script: `deploy.sh` (na raiz do projeto). Ele faz `git reset --hard origin/<branch>`, `npm ci`, `npm run build` e copia `dist/` para o web root do Nginx. Se algo falhar antes da cópia, o site atual continua no ar.

Configure no topo do `deploy.sh`: `APP_DIR`, `GIT_BRANCH`, `WEB_ROOT`, `USE_SUDO` (`sim` se não rodar como root) e `BACKUP`.

### Primeira instalação

```bash
# 1. Instalar Node.js 18+, Git e Nginx na droplet
# 2. Clonar o repositório
git clone https://github.com/Irubinger/portoplan-chatbot.git /root/portoplan-chatbot
cd /root/portoplan-chatbot

# 3. Dar permissão de execução ao script
chmod +x deploy.sh

# 4. Primeiro build e cópia para o web root
npm ci
npm run build
sudo cp -r dist/. /var/www/html/
```

Configure o Nginx para servir os arquivos estáticos com fallback para `index.html` (necessário para as rotas do React Router):

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Depois: `sudo nginx -t && sudo systemctl reload nginx`.

### Uso corrente

```bash
cd /root/portoplan-chatbot
./deploy.sh
```

Para voltar à versão anterior, copie `WEB_ROOT.backup` de volta para `WEB_ROOT` (por padrão, `/var/www/html.backup` → `/var/www/html`).
