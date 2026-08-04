# Status Funcional Dos Produtos

Este documento consolida informacoes duraveis sobre o estado funcional do Metodo ORI, com base no codigo atual e no antigo checkpoint temporario.

## Produto 1 - Codigo Das Deusas

### Rotas E Telas

Backend:

- `GET /api/produto-1/catalogo`
- `GET /api/produto-1/respostas/me`
- `POST /api/produto-1/respostas`
- `POST /api/produto-1/concluir`
- `POST /api/produto-1/reset`
- `GET /api/produto-1/leitura/me`
- `GET /api/produto-1/relatorio/me`
- `GET /api/produto-1/relatorio/me/pdf`

Arquivos principais:

- Rotas backend: `backend/app/routes/produto1.py`
- Servico backend: `backend/app/services/produto1_service.py`
- Leitura/relatorio: `backend/app/services/leitura_service.py`
- PDF: `backend/app/services/pdf_service.py`
- Catalogo: `backend/app/services/produto1_catalogo_service.py`
- Dados do quiz: `backend/app/data/quiz.py`
- Relatorios base: `backend/app/data/reports.json`
- Frontend: `metodo-ori/src/pages/QuizProduto1.jsx`, `metodo-ori/src/pages/Produto1Relatorio.jsx`
- API frontend: `metodo-ori/src/services/api.js`

Persistencia:

- Tabela principal: `produto_1_respostas`
- SQL relacionado: `metodo-ori/supabase-produto-1-respostas.sql`
- Feedbacks: `metodo-ori/supabase-produto-1-feedbacks.sql`
- Relatorio IA: `metodo-ori/supabase-produto-1-ai-report.sql`

## Produto 2 - Dossie ORI

### Estado Funcional

Produto 2 esta implementado como fluxo funcional de coleta e revisao:

- formulario cliente em `metodo-ori/src/pages/Produto2.jsx`;
- estrutura declarativa em `metodo-ori/src/data/produto2Form.js`;
- rota immersive de leitura/coleta em `/produto-2/leitura`;
- componente de leitura em `metodo-ori/src/components/reading/OriReadingFrame.jsx`;
- upload de fotos pelo frontend via Supabase Storage;
- bucket conhecido: `produto-2-fotos`;
- calculo deterministico no backend;
- rascunho IA administrativo;
- painel admin de revisao em `metodo-ori/src/components/Produto2ReviewPanel.jsx`.

### Rotas E Servicos

Rotas cliente:

- `GET /api/produto-2/me`
- `POST /api/produto-2/insumos`
- `POST /api/produto-2/enviar`

Rotas admin:

- `GET /api/admin/produto-2/{cliente_id}`
- `PUT /api/admin/produto-2/{cliente_id}`
- `POST /api/admin/produto-2/{cliente_id}/rascunho-ia`
- `POST /api/admin/produto-2/{cliente_id}/publicar`
- `POST /api/admin/produto-2/{cliente_id}/despublicar`

Arquivos principais:

- Rotas backend: `backend/app/routes/produto2.py`, `backend/app/routes/admin.py`
- Servico backend: `backend/app/services/produto2_service.py`
- Calculo: `backend/app/services/produto2_calculo_service.py`
- IA: `backend/app/services/produto2_ai_service.py`
- Schema: `backend/app/schemas/produto2.py`
- SQL principal: `metodo-ori/supabase-produto-2-dossies.sql`
- SQL Storage: `metodo-ori/supabase-produto-2-storage.sql`
- SQL IA/revisao: `metodo-ori/supabase-produto-2-ai-review.sql`

### Observacoes Confirmadas

- Jean Patton e uma secao condicional, exibida quando a autoidentificacao racial indica aplicabilidade.
- O backend reimpoe campos de contexto do cadastro/onboarding ao mesclar insumos do Produto 2.
- Cliente so recebe diagnosticos e dossie publicado quando o status e `publicado`.
- O formulario ainda salta da pergunta 40 para a pergunta 43; perguntas 41 e 42 nao aparecem em `metodo-ori/src/data/produto2Form.js`.

## Produto 3 - Codigo Final

### Estado Funcional

Produto 3 tem fundacao backend e API frontend, mas a experiencia de uso ainda esta incompleta.

Backend:

- Rotas cliente em `backend/app/routes/produto3.py`.
- Rotas admin em `backend/app/routes/admin.py`.
- Servico em `backend/app/services/produto3_service.py`.
- Schema em `backend/app/schemas/produto3.py`.
- SQL em `metodo-ori/supabase-produto-3-codigo-final.sql`.

Rotas cliente:

- `GET /api/produto-3/me`
- `POST /api/produto-3/insumos`
- `POST /api/produto-3/enviar`

Rotas admin:

- `GET /api/admin/produto-3/{cliente_id}`
- `PUT /api/admin/produto-3/{cliente_id}`
- `POST /api/admin/produto-3/{cliente_id}/publicar`
- `POST /api/admin/produto-3/{cliente_id}/despublicar`

Frontend:

- Rota SPA: `/produto-3`
- Tela atual: `metodo-ori/src/pages/Produto3.jsx`
- API frontend existente em `metodo-ori/src/services/api.js`

Pendencias confirmadas no codigo atual:

- `Produto3.jsx` e uma pagina selada/explicativa; nao chama as APIs de Produto 3, nao renderiza formulario real, nao faz upload e nao envia inventario.
- Nao ha componente admin equivalente a `Produto2ReviewPanel` para Produto 3.
- Nao ha rota de rascunho IA para Produto 3 em `backend/app/routes/admin.py`.

## Admin

Admin atual inclui:

- listagem e acompanhamento de clientes;
- detalhe da cliente;
- painel de revisao do Produto 2;
- controles genericos de liberacao/remocao de Produto 2 e Produto 3;
- geracao de mensagem administrativa com IA;
- historico/observacoes administrativas.

Arquivos principais:

- `metodo-ori/src/pages/AdminClientes.jsx`
- `metodo-ori/src/pages/AdminClienteDetalhe.jsx`
- `metodo-ori/src/components/Produto2ReviewPanel.jsx`
- `backend/app/routes/admin.py`
- `backend/app/services/admin_service.py`
- `backend/app/services/admin_ai_service.py`

## Supabase E Storage

Supabase participa de:

- autenticacao;
- banco/PostgREST;
- Storage de fotos do Produto 2;
- fallback direto em alguns fluxos frontend quando a API nao responde.

SQLs relevantes:

- `metodo-ori/supabase-piloto-estabilizacao.sql`
- `metodo-ori/supabase-security-audit.sql`
- `metodo-ori/supabase-security-hardening.sql`
- `metodo-ori/supabase-status-jornada-padronizacao.sql`
- `metodo-ori/supabase-produto-1-respostas.sql`
- `metodo-ori/supabase-produto-1-feedbacks.sql`
- `metodo-ori/supabase-produto-1-ai-report.sql`
- `metodo-ori/supabase-produto-2-dossies.sql`
- `metodo-ori/supabase-produto-2-storage.sql`
- `metodo-ori/supabase-produto-2-ai-review.sql`
- `metodo-ori/supabase-produto-3-codigo-final.sql`

Dependencias operacionais que exigem verificacao no Supabase:

- bucket/policies do Produto 2;
- constraints de `status_jornada`;
- policies e hardening de acesso;
- quais SQLs ja foram aplicados em producao.

## Pendencias

- Implementar experiencia cliente completa do Produto 3.
- Criar painel admin especifico para revisar/publicar Produto 3, se o Produto 3 seguir o mesmo modelo operacional do Produto 2.
- Decidir se as perguntas 41 e 42 do Produto 2 devem existir ou se a numeracao deve ser corrigida.
- Confirmar no Supabase de producao bucket, policies, constraints e SQLs aplicados.
- Confirmar numeros operacionais reais por consulta autenticada, nao por leitura do repositorio.

## Riscos Tecnicos

- Frontend ainda possui caminhos com fallback direto para Supabase/localStorage; isso melhora resiliencia, mas cria mais de uma fonte operacional em alguns fluxos.
- Upload do Produto 2 depende de bucket privado e RLS/policies corretas no Supabase.
- Sem `VITE_API_URL` correto no frontend de producao, chamadas autenticadas de API podem apontar para fallback local.
- Sem chave do provider IA atual no backend, recursos de IA degradam ou falham de forma controlada conforme a funcionalidade.

## Assets Ainda Necessarios

No codigo atual, os arquivos referenciados por `metodo-ori/src/data/produto2Form.js` em `/images/produto-2/opcoes-referencias/` existem.

Continuam exigindo atencao:

- novos assets devem ser conferidos sempre que o formulario do Produto 2 mudar;
- assets hero principais usados pelas telas devem permanecer em `metodo-ori/public/images/heroes/`;
- assets de PDF vivem no backend em `backend/app/static/pdf-assets/images/...`.

## Cobertura E Testes Conhecidos

Testes presentes:

- `backend/tests/test_produto2_calculo_service.py`
- `backend/tests/test_produto2_service.py`

Fixture:

- `backend/tests/fixtures/produto2_planilha_fixture.json`

Limitacoes conhecidas:

- a cobertura automatizada conhecida se concentra no Produto 2/backend;
- o checkpoint antigo registrava execucao via `unittest`;
- `pytest` nao estava disponivel na venv quando o checkpoint antigo foi produzido;
- nao ha evidencia no repositorio de testes end-to-end automatizados para o frontend.
