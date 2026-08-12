# Método Ori — Regras de Trabalho

## Fonte operacional

O documento operacional corrente é:

`docs/ROADMAP-PRODUCAO-METODO-ORI.md`

`docs/ROADMAP-MASTER-METODO-ORI.md`: não usar como fonte operacional
até autorização humana específica.

## Princípios obrigatórios

**A. Diagnose before change.**
Antes de qualquer implementação relevante: entender estado atual e
evidência real, não suposição.

**B. One scoped task at a time.**
Executar somente o escopo explicitamente aprovado. Nunca antecipar
a próxima etapa sozinho.

**C. PASS criterion.**
Toda etapa deve ter um resultado esperado verificável, declarado
antes de começar.

**D. Secrets.**
Nunca imprimir, persistir ou solicitar em chat: tokens, passwords,
PATs, API keys, JWTs, cookies, connection strings, `service_role`,
`anon key` real, GPG passphrases.

**E. Production.**
Nenhuma mutação de produção sem gate humano explícito.

**F. Git.**
Por padrão NÃO usar: force push, `reset --hard`, `clean`, rebase
destrutivo, admin bypass, squash quando merge commit tiver sido
definido, deleção de branch — sem autorização humana específica.

**G. No scope expansion.**
Nunca "aproveitar" para corrigir algo fora da tarefa aprovada.

**H. Historical evidence.**
Não editar retroativamente checkpoints/gates históricos apenas para
refletir estado novo. Criar gate novo ou atualizar somente o estado
corrente.

**I. Evidence language.**
Distinguir claramente: OBSERVADO / INFERIDO / NÃO VERIFICADO.

**J. Stop on unexpected state.**
Se o estado real divergir do precheck: PARAR. Não corrigir
automaticamente.

## Workflow padrão

```
Diagnóstico
↓
aprovação humana
↓
implementação
↓
QA
↓
aprovação humana
↓
Git/PR
↓
merge
↓
roadmap, quando aplicável
```

## Git staging

Nunca usar `git add .` ou `git add -A` em tarefas de escopo
controlado. Preferir paths explícitos, sempre.

## Arquivos locais/reservados atuais

Nunca adicionar automaticamente:

- `.agents/`
- `.claude/settings.json`
- `.claude/settings.local.json`
- `skills-lock.json`
- `docs/ROADMAP-MASTER-METODO-ORI.md`
- `docs/checkpoint-status-pos-rc1.md`

**Importante:** `.claude/agents/*.md`, quando explicitamente criados
e aprovados nesta frente, não entram nessa proibição.

## SKILL ROUTING

Skills são usadas sob demanda (ON_DEMAND), nunca pré-carregadas.
A política canônica, provider-neutral, está em:

`docs/agent-system/SKILL-ROUTING.md`

Apenas `auditor-arquiteto`, `implementador` e `qa-revisor` podem
usar `Skill`. `git-security-guard` e `roadmap-guard` não podem.

Skill disponível não constitui autorização de escopo — as regras
deste documento e os guardrails de cada agente prevalecem sempre.

## Comunicação

Relatórios técnicos devem terminar com `PASS` ou `BLOCKED` quando a
tarefa possuir gate. Nunca apresentar inferência como evidência.
