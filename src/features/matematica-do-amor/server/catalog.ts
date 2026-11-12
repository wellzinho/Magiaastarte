export type Fit = "natural" | "adjustment" | "tension";

export type PositionCopy = {
  motivation: string;
  impression: string;
  expression: string;
  path: string;
  shadow: string;
};

export const POSITIONS: Record<number, PositionCopy> = {
  1: {
    motivation: "autonomia e voz própria",
    impression: "firmeza",
    expression: "tomar iniciativa e decidir",
    path: "construir uma direção própria",
    shadow: "impaciência",
  },
  2: {
    motivation: "parceria e confirmação afetiva",
    impression: "sensibilidade e cautela",
    expression: "conciliar, escutar e buscar acordo",
    path: "crescer por cooperação e vínculo",
    shadow: "evitar o conflito",
  },
  3: {
    motivation: "conversa, leveza e expressão",
    impression: "sociabilidade",
    expression: "aproximar pela fala",
    path: "se expressar e experimentar",
    shadow: "dispersão",
  },
  4: {
    motivation: "segurança, constância e previsibilidade",
    impression: "seriedade",
    expression: "organizar, planejar e sustentar o combinado",
    path: "construir devagar, com base estável",
    shadow: "rigidez",
  },
  5: {
    motivation: "liberdade, movimento e novidade",
    impression: "abertura",
    expression: "mudar rápido e testar outra saída",
    path: "aprender por mudança e experiência",
    shadow: "inquietação",
  },
  6: {
    motivation: "segurança, cuidado e compromisso",
    impression: "acolhimento",
    expression: "assumir responsabilidades e proteger",
    path: "construir vínculo e responsabilidade",
    shadow: "cobrança",
  },
  7: {
    motivation: "privacidade, confiança e profundidade",
    impression: "reserva",
    expression: "observar e pensar antes de agir",
    path: "ter tempo, sentido e espaço interior",
    shadow: "distância",
  },
  8: {
    motivation: "respeito, resultado e poder de decisão",
    impression: "autoridade",
    expression: "resolver, liderar e cobrar um resultado",
    path: "buscar realização e domínio prático",
    shadow: "controle",
  },
  9: {
    motivation: "significado, generosidade e ligação emocional",
    impression: "empatia",
    expression: "compreender e olhar o todo",
    path: "aprender com encerramentos e propósito",
    shadow: "idealização",
  },
};

export const COUPLE: Record<number, { motivation: string; impression: string; expression: string }> = {
  1: {
    motivation: "preservar individualidade e novidade",
    impression: "parecer uma relação muito independente",
    expression: "reagir com decisão rápida e precisar dividir a liderança",
  },
  2: {
    motivation: "buscar parceria, troca e segurança emocional",
    impression: "transmitir proximidade e sensibilidade",
    expression: "resolver melhor com escuta e negociação",
  },
  3: {
    motivation: "precisar de conversa, leveza e prazer compartilhado",
    impression: "transmitir sociabilidade e movimento",
    expression: "enfrentar problemas falando, desde que a conversa chegue a uma decisão",
  },
  4: {
    motivation: "buscar estabilidade, rotina e compromisso cumprido",
    impression: "transmitir seriedade e estrutura",
    expression: "resolver com planejamento",
  },
  5: {
    motivation: "precisar de espaço, novidade e renovação",
    impression: "transmitir liberdade e imprevisibilidade",
    expression: "reagir mudando, e por isso precisa combinar o que não pode ficar instável",
  },
  6: {
    motivation: "buscar cuidado, pertencimento e responsabilidade",
    impression: "transmitir vínculo e proteção",
    expression: "assumir compromisso e precisar repartir o cuidado",
  },
  7: {
    motivation: "precisar de privacidade, confiança e profundidade",
    impression: "parecer reservada ou difícil de acessar",
    expression: "resolver com tempo e reflexão, voltando ao assunto depois da pausa",
  },
  8: {
    motivation: "buscar construção, segurança prática e resultado",
    impression: "transmitir força ou disputa",
    expression: "resolver por decisões concretas",
  },
  9: {
    motivation: "buscar significado, compreensão e propósito comum",
    impression: "transmitir intensidade emocional",
    expression: "tentar ver o todo e separar perdão de aceitar a mesma repetição",
  },
};

