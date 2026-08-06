# Pagamentos G1 - Metodo Ori

## Produto 1 freemium

O Produto 1 / Codigo das Deusas nao deve usar `produto_1_liberado` como sinal de pagamento. Esse campo continua representando o acesso basico ao quiz, resultado e leitura inicial, e hoje aparece com valor `true` por padrao nos fluxos de cadastro, onboarding, portal e conclusao do quiz.

O unlock premium do Produto 1 usa uma permissao separada:

- `produto_1_liberado`: acesso basico freemium ao Produto 1.
- `produto_1_completo_liberado`: acesso pago a leitura completa do Produto 1.

Sem pagamento:

- `produto_1_liberado = true`
- `produto_1_completo_liberado = false`

Depois de pagamento aprovado do unlock premium:

- `produto_1_liberado = true`
- `produto_1_completo_liberado = true`

## Usos atuais de `produto_1_liberado`

- `backend/app/schemas/jornada.py`: exposto no status da jornada como acesso basico.
- `backend/app/services/jornada_service.py`: lido de `clientes` e tratado como liberado quando nao e explicitamente `false`.
- `backend/app/services/produto1_service.py`: gravado como `true` ao concluir/resetar respostas do Produto 1.
- `metodo-ori/src/pages/Login.jsx`: gravado como `true` ao criar cliente.
- `metodo-ori/src/pages/OnboardingOri.jsx`: gravado como `true` no fluxo de onboarding.
- `metodo-ori/src/pages/PortalCliente.jsx`: usado para liberar o card/acesso basico do Produto 1 e gravado como `true` ao criar perfil.
- `metodo-ori/src/pages/QuizProduto1.jsx`: gravado como `true` em upserts/reset do quiz.

Essa separacao e compativel com contas existentes, piloto e admin porque o campo antigo nao muda, e a nova coluna nasce com `default false`.

## Estrutura paga do Produto 1

No backend, a ordem real das camadas esta em `backend/app/services/leitura_service.py`, em `REPORT_SECTION_ORDER`.

Camadas gratuitas:

- `reconhecimento` - 01 - Reconhecimento
- `essencia` - 02 - Essencia
- `dinamica` - 03 - Dinamica psiquica

Paywall a partir de:

- `vidaReal` - 04 - Como isso aparece na vida real

Camadas premium:

- `vidaReal`
- `percebida`
- `sombra`
- `padraoRelacional`
- `caminho`
- `essenciaImagem`
- `paleta`
- `modelagem`
- `tecidos`
- `beleza`
- `presenca`
- `evitar`
- `leituraFinal`

## Catalogo MVP

A migracao `metodo-ori/supabase-pagamentos-g1.sql` cria um catalogo com:

- `produto_1_completo`, que concede `produto_1_completo_liberado`.
- `produto_2`, que concede `produto_2_liberado`.
- `produto_3`, que concede `produto_3_liberado`.

O campo de preco e `amount_cents`, sempre em centavos inteiros. Os produtos entram como `active = false` e `amount_cents = null`. Precos e ativacao ficam para a etapa de checkout.

O campo `grants_product` registra qual permissao o produto concede, mas G2/G3 nao deve usar esse valor como nome dinamico de coluna. O backend devera aplicar uma allowlist explicita:

- `produto_1_completo` -> `produto_1_completo_liberado`
- `produto_2` -> `produto_2_liberado`
- `produto_3` -> `produto_3_liberado`

## Modelo de entitlement e pagamento

A G1 cria:

- `payment_products`: catalogo dos produtos vendaveis e qual permissao cada produto concede.
- `payment_orders`: pedidos/checkouts vinculados a cliente, produto, provider, status e referencia externa.
- `payment_webhook_events`: trilha idempotente de eventos recebidos do provider.

`payment_webhook_events` usa `provider_event_id`, `provider_payment_id`, `processed`, `processing_error`, `payload_sanitized`, `processed_at`, `created_at` e `updated_at`. O backend futuro deve gravar somente payload sanitizado ou campos estritamente necessarios, sem persistir payload bruto indiscriminadamente.

O frontend nao acessa diretamente as tabelas financeiras. A migration revoga acesso de `anon` e `authenticated` em `payment_products`, `payment_orders` e `payment_webhook_events`. As consultas da cliente deverao passar por endpoints FastAPI autenticados, como `GET /api/payments/{order_id}/status` e `GET /api/payments/me`.

O backend de webhook deve atualizar o entitlement em `public.clientes` somente depois de confirmacao confiavel do provider. Para isso, a etapa de checkout/webhook deve usar uma chave server-side do Supabase, como `SUPABASE_SECRET_KEY`, nunca a publishable key do frontend.

Cliente comum e identificada por JWT autenticado com `auth.uid()` e role `authenticated`. Admin e identificado por `public.current_user_is_ori_admin()`, que consulta `public.clientes.admin is true`. Operacao server-side privilegiada e identificada por `auth.role() = 'service_role'`, role emitida pela chave server-side do Supabase; isso nao deve ser baseado em header controlavel pelo frontend.

O trigger `prevent_cliente_privilege_escalation` continua bloqueando cliente comum de alterar `admin`, `user_id`, `produto_1_completo_liberado`, `produto_2_liberado`, `produto_3_liberado` e `observacoes_admin`. Ele permite admin real e service role para que o backend possa conceder entitlements depois de pagamento aprovado.

## Ponto de paywall no frontend

O ponto visual de paywall deve entrar na leitura do Produto 1, depois da Camada 03 do Bloco 01. A interface deve consultar `produto_1_completo_liberado` no status da jornada e bloquear a navegacao/visualizacao a partir da camada `vidaReal`.

Essa mudanca ainda nao foi implementada na UI nesta G1.

## Protecao obrigatoria no backend

Hoje `get_produto1_leitura_personalizada` monta e retorna `camadas` e `report` completos. `get_produto1_relatorio` usa essa leitura completa para gerar todas as secoes. Isso significa que um paywall apenas no frontend nao protege o conteudo premium.

A etapa G4/G5 deve alterar o backend para que, quando `produto_1_completo_liberado` nao for `true`, as respostas de Produto 1 nao enviem:

- Camada 04 em diante do Bloco 01.
- Blocos 02, 03 e 04 completos.
- PDF/relatorio completo.

Menor alteracao segura prevista:

- centralizar os IDs gratuitos e premium em `backend/app/services/leitura_service.py`;
- verificar `cliente.produto_1_completo_liberado` antes de retornar `Produto1LeituraResponse`;
- filtrar `camadas` e `report` no backend para clientes gratuitas;
- negar ou retornar versao parcial para `/produto1/relatorio/me` e `/produto1/relatorio/me/pdf` enquanto o unlock nao existir;
- manter o frontend apenas como camada de experiencia, nao como controle de seguranca.

## Ordem segura de implantacao

1. Aplicar `metodo-ori/supabase-pagamentos-g1.sql` no Supabase.
2. Publicar backend que seleciona `produto_1_completo_liberado`.
3. Implementar checkout/webhook.
4. Implementar paywall e protecao do conteudo premium.

Clientes piloto continuam sem backfill automatico. Qualquer liberacao de `produto_1_completo_liberado=true` para piloto deve acontecer depois, por operacao manual revisada.
