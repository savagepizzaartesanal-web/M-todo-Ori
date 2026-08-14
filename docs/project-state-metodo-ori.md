# Project State — Método Ori

document_role: derived_operational_snapshot  
authoritative: false  
last_verified_at: `2026-08-14T12:33:20-03:00`  
verified_against: `origin/main`  
verified_sha: `74072b659bf8815e8c4ba5ffa459837eee732b7d`  
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
- PR #25 e PR #26 (observados como MERGED em `origin/main`).

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
- OBS-3: pendente — próxima ação obrigatória;
- OBS-4: pendente.

Próxima ação recomendada pelo roadmap:

**OBS-3 — read-only admin timeline endpoint para rastreio de venda/pagamento.**

OBS-2 deixa de bloquear a sequência. OBS-3 e OBS-4 continuam pendentes. Só
depois delas o Marco C pode ser reavaliado para fechamento. Marco C permanece
ABERTO.

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

## Roadmap Operacional Durável

- Seção 28.8 do roadmap operacional registra o closeout de OBS-2.
- Roadmap closeout PR: #29.
- Roadmap merge SHA / baseline corrente: `74072b659bf8815e8c4ba5ffa459837eee732b7d`.

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
- `/health/dependencies` existe no código e checa Supabase e IA, mas não
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
- `/health/dependencies` existe no código, mas OBS-4 Mercado Pago check em
  `/health/dependencies` segue pendente; o endpoint atual checa Supabase e IA,
  não Mercado Pago.
- AGENTS-2 / `ori-orchestrator`: COMPLETE. `ori-orchestrator` V1 está
  INTEGRATED IN MAIN via PR #25 (MERGED) e PR #26 (MERGED).
- `INFRA-RENDER-1`: OPEN. Merges em main, inclusive docs-only, têm disparado
  deployment Render, o que diverge do comportamento esperado a partir do
  `buildFilter` versionado (`backend/**`). Configuração LIVE exata do Render
  permanece NOT_VERIFIED. Divergência observada de identidade/URL dos
  serviços Render permanece não resolvida.
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
- Confirmar, quando OBS-4 for autorizado, o desenho exato do Mercado Pago check
  em `/health/dependencies` sem expor secrets nem criar mutação externa.
- Investigar `INFRA-RENDER-1`: comportamento observado de deployment Render em
  merges docs-only diverge do `buildFilter` versionado.
