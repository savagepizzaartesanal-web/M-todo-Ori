const baseTextures = {
  mist: "linear-gradient(135deg, rgba(210,204,218,0.92), rgba(122,112,137,0.72))",
  velvet: "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.16), transparent 25%), linear-gradient(135deg, #2c1118, #5c1b2a 52%, #1a0b10)",
  silk: "linear-gradient(135deg, #ead7bc, #b98552 42%, #f1c178 58%, #6e3f24)",
  linen: "linear-gradient(135deg, #d8c2a1, #8c6d4c)",
  cotton: "linear-gradient(135deg, #e7ded2, #b79d82)",
  leather: "linear-gradient(135deg, #211514, #5a3527 48%, #110b0a)",
  metal: "linear-gradient(135deg, #2a251e, #c59b58 48%, #342315)",
  chiffon: "linear-gradient(135deg, rgba(88,58,86,0.82), rgba(174,112,137,0.56), rgba(32,18,38,0.9))",
  wool: "linear-gradient(135deg, #3c3328, #8b765d)",
  satin: "linear-gradient(135deg, #171018, #6b3b55 44%, #d8a574 56%, #251116)",
};

const defaultGuide = {
  palette: [
    { name: "Ouro queimado", hex: "#c9954f", role: "assinatura simbólica" },
    { name: "Noite profunda", hex: "#120909", role: "base de presença" },
    { name: "Âmbar suave", hex: "#e6b66d", role: "ponto de luz" },
  ],
  fabrics: [
    { name: "Textura nobre", note: "toque visual com profundidade", texture: baseTextures.velvet },
    { name: "Caimento fluido", note: "movimento sem excesso", texture: baseTextures.chiffon },
    { name: "Brilho baixo", note: "luz que aparece sem gritar", texture: baseTextures.satin },
  ],
  silhouettes: ["linhas que acompanham o corpo", "presença com movimento", "estrutura sem rigidez"],
  beauty: ["pele viva", "olhar definido com suavidade", "cabelo com presença natural"],
  presence: ["presença contínua", "gesto consciente", "imagem com intenção"],
  breaks: ["excesso de informação", "dureza sem emoção", "visual genérico demais"],
};

