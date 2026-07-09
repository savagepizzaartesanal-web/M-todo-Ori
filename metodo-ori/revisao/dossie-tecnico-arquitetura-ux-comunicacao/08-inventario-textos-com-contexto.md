# 8. Inventário de textos com contexto

Este inventário foca textos estáticos voltados à cliente. Textos exclusivamente admin ficam fora, exceto quando afetam fronteira de comunicação. O levantamento anterior (`revisao-comunicacao-textos-sistema.json`) contém milhares de strings isoladas; aqui elas estão agrupadas por fluxo, com condição, transição e interpolação.

## Textos globais

| Local | Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- | --- |
| `App.jsx` fallback | Página lazy ainda carregando | "ORI"; "Abrindo sua jornada..." | Navegação para qualquer rota lazy | Página solicitada | Nenhuma |
| `ProtectedRoute.jsx` | Validando sessão/perfil | "Preparando seu portal ORI..." | Acesso a rota protegida | Rota solicitada ou redirect | Nenhuma |
| `SyncNotice.jsx` | `message` não vazio | Conteúdo de `message` | Ação/API com falha parcial | Tela continua com fallback | `message` |

## Login e cadastro (`/entrar`)

| Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| Sempre, desktop | "Método ORI by Telúrica" | Logo | Headline de entrada | Nenhuma |
| Sempre | "Sua imagem não começa no espelho." / "Começa na psique." | Identificação do método | Chips de promessa | Nenhuma |
| Sempre | "Leitura arquetípica"; "Imagem simbólica"; "Presença estética" | Headline | Card de login/cadastro | Nenhuma |
| `modo === "login"` | Labels de login: e-mail, senha, entrar | Toggle login/cadastro | Submit | Nenhuma |
| `modo === "cadastro"` | Labels de cadastro: nome, e-mail, senha | Toggle cadastro | Submit | Nenhuma |
| Cadastro erro nome | "Informe seu nome para criar o acesso." | Submit cadastro | Formulário permanece | Nenhuma |
| Cadastro erro e-mail | "Informe seu e-mail para criar o acesso." | Submit cadastro | Formulário permanece | Nenhuma |
| Cadastro erro senha | "Crie uma senha com pelo menos 6 caracteres." | Submit cadastro | Formulário permanece | Nenhuma |
| E-mail já cadastrado | "Este e-mail já possui cadastro. Tente entrar no portal." | Falha Supabase signUp | Usuária pode alternar para login | Nenhuma |
| Login inválido | "E-mail ou senha incorretos. Verifique seus dados de acesso." | Falha signIn | Formulário permanece | Nenhuma |
| E-mail não confirmado | "Seu e-mail ainda não foi confirmado..." | Falha signIn | Formulário permanece | Nenhuma |
| Recuperação iniciada | "Informe seu e-mail para receber o link de redefinição." | Clique recuperação sem e-mail | Formulário permanece | Nenhuma |
| Recuperação enviada | "Enviamos um link para seu e-mail. Abra a mensagem e crie uma nova senha." | Envio Supabase OK | Modo login | Nenhuma |
| Carregando login/cadastro | "Enviando..." | Clique submit | Sucesso/erro | Nenhuma |
| Carregando recuperação | "Enviando link..." | Confirma recuperação | Sucesso/erro | Nenhuma |

## Redefinir senha (`/redefinir-senha`)

| Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| Sempre | "Criar nova senha" | Link recebido por e-mail | Campos senha/confirmar | Nenhuma |
| Senha curta | "Crie uma senha com pelo menos 6 caracteres." | Submit | Formulário | Nenhuma |
| Confirmação diferente | "As senhas precisam ser iguais." | Submit | Formulário | Nenhuma |
| Erro Supabase | "Não foi possível salvar sua nova senha agora..." | Submit | Formulário | Nenhuma |
| Loading | "Salvando..." | Submit | Redirect `/portal` ou erro | Nenhuma |

## Entrada ORI (`/entrada-ori`)

Fonte dos textos: `src/data/onboardingOriSteps.js`.

