export const produto2EmptyInsumos = {
  dados_base: {
    nome: "",
    idade: "",
    endereco: "",
    whatsapp: "",
    email: "",
    redes_sociais: "",
    altura: "",
    peso_aproximado: "",
    autoidentificacao_racial: "",
  },
  uploads: {
    fotos_validacao: "",
  },
  estrutura_corporal: {
    linha_vertical: "",
    ombros: "",
    bracos_pernas: "",
    maos_pes: "",
    forma_geral: "",
    busto_tronco: "",
    cintura: "",
    quadris: "",
    ganho_peso: "",
    mandibula: "",
    nariz: "",
    macas_rosto: "",
    olhos: "",
    labios: "",
    ancestralidade_fisica: "",
  },
  coloracao: {
    reacao_sol: "",
    metais: "",
    profundidade: "",
    intensidade: "",
    contraste_preto_branco: "",
    azul_laranja: "",
    veias_subtom: "",
    batons: "",
    nude: "",
    cores_vibrantes: "",
    gengiva_labios: "",
    laranja_vibrante: "",
    brilho_texturas: "",
  },
  patton: {
    tom_fundo: "",
    reflexo_sol: "",
  },
  cabelo: {
    curvatura: "",
    espessura_fio: "",
    porosidade_absorcao: "",
    densidade: "",
    relacao_volume: "",
    saude_quimica: "",
    day_after: "",
    tempo_rotina: "",
    cabelo_dos_sonhos: "",
    percepcao_moldura: "",
  },
  essencia: {
    deusa_principal: "",
    deusa_auxiliar: "",
    identificacao_arquetipo_mesclado: "",
    arquetipo_mesclado: "",
  },
  jornada: {
    resultado_produto_1: "",
    momento_atual: "",
    dor_atual: "",
    objetivo_principal: "",
    perfil_onboarding_concluido: false,
  },
  desafio_imagem: {
    dificuldade_atual: "",
  },
  espaco_telurica: "",
};

const field = (path, label, type = "text", options = [], meta = {}) => ({
  path,
  label,
  type,
  options,
  ...meta,
});

const radio = (path, label, options) => field(path, label, "radio", options);

const visualReferencePath = (page) =>
  `/images/produto-2/forms-referencias/form-page-${String(page).padStart(2, "0")}.jpg`;

const optionReferencePath = (fieldPath, index) =>
  `/images/produto-2/opcoes-referencias/${fieldPath
    .replaceAll(".", "-")
    .replaceAll("_", "-")}-${"abcdef"[index]}.jpg`;

