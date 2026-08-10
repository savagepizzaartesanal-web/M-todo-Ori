# Runbook De Recuperacao Operacional — Metodo Ori

Este documento e escrito para um operador tecnico do Metodo Ori em um
incidente real de producao. Nao pressupoe que o operador participou de
nenhuma auditoria anterior. As evidencias citadas neste documento foram
validadas tecnicamente durante RECOVERY-1, RECOVERY-2 e RECOVERY-3 antes
de serem consolidadas no runbook.

Este documento nao contem nenhuma credencial, token, chave ou secret.

**Ponto de entrada humano:** para quem precisa de um guia rapido em
linguagem simples durante um incidente real, comecar por
[`docs/MANUAL-RECOVERY-METODO-ORI.md`](./MANUAL-RECOVERY-METODO-ORI.md)
— este runbook e o `docs/RUNBOOK-RECOVERY-DADOS-SUPABASE.md` sao os
documentos tecnicos de referencia que o manual aponta.

---

## 1. Escopo

Cobre recuperacao operacional de:

- frontend em Cloudflare Pages;
- backend em Render;
- inconsistencia de pagamento → entitlement (Produto 1);
- fallback de codigo via Git revert;
- fronteira com dados/Supabase (aponta para RECOVERY-1, nao duplica).

Nao cobre:

- criacao de infraestrutura nova;
- migrations de banco;
- observabilidade automatizada (ainda nao existe — ver secao 21);
- qualquer acao destrutiva ou nao reversivel sem escalonamento.

---

## 2. CHECKLIST DE EMERGENCIA

Sequencia rapida. Cada passo linka a secao detalhada correspondente.

