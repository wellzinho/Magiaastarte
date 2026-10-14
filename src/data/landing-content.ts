// SEÇÃO 1 — HERO
export const hero = {
  eyebrow: "21 PRÁTICAS DE POMBAGIRA",
  h1: "Quer conquistar alguém ou ter seu amor de volta?\nAprenda como preparar.",
  subheadline:
    "Conheça práticas para o amor, como adoçamento, banhos e padês, com o preparo explicado para você fazer com suas próprias mãos.",
  // {price} é substituído pelo preço configurado em src/config/checkout.ts
  format: "Guia digital • {price}",
  microcopy: "Acesso após a aprovação do pagamento • 7 dias de garantia",
  cta: "QUERO MEU AMOR DE VOLTA",
  /** Copy e ênfase usadas só na composição mobile da hero. */
  mobile: {
    headline: "Quer conquistar alguém ou ter seu amor de volta?",
    headlineEmphasis: "seu amor de volta",
    subheadline:
      "Práticas de Pombagira para o amor, com os materiais e o passo a passo para fazer com suas próprias mãos.",
    microcopy: "Acesso após a aprovação do pagamento • Garantia de 7 dias",
    cta: "QUERO MEU AMOR DE VOLTA",
  },
} as const;

// SEÇÃO 2 — IDENTIFICAÇÃO E DESEJO
export const painSection = {
  h2: "O que você queria era receber um “tô com saudade”.",
  h2Lead: "O que você queria era receber um",
  h2Bubble: "tô com saudade",
  desires: [
    "Voltar a conversar.",
    "Sentir que a outra pessoa também quer estar perto.",
    "Não precisar ser sempre você quem procura.",
  ],
  desireEmphasis: "também quer estar perto",
  transition:
    "É por isso que um adoçamento ou uma prática de aproximação chama sua atenção.",
  doubtLead: "Mas, quando decide fazer, vem a dúvida:",
  doubtQuestion: "Será que estou fazendo certo?",
  closing:
    "O 21 Práticas de Pombagira reúne o preparo e o fundamento para você entender o que usar e como fazer.",
  productName: "21 Práticas de Pombagira",
} as const;

// SEÇÃO 3 — PRODUTO POR DENTRO
export const productSection = {
  h2: "Da lista de ingredientes ao “agora eu entendi”.",
  intro:
    "No 21 Práticas de Pombagira, você acompanha o preparo e entende o papel dos elementos usados.",
  points: [
    {
      title: "O que separar",
      text: "Os materiais necessários para preparar a prática.",
    },
    {
      title: "Como preparar",
      text: "O passo a passo para acompanhar durante o preparo.",
    },
    {
      title: "Por que usar",
      text: "O fundamento dos elementos, explicado junto da prática.",
    },
  ],
  closing:
    "Para consultar quando a dúvida aparece — inclusive com os materiais já na sua frente.",
  cta: "QUERO MEU AMOR DE VOLTA",
} as const;

