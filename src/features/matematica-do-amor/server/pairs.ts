export type SameReading = {
  need: string;
  strength: string;
  risk: string;
  guidance: string;
};

/** Necessidade compartilhada quando os dois têm o mesmo número. A frase de need é a expressão canônica. */
export const SAME: Record<number, SameReading> = {
  1: {
    need: "autonomia, iniciativa e voz própria",
    strength: "os dois respeitam independência e coragem",
    risk: "competição, decisões unilaterais e dificuldade de ceder",
    guidance: "dividir claramente quais decisões são individuais e quais precisam ser tomadas pelos dois",
  },
  2: {
    need: "parceria, confirmação afetiva e cooperação",
    strength: "sensibilidade para perceber o outro",
    risk: "evitar conflito, guardar incômodo e depender de confirmação",
    guidance: "dizer o que precisa antes de acumular mágoa e terminar cada conversa com uma decisão clara",
  },
  3: {
    need: "conversa, leveza e expressão",
    strength: "facilidade para criar proximidade e recuperar o clima",
    risk: "falar muito sem resolver, dramatizar ou mudar de assunto",
    guidance: "escolher um problema por vez e encerrar a conversa com uma atitude concreta",
  },
  4: {
    need: "segurança, constância e previsibilidade",
    strength: "capacidade de construir rotina e compromisso",
    risk: "rigidez, teimosia e permanência numa relação apenas por hábito",
    guidance: "testar uma mudança concreta sem transformar o acordo em controle permanente",
  },
  5: {
    need: "liberdade, movimento e novidade",
    strength: "respeito por espaço e individualidade",
    risk: "instabilidade, desaparecimentos e dificuldade de sustentar acordos",
    guidance: "combinar o mínimo de presença que mantém o vínculo sem retirar a liberdade dos dois",
  },
  6: {
    need: "cuidado, compromisso e pertencimento",
    strength: "disposição para proteger e sustentar a relação",
    risk: "cobrança, culpa e um cuidar da vida do outro em excesso",
    guidance: "dividir responsabilidades e parar de usar cuidado como prova de amor ou cobrança",
  },
  7: {
    need: "privacidade, confiança e profundidade",
    strength: "respeito pelo silêncio e pelo tempo interno",
    risk: "distância prolongada, assuntos não retomados e suposições silenciosas",
    guidance: "permitir pausa, mas sempre combinar quando a conversa será retomada",
  },
  8: {
    need: "respeito, resultado e poder de decisão",
    strength: "admiração pela força e pela capacidade de construir",
    risk: "disputa de controle, orgulho e dificuldade de reconhecer vulnerabilidade",
    guidance: "tomar decisões em condições de igualdade e não transformar discordância em falta de respeito",
  },
  9: {
    need: "significado, empatia e ligação emocional",
    strength: "compreensão, generosidade e visão ampla",
    risk: "idealização, perdão sem mudança e dificuldade de encerrar ciclos",
    guidance: "separar compaixão de tolerar repetição e exigir atitudes que confirmem as palavras",
  },
};

export type PairReading = {
  meeting: string;
  risk: string;
  bridge: string;
};