1. **Registrar data/hora** do incidente — ver [Evidencias obrigatorias](#17-evidencias-obrigatorias-do-incidente).
2. **Identificar o impacto** observado (o que exatamente parou de funcionar, para quem).
3. **NAO alterar nada ainda.** Nenhuma acao de rollback, deploy ou config antes de classificar o incidente.
4. **Identificar a camada afetada** — ver [Classificacao rapida](#5-classificacao-rapida-do-incidente) e [Arvore de decisao](#6-arvore-de-decisao).
5. **Confirmar deployment/config atual** de cada plataforma envolvida — ver [Regra de ouro](#4-regra-de-ouro-antes-de-agir) (P0 Runtime Stop/Gate).
6. **Verificar se banco/schema esta envolvido** — ver [Banco / Supabase](#10-banco--supabase). Se sim, pare e siga essa secao antes de qualquer rollback de codigo.
7. **Escolher SOMENTE um mecanismo de contencao** por vez, conforme a camada afetada — ver [Frontend / Cloudflare Pages](#7-frontend--cloudflare-pages), [Backend / Render](#8-backend--render) ou [Fallback Git](#9-fallback-git). Nunca executar dois mecanismos ao mesmo tempo (guardrail, secao 20).
8. **Executar o smoke correspondente** — ver [Smoke pos-recuperacao](#15-smoke-pos-recuperacao).
9. **Registrar o resultado** (PASS/FAIL/ABORT — secao 16) na evidencia do incidente (secao 17).
10. **Iniciar a remediacao permanente** somente depois da contencao — ver [Pos-incidente / remediacao permanente](#18-pos-incidente--remediacao-permanente).

---

## 3. Sistemas de producao

- **Frontend**: Cloudflare Pages, projeto `metodo-ori-telurica`, producao a partir da branch `main`. Dominio oficial `https://metodoori.teluricabeleza.com`; dominio tecnico `https://metodo-ori-telurica.pages.dev`. Deploy via GitHub Actions (`.github/workflows/deploy-metodo-ori.yml`), disparado por push em `main` que toque `metodo-ori/**` ou o proprio workflow.
- **Backend**: Render, servico `metodo-ori-api`, branch `main`, gerenciado via Blueprint (`render.yaml`). Runtime Docker (`backend/Dockerfile`, contexto `backend`). Build Filter `backend/**`. Health check `GET /health`. Auto-Deploy observado: On Commit.
- **Dados**: Supabase (autenticacao, banco/PostgREST, storage). Nao coberto operacionalmente por este runbook alem da fronteira descrita na secao 10 — o procedimento de backup/restore em si e do RECOVERY-1 (ver gap explicito na secao 22).
- **Pagamento**: Mercado Pago (Checkout Pro), com reconciliacao administrativa via `POST /api/admin/payments/reconcile` (RECOVERY-2).
- **IA**: Gemini, provider externo configurado via `AI_PROVIDER`/`GEMINI_MODEL`/`GEMINI_API_KEY`.

---

## 4. Regra de ouro antes de agir

> **ANTES DE QUALQUER ROLLBACK NATIVO (Cloudflare ou Render):**
>
> - identificar o deployment atualmente ativo;
> - identificar inequivocamente o deployment-alvo do rollback;
> - confirmar que o alvo e anterior e estava saudavel (ex. status "success", nunca um deployment que falhou);
> - registrar os IDs/SHAs disponiveis na evidencia do incidente;
> - verificar se ha incompatibilidade de banco/schema envolvida (secao 10);
> - verificar se o rollback parcial (so uma camada) quebra o contrato frontend/backend.
>
> **Se qualquer item essencial nao puder ser confirmado com certeza:**
>
> ```
> ABORTAR ROLLBACK
> → ESCALAR
> ```

Classificacao: **P0 RUNTIME STOP/GATE**. Isso nao e uma sugestao — e uma condicao de parada obrigatoria antes de qualquer acao de rollback nativo.

---

## 5. Classificacao rapida do incidente

Responda em ordem, pare no primeiro "sim":

1. Frontend indisponivel (dominio nao responde / shell nao carrega)? → secao 7 (Cloudflare), use a [arvore de decisao](#6-arvore-de-decisao).
2. Backend `/health` falha? → secao 8 (Render).
3. Erro funcional sem indisponibilidade (tudo "up", comportamento errado)? → secao 18 (Pos-incidente / remediacao permanente) para o criterio de contencao vs. remediacao, e secao 7 ou 8 conforme a camada afetada.
4. Pagamento aprovado com entitlement ausente ou inconsistente? → secao 11 (payment/entitlement), distinguindo CASE REPAIR de ACTIVE INCIDENT.
5. Migration/schema/dados envolvidos? → secao 10 (banco/Supabase) — pare antes de qualquer rollback de codigo.
6. Variavel de ambiente/configuracao alterada incorretamente? → secao 12.
7. Problema de dominio/DNS? → secao 13.
8. Provider externo (Supabase, Mercado Pago, Gemini) indisponivel? → secao 14.

---

## 6. Arvore de decisao

```
INCIDENTE DETECTADO
│
├─ Frontend indisponivel?
│    │
│    ├─ A) custom domain falha + pages.dev funciona
│    │      → suspeitar de DNS / binding do custom domain / certificado.
│    │      → NAO fazer rollback de deploy automaticamente.
│    │      → verificar configuracao de DNS/custom domain no painel Cloudflare.
│    │
│    ├─ B) custom domain falha + pages.dev tambem falha
│    │      → suspeitar de deployment ruim no projeto, ou outage mais
│    │        amplo da plataforma Cloudflare.
│    │      → investigar o deployment atualmente ativo e o status
│    │        publico da Cloudflare antes de decidir.
│    │
│    └─ C) ambos os dominios respondem + shell/app quebra
│           → investigar assets/build/API/erro funcional (runtime),
│             nao dominio/DNS.
│           → rollback pode ser aplicavel se regressao recente
│             for confirmada (ver secao 18, Pos-incidente / remediacao
│             permanente).
│
├─ Backend /health falha?
│    → 1a verificacao: GET /health.
│    → SE isto ocorreu durante um deploy novo em andamento: o Render usa
│      o health check antes de colocar a nova instancia em trafego; se o
│      novo deploy nao atingir estado saudavel, o proprio deploy pode ser
│      cancelado e a versao anterior pode continuar servindo — confirmar
│      esse estado antes de agir, nao presumir.
│    → SE a instancia antiga nao esta mais servindo (deploy novo ja
│      promovido e nao saudavel): rollback nativo Render (contencao)
│      apos a Regra de Ouro (secao 4).
│    → SE /health de uma versao ja live falhar posteriormente (nao
│      durante um deploy novo): investigar normalmente causa em
│      provider/config/runtime (secoes 12/14) — nao presumir que o
│      mecanismo de deploy ja resolveu o problema sozinho.
│
├─ Erro funcional sem indisponibilidade?
│    → reproduzir o fluxo afetado sem dados sensiveis reais.
│    → identificar se e frontend, backend, ou ambos.
│    → se regressao de deploy recente comprovada e rollback seguro
│      (ver secao 18, Pos-incidente / remediacao permanente): contencao
│      via rollback nativo da plataforma afetada (secao 7 ou 8).
│    → senao, ou apos a contencao: git revert como remediacao
│      permanente (secao 9, Fallback Git).
│    → se envolve pagamento/entitlement: secao 11 (payment).
│
├─ Pagamento/entitlement inconsistente?
│    → confirmar no Mercado Pago que o pagamento esta de fato aprovado.
│    → NAO corrigir manualmente no banco.
│    → CASE REPAIR: usar POST /api/admin/payments/reconcile (secao 11).
│    → ACTIVE INCIDENT (multiplos casos novos): identificar/estancar
│      causa primeiro, sempre escalar.
│
├─ Banco/schema envolvido?
│    → NAO reverter codigo automaticamente.
│    → seguir secao 10 (Banco/Supabase) antes de qualquer outra acao.
│    → sempre escalar para intervencao manual coordenada.
│
├─ Env/config alterada incorretamente?
│    → identificar o que mudou recentemente na plataforma (nao no Git).
│    → corrigir a config diretamente onde foi alterada (secao 12).
│    → rollback de deploy NAO e a acao correta aqui.
│
├─ DNS/dominio?
│    → NAO alterar sem registrar o estado anterior (secao 13).
│    → sempre escalar — DNS nao tem rollback via Git/deploy.
│
└─ Provider externo indisponivel?
     → NAO reverter codigo — causa e externa (secao 14).
     → verificar status publico do provider, se disponivel.
     → aguardar/escalar.
```

Nenhum comando destrutivo esta incluido neste runbook fora dos comandos de leitura/diagnostico explicitamente marcados como tal.

---

## 7. Frontend / Cloudflare Pages

**Fatos confirmados:**

- Projeto: `metodo-ori-telurica`.
- Branch de producao: `main`.
- Dominio custom: `https://metodoori.teluricabeleza.com`.
- Dominio tecnico: `https://metodo-ori-telurica.pages.dev`.
- Deploy: GitHub Actions, workflow `.github/workflows/deploy-metodo-ori.yml`, disparado por push em `main` tocando `metodo-ori/**` ou o proprio workflow.
- Mecanismo nativo de rollback: **"Rollback to this deployment"**, disponivel no historico de deployments de Producao do projeto.

**Regras:**

- o deployment-alvo do rollback precisa ser um deployment de **Producao** anterior e saudavel — um **preview deployment nunca e um alvo valido** de rollback de producao;
- registrar o ID do deployment atual (ruim) e do deployment-alvo (bom) antes de agir (Regra de Ouro, secao 4);
- rollback nativo Cloudflare e **CONTENCAO** — visa conter a regressao retornando a aplicacao a um deployment anterior, mas **nao remove o commit ruim de `main`**; so considerar a contencao efetiva apos o smoke (secao 15) dar PASS;
- a remediacao apos a contencao depende da causa confirmada, nao e automatica: **SE** a causa confirmada era regressao de codigo/deploy → realizar a remediacao permanente via Git (secao 9); **SE** a causa era DNS/binding/certificado/provider/config → seguir a remediacao correspondente a essa causa (secoes 12/13/14) e **nao criar um revert Git automaticamente** (ver secao 18);
- deployment IDs eventualmente citados neste documento (ou em anexos futuros) sao **evidencia historica**, nunca valores permanentes ou referencia atual — sempre confirmar o deployment real no momento do incidente.

**Procedimento (via dashboard Cloudflare Pages — nao executar fora de um incidente real):**

*ANTES*
1. cumprir integralmente o P0 Runtime Stop/Gate (secao 4);
2. identificar qual deployment esta marcado como Production atualmente (o suspeito de estar ruim);
3. identificar o deployment de Production anterior, saudavel, que sera o alvo;
4. registrar os IDs/SHAs disponiveis de ambos na evidencia do incidente (secao 17);
5. confirmar que nao ha incompatibilidade de banco/API pendente que dependa do deploy que sera revertido (secao 10).

*ACAO*
6. abrir Cloudflare Pages → projeto `metodo-ori-telurica` → Deployments;
7. abrir o menu do deployment de Producao anterior escolhido no passo 3;
8. confirmar que a opcao **"Rollback to this deployment"** esta presente para esse deployment;
9. revisar uma ultima vez o alvo atual (ruim) vs. o alvo anterior (bom) antes de confirmar;
10. executar a acao somente apos todas as pre-condicoes do P0 Runtime Stop/Gate estarem atendidas.

*DEPOIS*
11. aguardar a conclusao da acao e confirmar status de sucesso no proprio dashboard;
12. executar o smoke da secao 15;
13. registrar PASS/FAIL/ABORT na evidencia do incidente (secao 16/17);
14. se a causa raiz era codigo, iniciar a remediacao permanente via Git (secao 9/18).

Nenhuma acao desta lista foi executada neste runbook — e um procedimento a ser seguido durante um incidente real.

---

## 8. Backend / Render

**Fatos confirmados:**

- Servico: `metodo-ori-api`.
- Branch: `main`, gerenciado via Blueprint (`render.yaml`).
- Build Filter: `backend/**`.
- Dockerfile: `backend/Dockerfile`, contexto `backend`.
- Health check: `GET /health`.
- Auto-Deploy observado: **On Commit**.

**Mecanismos disponiveis, sem generalizar comportamento nao validado:**

| Mecanismo | Efeito | Cria novo deployment? | Estado do Auto-Deploy |
|---|---|---|---|
| **Dashboard Rollback** | Reutiliza artifact ja buildado do deployment-alvo | Sim | **Desabilita automaticamente** |
| **API Rollback** | Reutiliza artifact ja buildado (mesma mecanica) | Sim | **NAO desabilita automaticamente** |
| **Dashboard "Deploy a specific commit"** | Rebuild completo a partir do commit escolhido | Sim | **Desabilita automaticamente** |
| **Restart service** | Reinicia o processo, sem alterar codigo/build | Nao | Nao se aplica — nao e rollback |
| **Clear build cache & deploy** | Rebuild do commit atual sem cache | Sim (do commit atual) | Nao e rollback — ferramenta de diagnostico de build |

Nenhum comportamento de API/CLI alem do listado acima foi validado — nao generalizar.

**Apos qualquer acao no Render: verificar explicitamente o estado do Auto-Deploy antes de considerar o incidente contido.** Se o rollback foi feito via API (que nao desabilita Auto-Deploy automaticamente), um push subsequente na branch vinculada pode reintroduzir a versao problematica se o Git ainda nao tiver sido corrigido.

**Procedimento preferencial (via dashboard Render — nao executar fora de um incidente real):**

O caminho de **Dashboard Rollback** e o preferencial deste runbook porque foi o mecanismo visualmente validado para operacao humana durante o RECOVERY-3. O **API Rollback** permanece registrado apenas como nota tecnica (ver tabela acima) — nao e o caminho operacional preferencial aqui, justamente por nao desabilitar o Auto-Deploy automaticamente, o que exige um passo manual extra de verificacao que o caminho de dashboard ja cobre por padrao.

*ANTES*
1. cumprir integralmente o P0 Runtime Stop/Gate (secao 4);
2. confirmar que o servico afetado e de fato `metodo-ori-api`;
3. confirmar que a branch envolvida e `main`;
4. identificar o deployment atualmente ativo;
5. identificar o deployment anterior, saudavel, que sera o alvo;
6. registrar os SHAs/deployments envolvidos na evidencia do incidente (secao 17);
7. confirmar a fronteira com banco/schema (secao 10) antes de prosseguir.

*ACAO*
8. usar **Rollback** (dashboard) do deployment anterior identificado no passo 5, somente se todas as pre-condicoes acima estiverem atendidas.

*DEPOIS*
9. aguardar o novo deployment ficar live/healthy;
10. verificar `GET /health` = 200;
11. verificar explicitamente o estado do Auto-Deploy (deve estar desabilitado apos um Dashboard Rollback — confirmar, nao presumir);
12. executar o smoke da secao 15;
13. registrar PASS/FAIL/ABORT na evidencia do incidente (secao 16/17);
14. se a regressao era de codigo, iniciar a remediacao permanente via Git (secao 9/18) **antes** de reativar o Auto-Deploy — ver regra abaixo.

**Regra explicita — Auto-Deploy apos Dashboard Rollback:**

> Apos um Dashboard Rollback, o Auto-Deploy fica desabilitado. **Enquanto `main` ainda contiver o commit ruim, NAO reativar o Auto-Deploy.** Reativa-lo nesse estado permite que o proximo push nessa branch reintroduza automaticamente o deployment defeituoso.
>
> Sequencia correta:
> 1. produzir a branch de revert/fix (secao 9);
> 2. revisar e testar a remediacao;
> 3. mergear a remediacao em `main` (PR + MERGE COMMIT);
> 4. somente depois que `main` estiver novamente em estado bom: decidir deliberadamente como publicar a remediacao, restaurar o Auto-Deploy de forma controlada, confirmar que o deployment correto foi publicado, executar o smoke (secao 15), e registrar o estado final do Auto-Deploy na evidencia do incidente.
>
> **Nunca seguir a sequencia** `rollback → reativar Auto-Deploy → main ainda ruim` — isso pode reintroduzir o deployment defeituoso automaticamente.

**Restart service** e **Clear build cache & deploy** permanecem, como ja registrado na tabela acima, ferramentas operacionais gerais — **nao sao rollback** e nao substituem este procedimento.

Nenhuma acao desta lista foi executada neste runbook.

---

## 9. Fallback Git

Mecanismo operacional, em ordem:

1. `git fetch origin main` — nunca depender de uma `main` local potencialmente desatualizada;
2. registrar `git rev-parse origin/main` na evidencia do incidente (secao 17);
3. criar a branch de recuperacao a partir de `origin/main` (nunca de uma `main` local nao atualizada) — **nunca reverter direto em `main`**;
4. identificar o merge commit ruim;
5. inspecionar os parents desse merge commit (`git show --no-patch --pretty=raw <merge_commit>`);
6. identificar qual parent e a mainline correta (o estado de `main` **antes** do merge problematico) — **isso deve ser determinado a cada incidente a partir dos parents reais, nunca assumido**;
7. executar o revert do merge na branch nova, usando o numero de parent da mainline identificada no passo 6 (forma conceitual: `git revert -m <numero_do_parent_mainline> <merge_commit>` — o exemplo mais comum e `-m 1`, mas **isso nao e universal**; sempre confirmar pelos parents reais);
8. revisar os arquivos afetados pelo revert antes de prosseguir;
9. `git diff --check` sobre o revert;
10. rodar a suite de testes relevante/completa;
11. abrir PR, com revisao humana do diff antes do merge;
12. merge via **MERGE COMMIT** (nunca squash/rebase/admin/bypass);
13. deploy normal, pelo pipeline padrao (sem atalho manual) — se o Auto-Deploy do Render estiver desabilitado por um rollback anterior, seguir a regra da secao 8/18 antes de reativa-lo;
14. executar o smoke (secao 15).

**STOP/GATE — conflitos e divergencia de escopo:**

> **SE `git revert` produzir conflito:** NAO resolver mecanicamente sob pressao. **ABORTAR o fluxo automatico → revisar/escalar** (secao 19, Matriz de escalonamento).
>
> **SE os arquivos afetados pelo revert divergirem materialmente do escopo esperado** (ex. arquivos que nao deveriam ser tocados pelo commit ruim aparecem no revert): **ABORTAR → revisar antes de prosseguir para commit/PR.**

**Guardrails:**

- nunca revert direto em `main`;
- nunca `force push`;
- nunca `reset --hard` em `main`;
- sempre partir de `origin/main` atualizado, nunca de uma copia local desatualizada;
- sempre revisar o diff antes do PR;
- sempre testar antes do PR;
- nunca merge via admin/bypass;
- nunca resolver conflito de revert mecanicamente sob pressao — abortar e escalar.

Este mecanismo foi validado tecnicamente em ambiente isolado (clone descartavel, nunca produção) durante o RECOVERY-3.

---

## 10. Banco / Supabase

> **SE o incidente envolve migration/schema/dados: NAO executar rollback simples de codigo automaticamente.**

Perguntas obrigatorias antes de qualquer acao:

- uma migration foi aplicada em producao (SQL destrutivo ja executado, nao apenas versionado)?
- o codigo antigo (alvo de um eventual revert) e compativel com o schema atual?
- dados ja foram gravados no formato/schema novo que o codigo antigo nao sabe interpretar?
- um rollback de aplicacao causaria incompatibilidade entre codigo e dados?
- e necessario envolver um restore de dados?

**Evidencia disponivel:** o RECOVERY-1 validou operacionalmente um backup logico real do Supabase e um teste real de restore em ambiente isolado, com paridade total de dados confirmada (ver secao 28.3 do roadmap ativo, `docs/ROADMAP-PRODUCAO-METODO-ORI.md`). O RECOVERY-4/C3 validou empiricamente, em laboratorio descartavel (nunca em producao), a sintaxe exata de cada comando do pipeline dump/criptografia/checksum/restore/paridade — ver `docs/RUNBOOK-RECOVERY-DADOS-SUPABASE.md`, secoes 7-13 e 24. **O procedimento tecnico canonico agora existe e esta documentado** (gap da secao 22 substancialmente resolvido) — isso **nao** elimina o Hard Gate de producao daquele runbook (secao 15) nem torna o restore de producao uma acao autonoma deste runbook: continua sendo sempre decisao coordenada.

**Neste runbook operacional, se um incidente exigir restauracao real de dados: seguir o procedimento tecnico de `docs/RUNBOOK-RECOVERY-DADOS-SUPABASE.md`, sempre com o Hard Gate (secao 15 daquele documento) e sempre escalando conforme a matriz da secao 19 abaixo — nunca executar restore de producao sozinho, mesmo com o procedimento tecnico disponivel.**

---

## 11. Pagamento e entitlement

Distincao obrigatoria antes de agir:

### CASE REPAIR

Pagamento real aprovado no Mercado Pago, entitlement ausente, **sem evidencia de falha sistemica ativa em curso**:

- usar `POST /api/admin/payments/reconcile`;
- request aceita **somente** `payment_id` — nunca inventar ou inferir `cliente_id`, `order_id` ou `entitlement` manualmente;
- somente operador com papel admin;
- usar apenas quando ha evidencia real e confirmada de pagamento aprovado;
- **nao usar** para refund/chargeback (fora do escopo do endpoint);
- registrar o resultado retornado (`reconciled`, `already_entitled`, `rejected`, `inconsistency_requires_manual_review`, `technical_error`) na evidencia do incidente.

### ACTIVE INCIDENT

Multiplos pagamentos novos continuam ficando inconsistentes apos uma mudanca recente (ex. deploy do backend que introduziu regressao no fluxo de checkout/webhook):

- **NAO** apenas reconciliar repetidamente, caso a caso, sem tratar a causa;
- primeiro: identificar e estancar a causa — se associada a um deploy recente do backend e um rollback for seguro conforme a secao 18 (Pos-incidente / remediacao permanente), conter a regressao primeiro;
- so depois: reconciliar individualmente os casos que ficaram para tras;
- **incidente financeiro sistemico sempre deve ser escalado**, independentemente de o operador conseguir "resolver" via reconcile.

**Contextualizacao tecnica:** RECOVERY-2 foi validado com 115/115 testes automatizados do backend passando (`OK`), PR mergeado e deploy validado em producao via evidencia publica nao-mutante; o deployment do merge do RECOVERY-2 foi posteriormente confirmado diretamente no dashboard Render (RECOVERY-3), alem dos smokes publicos nao-mutantes ja realizados.

---

## 12. Mudancas de configuracao/env

Rollback de codigo **nao corrige automaticamente**:

- secret incorreto;
- variavel de ambiente errada;
- configuracao alterada diretamente no dashboard (Render/Cloudflare);
- credencial expirada.

Se a causa for uma alteracao de configuracao:

1. registrar o estado atual da configuracao;
2. identificar exatamente o que mudou e quando;
3. corrigir **somente** a configuracao afetada, diretamente na plataforma onde foi alterada;
4. executar o smoke (secao 15);
5. registrar a evidencia (secao 17).

**Se nao for possivel identificar exatamente o que mudou: ABORTAR alteracao → ESCALAR.**

---

## 13. DNS/dominio

DNS **nao** e resolvido por rollback de Git/deploy.

Antes de qualquer alteracao:

- registrar o estado atual do DNS;
- identificar exatamente o registro afetado;
- confirmar o destino esperado antes de alterar;
- **nunca alterar multiplos registros "para testar"**.

**Toda mudanca de DNS deve ser coordenada e escalada — nunca uma acao solitaria de contencao.**

---

## 14. Providers externos

Cobre: Supabase, Mercado Pago, Gemini, e as proprias plataformas Cloudflare/Render quando indisponiveis por causa externa (nao por deploy do projeto).

Se um provider externo estiver indisponivel:

- **nao** reverter codigo sem evidencia de que a causa esta no codigo do projeto;
- verificar o status publico do provider, se disponivel;
- registrar horario e impacto observado;
- aguardar recuperacao do provider ou escalar — **nao inventar workaround destrutivo**.

---

## 15. Smoke pos-recuperacao

Sempre **nao-mutante**. Executar apos qualquer acao de contencao ou remediacao.

**FRONTEND:**

- dominio responde (`https://metodoori.teluricabeleza.com`, status 200);
- shell HTML carrega;
- assets criticos referenciados no `index.html` retornam 200;
- rota `/entrar` serve corretamente via SPA fallback;
- uma chamada publica segura ao backend a partir do frontend publicado (ex. `/api/status`).

**BACKEND:**

- `GET /health` = 200;
- `GET /openapi.json` responde e e parseavel, com as rotas esperadas presentes;
- um endpoint publico seguro existente, sem autenticacao (ex. `/api/status`).

**Explicitamente excluido do smoke padrao:**

- pagamento real;
- entitlement real;
- webhook fake;
- qualquer escrita no Supabase;
- login real desnecessario.

---

## 16. Criterios PASS / FAIL / ABORT

**PASS**
- o mecanismo escolhido terminou conforme esperado;
- o smoke critico (secao 15) esta verde;
- o impacto original cessou;
- a evidencia foi registrada (secao 17).

**FAIL**
- a acao foi executada, mas o problema persiste;
- o smoke continua falhando;
- **escalar** — nao encadear outros mecanismos de recuperacao "para ver se resolve" sem entender a causa.

**ABORT**
- uma pre-condicao essencial nao pode ser comprovada (ex. Regra de Ouro, secao 4);
- o deployment-alvo esta incerto;
- ha suspeita de incompatibilidade de banco/schema nao esclarecida (secao 10);
- o operador nao possui o acesso necessario (secao 19);
- a causa raiz nao foi identificada o suficiente para agir com seguranca.

---

## 17. Evidencias obrigatorias do incidente

Template reutilizavel (Markdown simples, sem banco/planilha):

```markdown
## Incidente — <data/hora>

- Operador:
- Descricao:
- Impacto observado:
- Tipo de incidente (codigo/deploy | dados | payment | config | DNS | provider):
- Camada afetada (frontend/backend/dados/config/DNS/provider):
- Deployment/SHA envolvido (se aplicavel):
- Ultimo estado bom conhecido (deployment/SHA/config, se aplicavel):
- Hipotese de causa:
- Pre-condicoes da Regra de Ouro validadas (secao 4): SIM/NAO — detalhar
- Acao de contencao escolhida:
- Horario de inicio da acao:
- Horario de fim da acao:
- Smoke executado (secao 15) e resultado de cada item:
- Resultado: PASS / FAIL / ABORT
- Containment realizado: SIM/NAO
- Auto-Deploy Render antes da acao (se aplicavel):
- Auto-Deploy Render depois da acao (se aplicavel):
- Escalonamento acionado: SIM/NAO + papel acionado (secao 19, Matriz de escalonamento)
- Remediacao permanente: pendente / concluida (link do PR, se aplicavel) / nao aplicavel (ver secao 18 para o tipo de causa)
- Follow-up necessario:
```

Os dois campos de Auto-Deploy sao opcionais (preencher apenas quando o incidente envolveu o Render) e existem para provar que o estado operacional final foi restaurado deliberadamente, nao deixado ao acaso (secao 8).

Nao adicionar dados pessoais (nomes completos, contatos) a instancias deste template alem do necessario operacionalmente.

---

## 18. Pos-incidente / remediacao permanente

Rollback nativo (Cloudflare ou Render) **e contencao, nao correcao permanente** — visa restaurar o comportamento observavel retornando a um deployment anterior, mas **nao remove o commit ruim de `main`**. So considerar a producao estabilizada apos o smoke (secao 15) dar PASS.

### Regressao de codigo/deploy contida por rollback nativo

Apos contencao de uma regressao de codigo/deploy por rollback nativo, a remediacao permanente via Git e obrigatoria:

```
INCIDENT CONTAINMENT
→ rollback nativo (Cloudflare/Render)

[producao estabilizada apos smoke PASS, main ainda contem o commit ruim]

PERMANENT REMEDIATION
→ branch de revert/fix
→ PR
→ MERGE COMMIT
→ deploy normal
→ smoke
```

**No Render — "deploy normal" quando o Auto-Deploy foi desabilitado pelo rollback:** o passo "deploy normal" do fluxo acima pressupoe que o pipeline padrao (push em `main` → Auto-Deploy) esta ativo. Se um Dashboard Rollback desabilitou o Auto-Deploy (secao 8), esse pipeline **nao** dispara sozinho apos o merge da remediacao. Nesse caso: **NAO reativar o Auto-Deploy enquanto `main` ainda contiver o commit ruim.** Primeiro produzir a branch de revert/fix, revisar/testar e mergear a remediacao em `main` (PR + MERGE COMMIT); somente depois que `main` estiver novamente em estado bom, decidir deliberadamente como publicar essa remediacao (reativar o Auto-Deploy de forma controlada, ou disparar um "Deploy latest commit" manual equivalente), confirmar que o deployment correto foi publicado, executar o smoke (secao 15) e registrar o estado final do Auto-Deploy na evidencia do incidente. **Nunca seguir a sequencia** `rollback → reativar Auto-Deploy → main ainda ruim` — isso permite que o Render publique automaticamente o commit ruim assim que o Auto-Deploy volta a ficar ativo.

**No Cloudflare:** um rollback nativo nao impede que um push futuro em `main` publique novamente o codigo ruim, se o Git ainda nao tiver sido corrigido.

**Nunca deixar producao permanentemente dependente apenas do rollback de dashboard enquanto `main` continua contendo o defeito.**

### Outros tipos de causa — nao tratar como "remediacao via Git" por padrao

O fluxo de revert/PR/merge acima e especifico para regressao de **codigo/deploy**. Para outras causas, a remediacao permanente e diferente:

- **Configuracao/env corrigida (secao 12):** registrar a correcao aplicada e a causa identificada na evidencia do incidente; **nao criar um revert de codigo sem necessidade** — a causa nao estava no codigo versionado.
- **DNS (secao 13):** registrar a mudanca feita de forma coordenada (quem autorizou, o que mudou, estado anterior); nao ha remediacao via Git para DNS.
- **Provider externo indisponivel (secao 14):** nenhum revert de codigo se o codigo do projeto nao foi a causa — a remediacao aqui e o acompanhamento com o provider, nao uma alteracao no repositorio.
- **Payment CASE REPAIR (secao 11):** registrar o resultado do `reconcile` na evidencia do incidente; **nao abrir um Git revert automatico** — reconciliar um pagamento pontual nao e uma regressao de codigo.

---

## 19. Acessos e responsabilidades

Acesso de leitura aos dashboards reais (Cloudflare e Render) foi validado durante o RECOVERY-3. Isso **nao significa que qualquer operador futuro possui os mesmos acessos** — cada operador deve confirmar seu proprio nivel de acesso antes de agir.

| Plataforma | READ | OPERATOR/WRITE |
|---|---|---|
| **Cloudflare** | Inventario de deployments, historico | Rollback, alteracao de configuracao |
| **Render** | Deploys, logs, configuracao | Rollback, Manual Deploy, alterar Auto-Deploy |
| **GitHub** | Repositorio, Actions, PRs | Criar branch/PR, merge (conforme permissoes) |
| **Supabase** | Consulta operacional | Admin — somente quando estritamente necessario |
| **Mercado Pago** | Consulta via backend (nunca exposicao direta de token) | N/A neste runbook — reconciliacao via endpoint proprio (secao 11) |

**Se o operador nao possui o acesso necessario para a acao: ABORTAR → ESCALAR.**

Credenciais nunca sao armazenadas neste documento. Toda referencia a acesso usa a frase padrao: **"credencial armazenada no gerenciador oficial da equipe"**.

### Matriz de escalonamento

"ESCALAR" (usado em todo este runbook) significa acionar o papel abaixo correspondente ao tipo de incidente — nao uma pessoa especifica nomeada aqui:

| Tipo de incidente | Papel a acionar |
|---|---|
| Incidente de codigo/deploy (frontend, backend, build) | Responsavel tecnico autorizado do Metodo Ori |
| Banco / schema / restore de dados | Responsavel tecnico + administrador autorizado do Supabase |
| Pagamento / ACTIVE INCIDENT (secao 11) | Responsavel tecnico + responsavel operacional/financeiro autorizado |
| DNS / dominio | Administrador autorizado de DNS/Cloudflare |
| Provider externo indisponivel | Responsavel tecnico, que decide o acompanhamento/escalonamento junto ao provider |
| Acesso insuficiente para a acao necessaria | Responsavel que possui permissao OPERATOR/WRITE da plataforma envolvida |

Nenhum nome, telefone, e-mail ou credencial de contato e armazenado neste documento.

**Regra de completude:** este runbook so pode ser considerado operacionalmente completo quando cada papel acima tiver um meio interno de contato conhecido pela equipe (ex. canal de plantao, lista de distribuicao). Definir esses meios de contato e uma decisao humana, fora do escopo desta fase — nenhum dado pessoal sensivel deve ser adicionado a este documento sem essa decisao explicita.

> **P0 #2 — RESOLVIDO (destino canonico de escalonamento):** decisao humana da proprietaria do Metodo Ori.
>
> - **Responsavel tecnico de escalonamento:** Filipe de Oliveira
> - **Funcao:** responsavel tecnico vigente pelo desenvolvimento e infraestrutura do Metodo Ori
> - **Canal:** WhatsApp
> - **Contato direto:** consultar cadastro interno de contatos do Metodo Ori
>
> Este documento **nao** armazena telefone pessoal, e-mail pessoal ou qualquer outro dado de contato direto — apenas nome, papel e canal, para evitar espalhar dado pessoal em documentacao versionada. O numero real fica exclusivamente no cadastro interno de contatos da equipe, fora deste repositorio.
>
> Este P0 e distinto e independente do P0 #1 (procedimento canonico de restore, secao 22, tambem resolvido pelo RECOVERY-4/C3). Com os dois resolvidos, nao ha mais bloqueio documental conhecido para o fechamento formal do RECOVERY-4.

**Quando acionar Filipe de Oliveira (escalonamento obrigatorio):** pelo menos um dos casos abaixo, em qualquer secao deste runbook ou do `RUNBOOK-RECOVERY-DADOS-SUPABASE.md`:

- suspeita de perda ou corrupcao de dados;
- restore em producao sendo considerado;
- rollback falhou;
- checksum falhou;
- paridade (baseline SOURCE vs. TARGET) falhou;
- SOURCE/TARGET ou ambiente nao pode ser identificado com certeza;
- credencial pode ter sido exposta;
- alteracao destrutiva de banco e necessaria;
- inconsistencia financeira/entitlement com impacto relevante;
- o procedimento chegou a um ponto marcado como "PRECISA DE VALIDACAO TECNICA" ou "PARE / ESCALAR" (ver `MANUAL-RECOVERY-METODO-ORI.md`, secao 4).

**Importante:** ter um responsavel definido **nao** e autorizacao automatica para restore de producao. O Hard Gate de producao (`RUNBOOK-RECOVERY-DADOS-SUPABASE.md`, secao 15) permanece obrigatorio mesmo com Filipe acionado — o papel dele e coordenar a decisao, nao substituir os criterios do Hard Gate.

---

## 20. Acoes proibidas / guardrails

```
NUNCA DURANTE INCIDENTE:

- force push;
- reset hard em main;
- apagar branch por impulso;
- merge via bypass/admin;
- alterar banco sem evidencia/backup previo;
- desativar validacao HMAC do webhook;
- liberar entitlement manualmente sem pagamento comprovado;
- expor secret em chat, log ou neste documento;
- mudar DNS sem registrar o estado anterior;
- executar multiplos mecanismos de recuperacao simultaneamente
  sem saber qual deles efetivamente resolveu o incidente;
- fazer rollback cujo deployment-alvo nao foi identificado
  com certeza (ver Regra de Ouro, secao 4);
- usar restore de dados como primeira resposta a um problema
  que e puramente de codigo/deploy.
```

---

## 21. Ponte com Observabilidade (referencia, nao implementacao)

Passos deste runbook que hoje dependem de descoberta **manual** porque a Observabilidade minima ainda nao foi implementada:

- deteccao do incidente (depende de alguem notar manualmente);
- correlacao entre horario do incidente e historico de deploys;
- alerta de health chegando a um operador humano (hoje so o proprio Render usa o health check para nao rotear trafego, sem alertar ninguem);
- deteccao de outage de provider externo (depende de checagem manual de status publico).

Classificacao: **P1**, ponte explicita para a proxima frente (Observabilidade minima). Nao implementado nesta fase.

---

## 22. Gap aberto — procedimento canonico de restore Supabase

> **P0 #1 — SUBSTANCIALMENTE RESOLVIDO (RECOVERY-4/C3):** o procedimento tecnico canonico de backup/restore do Supabase agora esta documentado com sintaxe exata validada empiricamente em laboratorio descartavel — ver `docs/RUNBOOK-RECOVERY-DADOS-SUPABASE.md`, secoes 7 a 13 (comandos) e 24 (matriz de validacao empirica). O registro historico do RECOVERY-1 (secao 28.3 de `docs/ROADMAP-PRODUCAO-METODO-ORI.md`) permanece como evidencia de que o mecanismo funciona contra dados reais; o RECOVERY-4/C3 validou a sintaxe exata de cada etapa do pipeline contra um SOURCE/TARGET de laboratorio.
>
> **O que isso muda:** um operador tecnico agora tem, pela primeira vez, um procedimento passo-a-passo com comandos validados para seguir — nao apenas a evidencia de que "algo assim ja funcionou uma vez".
>
> **O que isso NAO muda:** restore real de producao continua **sempre** sendo decisao coordenada, sujeita ao Hard Gate de `docs/RUNBOOK-RECOVERY-DADOS-SUPABASE.md` (secao 15). Este runbook operacional continua exigindo: **se um incidente exigir restauracao real de dados, seguir o procedimento tecnico com o Hard Gate cumprido e SEMPRE escalar conforme a matriz da secao 19** — nunca uma execucao solitaria e autonoma, mesmo com o procedimento agora documentado.
>
> **Pendencia remanescente (nao bloqueia o uso do procedimento):** a lista final de tabelas/queries do manifesto de baseline de **producao** real ainda precisa ser definida (`docs/RUNBOOK-RECOVERY-DADOS-SUPABASE.md`, secao 23, item 5) — o mecanismo generico de captura/comparacao ja esta validado.
