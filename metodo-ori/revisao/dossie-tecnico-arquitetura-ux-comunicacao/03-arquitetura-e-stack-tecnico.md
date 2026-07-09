# 3. Arquitetura e stack técnico

## Frontend

- Framework: React 19 com Vite 8.
- Roteamento: `react-router-dom` 7, em `src/App.jsx`.
- Estilo: Tailwind CSS 4, CSS global em `src/index.css` e `src/App.css`, com bastante estilo inline por tela.
- Animação: `framer-motion`.
- Supabase client: `@supabase/supabase-js`, instanciado em `src/lib/supabaseClient.js` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
- API backend: wrapper em `src/services/api.js`, com timeouts, token Supabase e `OriApiError`.
- Feature flags: `src/config/features.js`; Produto 2 depende de `VITE_ENABLE_PRODUTO_2 === "true"`.

## Gestão de estado no frontend

- Local component state: predominante (`useState`, `useEffect`, `useMemo`).
- Não há store global dedicada.
- Supabase Auth: sessão/autenticação.
- Supabase Database: `clientes`, respostas, feedbacks, oráculo, dossiês.
- Backend FastAPI: fonte preferencial para jornada, Produto 1, Produto 2, Mapa Vivo, Oráculo, Feedback e Admin.
- localStorage:
  - `ori_produto_1_quiz_{userId}`: cache de respostas/resultado do Produto 1.
  - `ori_produto_1_quiz`: chave legada, removida em algumas telas para evitar herança entre contas.
  - `ori_onboarding_data:{id/email}` e `ori_onboarding_completed:{id/email}`.
  - `ori_espelho_daily_oracle_v1:{user}`: fallback/local da carta diária.
- Ponto importante: algumas telas combinam API, Supabase direto e localStorage. Isso melhora resiliência, mas cria múltiplas fontes de verdade.

## Backend

- Framework: FastAPI 0.124.
- Runtime: Python, Uvicorn.
- Schemas: Pydantic 2.
- HTTP externo: `httpx`.
- PDF: `reportlab` e Playwright como tentativa principal/fallback em `pdf_service.py`.
- Estrutura:
  - `backend/app/main.py`: FastAPI app, CORS, rate limit em memória, routers.
  - `backend/app/routes/*`: endpoints por domínio.
  - `backend/app/services/*`: regras de negócio, Supabase REST, IA, PDF.
  - `backend/app/schemas/*`: contratos Pydantic.
  - `backend/app/data/*`: quiz e textos base de reports.

## Endpoints organizados por domínio

- Saúde/status:
  - `GET /`
  - `GET /health`
  - `GET /health/dependencies`
  - `GET /api/status`
- Auth:
  - `GET /api/me`
- Jornada:
  - `GET /api/jornada/me`
- Quiz/Produto 1:
  - `POST /api/quiz/calculate`
  - `GET /api/produto-1/respostas/me`
  - `POST /api/produto-1/respostas`
  - `POST /api/produto-1/concluir`
  - `POST /api/produto-1/reset`
  - `GET /api/produto-1/leitura/me`
  - `GET /api/produto-1/relatorio/me`
  - `GET /api/produto-1/relatorio/me/pdf`
- Feedback:
  - `GET /api/feedback/produto-1/me?context=...`
  - `POST /api/feedback/produto-1`
- Mapa Vivo:
  - `GET /api/mapa-vivo/me`
- Oráculo:
  - `GET /api/oraculo/carta-dia/me?date_key=YYYY-MM-DD`
  - `POST /api/oraculo/carta-dia`
- Produto 2 cliente:
  - `GET /api/produto-2/me`
  - `POST /api/produto-2/insumos`
  - `POST /api/produto-2/enviar`
- Admin:
  - `GET /api/admin/clientes`
  - `GET /api/admin/clientes/{cliente_id}`
  - `PATCH /api/admin/clientes/{cliente_id}`
  - `POST /api/admin/clientes/{cliente_id}/eventos`
  - `POST /api/admin/clientes/{cliente_id}/mensagem-ia`
  - `GET /api/admin/produto-2/{cliente_id}`
  - `PUT /api/admin/produto-2/{cliente_id}`
  - `POST /api/admin/produto-2/{cliente_id}/rascunho-ia`
  - `POST /api/admin/produto-2/{cliente_id}/publicar`
  - `POST /api/admin/produto-2/{cliente_id}/despublicar`

## Banco de dados Supabase

### `public.clientes`

Tabela base já existente no projeto, alterada pelos SQLs locais. Guarda identidade da cliente, status de jornada, resultado arquetípico, flags de liberação, dados de onboarding e campos vivos.

Campos observados/adicionados:

- `id`, `user_id`, `nome`, `email`.
- `admin`.
- `resultado`, `arquetipo_principal`, `arquetipo_secundario`.
- `produto_1_liberado`, `produto_2_liberado`, `produto_3_liberado`.
- `status_jornada`.
- `observacoes_admin`.
- `perfil_onboarding`, `perfil_onboarding_concluido`, `perfil_onboarding_concluido_em`.
- `principal_dor`, `objetivo_principal`, `momento_atual`.

RLS:

- Cliente lê/atualiza a própria linha.
- Leads sem `user_id` podem ser vinculados por e-mail.
- Admin lê/altera todos via `current_user_is_ori_admin()`.
- Trigger impede cliente comum de alterar `admin`, liberações pagas e observações admin.

### `public.produto_1_respostas`

Guarda respostas e resultado do Código das Deusas.

- `id`, `user_id`, `email`.
- `answers` jsonb.
- `answered_count`, `total_questions`, `is_complete`.
- `result` jsonb.
- `ai_report`, `ai_report_key`, `ai_report_generated_at`.
- `created_at`, `updated_at`.

### `public.produto_1_feedbacks`

Feedback da leitura do Produto 1.

- `id`, `user_id`, `email`.
- `context` (`produto-1-leitura` ou `espelho-ori` no schema backend).
- `response`, `comment`, `resultado`, `payload`.
- `created_at`, `updated_at`.

### `public.oraculo_cartas_diarias`

Uma carta por cliente por dia.

- `id`, `user_id`, `email`, `date_key`.
- `card_id`, `card_title`, `reveal_label`, `code`, `message`.
- `payload`.
- `created_at`, `updated_at`.

### `public.produto_2_dossies`

Guarda rascunho, insumos, análise e entrega do Dossiê ORI.

- `id`, `cliente_id`.
- `status`: `aguardando_insumos`, `em_analise`, `publicado`.
- `insumos`, `analise_preliminar`, `diagnosticos`, `dossie`.
- `enviado_em`, `publicado_em`, `created_at`, `updated_at`.
- IA interna: `ia_rascunho`, `ia_versao`, `ia_gerado_em`, `ia_revisado_em`.

RLS/trigger:

- Cliente só insere/atualiza se `clientes.produto_2_liberado=true`.
- Cliente não pode publicar, alterar diagnóstico, alterar entrega final ou rascunho IA.
- Admin pode revisar/publicar.

### `public.admin_cliente_eventos`

Histórico operacional privado do admin.

- `id`, `cliente_id`, `admin_user_id`.
- `event_type`, `label`, `details`.
- `created_at`.

RLS: apenas admin.

### Supabase Storage `produto-2-fotos`

- Bucket privado.
- Limite: 15 MB.
- MIME types: JPEG, PNG, WebP.
- Políticas por `owner = auth.uid()`.

## Onde e como a IA é usada

### Produto 1 / leitura personalizada

- Serviço: `backend/app/services/leitura_service.py`.
- Ativado por `AI_READING_ENABLED=true` e chave configurada.
- Provider: `AI_PROVIDER=openai|gemini`.
- Modelos padrão:
  - OpenAI: `OPENAI_MODEL` ou `gpt-4.1-mini`.
  - Gemini: `GEMINI_MODEL` ou `gemini-2.5-flash-lite`.
- Objetivo: gerar ou refinar camadas editoriais da leitura do Produto 1 sem recalcular arquétipos.
- Prompts: `build_ai_layer_prompts` e `build_ai_report_prompts`; instruem a IA a aterrar camadas como dinâmica, vida real, sombra, padrão relacional e imagem, mantendo estrutura e conteúdo autoral.
- Persistência: `produto_1_respostas.ai_report` com chave/hash em `ai_report_key`.
- Visível para cliente: leitura em `/produto-1/leitura`, relatório `/produto-1/relatorio`, PDF.
- Fallback: texto determinístico de `reports` quando IA ausente, indisponível ou rasa.

### Mensagem admin com IA

- Serviço: `backend/app/services/admin_ai_service.py`.
- Endpoint: `POST /api/admin/clientes/{cliente_id}/mensagem-ia`.
- Objetivo: gerar mensagem de WhatsApp para admin revisar antes de enviar.
- Prompt: usa contexto de cliente, onboarding, Produto 1, feedback, oráculo, histórico e próxima ação.
- Visível para cliente: não automaticamente; aparece somente se admin copiar/enviar fora do sistema.
- Fallback: retorna texto base do payload com aviso, sem quebrar fluxo admin.

### Produto 2 / rascunho de Dossiê IA

- Serviço: `backend/app/services/produto2_ai_service.py`.
- Endpoint: `POST /api/admin/produto-2/{cliente_id}/rascunho-ia`.
- Objetivo: criar rascunho administrativo do Dossiê ORI a partir dos insumos enviados e diagnósticos confirmados.
- Condições: cliente precisa ter enviado insumos; dossiê não pode estar publicado; diagnósticos técnicos devem estar confirmados.
- Visível para cliente: nunca diretamente; o rascunho vai para `ia_rascunho` e precisa ser revisado/publicado pelo admin.

## Autenticação e acesso

- Login/cadastro: Supabase Auth no frontend.
- Backend: `get_current_user` valida token Supabase chamando `/auth/v1/user`.
- Chamadas autenticadas: frontend injeta Bearer token Supabase em `requestAuthenticatedApi`.
- Admin:
  - Frontend: `AdminRoute` consulta `clientes.admin`.
  - Backend: `ensure_admin` consulta Supabase REST e exige `admin is true`.
  - Banco: `current_user_is_ori_admin()` em RLS.
- Cliente:
  - Acesso próprio por `user_id = auth.uid()` ou e-mail para leads antigos sem `user_id`.
  - Produto 2 depende de liberação manual.
