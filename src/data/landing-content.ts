import type { PlanId } from "@/config/checkout";

// SEÇÃO 1 — HERO
export const hero = {
  eyebrow: "21 PRÁTICAS DE POMBAGIRA",
  h1: "Já tentou de tudo por esse amor?\nAgora aprenda a fazer sua própria prática de Pombagira!",
  subheadline:
    "Você vai aprender adoçamento, banhos, afoshé, padê e muito mais, além de aprender o preparo e o que cada elemento representa.",
  complement:
    "21 práticas para o amor, atração e magnetismo explicadas do começo ao fim.",
  productLabel: "PRODUTO",
  microcopy:
    "Pagamento único • Acesso após a confirmação do pagamento • 7 dias de garantia",
  cta: "QUERO AS 21 PRÁTICAS",
} as const;

// SEÇÃO 2 — PROBLEMA E IDENTIFICAÇÃO
export const painSection = {
  h2: "A vontade de fazer uma prática de Pombagira não aparece do nada",
  triggers: [
    "Às vezes, tem saudade.",
    "Tem uma conversa que esfriou.",
    "Tem vontade de trazer alguém de volta",
    "Ou de cuidar de você depois de uma relação que machucou.",
  ],
  search: [
    "Você procura uma prática de Pombagira.",
    "Encontra um banho, um adoçamento, um padê.",
    "Salva porque quer fazer.",
  ],
  gap: "Mas, na hora de preparar, falta uma informação.",
  gapDetails: [
    "O vídeo mostra os ingredientes, mas não explica uma etapa.",
    "Nos comentários, cada pessoa fala uma coisa.",
    "E você acaba procurando outra receita.",
  ],
  closing: [
    "Você já sabe o que gostaria de trabalhar.",
    "Agora, quer aprender como preparar a prática.",
  ],
} as const;

// SEÇÃO 3 — AUTORIDADE
export const authoritySection = {
  eyebrow: "MAIS DE 8 ANOS DE ASTARTE",
  badge: "+8 ANOS",
  h2: "Há mais de 8 anos, a Astarte ouve perguntas como as suas.",
  questions: [
    "“Como faz esse padê?”",
    "“Para que serve esse banho?”",
    "“Pode fazer qualquer dia da semana?”",
    "“Descarta onde?”",
  ],
  body: "Essas dúvidas fazem parte da história da Astarte.",
  closing:
    "O 21 Práticas de Pombagira organiza os preparos e suas explicações para você ter onde consultar, aprender e voltar quando precisar.",
  proofH3: "Veja os relatos de quem já comprou",
  prints: [
    {
      src: "/provas/prova1.png",
      alt: "Depoimento de tiagolira: Gostei, comprei, muito bom.",
      width: 331,
      height: 61,
    },
    {
      src: "/provas/prova3.png",
      alt: "Depoimento de cleuza.silveira.7: Gostei muito do conteúdo.",
      width: 331,
      height: 57,
    },
    {
      src: "/provas/prova4.png",
      alt: "Depoimento de Sara Vales Da Silveira Brum: recebi o e-book e estou apaixonada, muito fácil de compreender e ajuda muito.",
      width: 331,
      height: 76,
    },
    {
      src: "/provas/prova5.png",
      alt: "Depoimento: Perfeito, amei muito, já conhecia um pouco e agora vem mais conhecimento.",
      width: 331,
      height: 65,
    },
    {
      src: "/provas/prova6.png",
      alt: "Depoimento: Fiz o padê da apostila e senti uma força fora do normal.",
      width: 331,
      height: 53,
    },
  ],
} as const;

