# Project Context — Método Ori

document_role: derived_continuity_context  
authoritative: false

Documento sintético para orientar Project ChatGPT. Ele resume contexto estável
do repositório e referencia fontes versionadas; não substitui o roadmap
operacional nem valida estado de produção em tempo real.

Este documento é derivado de fontes versionadas e não tem autoridade para
sobrescrever roadmap, Git, runtime ou governança canônica.

## Identidade

O Método Ori é um sistema de integração identitária. A proposta central é
traduzir essência, corpo, cor, cabelo, rotina e presença em uma linguagem visual
coerente, funcional e aplicável à vida real.

A jornada conceitual segue:

```text
RECONHECER -> INTEGRAR -> APLICAR
Produto 1 -> Produto 2 -> Produto 3
```

O produto busca reduzir fragmentação, excesso de informação e decisões por
imitação, insegurança ou tentativa e erro. A direção visual preservada no
roadmap inclui identidade cosmoancestral, noite/vinho, dourado/cobre,
pergaminho, textura editorial, geometrias/constelações e fonte Inter no estado
atual.

## Arquitetura

Stack observada nas fontes versionadas:

- frontend React + Vite + React Router em `metodo-ori/`;
- backend FastAPI em `backend/`;
- Supabase para autenticação, banco/PostgREST e Storage;
- Mercado Pago Checkout Pro para pagamentos;
- Gemini como provider de IA ativo;
- Cloudflare Pages para frontend de produção;
- Render Starter/Docker para backend de produção.

Fluxo oficial documentado:

```text
Usuária
-> Cloudflare Pages
-> Render / FastAPI
-> Supabase
-> Mercado Pago Checkout Pro
-> Gemini
```

O domínio oficial documentado é `https://metodoori.teluricabeleza.com`. O
backend versionado declara health check em `/health`, e o código também expõe
`/health/dependencies`.

## Produtos

Produto 1, Código das Deusas, é a primeira camada comercial. A estrutura vigente
é freemium: três primeiras camadas gratuitas (`reconhecimento`, `essencia`,
`dinamica`) e paywall a partir de `vidaReal`. O entitlement pago esperado é
`clientes.produto_1_completo_liberado = true`; `produto_1_liberado` representa
acesso básico/freemium.

Produto 2, Dossiê ORI, é a etapa de integração. O repositório contém fluxo
funcional de coleta/revisão, upload de fotos e painel administrativo, mas a
política comercial da RC1 mantém o Produto 2 como próxima etapa narrativa/em
preparação, sem checkout público.

Produto 3, Código Final, é a etapa de aplicação. O repositório contém fundação
backend e API frontend, mas a experiência cliente está incompleta; a página
vigente é selada/explicativa e não deve ser tratada como venda ativa.

Bundle/Jornada Completa só deve ser considerado após P1, P2 e P3 estarem
comercialmente estáveis. Não há checkout, pricing nem entitlement composto
vigente para Bundle.

## Governança

A fonte operacional corrente é `docs/ROADMAP-PRODUCAO-METODO-ORI.md`.
`docs/ROADMAP-MASTER-METODO-ORI.md` não deve ser usado como fonte operacional
sem autorização humana específica.

Princípios de trabalho preservados:

- diagnosticar antes de mudar;
- executar uma tarefa escopada por vez;
- declarar resultado verificável quando houver gate;
- não expandir escopo;
- distinguir OBSERVADO, INFERIDO e NÃO VERIFICADO;
- parar diante de estado inesperado;
- não alterar produção, Git ou dependências sem gate humano explícito.

Arquivos locais/reservados e checkpoints históricos não devem ser alterados
automaticamente. Mudanças pequenas, sequenciais e verificáveis são preferidas.

## Agentes E Skills

O projeto usa papéis conceituais provider-neutral:

- `auditor-arquiteto`;
- `implementador`;
- `qa-revisor`;
- `git-security-guard`;
- `roadmap-guard`.

A fonte canônica de routing de skills é
`docs/agent-system/SKILL-ROUTING.md`. `AGENTS.md` é a entrada do adapter Codex,
e `docs/agent-system/CODEX-ADAPTER.md` documenta o adapter Codex não canônico.

Regras estáveis:

- skills são ON_DEMAND, nunca pré-carregadas como autorização ampla;
- skill disponível não amplia escopo;
- `git-security-guard` e `roadmap-guard` não usam skills;
- `web-design-guidelines` permanece `DEFERRED_V1`;
- Python originado de `ui-ux-pro-max` permanece `BLOCKED_V1`;
- regras específicas de Next.js só se aplicam quando a stack real confirmar
  Next.js.

Não duplicar a matriz canônica de skills em documentos derivados; referenciar
`docs/agent-system/SKILL-ROUTING.md`.

## Segurança E Dados

Nunca imprimir, persistir ou solicitar secrets: tokens, passwords, PATs, API
keys, JWTs, cookies, connection strings, `service_role`, publishable keys reais
ou credenciais. Documentos podem registrar nomes de variáveis de ambiente, não
valores.

Supabase armazena dados de autenticação, clientes, respostas, pagamentos,
dossiês, código final e Storage. As tabelas financeiras não devem ser acessadas
diretamente pelo frontend; consultas da cliente passam por endpoints FastAPI
autenticados. O backend deve conceder entitlements somente após confirmação
confiável do provider.

Pagamentos usam Mercado Pago com webhook assinado e trilha idempotente. Payloads
de eventos devem ser sanitizados antes de persistência/log quando aplicável.

## Continuidade Operacional

O roadmap registra P1 como produção comercial ativa, mas a continuidade do
projeto depende de revalidação temporal sempre que a decisão for operacional.
Há runbooks e documentação de infraestrutura para Cloudflare, Render, Supabase,
Mercado Pago e recovery, mas ações em produção exigem autorização humana
explícita.

Manter separação entre:

- contexto durável de produto/arquitetura;
- estado operacional atual;
- hipóteses futuras;
- dívidas técnicas;
- bugs confirmados;
- decisões comerciais.

## Este documento NÃO é fonte suficiente para determinar o estado atual do projeto

Este documento é contexto estável e deliberadamente não é changelog, gate de
release nem fonte operacional final. Para determinar estado atual, próxima ação,
bloqueadores, produção ou divergências temporais, consultar no mínimo:

- `docs/ROADMAP-PRODUCAO-METODO-ORI.md`;
- `docs/infraestrutura-producao.md`;
- `docs/status-produtos.md`;
- `docs/pagamentos-g1.md`;
- `docs/agent-system/SKILL-ROUTING.md`;
- `docs/agent-system/CODEX-ADAPTER.md`;
- `render.yaml`;
- código versionado relevante para o fato em análise.