export const PAIRS: Record<string, PairReading> = {
  "1-1": { meeting: "autonomia e iniciativa", risk: "competição e decisões unilaterais", bridge: "dividir liderança e perguntar antes de decidir pelo casal" },
  "1-2": { meeting: "iniciativa com capacidade de parceria", risk: "o 1 conduz tudo e o 2 guarda incômodo", bridge: "o 1 convida participação; o 2 responde claramente sem esperar adivinhação" },
  "1-3": { meeting: "movimento, coragem e comunicação", risk: "impulsividade, palavras duras e promessas sem continuidade", bridge: "conversa direta seguida de uma ação concreta" },
  "1-4": { meeting: "capacidade de iniciar e construir", risk: "pressa contra necessidade de segurança", bridge: "definir um próximo passo pequeno, com prazo realista e sem ultimato" },
  "1-5": { meeting: "independência, movimento e novidade", risk: "liberdade sem continuidade", bridge: "preservar espaço, mas assumir um compromisso mínimo verificável" },
  "1-6": { meeting: "iniciativa com desejo de construir vínculo", risk: "decisão unilateral contra cobrança afetiva", bridge: "dividir responsabilidade sem transformar cuidado em controle" },
  "1-7": { meeting: "coragem com profundidade", risk: "pressão por resposta contra recolhimento", bridge: "fazer uma pergunta clara e dar tempo, combinando quando retomar" },
  "1-8": { meeting: "ambição, força e capacidade de decisão", risk: "disputa de poder e orgulho", bridge: "conversar em igualdade, sem ameaça, teste ou tentativa de vencer" },
  "1-9": { meeting: "direção pessoal com sensibilidade ampla", risk: "franqueza que machuca e idealização que evita limites", bridge: "dizer a verdade com cuidado e transformar sentimento em decisão concreta" },
  "2-2": { meeting: "parceria e sensibilidade", risk: "passividade, dependência e conflito evitado", bridge: "nomear necessidades e concluir a conversa com uma escolha" },
  "2-3": { meeting: "afeto com comunicação", risk: "um quer aprofundar e o outro alivia tudo com leveza", bridge: "falar de forma acolhedora, mas sem mudar de assunto antes da resposta" },
  "2-4": { meeting: "parceria e estabilidade", risk: "acomodação e rigidez silenciosa", bridge: "criar segurança por atitudes constantes, não por suposições" },
  "2-5": { meeting: "proximidade e liberdade podem se complementar", risk: "perseguição e afastamento", bridge: "combinar frequência de contato e respeitar espaço sem desaparecer" },
  "2-6": { meeting: "cuidado, parceria e compromisso", risk: "dependência, culpa e cobrança", bridge: "pedir diretamente e dividir o cuidado entre os dois" },
  "2-7": { meeting: "sensibilidade e profundidade", risk: "busca por confirmação contra silêncio", bridge: "perguntar uma vez, dar tempo e observar se existe retorno espontâneo" },
  "2-8": { meeting: "parceria com força de construção", risk: "desequilíbrio de poder", bridge: "garantir que decisões e limites tenham o mesmo peso para os dois" },
  "2-9": { meeting: "empatia, vínculo e compreensão", risk: "sacrifício e expectativas não ditas", bridge: "transformar expectativa em pedido específico e aceitar a resposta recebida" },
  "3-3": { meeting: "conversa, humor e leveza", risk: "muita fala, drama e pouca resolução", bridge: "tratar um assunto por vez e terminar com um acordo observável" },
  "3-4": { meeting: "criatividade com capacidade de estrutura", risk: "crítica contra sensação de prisão", bridge: "propor estrutura flexível e revisar o que realmente funciona" },
  "3-5": { meeting: "atração, conversa e movimento", risk: "intensidade rápida e continuidade baixa", bridge: "verificar se a empolgação vira iniciativa consistente" },
  "3-6": { meeting: "expressão com cuidado", risk: "leveza contra cobrança de compromisso", bridge: "falar com afeto e definir o que presença significa para cada um" },
  "3-7": { meeting: "comunicação com profundidade", risk: "excesso de fala contra fechamento", bridge: "usar mensagem breve, uma pergunta e tempo real para resposta" },
  "3-8": { meeting: "expressão com capacidade de realização", risk: "crítica, pressão e defensividade", bridge: "conversar com fatos, sem ironia, e decidir o próximo passo" },
  "3-9": { meeting: "comunicação, empatia e inspiração", risk: "exagero emocional e idealização", bridge: "reconhecer o sentimento sem transformar possibilidade em certeza" },
  "4-4": { meeting: "estabilidade e compromisso", risk: "rigidez, teimosia e relação apenas funcional", bridge: "mudar uma rotina concreta e avaliar o efeito real" },
  "4-5": { meeting: "estrutura com renovação", risk: "controle contra fuga", bridge: "criar um acordo flexível com limites mínimos de presença" },
  "4-6": { meeting: "estabilidade, cuidado e construção", risk: "relação virar obrigação e cobrança", bridge: "repartir tarefas e reservar espaço para afeto que não seja responsabilidade" },
  "4-7": { meeting: "constância e profundidade", risk: "silêncio, lentidão e assuntos congelados", bridge: "agendar a retomada da conversa e não confundir pausa com solução" },
  "4-8": { meeting: "organização, ambição e construção material", risk: "controle e relação tratada como projeto", bridge: "definir objetivos comuns sem retirar afeto e autonomia" },
  "4-9": { meeting: "realidade com visão ampla", risk: "prioridades práticas contra expectativas emocionais", bridge: "traduzir sentimentos em atitudes concretas e possíveis" },
  "5-5": { meeting: "liberdade, novidade e compreensão do espaço", risk: "instabilidade e falta de compromisso", bridge: "definir o mínimo que os dois conseguem sustentar sem desaparecer" },
  "5-6": { meeting: "liberdade com desejo de pertencimento", risk: "afastamento contra cobrança", bridge: "permitir espaço com pontos de contato confiáveis e previamente combinados" },
  "5-7": { meeting: "independência, privacidade e respeito pelo espaço", risk: "distanciamento confortável demais", bridge: "criar iniciativa intencional para a relação não existir apenas quando convém" },
  "5-8": { meeting: "movimento, atração e força", risk: "liberdade contra controle", bridge: "negociar autonomia sem ultimato e sem testar poder" },
  "5-9": { meeting: "experiência, intensidade e significado", risk: "entusiasmo sem continuidade e expectativa idealizada", bridge: "alinhar o que cada um deseja construir antes de aumentar o investimento emocional" },
  "6-6": { meeting: "compromisso, cuidado e construção familiar", risk: "cobrança, culpa e sobrecarga", bridge: "dividir cuidado e parar de medir amor por sacrifício" },
  "6-7": { meeting: "cuidado com profundidade", risk: "proximidade contra necessidade de recolhimento", bridge: "respeitar a pausa, mas exigir retorno à conversa" },
  "6-8": { meeting: "compromisso com capacidade de construir", risk: "dever, controle e pouco espaço para vulnerabilidade", bridge: "falar de necessidades emocionais, não apenas de obrigações e resultados" },
  "6-9": { meeting: "cuidado, generosidade e propósito", risk: "sacrifício, salvamento e tolerância excessiva", bridge: "ajudar sem assumir a mudança que pertence ao outro" },
  "7-7": { meeting: "privacidade, confiança e profundidade", risk: "silêncio prolongado e interpretações sem confirmação", bridge: "combinar quando e como os assuntos difíceis serão retomados" },
  "7-8": { meeting: "reflexão com capacidade de realização", risk: "pressão por resposta contra fechamento", bridge: "apresentar fatos, fazer uma pergunta objetiva e permitir tempo limitado para resposta" },
  "7-9": { meeting: "profundidade, sensibilidade e sentido", risk: "intensidade silenciosa e idealização", bridge: "nomear sentimentos e limites sem esperar que o outro perceba sozinho" },
  "8-8": { meeting: "respeito, resultado e capacidade de decisão", risk: "disputa de poder, orgulho e controle", bridge: "decidir em igualdade e não transformar discordância em desrespeito" },
  "8-9": { meeting: "realização com propósito", risk: "pragmatismo contra expectativa emocional", bridge: "ligar o que sentem a uma decisão e responsabilidade concretas" },
  "9-9": { meeting: "empatia, significado e ligação emocional", risk: "idealização, perdão sem mudança e dificuldade de encerrar", bridge: "avaliar atitudes presentes e não sustentar a relação apenas pela história vivida" },
};

