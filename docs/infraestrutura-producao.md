# Infraestrutura De Producao

Este documento registra a infraestrutura operacional atual do Metodo ORI. Ele nao deve conter valores de tokens, senhas, API keys ou secrets.

## Frontend

- Hospedagem de producao: Cloudflare Pages.
- Projeto Cloudflare Pages: `metodo-ori-telurica`.
- Dominio oficial: `https://metodoori.teluricabeleza.com`.
- Dominio tecnico: `https://metodo-ori-telurica.pages.dev`.
- Codigo do frontend: `metodo-ori/`.
- Build: `npm run build`, executado dentro de `metodo-ori/`.
- Output: `metodo-ori/dist`.
- Deploy automatico: GitHub Actions.
- Workflow: `.github/workflows/deploy-metodo-ori.yml`.
- Trigger automatico: push para `main` quando houver alteracao em `metodo-ori/**` ou no proprio workflow.
- Execucao manual: `workflow_dispatch`.
- Origem historica do projeto Cloudflare Pages: criado originalmente por Direct Upload.

Vercel nao e a hospedagem atual de producao do frontend.

## GitHub Actions

Repository Secrets necessarios:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

`GITHUB_TOKEN` e fornecido automaticamente pelo GitHub Actions e nao precisa ser criado manualmente como Repository Secret.

## Backend

- Hospedagem: Render.
- Servico: `metodo-ori-api`.
- Plano: Starter.
- Runtime: Docker.
- Configuracao declarada em: `render.yaml`.
- Dockerfile: `backend/Dockerfile`.
- Docker context: `backend`.
- Health check: `/health`.
- Filtro de autodeploy: `backend/**`.
- `rootDir`: nao configurado.

Com o filtro atual:

- alteracoes em `backend/**` podem acionar autodeploy da API no Render;
- alteracoes apenas em `metodo-ori/**` nao devem acionar redeploy da API;
- alteracoes apenas em `.github/workflows/deploy-metodo-ori.yml` nao devem acionar redeploy da API;
- alteracoes no proprio `render.yaml` continuam sendo processadas pelo Blueprint.

## Supabase

Supabase e usado para:

- autenticacao;
- banco de dados/PostgREST;
- Storage.

Os SQLs de configuracao vivem em `metodo-ori/supabase-*.sql`.

Bucket conhecido do Produto 2:

- `produto-2-fotos`

Nao ha confirmacao neste repositorio de quais SQLs/migrations ja foram aplicados em producao; essa verificacao exige consulta ao ambiente Supabase.

## IA

- Provider atual: Gemini.
- Configuracao de provider: `AI_PROVIDER=gemini`.
- Modelo configurado por: `GEMINI_MODEL`.
- Chave configurada por: `GEMINI_API_KEY`.
- Nao existe fallback automatico de Gemini para OpenAI quando `AI_PROVIDER=gemini`.
- `OPENAI_MODEL` pode permanecer configurado, mas nao representa o provider ativo enquanto `AI_PROVIDER=gemini`.

## Backend Env/Config

Secrets do backend, documentados somente por nome:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY`

Configuracoes do backend, documentadas somente por nome:

- `APP_ENV`
- `FRONTEND_ORIGINS`
- `PYTHON_VERSION`
- `AI_PROVIDER`
- `GEMINI_MODEL`
- `OPENAI_MODEL`

## CORS

`FRONTEND_ORIGINS` aceita URLs separadas por virgula. Nao usar array JSON.

Origens atualmente declaradas em `render.yaml` (confirmado por leitura direta do arquivo em 08/08/2026, durante o RECOVERY-3):

- `https://metodoori.teluricabeleza.com` - dominio oficial de producao.
- `https://metodo-ori-telurica.pages.dev` - dominio tecnico Cloudflare Pages.

A origem legada `https://metodo-ori.vercel.app` (Vercel) nao consta mais em `FRONTEND_ORIGINS` no `render.yaml` atual. Esta secao foi corrigida para refletir exatamente o arquivo versionado; nenhuma alteracao foi feita no `render.yaml` em si.

## Recuperacao E Rollback (RECOVERY-3)

Evidencias tecnicas comprovadas durante a auditoria RECOVERY-3 (08/08/2026). Procedimento operacional passo-a-passo completo (runbook) sera consolidado no RECOVERY-4; esta secao registra apenas fatos comprovados.

### Cloudflare Pages (frontend)

Plataforma:

- Cloudflare Pages, projeto `metodo-ori-telurica`.
- Producao dispara a partir de `main`.
- Dominio custom: `metodoori.teluricabeleza.com`.
- Dominio tecnico: `metodo-ori-telurica.pages.dev`.

Deploy:

