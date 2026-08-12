# Metodo Ori — Codex Adapter

Este repositorio usa um sistema provider-neutral de agentes. Codex e
Claude sao adapters; a fonte canonica provider-neutral de skill routing e:

- `docs/agent-system/SKILL-ROUTING.md`

O adapter especifico do Codex, subordinado a essa politica e nao canonico, e:

- `docs/agent-system/CODEX-ADAPTER.md`

Papeis conceituais canonicos:

- `auditor-arquiteto`
- `implementador`
- `qa-revisor`
- `git-security-guard`
- `roadmap-guard`

## Guardrails Criticos

- Skill disponivel nao constitui autorizacao de escopo.
- Nunca expandir uma tarefa porque uma skill existe ou foi carregada.
- Nao instalar skills, plugins ou dependencias sem autorizacao humana.
- Nao fazer Git write sem gate humano explicito para a acao exata.
- Nao fazer deploy sem autorizacao humana explicita.
- Nao acessar, imprimir ou persistir secrets, tokens, passwords, API keys,
  cookies, JWTs ou credentials.
- Respeitar arquivos reservados definidos pela governanca do projeto.
- Python originado de `ui-ux-pro-max` permanece `BLOCKED_V1`.
- `web-design-guidelines` permanece `DEFERRED_V1` no adapter V1.
- Regras Next.js contidas em skills nao se tornam regras universais React.
- Em duvida sobre SOURCE, TARGET, producao ou autorizacao: abortar e escalar.

Nao duplicar aqui a matriz completa de routing; consultar a politica
canonica antes de qualquer uso de skill.