type PathRow = { a: number; b: number; fit: Fit; text: string };

export const LIFE_PATHS: PathRow[] = [
  { a: 1, b: 1, fit: "tension", text: "os dois precisam de autonomia e podem disputar quem conduz." },
  { a: 1, b: 2, fit: "adjustment", text: "iniciativa e parceria combinam quando quem tem o 1 não decide sozinho e quem tem o 2 fala o que precisa." },
  { a: 1, b: 3, fit: "natural", text: "iniciativa e comunicação costumam manter a relação em movimento." },
  { a: 1, b: 4, fit: "adjustment", text: "um acelera e o outro precisa de segurança e planejamento." },
  { a: 1, b: 5, fit: "natural", text: "os dois valorizam movimento, independência e novas experiências." },
  { a: 1, b: 6, fit: "natural", text: "iniciativa e cuidado podem construir compromisso sem apagar a individualidade." },
  { a: 1, b: 7, fit: "adjustment", text: "ação rápida e necessidade de recolhimento pedem respeito ao ritmo de resposta." },
  { a: 1, b: 8, fit: "tension", text: "pode haver disputa de decisão, autoridade e controle." },
  { a: 1, b: 9, fit: "tension", text: "direção pessoal e idealização podem puxar a relação para lados diferentes." },
  { a: 2, b: 2, fit: "adjustment", text: "há sensibilidade e parceria, mas os dois podem evitar conflitos importantes." },
  { a: 2, b: 3, fit: "tension", text: "segurança emocional e leveza podem se desencontrar quando um quer aprofundar e o outro muda de assunto." },
  { a: 2, b: 4, fit: "natural", text: "parceria e estabilidade favorecem confiança e continuidade." },
  { a: 2, b: 5, fit: "tension", text: "segurança e proximidade entram em choque com liberdade e mudança." },
  { a: 2, b: 6, fit: "natural", text: "parceria, cuidado e compromisso tendem a se reforçar." },
  { a: 2, b: 7, fit: "adjustment", text: "um busca troca e o outro precisa de silêncio e privacidade." },
  { a: 2, b: 8, fit: "natural", text: "parceria e capacidade de construir podem funcionar quando existe igualdade." },
  { a: 2, b: 9, fit: "adjustment", text: "sensibilidade e idealismo aproximam, mas podem alimentar expectativas não faladas." },
  { a: 3, b: 3, fit: "tension", text: "muita conversa e leveza podem deixar decisões difíceis para depois." },
  { a: 3, b: 4, fit: "tension", text: "espontaneidade e necessidade de estrutura têm ritmos diferentes." },
  { a: 3, b: 5, fit: "natural", text: "comunicação, movimento e novidade criam afinidade rápida." },
  { a: 3, b: 6, fit: "tension", text: "leveza e compromisso podem se chocar quando um evita peso e o outro cobra presença." },
  { a: 3, b: 7, fit: "adjustment", text: "um fala para entender e o outro entende antes de falar." },
  { a: 3, b: 8, fit: "tension", text: "expressão livre e foco em resultado podem virar crítica ou pressão." },
  { a: 3, b: 9, fit: "natural", text: "comunicação e visão ampla favorecem conexão." },
  { a: 4, b: 4, fit: "adjustment", text: "há estabilidade, mas a relação pode ficar rígida ou apenas funcional." },
  { a: 4, b: 5, fit: "tension", text: "rotina e liberdade entram em choque se não houver espaço negociado." },
  { a: 4, b: 6, fit: "adjustment", text: "estabilidade e compromisso combinam, mas a relação pode virar só obrigação." },
  { a: 4, b: 7, fit: "natural", text: "constância e profundidade favorecem confiança construída com tempo." },
  { a: 4, b: 8, fit: "natural", text: "organização e realização sustentam planos concretos." },
  { a: 4, b: 9, fit: "tension", text: "segurança prática e expectativas amplas podem divergir sobre prioridades." },
  { a: 5, b: 5, fit: "adjustment", text: "há liberdade e novidade, mas os compromissos precisam ficar claros." },
  { a: 5, b: 6, fit: "adjustment", text: "liberdade e pertencimento podem funcionar quando espaço não vira ausência nem cuidado vira controle." },
  { a: 5, b: 7, fit: "natural", text: "independência e espaço individual tendem a ser compreendidos pelos dois." },
  { a: 5, b: 8, fit: "tension", text: "mudança e controle podem provocar disputa sobre planos e liberdade." },
  { a: 5, b: 9, fit: "tension", text: "desejo de experiência e expectativa emocional ampla podem dificultar continuidade." },
  { a: 6, b: 6, fit: "adjustment", text: "existe compromisso e cuidado, mas pode haver cobrança e sobrecarga." },
  { a: 6, b: 7, fit: "tension", text: "necessidade de proximidade e necessidade de recolhimento pedem negociação constante." },
  { a: 6, b: 8, fit: "natural", text: "cuidado e construção prática podem formar uma parceria consistente." },
  { a: 6, b: 9, fit: "natural", text: "compromisso, generosidade e propósito tendem a se apoiar." },
  { a: 7, b: 7, fit: "natural", text: "os dois entendem privacidade e profundidade, mas precisam evitar silêncio prolongado." },
  { a: 7, b: 8, fit: "tension", text: "reflexão e pressão por resultado podem gerar fechamento e controle." },
  { a: 7, b: 9, fit: "tension", text: "reserva e intensidade podem produzir distância e interpretações silenciosas." },
  { a: 8, b: 8, fit: "adjustment", text: "há força para construir, mas decisões e poder precisam ser divididos." },
  { a: 8, b: 9, fit: "tension", text: "resultado concreto e idealismo podem discordar sobre o que vale sustentar." },
  { a: 9, b: 9, fit: "natural", text: "há compreensão e propósito comum, mas os dois precisam enxergar o presente sem idealizar." },
];

