# Inventário de textos estáticos visíveis - Produto 2

Arquivos analisados:

- `src/pages/Produto2.jsx`
- `src/data/produto2Form.js`

Observação: este inventário lista textos estáticos visíveis à cliente. Valores dinâmicos vindos do banco, nomes de arquivos enviados, dados conectados da cliente e conteúdos publicados do Dossiê não foram reescritos aqui.

## `src/pages/Produto2.jsx`

### Avisos e mensagens de sistema

- Label do aviso sincronizado: `Produto 2`
- Erro de upload de imagens: `Não conseguimos enviar suas imagens agora. Tente novamente em instantes — se continuar assim, chame a gente.`
- Sucesso no upload de imagens: `Imagens adicionadas. Salve e continue depois para manter este registro vinculado ao Dossiê.`
- Erro ao carregar: `Não conseguimos carregar o Dossiê ORI agora. Tente novamente em instantes.`
- Sucesso ao salvar rascunho: `Rascunho do Dossiê salvo.`
- Erro ao salvar rascunho: `Não conseguimos salvar o rascunho agora.`
- Sucesso ao enviar: `Informações enviadas. A análise preliminar já foi gerada para revisão.`
- Erro ao enviar: `Não conseguimos enviar o Dossiê agora.`

### Upload de imagens

- Título do bloco: `O que vamos observar`
- Guia: `Corpo inteiro`
- Texto do guia: `frente, perfil e costas`
- Guia: `Rosto`
- Texto do guia: `sem maquiagem, cabelo preso, com blusa branca e preta`
- Guia: `Cabelo`
- Texto do guia: `solto natural, raiz e textura de perto`
- Guia: `Identidade`
- Texto do guia: `um look ou peça com a qual você se reconhece`
- Botão de remoção: `Remover`
- Título de orientação: `Como registrar suas imagens`
- Orientação: `Prefira luz natural, sem filtros e com o mínimo de interferência visual. Quanto mais real a imagem, mais precisa a leitura.`
- Orientação complementar: `Para corpo inteiro, use roupa ajustada ao corpo, como legging e top, ou biquíni. As fotos não precisam estar bonitas; precisam estar fiéis à sua imagem real.`
- Estado do botão durante upload: `Enviando imagens...`
- Botão de upload: `Adicionar imagens da leitura`
- Formatos aceitos: `JPG, PNG ou WEBP`
- Ajuda do upload: `Você pode selecionar várias imagens de uma vez`

### Status do Dossiê

- Status: `Aguardando envio`
- Status: `Em análise`
- Status: `Publicado`

### Dados conectados

- Título pequeno: `Jornada conectada`
- Título: `O que já sabemos sobre sua jornada`
- Texto de apoio: `Veio do cadastro e da primeira leitura, então você não precisa responder de novo.`
- Botão recolher: `Ocultar detalhes`
- Botão expandir: `Ver dados conectados`
- Fallback de nome: `Cliente`
- Card/tag: `Cadastro`
- Card/título: `Perfil`
- Card/tag: `Conferência`
- Card/título: `Primeira leitura`
- Card/tag: `Conectado`
- Card/título: `Ponto de partida`
- Card/tag: `Contexto`
- Sufixo de idade: `anos`

### Aviso de dados da etapa base

- Status pronto: `Dados reunidos`
- Status pendente: `Dados complementares`
- Texto pronto: `As informações principais desta etapa já foram reunidas.`
- Item pendente: `altura`
- Item pendente: `peso aproximado`
- Item pendente: `autoidentificação racial`
- Texto pendente: `{campo} ajuda a calibrar a leitura corporal com mais precisão.`
- Texto pendente plural: `{campos} ajudam a calibrar a leitura corporal com mais precisão.`

### Hero e estados principais