// SEÇÃO 4 — ANCORAGEM DE VALOR
export const costAnchor = {
  h2: "Os vídeos ficam salvos.\nAs explicações ficam espalhadas.",
  scattered: [
    "Um preparo aqui.",
    "Uma lista de materiais ali.",
    "A resposta para uma dúvida em algum comentário que você não encontra mais.",
  ],
  // {price} é substituído pelo preço configurado em src/config/checkout.ts
  offer:
    "Por {price}, você recebe as 21 práticas reunidas em um guia, com materiais, etapas e orientações para consultar durante o aprendizado.",
  closing: ["Você compra uma vez.", "E pode voltar ao material quando precisar."],
  cta: "COMPRAR AS 21 PRÁTICAS",
} as const;

// SEÇÃO 5 — COMO FUNCIONA
export const threeSteps = {
  eyebrow: "COMO FUNCIONA",
  h2: "Da escolha da prática ao preparo.",
  steps: [
    {
      number: "01",
      title: "ESCOLHA",
      text: "Veja a finalidade de cada prática e encontre o que você quer fazer naquele momento.",
    },
    {
      number: "02",
      title: "CONFIRA",
      text: "Leia os materiais, as orientações e o que precisa saber antes de começar.",
    },
    {
      number: "03",
      title: "ACOMPANHE O PREPARO",
      text: "Siga as etapas explicadas no guia e consulte as orientações sobre o que fazer depois.",
    },
  ],
  closing: "Tudo organizado para você acompanhar no seu ritmo.",
} as const;

// SEÇÃO 6 — CONTEÚDO DAS 21 PRÁTICAS
export const productPraticas = {
  eyebrow: "POR DENTRO DO GUIA",
  h2: "Veja o que você vai aprender a preparar.",
  body: "Banhos, padês, velas, afoshés, defumações e outras práticas ligadas a Pombagira.",
  focus: "Entre elas, preparos voltados para amor, atração e cuidado com você.",
  layersLead: "Em cada prática, você encontra:",
  layers: [
    "Para que serve.",
    "Quando faz sentido usar.",
    "Quais materiais são necessários.",
    "O que saber antes de começar.",
    "Como preparar, passo a passo.",
    "O que os elementos representam.",
    "Orientações para depois do preparo.",
    "Dúvidas comuns.",
  ],
  galleryLead: "Você pode conferir exemplos nas páginas abaixo.",
  cta: "COMPRAR AGORA",
} as const;

// SEÇÃO 7 — OFERTA: DOIS CARDS + COMPARATIVO
export type OfferOption = {
  id: PlanId;
  badge?: string;
  title: string;
  subtitle: string;
  tagline: string;
  includes: readonly string[];
  /** Small price tag shown on the card image (e.g. price difference). */
  tag?: string;
  cta: string;
};

export type OfferComparisonRow = {
  label: string;
  practice: boolean;
  autonomy: boolean;
};