| Passo/condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| `profile` | Eyebrow "Entrada ORI" | Tela protegida redireciona para onboarding | Título | Nenhuma |
| `profile` | "Vamos começar pelo que ajuda o ORI a te ler melhor." | Eyebrow | Descrição | Nenhuma |
| `profile` | "Primeiro, me conte seus dados principais para abrir seu perfil com cuidado." | Título | Campos | Nenhuma |
| `profile` campos | "Nome completo"; "Como você gosta de ser chamada"; "Data de nascimento"; "Estado/Cidade onde mora"; "WhatsApp" | Descrição | CTA "Continuar" | Valores do formulário |
| `startingPoint` | Eyebrow "Ponto de partida" | Passo profile concluído | Título | Nenhuma |
| `startingPoint` | "Como você se sente com sua imagem agora?" | Eyebrow | Descrição | Nenhuma |
| `startingPoint` | "Escolha a frase que mais se aproxima do seu momento." | Título | Radios | Nenhuma |
| `startingPoint` opções | "Estou começando..."; "Tenho referências..."; "Já comecei..." | Label "Seu momento agora" | Dor principal | Nenhuma |
| `mainPain` | "O que mais te incomoda hoje?" e opções de dor | Momento atual | CTA ou campo custom | Nenhuma |
| `mainPain === "Quero escrever com minhas palavras"` | "Me conte em poucas palavras" | Opção custom selecionada | CTA | `mainPainCustom` |
| `direction` | Eyebrow "Direção" | Passo startingPoint concluído | Título | Nenhuma |
| `direction` | "O que você quer sentir mais na sua imagem?" | Eyebrow | Descrição | Nenhuma |
| `direction` | "Escolha a direção que você mais deseja fortalecer agora." | Título | Radios de desejo | Nenhuma |
| `racialIdentity` | "Autodeclaração racial" e opções | Desejo principal | CTA final | Nenhuma |
| `done` | "Perfil criado"; "Seu perfil está pronto."; "Agora o ORI já pode te guiar para a primeira leitura." | Último formulário válido | CTA "Entrar na minha jornada" | Nenhuma |
| Erro salvamento | "Não consegui salvar seu perfil agora. Tente novamente em instantes." | CTA do passo success | Permanece no onboarding | Nenhuma |

## Portal / Átrio (`/portal`)

| Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| `loadingCliente` | "Carregando Átrio"; "Preparando seu Átrio ORI..."; "Estamos buscando sua leitura e os próximos passos da sua jornada." | Abertura da rota | Portal completo | Nenhuma |
| Hero sempre | "Identidade · Imagem · Presença"; "Átrio ORI" | SyncNotice opcional | Texto de saudação | Nenhuma |
| `clienteNome` existe | "{clienteNome}, sua jornada de identidade, imagem e presença começa aqui." | Título hero | Descrição método | `clienteNome` |
| `clienteNome` ausente | "Sua jornada de identidade, imagem e presença começa aqui." | Título hero | Descrição método | Nenhuma |
| Hero desktop | "O Método ORI acontece em três movimentos..." | Saudação | Texto de organização | Nenhuma |
| Hero desktop | "Ele organiza o que pode estar fragmentado..." | Texto três movimentos | Chips | Nenhuma |
| Chips | "Nomear"; "Integrar"; "Aplicar"; "Sustentar" | Hero copy | Resultado ativo/selado | Nenhuma |
| `resultadoFinal` existe | "Resultado ativo"; "{resultadoFinal}"; "Registrado" | Hero copy | Próximo movimento/cards | `resultadoFinal` |
| Sem resultado | "Comece pelo Código das Deusas..." / "Sua primeira etapa ainda está selada..." | Hero copy | Próximo movimento | Nenhuma |
| Card Produto 1 concluído | "Seu Código das Deusas revelou..." | Cards jornada | Botão "Ver minha primeira leitura" | Nenhuma |
| Card Produto 1 sem resultado | "A primeira etapa ajuda você..." | Cards jornada | Botão iniciar/continuar | Nenhuma |
| Status Produto 1 | "Primeira leitura pronta" / "Em andamento" / "Disponível" / "Aguardando liberação" | Card Produto 1 | CTA | Condições de resultado/respostas/liberação |
| Card Produto 2 | "Mostra como sua leitura aparece na prática..." | Card Produto 1 | CTA Dossiê | Nenhuma |
| Produto 2 liberado | "Liberado"; "Acessar Dossiê" | Card Produto 2 | Rota `/produto-2` | Nenhuma |
| Produto 2 bloqueado | "Próxima etapa"; "Ainda não liberado" | Card Produto 2 | Permanece portal | Nenhuma |
| Card Produto 3 | "Transforma sua direção visual em guarda-roupa real..." | Card Produto 2 | CTA Código Final | Nenhuma |
| Produto 3 liberado | "Liberado"; "Acessar Código Final" | Card Produto 3 | Rota `/produto-3` | Nenhuma |
| Produto 3 bloqueado | "Aplicação final"; "Ainda não liberado" | Card Produto 3 | Permanece portal | Nenhuma |
| Quick entry com resultado | "Seu espelho inicial já abriu"; "Continue pelo passo..." | Hero/cards | CTA Espelho | `resultadoFinal` dentro de "X já foi nomeada..." |
| Quick entry sem resultado | "Primeiro gesto"; "Comece entendendo..." | Hero/cards | CTA Produto 1 | Nenhuma |
| Próximo movimento onboarding | "Finalize sua Entrada ORI." | Portal detecta onboarding pendente | CTA `/entrada-ori` | Nenhuma |
| Próximo movimento Produto 1 novo | "Comece pelo Código das Deusas." | Sem respostas/resultado | CTA `/produto-1` | Nenhuma |
| Próximo movimento Produto 1 andamento | "Continue sua leitura." | Há respostas sem resultado | CTA `/produto-1` | Nenhuma |
| Próximo movimento feedback | "Conte como a leitura chegou em você." | Resultado sem feedback | CTA `/produto-1/leitura` | Nenhuma |
| Próximo movimento oráculo | "Tire sua carta diária." | Resultado e sem carta do dia | CTA `/oraculo` | Nenhuma |