- Eyebrow do hero: `Integração`
- H1: `Dossiê ORI`
- Texto do hero: `Agora vamos observar como sua primeira leitura aparece no corpo, no rosto, nas cores, no cabelo, na beleza e na rotina real.`
- Selo de bloqueio: `não liberado`
- Estado carregando - título: `Carregando Dossiê ORI...`
- Estado carregando - texto: `Estamos buscando suas informações para continuar a leitura.`
- Estado não liberado - título: `Dossiê ORI ainda não liberado`
- Estado não liberado - texto: `Esta etapa abre quando sua próxima leitura estiver disponível. Enquanto isso, sua primeira leitura segue como base da jornada.`
- Estado publicado - título: `Dossiê ORI publicado`
- Estado publicado - texto: `Sua leitura visual já está disponível.`
- Estado em análise - título: `Dossiê ORI em análise`
- Estado em análise - texto: `Sua etapa foi concluída. A leitura visual final agora pode ser construída com mais precisão.`
- Estado liberado - título: `Dossiê ORI liberado`
- Estado liberado - texto: `Esta etapa está aberta para reunir os registros que vão orientar seu Dossiê.`
- Link: `Voltar ao portal`
- Link: `Rever primeira leitura`

### Navegação do formulário

- Indicador de etapa: `Etapa {número} de {total}`
- Texto quando não há campos visíveis na etapa: `Usamos essa informação para calibrar sua leitura de cor e corpo com mais fidelidade à sua pele e à sua ancestralidade — em vez de aplicar uma cartela pensada para outra realidade.`
- Botão: `Voltar`
- Botão: `Próxima etapa`
- Botão salvando: `Salvando...`
- Botão salvar: `Salvar e continuar depois`
- Botão enviando: `Enviando...`
- Botão enviar: `Concluir e enviar para análise`

### Análise preliminar

- Eyebrow: `Análise preliminar`
- Título: `O sistema já organizou os primeiros sinais.`
- Card: `Kibbe`
- Fallback Kibbe: `Aguardando cálculo`
- Card: `Coloração`
- Fallback Coloração: `Aguardando cálculo`
- Métrica: `Profundidade`
- Métrica: `Temperatura`
- Métrica: `Intensidade`
- Card: `Patton`
- Fallback Patton: `Não aplicado`
- Status Patton: `Aplicável`
- Status Patton: `Não aplicável`
- Card: `Cabelo`
- Fallback Cabelo: `Aguardando cálculo`
- Card: `Arquétipos`
- Fallback Arquétipos: `Herdado da primeira leitura`

### Entrega publicada

- Eyebrow: `Entrega publicada`
- Título: `Seu Dossiê ORI`
- Estado vazio: `O Dossiê foi publicado, mas ainda não há blocos preenchidos.`

## `src/data/produto2Form.js`

### Etapa: base

- Eyebrow: `Primeiros registros`
- Título: `Vamos olhar para sua imagem real`
- Descrição: `Aqui reunimos fotos e informações simples para entender como sua imagem aparece no corpo, no rosto, nas cores e na rotina.`
- Campo: `Registro da sua imagem`
- Ajuda: `Reúna aqui os registros que vão orientar esta primeira leitura visual.`
- Campo: `Sua altura`
- Placeholder: `Ex.: 1,68 m`
- Campo: `Seu peso aproximado`
- Placeholder: `Não precisa ser exato`
- Campo: `Como você se autodeclara racialmente?`
- Opção: `Negra (preta ou parda)`
- Opção: `Branca`
- Opção: `Indígena`
- Opção: `Asiática`
- Opção: `Prefiro não declarar`

### Etapa: corpo

