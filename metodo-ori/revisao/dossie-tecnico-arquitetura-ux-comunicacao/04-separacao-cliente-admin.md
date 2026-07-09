# 4. Separação cliente x admin

## Exclusivamente admin

### Páginas e rotas frontend

- `/admin`: `src/pages/AdminDashboard.jsx`.
- `/admin/clientes`: `src/pages/AdminClientes.jsx`.
- `/admin/clientes/:id`: `src/pages/AdminClienteDetalhe.jsx`.
- Gate: `src/components/AdminRoute.jsx`, que consulta `clientes.admin`.

### Componentes admin

- `src/components/Produto2ReviewPanel.jsx`: revisão interna do Produto 2, diagnóstico, rascunho IA, publicação/despublicação.
- Partes admin do `Sidebar.jsx`: links "Estúdio ORI" e "Clientes" exibidos apenas para admin.
- Utilitários:
  - `src/utils/adminClientPriority.js`.
  - Partes admin em `src/utils/feedbackInsights.js`.

### Endpoints admin

- Prefixo inteiro `/api/admin`.
- Serviços:
  - `admin_service.py`.
  - `admin_ai_service.py`.
  - funções admin em `produto2_service.py`.
  - `produto2_ai_service.py`.

### Banco/admin-only

- `clientes.admin`.
- `clientes.observacoes_admin`.
- `admin_cliente_eventos`.
- `produto_2_dossies.diagnosticos`, `dossie`, `ia_rascunho`, `ia_versao`, `ia_gerado_em`, `ia_revisado_em`, `publicado_em`.
- RLS e triggers impedem cliente comum de elevar permissão, liberar produtos ou publicar Produto 2.

## Exclusivamente cliente

### Páginas e rotas frontend

- `/entrada-ori`: onboarding.
- `/portal`: hub da cliente.
- `/produto-1`, `/produto-1/leitura`, `/quiz-produto-1`: Código das Deusas.
- `/produto-1/relatorio`: relatório do Produto 1.
- `/espelho-ori`: Espelho ORI.
- `/oraculo`: Oráculo.
- `/produto-2`: formulário e leitura publicada do Dossiê ORI.
- `/produto-3`: Código Final, atualmente teaser/bloqueado.
- `/metodo-ori`: página explicativa para cliente.

### Endpoints cliente

- `/api/me`.
- `/api/jornada/me`.
- `/api/quiz/calculate` é público em termos de token, mas usado pela cliente.
- `/api/produto-1/*`.
- `/api/feedback/produto-1/*`.
- `/api/mapa-vivo/me`.
- `/api/oraculo/*`.
- `/api/produto-2/me`, `/api/produto-2/insumos`, `/api/produto-2/enviar`.

## Compartilhados ou fronteira mista

- `clientes`: usada por cliente, admin, frontend direto e backend.
- `produto_1_respostas`: cliente salva/lê; admin lê no painel.
- `produto_1_feedbacks`: cliente cria/atualiza; admin lê.
- `oraculo_cartas_diarias`: cliente cria/lê; admin lê.
- `produto_2_dossies`: cliente cria/atualiza insumos; admin revisa/publica.
- `reports` e `quiz`: usados no frontend e backend, mas duplicados em arquivos separados.

## Pontos onde a fronteira não está clara ou merece revisão

### Upload do Produto 2 pode expor erro técnico

- Arquivo: `src/pages/Produto2.jsx`, componente de upload.
- Fluxo: `supabase.storage.from(...).upload(...)` joga `error`; catch usa `setNotice(error.message || "Não conseguimos enviar as imagens agora.")`.
- Risco: `error.message` pode conter texto técnico do Storage/Supabase, bucket, política, MIME, tamanho ou permissão.
- Esta é a ocorrência já identificada pela solicitante e permanece real no código.

### Produto 2 cliente usa Supabase Storage direto

- Upload acontece no frontend, não via backend.
- A fronteira é protegida por RLS do Storage, mas mensagens e validações dependem do client SDK.
- Se a política falhar, a cliente pode ver mensagem técnica.

### `/produto-3` não bloqueia por flag de liberação

- Portal desabilita o botão quando `produto_3_liberado=false`.
- A rota direta `/produto-3` renderiza teaser "ainda não liberado" sem consultar jornada.
- Não vaza dados, mas a regra de acesso está incompleta/visual, não contratual.

### `/produto-2` depende de feature flag no frontend

- Quando a flag está desligada, a rota redireciona para `/portal`.
- O backend continua tendo endpoints de Produto 2; a proteção real é `produto_2_liberado` + RLS, não a feature flag.

### `Dashboard.jsx` é rota cliente legada com localStorage global

- Usa `ori_produto_1_quiz`, não a chave por usuário.
- Isso pode divergir de `/portal` e do backend.
- Não é admin, mas é uma fronteira de estado antiga que pode confundir revisão de jornada.

### Admin recebe avisos com detalhe bruto de IA

- `admin_ai_service.py` retorna fallback warning com trecho de `error.response.text[:240]`.
- Visível só no admin (`aiNotice`/painel), não para cliente.
- Ainda assim, pode conter resposta técnica de provider.

### Rotas públicas de cálculo retornam `str(exc)`

- `/api/quiz/calculate`, `/api/produto-1/respostas`, `/api/produto-1/concluir` convertem `ValueError` em `HTTPException(detail=str(exc))`.
- O frontend wrapper normalmente substitui detalhes por mensagem humana (`OriApiError.userMessage`).
- Se outro consumidor chamar esses endpoints diretamente, pode ver mensagens como "Pergunta inválida: X".

### AdminRoute e Sidebar consultam Supabase direto

- Admin gate e links admin dependem de consulta client-side a `clientes.admin`.
- O backend também valida admin, então a proteção real existe.
- UX possível: breve estado de verificação ou redirecionamento se a consulta client-side falhar.
