# 7. Pontos de integração e dependências externas

## Supabase Auth

- Uso:
  - Login, cadastro, recuperação e redefinição de senha no frontend.
  - Validação de token no backend via `/auth/v1/user`.
- Arquivos:
  - `src/pages/Login.jsx`.
  - `src/pages/RedefinirSenha.jsx`.
  - `src/components/ProtectedRoute.jsx`.
  - `backend/app/services/auth_service.py`.
- Se falhar para cliente:
  - Login/cadastro/redefinição mostram mensagens humanas.
  - Sessão inválida redireciona para `/entrar`.
  - API autenticada retorna `OriApiError` com pedido para entrar novamente.

## Supabase Database / PostgREST

- Uso frontend direto:
  - Criar/ler `clientes`.
  - Fallback de Produto 1.
  - Onboarding.
  - AdminRoute/Sidebar.
- Uso backend:
  - Todas as entidades principais por REST: `clientes`, `produto_1_respostas`, `produto_1_feedbacks`, `oraculo_cartas_diarias`, `produto_2_dossies`, `admin_cliente_eventos`.
- Se falhar para cliente:
  - Portal cai para dados locais quando possível.
  - Produto 1 tenta fallback local/Supabase direto quando backend falha.
  - Produto 2 mostra aviso e impede salvar/enviar até voltar.
  - Relatório/PDF ficam indisponíveis com mensagem humana.
- Se falhar para admin:
  - Dashboard/lista podem ficar vazios ou presos em logs; poucas mensagens visíveis globais.

## Supabase Storage

- Uso:
  - Upload de fotos do Produto 2 no bucket privado `produto-2-fotos`.
  - Caminhos salvos em `uploads.fotos_validacao`.
- Arquivo:
  - `src/pages/Produto2.jsx`.
  - SQL: `supabase-produto-2-storage.sql`.
- Se falhar para cliente:
  - A tela mostra `error.message` do Supabase quando disponível; pode ser técnico.
  - Sem foto, a cliente ainda pode preencher outros campos, mas a qualidade da análise Produto 2 fica prejudicada.

## Provedores de IA: OpenAI ou Gemini

- Uso:
  - Produto 1: geração/refino editorial de leitura.
  - Admin: mensagem de WhatsApp.
  - Produto 2: rascunho interno do Dossiê.
- Config:
  - `AI_PROVIDER`.
  - `OPENAI_API_KEY`, `OPENAI_MODEL`.
  - `GEMINI_API_KEY`, `GEMINI_MODEL`.
  - `AI_READING_ENABLED`.
- Arquivos:
  - `backend/app/services/admin_ai_service.py`.
  - `backend/app/services/leitura_service.py`.
  - `backend/app/services/produto2_ai_service.py`.
- Se falhar para cliente:
  - Produto 1 usa fallback determinístico de reports.
  - A cliente deve continuar vendo leitura/relatório, com menos personalização editorial.
- Se falhar para admin:
  - Mensagem admin retorna fallback base com warning.
  - Produto 2 rascunho IA retorna erro/indisponibilidade; admin pode continuar manualmente.

## Geração de PDF

- Uso:
  - Download do relatório Produto 1 em `/api/produto-1/relatorio/me/pdf`.
- Arquivo:
  - `backend/app/services/pdf_service.py`.
- Dependências:
  - Playwright para HTML/PDF quando possível.
  - ReportLab como fallback.
- Se falhar para cliente:
  - Frontend mostra `SyncNotice`: "Não conseguimos gerar o PDF agora..." ou mensagem de timeout.
  - Relatório em tela continua disponível se `/relatorio/me` funcionou.

## Envio de e-mail

- Uso:
  - Recuperação de senha pelo Supabase Auth (`resetPasswordForEmail`).
  - Confirmação de e-mail pode existir conforme configuração do Supabase.
- Não há serviço próprio de e-mail transacional no backend.
- Se falhar para cliente:
  - Login mostra mensagem específica se e-mail não confirmado.
  - Recuperação mostra "Não foi possível enviar o link agora..."

## Pagamento

- Não foi encontrada integração de pagamento no código atual.
- Liberação de Produto 2 e Produto 3 é manual/admin por flags em `clientes`.
- Se o pagamento existir fora do repositório, não há sincronização automática observada aqui.

## Render / backend deploy

- Arquivo: `render.yaml`.
- Backend espera variáveis de ambiente de Supabase, CORS e IA.
- Se o backend estiver fora:
  - Frontend wrapper exibe mensagens de sincronização.
  - Várias telas continuam com fallback Supabase/localStorage.
  - Produto 2 e relatórios dependem mais fortemente do backend.

## Vercel / frontend deploy

- Arquivos:
  - `vercel.json` na raiz.
  - `metodo-ori/vercel.json`.
  - `metodo-ori/vite.config.js`.
- Variáveis críticas:
  - `VITE_SUPABASE_URL`.
  - `VITE_SUPABASE_PUBLISHABLE_KEY`.
  - `VITE_API_URL`.
  - `VITE_ENABLE_PRODUTO_2`.
- Se falhar para cliente:
  - Sem Supabase vars, auth e banco quebram.
  - Sem `VITE_API_URL`, frontend chama `http://localhost:8000`, inadequado em produção.

## Rate limit interno

- Arquivo: `backend/app/main.py`.
- Implementação: memória do processo, por IP e path.
- Limites:
  - Geral: `RATE_LIMIT_REQUESTS` ou 120/min.
  - PDF: `RATE_LIMIT_PDF_REQUESTS` ou 6/min.
  - Admin/oráculo: `RATE_LIMIT_SENSITIVE_REQUESTS` ou 40/min.
- Se cliente exceder:
  - Recebe 429 com "Muitas tentativas em pouco tempo..."
  - Frontend wrapper converte para mensagem genérica de sincronização, sem explicar rate limit especificamente.

## Imagens, vídeos e assets locais

- Uso:
  - Heroes, fundos, cartas do oráculo, referências Produto 2, vídeos de login/quiz.
- Se falhar:
  - UI perde contexto visual; não há fallback textual específico por imagem.
  - Muitos assets de Produto 2 aparecem modificados/deletados no working tree, então a revisão visual deve considerar o estado local atual.
