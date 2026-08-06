# Cache freemium do Produto 1

O frontend não deve reutilizar o catálogo antigo do Produto 1 quando a API falhar,
porque versões anteriores podiam armazenar textos completos em `localStorage`.

A migração G4B remove somente `ori_produto_1_catalogo` e registra a versão
`ori_produto_1_cache_version=g4b-freemium-v1`. O catálogo passa a ser carregado
sempre da API atual e, em caso de falha, a interface mostra erro controlado.

No logout, caches personalizados do Produto 1 e pedidos temporários de checkout
são removidos sem apagar a sessão Supabase fora do fluxo normal de saída.