## Código das Deusas / Produto 1 (`/produto-1`, `/produto-1/leitura`, `/quiz-produto-1`)

O arquivo `QuizProduto1.jsx` concentra muita copy dinâmica. Os textos da leitura final vêm de `reports` e/ou IA backend.

| Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| Loading/revelação | "Preparando sua revelação..." | Quiz concluído | Resultado | `loadingMessages[loadingStep]` |
| Respostas incompletas | "Responda todos os sinais antes de ver o seu Código ORI." | Clique revelar | Volta ao quiz | Nenhuma |
| Resultado existente | Títulos/leituras do resultado | Loading ou retorno à rota | Feedback/relatório/next step | `result.nomeComposto`, arquétipos, textos `reports[result]` |
| CTA relatório | "organizados para reler, salvar e acompanhar sua jornada"; "Ver relatório" | Leitura concluída | `/produto-1/relatorio` | Nenhuma |
| Próximo Dossiê | "Sua primeira leitura foi concluída. O Dossiê ORI é a próxima etapa..." | Resultado | CTA/portal | Nenhuma |
| Feedback prompt | Pergunta de retorno pós-leitura | Leitura marcada como concluída | Opções de feedback | `feedbackResponse`, `feedbackComment` |
| Feedback salvo | "Obrigada. Seu retorno foi registrado." | Submit feedback | Continuação | Nenhuma |
| Feedback erro | "Não conseguimos salvar seu retorno agora." ou `userMessage` | Submit feedback falhou | Formulário | `error.userMessage` |
| Reset erro | "Não foi possível reiniciar a leitura agora..." | Tentativa de reset | Permanece resultado | Nenhuma |

### Textos de conteúdo Produto 1

| Fonte | Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- | --- |
| `src/data/questions.js` | Quiz em andamento | 36 perguntas por blocos como "Sua Presença", "Seu Estilo", etc. | Intro/estado da pergunta | Próxima pergunta | `question.pergunta`, `question.bloco` |
| `src/data/reports.js` | Resultado calculado | `fraseHero`, `reconhecimento`, `essencia`, `dinamica`, `percebida`, `sombra`, `padraoRelacional`, `caminho`, `essenciaImagem`, `paleta`, `modelagem`, `tecidos`, `beleza`, `presenca`, `evitar`, `formula`, `leituraFinal`, `proximoPasso` | Nome do resultado | Próxima seção/CTA | `result.nomeComposto`; escolha por chave do resultado |
| Backend IA | `AI_READING_ENABLED` e cache/geração válida | Camadas editoriais personalizadas | Textos base/perfil | Relatório e PDF | Perfil onboarding, respostas, resultado |

## Relatório Produto 1 (`/produto-1/relatorio`)

| Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| `loading` | "Preparando sua leitura..." | Abertura da rota | Relatório ou aviso | Nenhuma |
| Erro relatório | "Não conseguimos carregar seu relatório agora." ou `userMessage` | Falha API | CTA voltar à leitura | `error.userMessage` |
| Completo | Título e subtítulo do relatório | Loading | Seções do relatório | `report.title`, `report.subtitle`, `report.resultado`, `report.combinacao`, `report.email` |
| Download | "Preparando PDF..." | Clique "Baixar PDF" | Download ou erro | Nenhuma |
| PDF aviso | "Estamos preparando seu PDF..." | Clique download | Arquivo baixado | Nenhuma |
| Conteúdo | Highlights, seções, fórmula, próximo passo | Cabeçalho relatório | CTA final | `report.highlights`, `report.sections`, `report.formula`, `report.next_step` |

