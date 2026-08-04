# Metodo ORI

Metodo ORI e uma plataforma digital para jornada de identidade, leitura arquetipica e direcao visual. O repositorio e um monorepo com frontend React/Vite em `metodo-ori/`, backend FastAPI em `backend/` e SQLs de configuracao Supabase em `metodo-ori/supabase-*.sql`.

## Documentacao

- [Infraestrutura de producao](docs/infraestrutura-producao.md)
- [Status funcional dos produtos](docs/status-produtos.md)
- [Checklist do piloto](PILOTO-CHECKLIST.md)
- [README do frontend](metodo-ori/README.md)
- [README do backend](backend/README.md)

## Infraestrutura Atual

O frontend de producao e publicado no Cloudflare Pages por GitHub Actions apos pushes na branch `main`. O backend roda no Render, no servico `metodo-ori-api`, plano Starter, com configuracao declarada em `render.yaml`.

Resumo dos fluxos:

```text
push frontend -> GitHub Actions -> Cloudflare Pages
push backend -> Render
```

O deploy do frontend observa alteracoes em `metodo-ori/**` e no workflow `.github/workflows/deploy-metodo-ori.yml`. O autodeploy do backend no Render esta filtrado para `backend/**`, evitando redeploy da API em alteracoes apenas do frontend.

## Ambientes

- Frontend oficial: `https://metodoori.teluricabeleza.com`
- Frontend tecnico Cloudflare Pages: `https://metodo-ori-telurica.pages.dev`
- Backend: Render, via Blueprint `render.yaml`
- Banco, autenticacao e storage: Supabase
- IA atual do backend: Gemini (`AI_PROVIDER=gemini`)

Valores de secrets nao devem ser registrados no repositorio. A lista de nomes necessarios esta documentada em [docs/infraestrutura-producao.md](docs/infraestrutura-producao.md).