// SEÇÃO 4 — CONFIANÇA E DEPOIMENTOS
export const trustSection = {
  h2: "Quem compra recomenda",
  body: [
    "Há mais de 8 anos, a Magia Astarte acompanha dúvidas sobre Pombagira e suas práticas.",
    "Aqui, o fundamento aparece junto do preparo, para ajudar você a entender o que está fazendo.",
  ],
  prints: [
    {
      src: "/provas/prova8.png",
      alt: "Depoimento de Albuquerque Flavia: amei, material super completo e de fácil entendimento.",
      width: 331,
      height: 94,
    },
    {
      src: "/provas/prova7.png",
      alt: "Depoimento de a_voz_do_divino_oficial: conteúdo de altíssima qualidade, vale muito a pena, padês de confiança.",
      width: 331,
      height: 142,
    },
    {
      src: "/provas/prova18.png",
      alt: "Depoimento: neste ebook há padês que a avó, com 76 anos de candomblé, fazia e hoje quase não se vê mais.",
      width: 656,
      height: 204,
    },
    {
      src: "/provas/prova17.png",
      alt: "Depoimento de Triplice Dourado Tarot: comprou e conseguiu efeito maravilhoso com magia de Pombagira, super recomenda.",
      width: 656,
      height: 216,
    },
    {
      src: "/provas/prova19.png",
      alt: "Depoimento de heliosoaresterapeutaholistico: problema solucionado, atendimento atencioso, material excelente.",
      width: 656,
      height: 204,
    },
    {
      src: "/provas/prova4.png",
      alt: "Depoimento de Sara Vales: recebeu o e-book, fácil de compreender, ajuda muito, super recomenda.",
      width: 331,
      height: 76,
    },
    {
      src: "/provas/prova9.png",
      alt: "Depoimento de marciasaraivamarcia: muito satisfeita com o e-book, suporte maravilhoso e explicações com carinho.",
      width: 331,
      height: 90,
    },
    {
      src: "/provas/prova6.png",
      alt: "Depoimento: fez o padê da apostila e sentiu uma força fora do normal.",
      width: 331,
      height: 53,
    },
    {
      src: "/provas/prova15.png",
      alt: "Depoimento de Rosane Pacheco Marques: pode comprar, é seguro e o suporte é bem rápido.",
      width: 604,
      height: 164,
    },
    {
      src: "/provas/prova10.png",
      alt: "Depoimento: Perfeito, amei muito, já conhecia um pouco e agora vem mais conhecimento.",
      width: 571,
      height: 117,
    },
  ],
} as const;

// SEÇÃO 5 — APRESENTAÇÃO INTERNA + OFERTA ÚNICA E GARANTIA
export const offerSection = {
  h2Lead: "Um adoçamento. Uma aproximação.",
  h2Question: "Qual prática você veio procurar?",
  description:
    "Se a vontade é ter esse amor de volta, conheça por dentro o material que ensina você a preparar suas próprias práticas de Pombagira.",
  galleryHintMobile: "Deslize para ver as páginas. Toque para ampliar.",
  galleryHintDesktop: "Clique na imagem para ampliar.",
  galleryClosing:
    "É esse material que você recebe para consultar no celular e acompanhar durante o preparo.",
  galleryClosingEmphasis: "É esse material que você recebe",
  gallery: [
    { imageKey: "practicesCover" as const },
    { imageKey: "practicesInside01" as const },
    { imageKey: "practicesInside02" as const },
  ],
  name: "21 Práticas de Pombagira",
  descriptionOffer:
    "Um guia digital com 21 práticas para o amor, com tudo que você precisa para ter o seu amor de volta.",
  includes: [
    "21 práticas reunidas em um material digital.",
    "Materiais e passo a passo de preparo.",
    "Explicações sobre os fundamentos.",
    "Conteúdo para consultar no celular.",
  ],
  condition: "Pagamento único.",
  cta: "QUERO MEU AMOR DE VOLTA",
  micro: "Pagamento pela Kiwify • Pix ou cartão",
  guaranteeTitle: "7 dias para conhecer o material.",
  guaranteeBody:
    "Você tem 7 dias para avaliar o conteúdo e solicitar reembolso pela Kiwify se decidir que ele não é para você.",
} as const;

// SEÇÃO 6 — DÚVIDAS ESSENCIAIS
export const faqSection = {
  h2: "Antes de escolher sua prática.",
  cta: "QUERO MEU AMOR DE VOLTA",
} as const;

export const faqItems = [
  {
    question: "É um livro físico ou digital?",
    answer:
      "É um material digital para consultar no celular ou computador. Não há envio de livro físico.",
  },
  {
    question: "Homens também podem aprender?",
    answer:
      "Sim. O material também é voltado a homens interessados em aprender práticas de Pombagira para o amor.",
  },
  {
    question: "Vou encontrar só a lista de ingredientes?",
    answer:
      "O material apresenta os materiais, o passo a passo e explicações sobre os fundamentos das práticas.",
  },
  {
    question: "Como recebo o acesso?",
    answer:
      "Após a aprovação do pagamento, siga as instruções de acesso enviadas pela Kiwify para o e-mail informado na compra.",
  },
] as const;

export const footerDisclaimer =
  "Os conteúdos da Magia Astarte são informativos e refletem práticas, registros e referências que podem variar entre casas e tradições. O material não substitui orientação religiosa individual quando necessária.";
