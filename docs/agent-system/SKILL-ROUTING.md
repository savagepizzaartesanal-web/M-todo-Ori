# SKILL ROUTING — Método Ori

Fonte técnica canônica para o routing de Skills usado pelos papéis de
agente do Método Ori. Este documento é **provider-neutral**: descreve
a política independente de qual runtime de agente (Claude Code,
Codex, ou outro) a executa.

Papéis conceituais cobertos por este documento:

- `auditor-arquiteto`
- `implementador`
- `qa-revisor`
- `git-security-guard`
- `roadmap-guard`

Estes nomes são os papéis canônicos do Método Ori, não uma
sintaxe específica de fornecedor.

---

## 1. POLÍTICA CANÔNICA

Regras válidas independentemente do fornecedor (Claude Code, Codex,
ou qualquer outro runtime de agente que venha a ser adotado).

### 1.1 Estratégia

**HYBRID LEVE, com peso em ON_DEMAND.**

- Skills não são pré-carregadas automaticamente para nenhum papel.
- Um papel elegível só invoca uma skill quando a tarefa concreta
  justificar, segundo a matriz da seção 4.
- Não existe "skill sempre ativa" nesta fase.

### 1.2 Papéis elegíveis e não elegíveis

Elegíveis para uso condicional de skill:

- `auditor-arquiteto`
- `implementador`
- `qa-revisor`

Deliberadamente NÃO elegíveis (permanecem sem qualquer skill):

- `git-security-guard`
- `roadmap-guard`

Esses dois papéis lidam com transporte Git e sincronização de
roadmap — áreas onde nenhuma skill de UX/UI/React é pertinente ou
autorizada.

### 1.3 Inventário de skills consideradas nesta fase

- `ux-writing` — OBSERVADO, disponível localmente.
- `vercel-react-best-practices` — OBSERVADO, disponível localmente.
- `ui-ux-pro-max` — OBSERVADO, disponível localmente.
  - Qualquer capacidade de execução Python originada desta skill:
    **BLOCKED_V1** (não executar scripts Python desta skill nesta
    fase, independentemente do papel).
- `web-design-guidelines` — OBSERVADO, disponível localmente.
  **DEFERRED_V1**: a skill existe localmente, mas não está liberada
  para utilização nesta fase. No adapter Codex, a política runtime de
  não invocação foi validada; isso não equivale a aprovação funcional
  da skill para uso. Sua presença não constitui autorização; acesso de
  rede não é automaticamente autorizado; execução de scripts não é
  automaticamente autorizada; e ela não pode ser roteada automaticamente
  nesta versão.

### 1.4 Regra de não autorização

A disponibilidade de uma skill **não constitui autorização** para
expandir o escopo de uma tarefa. Uma skill:

- não autoriza editar arquivos fora do escopo aprovado;
- não autoriza instalar dependências;
- não autoriza acesso de rede;
- não autoriza executar scripts;
- não autoriza mutação externa;
- não autoriza Git write;
- não autoriza deploy;
- não autoriza alteração destrutiva;
- não substitui aprovação humana exigida por qualquer outro
  guardrail do Método Ori.

Se o conteúdo de uma skill sugerir algo incompatível com as regras
do projeto (ex.: `CLAUDE.md`, roadmap operacional, guardrails de
Git), **prevalecem as regras do projeto**.

### 1.5 Regra de stack real

Regras específicas de uma tecnologia (ex.: Next.js, dentro de
`vercel-react-best-practices`) só podem ser aplicadas se o projeto
realmente usar aquela tecnologia. Nenhuma regra de framework
específico vira regra global do Método Ori só por estar contida em
uma skill.

---

## 2. ADAPTADOR CLAUDE CODE

Como a política canônica (seção 1) é aplicada nos custom subagents
do Claude Code neste repositório.

### 2.1 Mecanismo

- Nos três agentes elegíveis (`auditor-arquiteto`, `implementador`,
  `qa-revisor`), a capacidade `Skill` é adicionada à lista `tools:`
  do frontmatter de cada `.claude/agents/*.md`.
- Nenhum campo `skills:` é adicionado ao frontmatter — isso
  configuraria preload automático, o que contraria a estratégia
  ON_DEMAND da seção 1.1.