export const reportVisualGuides = {
  "Musa Enigmática": {
    palette: [
      { name: "Lavanda enevoado", hex: "#b7a4c9", role: "mistério sensível" },
      { name: "Vinho frio", hex: "#4a1320", role: "magnetismo velado" },
      { name: "Azul acinzentado", hex: "#76818c", role: "profundidade silenciosa" },
    ],
    fabrics: [
      { name: "Chiffon", note: "transparência que sugere", texture: baseTextures.chiffon },
      { name: "Cetim fosco", note: "brilho baixo e memória", texture: baseTextures.satin },
      { name: "Renda escura", note: "detalhe que permanece", texture: baseTextures.velvet },
    ],
    silhouettes: ["movimento antes da definição", "camadas leves", "sensualidade por sugestão"],
    beauty: ["olhar esfumado", "pele luminosa baixa", "cabelo com textura e mistério"],
    presence: ["não se entrega inteira", "cria curiosidade", "permanece na memória"],
    breaks: ["literalidade demais", "exposição óbvia", "visual rígido sem névoa"],
  },

  "Rainha Magnética": {
    palette: [
      { name: "Vinho imperial", hex: "#6d1e25", role: "desejo com posição" },
      { name: "Dourado antigo", hex: "#c8974f", role: "valor e reconhecimento" },
      { name: "Marfim quente", hex: "#d8c0a0", role: "presença elevada" },
    ],
    fabrics: [
      { name: "Veludo", note: "peso nobre", texture: baseTextures.velvet },
      { name: "Seda encorpada", note: "luz que impõe", texture: baseTextures.silk },
      { name: "Metal dourado", note: "ponto de autoridade", texture: baseTextures.metal },
    ],
    silhouettes: ["cintura marcada", "coluna alongada", "estrutura com sensualidade"],
    beauty: ["pele polida", "boca presente", "cabelo com acabamento majestoso"],
    presence: ["atrai e define lugar", "não pede licença", "comunica valor"],
    breaks: ["desleixo visual", "sensualidade sem posição", "peças frágeis demais"],
  },

  "Amante Nutridora": {
    palette: [
      { name: "Terracota suave", hex: "#b66f4c", role: "calor afetivo" },
      { name: "Verde oliva", hex: "#6f6a3e", role: "natureza e presença" },
      { name: "Creme quente", hex: "#e6d0aa", role: "acolhimento" },
    ],
    fabrics: [
      { name: "Linho macio", note: "naturalidade quente", texture: baseTextures.linen },
      { name: "Algodão", note: "toque humano", texture: baseTextures.cotton },
      { name: "Malha fluida", note: "conforto que aproxima", texture: baseTextures.wool },
    ],
    silhouettes: ["formas envolventes", "caimento confortável", "feminilidade habitável"],
    beauty: ["pele viçosa", "boca hidratada", "cabelo natural com movimento"],
    presence: ["acolhe sem apagar", "aproxima", "transmite segurança emocional"],
    breaks: ["frieza excessiva", "estrutura dura", "visual árido demais"],
  },

  "Sedutora Estratégica": {
    palette: [
      { name: "Chocolate profundo", hex: "#3a1d16", role: "controle e desejo" },
      { name: "Cobre antigo", hex: "#a96d3d", role: "calor calculado" },
      { name: "Preto acetinado", hex: "#0b0909", role: "mistério objetivo" },
    ],
    fabrics: [
      { name: "Couro macio", note: "controle tátil", texture: baseTextures.leather },
      { name: "Seda escura", note: "atração precisa", texture: baseTextures.silk },
      { name: "Cetim fechado", note: "brilho sob domínio", texture: baseTextures.satin },
    ],
    silhouettes: ["recortes estratégicos", "linhas limpas", "sensualidade com direção"],
    beauty: ["olhar marcado", "pele acetinada", "boca em tom profundo"],
    presence: ["conduz o olhar", "não revela tudo", "escolhe o impacto"],
    breaks: ["romantismo ingênuo", "excesso de ornamento", "sensualidade sem intenção"],
  },

  "Selvagem Magnética": {
    palette: [
      { name: "Cobre queimado", hex: "#b7673c", role: "instinto vivo" },
      { name: "Terra escura", hex: "#2a1811", role: "força primitiva" },
      { name: "Dourado solar", hex: "#c79042", role: "calor de presença" },
    ],
    fabrics: [
      { name: "Couro natural", note: "território e força", texture: baseTextures.leather },
      { name: "Linho rústico", note: "corpo real", texture: baseTextures.linen },
      { name: "Metal envelhecido", note: "instinto lapidado", texture: baseTextures.metal },
    ],
    silhouettes: ["movimento livre", "cintura com presença", "formas orgânicas"],
    beauty: ["pele bronzeada", "textura natural", "cabelo com volume vivo"],
    presence: ["magnetismo físico", "liberdade", "energia que não se domestica"],
    breaks: ["polidez artificial", "delicadeza frágil", "visual muito certinho"],
  },

  "Rainha Oculta": {
    palette: [
      { name: "Roxo noite", hex: "#2f1b46", role: "poder velado" },
      { name: "Ouro antigo", hex: "#b98948", role: "nobreza contida" },
      { name: "Preto profundo", hex: "#080607", role: "mistério soberano" },
    ],
    fabrics: [
      { name: "Veludo escuro", note: "profundidade nobre", texture: baseTextures.velvet },
      { name: "Seda fechada", note: "silêncio refinado", texture: baseTextures.silk },
      { name: "Metal antigo", note: "autoridade simbólica", texture: baseTextures.metal },
    ],
    silhouettes: ["linhas longas", "estrutura reservada", "presença monumental"],
    beauty: ["olhar profundo", "acabamento polido", "cabelo arquitetônico"],
    presence: ["impõe em silêncio", "não se explica", "sustenta mistério"],
    breaks: ["exposição direta", "excesso de doçura", "casualidade sem intenção"],
  },

  "Guardiã Sensível": {
    palette: [
      { name: "Lavanda suave", hex: "#b9a7d9", role: "sensibilidade" },
      { name: "Creme orgânico", hex: "#ddc8a7", role: "acolhimento" },
      { name: "Verde claro", hex: "#9aa77a", role: "cuidado natural" },
    ],
    fabrics: [
      { name: "Algodão", note: "toque afetivo", texture: baseTextures.cotton },
      { name: "Tricô leve", note: "presença que aquece", texture: baseTextures.wool },
      { name: "Viscose suave", note: "fluidez tranquila", texture: baseTextures.mist },
    ],
    silhouettes: ["conforto com forma", "linhas suaves", "feminilidade serena"],
    beauty: ["pele natural", "olhos delicados", "cabelo sem rigidez"],
    presence: ["acolhe com limite", "acalma o ambiente", "cuida sem se perder"],
    breaks: ["agressividade visual", "frieza impessoal", "excesso de peso"],
  },

  "Visionária Sutil": {
    palette: [
      { name: "Lilás frio", hex: "#c6b7ef", role: "intuição clara" },
      { name: "Prata névoa", hex: "#bfc4ca", role: "distância etérea" },
      { name: "Azul lunar", hex: "#5e6b82", role: "visão interna" },
    ],
    fabrics: [
      { name: "Organza", note: "leveza conceitual", texture: baseTextures.mist },
      { name: "Cetim frio", note: "luz futurista", texture: baseTextures.satin },
      { name: "Malha fina", note: "movimento discreto", texture: baseTextures.chiffon },
    ],
    silhouettes: ["linhas leves", "assimetria sutil", "estrutura mínima"],
    beauty: ["luminosidade fria", "olhar limpo", "cabelo leve ou polido"],
    presence: ["parece ver além", "não força presença", "tem silêncio inteligente"],
    breaks: ["peso visual excessivo", "terra demais", "ornamento muito literal"],
  },

  "Selvagem Intuitiva": {
    palette: [
      { name: "Oliva profundo", hex: "#5d6540", role: "liberdade instintiva" },
      { name: "Lavanda cinza", hex: "#a89eb6", role: "intuição" },
      { name: "Areia fria", hex: "#c4b89f", role: "território suave" },
    ],
    fabrics: [
      { name: "Linho lavado", note: "liberdade no corpo", texture: baseTextures.linen },
      { name: "Chiffon seco", note: "mistério em movimento", texture: baseTextures.chiffon },
      { name: "Algodão cru", note: "naturalidade sem esforço", texture: baseTextures.cotton },
    ],
    silhouettes: ["movimento livre", "camadas naturais", "forma sem aprisionar"],
    beauty: ["olhar intuitivo", "pele real", "cabelo com textura orgânica"],
    presence: ["não aceita captura", "preserva território", "sente antes de explicar"],
    breaks: ["rigidez social", "visual domesticado", "brilho artificial demais"],
  },

  "Autônoma Absoluta": {
    palette: [
      { name: "Preto gráfico", hex: "#050505", role: "autonomia" },
      { name: "Branco seco", hex: "#e5ded2", role: "clareza" },
      { name: "Dourado limpo", hex: "#d1a45e", role: "precisão" },
    ],
    fabrics: [
      { name: "Alfaiataria seca", note: "presença sem concessão", texture: baseTextures.wool },
      { name: "Couro liso", note: "autonomia visual", texture: baseTextures.leather },
      { name: "Algodão estruturado", note: "clareza cotidiana", texture: baseTextures.cotton },
    ],
    silhouettes: ["linhas retas", "estrutura limpa", "conforto funcional"],
    beauty: ["acabamento limpo", "olhar direto", "cabelo prático e forte"],
    presence: ["não negocia contorno", "clareza", "movimento independente"],
    breaks: ["excesso romântico", "dependência visual", "informação decorativa demais"],
  },

  "Cuidadora Estratégica": {
    palette: [
      { name: "Camel", hex: "#b88a58", role: "acolhimento maduro" },
      { name: "Marrom profundo", hex: "#3a251a", role: "estrutura" },
      { name: "Creme quente", hex: "#ddc4a0", role: "acesso" },
    ],
    fabrics: [
      { name: "Lã fria", note: "cuidado com forma", texture: baseTextures.wool },
      { name: "Algodão encorpado", note: "presença confiável", texture: baseTextures.cotton },
      { name: "Linho estruturado", note: "naturalidade organizada", texture: baseTextures.linen },
    ],
    silhouettes: ["estrutura confortável", "linhas práticas", "base confiável"],
    beauty: ["natural polido", "olho definido", "cabelo arrumado sem dureza"],
    presence: ["cuida com direção", "organiza sem pesar", "gera confiança"],
    breaks: ["fragilidade visual", "excesso caótico", "visual frio demais"],
  },

  "Matriarca Soberana": {
    palette: [
      { name: "Cobre profundo", hex: "#a85f38", role: "poder caloroso" },
      { name: "Marrom cacau", hex: "#3b2018", role: "base ancestral" },
      { name: "Ouro envelhecido", hex: "#b88745", role: "autoridade" },
    ],
    fabrics: [
      { name: "Linho pesado", note: "raiz e presença", texture: baseTextures.linen },
      { name: "Veludo quente", note: "nobreza maternal", texture: baseTextures.velvet },
      { name: "Metal antigo", note: "peso simbólico", texture: baseTextures.metal },
    ],
    silhouettes: ["estrutura ampla", "cintura sustentada", "presença firme"],
    beauty: ["pele quente", "boca terrosa", "cabelo com força natural"],
    presence: ["sustenta o campo", "protege com autoridade", "não se diminui"],
    breaks: ["leveza sem base", "infantilização", "visual sem firmeza"],
  },

  "Protetora Selvagem": {
    palette: [
      { name: "Verde musgo", hex: "#4a5133", role: "território" },
      { name: "Terra bruta", hex: "#6a3f25", role: "instinto" },
      { name: "Areia quente", hex: "#c9a16f", role: "proteção" },
    ],
    fabrics: [
      { name: "Sarja", note: "força funcional", texture: baseTextures.linen },
      { name: "Couro", note: "proteção visual", texture: baseTextures.leather },
      { name: "Algodão cru", note: "corpo livre", texture: baseTextures.cotton },
    ],
    silhouettes: ["mobilidade", "camadas de proteção", "estrutura utilitária"],
    beauty: ["pele real", "olhar firme", "cabelo livre"],
    presence: ["protege sem pedir permissão", "ocupa território", "sustenta instinto"],
    breaks: ["ornamento frágil", "polidez excessiva", "visual preso demais"],
  },

  "Soberana Estratégica": {
    palette: [
      { name: "Carvão", hex: "#161514", role: "controle" },
      { name: "Ouro seco", hex: "#c59a55", role: "posição" },
      { name: "Cinza quente", hex: "#8a7b68", role: "sofisticação" },
    ],
    fabrics: [
      { name: "Alfaiataria", note: "decisão visual", texture: baseTextures.wool },
      { name: "Seda fosca", note: "nobreza silenciosa", texture: baseTextures.silk },
      { name: "Couro liso", note: "limite e força", texture: baseTextures.leather },
    ],
    silhouettes: ["linhas precisas", "ombro com presença", "proporção controlada"],
    beauty: ["acabamento limpo", "olhar estratégico", "cabelo polido"],
    presence: ["define o campo", "calcula impacto", "comunica autoridade"],
    breaks: ["visual mole demais", "romantização excessiva", "informação sem hierarquia"],
  },

  "Soberana Indomável": {
    palette: [
      { name: "Ouro queimado", hex: "#c18a42", role: "valor próprio" },
      { name: "Oliva escuro", hex: "#4c5130", role: "autonomia" },
      { name: "Preto terra", hex: "#15100c", role: "força" },
    ],
    fabrics: [
      { name: "Couro natural", note: "independência", texture: baseTextures.leather },
      { name: "Linho firme", note: "liberdade com forma", texture: baseTextures.linen },
      { name: "Metal antigo", note: "posição conquistada", texture: baseTextures.metal },
    ],
    silhouettes: ["estrutura livre", "linhas fortes", "movimento com autoridade"],
    beauty: ["olhar direto", "pele com força", "cabelo sem submissão"],
    presence: ["não aceita diminuição", "ocupa valor", "escolhe liberdade"],
    breaks: ["visual domesticado", "fragilidade performada", "excesso de suavização"],
  },
};

export function getReportVisualGuide(name) {
  return {
    ...defaultGuide,
    ...(reportVisualGuides[name] || {}),
  };
}
