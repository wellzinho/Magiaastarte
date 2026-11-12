import type { Answers } from "./types";
import type { Pronouns } from "./pronouns";
import { PRICE_LABEL } from "./payment";

export type Delivery = { id: string; label: string };
export type Desire = "reconcile" | "opening" | "move_on" | "repair" | "unknown";

export function branchOf(answers: Answers): "T" | "I" | "N" | "R" | null {
  if (answers.scenario === "I" && answers["i.limite"] === "sim") return "N";
  if (answers.scenario === "N" && answers["n.viu"] === "incerto") return "I";
  if (answers.scenario === "T" || answers.scenario === "I" || answers.scenario === "N" || answers.scenario === "R") {
    return answers.scenario;
  }
  return null;
}

export function explicitLimit(answers: Answers): boolean {
  return answers["t.pararam"] === "pediu" || answers["t.limite"] === "sim" || answers["n.viu"] === "disse" || answers["i.limite"] === "sim";
}

export function hasContactAfterBreakup(answers: Answers): boolean {
  return answers["t.contato"] === "voltamos" || answers["t.contato"] === "estranho";
}

export function neverTalked(answers: Answers): boolean {
  return answers["i.relacao"] === "nunca";
}

export function desiredOutcome(answers: Answers): Desire {
  const id = answers["t.desejo"] ?? answers["i.desejo"] ?? answers["n.desejo"] ?? answers["r.desejo"];
  if (id === "voltar" || id === "de_novo" || id === "tentar") return "reconcile";
  if (id === "abertura" || id === "interesse" || id === "aproximar" || id === "falar" || id === "comecar") return "opening";
  if (id === "seguir" || id === "expectativa" || id === "esperar" || id === "conviver" || id === "afastar" || id === "insistindo" || id === "continuar") {
    return "move_on";
  }
  if (answers["r.desejo"]) return "repair";
  return "unknown";
}

export type StoryFlags = {
  ended: boolean;
  together: boolean;
  uncertain: boolean;
  unrequited: boolean;
  explicitLimit: boolean;
  alreadyAskedToReturn: boolean;
  mutualInitiative: boolean;
  onlyClient: boolean;
  alreadyGaveSpace: boolean;
  alreadyTriedTalking: boolean;
  noContact: boolean;
  logisticalContact: boolean;
  uncertainRejection: boolean;
  spaceRequested: boolean;
  desire: Desire;
};

export function storyFlags(answers: Answers): StoryFlags {
  const branch = branchOf(answers);
  const mutualInitiative =
    answers["t.quem"] === "dois" ||
    answers["t.quem"] === "ele" ||
    answers["i.quem"] === "dois" ||
    answers["i.quem"] === "outra" ||
    answers["r.efeito"] === "tambem_procura" ||
    answers["r.acordo_geral"] === "ambos" ||
    answers["r.acordo_tarefas"] === "ambos" ||
    answers["r.acordo_confianca"] === "atitudes";
  const onlyClient =
    !mutualInitiative &&
    (answers["t.quem"] === "eu" ||
      answers["i.quem"] === "eu" ||
      answers["r.distancia"] === "procura" ||
      answers["r.efeito"] === "preciso_retomar" ||
      answers["r.acordo_geral"] === "so_eu" ||
      answers["r.acordo_tarefas"] === "so_eu" ||
      answers["r.acordo_confianca"] === "promessa");
  return {
    ended: branch === "T",
    together: branch === "R",
    uncertain: branch === "I",
    unrequited: branch === "N",
    explicitLimit: explicitLimit(answers),
    alreadyAskedToReturn: answers["t.tentou"] === "voltar",
    mutualInitiative,
    onlyClient,
    alreadyGaveSpace: answers["r.distancia"] === "espera" || answers["r.tentou"] === "espaco",
    alreadyTriedTalking: answers["r.tentou"] === "conversar" || answers["r.fala"] === "sem_mudanca" || answers["t.tentou"] === "aconteceu" || answers["t.tentou"] === "voltar",
    noContact: answers["t.contato"] === "nenhum" || answers["n.contato"] === "nenhum" || answers["i.relacao"] === "nunca",
    logisticalContact: answers["t.quem"] === "motivo",
    uncertainRejection: answers["n.viu"] === "incerto" || answers["n.viu"] === "silencio" || answers["n.viu"] === "agia" || (branch === "I" && answers["i.limite"] !== "sim"),
    spaceRequested: answers["r.pedido"] === "sim" || answers["r.pedido"] === "parecido",
    desire: desiredOutcome(answers),
  };
}