export const offerSection = {
  eyebrow: "DUAS FORMAS DE COMEÇAR",
  h2: "Escolha o que você quer receber.",
  // {practicePrice} é substituído pelo preço real das 21 Práticas.
  lead: "Você pode começar pelas 21 Práticas de Pombagira por {practicePrice} ou levar o Guia Completo de Pombagira por apenas R$10 a mais.",
  paymentLabel: "Pagamento único",
  accessLabel: "Acesso após a confirmação do pagamento",
  micro: "Produto digital • 7 dias de garantia",
  options: [
    {
      id: "practice",
      title: "21 Práticas de Pombagira",
      subtitle: "VERSÃO INICIAL",
      tagline: "O guia para aprender os preparos.",
      includes: [
        "Banhos, padês, velas e outras práticas organizadas",
        "Finalidade e materiais de cada preparo",
        "Passo a passo explicado",
        "Significado dos elementos",
        "Orientações antes e depois",
        "Dúvidas comuns",
      ],
      cta: "QUERO AS 21 PRÁTICAS",
    },
    {
      id: "autonomy",
      badge: "MAIS COMPLETO",
      title: "Guia Completo de Pombagira",
      subtitle: "VERSÃO COMPLETA",
      tagline: "As 21 práticas + materiais para aprofundar seu aprendizado.",
      includes: [
        "Tudo das 21 Práticas de Pombagira",
        "Código das Ervas — o papel das ervas e as escolhas explicadas no material",
        "Magia da Lua & Símbolos — os momentos e elementos presentes nas práticas",
        "49 cards: Coisas sobre Pombagira que Ninguém te Conta",
        "5 áudios para acompanhar as práticas",
      ],
      tag: "Por mais R$ 10,00",
      cta: "QUERO O GUIA COMPLETO",
    },
  ] as readonly OfferOption[],
  comparison: {
    h3: "O QUE VOCÊ RECEBE",
    columns: { practice: "21 PRÁTICAS", autonomy: "GUIA COMPLETO" },
    rows: [
      { label: "21 práticas de Pombagira", practice: true, autonomy: true },
      { label: "Materiais, etapas e orientações de cada prática", practice: true, autonomy: true },
      { label: "Significado dos elementos e dúvidas comuns", practice: true, autonomy: true },
      { label: "Código das Ervas", practice: false, autonomy: true },
      { label: "Magia da Lua & Símbolos", practice: false, autonomy: true },
      { label: "49 cards: Coisas sobre Pombagira que Ninguém te Conta", practice: false, autonomy: true },
      { label: "5 áudios para acompanhar as práticas", practice: false, autonomy: true },
    ] as readonly OfferComparisonRow[],
    priceLabel: "Preço",
    included: "Incluído",
    notIncluded: "Não incluído",
  },
} as const;

// SEÇÃO 8 — ANTES E DEPOIS DO APRENDIZADO
export const beforeAfter = {
  h2: "Na hora de preparar, faz diferença ter a explicação por perto.",
  before: {
    label: "ANTES",
    text: "Você encontra uma prática, salva e tenta lembrar onde estava cada informação. Quando aparece uma dúvida, começa outra pesquisa.",
  },
  after: {
    label: "COM O GUIA",
    text: "Você abre a prática, confere os materiais, lê as orientações e acompanha o preparo no mesmo lugar. Sem ajuda de pai/mãe de santo e sem precisar iniciar uma nova pesquisa.",
  },
  complement:
    "Você ainda quer tentar por esse amor.\nMas não quer fazer qualquer coisa.",
  proofH2:
    "Veja o que compradores disseram sobre a clareza e o conteúdo do material.",
  prints: [
    {
      src: "/provas/prova7.png",
      alt: "Depoimento de a_voz_do_divino_oficial: conteúdo de altíssima qualidade, vale muito a pena, padês de confiança.",
      width: 331,
      height: 142,
    },
    {
      src: "/provas/prova8.png",
      alt: "Depoimento de Albuquerque Flavia: amei, material super completo e de fácil entendimento.",
      width: 331,
      height: 94,
    },
    {
      src: "/provas/prova9.png",
      alt: "Depoimento de marciasaraivamarcia: adquiri o e-book e estou muito satisfeita com o suporte e a explicação.",
      width: 331,
      height: 90,
    },
    {
      src: "/provas/prova18.png",
      alt: "Depoimento no WhatsApp: os padês do material lembram os que a avó fazia em 76 anos de Candomblé.",
      width: 656,
      height: 204,
    },
    {
      src: "/provas/prova19.png",
      alt: "Depoimento de heliossoaresterapeutaholistico: problema resolvido, atendimento atencioso e material excelente.",
      width: 656,
      height: 204,
    },
    {
      src: "/provas/prova20.png",
      alt: "Depoimento de djfelixcorttinaz: comprei, é excelente, recomendo.",
      width: 638,
      height: 169,
    },
    {
      src: "/provas/prova21.png",
      alt: "Depoimento de natty_kaiseer: melhor compra da vida.",
      width: 638,
      height: 169,
    },
    {
      src: "/provas/prova10.png",
      alt: "Depoimento: Perfeito, amei muito, já conhecia um pouco e agora vem mais conhecimento.",
      width: 571,
      height: 117,
    },
    {
      src: "/provas/prova11.png",
      alt: "Depoimento de tiagolira: Gostei, comprei, muito bom.",
      width: 477,
      height: 117,
    },
    {
      src: "/provas/prova12.png",
      alt: "Depoimento de cleuza.silveira.7: Gostei muito do conteúdo.",
      width: 343,
      height: 83,
    },
    {
      src: "/provas/prova13.png",
      alt: "Depoimento de sntbibianca: Comprei o meu hoje. Axé.",
      width: 334,
      height: 83,
    },
    {
      src: "/provas/prova14.png",
      alt: "Depoimento de maira_caineli: Gostei do conteúdo.",
      width: 452,
      height: 74,
    },
    {
      src: "/provas/prova15.png",
      alt: "Depoimento de Rosane Pacheco Marques: Pode comprar, é seguro e o suporte é bem rápido.",
      width: 604,
      height: 164,
    },
    {
      src: "/provas/prova16.png",
      alt: "Depoimento de Valnice Mendes: O meu chegou. Ótimo conteúdo, gratidão.",
      width: 422,
      height: 108,
    },
    {
      src: "/provas/prova17.png",
      alt: "Depoimento de Triplice Dourado Tarot: Comprei e consegui um efeito maravilhoso na vida profissional de uma cliente. Super recomendo.",
      width: 656,
      height: 216,
    },
  ],
} as const;

