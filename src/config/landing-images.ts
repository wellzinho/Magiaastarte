export type LandingImage = {
  src: string;
  alt: string;
  placeholder: string;
};

export const landingImages = {
  hero: {
    src: "/imagens/imagemdentro.png",
    alt: "Mulher lendo o guia 21 Práticas de Pombagira aberto nas Práticas 20 e 21, com o livro fechado à frente",
    placeholder: "HERO_21_PRATICAS",
  },
  problem: {
    src: "/imagens/problemaeditorial.png",
    alt: "Mulher pesquisando práticas de Pombagira entre vídeos, buscas e dúvidas contraditórias",
    placeholder: "PROBLEMA_EDITORIAL",
  },
  authority: {
    src: "/imagens/prova.png",
    alt: "Mulher preparando ervas e flores sobre a mesa, com velas, maçãs e materiais de prática",
    placeholder: "ASTARTE_AUTHORITY",
  },
  practicesThumb: {
    src: "/imagens/21pratica.png",
    alt: "Capa do guia 21 Práticas de Pombagira ao lado das páginas internas da Prática 07 — Padê de Bombom",
    placeholder: "PRATICAS_THUMB",
  },
  practicesCover: {
    src: "/imagens/imagemdentro.png",
    alt: "Capa e páginas internas do guia 21 Práticas de Pombagira",
    placeholder: "PRATICAS_COVER",
  },
  practicesInside01: {
    src: "/imagens/imagemdentro2.png",
    alt: "Páginas internas do guia 21 Práticas de Pombagira — Afoshé de Atração",
    placeholder: "PRATICAS_INSIDE_01",
  },
  practicesInside02: {
    src: "/imagens/imagemdentro3.png",
    alt: "Páginas internas do guia 21 Práticas de Pombagira — Defumador de Pombagira",
    placeholder: "PRATICAS_INSIDE_02",
  },
  cards: {
    src: "/imagens/hero.png",
    alt: "Cards das 49 Coisas sobre Pombagira espalhados sobre a mesa",
    placeholder: "CARDS",
  },
  herbs: {
    src: "/imagens/erva.png",
    alt: "Páginas reais do Código das Ervas",
    placeholder: "CODIGO_DAS_ERVAS",
  },
  moon: {
    src: "/imagens/lunar.png",
    alt: "Páginas reais do guia Magia da Lua & Símbolos",
    placeholder: "LUA_SIMBOLOS",
  },
  completeBox: {
    src: "/imagens/boxcompleto.png",
    alt: "Guia Completo de Pombagira Magia Astarte: 21 Práticas de Pombagira, Código das Ervas, Magia da Lua & Símbolos e os cards",
    placeholder: "BOX_COMPLETO",
  },
  beforeAfter: {
    src: "/imagens/life.png",
    alt: "Mulher estudando os materiais Magia Astarte: 21 Práticas, Código das Ervas, Magia da Lua e cards",
    placeholder: "RESULTADO_LIFESTYLE",
  },
} as const satisfies Record<string, LandingImage>;
