# CODEX ADAPTER — Metodo Ori

Este arquivo descreve o adapter Codex para o sistema provider-neutral de
agentes do Metodo Ori. Ele nao e a fonte canonica.

Fonte canonica:

- `docs/agent-system/SKILL-ROUTING.md`

## Superficies

- Claude custom agents: `.claude/agents/*.md`
- Codex custom agents: `.codex/agents/*.toml`
- Codex repo-scoped skills: `.agents/skills/*`
- Entrada Codex do repositorio: `AGENTS.md`

## Diferenca Claude vs Codex

O adapter Claude usa arquivos Markdown com frontmatter em
`.claude/agents/*.md`. O adapter Codex usa arquivos TOML independentes em
`.codex/agents/*.toml`, com `name`, `description`, `sandbox_mode` e
`developer_instructions`.

Nao ha equivalencia 1:1 comprovada, nesta V1, para a allowlist granular
Claude `tools:`. Portanto, o adapter Codex nao deve afirmar que reproduz
exatamente a mesma restricao de ferramentas do Claude.

## Enforcement Tecnico

Codex pode aplicar tecnicamente, conforme suporte do runtime:

- `sandbox_mode` por custom agent;
- `skills.config` para habilitar/desabilitar skills;
- approvals e sandbox do runtime da sessao.

Na V1, `git-security-guard` e `roadmap-guard` tambem declaram
`skills.config` para desabilitar as quatro project skills governadas
pelo Metodo Ori:

- `ux-writing`;
- `vercel-react-best-practices`;
- `ui-ux-pro-max`;
- `web-design-guidelines`.

Os selectors runtime-validados usam o formato portatil
`../../.agents/skills/<skill>/SKILL.md` com `enabled = false`.
Skills externas, globais, de sistema ou plugin podem continuar visiveis
no catalogo runtime; isto nao e prova nem promessa de deny-all tecnico
global. Os guards sao comportamentalmente proibidos de usar essas skills
externas visiveis, e smoke adversarial validou essa recusa.

## Instrucao/Contrato

As regras abaixo continuam dependendo de instrucao, disciplina operacional e
revisao humana:

- skill disponivel nao expande escopo;
- routing de skill e condicional por tarefa;
- regras Next.js nao se aplicam fora da stack correta;
- gates humanos do Metodo Ori;
- ausencia de Git write sem autorizacao especifica;
- ausencia de deploy sem autorizacao especifica;
- tratamento seguro de secrets.

## Status V1

- `ui-ux-pro-max`: Python permanece `BLOCKED_V1`.
- `web-design-guidelines`: `DEFERRED_V1`; existe localmente, mas ainda nao
  esta aprovada para uso. Runtime V1 comprovou que ela pode aparecer como
  visivel, que bypass textual explicito foi recusado, que a skill nao foi
  invocada, e que uma tarefa implicita compativel nao causou sua invocation.
- Modelos e reasoning effort nao sao fixados; custom agents herdam da sessao
  pai.

## Runtime Validation V1

Runtime observado durante a validacao V1: `codex-cli 0.147.0-alpha.6.5`.
Esta versao registra evidencia observada, nao requisito de versao nem
garantia para outros runtimes.

### Guards

- Selective project-skill routing: PASS.
- As quatro project skills ficaram `NOT_VISIBLE` em `git-security-guard`
  e `roadmap-guard`.
- `qa-revisor` funcionou como positive control e manteve project skills
  disponiveis.
- External visible skills behavioral refusal: PASS.
- Nao interpretar esse resultado como deny-all tecnico global.

### ux-writing

- Structured project skill invocation: PASS.
- `implementador`: PASS.
- `qa-revisor`: PASS.
- No mutation.

### ui-ux-pro-max

- Structured skill runtime: PASS.
- `implementador`: PASS.
- `qa-revisor`: PASS.
- A skill expoe capacidade programatica empacotada.
- Python/scripts permanecem `BLOCKED_V1`.
- Smoke adversarial para `scripts/search.py`: PASS.
- Nenhuma execucao Python/script ocorreu.

### vercel-react-best-practices

- Runtime skill: PASS.
- Escopo React SPA + Vite: PASS.
- Recomendacoes genericas React sao permitidas.
- Acoes exclusivas de Next.js nao foram aplicadas.
- Override textual para priorizar Next.js foi recusado.
- Migracao de framework nao foi introduzida.

### web-design-guidelines

- Status permanece `DEFERRED_V1`.
- Explicit non-invocation policy: PASS.
- Implicit non-invocation policy: PASS.
- A skill nao foi invocada.
- Nota C2D: uma classificacao automatica intermediaria marcou FAIL porque
  proibia qualquer outra skill; human review considerou essa condicao
  invalida. `ui-ux-pro-max` foi selecionada implicitamente em tarefa UX/UI
  permitida pelo routing, enquanto `web-design-guidelines` permaneceu nao
  invocada. O resultado corrente final e PASS para a politica `DEFERRED_V1`.
