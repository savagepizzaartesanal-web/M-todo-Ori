# Project State — Método Ori

document_role: derived_operational_snapshot  
authoritative: false  
last_verified_at: `2026-08-17T14:02:07-03:00`  
verified_against: `origin/main`  
verified_sha: `269db3125efa5b942458b6f64c5d8e988026ece7`  
escopo: fontes versionadas no repo isolado `/tmp/metodo-ori-project-sources`

Aviso de revalidação temporal: este é um save game operacional curto, não um
estado vivo. Antes de agir sobre produção, checkout, deploy, Git, IA, Supabase,
Mercado Pago ou roadmap, revalidar o SHA, o roadmap corrente e a evidência
operacional mais recente.

## Regra de Autoridade

Este documento é derivado.

Em caso de divergência:

- fatos Git -> estado Git observado;
- PR/merge -> GitHub observado;
- produção/deploy/health -> runtime/provedor observado;
- status e sequência operacional ->
  `docs/ROADMAP-PRODUCAO-METODO-ORI.md`;
- routing de agentes/skills -> `docs/agent-system/SKILL-ROUTING.md`;
- autorização -> instrução humana explícita corrente.

Este snapshot nunca deve sobrescrever uma fonte autoritativa mais recente.

## Freshness

Se `origin/main` observado diferir de `verified_sha`, classificar este snapshot
como:

PARTIALLY_STALE

ou:

STALE

antes de usá-lo para decisão operacional.

A divergência NÃO autoriza:

- atualizar Git;
- editar roadmap;
- alterar runtime;
- alterar produção;
- atualizar automaticamente este documento.

Apenas reportar a divergência e verificar a fonte autoritativa.

Trabalho local, uncommitted ou existente fora do `verified_sha` pode não estar
representado neste snapshot e deve ser verificado se for relevante para a
workstream corrente. Isso é especialmente importante para workstreams em
desenvolvimento que ainda não chegaram à main.

## Fontes Checadas

Fontes prioritárias lidas nesta execução:

- `AGENTS.md`;
- `CLAUDE.md`;
- `docs/ROADMAP-PRODUCAO-METODO-ORI.md`;
- `docs/infraestrutura-producao.md`;
- `docs/status-produtos.md`;
- `docs/pagamentos-g1.md`;
- `docs/agent-system/SKILL-ROUTING.md`;
- `docs/agent-system/CODEX-ADAPTER.md`;
- `render.yaml`;
- código de health/pagamentos em `backend/app/routes/health.py`,
  `backend/app/main.py`, `backend/app/routes/payments.py`,
  `backend/app/services/payment_service.py` e
  `backend/app/services/mercado_pago_service.py`;
- `docs/agent-system/ORCHESTRATOR.md`;
- PR #25 e PR #26 (observados como MERGED em `origin/main`);
- PR #34 e PR #35 (observados como MERGED em `origin/main`).

## Estado Operacional Atual

Produto 1, Código das Deusas:

- P1 comercial ativo;
- preço corrente registrado no roadmap: R$ 47,00;
- Mercado Pago produção validado por E2E real em 06/08/2026;
- pagamento real, webhook, `payment_orders.status = approved`,
  entitlement `produto_1_completo_liberado = true`, retorno e leitura premium
  foram registrados como concluídos;
- premium deve liberar somente com confirmação positiva do entitlement;
- camada gratuita oficial: `reconhecimento`, `essencia`, `dinamica`;
- paywall a partir de `vidaReal`.

Produto 2, Dossiê ORI:

- etapa narrativa/em preparação na RC1;
- sem checkout público;
- não deve parecer comercialmente disponível;
- código contém fluxo funcional de coleta/revisão e admin, mas isso não muda a
  política comercial vigente.

Produto 3, Código Final:

- selado/futuro na RC1;
- sem checkout;
- backend e rotas existem, mas a experiência cliente está incompleta e a página
  atual é explicativa/selada.

Bundle/Jornada Completa:

- não implementado;
- sem pricing, grants, checkout, webhook, UX ou E2E;
- só deve avançar após P1, P2 e P3 comercialmente estáveis.

## Marco C E Próxima Ação

Marco C permanece ABERTO.

Concluído antes deste save:

- GATE-001;
- MASTER-002;
- MASTER-003;
- P0-GATING-001;
- MASTER-001 mínimo;
- MASTER-005;
- acessibilidade essencial: MASTER-006, MASTER-007, MASTER-008, MASTER-009;
- recovery operacional: RECOVERY-1, RECOVERY-2, RECOVERY-3, RECOVERY-4;
- OBS-1.

Observabilidade mínima ainda não fecha Marco C:

