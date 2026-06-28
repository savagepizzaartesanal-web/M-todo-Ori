# Metodo ORI API

Backend inicial em FastAPI para o sistema Metodo ORI.

## Requisitos locais

No Ubuntu/Debian, instale suporte a ambiente virtual e pip se ainda não existir:

```bash
sudo apt install python3.12-venv python3-pip
```

## Rodar em desenvolvimento

Crie um `.env` em `backend/` com:

```env
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5177,http://127.0.0.1:5177
APP_ENV=development
SUPABASE_URL=sua_url_do_supabase
SUPABASE_PUBLISHABLE_KEY=sua_chave_publicavel_do_supabase
AI_PROVIDER=gemini
AI_READING_ENABLED=true
GEMINI_API_KEY=sua_chave_gemini_opcional
```

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API:

- `http://localhost:8000`
- `http://localhost:8000/health`
- `http://localhost:8000/health/dependencies`
- `http://localhost:8000/docs`

Rotas iniciais:

- `GET /api/me`
- `GET /api/jornada/me`
- `POST /api/quiz/calculate`
- `POST /api/produto-1/respostas`
- `GET /api/produto-1/respostas/me`

As respostas do Produto 1 são persistidas na tabela
`public.produto_1_respostas` do Supabase/PostgreSQL. Rode antes o SQL
`metodo-ori/supabase-produto-1-respostas.sql` no SQL Editor do Supabase.

Para habilitar o reset completo da leitura no piloto, rode também:

```txt
metodo-ori/supabase-piloto-estabilizacao.sql
```

## IA nas leituras

O resultado arquetípico do Produto 1 continua sendo calculado pelas regras do
quiz. Quando `AI_READING_ENABLED=true` e uma chave de IA está configurada, a API
usa IA como assistente editorial interna para aterrar camadas específicas da
leitura, como **Dinâmica psíquica**, **Vida real**, **Sombra**, **Padrão
relacional** e **Essência de imagem**. Cada camada tem uma missão própria, para
evitar redundância. Se a IA estiver sem chave ou indisponível, a leitura usa o
texto determinístico de fallback.

## Frontend

O frontend usa `VITE_API_URL` quando disponível. Sem configuração, ele chama:

```txt
http://localhost:8000
```

Exemplo de `.env.local` no frontend:

```env
VITE_API_URL=http://localhost:8000
```

## Deploy no Render

O arquivo `render.yaml` na raiz do repositório prepara o deploy do backend
como Web Service Python.

No Render:

1. Crie um novo **Blueprint** apontando para este repositório.
2. Confirme o serviço `metodo-ori-api`.
3. Configure as variáveis privadas:

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_PUBLISHABLE_KEY=sua_chave_publicavel_do_supabase
```

4. Confira a origem permitida do frontend:

```env
FRONTEND_ORIGINS=https://metodo-ori.vercel.app
```

Depois do deploy, copie a URL pública do Render e configure no projeto da
Vercel:

```env
VITE_API_URL=https://sua-api-no-render.onrender.com
```

Faça um novo deploy do frontend após salvar essa variável.