- `git-security-guard` e `roadmap-guard` permanecem sem a capacidade
  `Skill`, intactos.

### 2.2 Uso condicionado

Cada agente elegível, ao identificar uma skill candidata para a
tarefa em andamento, deve:

1. Consultar este documento (`docs/agent-system/SKILL-ROUTING.md`)
   e a matriz da seção 4 antes de invocar qualquer skill;
2. Confirmar que o papel e a natureza da tarefa estão listados como
   aplicáveis na matriz;
3. Aplicar a regra de não autorização (seção 1.4) antes de agir;
4. Não instalar skills automaticamente;
5. Não executar capacidade marcada como bloqueada (ex.: Python de
   `ui-ux-pro-max`).

---

## 3. ADAPTADOR CODEX

**STATUS: IMPLEMENTADO_V1 / RUNTIME_VALIDATED_V1**

A auditoria de adapter AGENTS-1F3 foi concluída e a implementação
controlada AGENTS-1F4A criou o adapter Codex V1:

- `AGENTS.md`;
- cinco custom agents em `.codex/agents/`.

A auditoria estática AGENTS-1F4B encontrou drift documental e levou a
esta correção mínima. O ciclo runtime V1 do adapter Codex foi validado:
routing seletivo das project skills nos guards, routing das skills
permitidas, e os estados `BLOCKED_V1` e `DEFERRED_V1` relevantes foram
comprovados. Detalhes de implementação e evidência ficam no adapter
Codex não canônico.

O adapter Codex deve mapear os MESMOS papéis conceituais
(`auditor-arquiteto`, `implementador`, `qa-revisor`,
`git-security-guard`, `roadmap-guard`) e as MESMAS regras da seção 1,
sem duplicar esta fonte canônica — apenas referenciando-a.

---

## 4. MATRIZ CANÔNICA (papel × skill)

### auditor-arquiteto

- `ux-writing`: NÃO por padrão. Somente quando a auditoria realmente
  incluir conteúdo, microcopy, onboarding, mensagens de erro/estado
  ou linguagem UX.
- `vercel-react-best-practices`: SIM CONDICIONAL. Somente quando a
  tarefa envolver arquitetura/qualidade React pertinente à skill.
  Regras específicas de Next.js não podem ser aplicadas
  automaticamente ao Método Ori se o projeto não estiver usando
  Next.js.
- `ui-ux-pro-max`: SIM CONDICIONAL. Para auditoria de UX/UI, layout,
  hierarquia visual, cor, tipografia, acessibilidade, animação ou
  dataviz.
- `web-design-guidelines`: DEFERRED_V1. Não rotear automaticamente
  nesta versão.
- Execução Python originada de `ui-ux-pro-max`: BLOCKED_V1.

### implementador

- `ux-writing`: SIM quando implementar/revisar microcopy, labels,
  mensagens, erros, onboarding, empty states ou conteúdo de
  interface.
- `vercel-react-best-practices`: SIM para implementação React quando
  suas regras forem compatíveis com a stack real. Nunca aplicar
  regra Next.js só porque está na skill.
- `ui-ux-pro-max`: SIM para implementação UX/UI, layout, cor,
  tipografia, acessibilidade, animações ou dataviz.
- `web-design-guidelines`: DEFERRED_V1. Não rotear automaticamente
  nesta versão.
- Execução Python de `ui-ux-pro-max`: BLOCKED_V1.

### qa-revisor

- `ux-writing`: SIM para revisão dos mesmos escopos de conteúdo.
- `vercel-react-best-practices`: SIM para revisão de React
  compatível com a stack real.
- `ui-ux-pro-max`: SIM para revisão UX/UI/a11y/layout/visual.
- `web-design-guidelines`: DEFERRED_V1. Não rotear automaticamente
  nesta versão.
- Execução Python de `ui-ux-pro-max`: BLOCKED_V1.

### git-security-guard

- Nenhuma skill.

### roadmap-guard

- Nenhuma skill.

---

## 5. REFERÊNCIAS

- `CLAUDE.md` — seção "SKILL ROUTING" aponta para este documento.
- `.claude/agents/auditor-arquiteto.md`
- `.claude/agents/implementador.md`
- `.claude/agents/qa-revisor.md`