## Espelho ORI (`/espelho-ori`)

| Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| `loading` | "Preparando seu reflexo..." | Abertura | Espelho | Nenhuma |
| Sem resultado | `fallbackReflection`: "Sua imagem começa a mostrar..." etc. | Loading | CTA Produto 1 | Nenhuma |
| Com resultado | Textos derivados do report e mapa vivo | Hero/estado ativo | Seções de reflexão | `resultadoFinal`, `principal`, `secundario`, `mapaVivo` |
| Perfil onboarding disponível | Campos do perfil aparecem como contexto | Hero/resultado | Mapa de dados | Valores do perfil |
| Produto 2 liberado | Textos/camadas de imagem e corpo ficam ativas | Seções base | Próximos blocos | `produto_2_liberado` |
| Produto 3 liberado | Camadas de guarda-roupa/aplicação ficam ativas | Produto 2 | Código final | `produto_3_liberado` |

## Oráculo (`/oraculo`)

| Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| Sem resultado | Mensagens seladas como "Sua essência ainda está aguardando nome..." | Abertura/deck | CTA Produto 1 | Nenhuma |
| Com resultado | Mensagens do deck personalizadas | Abertura/deck | Carta revelada | `resultName`, `first`, `second` |
| Carta Essência | "Carta da Essência"; "O que sustenta você"; mensagens de essência | Deck | Orientação observe/avoid | `resultName` |
| Carta Sombra | "Carta da Sombra"; "O que pede consciência" | Deck | Orientação | `resultName` |
| Carta Imagem | "Carta da Imagem"; "O que quer ganhar forma" | Deck | Orientação | Nenhuma |
| Carta Presença | "Carta da Presença"; "O que chega antes da fala" | Deck | Orientação | `first`, `second`, `resultName` |
| Outras cartas | Caminho, Limite, Corpo, Desejo, Coerência, Travessia | Deck | Orientações práticas | Variáveis conforme carta |
| Orientações práticas | `ORACLE_PRACTICAL_GUIDANCE`: `realLife`, `tip`, `imageGesture` | Carta revelada | Salvar/retornar | Nenhuma |
| Falha salvar API | Aviso de carta salva localmente | Revelar carta | Continua experiência | Nenhuma |

## Produto 2 / Dossiê ORI (`/produto-2`)

| Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| `loading` | "Carregando Dossiê ORI..." | Abertura | Formulário/bloqueio/publicado | Nenhuma |
| Não liberado | "Esta etapa abre quando sua próxima leitura estiver disponível..." | Loading | CTA Produto 1/portal | Nenhuma |
| Liberado e não enviado | "Vamos olhar para sua imagem real" | Header Dossiê | Campos do passo base | Nenhuma |
| Painel dados conectados | "O que já sabemos sobre sua jornada" | Header/form | Resumo de dados | Nome, resultado, momento, objetivo |
| Form base | "Registro da sua imagem"; "Sua altura"; "Seu peso aproximado"; "Como você se autodeclara racialmente?" | Intro Produto 2 | Upload/campos | Valores de `insumos` |
| Upload | "Adicionar imagens da leitura" | Campo upload | Lista de imagens | Nenhuma |
| Upload loading | "Enviando imagens..." | Seleção de arquivos | Sucesso/erro | Nenhuma |
| Corpo/rosto | Perguntas numeradas sobre linha vertical, ombros, braços/pernas, mãos/pés etc. | Passo base | Próxima etapa | Respostas `insumos.estrutura_corporal.*` |
| Coloração | Perguntas sobre sol, metais, profundidade, intensidade etc. | Corpo | Próxima etapa | Respostas `insumos.coloracao.*` |
| Cabelo | Perguntas sobre curvatura, fio, porosidade, densidade, rotina etc. | Coloração | Próxima etapa | Respostas `insumos.cabelo.*` |
| Essência/jornada | Campos derivados do Produto 1 e desafios de imagem | Cabelo | Envio | Resultado/onboarding reaproveitados |
| Campo conectado | "Esta etapa já foi preenchida com dados da sua jornada." | Campo derivado | Próximo campo | Dados bloqueados por backend |
| Salvar | "Salvar e continuar depois" / "Rascunho do Dossiê salvo." | Formulário | Permanece formulário | Nenhuma |
| Enviar | "Concluir e enviar para análise" / "Informações enviadas..." | Formulário | Status `em_analise` | Nenhuma |
| Em análise | "Sua etapa foi concluída. A leitura visual final agora pode ser construída..." | Envio | Aguardar admin | Nenhuma |
| Publicado | Textos de `dossie` e `diagnosticos` publicados | Admin publica | Cliente lê entrega | Conteúdo admin publicado |
| Erro upload | `error.message` ou fallback | Upload falha | Formulário | Pode interpolar mensagem técnica |