// SEÇÃO 9 — FAQ
export const faqSection = {
  h2: "Antes de escolher, vale esclarecer.",
} as const;

export const faqItems = [
  {
    question: "Preciso já saber fazer as práticas?",
    answer:
      "O guia apresenta materiais, etapas e orientações para apoiar seu aprendizado. Você pode conferir exemplos das páginas antes de comprar.",
  },
  {
    question: "Preciso ter todos os ingredientes?",
    answer:
      "Cada prática informa seus materiais. Você pode consultar o guia antes de escolher qual preparo estudar e reunir o necessário.",
  },
  {
    question: "Qual é a diferença entre as opções?",
    answer:
      "Por R$37,90, você recebe as 21 Práticas de Pombagira.\nPor R$47,90, recebe também Código das Ervas, Magia da Lua & Símbolos, 49 cards e 5 áudios para te guiar durante as práticas.",
  },
  {
    question: "Como recebo?",
    answer:
      "Após a confirmação do pagamento, o acesso fica disponível na Kiwify. As informações de acesso são enviadas ao e-mail informado na compra.",
  },
  {
    question: "É assinatura?",
    answer: "Não. O pagamento é único, sem mensalidade, e o acesso é vitalício.",
  },
  {
    question: "Tem garantia?",
    answer:
      "Sim. Você pode conhecer o material e solicitar reembolso dentro dos 7 dias de garantia.",
  },
] as const;

// SEÇÃO 10 — FECHAMENTO EXCLUSIVO DO GUIA COMPLETO
export const finalAnchor = {
  h2: "As práticas são o começo.\nVocê pode levar o conteúdo completo por R$10 a mais.",
  lead: "No Guia Completo de Pombagira, você recebe:",
  includes: [
    "As 21 Práticas de Pombagira.",
    "Código das Ervas.",
    "Magia da Lua & Símbolos.",
    "49 cards sobre Pombagira.",
    "5 áudios para acompanhar as práticas.",
  ],
  // {price} é substituído pelo preço configurado em src/config/checkout.ts
  total: "Tudo por {price}.",
  micro: "Pagamento único • Acesso digital • 7 dias de garantia",
  cta: "QUERO O GUIA COMPLETO",
} as const;

export const footerDisclaimer =
  "Os conteúdos da Magia Astarte são informativos e refletem práticas, registros e referências que podem variar entre casas e tradições. O material não substitui orientação religiosa individual quando necessária.";
