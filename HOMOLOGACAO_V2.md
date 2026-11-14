# Homologação em https://bot.portoplan.com.br/v2

## Estado
Preparação de código apenas. **Não executar deploy da produção nem modificar o workflow de produção**.

## Build isolado
Em um checkout da branch `integracao-v2`:

```bash
npm ci
VITE_APP_BASE_PATH=/v2/ VITE_PORTOPLAN_API_URL= npm run build
```

`VITE_PORTOPLAN_API_URL` vazio usa a mesma origem. A API do backend já utiliza caminhos na raiz, como `/auth/login` e `/tickets`. Assim, as requisições da V2 vão para a API existente e não para `/v2/auth/login`.

**Atenção:** o build apenas compila a interface; não é validação funcional. Não testar envio com clientes reais. A aplicação demonstrativa fora da Inbox piloto ainda utiliza mocks.

## Nginx — exemplo, NÃO aplicar sem inspecionar o arquivo atual

Na configuração HTTPS existente do domínio, adicionar somente um bloco específico para o novo caminho, sem alterar o bloco `location /` da produção:

```nginx
location = /v2 {
    return 302 /v2/;
}
location ^~ /v2/ {
    alias /var/www/portoplan-bot-v2/;
    try_files $uri $uri/ /v2/index.html;
}
```

**Importante:** verificar `nginx -T` e a forma de `try_files`/alias do Nginx instalado antes de aplicar; em algumas configurações é preferível usar `root` ou `error_page` para fallback SPA. Se houver `location` de API com prefixo, garantir que `/auth/*`, `/tickets*` e `/messages/*` permaneçam apontando para o backend. Não substituir a raiz da aplicação.

O diretório de publicação da V2 é independente: `/var/www/portoplan-bot-v2`. A produção usa `/var/www/portoplan-bot` segundo o workflow existente.

## Segurança antes de liberar

1. Inspecionar Nginx, proxy reverso, TLS e caminhos reais do servidor.
2. Validar que os endpoints de API exigem JWT e restringem tickets por empresa/fila.
3. Garantir que cookie de refresh `jrt` funcione com o mesmo domínio e HTTPS.
4. Considerar proteção de acesso à homologação (IP ou autenticação adicional).
5. Executar build, checar HTML/JS/CSS sob `/v2/` e navegação SPA.
6. Fazer testes com contas e conversas de homologação, nunca clientes.
7. Verificar logs e saúde do backend, sem reiniciá-lo.
8. Preparar rollback removendo apenas a rota `/v2` e seu diretório independente.

Nenhum merge, deploy ou migração de banco faz parte deste documento.