export function lifePathRow(left: number, right: number): PathRow {
  const a = Math.min(left, right);
  const b = Math.max(left, right);
  const row = LIFE_PATHS.find((item) => item.a === a && item.b === b);
  if (!row) throw new Error("Par de caminho ausente.");
  return row;
}

const GROUP: Record<number, string> = {
  1: "space",
  2: "bond",
  3: "talk",
  4: "structure",
  5: "space",
  6: "bond",
  7: "depth",
  8: "structure",
  9: "meaning",
};

const GROUP_FIT: Record<string, Fit> = {
  "space-space": "natural",
  "space-bond": "tension",
  "space-talk": "natural",
  "space-structure": "adjustment",
  "space-depth": "natural",
  "space-meaning": "adjustment",
  "bond-bond": "adjustment",
  "bond-talk": "adjustment",
  "bond-structure": "natural",
  "bond-depth": "adjustment",
  "bond-meaning": "natural",
  "talk-talk": "adjustment",
  "talk-structure": "tension",
  "talk-depth": "adjustment",
  "talk-meaning": "natural",
  "structure-structure": "adjustment",
  "structure-depth": "adjustment",
  "structure-meaning": "tension",
  "depth-depth": "natural",
  "depth-meaning": "adjustment",
  "meaning-meaning": "natural",
};

export function positionFit(left: number, right: number): Fit {
  const leftGroup = GROUP[left] ?? "";
  const rightGroup = GROUP[right] ?? "";
  return GROUP_FIT[`${leftGroup}-${rightGroup}`] ?? GROUP_FIT[`${rightGroup}-${leftGroup}`] ?? "adjustment";
}
