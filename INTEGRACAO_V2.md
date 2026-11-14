# PortoPlan V2 - integração isolada

Branch: `integracao-v2`. A rota `/integracao-v2` é um piloto separado da interface demonstrativa.

## Configuração

O backend existente expõe `/auth/login`, `/auth/refresh_token`, `/tickets` e `/messages/:ticketId` na raiz. Configure `VITE_PORTOPLAN_API_URL` como a origem do backend (sem sufixo `/api`), ou deixe vazio se um proxy reverso **da mesma origem** encaminhar essas rotas. Nunca inclua segredos em variáveis `VITE_*`.

O backend restringe CORS a `FRONTEND_URL`. O refresh token utiliza cookie `jrt`, portanto o ambiente de homologação deve validar domínio, SameSite, Secure e HTTPS antes de testar sessões. Não altere a variável de produção para testar a V2.

## Testes obrigatórios antes de qualquer merge

1. `npm ci` e `npm run build` no frontend (o script `npm test` atual não executa testes reais).
2. Confirmar login com credenciais válidas e rejeição de senha incorreta.
3. Confirmar recuperação de sessão após recarregar, renovação do token e logout.
4. Confirmar que usuário de uma empresa não consegue ler tickets de outra.
5. Confirmar permissões por fila/usuário, inclusive acesso direto a ticket e mensagens.
6. Confirmar histórico paginado (a tela piloto exibe apenas a primeira página por enquanto).
7. Confirmar envio de texto em ambiente de homologação com WhatsApp de teste, sem disparar para clientes.
8. Confirmar comportamento com 401, 403, falha de rede e mensagem duplicada.
9. Verificar mensagens recebidas em tempo real (ainda não há Socket.IO conectado ao piloto).
10. Revisar o backend: `/auth/me` usa cookie `jrt`; a API V2 atualmente usa refresh na inicialização.

## Limitações conhecidas

- A V2 demonstrativa permanece disponível nas rotas antigas e ainda usa dados mockados; **não a exponha como produto real**.
- O piloto não implementa Socket.IO, paginação completa, mídia, transferência, permissões específicas da V2 nem atualização automática.
- O token de acesso fica apenas em memória, não em localStorage. O refresh depende de cookie válido.
- O botão de envio aciona a API real. Use exclusivamente um ambiente isolado de homologação para testes.
- Não executar deploy, merge ou alterações de infraestrutura sem aprovação.