## Produto 3 / Código Final (`/produto-3`)

| Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| Sempre | "Aplicação"; "Código Final" | Abertura rota | Descrição | Nenhuma |
| Sempre | "A etapa final leva sua leitura para o guarda-roupa real..." | Título | Texto explicativo | Nenhuma |
| Sempre | "Depois de entender sua força..." | Descrição | Card bloqueado | Nenhuma |
| Sempre | "Código Final ainda não liberado" | Hero | Explicação bloqueio | Nenhuma |
| Mobile | "O Código Final abre quando sua leitura visual já estiver pronta." | Card bloqueado | CTA Produto 1 | Nenhuma |
| Desktop | "Esta etapa abre depois que sua força já foi entendida..." | Card bloqueado | Chips | Nenhuma |
| Chips | "Inventário do armário"; "Cápsula funcional"; "Fórmulas de look"; "Estratégia de compra" | Card bloqueado | CTA | Nenhuma |
| CTA | "Ver minha primeira leitura" | Chips | `/produto-1` | Nenhuma |
| Seção final | "O que vem no Código Final"; "Na prática"; "Inventariar"; "Estruturar"; "Comprar com critério" | Hero | Cards explicativos | `finalLayers[].title/text` |

## Método ORI (`/metodo-ori`)

| Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- |
| Sempre | Textos institucionais/explicativos do método | Abertura rota | Seções da página | Nenhuma observada |
| Sempre | Promessa de identidade, imagem e presença | Hero | Explicações das etapas | Nenhuma |
| Sempre | Nomes de produtos/etapas | Hero/seções | CTAs para jornada | Nenhuma |

## Textos de erro/sincronização voltados à cliente

| Origem | Condição | Texto | Antes | Depois | Variáveis |
| --- | --- | --- | --- | --- | --- |
| `OriApiError` timeout | Fetch abortado | "O ORI está acordando a leitura..." | Ação API | Retry/continuação | Nenhuma |
| `OriApiError` rede | Fetch falha | "Não conseguimos sincronizar com o ORI agora..." | Ação API | Fallback | Nenhuma |
| `OriApiError` 401 | Token inválido | "Sua sessão precisa ser atualizada..." | Ação API | Login/retry | Nenhuma |
| PDF timeout | Download demora | "O ORI ainda está preparando o arquivo..." | Clique PDF | Retry | Nenhuma |
| Produto 2 backend | Save/submit falha | "Não conseguimos salvar/enviar o Dossiê agora." | Clique salvar/enviar | Permanece form | `error.userMessage` pode substituir |
| Produto 2 upload | Storage falha | `error.message` ou "Não conseguimos enviar as imagens agora." | Upload | Permanece form | `error.message` bruto possível |

## Variáveis interpoladas recorrentes

- `clienteNome`: usado no portal para saudação.
- `resultadoFinal`: nome do resultado ativo no portal, espelho e oráculo.
- `result.nomeComposto`: resultado do Produto 1.
- `principal` e `secundario`: arquétipos usados em Produto 1/Oráculo/Espelho.
- `report.*`: título, subtítulo, seções, fórmula, highlights e próximo passo no relatório.
- `insumos.*`: campos Produto 2 preenchidos pela cliente ou prefill.
- `dailyOracleCard.*`: carta diária persistida.
- `error.userMessage`: mensagens humanas do wrapper API.
- `error.message`: somente em alguns pontos; no upload Produto 2 pode ser técnico.

## Observação sobre completude

O sistema tem textos longos em `src/data/reports.js`, `backend/app/data/reports.json`, `src/data/produto2Form.js` e `OraculoOri.jsx`. Para revisão de comunicação, esses arquivos devem ser tratados como fontes editoriais completas:

- `reports.js`/`reports.json`: cada resultado arquetípico tem o mesmo conjunto de campos e aparece quando `result.nomeComposto` corresponde à chave.
- `produto2Form.js`: cada `produto2Steps[].fields[]` aparece quando o passo do formulário está ativo e, quando o campo é prefill derivado, a tela sinaliza que já foi preenchido pela jornada.
- `OraculoOri.jsx`: cada carta aparece quando sorteada ou recuperada do dia; mensagens sem resultado são versões seladas, mensagens com resultado interpolam nome do resultado/arquétipos.
