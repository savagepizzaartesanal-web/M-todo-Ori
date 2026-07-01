const proximoPassoPadrao =
  "Para aprofundarmos sua análise no Dossiê ORI, agora é importante preparar sua etapa visual com naturalidade.\n\nTire algumas fotos com boa luz, rosto limpo, sem maquiagem, e corpo usando uma roupa neutra mais ajustada. Essas imagens ajudam a próxima leitura a observar sua presença real sem interferências: corpo, coloração, cabelo, textura, proporção, contraste e direção estética aplicada.\n\nEsse próximo passo não é apenas técnico. É o começo da tradução visual da sua essência. O Código das Deusas revelou a força que organiza sua imagem por dentro. O Dossiê ORI vai mostrar como essa força aparece no corpo, na cor, na beleza e na presença.";

const withDossieClosing = (report) => {
  const alreadyHasDossieClosing = report.leituraFinal?.includes(
    "Para aprofundarmos sua análise no Dossiê ORI",
  );

  return {
    ...report,
    leituraFinal: alreadyHasDossieClosing
      ? report.leituraFinal
      : `${report.leituraFinal}\n\n${proximoPassoPadrao}`,
  };
};

const baseReports = {
  "Musa Enigmática": {
    nome: "Musa Enigmática",
    combinacao: "Afrodite + Perséfone",
    fraseHero: "Você não ocupa o espaço pelo excesso. Ocupa pela atmosfera.",
    reconhecimento:
      "A Musa Enigmática carrega uma presença que não se entrega inteira de imediato. Existe em você uma combinação rara entre magnetismo e profundidade: algo atrai, mas algo também preserva mistério.\n\nVocê não precisa falar alto para ser percebida. Muitas vezes, sua presença altera o clima antes mesmo que você tente explicar quem é. As pessoas podem sentir curiosidade, fascínio ou vontade de se aproximar, mas nem sempre conseguem decifrar exatamente o que existe em você.\n\nAfrodite traz desejo, beleza, sensorialidade e magnetismo. Perséfone traz silêncio, mundo interno, percepção emocional e relação com o invisível. Juntas, elas criam uma mulher cuja força não está em se mostrar inteira, mas em criar uma atmosfera que permanece.",
    essencia:
      "A Musa Enigmática nasce do encontro entre Afrodite e Perséfone: desejo com mistério, beleza com mundo interno, magnetismo com profundidade emocional.\n\nAfrodite desperta sua capacidade de atrair, criar beleza, sentir prazer, tocar o outro pela presença e gerar resposta estética ou afetiva. Perséfone aprofunda essa energia, levando tudo para camadas mais sutis: intuição, silêncio, percepção, recolhimento e sensibilidade aos ambientes.\n\nEssa combinação cria uma mulher que não apenas aparece. Ela evoca. Sua presença costuma deixar uma sensação, uma memória emocional, uma pergunta no ar.",
    dinamica:
      "Seu funcionamento interno segue uma lógica sensível: primeiro você sente, depois entende. Primeiro capta o clima, o olhar, a intenção, o silêncio. Depois tenta organizar internamente o que aquilo provocou em você.\n\nAfrodite quer contato, beleza, desejo e troca. Perséfone quer profundidade, segurança emocional e leitura do invisível. Por isso, você pode se envolver com atmosferas, pessoas e situações antes mesmo de conseguir nomear o que está acontecendo.\n\nSua maturidade começa quando você aprende a diferenciar sensibilidade de dissolução.",
    percebida:
      "Você tende a ser percebida como intensa, feminina, delicada, magnética e difícil de decifrar completamente.\n\nExiste na sua imagem uma tensão interessante: algo convida, mas algo também permanece velado. As pessoas podem sentir que há mais em você do que aquilo que aparece à primeira vista.\n\nSua imagem ganha força quando você assume essa camada de mistério com consciência. Ela perde força quando tenta se tornar excessivamente disponível, explicada ou moldada para ser aceita.",
    sombra:
      "A sombra da Musa Enigmática aparece quando o desejo de conexão se mistura à tendência de se adaptar demais.\n\nAfrodite, em desequilíbrio, pode buscar confirmação pelo olhar: ser desejada, admirada, escolhida ou sentida. Perséfone, em desequilíbrio, pode se dissolver no ambiente, no vínculo ou na emoção que atravessa.\n\nO risco é perder contorno para manter encanto. Você pode sentir o que o outro sente, ajustar sua imagem para preservar uma leitura favorável e, aos poucos, se afastar da própria vontade.",
    padraoRelacional:
      "Nos vínculos, você tende a viver conexão como experiência transformadora. Relações raramente são apenas convivência para você. Elas tocam camadas internas, despertam percepção, desejo, fantasia, medo, cuidado ou recolhimento.\n\nO desafio é diferenciar conexão real de absorção emocional. Nem toda intensidade é intimidade. Nem todo fascínio é destino. Nem toda percepção profunda precisa virar entrega.\n\nSua maturidade relacional nasce quando você consegue permanecer sensível sem se tornar permeável demais.",
    caminho:
      "Seu caminho está em transformar magnetismo em escolha, não em necessidade. E transformar sensibilidade em consciência, não em dissolução.\n\nAfrodite consciente permite prazer, beleza e desejo sem depender de validação. Perséfone consciente permite profundidade, recolhimento e intuição sem desaparecer no mundo interno.\n\nSua síntese é: revelar sem se entregar inteira. Atrair sem se moldar. Sentir profundamente sem se perder no que sente.",
    essenciaImagem:
      "Sua imagem ideal não precisa ser óbvia, literal ou excessivamente exposta. Ela funciona melhor quando sugere, cria curiosidade e mistura suavidade, profundidade e sensualidade velada.\n\nNesta leitura arquetípica, os primeiros códigos visuais são fluidez, névoa, textura, movimento, luminosidade baixa, contraste sutil, transparências controladas e elementos que deixam algo por descobrir.\n\nO que favorece você é uma estética com camadas: algo que acompanha o corpo, mas não entrega tudo; algo que toca o olhar, mas não implora por ele.",
    paleta:
      "Sua direção cromática pede tons emocionais, profundos e levemente enevoados.\n\nBase Perséfone: lavanda, cinza suave, azul acinzentado, lilás profundo, off-white frio, tons de névoa e ameixa suave.\n\nCamada Afrodite: vinho, rosa queimado, rosé profundo, dourado suave, nude frio, malva e brilho perolado discreto.\n\nSua cor não deve gritar. Ela deve criar atmosfera.",
    modelagem:
      "Sua modelagem simbólica pede movimento, envolvimento e revelação parcial.\n\nFuncionam bem vestidos fluidos, saias com queda, blusas levemente translúcidas, sobreposições leves, decotes sutis, assimetrias suaves e caimentos que criam movimento.\n\nA regra central é sugerir, não escancarar. Sua imagem cresce quando existe uma leitura por camadas.",
    tecidos:
      "Os tecidos que melhor traduzem essa composição são aqueles que criam movimento silencioso e sensação tátil: seda, cetim fosco, chiffon, crepe leve, tule sutil, malhas fluidas, viscose leve e texturas translúcidas ou enevoadas.\n\nTecidos muito duros podem endurecer sua delicadeza. Tecidos excessivamente brilhantes podem tornar sua sensualidade óbvia demais.",
    beleza:
      "Na beleza, sua força aparece quando existe iluminação, suavidade e profundidade controlada.\n\nPele viva e luminosa sem excesso, olhos levemente esfumados, boca hidratada em tons rosados queimados ou nude profundo e cabelo com movimento natural traduzem melhor sua atmosfera.\n\nSua beleza funciona quando deixa sensação de presença, não de esforço.",
    presenca:
      "Sua presença se fortalece com movimento fluido, contínuo e sem pressa. Você comunica muito quando não tenta acelerar sua expressão.\n\nO olhar pode sustentar, mas não precisa invadir. O corpo pode se aproximar, mas também preservar espaço.\n\nSua assinatura está nessa alternância entre abertura e recolhimento: você revela, mas não se entrega por inteiro antes de escolher.",
    evitar: [
      "Roupas muito estruturadas, que endurecem sua fluidez.",
      "Visual extremamente básico ou funcional.",
      "Sensualidade explícita demais.",
      "Excesso de exposição direta.",
      "Peças infantis ou doces demais.",
      "Brilho exagerado ou artificial.",
    ],
    formula: "Fluidez + Mistério + Sensualidade velada",
    leituraFinal:
      "Sua imagem ideal não é sobre chamar atenção de forma óbvia. É sobre criar presença emocional. As pessoas talvez não saibam exatamente o que existe em você, mas sentem que há algo.\n\nA Musa Enigmática amadurece quando deixa de usar mistério como proteção inconsciente e passa a usar presença como linguagem. Quando sua estética respeita sua profundidade, você não precisa provar encanto, forçar sensualidade ou se adaptar para permanecer desejável.\n\nSua beleza simbólica está na síntese entre magnetismo e mundo interno: envolvente sem ser disponível demais, delicada sem ser frágil, profunda sem se perder no invisível.",
    proximoPasso: proximoPassoPadrao,
  },

  "Rainha Magnética": {
    nome: "Rainha Magnética",
    combinacao: "Afrodite + Hera",
    fraseHero:
      "Você não quer apenas ser vista. Quer ser escolhida, reconhecida e elevada.",
    reconhecimento:
      "A Rainha Magnética carrega uma presença que não se contenta em apenas aparecer. Existe em você uma necessidade profunda de ser percebida com valor, escolhida com intenção e reconhecida em um lugar que faça sentido para a sua força.\n\nAfrodite traz magnetismo, prazer, beleza, poder de atração e presença sensorial. Hera traz posição, dignidade, vínculo, legitimidade e necessidade de ocupar um lugar simbólico claro.\n\nJuntas, elas formam uma mulher cuja presença não quer apenas encantar. Quer ser reconhecida. Não apenas atrai, mas também cria a sensação de importância.",
    essencia:
      "A Rainha Magnética nasce do encontro entre Afrodite e Hera: desejo com estrutura, beleza com posição, magnetismo com dignidade.\n\nAfrodite transforma presença em desejo. Hera transforma desejo em lugar. Afrodite desperta o olhar. Hera pergunta: qual é o valor desse olhar? Por isso, sua imagem não funciona quando é apenas bonita. Ela precisa parecer significativa.\n\nSua essência pede uma imagem que una atração e respeito. Sensualidade sem vulgaridade. Estrutura sem frieza. Beleza sem submissão.",
    dinamica:
      "Seu funcionamento interno tende a seguir um fluxo: primeiro você atrai, depois observa se existe lugar. Primeiro Afrodite cria campo, encanto e resposta. Depois Hera avalia se existe escolha, prioridade, reconhecimento e consistência.\n\nO desafio aparece quando o olhar externo começa a definir sua medida de valor. Você pode medir sinais, comparar, buscar confirmação ou sentir que perde força quando não é reconhecida como gostaria.",
    percebida:
      "Você tende a ser percebida como forte, feminina, marcante, elegante e naturalmente magnética. Existe na sua presença uma aura de mulher de valor: alguém que não apenas chama atenção, mas parece importante.\n\nAs pessoas podem sentir que você mistura desejo e respeito. Ao mesmo tempo, algumas podem projetar exigência, vaidade ou controle antes mesmo de te conhecerem profundamente.",
    sombra:
      "A sombra da Rainha Magnética aparece quando desejo e reconhecimento deixam de ser expressão natural da identidade e passam a virar prova de valor.\n\nAfrodite, em desequilíbrio, pode buscar confirmação através do olhar e do desejo. Hera, em desequilíbrio, pode buscar segurança através da posição, da definição do vínculo e da necessidade de ser escolhida.\n\nA cura está em lembrar que sua presença não precisa convencer ninguém do seu valor.",
    padraoRelacional:
      "Nos vínculos, você tende a encantar, criar impacto e depois buscar definição. Desejo sem lugar pode se tornar instável para você. Intensidade sem escolha pode parecer insuficiente.\n\nVocê se envolve melhor quando sente admiração, reciprocidade e importância. O risco é confundir intensidade com compromisso, ser escolhida com ser amada e reconhecimento externo com segurança emocional.",
    caminho:
      "Seu caminho está em desejar sem depender e se comprometer sem controlar.\n\nAfrodite consciente permite prazer, beleza e magnetismo como expressão. Hera consciente sustenta dignidade, vínculo e posição sem transformar amor em disputa por legitimidade.\n\nSua síntese é ser desejada sem se medir por isso, ser escolhida sem precisar se provar e ocupar lugar sem guerrear por legitimidade.",
    essenciaImagem:
      "Sua imagem pede elegância que atrai e presença que sustenta posição. Você não precisa exagerar para ser percebida: sua estética funciona melhor quando une poder, intenção e sensualidade controlada.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são estrutura, brilho estratégico, feminilidade adulta, recortes conscientes, acabamento refinado e aura de valor.\n\nO ponto ideal está na tensão entre atração e respeito. Sua imagem precisa parecer escolhida, não improvisada.",
    paleta:
      "Sua lógica cromática nasce do encontro entre base soberana e magnetismo sensual.\n\nBase Hera: preto, off-white, marfim, bege sofisticado, azul profundo, marinho, taupe elegante e cinza quente refinado.\n\nCamada Afrodite: vermelho fechado, vinho, bordô, ameixa quente, rosé profundo, dourado e cobre sofisticado.\n\nSua cor deve parecer intencional, madura e simbolicamente forte.",
    modelagem:
      "Sua modelagem simbólica pede peças que unam desenho, intenção e feminilidade controlada: blazers acinturados, vestidos com marcação de cintura, saias midi estruturadas, calças de corte limpo, decotes controlados e silhuetas femininas com acabamento adulto.\n\nA regra central é mostrar com intenção, nunca por descuido.",
    tecidos:
      "Sua matéria ideal precisa traduzir valor, acabamento e presença tátil: seda, cetim sofisticado, crepe estruturado, alfaiataria premium, viscose encorpada, malhas de boa densidade e tecidos com caimento nobre.\n\nSua imagem pede matéria com peso simbólico.",
    beleza:
      "Na beleza, sua força aparece em acabamento, intenção e presença. Pele polida, cuidada e viva; olhos definidos; boca em nude sofisticado, vermelho, vinho ou rosé profundo; cabelo polido, definido e com forma clara.\n\nSua beleza precisa comunicar: eu me escolhi antes de ser escolhida.",
    presenca:
      "Sua presença se fortalece com postura estável, movimento controlado e ritmo sem pressa. Você não precisa pedir atenção. Você a sustenta.\n\nSua assinatura está em parecer desejável sem parecer disponível demais. Elegante sem parecer fria. Forte sem parecer inacessível.",
    evitar: [
      "Visual casual demais.",
      "Roupa com aparência desleixada.",
      "Estilo excessivamente infantil.",
      "Sensualidade explícita demais.",
      "Visual rígido ou severo demais.",
      "Peças sem estrutura simbólica.",
    ],
    formula: "Estrutura + Magnetismo + Valor",
    leituraFinal:
      "Sua força não está apenas em ser admirada. Está em sustentar uma presença que une desejo e dignidade.\n\nA Rainha Magnética amadurece quando para de buscar a coroa no olhar externo e começa a sustentá-la por dentro. Sua beleza simbólica aparece quando Afrodite e Hera deixam de disputar espaço: quando prazer não compromete dignidade, e dignidade não sufoca prazer.\n\nVocê não precisa provar valor para ser tratada com valor.",
    proximoPasso: proximoPassoPadrao,
  },

  "Amante Nutridora": {
    nome: "Amante Nutridora",
    combinacao: "Afrodite + Deméter",
    fraseHero: "Sua presença não impõe. Ela aquece, aproxima e faz permanecer.",
    reconhecimento:
      "A Amante Nutridora revela uma combinação em que amor não aparece apenas como atração, nem apenas como cuidado. Ele aparece como presença que aquece, envolve e sustenta.\n\nAfrodite traz magnetismo, prazer, beleza, sensualidade e capacidade de criar conexão. Deméter traz acolhimento, nutrição, vínculo, constância afetiva e impulso de sustentar o outro.\n\nJuntas, elas formam uma mulher cuja presença não apenas encanta. Acalma. Não apenas atrai. Faz permanecer.",
    essencia:
      "A Amante Nutridora nasce do encontro entre duas forças profundamente relacionais: Afrodite transforma presença em conexão; Deméter transforma conexão em vínculo.\n\nExiste em você uma necessidade profunda de gerar calor, proximidade e troca viva. Sua força não está em dominar a cena. Está em criar um campo onde o outro baixa a guarda.\n\nSua essência pede uma imagem viva, feminina, sensorial e acolhedora.",
    dinamica:
      "Seu funcionamento interno tende a seguir este fluxo: primeiro você se conecta, depois acolhe, depois nutre e, muitas vezes, passa a sustentar emocionalmente aquilo que começou como troca.\n\nAfrodite abre. Deméter aprofunda. Afrodite cria ponte. Deméter constrói permanência.\n\nO desafio é perceber quando sua disponibilidade deixa de ser troca e vira função.",
    percebida:
      "Sua presença tende a ser lida como acolhedora, feminina, calorosa, sensível, acessível, afetiva e naturalmente agradável de estar por perto.\n\nExiste em você uma sensualidade, mas ela não costuma aparecer como provocação explícita. Ela aparece como maciez, temperatura, doçura encarnada e beleza viva.\n\nVocê não parece apenas bonita. Você parece habitável.",
    sombra:
      "A sombra dessa combinação aparece quando amor e cuidado deixam de ser expressão de essência e passam a se tornar forma de garantir vínculo, valor ou pertencimento.\n\nAfrodite pode buscar validação pela conexão. Deméter pode transformar amor em função e cuidado em obrigação.\n\nA sombra central é cuidar para não perder lugar. Em termos simbólicos, ela aparece quando o cuidado substitui a identidade.",
    padraoRelacional:
      "Nos vínculos, você tende a criar conexão emocional e sensorial com facilidade, se envolver de forma genuína, oferecer acolhimento, presença e cuidado, e começar a sustentar o vínculo com mais energia do que deveria.\n\nO risco é atrair pessoas que precisam ser cuidadas, salvas, organizadas, tranquilizadas ou emocionalmente alimentadas.\n\nSeu amadurecimento relacional está em permitir que o outro também cuide, ofereça e sustente.",
    caminho:
      "Seu crescimento não está em endurecer, deixar de amar ou abandonar sua natureza acolhedora. Seu caminho está em refinar a consciência dessas duas forças.\n\nAfrodite consciente recebe prazer sem culpa e sustenta o próprio desejo. Deméter consciente cuida sem carregar e ama sem se responsabilizar por tudo.\n\nSua síntese é amar sem se sacrificar, nutrir sem se apagar e acolher sem transformar o outro em centro.",
    essenciaImagem:
      "Sua imagem ideal transmite calor, suavidade e magnetismo emocional. Ela não precisa dominar o ambiente. Ela envolve.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são textura, maciez, tons quentes, linhas acolhedoras, feminilidade natural e sensualidade habitável.\n\nSua estética precisa tocar antes de impressionar.",
    paleta:
      "Sua paleta simbólica funciona melhor quando aquece, aproxima e humaniza.\n\nBase Deméter: terracota, bege quente, caramelo, areia dourada, oliva suave, marrom mel, creme amanteigado e argila.\n\nCamada Afrodite: rosa queimado, coral suave, pêssego aquecido, vinho macio, canela rosada, cobre, dourado quente e vermelho queimado.\n\nSua cor ideal não grita. Ela convida.",
    modelagem:
      "Seu corpo simbólico pede roupa que envolva, não que confronte: silhuetas suaves, linhas femininas sem rigidez, peças com movimento, cintura sugerida, caimento macio, vestidos fluidos, saias amplas, tricôs delicados e camisas de tecidos suaves.\n\nA regra central é conforto, feminilidade e acolhimento.",
    tecidos:
      "Sua psique pede matéria tátil: algodão macio, viscose, linho suavizado, malhas leves, tricô fino, seda natural, crepes fluidos e texturas orgânicas agradáveis.\n\nVocê funciona melhor com superfícies que sugerem contato, não distância.",
    beleza:
      "Na beleza, sua força aparece quando existe vida, maciez e cuidado sem rigidez. Pele viçosa e nutrida, olhos suaves, boca em tons quentes e hidratados e cabelo solto ou com movimento sustentam sua presença.\n\nSua beleza funciona quando parece viva, próxima e sensorial.",
    presenca:
      "Sua linguagem corporal ideal não é excessivamente controlada nem teatral. Movimento suave, contínuo, sem dureza e com cadência natural favorece sua energia.\n\nO ponto ideal é calor com centro: uma presença que acolhe sem se oferecer inteira a qualquer demanda.",
    evitar: [
      "Visual rígido ou severamente estruturado.",
      "Excesso de minimalismo frio.",
      "Roupa seca, dura ou sem calor.",
      "Sensualidade explícita demais.",
      "Aparência descuidada.",
      "Funcionalidade sem beleza.",
    ],
    formula: "Calor + Sensualidade + Acolhimento",
    leituraFinal:
      "Sua força não está em ocupar o ambiente pela dureza, pelo ruído ou pela imposição. Sua força está em fazer as pessoas se sentirem vistas, criar conexão real, produzir segurança emocional e unir beleza e humanidade no mesmo campo.\n\nO verdadeiro equilíbrio da Amante Nutridora acontece quando o amor deixa de ser serviço e volta a ser troca. Quando isso se integra, sua imagem floresce como extensão fiel da mulher que você já é.",
    proximoPasso: proximoPassoPadrao,
  },

  "Sedutora Estratégica": {
    nome: "Sedutora Estratégica",
    combinacao: "Afrodite + Athena",
    fraseHero:
      "Você sabe o que está acontecendo — e escolhe como se posicionar.",
    reconhecimento:
      "A Sedutora Estratégica carrega uma mistura de charme e consciência. Você não seduz apenas por impulso, nem depende somente de beleza, espontaneidade ou magnetismo natural. Existe em você uma capacidade de ler o ambiente, perceber jogos sutis e escolher como se posicionar.\n\nAfrodite traz presença sensorial, beleza, desejo e poder de atração. Athena traz lucidez, estratégia, leitura de contexto, inteligência e precisão.\n\nJuntas, elas formam uma mulher que entende que imagem comunica.",
    essencia:
      "A Sedutora Estratégica nasce do encontro entre Afrodite e Athena: magnetismo com clareza, desejo com inteligência, charme com direção.\n\nAfrodite desperta atração, prazer, estética e presença sensorial. Athena organiza essa energia com lucidez, discernimento e leitura estratégica. Por isso, sua beleza não funciona bem quando parece vazia. Ela precisa ter intenção.\n\nSua essência pede uma imagem inteligente: bonita, sim, mas nunca sem mente.",
    dinamica:
      "Seu movimento interno observa antes de agir. Athena lê o cenário; Afrodite cria presença. Primeiro você entende o campo, depois decide como entrar nele.\n\nIsso gera uma sedução sutil, inteligente e pouco óbvia. Você pode atrair mais pela forma como sustenta o olhar, escolhe palavras, organiza a estética e controla a dose de aproximação do que por exposição direta.\n\nO risco é que a mente assuma comando total.",
    percebida:
      "Você tende a ser percebida como inteligente, interessante, elegante e magnética de forma discreta. Existe uma sensação de que você sabe mais do que mostra.\n\nEssa percepção pode gerar admiração, curiosidade e respeito. Mas também pode gerar distância se sua imagem ficar excessivamente controlada, cerebral ou inacessível.\n\nSua força aparece quando inteligência e eros permanecem juntos.",
    sombra:
      "A sombra da Sedutora Estratégica aparece quando o intelecto bloqueia o eros.\n\nAthena pode transformar tudo em análise, cálculo e controle. Afrodite pode usar charme como forma de conduzir o campo sem se expor de verdade.\n\nVocê pode pensar demais antes de sentir, seduzir mantendo distância ou analisar emoções em vez de vivê-las.",
    padraoRelacional:
      "Nos vínculos, você observa, cria conexão com inteligência e charme, mas pode manter certo controle emocional. A abertura costuma ser gradual, porque confiança para você nasce de coerência.\n\nVocê se interessa por pessoas que estimulam sua mente e respeitam sua autonomia. O risco é transformar lucidez em distância.",
    caminho:
      "Seu caminho está em permitir sentir sem analisar tudo e usar sua inteligência sem bloquear a emoção.\n\nAthena consciente oferece discernimento, clareza, estratégia e escolha. Afrodite consciente oferece prazer, magnetismo, presença e corpo vivo.\n\nA Sedutora Estratégica amadurece quando entende que vulnerabilidade não é falta de inteligência.",
    essenciaImagem:
      "Sua imagem ideal é minimalista com magnetismo. Menos excesso, mais intenção. O impacto vem da precisão.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são linhas limpas, recortes estratégicos, contraste controlado, sensualidade sutil, acabamento inteligente e estética com leitura.\n\nSua imagem precisa ser pensada, mas não sem vida. Estratégica, mas não fria.",
    paleta:
      "Sua paleta simbólica pede clareza, contraste e magnetismo controlado.\n\nBase Athena: preto, branco, cinza, grafite, azul profundo, marinho, prata fria e tons neutros limpos.\n\nCamada Afrodite: vinho, vermelho fechado, rosé sofisticado, nude elegante, ameixa discreto, brilho pontual e metalizados sutis.\n\nSua paleta precisa comunicar inteligência com presença.",
    modelagem:
      "Sua modelagem simbólica pede estrutura com detalhe estratégico: blazers ajustados, calças de alfaiataria, vestidos minimalistas com recortes, saias de corte limpo, peças estruturadas, decotes calculados, fendas discretas e camisas com acabamento inteligente.\n\nA regra central é revelar intenção sem revelar demais.",
    tecidos:
      "Seus tecidos precisam sustentar clareza, caimento e sofisticação: alfaiataria premium, seda, crepe, cetim fosco, viscose encorpada, lã fria, couro liso ou detalhes pontuais e tecidos com superfície limpa.",
    beleza:
      "Na beleza, você ganha força com acabamento refinado, definição sutil e intenção. Pele natural refinada, olhos definidos com delicadeza, boca nude elegante ou vinho leve e cabelo polido ou intencional.\n\nSua beleza funciona quando parece decisão.",
    presenca:
      "Sua presença se fortalece com movimento contido, eficiente, postura segura e olhar observador. Você transmite consciência antes mesmo de falar.\n\nO cuidado é não deixar sua linguagem corporal excessivamente controlada. Sua imagem precisa preservar magnetismo, não virar apenas estratégia.",
    evitar: [
      "Excesso de emoção visual.",
      "Visual exageradamente sensual.",
      "Roupas sem estrutura ou intenção.",
      "Estética desleixada ou improvisada.",
      "Romantismo excessivo.",
      "Rigidez fria demais.",
    ],
    formula: "Clareza + Magnetismo + Intenção",
    leituraFinal:
      "Sua força não está em ser a mais intensa, nem a mais emocional, nem a mais óbvia. Está em perceber, escolher e agir com precisão.\n\nA Sedutora Estratégica amadurece quando permite que o desejo exista sem precisar ser totalmente calculado. Sua beleza simbólica está na união entre lucidez e magnetismo: elegante sem ser fria, sensual sem ser óbvia, estratégica sem perder corpo.",
    proximoPasso: proximoPassoPadrao,
  },

  "Selvagem Magnética": {
    nome: "Selvagem Magnética",
    combinacao: "Afrodite + Artemis",
    fraseHero:
      "Sua presença não pede permissão. Ela atravessa o ambiente com instinto e liberdade.",
    reconhecimento:
      "A Selvagem Magnética carrega uma energia intensa, independente e profundamente viva. Você não se encaixa facilmente em expectativas externas porque sua força nasce do instinto, do corpo e da autonomia.\n\nAfrodite traz magnetismo, prazer, beleza, sensualidade e poder de atração. Artemis traz liberdade, território, movimento, independência e recusa a ser domesticada.\n\nJuntas, elas formam uma mulher que seduz sendo livre.",
    essencia:
      "A Selvagem Magnética nasce do encontro entre Afrodite e Artemis: desejo com liberdade, sensualidade com independência, magnetismo com movimento.\n\nAfrodite desperta o corpo, o prazer, a beleza e a conexão. Artemis preserva autonomia, território, instinto e direção própria.\n\nSua essência pede uma imagem viva, com corpo, textura e liberdade. Algo que comunique sensualidade sem submissão.",
    dinamica:
      "Seu movimento interno alterna entre conexão e afastamento. Afrodite cria desejo, presença e campo de atração. Artemis preserva autonomia, território e espaço interno.\n\nVocê pode se aproximar com intensidade e depois precisar de espaço. Pode desejar vínculo, mas rejeitar qualquer sensação de sufocamento.\n\nO desafio é não transformar liberdade em desaparecimento.",
    percebida:
      "Você tende a ser percebida como intensa, livre, magnética e impossível de prender completamente. Sua presença transmite autenticidade e força instintiva.\n\nAs pessoas podem sentir que você tem uma energia própria. Isso cria fascínio, mas também pode intimidar quem espera previsibilidade, docilidade ou controle.",
    sombra:
      "A sombra da Selvagem Magnética aparece quando independência vira defesa emocional.\n\nAfrodite deseja conexão. Artemis teme captura. Você pode evitar vulnerabilidade, fugir de vínculos profundos ou transformar liberdade em isolamento.\n\nA cura está em entender que vínculo não precisa ser prisão.",
    padraoRelacional:
      "Nos vínculos, você tende a se aproximar quando existe admiração, desejo e espaço. Relações sufocantes, controladoras ou previsíveis demais drenam sua energia rapidamente.\n\nO risco é confundir qualquer demanda afetiva com controle. Seu amadurecimento relacional está em diferenciar invasão de cuidado, prisão de compromisso e autonomia de fuga.",
    caminho:
      "Seu caminho está em descobrir que liberdade e vínculo não precisam ser opostos. Você não precisa desaparecer para continuar sendo você.\n\nAfrodite consciente permite desejo e conexão sem transformar atração em dependência. Artemis consciente sustenta autonomia sem transformar independência em isolamento.\n\nSua síntese é pertencer a si mesma sem precisar negar toda aproximação.",
    essenciaImagem:
      "Sua imagem ideal mistura sensualidade natural, força e movimento. Ela funciona melhor quando transmite autenticidade e instinto, não perfeição excessiva.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são textura, liberdade, assimetria, corpo em movimento, materiais naturais, contraste terroso e sensualidade não polida demais.\n\nSua imagem precisa parecer viva, não domada.",
    paleta:
      "Sua paleta simbólica pede terra, intensidade e magnetismo natural.\n\nBase Artemis: oliva, verde musgo, areia, marrom profundo, ferrugem, grafite, tons de pedra e couro envelhecido.\n\nCamada Afrodite: vinho, vermelho queimado, cobre, dourado envelhecido, bronze, ameixa escuro e preto.\n\nSua cor ideal comunica instinto com presença.",
    modelagem:
      "Sua modelagem simbólica pede mobilidade, presença e território: jaquetas estruturadas, vestidos com movimento, botas, recortes assimétricos, peças utilitárias refinadas, saias com fendas, sobreposições e roupas que permitam ação.\n\nA regra central é o corpo poder se mover.",
    tecidos:
      "Sua matéria ideal precisa comunicar textura, natureza e força: couro macio, algodão encorpado, linho rústico, suede, malhas naturais, sarja, tricôs orgânicos e viscose com movimento.\n\nSua imagem funciona melhor com superfícies que parecem ter vida.",
    beleza:
      "Na beleza, sua força aparece quando existe textura natural, pele viva e presença menos domesticada. Pele natural, olhos marcados em tons terrosos, boca em tons queimados ou vinho e cabelo com textura visível traduzem melhor sua energia.",
    presenca:
      "Sua presença se fortalece com movimento firme, olhar direto e energia de quem ocupa o próprio espaço sem pedir validação.\n\nVocê não precisa parecer dócil para ser feminina. Sua feminilidade tem força, instinto e liberdade.",
    evitar: [
      "Visual excessivamente romântico.",
      "Roupas delicadas demais.",
      "Estética rígida ou corporativa.",
      "Perfeccionismo visual excessivo.",
      "Visual frágil ou doce demais.",
      "Roupas que impedem movimento.",
    ],
    formula: "Instinto + Liberdade + Magnetismo",
    leituraFinal:
      "Sua presença não nasce da adaptação. Nasce da autenticidade.\n\nA Selvagem Magnética amadurece quando liberdade deixa de ser fuga e passa a ser presença inteira. Sua beleza simbólica está na união entre desejo e território: sensual sem ser disponível, livre sem ser dispersa, intensa sem precisar provar força.\n\nVocê pode desejar sem se perder, se aproximar sem ser capturada e ser vista sem ser domesticada.",
    proximoPasso: proximoPassoPadrao,
  },

  "Rainha Oculta": {
    nome: "Rainha Oculta",
    combinacao: "Hera + Perséfone",
    fraseHero:
      "Existe em você uma presença reservada que transmite profundidade e autoridade silenciosa.",
    reconhecimento:
      "A Rainha Oculta não precisa ocupar o espaço pelo excesso para ser percebida. Sua força aparece na contenção, no mistério e na sensação de profundidade emocional.\n\nHera traz dignidade, posição, vínculo, reconhecimento e necessidade de ocupar um lugar de valor. Perséfone traz mundo interno, silêncio, sensibilidade, percepção emocional e relação com aquilo que não é imediatamente visível.\n\nJuntas, elas formam uma mulher que sente mais do que mostra.",
    essencia:
      "A Rainha Oculta nasce do encontro entre Hera e Perséfone: posição com introspecção, presença com mistério, legitimidade com profundidade emocional.\n\nHera pergunta: qual é o meu lugar? Perséfone pergunta: é seguro revelar o que sinto? Essa combinação cria uma mulher que carrega autoridade por fora e intensidade por dentro.\n\nSua essência pede uma imagem sofisticada, profunda, reservada e emocionalmente densa.",
    dinamica:
      "Seu movimento interno alterna entre presença e recolhimento. Hera deseja lugar, escolha, reconhecimento e pertencimento legítimo. Perséfone observa, sente, preserva e só se revela quando percebe segurança.\n\nVocê pode querer ser vista, mas se fechar quando sente que o olhar é superficial. O desafio é não transformar proteção em desaparecimento.",
    percebida:
      "Você tende a ser percebida como reservada, elegante, intensa, profunda e difícil de acessar completamente.\n\nSua presença pode transmitir dignidade silenciosa. Para alguns olhares, isso cria fascínio e respeito. Para outros, pode parecer distância, frieza ou inacessibilidade.",
    sombra:
      "A sombra da Rainha Oculta aparece quando o desejo de reconhecimento se mistura ao medo de exposição.\n\nHera pode buscar validação por posição. Perséfone pode se recolher demais, esconder necessidades ou esperar que o outro decifre o que você sente.\n\nA cura está em permitir que sua profundidade tenha linguagem. Ser reservada não precisa significar ser inacessível.",
    padraoRelacional:
      "Nos vínculos, você tende a buscar profundidade, estabilidade e significado. Relações superficiais raramente sustentam seu interesse.\n\nO risco é esperar que o outro decifre tudo sem você precisar revelar nada. Seu amadurecimento relacional está em comunicar o que sente sem transformar abertura em perda de poder.",
    caminho:
      "Seu caminho está em transformar reserva em presença consciente, não em defesa.\n\nHera consciente sustenta dignidade sem depender de reconhecimento externo. Perséfone consciente preserva profundidade sem desaparecer dentro dela.\n\nSua síntese é revelar com critério, não se esconder por medo.",
    essenciaImagem:
      "Sua imagem ideal não precisa competir para ser percebida. Ela existe no campo da profundidade, da dignidade e da presença que se revela por camadas.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são sofisticação silenciosa, mistério, contraste profundo, elegância reservada, tecidos densos, linhas limpas e presença emocional contida.",
    paleta:
      "Sua paleta simbólica pede profundidade, sofisticação e mistério emocional.\n\nBase Hera: preto, marinho, vinho profundo, grafite, cinza escuro, off-white sofisticado, azul petróleo e ameixa.\n\nCamada Perséfone: lilás profundo, lavanda acinzentado, roxo fechado, prata envelhecida, rosa antigo, tons de névoa e azul noturno.",
    modelagem:
      "Sua modelagem simbólica pede elegância, contenção e presença: vestidos de linhas limpas, saias midi, blazers sofisticados, peças com gola alta ou decote controlado, sobreposições elegantes, alfaiataria suave e silhuetas longas.\n\nA regra central é revelar por camadas.",
    tecidos:
      "Sua matéria ideal precisa comunicar densidade, sofisticação e mundo interno: veludo, seda fosca, crepe encorpado, lã fria, cetim pesado, alfaiataria fluida, tule escuro sutil e tecidos com textura profunda.",
    beleza:
      "Na beleza, sua força aparece quando existe profundidade, acabamento e mistério. Pele acetinada, olhos profundos, boca em nude fechado, vinho, malva ou ameixa suave, e cabelo polido ou com ondas controladas sustentam sua presença reservada.",
    presenca:
      "Sua presença se fortalece com ritmo mais lento, postura digna e olhar que observa sem pressa. Você comunica muito pela pausa, pela contenção e pela forma como escolhe se revelar.\n\nO cuidado é não usar a reserva para desaparecer.",
    evitar: [
      "Visual excessivamente casual.",
      "Exposição direta demais.",
      "Sensualidade vulgar.",
      "Estampas infantis ou alegres demais.",
      "Rigidez emocional traduzida em roupa dura demais.",
      "Aparência inacessível demais.",
    ],
    formula: "Profundidade + Dignidade + Mistério",
    leituraFinal:
      "Sua força não está em se mostrar inteira. Está em sustentar uma presença que faz o outro perceber que existe profundidade, valor e mundo interno.\n\nA Rainha Oculta amadurece quando entende que intimidade não diminui autoridade e que ser vista não significa ser invadida. Sua beleza simbólica está nessa síntese: reservada sem desaparecer, elegante sem endurecer, profunda sem se esconder.",
    proximoPasso: proximoPassoPadrao,
  },

  "Guardiã Sensível": {
    nome: "Guardiã Sensível",
    combinacao: "Perséfone + Deméter",
    fraseHero:
      "Sua força está na profundidade com que sente e na delicadeza com que acolhe.",
    reconhecimento:
      "A Guardiã Sensível nasce do encontro entre duas forças femininas profundamente receptivas: a que sente e a que cuida.\n\nPerséfone revela seu mundo interno, sua sensibilidade psíquica, sua capacidade de perceber atmosferas, nuances emocionais e tudo aquilo que não é dito de forma explícita. Deméter traduz essa percepção em cuidado, suporte, proteção e presença afetiva.\n\nEssa combinação cria uma mulher que não apenas observa o emocional do outro. Ela entra em contato com ele, acolhe e, muitas vezes, tenta sustentá-lo.\n\nSua força não está no impacto. Está na profundidade com que você percebe, na delicadeza com que acolhe e na constância silenciosa com que oferece presença. Você cria segurança emocional no ambiente. Sua energia convida o outro a baixar a guarda, respirar e existir com mais verdade.",
    essencia:
      "A essência da Guardiã Sensível está na união entre profundidade emocional e cuidado encarnado.\n\nPerséfone sente o invisível. Deméter responde ao que sente com acolhimento. Essa combinação cria uma mulher que percebe rapidamente quando algo muda no ambiente, quando alguém não está bem ou quando uma emoção foi escondida.\n\nVocê não é indiferente ao que sente. E quase nunca é indiferente ao que o outro sente. Sua energia, em nível simbólico, comunica: eu sinto o que está acontecendo em você, e meu impulso natural é cuidar disso.\n\nSua essência pede uma presença que não invade. Ela contém. Não domina. Sustenta. Mas também precisa aprender que acolher não é carregar tudo.",
    dinamica:
      "Seu funcionamento interno segue uma lógica muito específica: Perséfone percebe profundamente; Deméter responde cuidando.\n\nPrimeiro você sente. Depois acolhe. Primeiro capta. Depois tenta reparar, proteger, suavizar ou sustentar. Essa é uma estrutura psíquica muito bonita, porque une empatia e presença.\n\nMas também é uma configuração que pede maturidade emocional, justamente porque você tende a se envolver com facilidade na dor, na necessidade e na vulnerabilidade do outro.\n\nQuando essa dinâmica está consciente, você oferece presença sem se abandonar. Quando está automática, pode confundir amor com função, cuidado com obrigação e vínculo com responsabilidade emocional.",
    percebida:
      "Sua presença tende a ser lida como doce, empática, acessível, confiável, acolhedora e emocionalmente segura.\n\nExiste em você uma qualidade rara: as pessoas sentem que podem relaxar perto da sua energia. Você transmite algo como: comigo, você pode baixar a guarda.\n\nEssa percepção não nasce de esforço. Ela nasce da sua natureza receptiva, do seu olhar emocional e da forma como sua presença parece conter, e não invadir.\n\nAo mesmo tempo, Perséfone adiciona uma camada mais silenciosa e interna à sua imagem. Então, embora você pareça disponível, existe também profundidade, recolhimento e uma delicadeza que não se entrega inteira de imediato.",
    sombra:
      "A sombra dessa combinação aparece quando sensibilidade e cuidado deixam de ser expressão de essência e passam a se tornar mecanismo de sobrevivência emocional.\n\nPerséfone, em desequilíbrio, pode se adaptar demais, absorver o ambiente e perder contorno emocional. Deméter, em desequilíbrio, pode cuidar excessivamente, se responsabilizar pelo outro e sustentar vínculos além do saudável.\n\nQuando essas duas forças se somam sem consciência, a sombra surge como autoabandono emocional.\n\nVocê pode colocar o outro antes de si, perceber a necessidade alheia com tanta rapidez que ignora a própria, absorver emoções que não são suas e construir valor a partir do cuidado. Pode existir, de forma sutil, a sensação de que ser necessária é uma forma de garantir amor, vínculo ou pertencimento.\n\nEm termos simbólicos, a sombra aparece quando o cuidado substitui o próprio eu. Ou seja: quando você passa a existir mais na função de sustentar o outro do que na verdade de sustentar a si mesma.",
    padraoRelacional:
      "Nos vínculos, você tende a seguir um fluxo muito claro: percebe profundamente o outro, cria conexão emocional com rapidez, se envolve pelo cuidado e sustenta o vínculo com presença afetiva.\n\nVocê ama por acolhimento. Cria vínculo por empatia. Oferece amor por presença real. Isso torna suas relações muito intensas em profundidade, mesmo quando não parecem intensas por fora.\n\nO principal risco é atrair relações em que você ocupa o lugar de porto seguro, base emocional ou sustentação afetiva, mas sem necessariamente ser reconhecida, escolhida ou nutrida na mesma medida.\n\nVocê pode acabar sendo essencial para o equilíbrio do outro, mas não para a reciprocidade da relação. A pergunta que amadurece essa combinação é: eu estou cuidando porque escolhi, ou porque sinto que preciso ser necessária para continuar pertencendo?",
    caminho:
      "Seu crescimento não está em deixar de sentir nem em deixar de cuidar. Está em transformar essas qualidades em escolha consciente, e não em automatismo emocional.\n\nPerséfone consciente sente sem se dissolver, percebe sem absorver tudo e acolhe a profundidade sem desaparecer nela. Deméter consciente cuida sem carregar, ama sem assumir tudo e oferece presença sem se abandonar.\n\nA síntese do seu caminho é estar presente sem se perder. Cuidar sem se abandonar.\n\nEsse é o ponto de maturidade da Guardiã Sensível: continuar sendo acolhedora, mas com centro. Continuar sendo profunda, mas com limite. Continuar amando, mas sem transformar amor em sobrecarga.",
    essenciaImagem:
      "Sua imagem ideal não é construída para impactar. Ela é construída para acalmar, envolver e transmitir segurança emocional.\n\nSua presença estética funciona melhor quando comunica suavidade, acolhimento, delicadeza, conforto visual, verdade emocional e feminilidade serena.\n\nVocê não precisa de dureza para parecer forte. Sua força aparece quando sua imagem revela consistência afetiva, sensibilidade e presença.\n\nSua estética ideal toca antes de impressionar. Aproxima antes de impor. Acolhe antes de performar.",
    paleta:
      "Sua cartografia visual pede cores que acalmem, suavizem e criem sensação de proximidade emocional.\n\nBase Perséfone: lavanda, cinza claro, azul suave, rosado frio, tons enevoados, nuances etéreas e lilás apagado.\n\nAcolhimento Deméter: bege, creme, areia, terracota suave, verde claro, marrom claro, oliva suave e tons orgânicos naturais.\n\nA sua paleta ideal não grita presença. Ela constrói atmosfera. São cores que transmitem serenidade, disponibilidade emocional, gentileza, aconchego e profundidade suave.",
    modelagem:
      "Sua modelagem precisa traduzir a sensação de amparo.\n\nO que funciona melhor para você são formas fluidas, confortáveis, envolventes, suaves ao olhar e delicadas no caimento.\n\nVestidos leves, malhas macias, saias com movimento, blusas de caimento suave, tricôs delicados e peças que acompanham o corpo sem endurecê-lo tendem a sustentar melhor sua presença.\n\nA regra central é conforto emocional traduzido em roupa. Sua imagem precisa parecer habitável, sensível e coerente com sua essência: nem excessivamente rígida, nem desestruturada. O ideal é um equilíbrio entre presença e suavidade.",
    tecidos:
      "Os melhores tecidos para sua composição são aqueles que carregam toque afetivo.\n\nAlgodão, viscose, linho suavizado, malhas confortáveis, tricôs leves, tecidos macios ao toque, materiais com aparência natural, crepe fluido e texturas orgânicas tendem a conversar melhor com sua energia.\n\nSua roupa deve parecer acolhedora, tátil, confortável, suave e emocionalmente segura.",
    beleza:
      "Sua beleza funciona melhor quando preserva naturalidade e humanidade.\n\nPele leve, viçosa, natural e fresca sustenta sua presença sem criar máscara. Nos olhos, funciona melhor uma definição suave, pouco marcada, que preserve delicadeza. Na boca, tons hidratados, leves e com aspecto natural conversam melhor com sua energia.\n\nO cabelo tende a favorecer movimento, naturalidade, textura orgânica e ausência de rigidez excessiva.\n\nA sensação final deve ser real, acessível, segura e gentil.",
    presenca:
      "Sua linguagem corporal é parte fundamental da sua assinatura visual.\n\nMovimentos suaves, contínuos e sem brusquidão favorecem sua presença. Uma postura aberta, receptiva e presente sem tensão comunica segurança emocional.\n\nAcessórios delicados, afetivos, naturais, simbólicos ou com aparência orgânica tendem a funcionar melhor do que peças muito pesadas, frias ou excessivamente duras.\n\nO cuidado está em não parecer disponível para absorver tudo. Sua presença deve acolher sem se oferecer como solução para todos.",
    evitar: [
      "Visual muito rígido ou agressivo.",
      "Excesso de sensualidade explícita.",
      "Estética fria ou distante demais.",
      "Roupas duras sem movimento.",
      "Visual infantilizado.",
      "Peças que comunicam fragilidade sem centro.",
    ],
    formula: "Profundidade + Acolhimento + Limite",
    leituraFinal:
      "Sua força não está em dominar o ambiente. Não está em impressionar. Não está em ocupar tudo.\n\nSua força está em algo mais raro: perceber, acolher e sustentar.\n\nMas o verdadeiro equilíbrio da sua essência só acontece quando esse cuidado deixa de ser um lugar de autoabandono e passa a ser uma expressão consciente da sua força.\n\nA Guardiã Sensível floresce quando entende que você não precisa cuidar para ser amada e não precisa sentir tudo para se conectar.\n\nSua imagem, daqui para frente, não precisa ser uma armadura. Ela precisa ser uma extensão fiel da sua natureza: suave, profunda, acolhedora e inteira.\n\nPara aprofundarmos sua análise no Dossiê ORI, agora é importante preparar sua etapa visual com naturalidade. Fotos com boa luz, rosto limpo, sem maquiagem, e corpo em roupa neutra mais ajustada ajudam a próxima leitura a observar sua imagem real sem interferências. Esse próximo passo não é apenas técnico. É o começo da tradução visual da sua essência.",
    proximoPasso: proximoPassoPadrao,
  },

  "Visionária Sutil": {
    nome: "Visionária Sutil",
    combinacao: "Perséfone + Athena",
    fraseHero:
      "Você enxerga camadas que muitos não percebem — e transforma silêncio em lucidez.",
    reconhecimento:
      "A Visionária Sutil nasce do encontro entre percepção profunda e inteligência estratégica. Existe em você uma capacidade rara de captar o que está por trás das palavras, dos gestos e das aparências.\n\nPerséfone traz sensibilidade, mundo interno, intuição e leitura do invisível. Athena traz clareza, análise, estratégia e capacidade de organizar o que foi percebido.\n\nJuntas, elas formam uma mulher que não apenas sente. Ela compreende.",
    essencia:
      "A Visionária Sutil une o mundo subterrâneo de Perséfone com a lucidez de Athena.\n\nPerséfone percebe atmosferas, emoções ocultas, silêncios e camadas simbólicas. Athena organiza essas percepções em pensamento, direção, linguagem e estratégia.\n\nSua essência pede uma imagem que traduza profundidade com clareza. Mistério, sim, mas não confusão. Inteligência, sim, mas não frieza.",
    dinamica:
      "Seu funcionamento interno tende a seguir este fluxo: primeiro você percebe; depois analisa; depois organiza.\n\nPerséfone sente o campo. Athena decodifica o campo. O que chega como sensação pode depois virar entendimento preciso.\n\nO risco é ficar presa na leitura e na análise, sem permitir que a vida simplesmente aconteça.",
    percebida:
      "Você tende a ser percebida como discreta, inteligente, profunda, observadora e difícil de acessar completamente.\n\nExiste em você uma presença silenciosa que parece captar mais do que fala. Isso pode gerar admiração, respeito e curiosidade, mas também distância.",
    sombra:
      "A sombra da Visionária Sutil aparece quando percepção e inteligência se fecham em um circuito interno.\n\nPerséfone pode se recolher demais e interpretar sinais em excesso. Athena pode racionalizar emoções e se proteger pela análise.\n\nA cura está em lembrar que nem toda percepção precisa virar explicação.",
    padraoRelacional:
      "Nos vínculos, você tende a observar antes de confiar. Seu afeto se abre quando percebe coerência, inteligência emocional, segurança e respeito ao seu tempo interno.\n\nO risco é interpretar mais do que comunicar. Seu amadurecimento relacional está em transformar percepção em diálogo.",
    caminho:
      "Seu caminho está em integrar intuição e razão sem se esconder atrás de nenhuma das duas.\n\nPerséfone consciente permite sentir profundamente sem se dissolver. Athena consciente permite compreender sem controlar tudo.\n\nSua síntese é perceber sem se perder, analisar sem se desconectar e compreender sem abandonar a experiência viva.",
    essenciaImagem:
      "Sua imagem ideal comunica profundidade limpa: uma estética silenciosa, inteligente e levemente enigmática.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são linhas limpas, tons profundos ou enevoados, texturas sutis, contraste controlado, pouca informação visual e detalhes que revelam intenção.",
    paleta:
      "Sua paleta simbólica pede silêncio, profundidade e lucidez.\n\nBase Perséfone: lavanda acinzentado, azul noite, lilás profundo, ameixa suave, cinza névoa, malva e tons frios velados.\n\nCamada Athena: branco frio, preto, grafite, azul marinho, prata, cinza claro e off-white limpo.",
    modelagem:
      "Sua modelagem simbólica pede limpeza, precisão e sutileza: alfaiataria leve, vestidos de linhas simples, camisas bem cortadas, calças retas, saias midi, sobreposições discretas, assimetrias sutis e peças minimalistas com detalhe inteligente.",
    tecidos:
      "Sua matéria ideal precisa comunicar sofisticação silenciosa: crepe, seda fosca, algodão estruturado, viscose encorpada, lã fria, malhas finas, tecidos opacos com bom caimento e texturas discretas.",
    beleza:
      "Na beleza, sua força aparece em definição sutil e acabamento limpo. Pele natural refinada, olhos profundos em tons frios ou neutros, boca discreta em malva, nude frio ou vinho suave e cabelo com forma clara sustentam sua presença.",
    presenca:
      "Sua presença se fortalece com postura calma, olhar atento e ritmo contido. Seu silêncio pode ter presença, desde que não vire retraimento.\n\nVocê ganha força quando mostra que percebe, mas também participa.",
    evitar: [
      "Excesso de informação visual.",
      "Estampas barulhentas.",
      "Romantismo exagerado.",
      "Sensualidade explícita demais.",
      "Visual caótico.",
      "Aparência excessivamente fria.",
    ],
    formula: "Profundidade + Clareza + Sutileza",
    leituraFinal:
      "Sua força está em enxergar o que muitos não percebem e organizar essa percepção com lucidez.\n\nA Visionária Sutil amadurece quando entende que não precisa escolher entre sentir e pensar. Sua beleza simbólica nasce quando Perséfone e Athena se integram: profundidade sem confusão, inteligência sem frieza, silêncio sem apagamento.",
    proximoPasso: proximoPassoPadrao,
  },

  "Selvagem Intuitiva": {
    nome: "Selvagem Intuitiva",
    combinacao: "Perséfone + Artemis",
    fraseHero:
      "Você pertence ao invisível, ao instinto e aos caminhos que não aceitam domesticação.",
    reconhecimento:
      "A Selvagem Intuitiva nasce do encontro entre profundidade e liberdade. Existe em você uma presença que não se adapta bem a ambientes rígidos, invasivos ou previsíveis demais.\n\nVocê percebe mais do que costuma dizer. Sente mudanças sutis no clima, no olhar das pessoas, no tom das conversas e na energia dos espaços. Mas, ao mesmo tempo, precisa preservar movimento, autonomia e território. Quando algo tenta te prender, definir ou invadir antes da hora, alguma parte sua recua.\n\nPerséfone traz mundo interno, silêncio, intuição e percepção das camadas invisíveis. Artemis traz instinto, independência, direção própria e necessidade de espaço. Juntas, elas formam uma mulher que não quer ser capturada pelo olhar do outro. Você precisa se sentir livre para permanecer.",
    essencia:
      "A sua essência não funciona pela lógica da exposição direta. Você não precisa mostrar tudo para ser percebida. Muitas vezes, sua força está justamente no que não se entrega de imediato.\n\nVocê carrega uma presença que mistura mistério e instinto. Existe algo reservado, sensível e profundo em você, mas também existe uma parte que sabe se mover sozinha, escolher sozinha e se proteger quando sente que algo ameaça sua liberdade emocional.\n\nA Selvagem Intuitiva não nasceu para se encaixar em fórmulas prontas de feminilidade. Sua feminilidade tem silêncio, natureza, distância, profundidade, movimento e escolha. Ela não é disponível o tempo inteiro. Ela aparece quando sente verdade.",
    dinamica:
      "Seu funcionamento interno alterna entre recolhimento e movimento. Perséfone observa, sente, mergulha e processa. Artemis se desloca, preserva espaço e busca liberdade. Por isso, você pode parecer contraditória para quem tenta te entender de fora.\n\nHá momentos em que você quer conexão profunda, mas não suporta invasão. Quer ser vista, mas não exposta. Quer intimidade, mas não dependência. Quer presença, mas não controle.\n\nSua energia funciona melhor quando existe espaço para sentir antes de responder. Quando você é pressionada, explicada, cobrada ou puxada para uma definição rápida, sua tendência pode ser se fechar, fugir ou endurecer. Não porque você não sente, mas porque sente demais e precisa continuar dona do próprio território.",
    percebida:
      "Você tende a ser percebida como misteriosa, independente, intuitiva, reservada e difícil de controlar.\n\nExiste em você uma presença que parece pertencer a um campo próprio. Isso cria fascínio, mas também pode gerar incompreensão em quem espera previsibilidade.",
    sombra:
      "A sombra da Selvagem Intuitiva aparece quando sensibilidade e autonomia viram defesa.\n\nPerséfone pode se recolher demais, desaparecer emocionalmente, esperar que o outro perceba sozinho ou guardar tudo em silêncio. Artemis pode fugir antes de se vulnerabilizar, rejeitar demandas legítimas ou transformar qualquer aproximação em ameaça.\n\nA sombra central é desaparecer antes de ser tocada. Você pode sair de situações sem explicar completamente, cortar vínculos antes de admitir que se importava ou convencer a si mesma de que não precisa de nada quando, na verdade, só não quer se sentir capturada.\n\nA cura está em perceber que nem toda aproximação é invasão. Nem todo vínculo é prisão. Nem toda permanência exige perda de liberdade.",
    padraoRelacional:
      "Nos vínculos, você precisa de profundidade e espaço ao mesmo tempo. Relações muito superficiais podem te entediar. Relações muito controladoras podem te sufocar.\n\nVocê tende a confiar aos poucos. Observa antes de se abrir. Sente antes de nomear. Quando percebe respeito pelo seu ritmo, pode revelar uma presença rara: intensa, leal, intuitiva e muito verdadeira.\n\nMas quando sente cobrança, invasão ou expectativa excessiva, pode se afastar. Às vezes, o afastamento vem antes da conversa. A pessoa do outro lado pode achar que você não se importa, quando na verdade você está tentando se proteger de perder o próprio centro.",
    caminho:
      "Seu caminho está em transformar fuga em escolha consciente.\n\nA Artemis madura sabe preservar liberdade sem precisar cortar tudo. A Perséfone madura sabe mergulhar sem desaparecer dentro do próprio mundo interno. Quando essas duas forças se integram, você deixa de viver entre se esconder e fugir.\n\nSua evolução começa quando você entende que pode permanecer sem se entregar inteira. Pode criar vínculo sem se abandonar. Pode ser profunda sem ficar inacessível. Pode ser livre sem viver em estado de defesa.",
    essenciaImagem:
      "Sua imagem ideal precisa traduzir mistério livre. Nada muito domesticado, rígido, previsível ou excessivamente polido sustenta sua verdade por muito tempo.\n\nVocê funciona melhor com uma estética que tenha camadas, textura, movimento e atmosfera. Algo que sugere mais do que explica. Algo que acompanha o corpo, mas não entrega tudo. Algo que pareça natural, intuitivo, levemente selvagem e emocionalmente profundo.\n\nSua imagem não deve parecer montada para agradar. Ela deve parecer descoberta, escolhida, sentida.",
    paleta:
      "Sua paleta simbólica pede tons de natureza, sombra e mundo interno.\n\nBase Perséfone: azul noite, ameixa, lilás acinzentado, cinza névoa, roxo profundo, malva escuro e tons lunares.\n\nCamada Artemis: verde musgo, oliva, areia, marrom profundo, ferrugem, argila, preto e tons de pedra.",
    modelagem:
      "Sua modelagem simbólica pede liberdade de movimento e camadas: vestidos fluidos, peças assimétricas, sobreposições, saias com movimento, botas, jaquetas leves ou estruturadas, peças utilitárias refinadas e silhuetas que não prendam demais o corpo.",
    tecidos:
      "Sua matéria ideal precisa comunicar natureza, textura e profundidade: linho, algodão encorpado, viscose, suede, couro macio, malhas naturais, tricôs orgânicos, tecidos com textura irregular e crepes fluidos.",
    beleza:
      "Na beleza, sua força aparece quando existe naturalidade, textura e profundidade. Pele viva, olhos em tons de ameixa, marrom, grafite ou oliva, boca terrosa ou vinho suave e cabelo com textura visível sustentam sua presença.",
    presenca:
      "Sua presença se fortalece com ritmo próprio, olhar atento e corpo que preserva território.\n\nSua linguagem corporal ideal comunica: eu estou aqui, mas continuo pertencendo a mim. O cuidado é não usar o distanciamento como única forma de proteção.",
    evitar: [
      "Visual excessivamente polido.",
      "Estética muito romântica ou doce.",
      "Roupa rígida demais.",
      "Excesso de brilho artificial.",
      "Visual corporativo severo.",
      "Peças que prendem o movimento.",
    ],
    formula: "Intuição + Liberdade + Mistério",
    leituraFinal:
      "Sua força nasce da união entre mundo interno e instinto. Você sente profundamente, mas precisa continuar livre.\n\nA Selvagem Intuitiva amadurece quando entende que liberdade não precisa ser fuga e profundidade não precisa ser isolamento. Sua beleza simbólica está na integração entre silêncio e movimento: misteriosa sem desaparecer, livre sem se desconectar, sensível sem se deixar capturar.\n\nA sua imagem começa a funcionar quando ela deixa de tentar explicar você e passa a proteger o seu ritmo. Quando roupa, cor, textura e presença respeitam sua necessidade de espaço, sua força aparece sem esforço. Você não precisa parecer mais acessível para ser bonita. Precisa parecer mais fiel ao seu próprio território.",
    proximoPasso: proximoPassoPadrao,
  },

  "Autônoma Absoluta": {
    nome: "Autônoma Absoluta",
    combinacao: "Athena + Artemis",
    fraseHero:
      "Sua força nasce da lucidez, da autonomia e da recusa em viver sem direção própria.",
    reconhecimento:
      "A Autônoma Absoluta carrega uma energia de independência clara. Você não precisa de excesso emocional, validação constante ou aprovação externa para saber quem é.\n\nAthena traz estratégia, inteligência, clareza e visão de sistema. Artemis traz autonomia, instinto, território e independência.\n\nJuntas, elas formam uma mulher que precisa entender, escolher e se mover a partir de um eixo próprio.",
    essencia:
      "A Autônoma Absoluta nasce do encontro entre duas forças muito independentes: Athena organiza a mente; Artemis preserva o território.\n\nEssa combinação cria uma mulher que precisa de liberdade com direção. Você não quer apenas ser livre. Quer saber para onde está indo.\n\nSua imagem precisa traduzir essa força: limpa, objetiva, precisa, livre e bem estruturada.",
    dinamica:
      "Seu funcionamento interno segue uma lógica de leitura, decisão e movimento.\n\nAthena observa, analisa e organiza. Artemis age, preserva espaço e segue direção própria.\n\nO risco é transformar independência em blindagem. Sua maturidade está em entender que autonomia não precisa significar isolamento.",
    percebida:
      "Você tende a ser percebida como forte, inteligente, independente, objetiva e difícil de manipular.\n\nSua presença comunica competência. Isso gera respeito, mas também pode gerar distância se sua autossuficiência parecer frieza ou indisponibilidade.",
    sombra:
      "A sombra da Autônoma Absoluta aparece quando lucidez e liberdade viram armadura.\n\nAthena pode racionalizar tudo e desvalorizar emoção. Artemis pode rejeitar dependência e transformar liberdade em isolamento.\n\nA cura está em entender que receber não diminui sua força.",
    padraoRelacional:
      "Nos vínculos, você precisa de respeito, espaço, inteligência e coerência. Relações dependentes, dramáticas, invasivas ou desorganizadas tendem a te afastar.\n\nO risco é manter distância demais. Seu amadurecimento relacional está em permitir troca sem sentir perda de autonomia.",
    caminho:
      "Seu caminho está em integrar força e receptividade.\n\nAthena consciente oferece lucidez, estratégia e visão. Artemis consciente oferece liberdade, território e movimento.\n\nA Autônoma Absoluta amadurece quando entende que independência não precisa excluir apoio.",
    essenciaImagem:
      "Sua imagem ideal comunica autonomia, precisão e movimento. Ela não precisa ser excessivamente feminina, ornamental ou emocional. Ela precisa parecer funcional, forte e consciente.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são linhas limpas, estrutura, praticidade refinada, elementos utilitários, contraste, peças bem cortadas e estética sem excesso.",
    paleta:
      "Sua paleta simbólica pede clareza, contraste e território.\n\nBase Athena: preto, branco, grafite, cinza, azul marinho, prata, off-white limpo e tons frios estruturados.\n\nCamada Artemis: verde oliva, verde musgo, areia, marrom profundo, caqui, tons de pedra, ferrugem e couro.",
    modelagem:
      "Sua modelagem simbólica pede estrutura, mobilidade e praticidade refinada: alfaiataria limpa, calças retas, blazers sem excesso, camisas bem cortadas, jaquetas utilitárias, peças funcionais, vestidos retos e botas.",
    tecidos:
      "Sua matéria ideal precisa sustentar forma, movimento e resistência: algodão encorpado, sarja, linho estruturado, lã fria, couro liso, crepe encorpado, nylon premium, alfaiataria e malhas densas.",
    beleza:
      "Na beleza, sua força aparece em limpeza, definição e praticidade elegante. Pele natural refinada, olhos definidos, boca em nude limpo ou vinho discreto e cabelo com corte funcional e forma clara sustentam sua presença.",
    presenca:
      "Sua presença se fortalece com postura firme, movimento objetivo e energia de quem sabe onde está indo.\n\nSua linguagem corporal ideal comunica: eu tenho eixo, mas não preciso viver fechada.",
    evitar: [
      "Visual frágil demais.",
      "Romantismo excessivo.",
      "Peças muito ornamentais.",
      "Excesso de delicadeza.",
      "Roupas desconfortáveis.",
      "Frieza sem presença humana.",
    ],
    formula: "Clareza + Autonomia + Movimento",
    leituraFinal:
      "Sua força está na lucidez com que escolhe, na autonomia com que se move e na capacidade de preservar seu eixo mesmo diante de pressões externas.\n\nA Autônoma Absoluta amadurece quando entende que não precisa provar força negando cuidado, vínculo ou apoio. Sua beleza simbólica nasce quando Athena e Artemis se integram: inteligência com liberdade, direção com instinto, independência com presença viva.",
    proximoPasso: proximoPassoPadrao,
  },

  "Cuidadora Estratégica": {
    nome: "Cuidadora Estratégica",
    combinacao: "Deméter + Athena",
    fraseHero:
      "Você cuida com presença, mas também com estrutura, clareza e inteligência.",
    reconhecimento:
      "A Cuidadora Estratégica nasce do encontro entre acolhimento e lucidez. Existe em você uma capacidade de perceber necessidades, organizar soluções e oferecer suporte de forma prática.\n\nDeméter traz cuidado, nutrição, presença afetiva, vínculo e sustentação. Athena traz estratégia, clareza, inteligência, organização e visão de sistema.\n\nJuntas, elas formam uma mulher que não apenas sente a necessidade do outro. Ela entende o que precisa ser feito.",
    essencia:
      "A Cuidadora Estratégica une a presença nutritiva de Deméter com a inteligência organizadora de Athena.\n\nVocê não cuida apenas com emoção. Cuida com método, presença, solução, rotina e estrutura. Muitas vezes, sua forma de amar passa por organizar, orientar, planejar, resolver ou tornar a vida do outro mais possível.\n\nSua essência pede uma imagem acolhedora, mas não frouxa; prática, mas não fria.",
    dinamica:
      "Seu funcionamento interno tende a seguir o fluxo: perceber necessidade, analisar cenário, organizar resposta.\n\nDeméter percebe a demanda afetiva. Athena estrutura a ação. O risco é transformar cuidado em gestão permanente.\n\nSua maturidade está em diferenciar suporte de controle, cuidado de responsabilidade total e presença de sobrecarga.",
    percebida:
      "Você tende a ser percebida como confiável, inteligente, prestativa, prática e emocionalmente estável.\n\nAs pessoas podem sentir que perto de você existe clareza. Você acolhe, mas também orienta. Escuta, mas também aponta caminhos.",
    sombra:
      "A sombra da Cuidadora Estratégica aparece quando cuidado e inteligência viram obrigação de resolver tudo.\n\nDeméter pode cuidar excessivamente. Athena pode racionalizar emoções, corrigir o outro e tentar organizar a vida de todos.\n\nA cura está em lembrar que apoiar não significa assumir. Orientar não significa controlar.",
    padraoRelacional:
      "Nos vínculos, você tende a amar por presença prática. Demonstra afeto por organização, conselho, cuidado cotidiano, antecipação de necessidades e suporte concreto.\n\nO risco é atrair pessoas que se apoiam na sua competência sem oferecer reciprocidade emocional.",
    caminho:
      "Seu caminho está em transformar cuidado em escolha, não em função automática.\n\nDeméter consciente cuida sem carregar. Athena consciente organiza sem controlar.\n\nA Cuidadora Estratégica amadurece quando entende que sua utilidade não é a medida do seu valor.",
    essenciaImagem:
      "Sua imagem ideal comunica cuidado, organização e confiança. Ela precisa parecer acolhedora, mas também competente.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são linhas limpas, conforto estruturado, tecidos agradáveis, praticidade refinada, tons naturais organizados e uma estética de presença confiável.",
    paleta:
      "Sua paleta simbólica pede naturalidade, clareza e estabilidade.\n\nBase Deméter: creme, bege, areia, terracota suave, oliva, marrom claro, caramelo e verde seco.\n\nCamada Athena: branco limpo, cinza claro, azul marinho, grafite suave, off-white, preto pontual e tons neutros organizados.",
    modelagem:
      "Sua modelagem simbólica pede conforto com estrutura: camisas bem cortadas, calças retas, vestidos práticos com caimento, saias midi, blazers leves, tricôs estruturados, conjuntos coordenados e peças funcionais com acabamento bonito.",
    tecidos:
      "Sua matéria ideal precisa comunicar conforto, durabilidade e cuidado: algodão macio, linho estruturado, viscose encorpada, malhas de qualidade, tricô fino, crepe leve, sarja e tecidos naturais com bom acabamento.",
    beleza:
      "Na beleza, sua força aparece em cuidado visível, naturalidade e organização. Pele bem cuidada, olhos suaves, boca em nude natural ou terracota leve e cabelo prático, limpo e saudável sustentam sua presença.",
    presenca:
      "Sua presença se fortalece com postura calma, gestos organizados e ritmo estável.\n\nO cuidado é não deixar sua presença virar função. Você não precisa parecer sempre pronta para ajudar. Também pode apenas existir, receber e ser cuidada.",
    evitar: [
      "Visual desleixado.",
      "Estética excessivamente utilitária.",
      "Roupas sem beleza.",
      "Rigidez visual demais.",
      "Aparência maternal sem refinamento.",
      "Excesso de neutralidade apagada.",
    ],
    formula: "Cuidado + Clareza + Estrutura",
    leituraFinal:
      "Sua força está em transformar cuidado em estrutura e presença em suporte real.\n\nA Cuidadora Estratégica amadurece quando entende que não precisa ser indispensável para ter valor. Sua beleza simbólica nasce quando Deméter e Athena se integram: acolhimento com clareza, suporte com limite, inteligência com humanidade.",
    proximoPasso: proximoPassoPadrao,
  },

  "Matriarca Soberana": {
    nome: "Matriarca Soberana",
    combinacao: "Deméter + Hera",
    fraseHero:
      "Você sustenta, organiza e dá lugar — mas sua presença também precisa ser honrada.",
    reconhecimento:
      "A Matriarca Soberana nasce do encontro entre cuidado e posição. Existe em você uma força que acolhe, sustenta e protege, mas também deseja reconhecimento, respeito e lugar.\n\nDeméter traz nutrição, vínculo, suporte e presença afetiva. Hera traz dignidade, estrutura, compromisso, reconhecimento e legitimidade.\n\nJuntas, elas formam uma mulher que não apenas cuida. Ela estrutura pertencimento.",
    essencia:
      "A Matriarca Soberana une o coração nutritivo de Deméter com a dignidade posicional de Hera.\n\nDeméter pergunta: quem precisa de cuidado? Hera pergunta: qual é o lugar desse vínculo? Essa combinação cria uma mulher que tende a levar relações, família, compromisso e pertencimento com seriedade.\n\nSua essência pede uma imagem que traduza cuidado com autoridade.",
    dinamica:
      "Seu funcionamento interno tende a seguir o fluxo: cuidar, sustentar, organizar lugar e esperar reconhecimento.\n\nDeméter oferece presença. Hera busca legitimidade. Você pode segurar o entorno, organizar demandas e se tornar referência de estabilidade.\n\nO risco é transformar cuidado em cobrança silenciosa.",
    percebida:
      "Você tende a ser percebida como confiável, forte, acolhedora, madura, protetora e naturalmente respeitável.\n\nSua presença pode criar sensação de base. Ao mesmo tempo, algumas pessoas podem projetar em você a expectativa de que sempre aguente, sempre cuide e sempre resolva.",
    sombra:
      "A sombra da Matriarca Soberana aparece quando cuidado e reconhecimento se misturam de forma inconsciente.\n\nDeméter pode cuidar excessivamente e se tornar indispensável. Hera pode esperar reconhecimento, lealdade e posição como confirmação de valor.\n\nA cura está em lembrar que cuidado não pode ser moeda de reconhecimento.",
    padraoRelacional:
      "Nos vínculos, você tende a valorizar compromisso, lealdade, estabilidade e presença real.\n\nVocê ama sustentando. Demonstra afeto por cuidado, constância, proteção, organização e permanência.\n\nO risco é ocupar o lugar de base sem permitir que o outro também sustente.",
    caminho:
      "Seu caminho está em transformar cuidado em escolha e autoridade em presença, não em peso.\n\nDeméter consciente nutre sem carregar. Hera consciente ocupa lugar sem depender de validação externa.\n\nSua síntese é cuidar sem se sacrificar, ocupar lugar sem controlar e sustentar vínculos sem se tornar invisível dentro deles.",
    essenciaImagem:
      "Sua imagem ideal comunica acolhimento com autoridade. Ela precisa parecer confiável, madura, feminina e estruturada.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são presença estável, linhas estruturadas, tons quentes e nobres, tecidos com peso, feminilidade madura e acabamento que comunica cuidado consigo.",
    paleta:
      "Sua paleta simbólica pede calor, estrutura e dignidade.\n\nBase Deméter: terracota, caramelo, creme, bege quente, marrom mel, oliva, areia dourada e argila.\n\nCamada Hera: vinho, azul profundo, marinho, preto pontual, dourado, off-white sofisticado, taupe e verde escuro.",
    modelagem:
      "Sua modelagem simbólica pede estrutura com conforto: vestidos midi, saias estruturadas, blazers leves, calças de bom corte, camisas em tecidos nobres, peças com cintura marcada de forma confortável, conjuntos coordenados e tricôs elegantes.",
    tecidos:
      "Sua matéria ideal precisa comunicar cuidado, qualidade e estabilidade: linho encorpado, algodão premium, crepe estruturado, seda fosca, alfaiataria confortável, malhas nobres, tricôs refinados e viscose encorpada.",
    beleza:
      "Na beleza, sua força aparece em cuidado visível, acabamento e maturidade feminina. Pele bem cuidada, olhos suaves mas definidos, boca em nude quente, terracota, vinho suave ou rosado queimado e cabelo bem tratado sustentam sua presença.",
    presenca:
      "Sua presença se fortalece com postura assentada, ritmo estável e gestos que comunicam segurança.\n\nA linguagem corporal ideal transmite base, mas não peso. Disponibilidade, mas não submissão. Cuidado, mas não sobrecarga.",
    evitar: [
      "Visual descuidado.",
      "Excesso de funcionalidade sem beleza.",
      "Aparência maternal demais.",
      "Rigidez severa.",
      "Roupas sem estrutura.",
      "Estética que comunica sobrecarga.",
    ],
    formula: "Cuidado + Dignidade + Sustentação",
    leituraFinal:
      "Sua força está em criar base, sustentar vínculos e oferecer presença real. Mas sua evolução começa quando entende que sustentar não pode significar se apagar.\n\nA Matriarca Soberana amadurece quando cuidado deixa de ser sobrecarga e dignidade deixa de depender do reconhecimento externo. Sua beleza simbólica está na união entre Deméter e Hera: acolher sem se diminuir, sustentar sem carregar tudo, ocupar lugar sem endurecer.",
    proximoPasso: proximoPassoPadrao,
  },

  "Protetora Selvagem": {
    nome: "Protetora Selvagem",
    combinacao: "Deméter + Artemis",
    fraseHero:
      "Você cuida com instinto, protege com força e ama sem aceitar ser aprisionada.",
    reconhecimento:
      "A Protetora Selvagem nasce do encontro entre cuidado e instinto. Existe em você uma força profundamente protetora, mas também livre, territorial e independente.\n\nDeméter traz nutrição, acolhimento, vínculo e presença afetiva. Artemis traz autonomia, território, movimento, instinto e recusa a ser controlada.\n\nJuntas, elas formam uma mulher que cuida, mas não se deixa domesticar.",
    essencia:
      "A Protetora Selvagem une o coração cuidador de Deméter com o território instintivo de Artemis.\n\nDeméter pergunta: quem precisa ser cuidado? Artemis pergunta: onde estão meus limites? Essa combinação cria uma mulher que ama com presença, mas também com senso claro de território.\n\nSua essência pede uma imagem que traduza acolhimento com força natural.",
    dinamica:
      "Seu funcionamento interno tende a alternar entre acolher e preservar espaço.\n\nDeméter aproxima, cuida e sustenta. Artemis observa limites, protege território e recusa invasão.\n\nO risco é transformar proteção em controle ou liberdade em afastamento. Sua maturidade está em cuidar sem controlar e preservar território sem se isolar.",
    percebida:
      "Você tende a ser percebida como forte, protetora, leal, independente e intuitiva.\n\nExiste em você uma presença de quem cuida dos seus. Isso pode gerar segurança e admiração, mas também pode intimidar pessoas que esperam uma feminilidade mais dócil.",
    sombra:
      "A sombra da Protetora Selvagem aparece quando cuidado e instinto viram defesa.\n\nDeméter pode cuidar excessivamente. Artemis pode reagir a qualquer sensação de invasão. A sombra central é proteger para não se vulnerabilizar.\n\nA cura está em lembrar que proteção não precisa ser armadura.",
    padraoRelacional:
      "Nos vínculos, você tende a amar com lealdade, presença e proteção. Relações frágeis, instáveis, invasivas ou controladoras não sustentam sua energia.\n\nO risco é ocupar o lugar de protetora permanente, cuidando de todos e não permitindo que ninguém veja suas próprias necessidades.",
    caminho:
      "Seu caminho está em integrar cuidado e liberdade sem transformar um no oposto do outro.\n\nDeméter consciente cuida sem carregar. Artemis consciente preserva território sem fugir.\n\nSua síntese é cuidar com limite, proteger sem controlar e amar sem perder território.",
    essenciaImagem:
      "Sua imagem ideal mistura força natural, acolhimento e movimento. Ela precisa parecer viva, resistente, feminina e instintiva.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são materiais naturais, textura, conforto com presença, peças funcionais refinadas, tons terrosos, movimento e feminilidade não frágil.",
    paleta:
      "Sua paleta simbólica pede terra, calor e força natural.\n\nBase Deméter: terracota, caramelo, bege quente, creme, marrom mel, areia, argila e oliva suave.\n\nCamada Artemis: verde musgo, verde oliva, caqui, ferrugem, marrom profundo, preto pontual, couro e tons de pedra.",
    modelagem:
      "Sua modelagem simbólica pede conforto, mobilidade e força: jaquetas utilitárias refinadas, vestidos com movimento, saias confortáveis, calças retas ou cargo sofisticadas, camisas de tecidos naturais, botas, tricôs encorpados e sobreposições funcionais.",
    tecidos:
      "Sua matéria ideal precisa comunicar resistência, toque e natureza: algodão encorpado, linho, sarja, couro macio, suede, tricôs naturais, malhas densas, viscose com textura e tecidos orgânicos.",
    beleza:
      "Na beleza, sua força aparece em naturalidade, saúde e presença instintiva. Pele viva, olhos em tons terrosos, boca nude quente, terracota ou vinho queimado e cabelo com textura visível traduzem sua energia.",
    presenca:
      "Sua presença se fortalece com movimento firme, postura natural e energia de proteção tranquila.\n\nSua linguagem corporal ideal transmite: eu acolho, mas tenho limite. O cuidado é não deixar a defesa dominar sua expressão.",
    evitar: [
      "Visual frágil demais.",
      "Excesso de romantismo.",
      "Estética muito delicada.",
      "Roupas que impedem movimento.",
      "Visual excessivamente rígido.",
      "Descuidado como defesa.",
    ],
    formula: "Proteção + Instinto + Acolhimento",
    leituraFinal:
      "Sua força está em cuidar com presença e proteger com instinto. Você não ama de forma frágil. Ama com corpo, limite e lealdade.\n\nA Protetora Selvagem amadurece quando entende que proteção não precisa virar controle, e liberdade não precisa virar isolamento. Sua beleza simbólica nasce quando Deméter e Artemis se integram: acolhimento com limite, cuidado com autonomia, força com calor.",
    proximoPasso: proximoPassoPadrao,
  },

  "Soberana Estratégica": {
    nome: "Soberana Estratégica",
    combinacao: "Hera + Athena",
    fraseHero:
      "Sua presença organiza o ambiente porque une autoridade, lucidez e posição.",
    reconhecimento:
      "A Soberana Estratégica nasce do encontro entre dignidade e inteligência. Existe em você uma força que busca lugar, estrutura, reconhecimento e clareza.\n\nHera traz posição, compromisso, legitimidade, vínculo e necessidade de ocupar um espaço de valor. Athena traz estratégia, razão, discernimento e capacidade de organizar sistemas.\n\nJuntas, elas formam uma mulher que não apenas quer ser respeitada. Ela sabe construir respeito.",
    essencia:
      "A Soberana Estratégica une o senso de posição de Hera com a lucidez de Athena.\n\nHera pergunta: qual é o meu lugar? Athena pergunta: qual é a estratégia mais inteligente para ocupá-lo? Essa combinação cria uma mulher que pensa em estrutura, legitimidade, coerência e resultado.\n\nSua essência pede uma imagem de autoridade refinada.",
    dinamica:
      "Seu funcionamento interno tende a seguir este fluxo: avaliar posição, ler o contexto, organizar estratégia e sustentar presença.\n\nHera busca reconhecimento e lugar. Athena analisa como esse lugar pode ser ocupado com precisão.\n\nO risco é transformar tudo em controle. Sua maturidade está em sustentar autoridade sem perder humanidade.",
    percebida:
      "Você tende a ser percebida como forte, inteligente, elegante, séria, confiável e difícil de desestabilizar.\n\nSua presença comunica competência e posição. Isso pode gerar respeito, admiração e confiança, mas também distância se parecer dura ou inacessível.",
    sombra:
      "A sombra da Soberana Estratégica aparece quando autoridade e inteligência viram rigidez.\n\nHera pode buscar posição como prova de valor. Athena pode racionalizar tudo e controlar variáveis.\n\nA cura está em lembrar que autoridade real não exige controle permanente.",
    padraoRelacional:
      "Nos vínculos, você tende a valorizar clareza, compromisso, lealdade e coerência. Relações ambíguas, desorganizadas ou emocionalmente instáveis podem te cansar rapidamente.\n\nO risco é tentar organizar o vínculo como um sistema.",
    caminho:
      "Seu caminho está em sustentar autoridade sem virar rigidez.\n\nHera consciente ocupa lugar com dignidade. Athena consciente cria clareza, estratégia e escolha sem precisar controlar cada movimento.\n\nSua síntese é ocupar lugar sem endurecer, liderar sem controlar e ser lúcida sem se afastar do afeto.",
    essenciaImagem:
      "Sua imagem ideal comunica poder refinado, clareza e elegância estratégica.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são alfaiataria, linhas limpas, estrutura, acabamento impecável, cores sóbrias, acessórios com peso simbólico e estética de posição.",
    paleta:
      "Sua paleta simbólica pede sobriedade, contraste e valor.\n\nBase Hera: preto, marinho, vinho fechado, off-white sofisticado, taupe, azul profundo, grafite e dourado discreto.\n\nCamada Athena: branco limpo, cinza, prata, azul aço, carvão, tons frios estruturados e neutros precisos.",
    modelagem:
      "Sua modelagem simbólica pede estrutura, corte e intenção: blazers bem cortados, calças de alfaiataria, vestidos estruturados, saias midi retas, camisas sofisticadas, conjuntos coordenados, ombro definido e silhuetas limpas.",
    tecidos:
      "Sua matéria ideal precisa comunicar qualidade, estrutura e sobriedade: alfaiataria premium, lã fria, crepe encorpado, seda fosca, algodão estruturado, couro liso pontual, viscose encorpada e tecidos com peso.",
    beleza:
      "Na beleza, sua força aparece em acabamento, definição e controle elegante. Pele polida, olhos definidos, boca em nude sofisticado, vinho ou vermelho profundo e cabelo bem cortado e alinhado sustentam sua presença.",
    presenca:
      "Sua presença se fortalece com postura ereta, ritmo calmo, olhar direto e fala precisa.\n\nSua linguagem corporal ideal transmite: eu sei onde estou, mas não preciso endurecer para ocupar esse lugar.",
    evitar: [
      "Visual improvisado.",
      "Roupas sem estrutura.",
      "Excesso de casualidade.",
      "Infantilidade estética.",
      "Sensualidade exagerada.",
      "Rigidez extrema.",
    ],
    formula: "Autoridade + Clareza + Estratégia",
    leituraFinal:
      "Sua força está em unir posição e lucidez. Você sabe perceber contexto, construir presença e sustentar autoridade com inteligência.\n\nA Soberana Estratégica amadurece quando entende que não precisa controlar tudo para ter valor. Sua beleza simbólica nasce quando Hera e Athena se integram: dignidade com clareza, liderança com humanidade, estrutura com presença viva.",
    proximoPasso: proximoPassoPadrao,
  },

  "Soberana Indomável": {
    nome: "Soberana Indomável",
    combinacao: "Hera + Artemis",
    fraseHero:
      "Você ocupa lugar sem pedir permissão e preserva sua liberdade sem negociar sua dignidade.",
    reconhecimento:
      "A Soberana Indomável nasce do encontro entre posição e liberdade. Existe em você uma força que deseja ocupar um lugar de valor, mas sem abrir mão da própria autonomia.\n\nHera traz dignidade, reconhecimento, vínculo, legitimidade e consciência de posição. Artemis traz independência, território, instinto, movimento e recusa a ser domesticada.\n\nJuntas, elas formam uma mulher que não aceita ser diminuída, controlada ou colocada em um lugar que não respeita sua força.",
    essencia:
      "A Soberana Indomável une a dignidade de Hera com a liberdade de Artemis.\n\nHera pergunta: qual é o meu lugar? Artemis pergunta: esse lugar respeita minha liberdade? Essa combinação cria uma mulher que precisa de reconhecimento, mas também de espaço.\n\nSua essência pede uma imagem de autoridade livre: forte, elegante, territorial e viva.",
    dinamica:
      "Seu funcionamento interno tende a alternar entre ocupar e preservar. Hera quer lugar, compromisso e reconhecimento. Artemis quer autonomia, movimento e liberdade.\n\nO desafio é não transformar toda demanda em ameaça. Sua maturidade está em diferenciar compromisso de prisão, reconhecimento de controle e vínculo de perda de liberdade.",
    percebida:
      "Você tende a ser percebida como forte, imponente, independente, intensa e difícil de dominar.\n\nSua presença comunica autoridade e território. Isso gera respeito, mas também pode intimidar. Sua imagem ganha força quando essa indomabilidade é refinada.",
    sombra:
      "A sombra da Soberana Indomável aparece quando dignidade e autonomia viram defesa permanente.\n\nHera pode buscar reconhecimento como prova de valor. Artemis pode rejeitar qualquer vínculo que pareça limitar sua liberdade.\n\nA cura está em perceber que flexibilidade não é submissão, e que vínculo respeitoso não diminui sua força.",
    padraoRelacional:
      "Nos vínculos, você precisa de respeito, espaço, lealdade e admiração real. Relações controladoras, invasivas, ambíguas ou que tentam diminuir sua autonomia não sustentam sua presença.\n\nSeu amadurecimento relacional está em permitir vínculo sem sentir que perdeu autoridade.",
    caminho:
      "Seu caminho está em integrar dignidade e liberdade sem transformar uma em defesa da outra.\n\nHera consciente ocupa lugar com valor. Artemis consciente preserva autonomia sem fugir.\n\nSua síntese é ocupar lugar sem se aprisionar, amar sem se submeter e ser livre sem se fechar.",
    essenciaImagem:
      "Sua imagem ideal comunica autoridade, força e liberdade. Ela não deve parecer dócil, frágil ou excessivamente domesticada.\n\nNesta leitura arquetípica, seus primeiros códigos visuais são estrutura, presença, textura forte, contraste, peças com território, silhuetas firmes, elementos utilitários refinados e elegância com força.",
    paleta:
      "Sua paleta simbólica pede força, território e dignidade.\n\nBase Hera: preto, vinho profundo, marinho, azul petróleo, off-white sofisticado, dourado envelhecido, grafite e verde escuro.\n\nCamada Artemis: oliva, verde musgo, marrom profundo, ferrugem, caqui, couro, areia escura e tons de pedra.",
    modelagem:
      "Sua modelagem simbólica pede estrutura, mobilidade e presença: blazers marcantes, jaquetas estruturadas, calças de bom corte, botas, vestidos firmes com movimento, cintos, ombros definidos, peças utilitárias refinadas e sobreposições fortes.",
    tecidos:
      "Sua matéria ideal precisa comunicar força, qualidade e resistência: couro macio, alfaiataria encorpada, sarja premium, linho estruturado, lã fria, suede, crepe pesado, algodão encorpado e tecidos com textura firme.",
    beleza:
      "Na beleza, sua força aparece em intensidade bem posicionada. Pele natural refinada, olhos marcados, boca em nude forte, vinho, vermelho fechado ou terracota profundo e cabelo com presença sustentam sua imagem.",
    presenca:
      "Sua presença se fortalece com postura firme, movimento decidido e olhar direto.\n\nSua linguagem corporal ideal comunica: eu sei meu lugar, mas continuo livre. O cuidado é não usar força como barreira permanente.",
    evitar: [
      "Visual romântico demais.",
      "Delicadeza excessiva.",
      "Roupas frágeis.",
      "Estética submissa.",
      "Excesso de agressividade visual.",
      "Rigidez sem movimento.",
    ],
    formula: "Soberania + Liberdade + Força",
    leituraFinal:
      "Sua força está em ocupar lugar sem pedir permissão e preservar liberdade sem negociar dignidade.\n\nA Soberana Indomável amadurece quando entende que não precisa viver em defesa para continuar forte. Sua beleza simbólica nasce quando Hera e Artemis se integram: posição com autonomia, vínculo com território, autoridade com movimento.",
    proximoPasso: proximoPassoPadrao,
  },
};

export const reports = Object.fromEntries(
  Object.entries(baseReports).map(([nome, report]) => [
    nome,
    withDossieClosing(report),
  ]),
);
