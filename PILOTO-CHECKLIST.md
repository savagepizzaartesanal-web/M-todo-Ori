# Checklist do Piloto ORI

## Preparacao

1. Rode `metodo-ori/supabase-piloto-estabilizacao.sql` no SQL Editor do Supabase.
2. Confirme as variaveis do frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_API_URL`.
3. Confirme as variaveis do backend: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `FRONTEND_ORIGINS`, `AI_PROVIDER` e a chave do provedor escolhido.
4. Abra `/health` e `/health/dependencies` no backend.
5. Rode `metodo-ori/supabase-security-audit.sql` e revise RLS, policies, grants anonimos e admins ativos.
6. Depois da auditoria, rode `metodo-ori/supabase-security-hardening.sql` para reforcar RLS e bloquear acesso anonimo direto as tabelas sensiveis.

## Conta Nova

1. Crie uma conta de cliente.
2. Conclua a Entrada ORI, incluindo WhatsApp.
3. Inicie o Codigo das Deusas e responda alguns sinais.
4. Recarregue a pagina e confirme que o quiz continua do ponto salvo.
5. Conclua o quiz e confirme o resultado no Portal Cliente e no Espelho ORI.
6. Leia todas as camadas, envie o feedback e confirme a exibicao do CTA seguinte.
7. Baixe o relatorio PDF.
8. Tire a carta diaria e confirme que a mesma carta permanece apos recarregar.

## Refazer Leitura

1. Em uma conta com leitura concluida, clique em refazer leitura.
2. Confirme a exclusao quando solicitado.
3. Recarregue a pagina.
4. Confirme que respostas, resultado e feedback anterior nao reaparecem.
5. Conclua uma nova leitura e registre um novo feedback.

## Administracao

1. Entre com uma conta administrativa.
2. Confirme a listagem de clientes e os filtros.
3. Abra uma ficha e verifique status, acao recomendada e resposta pos-leitura.
4. Gere uma mensagem com IA, revise o texto e teste copiar mensagem.
5. Abra o WhatsApp e confirme o registro no historico administrativo.
6. Teste liberar e remover acesso ao Dossie ORI.
7. Salve uma observacao interna e confirme o historico.

## Celular E Desktop

1. Repita cadastro, quiz, feedback e Portal Cliente em tela pequena.
2. Confirme que botoes, textos e menu lateral nao se sobrepoem.
3. Teste a retomada do quiz em outro dispositivo usando a mesma conta.