- Eyebrow: `Corpo e rosto`
- Título: `Corpo e linhas`
- Descrição: `Estas respostas ajudam a observar proporção, linhas, ossatura, rosto e ancestralidade física.`
- Campo: `1. Como é a sua linha vertical (a impressão de altura que você passa, não a sua altura real)?`
- Opção: `A. Longa (as pessoas sempre acham que sou mais alta do que realmente sou).`
- Opção: `B. Moderadamente longa (as pessoas às vezes acham que sou um pouco mais alta, mas nem sempre).`
- Opção: `C. Média (as pessoas costumam acertar minha altura ou não se surpreendem).`
- Opção: `D. Pequena (as pessoas costumam achar que sou um pouco mais baixa do que sou).`
- Opção: `E. Muito pequena (é óbvio para todos que sou pequena/petite).`
- Campo: `2. Qual é o formato dos seus ombros?`
- Opção: `A. Estreitos e pontudos.`
- Opção: `B. Largos e rombudos (quadrados com pontas suaves).`
- Opção: `C. Simétricos e equilibrados.`
- Opção: `D. Inclinados/caídos, porém cônicos, afilados.`
- Opção: `E. Inclinados/caídos e arredondados.`
- Campo: `3. Como são seus braços e pernas em relação ao tronco?`
- Opção: `A. Longos e estreitos.`
- Opção: `B. Longos e largos (mais fortes).`
- Opção: `C. Médios (proporcionais ao tronco).`
- Opção: `D. Pequenos (curtos em relação ao tronco).`
- Opção: `E. Muito pequenos e delicados.`
- Campo: `4. Qual é o formato das suas mãos e pés?`
- Opção: `A. Longos e estreitos.`
- Opção: `B. Grandes e largos.`
- Opção: `C. Médios (nem longos, nem largos).`
- Opção: `D. Pequenos, estreitos e delicados.`
- Opção: `E. Pequenos e levemente largos/arredondados.`
- Campo: `5. Qual a forma geral do seu corpo?`
- Opção: `A. Longo, magro e reto (colunar).`
- Opção: `B. Largo e musculoso (tendência a ser atlético).`
- Opção: `C. Simétrico e equilibrado (proporção ampulheta moderada).`
- Opção: `D. Curvilíneo e delicado (ampulheta suave).`
- Opção: `E. Muito arredondado e muito curvilíneo (ampulheta exuberante).`
- Campo: `6. Como é o seu busto e tronco?`
- Opção: `A. Reto e plano (mesmo com peso, não acumula muito aqui).`
- Opção: `B. Largo e reto (tendência a tronco largo).`
- Opção: `C. Moderado e simétrico.`
- Opção: `D. Suave e levemente curvilíneo.`
- Opção: `E. Muito proeminente e arredondado.`
- Campo: `7. Como é a sua linha de cintura?`
- Opção: `A. Reta e longa (mesmo magra, a cintura é pouco definida), mas estreita.`
- Opção: `B. Reta e larga, mas curta.`
- Opção: `C. Moderada e levemente definida.`
- Opção: `D. Muito marcada e fina.`
- Opção: `E. Suavemente definida, mas com tendência a ser larga.`
- Campo: `8. Como são seus quadris?`
- Opção: `A. Retos, estreitos e cônicos.`
- Opção: `B. Retos e levemente largos.`
- Opção: `C. Médios e simétricos.`
- Opção: `D. Arredondados e proeminentes.`
- Opção: `E. Muito arredondados e muito largos.`
- Campo: `9. Se você ganha peso, onde ele se acumula primeiro?`
- Opção: `A. Quase não mudo; o peso se espalha uniformemente.`
- Opção: `B. Na cintura e abdômen (corpo fica mais "quadrado").`
- Opção: `C. Uniformemente, mantendo a simetria.`
- Opção: `D. Nos quadris e coxas.`
- Opção: `E. No rosto, braços e coxas (fica muito arredondado).`
- Campo: `10. Qual o formato da sua mandíbula?`
- Opção: `A. Afiada, pontuda ou muito quadrada.`
- Opção: `B. Larga ou rombuda (quadrada suave).`
- Opção: `C. Moderada e simétrica.`
- Opção: `D. Delicada, estreita ou levemente pontuda.`
- Opção: `E. Arredondada e levemente larga.`
- Campo: `11. Qual o formato do seu nariz?`
- Opção: `A. Afiado ou proeminente.`
- Opção: `B. Largo ou rombudo.`
- Opção: `C. Médio e simétrico.`
- Opção: `D. Pequeno e estreito.`
- Opção: `E. Pequeno e arredondado.`
- Campo: `12. Como são as suas maçãs do rosto?`
- Opção: `A. Altas e afiadas.`
- Opção: `B. Largas.`
- Opção: `C. Simétricas e moderadas.`
- Opção: `D. Delicadas e estreitas.`
- Opção: `E. Arredondadas e cheias ("maçãs do rosto de bebê").`
- Campo: `13. Qual o formato dos seus olhos?`
- Opção: `A. Pequenos e amendoados.`
- Opção: `B. Estreitos e largos.`
- Opção: `C. Médios e simétricos.`
- Opção: `D. Arredondados e levemente grandes.`
- Opção: `E. Muito grandes e muito redondos.`
- Campo: `14. Qual o formato dos seus lábios?`
- Opção: `A. Finos e retos.`
- Opção: `B. Retos, mas levemente largos (não carnudos).`
- Opção: `C. Médios e simétricos.`
- Opção: `D. Levemente cheios e arredondados.`
- Opção: `E. Muito cheios e muito redondos.`
- Campo: `15. Como você percebe sua ancestralidade física no corpo?`
- Opção: `Predominantemente africana (ossos fortes, volume natural, curvas evidentes, densidade corporal)`
- Opção: `Predominantemente indígena (estrutura mais compacta, ossatura firme, corpo mais contido)`
- Opção: `Predominantemente europeia (estrutura mais fina, proporções alongadas ou delicadas)`
- Opção: `Mista (percebo características combinadas no meu corpo)`
- Opção: `Não sei identificar`