export function relationWord(answers: Answers): string {
  if (answers["r.status"] === "casados") return "casamento";
  if (answers["r.status"] === "namoro") return "namoro";
  return "relação";
}

export function goalPhrase(answers: Answers): string {
  const id = answers["t.desejo"] ?? answers["r.desejo"] ?? answers["i.desejo"] ?? answers["n.desejo"];
  const map: Record<string, string> = {
    voltar: "tentar voltar",
    de_novo: "tentar de novo, de outro jeito",
    abertura: "saber se ainda existe abertura",
    seguir: "entender se é melhor seguir em frente",
    interesse: "que ele volte a demonstrar interesse",
    proximidade: "mais tempo e proximidade",
    continuar: "saber se ainda vale continuar",
    sem_brigar: "conseguir conversar sem brigar",
    mudar: "que alguma coisa mude de verdade",
    querer: "entender se os dois ainda querem essa relação",
    assumir: "que ele assuma a parte dele",
    acordo: "um acordo que funcione",
    sozinho: "entender se você está carregando tudo",
    reconstruir: "saber se dá para reconstruir a confiança",
    atitudes: "ver atitudes, não só promessas",
    afastar: "entender se é melhor se afastar",
    comecar: "saber como começar uma conversa",
    aproximar: "se aproximar sem parecer insistente",
    falar: "falar o que sente",
    expectativa: "saber se é melhor não criar expectativa",
    esperar: "parar de esperar que ele mude de ideia",
    conviver: "conviver sem procurar sinais",
    insistindo: "entender se ainda está insistindo numa resposta que já recebeu",
    tentar: "tentar, mesmo depois da resposta",
  };
  return map[id ?? ""] ?? "uma resposta direta sobre essa história";
}

export function confirmedFact(answers: Answers, pronouns: Pronouns): string {
  if (explicitLimit(answers) && answers["t.pararam"] === "pediu") return `${pronouns.subject} pediu para você não procurar`;
  if (answers["n.viu"] === "disse" || answers["i.limite"] === "sim") return `${pronouns.subject} já disse que não quer`;
  if (answers["t.contato"] === "nenhum") return "vocês não se falam";
  if (answers["t.estranho"] === "evita") return "vocês conversam, mas evitam falar do que aconteceu";
  if (answers["t.falaram"] === "sim") return "vocês já falaram com clareza sobre o que levou ao término";
  if (answers["t.falaram"] === "ainda_nao") return "o motivo do término ainda não entrou na conversa";
  if (answers["t.quem"] === "motivo") return "o contato de vocês acontece por um motivo específico, não como uma aproximação";
  if (answers["t.contato"] === "voltamos") return "vocês voltaram a conversar";
  if (answers["i.relacao"] === "nunca") return "vocês ainda não conversaram";
  if (answers["i.quem"] === "eu" || answers["t.quem"] === "eu") return "quase sempre você procura primeiro";
  if (answers["i.quem"] === "dois" || answers["t.quem"] === "dois") return "os dois procuram";
  if (answers["r.falta"] === "tarefas") return "a divisão das responsabilidades pesa na rotina";
  if (answers["r.falta"] === "confianca") return "a confiança ficou em aberto";
  if (answers["r.pedido"] === "sim" || answers["r.pedido"] === "parecido") return `${pronouns.subject} já falou em espaço`;
  if (answers["r.efeito"] === "preciso_retomar") return "quando você recua, quase sempre precisa retomar";
  if (answers["r.falta"] === "tempo") return "falta tempo de vocês juntos";
  if (answers["r.falta"] === "carinho") return "falta carinho no dia a dia";
  if (answers["r.falta"] === "conversa") return "conversar sobre a relação está difícil";
  return "o que você marcou nessa história";
}

export function factualMirror(answers: Answers, pronouns: Pronouns): string {
  if (answers["t.tentou"] === "voltar" && answers["t.quem"] === "eu") {
    return "Você já perguntou sobre voltar e, hoje, a procura ainda sai de você. A leitura não vai mandar repetir a mesma pergunta.";
  }
  if (answers["t.pararam"] === "pediu") {
    return `${pronouns.subjectCap} pediu distância. A leitura vai ficar no que você pode fazer por você, sem um jeito de contornar esse limite.`;
  }
  if (answers["r.distancia"] === "procura" && (answers["r.pedido"] === "sim" || answers["r.pedido"] === "parecido")) {
    return "Você busca mais contato, e a outra pessoa já falou em espaço. As duas necessidades entram na resposta.";
  }
  if (answers["r.distancia"] === "espera" && answers["r.efeito"] === "preciso_retomar") {
    return "Você já tem dado espaço e, mesmo assim, a retomada continua com você. O próximo passo não é repetir esse recuo.";
  }
  if (answers["n.desejo"] === "tentar") {
    return `Entendi que você ainda quer tentar. Como ${pronouns.subject} já disse que não quer, a leitura vai considerar o que você sente sem transformar isso numa estratégia para mudar a resposta.`;
  }
  return `O ponto que mais pesa agora: ${confirmedFact(answers, pronouns)}. Você quer ${goalPhrase(answers)}.`;
}