const visualReferencesByPath = {
  "estrutura_corporal.linha_vertical": visualReferencePath(5),
  "estrutura_corporal.ombros": visualReferencePath(6),
  "estrutura_corporal.bracos_pernas": visualReferencePath(7),
  "estrutura_corporal.maos_pes": visualReferencePath(8),
  "estrutura_corporal.forma_geral": visualReferencePath(9),
  "estrutura_corporal.busto_tronco": visualReferencePath(10),
  "estrutura_corporal.cintura": visualReferencePath(11),
  "estrutura_corporal.quadris": visualReferencePath(12),
  "estrutura_corporal.ganho_peso": visualReferencePath(13),
  "estrutura_corporal.mandibula": visualReferencePath(14),
  "estrutura_corporal.nariz": visualReferencePath(15),
  "estrutura_corporal.macas_rosto": visualReferencePath(16),
  "estrutura_corporal.olhos": visualReferencePath(17),
  "estrutura_corporal.labios": visualReferencePath(18),
  "estrutura_corporal.ancestralidade_fisica": visualReferencePath(19),
  "coloracao.reacao_sol": visualReferencePath(20),
  "coloracao.metais": visualReferencePath(21),
  "coloracao.profundidade": visualReferencePath(22),
  "coloracao.intensidade": visualReferencePath(23),
  "coloracao.contraste_preto_branco": visualReferencePath(24),
  "coloracao.azul_laranja": visualReferencePath(25),
  "coloracao.veias_subtom": visualReferencePath(25),
  "coloracao.batons": visualReferencePath(26),
  "coloracao.nude": visualReferencePath(27),
  "coloracao.cores_vibrantes": visualReferencePath(28),
  "coloracao.gengiva_labios": visualReferencePath(28),
  "coloracao.laranja_vibrante": visualReferencePath(29),
  "coloracao.brilho_texturas": visualReferencePath(30),
  "patton.tom_fundo": visualReferencePath(31),
  "patton.reflexo_sol": visualReferencePath(32),
  "cabelo.curvatura": visualReferencePath(33),
  "cabelo.espessura_fio": visualReferencePath(33),
  "cabelo.porosidade_absorcao": visualReferencePath(33),
  "cabelo.densidade": visualReferencePath(34),
  "cabelo.relacao_volume": visualReferencePath(34),
  "cabelo.saude_quimica": visualReferencePath(35),
  "cabelo.day_after": visualReferencePath(35),
  "cabelo.tempo_rotina": visualReferencePath(35),
  "cabelo.cabelo_dos_sonhos": visualReferencePath(36),
  "cabelo.percepcao_moldura": visualReferencePath(36),
  "essencia.deusa_principal": visualReferencePath(36),
  "essencia.deusa_auxiliar": visualReferencePath(37),
  "essencia.identificacao_arquetipo_mesclado": visualReferencePath(37),
  "desafio_imagem.dificuldade_atual": visualReferencePath(37),
  espaco_telurica: visualReferencePath(38),
};

const optionReferenceCountsByPath = {
  "estrutura_corporal.linha_vertical": 5,
};

const addVisualReferences = (steps) =>
  steps.map((step) => ({
    ...step,
    fields: step.fields.map((item) => {
      const optionReferenceCount = optionReferenceCountsByPath[item.path] || 0;

      return {
        ...item,
        referenceImage: item.type === "radio" ? undefined : visualReferencesByPath[item.path],
        options: optionReferenceCount
          ? item.options.map((option, index) => ({
              label: option,
              image:
                index < optionReferenceCount
                  ? optionReferencePath(item.path, index)
                  : undefined,
            }))
          : item.options,
      };
    }),
  }));