### Etapa: cor

- Eyebrow: `Coloração`
- Título: `Cores e contraste`
- Descrição: `Estas respostas ajudam a entender temperatura, profundidade, contraste, intensidade e fundo de pele.`
- Campo: `16. Temperatura: Como sua pele reage ao sol?`
- Opção: `A. Queimo com facilidade e raramente fico bronzeada. (Frio).`
- Opção: `B. Fico vermelha no início, mas depois o bronzeado fixa (Neutro).`
- Opção: `C. Bronzeio com muita facilidade e fico com um tom dourado (Quente).`
- Campo: `17. Teste dos Metais/Cores`
- Opção: `A. Acessórios prateados e tons de azul/rosa frio`
- Opção: `B. Fico bem tanto com ouro quanto com prata`
- Opção: `C. Acessórios dourados e tons de laranja/terrosos`
- Campo: `18. Qual o nível de escuridão do seu conjunto?`
- Opção: `A. Claro: Tenho pouco contraste, tudo em mim é clarinho (ex: pele clara, olhos claros, cabelo loiro/castanho claro).`
- Opção: `B. Média: Não sou nem muito clara, nem muito escura.`
- Opção: `C. Escuro/Profundo: Meus olhos e cabelos são muito escuros e a pele tem presença (ex: pele retinta ou pele clara com cabelos/olhos pretos).`
- Campo: `19. Como você definiria a "intensidade" da sua beleza?`
- Opção: `A. Opaca/Suave: Minha beleza é mais "contida" ou suave. Cores muito vibrantes parecem "chegar antes" de mim.`
- Opção: `B. Moderada / Neutra`
- Opção: `C. Brilhante/Intensa: Meus olhos têm cor/brilho vivo e minha pele tem viço. Fico ótima com cores puras e fortes (ex: batom vermelho vivo, cores neon).`
- Campo: `20. Olhando para uma foto sua em preto e branco, como aparece o contraste?`
- Opção: `A. Baixo Contraste: Minha pele, olhos e cabelos têm tons muito parecidos (ex: tudo muito claro ou tudo muito escuro/retinto).`
- Opção: `B. Médio Contraste: Existe uma diferença clara, mas não é chocante.`
- Opção: `C. Alto Contraste: A diferença é muito grande (ex: pele muito clara e cabelo muito preto, ou dentes e olhos que "saltam" muito no rosto).`
- Campo: `21. Teste das Cores (Azul vs. Laranja)`
- Opção: `A. Azul Royal / Azul Marinho: Sinto que tons frios me deixam mais elegante e com a pele uniforme. (Indica Subtom Frio)`
- Opção: `B. Não sei dizer / Não vejo diferença`
- Opção: `C. Laranja / Terracota / Amarelo Mostarda: Sinto que tons quentes me dão um "ar de saúde" e viço. (Indica Subtom Quente)`
- Campo: `22. Veias e Subtom`
- Opção: `A. Azuis ou Roxas`
- Opção: `B. Mistura de ambas / Difícil identificar:`
- Opção: `C. Esverdeadas ou Olivas`
- Campo: `23. Reação a Batons`
- Opção: `A. Rosa choque, Vinho ou Vermelho "cereja" (rosado): Tons frios e intensos.`
- Opção: `B. Tons suaves, "cor de boca" e sem muito brilho: Tons opacos/suaves.`
- Opção: `C. Nude amarronzado, Coral ou Vermelho "tomate" (alaranjado): Tons quentes.`
- Campo: `24. Ao usar batons em tons de "Nude"`
- Opção: `A. Nudes rosados ou "cor de malva" (Frio).`
- Opção: `B. Fico bem com vários tons, desde que não sejam extremos. (Neutro).`
- Opção: `C. Nudes amarronzados, pêssego ou "cor de terra" (Quente).`
- Campo: `25. Como você sente que as cores vibrantes funcionam em você?`
- Opção: `A. Elas me deixam pálida ou parecem "separadas" do meu rosto (Indica pele de Intensidade Suave/Opaca).`
- Opção: `B. Depende muito da cor, algumas funcionam e outras não. (Moderado).`
- Opção: `C. Eu sustento bem cores fortes; elas parecem acender meu viço natural (Indica pele de Intensidade Brilhante).`
- Campo: `26. Sobre a gengiva e a parte interna dos lábios`
- Opção: `A. Um rosa mais azulado ou arroxeado (Frio).`
- Opção: `B. Um rosa equilibrado. (Neutro).`
- Opção: `C. Um rosa mais alaranjado ou pêssego (Quente).`
- Campo: `27. Se você usar uma roupa totalmente Laranja vibrante`
- Opção: `A. Sinto que fico "amarelada" ou com aspecto cansado`
- Opção: `B. Não é minha melhor cor, mas também não é a pior.`
- Opção: `C. Me sinto iluminada, combina com a energia da minha pele`
- Campo: `28. Como sua pele se comporta em relação ao brilho natural e texturas?`
- Opção: `A. Minha pele tem um aspecto mais mate/aveludado; o excesso de brilho em acessórios ou maquiagem parece "brigar" com a minha pele.`
- Opção: `B. Tenho um equilíbrio; consigo transitar entre o brilho e o opaco sem grandes perdas. (Neutro)`
- Opção: `C. Minha pele tem um viço natural "aceso"; fico muito melhor com brilhos, acessórios polidos, pedras brilhantes e maquiagem iluminada.`
- Campo: `29. Tom de Fundo`
- Opção: `A. Azulada/Arroxeada: Sinto que minha pele tem uma sombra profunda, quase azul em certos ângulos. (Blues/Jazz)`
- Opção: `B. Acinzentada/Rosada: Minha pele é mais clara ou média, com um fundo que puxa para o cinza ou rosa frio. (Nilo)`
- Opção: `C. Dourada/Amarelada: Minha pele brilha como ouro no sol. (Calypso/Saara)`
- Opção: `D. Avermelhada/Jambo: Minha pele tem um calor avermelhado intenso, cor de terra quente. (Spice)`
- Campo: `30. Validação de Fundo`
- Opção: `A. Fundo escuro azulado: Minha pele é retinta e profunda, com uma sombra fria que puxa para o azul. (Blues)`
- Opção: `B. Fundo escuro chocolate/arroxeado: Minha pele é escura e intensa, com um fundo marrom profundo e frio. (Jazz)`
- Opção: `C. Fundo claro acinzentado ou rosado: Minha pele é clara ou média, com uma nuance fria, oliva e suave. (Nilo)`
- Opção: `D. Fundo claro amarelado ou bege quente: Minha pele é clara a média, com um tom de "areia", bege ou dourado suave. (Saara)`
- Opção: `E. Fundo médio dourado: Minha pele é visivelmente intensa, quente, solar e bronzeia com facilidade. (Calypso)`
- Opção: `F. Fundo médio avermelhado (cor de jambo): Minha pele é quente e tem um brilho terroso ou "quente" intenso e avermelhado. (Spice)`

