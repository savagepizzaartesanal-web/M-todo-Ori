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

Origens atualmente declaradas em `render.yaml`:

- `https://metodo-ori.vercel.app` - origem legada temporariamente mantida, nao e o frontend de producao atual.
- `https://metodoori.teluricabeleza.com` - dominio oficial de producao.
- `https://metodo-ori-telurica.pages.dev` - dominio tecnico Cloudflare Pages.

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