export function pairKey(left: number, right: number): string {
  const [low, high] = left <= right ? [left, right] : [right, left];
  return `${low}-${high}`;
}

export function pairOf(left: number, right: number): PairReading {
  const found = PAIRS[pairKey(left, right)];
  if (!found) throw new Error(`Combinação ausente: ${left}×${right}`);
  return found;
}

export function personalizeBridge(bridge: string, youNumber: number, youName: string, theirNumber: number, theirName: string): string {
  const nameOf = (number: number) => (number === youNumber ? youName : theirName);
  return bridge.replace(/\bo ([1-9])\b/g, (_match, digit: string) => nameOf(Number(digit)));
}

export function sharedMotivationText(number: number): { canonical: string; next: string } {
  const row = SAME[number];
  if (!row) throw new Error(`Número igual ausente: ${number}`);
  if (number === 8) {
    return {
      canonical: `Vocês têm a mesma necessidade afetiva: ${row.need}.`,
      next: "Os dois valorizam respeito, querem participar das decisões e precisam sentir que a relação está avançando. Isso pode criar admiração e parceria. O risco aparece quando os dois querem conduzir a situação ao mesmo tempo e uma discordância vira disputa por controle.",
    };
  }
  return {
    canonical: `Vocês têm a mesma necessidade afetiva: ${row.need}.`,
    next: `A força dessa semelhança é ${row.strength}. O risco do excesso é ${row.risk}. A saída prática é ${row.guidance}.`,
  };
}