### Etapa: cabelo

- Eyebrow: `Cabelo`
- Título: `Cabelo e rotina`
- Descrição: `Estas respostas ajudam a entender curvatura, fio, volume, cuidado possível e a moldura do seu rosto.`
- Campo: `31. Curvatura`
- Opção: `A. Liso (1 A/B/C)`
- Opção: `B. Ondulado (2 A/B/C)`
- Opção: `C. Cacheado (3 A/B/C)`
- Opção: `D. Crespo (4 A/B/C)`
- Opção: `E. Não sei / Estou em transição`
- Campo: `32. Espessura do Fio`
- Opção: `A. Fino (quase não sinto, quebra com facilidade).`
- Opção: `B. Médio.`
- Opção: `C. Grosso (sinto o fio bem presente, é resistente).`
- Campo: `33. Porosidade e Absorção`
- Opção: `A. Demora muito para secar (Baixa porosidade - as cutículas são muito fechadas).`
- Opção: `B. Absorve bem a água e seca em tempo normal (Porosidade média).`
- Opção: `C. Demora para molhar, mas "bebe" o produto e seca muito rápido (Alta porosidade - o fio está com as cutículas abertas/danificadas).`
- Campo: `34. Densidade`
- Opção: `A. Pouco cabelo (consigo dar muitas voltas com o elástico).`
- Opção: `B. Quantidade média.`
- Opção: `C. Muito cabelo (o elástico mal consegue dar duas voltas, sinto "muito peso").`
- Campo: `35. Relação com o Volume`
- Opção: `A. Prefiro ele controlado, com menos volume e mais definição/alinhamento.`
- Opção: `B. Gosto de um volume equilibrado.`
- Opção: `C. Amo o volume máximo! Sinto que o volume faz parte da minha presença e poder.`
- Campo: `36. Saúde e Química`
- Opção: `A. Natural (sem químicas de transformação).`
- Opção: `B. Colorido ou com Mechas (uso química de cor, mas mantenho a curvatura).`
- Opção: `C. Alisado / Relaxado / Transição (uso química para mudar a estrutura ou estou parando de usar agora).`
- Campo: `37. Comportamento no Day After`
- Opção: `A. Mantém a forma e o brilho com pouco esforço.`
- Opção: `B. Perde a definição, mas ganha um volume que eu gosto.`
- Opção: `C. Amassa, embaraça muito ou perde totalmente a forma (exige revitalização completa).`
- Campo: `38. Quanto tempo você dedica ao seu cabelo na semana?`
- Opção: `A. Praticidade total: lavo e deixo secar naturalmente, não gasto mais de 15 min.`
- Opção: `B. Dedicação moderada: gosto de finalizar com produtos específicos e uso difusor às vezes.`
- Opção: `C. Ritual completo: invisto tempo em finalizações detalhadas (dedoliss, fitagem) e tratamentos profundos.`
- Campo: `39. O "Cabelo dos Sonhos"`
- Opção: `A. Gostaria de ter mais brilho e saúde, mantendo o que já tenho.`
- Opção: `B. Gostaria de aprender a lidar com o volume/frizz sem "brigar" com ele.`
- Opção: `C. Gostaria de mudar radicalmente (cor, corte ou textura) para me sentir mais eu mesma.`
- Campo: `40. Percepção de Moldura`
- Opção: `A. Sim, sinto que ele é minha marca registrada e me representa 100%.`
- Opção: `B. Às vezes sim, às vezes não. Ainda estou em busca da minha melhor versão.`
- Opção: `C. Não, sinto que ele esconde quem eu sou ou que ainda não encontrei o corte/estilo certo.`

### Etapa: essência

- Eyebrow: `Síntese pessoal`
- Título: `Como você se percebe agora`
- Descrição: `Sua primeira leitura já trouxe uma direção. Aqui você conta o que faz sentido e qual desafio de imagem ainda precisa ser cuidado.`
- Campo: `43. Identificação com o Arquétipo Mesclado`
- Opção: `Sim, descreve exatamente como me sinto.`
- Opção: `Em partes, sinto que uma deusa domina muito mais que a outra.`
- Opção: `Não, ainda me sinto confusa sobre essa combinação.`
- Campo: `44. Desafio de Estilo`
- Campo: `45. Espaço Telúrica`

### Campos conectados/revisão

- Campo conectado: `Nome`
- Campo conectado: `E-mail`
- Campo conectado: `WhatsApp`
- Campo conectado: `Cidade/Estado`
- Campo conectado: `Idade`
- Campo conectado: `Autoidentificação racial`
- Campo conectado: `Resultado da primeira leitura`
- Campo conectado: `Deusa principal`
- Campo conectado: `Deusa auxiliar`
- Campo conectado: `Arquétipo composto`
- Campo conectado: `Momento atual`
- Campo conectado: `Dor atual`
- Campo conectado: `Objetivo principal`