- OBS-1: concluído / deployado / healthy segundo roadmap;
- OBS-2: CONCLUÍDO / DEPLOYADO / HEALTHY (ver seção "OBS-2 — Global FastAPI
  Exception Handler" abaixo);
- OBS-3: CONCLUÍDO / DEPLOYADO / HEALTHY (ver seção "OBS-3 — Admin Payment
  Timeline Read-Only" abaixo);
- OBS-4: COMPLETE / RUNTIME ACEITO / ROADMAP CLOSEOUT MERGED (ver seção
  "OBS-4 — Mercado Pago Check Em `/health/dependencies`" abaixo).

OBS-1, OBS-2, OBS-3 e OBS-4 estão individualmente concluídos. Isso não fecha,
por si só, a frente agregada de observabilidade mínima:
MINIMUM_OBSERVABILITY_AGGREGATE = PENDING FINAL CONTINUITY AUDIT.
FINAL OBSERVABILITY CONTINUITY AUDIT = PENDING. Esta atualização de
project-state (Phase B) não constitui essa auditoria, não a autoriza e não
pré-declara seu resultado.

Próxima ação recomendada pelo roadmap:

**Auditoria final de continuidade de observabilidade (OBS-1–4), seguida da
reavaliação do Marco C.** Project-state Phase B (esta atualização) não
substitui essa auditoria.

Marco C permanece ABERTO.

## OBS-2 — Global FastAPI Exception Handler

- Status: COMPLETE.
- Global FastAPI exception handling: IMPLEMENTED / MERGED / DEPLOYED /
  HEALTHY.
- PR #28: MERGED.
- OBS-2 merge SHA: `6acc1c0da131fcccb46750c7addaabd4f6752019`.
- QA: PASS.
- Testes direcionados: 12/12 PASS.
- Suíte backend completa: 149/149 PASS.
- Integração em runtime: PASS.
- Health de produção: PASS.

## OBS-3 — Admin Payment Timeline Read-Only

- Status: COMPLETE / DEPLOYED / HEALTHY.
- Endpoint: `GET /api/admin/payments/{order_id}/timeline`.
- Natureza: admin-only, read-only por design; lookup primário por
  `order_id`.
- Timeline factual suportada: `ORDER_CREATED`, `PAYMENT_APPROVED`,
  `WEBHOOK_RECEIVED`, `WEBHOOK_PROCESSED`; eventos condicionais continuam
  condicionais aos timestamps/fatos existentes.
- Payment status atual e entitlement atual são separados da timeline.
- Entitlement history não disponível deterministicamente.
- Reconciliation não é apresentada como evento por order — a ligação
  histórica não é deterministicamente 1:1.
- Endpoint não realiza DB writes, não chama reconciliation, não concede
  entitlement e não consulta Mercado Pago; response não expõe email, CPF,
  raw webhook payload, tokens ou secrets.
- PR #31: MERGED.
- Implementation merge SHA: `51299b373332df246efe17f44e1a9027112243d4`.
- Runtime integração: PASS.
- Health de produção: PASS.

## OBS-4 — Mercado Pago Check Em `/health/dependencies`

- Status: COMPLETE.
- Implementation: PR #34, merge SHA
  `394dce5f3a3f3a1620cf5d58e9f517d71310ac5a`.
- Runtime: VALIDATED / HEALTHY.
- Canonical runtime acceptance: PASS.
- Canonical runtime: Service A, service ID `srv-d9nnvjtaeets73cc0u5g`,
  hostname `metodo-ori-api-3o22.onrender.com`.
- Roadmap closeout: MERGED, PR #35, merge SHA
  `269db3125efa5b942458b6f64c5d8e988026ece7`.
- Ver seção 28.10 do roadmap operacional para o gate completo.

## Roadmap Operacional Durável

- Seção 28.8 do roadmap operacional registra o closeout de OBS-2.
- Seção 28.9 do roadmap operacional registra o closeout de OBS-3.
- Seção 28.10 do roadmap operacional registra o closeout técnico/runtime do
  OBS-4.
- Roadmap closeout PR (OBS-2): #29.
- Roadmap closeout PR (OBS-3): #32.
- Roadmap closeout PR (OBS-4): #35.
- Roadmap merge SHA / baseline corrente: `269db3125efa5b942458b6f64c5d8e988026ece7`.

## Infraestrutura Verificada

Frontend:

- Cloudflare Pages;
- domínio oficial `https://metodoori.teluricabeleza.com`;
- workflow GitHub Actions documentado para build/deploy do frontend.

Backend:

- Render, serviço `metodo-ori-api`;
- runtime Docker;
- `render.yaml` com `buildFilter.paths: backend/**`;
- health check declarado: `/health`;
- `/health` no código retorna `{"ok": true}`;
- `/health/dependencies` existe no código e checa Supabase, IA e, desde OBS-4,
  Mercado Pago.

IA:

- provider ativo documentado: Gemini;
- `AI_PROVIDER=gemini` em `render.yaml`;
- roadmap afirma modelo de produção `gemini-3.1-flash-lite`;
- `render.yaml` versionado ainda declara `GEMINI_MODEL=gemini-2.5-flash-lite`.

Pagamentos:

- Mercado Pago Checkout Pro é o provider de pagamento do P1;
- backend usa allowlist de entitlements por produto;
- checkout habilitado por padrão somente para `produto_1_completo`
  (`DEFAULT_CHECKOUT_PRODUCT_CODES = ("produto_1_completo",)`);
- reconciliação administrativa RECOVERY-2 é escopada somente para
  `produto_1_completo`.

## Divergências E Leituras Cautelosas

- `docs/pagamentos-g1.md` é conceitual/histórico quando conflita com roadmap
  atual ou código versionado. Ele ainda descreve etapas como futuras que o
  roadmap registra como já implementadas/validadas para P1.
- Gemini produção diverge entre roadmap e `render.yaml`: roadmap registra
  `gemini-3.1-flash-lite`; `render.yaml` versionado registra
  `gemini-2.5-flash-lite`.
- AGENTS-2 / `ori-orchestrator`: COMPLETE. `ori-orchestrator` V1 está
  INTEGRATED IN MAIN via PR #25 (MERGED) e PR #26 (MERGED).
- `INFRA-RENDER-1`: OPEN. Merges em main, inclusive docs-only, têm disparado
  deployment Render, o que diverge do comportamento esperado a partir do
  `buildFilter` versionado (`backend/**`). Configuração LIVE exata do Render
  permanece NOT_VERIFIED. Divergência observada de identidade/URL dos
  serviços Render permanece não resolvida. Durante a validação do OBS-4 foi
  confirmada a existência de um segundo serviço Render (Service B, service ID
  `srv-d8bqgsel51nc73cjleg0`, hostname `metodo-ori-api.onrender.com`),
  classificado como NON_CANONICAL_LEGACY_DUPLICATE_CANDIDATE; a canonicidade
  foi estabelecida em Service A e Service B não bloqueou o aceite de runtime
  canônico do OBS-4. Nenhuma remediação ou mutação de provider foi executada;
  a disposição final do Service B permanece indecidida e continua sob
  `INFRA-RENDER-1`.
- P2/P3 têm código e entitlements, mas isso não equivale a checkout público ou
  disponibilidade comercial na RC1.

## AGENTS-2 / ori-orchestrator

- AGENTS-2: COMPLETE.
- ori-orchestrator V1: INTEGRATED IN MAIN.
- PR #25: MERGED.
- PR #26: MERGED.

### Continuity Semantics

- SELF_UPDATE_EQUIVALENT: INTEGRATED.
- Contrato canônico: `docs/agent-system/ORCHESTRATOR.md`.
- Resumo: a equivalência se aplica quando o único path versionado alterado
  entre `verified_sha` e `origin/main` é exatamente
  `docs/project-state-metodo-ori.md`.

### Runtime Validation

- AGENTS-2 runtime validation: COMPLETE.
- Automatic Render deployment: OBSERVED.
- deployment id: `5880227229`.
- deployment SHA: `4f9c75f720f894271d3a56c5828f88c83698bf2d`.
- production_environment: true.
- final state: success.
- health: HTTP 200, `{"ok":true}`.

## Regras Para Próxima Sessão

- Não usar `docs/ROADMAP-MASTER-METODO-ORI.md` como fonte operacional sem gate
  humano explícito.
- Não duplicar matrizes canônicas de skill; referenciar
  `docs/agent-system/SKILL-ROUTING.md`.
- Não instalar skills, plugins ou dependências sem autorização humana.
- Não fazer Git write sem gate humano para a ação exata.
- Não fazer deploy nem mutação de produção sem autorização humana explícita.
- Não acessar, imprimir ou persistir secrets.
- Em qualquer dúvida sobre SOURCE, TARGET, produção ou autorização: abortar e
  escalar.

## FOLLOW_UP

- Revalidar divergência `GEMINI_MODEL` entre produção real, roadmap,
  `render.yaml`, `.env.example` e fallbacks antes de qualquer mudança de IA.
- Executar auditoria final de continuidade de observabilidade (OBS-1–4) e, em
  seguida, reavaliar Marco C.
- Investigar `INFRA-RENDER-1`: comportamento observado de deployment Render em
  merges docs-only diverge do `buildFilter` versionado; inclui a disposição
  final pendente do Service B (`srv-d8bqgsel51nc73cjleg0`).