- Mecanismo: GitHub Actions, workflow `.github/workflows/deploy-metodo-ori.yml`.
- Build do frontend so e disparado quando os paths relevantes (`metodo-ori/**` ou o proprio workflow) acionam o job.
- Deployment observado durante a validacao RECOVERY-3:
  - deployment ID: `ba0284d4-36ec-4ddb-bf08-87757896b2ea`.
  - URL: `https://ba0284d4.metodo-ori-telurica.pages.dev`.
  - status observado: success.
  - vinculo com GitHub Actions: commit curto `6ab43048`, workflow com status success, Preview URL identica ao deployment publicado.
- O SHA completo correspondente a esse commit curto nao foi resolvido via Git local nesta fase; nao inventado.

Rollback nativo:

- O dashboard do projeto Cloudflare Pages mostrou, em um deployment de Producao anterior, a opcao "Rollback to this deployment".
- Historico de deployments de Producao anteriores esta presente no projeto.
- Nenhum rollback foi executado durante o RECOVERY-3.

Principio operacional: rollback nativo Cloudflare e uma acao de contencao rapida — restaura o servico observavel, mas nao remove o commit ruim de `main`.

### Render (backend)

Servico:

- `metodo-ori-api`, repositorio `telurica-digital/M-todo-Ori`, branch `main`.
- Gerenciado via Blueprint (`render.yaml`).
- Runtime Docker; Dockerfile `backend/Dockerfile`; contexto de build `backend`.
- Root Directory: nao configurado.
- Build Filter: `backend/**`.
- Auto-Deploy: On Commit.
- Health check: `/health`.

Deploy observado (merge do RECOVERY-2):

- Merge commit: `11683845ea62a2f21743118f4bfa292a97d0c3e4`.
- Render exibiu commit curto `1168384`, evento "New commit via Auto-Deploy".
- Deploy iniciado: 2026-08-08 09:48.
- Deploy live: 2026-08-08 09:50.

Rollback e operador:

- Deployments anteriores exibem o botao Rollback.
- Manual Deploy oferece: "Deploy latest commit", "Deploy a specific commit", "Clear build cache & deploy", "Restart service".
- Classificacao:
  - Rollback = primitiva real de recuperacao.
  - Deploy a specific commit = fallback operacional (cria novo build a partir de um commit escolhido; desabilita Auto-Deploy).
  - Clear build cache & deploy / Restart service = ferramentas operacionais gerais, nao sao rollback.
- Nenhuma dessas acoes foi executada durante o RECOVERY-3.

Diferenca critica ja identificada entre as duas vias de rollback no Render: rollback via dashboard desabilita o Auto-Deploy automaticamente; rollback via API nao desabilita — nesse segundo caso, um push subsequente na branch vinculada pode reintroduzir a versao problematica se o Git ainda nao tiver sido corrigido. Qualquer runbook futuro deve incluir verificacao explicita do estado do Auto-Deploy apos qualquer rollback.

### Fallback de codigo — Git revert

Validado tecnicamente em ambiente isolado (clone descartavel em `/tmp`, nunca no repositorio de trabalho nem em producao):

```
git revert -m 1 <merge_commit>
```

Teste realizado com o merge real do RECOVERY-2:

- Merge: `11683845ea62a2f21743118f4bfa292a97d0c3e4`.
- Parent 1 (mainline, `main` antes do merge): `6030ecf340279f6d577da00306acb93203464e0a`.
- Parent 2 (branch do PR mergeado): `f8e971e1bcfd6c786e80b46b53e045113c461934`.

Resultado:

- `exit 0`, zero conflitos.
- Exatamente 8 arquivos afetados.
- Estado resultante byte-a-byte equivalente ao parent 1.
- Nenhum commit criado; teste realizado somente no clone descartavel; producao intacta.

Isso confirma a primitiva como fallback universal (funciona independente de acesso a dashboard/API de qualquer plataforma), mas ainda nao e um procedimento passo-a-passo de incidente — isso fica para o RECOVERY-4.

### Decisao sobre rollback real de producao

Durante o RECOVERY-3 nenhum rollback real de producao foi executado. Decisao: nao necessario para validar a recoverability, porque:

- os controles nativos foram confirmados visualmente nos projetos reais (Cloudflare e Render);
- o historico de deployments esta presente em ambas as plataformas;
- deployments ativos foram identificados com evidencia concreta;
- o fallback Git foi exercitado isoladamente com sucesso, sem tocar producao;
- acionar um rollback real apenas para fins de teste introduziria risco operacional sem ganho proporcional de evidencia.

## Fluxo De Deploy

Frontend:

```text
push frontend -> GitHub Actions -> Cloudflare Pages
```

Backend:

```text
push backend -> Render
```

Os filtros de deploy separam os fluxos: alteracoes do frontend nao devem redeployar a API, e alteracoes restritas ao backend nao passam pelo workflow de frontend.