export function deliveriesOf(): Delivery[] {
  return [{ id: "resposta", label: "A resposta direta" }];
}

export function preselectId(): string | null {
  return deliveriesOf()[0]?.id ?? null;
}

export function ctaOf(answers: Answers): string {
  const desire = desiredOutcome(answers);
  if (branchOf(answers) === "R") return `Quero saber o que fazer nessa relação · ${PRICE_LABEL}`;
  if (desire === "reconcile") return `Quero saber se ainda vale tentar · ${PRICE_LABEL}`;
  if (desire === "opening") return `Quero entender se existe abertura · ${PRICE_LABEL}`;
  if (desire === "move_on") return `Quero minha orientação para seguir · ${PRICE_LABEL}`;
  if (explicitLimit(answers)) return `Quero a resposta direta · ${PRICE_LABEL}`;
  return `Quero a resposta direta · ${PRICE_LABEL}`;
}

function otherPerson(answers: Answers): { subject: string; possessive: string } {
  if (answers.gender === "homem") return { subject: "ele", possessive: "dele" };
  if (answers.gender === "mulher") return { subject: "ela", possessive: "dela" };
  return { subject: "essa pessoa", possessive: "dessa pessoa" };
}

export function offerLines(answers: Answers): string[] {
  const desire = desiredOutcome(answers);
  const branch = branchOf(answers);
  const person = otherPerson(answers);
  const subject = person.subject;
  const possessive = person.possessive;
  const reaction = subject === "ele" ? "dele" : subject === "ela" ? "dela" : "dessa pessoa";
  const bond = branch === "R" ? "dessa relação" : "dessa história";
  const price = `Sua orientação completa custa ${PRICE_LABEL}, em pagamento único. Depois da confirmação do pagamento, ela continua aqui no chat. Vou te mostrar, de acordo com os números de vocês, como agir, o que esperar ${bond} e como interpretar a reação ${reaction}.`;
  const lines =
    branch === "R"
      ? [
          `Na orientação completa, eu vou te falar qual comportamento está desgastando a relação, o que você pode mudar e o que só melhora se houver participação ${possessive}.`,
          "Você vai saber como abordar o assunto.",
          "Você vai ver o que observar depois da conversa e qual atitude mostra mudança de verdade, não apenas mais uma promessa.",
          "O risco que isso evita é sair da conversa só com mais uma promessa.",
        ]
      : desire === "reconcile"
        ? [
            "Na sua orientação completa, eu vou te falar com clareza se ainda faz sentido tentar essa volta ou se você corre o risco de insistir sem a outra pessoa.",
            `Você vai entender como agir agora, o que pode estar afastando ${subject}, o que não fazer para não piorar a situação e quais atitudes mostram uma abertura de verdade.`,
            "Também vou mostrar o que precisaria mudar entre vocês para uma volta não terminar do mesmo jeito.",
            "Se existir espaço para tentar, eu vou te mostrar como. Se não existir, eu também vou te falar com clareza, sem enrolar e sem criar falsa esperança.",
          ]
        : desire === "opening"
          ? [
              `Na orientação completa, eu vou separar os sinais que realmente mostram participação ${possessive} daqueles que parecem esperança, mas podem ser apenas educação, saudade ou curiosidade.`,
              "Você vai saber o que observar nos próximos contatos e quando uma conversa sobre vocês faria sentido.",
              "Você também vai ver em que momento continuar esperando começa a te prender.",
              "O risco que isso evita é tratar educação ou saudade como se fosse uma volta.",
            ]
          : [
              `Na orientação completa, eu vou mostrar por que essa história ainda prende sua atenção, quais hábitos continuam alimentando a espera e como parar de procurar uma resposta nas atitudes ${possessive}.`,
              "Você também vai receber um próximo passo concreto para se afastar sem voltar ao mesmo ciclo quando bater saudade.",
              "Você vai saber o que observar em você quando a vontade de procurar voltar.",
              "O risco que isso evita é transformar um sinal solto em mais uma espera.",
            ];
  return [...lines, price];
}