const produto2RawSteps = [
  {
    id: "base",
    eyebrow: "Primeiros registros",
    title: "Vamos olhar para sua imagem real",
    description:
      "Aqui reunimos fotos e informações simples para entender como sua imagem aparece no corpo, no rosto, nas cores e na rotina.",
    fields: [
      field("uploads.fotos_validacao", "Faça aqui o upload das suas fotos (usaremos para validar suas respostas)", "fileUpload", [], {
        helper:
          "Reúna aqui os registros que vão orientar esta primeira leitura visual.",
      }),
      field("dados_base.redes_sociais", "Suas redes sociais (Instagram, Tiktok, etc)", "text", [], {
        placeholder: "@seuusuario",
      }),
      field("dados_base.altura", "Qual é a sua altura?", "text", [], {
        placeholder: "Ex.: 1,68 m",
      }),
      field("dados_base.peso_aproximado", "Qual é o seu peso aproximado", "text", [], {
        placeholder: "Não precisa ser exato",
      }),
      radio("dados_base.autoidentificacao_racial", "Como você se autodeclara racialmente?", [
        "Negra (preta ou parda)",
        "Branca",
        "Indígena",
        "Asiática",
        "Prefiro não declarar",
      ]),
    ],
  },
  {
    id: "corpo",
    eyebrow: "Corpo e rosto",
    title: "Corpo e linhas",
    description: "Estas respostas ajudam a observar proporção, linhas, ossatura, rosto e ancestralidade física.",
    fields: [
      radio("estrutura_corporal.linha_vertical", "1. Como é a sua linha vertical (a impressão de altura que você passa, não a sua altura real)?", [
        "A. Longa (as pessoas sempre acham que sou mais alta do que realmente sou).",
        "B. Moderadamente longa (as pessoas às vezes acham que sou um pouco mais alta, mas nem sempre).",
        "C. Média (as pessoas costumam acertar minha altura ou não se surpreendem).",
        "D. Pequena (as pessoas costumam achar que sou um pouco mais baixa do que sou).",
        "E. Muito pequena (é óbvio para todos que sou pequena/petite).",
      ]),
      radio("estrutura_corporal.ombros", "2. Qual é o formato dos seus ombros?", [
        "A. Estreitos e pontudos.",
        "B. Largos e rombudos (quadrados com pontas suaves).",
        "C. Simétricos e equilibrados.",
        "D. Inclinados/caídos, porém cônicos, afilados.",
        "E. Inclinados/caídos e arredondados.",
      ]),
      radio("estrutura_corporal.bracos_pernas", "3. Como são seus braços e pernas em relação ao tronco?", [
        "A. Longos e estreitos.",
        "B. Longos e largos (mais fortes).",
        "C. Médios (proporcionais ao tronco).",
        "D. Pequenos (curtos em relação ao tronco).",
        "E. Muito pequenos e delicados.",
      ]),
      radio("estrutura_corporal.maos_pes", "4. Qual é o formato das suas mãos e pés?", [
        "A. Longos e estreitos.",
        "B. Grandes e largos.",
        "C. Médios (nem longos, nem largos).",
        "D. Pequenos, estreitos e delicados.",
        "E. Pequenos e levemente largos/arredondados.",
      ]),
      radio("estrutura_corporal.forma_geral", "5. Qual a forma geral do seu corpo?", [
        "A. Longo, magro e reto (colunar).",
        "B. Largo e musculoso (tendência a ser atlético).",
        "C. Simétrico e equilibrado (proporção ampulheta moderada).",
        "D. Curvilíneo e delicado (ampulheta suave).",
        "E. Muito arredondado e muito curvilíneo (ampulheta exuberante).",
      ]),
      radio("estrutura_corporal.busto_tronco", "6. Como é o seu busto e tronco?", [
        "A. Reto e plano (mesmo com peso, não acumula muito aqui).",
        "B. Largo e reto (tendência a tronco largo).",
        "C. Moderado e simétrico.",
        "D. Suave e levemente curvilíneo.",
        "E. Muito proeminente e arredondado.",
      ]),
      radio("estrutura_corporal.cintura", "7. Como é a sua linha de cintura?", [
        "A. Reta e longa (mesmo magra, a cintura é pouco definida), mas estreita.",
        "B. Reta e larga, mas curta.",
        "C. Moderada e levemente definida.",
        "D. Muito marcada e fina.",
        "E. Suavemente definida, mas com tendência a ser larga.",
      ]),
      radio("estrutura_corporal.quadris", "8. Como são seus quadris?", [
        "A. Retos, estreitos e cônicos.",
        "B. Retos e levemente largos.",
        "C. Médios e simétricos.",
        "D. Arredondados e proeminentes.",
        "E. Muito arredondados e muito largos.",
      ]),
      radio("estrutura_corporal.ganho_peso", "9. Se você ganha peso, onde ele se acumula primeiro?", [
        "A. Quase não mudo; o peso se espalha uniformemente.",
        "B. Na cintura e abdômen (corpo fica mais \"quadrado\").",
        "C. Uniformemente, mantendo a simetria.",
        "D. Nos quadris e coxas.",
        "E. No rosto, braços e coxas (fica muito arredondado).",
      ]),
      radio("estrutura_corporal.mandibula", "10. Qual o formato da sua mandíbula?", [
        "A. Afiada, pontuda ou muito quadrada.",
        "B. Larga ou rombuda (quadrada suave).",
        "C. Moderada e simétrica.",
        "D. Delicada, estreita ou levemente pontuda.",
        "E. Arredondada e levemente larga.",
      ]),
      radio("estrutura_corporal.nariz", "11. Qual o formato do seu nariz?", [
        "A. Afiado ou proeminente.",
        "B. Largo ou rombudo.",
        "C. Médio e simétrico.",
        "D. Pequeno e estreito.",
        "E. Pequeno e arredondado.",
      ]),
      radio("estrutura_corporal.macas_rosto", "12. Como são as suas maçãs do rosto?", [
        "A. Altas e afiadas.",
        "B. Largas.",
        "C. Simétricas e moderadas.",
        "D. Delicadas e estreitas.",
        "E. Arredondadas e cheias (\"maçãs do rosto de bebê\").",
      ]),
      radio("estrutura_corporal.olhos", "13. Qual o formato dos seus olhos?", [
        "A. Pequenos e amendoados.",
        "B. Estreitos e largos.",
        "C. Médios e simétricos.",
        "D. Arredondados e levemente grandes.",
        "E. Muito grandes e muito redondos.",
      ]),
      radio("estrutura_corporal.labios", "14. Qual o formato dos seus lábios?", [
        "A. Finos e retos.",
        "B. Retos, mas levemente largos (não carnudos).",
        "C. Médios e simétricos.",
        "D. Levemente cheios e arredondados.",
        "E. Muito cheios e muito redondos.",
      ]),
      radio("estrutura_corporal.ancestralidade_fisica", "15. Como você percebe sua ancestralidade física no corpo? (Esta pergunta ajuda a refinar sua análise estrutural, considerando como características herdadas influenciam sua silhueta real além dos padrões tradicionais.)", [
        "Predominantemente africana (ossos fortes, volume natural, curvas evidentes, densidade corporal)",
        "Predominantemente indígena (estrutura mais compacta, ossatura firme, corpo mais contido)",
        "Predominantemente europeia (estrutura mais fina, proporções alongadas ou delicadas)",
        "Mista (percebo características combinadas no meu corpo)",
        "Não sei identificar",
      ]),
    ],
  },
  {
    id: "cor",
    eyebrow: "Coloração",
    title: "Cores e contraste",
    description: "Estas respostas ajudam a entender temperatura, profundidade, contraste, intensidade e fundo de pele.",
    fields: [
      radio("coloracao.reacao_sol", "16. Temperatura: Como sua pele reage ao sol?", [
        "A. Queimo com facilidade e raramente fico bronzeada. (Frio).",
        "B. Fico vermelha no início, mas depois o bronzeado fixa (Neutro).",
        "C. Bronzeio com muita facilidade e fico com um tom dourado (Quente).",
      ]),
      radio("coloracao.metais", "17. Teste dos Metais/Cores: O que faz sua pele parecer mais \"viva\" e uniforme?", [
        "A. Acessórios prateados e tons de azul/rosa frio",
        "B. Fico bem tanto com ouro quanto com prata",
        "C. Acessórios dourados e tons de laranja/terrosos",
      ]),
      radio("coloracao.profundidade", "18. Qual o nível de escuridão (profundidade) do conjunto (pele + olhos + cabelo natural)?", [
        "A. Claro: Tenho pouco contraste, tudo em mim é clarinho (ex: pele clara, olhos claros, cabelo loiro/castanho claro).",
        "B. Média: Não sou nem muito clara, nem muito escura.",
        "C. Escuro/Profundo: Meus olhos e cabelos são muito escuros e a pele tem presença (ex: pele retinta ou pele clara com cabelos/olhos pretos).",
      ]),
      radio("coloracao.intensidade", "19. Como você definiria a \"intensidade\" da sua beleza?", [
        "A. Opaca/Suave: Minha beleza é mais \"contida\" ou suave. Cores muito vibrantes parecem \"chegar antes\" de mim.",
        "B. Moderada / Neutra",
        "C. Brilhante/Intensa: Meus olhos têm cor/brilho vivo e minha pele tem viço. Fico ótima com cores puras e fortes (ex: batom vermelho vivo, cores neon).",
      ]),
      radio("coloracao.contraste_preto_branco", "20. Olhando para uma foto sua em preto e branco, qual a diferença entre a cor da sua pele e a cor do seu cabelo/olhos?", [
        "A. Baixo Contraste: Minha pele, olhos e cabelos têm tons muito parecidos (ex: tudo muito claro ou tudo muito escuro/retinto).",
        "B. Médio Contraste: Existe uma diferença clara, mas não é chocante.",
        "C. Alto Contraste: A diferença é muito grande (ex: pele muito clara e cabelo muito preto, ou dentes e olhos que \"saltam\" muito no rosto).",
      ]),
      radio("coloracao.azul_laranja", "21. Teste das Cores (Azul vs. Laranja): Qual dessas cores te faz parecer mais descansada e disfarça olheiras?", [
        "A. Azul Royal / Azul Marinho: Sinto que tons frios me deixam mais elegante e com a pele uniforme. (Indica Subtom Frio)",
        "B. Não sei dizer / Não vejo diferença",
        "C. Laranja / Terracota / Amarelo Mostarda: Sinto que tons quentes me dão um \"ar de saúde\" e viço. (Indica Subtom Quente)",
      ]),
      radio("coloracao.veias_subtom", "22. Veias e Subtom", [
        "A. Azuis ou Roxas",
        "B. Mistura de ambas / Difícil identificar:",
        "C. Esverdeadas ou Olivas",
      ]),
      radio("coloracao.batons", "23. Reação a Batons: Qual tom de batom costuma receber mais elogios em você?", [
        "A. Rosa choque, Vinho ou Vermelho \"cereja\" (rosado): Tons frios e intensos.",
        "B. Tons suaves, \"cor de boca\" e sem muito brilho: Tons opacos/suaves.",
        "C. Nude amarronzado, Coral ou Vermelho \"tomate\" (alaranjado): Tons quentes.",
      ]),
      radio("coloracao.nude", "24. Ao usar batons em tons de \"Nude\", qual o resultado que você prefere ou que fica mais harmônico?", [
        "A. Nudes rosados ou \"cor de malva\" (Frio).",
        "B. Fico bem com vários tons, desde que não sejam extremos. (Neutro).",
        "C. Nudes amarronzados, pêssego ou \"cor de terra\" (Quente).",
      ]),
      radio("coloracao.cores_vibrantes", "25. Como você sente que as cores vibrantes (como um Amarelo Canário ou um Pink) reagem no seu rosto?", [
        "A. Elas me deixam pálida ou parecem \"separadas\" do meu rosto (Indica pele de Intensidade Suave/Opaca).",
        "B. Depende muito da cor, algumas funcionam e outras não. (Moderado).",
        "C. Eu sustento bem cores fortes; elas parecem acender meu viço natural (Indica pele de Intensidade Brilhante).",
      ]),
      radio("coloracao.gengiva_labios", "26. Sobre a gengiva e a parte interna dos lábios", [
        "A. Um rosa mais azulado ou arroxeado (Frio).",
        "B. Um rosa equilibrado. (Neutro).",
        "C. Um rosa mais alaranjado ou pêssego (Quente).",
      ]),
      radio("coloracao.laranja_vibrante", "27. Se você usar uma roupa totalmente Laranja vibrante", [
        "A. Sinto que fico \"amarelada\" ou com aspecto cansado",
        "B. Não é minha melhor cor, mas também não é a pior.",
        "C. Me sinto iluminada, combina com a energia da minha pele",
      ]),
      radio("coloracao.brilho_texturas", "28. Como sua pele se comporta em relação ao brilho natural e texturas?", [
        "A. Minha pele tem um aspecto mais mate/aveludado; o excesso de brilho em acessórios ou maquiagem parece \"brigar\" com a minha pele.",
        "B. Tenho um equilíbrio; consigo transitar entre o brilho e o opaco sem grandes perdas. (Neutro)",
        "C. Minha pele tem um viço natural \"aceso\"; fico muito melhor com brilhos, acessórios polidos, pedras brilhantes e maquiagem iluminada.",
      ]),
      radio("patton.tom_fundo", "29: Tom de Fundo. --> Instrução: Observe a nuance que mais se destaca na sua pele sob a luz do dia.", [
        "A. Azulada/Arroxeada: Sinto que minha pele tem uma sombra profunda, quase azul em certos ângulos. (Blues/Jazz)",
        "B. Acinzentada/Rosada: Minha pele é mais clara ou média, com um fundo que puxa para o cinza ou rosa frio. (Nilo)",
        "C. Dourada/Amarelada: Minha pele brilha como ouro no sol. (Calypso/Saara)",
        "D. Avermelhada/Jambo: Minha pele tem um calor avermelhado intenso, cor de terra quente. (Spice)",
      ]),
      radio("patton.reflexo_sol", "30. Validação de Fundo: Ao observar sua pele no sol, qual \"reflexo\" é mais nítido?", [
        "A. Fundo escuro azulado: Minha pele é retinta e profunda, com uma sombra fria que puxa para o azul. (Blues)",
        "B. Fundo escuro chocolate/arroxeado: Minha pele é escura e intensa, com um fundo marrom profundo e frio. (Jazz)",
        "C. Fundo claro acinzentado ou rosado: Minha pele é clara ou média, com uma nuance fria, oliva e suave. (Nilo)",
        "D. Fundo claro amarelado ou bege quente: Minha pele é clara a média, com um tom de \"areia\", bege ou dourado suave. (Saara)",
        "E. Fundo médio dourado: Minha pele é visivelmente intensa, quente, solar e bronzeia com facilidade. (Calypso)",
        "F. Fundo médio avermelhado (cor de jambo): Minha pele é quente e tem um brilho terroso ou \"quente\" intenso e avermelhado. (Spice)",
      ]),
    ],
  },
  {
    id: "cabelo",
    eyebrow: "Cabelo",
    title: "Cabelo e rotina",
    description: "Estas respostas ajudam a entender curvatura, fio, volume, cuidado possível e a moldura do seu rosto.",
    fields: [
      radio("cabelo.curvatura", "31. Curvatura:", [
        "A. Liso (1 A/B/C)",
        "B. Ondulado (2 A/B/C)",
        "C. Cacheado (3 A/B/C)",
        "D. Crespo (4 A/B/C)",
        "E. Não sei / Estou em transição",
      ]),
      radio("cabelo.espessura_fio", "32. Espessura do Fio: Ao pegar um único fio de cabelo, como você o sente entre os dedos?", [
        "A. Fino (quase não sinto, quebra com facilidade).",
        "B. Médio.",
        "C. Grosso (sinto o fio bem presente, é resistente).",
      ]),
      radio("cabelo.porosidade_absorcao", "33. Porosidade e Absorção: Como seu cabelo reage à água e aos produtos?", [
        "A. Demora muito para secar (Baixa porosidade - as cutículas são muito fechadas).",
        "B. Absorve bem a água e seca em tempo normal (Porosidade média).",
        "C. Demora para molhar, mas \"bebe\" o produto e seca muito rápido (Alta porosidade - o fio está com as cutículas abertas/danificadas).",
      ]),
      radio("cabelo.densidade", "34. Densidade: Se você fizer um rabo de cavalo, qual a sensação de volume na base?", [
        "A. Pouco cabelo (consigo dar muitas voltas com o elástico).",
        "B. Quantidade média.",
        "C. Muito cabelo (o elástico mal consegue dar duas voltas, sinto \"muito peso\").",
      ]),
      radio("cabelo.relacao_volume", "35. Relação com o Volume", [
        "A. Prefiro ele controlado, com menos volume e mais definição/alinhamento.",
        "B. Gosto de um volume equilibrado.",
        "C. Amo o volume máximo! Sinto que o volume faz parte da minha presença e poder.",
      ]),
      radio("cabelo.saude_quimica", "36. Saúde e Química", [
        "A. Natural (sem químicas de transformação).",
        "B. Colorido ou com Mechas (uso química de cor, mas mantenho a curvatura).",
        "C. Alisado / Relaxado / Transição (uso química para mudar a estrutura ou estou parando de usar agora).",
      ]),
      radio("cabelo.day_after", "37. Comportamento no Day After", [
        "A. Mantém a forma e o brilho com pouco esforço.",
        "B. Perde a definição, mas ganha um volume que eu gosto.",
        "C. Amassa, embaraça muito ou perde totalmente a forma (exige revitalização completa).",
      ]),
      radio("cabelo.tempo_rotina", "38. Quanto tempo você dedica ao seu cabelo na semana?", [
        "A. Praticidade total: lavo e deixo secar naturalmente, não gasto mais de 15 min.",
        "B. Dedicação moderada: gosto de finalizar com produtos específicos e uso difusor às vezes.",
        "C. Ritual completo: invisto tempo em finalizações detalhadas (dedoliss, fitagem) e tratamentos profundos.",
      ]),
      radio("cabelo.cabelo_dos_sonhos", "39. O \"Cabelo dos Sonhos\"", [
        "A. Gostaria de ter mais brilho e saúde, mantendo o que já tenho.",
        "B. Gostaria de aprender a lidar com o volume/frizz sem \"brigar\" com ele.",
        "C. Gostaria de mudar radicalmente (cor, corte ou textura) para me sentir mais eu mesma.",
      ]),
      radio("cabelo.percepcao_moldura", "40. Percepção de Moldura: Você sente que seu cabelo hoje \"conversa\" com quem você é internamente?", [
        "A. Sim, sinto que ele é minha marca registrada e me representa 100%.",
        "B. Às vezes sim, às vezes não. Ainda estou em busca da minha melhor versão.",
        "C. Não, sinto que ele esconde quem eu sou ou que ainda não encontrei o corte/estilo certo.",
      ]),
    ],
  },
  {
    id: "essencia",
    eyebrow: "Síntese pessoal",
    title: "Como você se percebe agora",
    description: "Sua primeira leitura já trouxe uma direção. Aqui você conta o que faz sentido e qual desafio de imagem ainda precisa ser cuidado.",
    fields: [
      radio("essencia.identificacao_arquetipo_mesclado", "43. Identificação com o Arquétipo Mesclado: No seu \"Mapa dos Arquétipos\", você se identificou com o nome da combinação sugerida? (Ex: Selvagem Magnética, Musa Enigmática, Soberana Estratégica...)", [
        "Sim, descreve exatamente como me sinto.",
        "Em partes, sinto que uma deusa domina muito mais que a outra.",
        "Não, ainda me sinto confusa sobre essa combinação.",
      ]),
      field("desafio_imagem.dificuldade_atual", "44. Desafio de Estilo: Qual a sua maior dificuldade ao se vestir hoje ou o que mais te incomoda na sua imagem atual?", "textarea"),
      field("espaco_telurica", "45. Espaço Telúrica: Há algo mais sobre sua história, seu corpo ou sua ancestralidade que você gostaria de compartilhar para que seu dossiê seja ainda mais especial?", "textarea"),
    ],
  },
];

export const produto2Steps = addVisualReferences(produto2RawSteps);

export const produto2ConnectedFields = [
  { path: "dados_base.nome", label: "Nome", group: "auto" },
  { path: "dados_base.email", label: "E-mail", group: "auto" },
  { path: "dados_base.whatsapp", label: "WhatsApp", group: "review" },
  { path: "dados_base.endereco", label: "Cidade/Estado", group: "review" },
  { path: "dados_base.idade", label: "Idade", group: "review" },
  { path: "dados_base.autoidentificacao_racial", label: "Autoidentificação racial", group: "review" },
  { path: "jornada.resultado_produto_1", label: "Resultado da primeira leitura", group: "auto" },
  { path: "essencia.deusa_principal", label: "Deusa principal", group: "auto" },
  { path: "essencia.deusa_auxiliar", label: "Deusa auxiliar", group: "auto" },
  { path: "essencia.arquetipo_mesclado", label: "Arquétipo composto", group: "auto" },
  { path: "jornada.momento_atual", label: "Momento atual", group: "review" },
  { path: "jornada.dor_atual", label: "Dor atual", group: "review" },
  { path: "jornada.objetivo_principal", label: "Objetivo principal", group: "review" },
];
