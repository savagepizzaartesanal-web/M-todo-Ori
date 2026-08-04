# Metodo ORI

Metodo ORI e um prototipo de plataforma digital para uma jornada de identidade, leitura arquetipica e direcao visual. O sistema organiza a experiencia da cliente em camadas: primeiro nomeia a base simbolica, depois traduz essa leitura em imagem e, por fim, aplica a direcao visual em escolhas reais de rotina.

Este repositorio esta sendo preparado para avaliacao de produto, UX/UI e viabilidade de MVP.

## Objetivo Do Produto

O objetivo do Metodo ORI e validar uma experiencia premium de leitura e acompanhamento visual, combinando:

- diagnostico arquetipico inicial;
- entrega de resultado personalizada;
- area evolutiva chamada Espelho ORI;
- jornada em tres produtos/camadas;
- interface para cliente e administracao;
- linguagem visual sofisticada, escura, dourada e simbolica.

O produto busca testar se a cliente entende a jornada, percebe valor na leitura e consegue navegar entre o que ja foi revelado, o que ainda esta selado e o que sera aprofundado nas proximas etapas.

## Paginas Principais

- **Login**: entrada da cliente e do admin via Supabase.
- **Portal do Cliente**: painel inicial com acesso aos produtos e estado da jornada.
- **Produto 1 / Codigo das Deusas**: apresentacao da primeira leitura.
- **Quiz Produto 1**: questionario que calcula a combinacao arquetipica.
- **Resultado da Leitura**: entrega da leitura arquetipica inicial.
- **Metodo ORI**: pagina conceitual da metodologia e da jornada.
- **Espelho ORI**: area evolutiva da cliente, com matriz, camadas, leitura atual, oraculo diario e proxima travessia.
- **Produto 2 / Dossie ORI**: camada de traducao visual.
- **Produto 3 / Codigo Final**: camada de aplicacao em armario, formulas e escolhas reais.
- **Admin Clientes**: listagem e acompanhamento de clientes.
- **Admin Detalhe Cliente**: visualizacao dos dados e progresso de uma cliente.

## Stack

- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Supabase
- Vercel

## Identidade Visual

A direcao visual do sistema parte de uma estetica dark premium, com dourado, bronze, preto profundo e atmosfera cinematografica. A linguagem mistura espelho, oraculo, camadas, leitura simbolica e elementos sutis de afrofuturismo.

Principios visuais atuais:

- fundo escuro com brilhos e texturas discretas;
- tipografia grande, editorial e emocional;
- cards com bordas douradas suaves;
- imagens arquetipicas como suporte simbolico;
- experiencia de oraculo diario com cartas proprias;
- sensacao de sistema vivo, com elementos revelados, selados e em traducao.

## Estado Atual Do Produto

Ja existe:

- estrutura completa de app React/Vite;
- login e integracao base com Supabase;
- rotas protegidas;
- portal da cliente;
- quiz do Produto 1;
- calculo de resultado arquetipico;
- textos de leitura para as combinacoes atuais;
- pagina de resultado;
- Espelho ORI com matriz em camadas;
- oraculo diario com carta fechada, cartas reveladas e conselho lateral;
- paginas de Produto 2 e Produto 3 em estado de apresentacao/prototipo;
- area administrativa inicial.

Ainda esta em validacao/prototipo:

- regras finais de liberacao dos produtos 2 e 3;
- dados reais das camadas de traducao visual e aplicacao;
- fluxo operacional do admin;
- integracoes e automacoes futuras;
- conteudo final de algumas entregas;
- ajustes de responsividade fina em telas menores;
- clareza da jornada para uma cliente que nunca viu o metodo.

## O Que Queremos Descobrir Com A Avaliacao

- A proposta do Metodo ORI fica clara rapidamente?
- A cliente entende a relacao entre Produto 1, Dossie ORI e Codigo Final?
- A experiencia parece premium o suficiente para um produto pago?
- A identidade visual encanta sem prejudicar leitura e usabilidade?
- O Espelho ORI comunica bem a ideia de jornada em camadas?
- A Matriz ORI esta clara ou parece complexa demais?
- O Oraculo diario agrega valor real ou parece apenas decorativo?
- A diferenca entre "revelado", "em traducao" e "selado" esta compreensivel?
- A escala visual esta confortavel para uso continuo?
- O fluxo do quiz esta fluido e confiavel?
- A area administrativa atende o minimo necessario para acompanhar clientes?
- O produto parece pronto para MVP ou precisa simplificar antes?

## Duvidas Especificas De UX/UI

- A navegacao lateral do Espelho ajuda ou distrai?
- As secoes do Espelho ORI aparecem em uma ordem intuitiva?
- A Matriz deveria ser mais explicativa ou mais objetiva?
- A carta diaria deveria ter mais destaque ou permanecer como experiencia complementar?
- Os textos estao emocionais na medida certa ou longos demais?
- O visual dark premium comunica valor ou pode parecer pesado?
- A jornada deveria ter mais chamadas de acao entre as camadas?
- O admin precisa de mais filtros, status ou indicadores?

## Como Rodar Localmente

```bash
cd metodo-ori
npm install
npm run dev
```

Variaveis de ambiente necessarias:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_ENABLE_PRODUTO_2=false
```

Use `.env.local` para desenvolvimento local. Esse arquivo nao deve ser enviado ao GitHub.

Para desenvolver o Produto 2 localmente sem liberar no Vercel, use
`VITE_ENABLE_PRODUTO_2=true` apenas no `.env.local`. Em producao, mantenha a
variavel ausente ou definida como `false`.

## Deploy

Deploy recomendado: Vercel.

### Frontend De Producao

O frontend de producao do Metodo ORI e publicado automaticamente no Cloudflare
Pages por GitHub Actions apos pushes na branch `main`.

Configuracao:

- Framework: Vite
- Build Command: `cd metodo-ori && npm install && npm run build`
- Output Directory: `metodo-ori/dist`
- Environment Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_ENABLE_PRODUTO_2=false`

O repositorio contem `vercel.json` para permitir rotas internas do React Router em producao.
