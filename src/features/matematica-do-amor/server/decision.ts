import type { StoryFlags } from "../domain/facts";
import type { Pronouns } from "../domain/pronouns";
import type { Answers } from "../domain/types";
import { SAME, pairOf, personalizeBridge } from "./pairs";

export type DecisionId =
  | "do_not_insist"
  | "one_clear_attempt"
  | "talk_now"
  | "observe_before_acting"
  | "continue_with_conditions"
  | "stop_carrying_alone";

export type Approach = { how: string; avoid: string; speech: string };

const APPROACH: Record<number, Approach> = {
  1: {
    how: "direta, respeitando autonomia",
    avoid: "ultimato e decidir por ela",
    speech: "Quero falar com clareza e também respeitar sua decisão. Você vê espaço para a gente conversar sobre uma nova tentativa?",
  },
  2: {
    how: "acolhedora e segura",
    avoid: "frieza, indireta e fazer adivinhar",
    speech: "Quero conversar sem te pressionar. Ainda existe vontade, da sua parte, de entender o que poderia ser diferente entre nós?",
  },
  3: {
    how: "leve, honesta e objetiva",
    avoid: "texto enorme, ironia e assunto sem conclusão",
    speech: "Quero falar de um jeito simples: ainda penso em nós. Você tem vontade real de conversar sobre isso?",
  },
  4: {
    how: "concreta e previsível",
    avoid: "promessa vaga e mudança sem plano",
    speech: "Eu não quero repetir o que aconteceu. Você estaria {willing} a conversar sobre mudanças concretas que os dois conseguiriam manter?",
  },
  5: {
    how: "sem pressão, preservando liberdade",
    avoid: "cobrança imediata e tentativa de prender",
    speech: "Não quero te cobrar uma decisão agora. Quero apenas saber se existe abertura para uma conversa sincera sobre nós.",
  },
  6: {
    how: "reconhecendo cuidado e compromisso",
    avoid: "culpa, chantagem afetiva e sacrifício como argumento",
    speech: "Eu ainda valorizo o que tivemos. Para você, existe disposição de reconstruir isso com mudanças dos dois lados?",
  },
  7: {
    how: "breve, profunda e com tempo para resposta",
    avoid: "interrogatório e várias mensagens",
    speech: "Quero te fazer uma pergunta com calma. Você vê espaço para conversarmos sobre o que aconteceu? Não precisa responder agora, mas preciso de uma resposta clara.",
  },
  8: {
    how: "objetiva, respeitosa e em igualdade",
    avoid: "disputa, ameaça e tentativa de vencer",
    speech: "Vou falar de forma direta e respeitar sua resposta: você vê uma possibilidade real de reconstrução ou prefere encerrar essa possibilidade?",
  },
  9: {
    how: "emocionalmente honesta, mas com limite",
    avoid: "idealização, culpa e apelo ao passado",
    speech: "O que vivemos ainda importa para mim, mas não quero viver apenas dessa história. Você vê vontade e condição de construir algo diferente agora?",
  },
};

const CLIENT_RISK: Record<number, { risk: string; correction: string }> = {
  1: { risk: "decidir pelos dois ou transformar conversa em ultimato", correction: "perguntar e esperar a resposta sem completar pelo outro" },
  2: { risk: "implorar confirmação ou aceitar ambiguidade para não perder vínculo", correction: "fazer uma pergunta clara e considerar evasão como ausência de decisão" },
  3: { risk: "falar demais, usar humor para fugir ou prometer sem sustentar", correction: "mensagem curta e uma atitude concreta" },
  4: { risk: "tentar controlar o resultado com regras rígidas", correction: "propor um acordo possível e observar adesão voluntária" },
  5: { risk: "desaparecer para testar ou voltar apenas pela intensidade", correction: "manter coerência entre o que pede e o que oferece" },
  6: { risk: "cuidar, cobrar e assumir a mudança dos dois", correction: "pedir participação e parar de compensar a falta do outro" },
  7: { risk: "fechar-se e esperar que o outro perceba", correction: "nomear o que sente e pedir resposta sem prolongar silêncio" },
  8: { risk: "transformar conversa em disputa de poder", correction: "falar em igualdade e aceitar uma resposta que não controla" },
  9: { risk: "idealizar, salvar ou perdoar sem mudança", correction: "avaliar atitudes atuais e definir um limite objetivo" },
};

function willing(pronouns: Pronouns): string {
  if (pronouns.id === "ela") return "disposta";
  if (pronouns.id === "ele") return "disposto";
  return "em condições";
}

export function approachFor(partnerNumber: number, pronouns: Pronouns): Approach {
  const row = APPROACH[partnerNumber] ?? APPROACH[2];
  return { ...row, speech: row.speech.replace("{willing}", willing(pronouns)) };
}

function mixedSignals(answers: Answers): boolean {
  return (
    answers["t.contato"] === "estranho" ||
    answers["t.estranho"] === "esfria" ||
    answers["i.duvida"] === "esfria" ||
    answers["i.relacao"] === "as_vezes" ||
    answers["n.contato"] === "as_vezes"
  );
}

function agreementBroken(answers: Answers): boolean {
  return answers["r.acordo_tarefas"] === "so_eu" || answers["r.acordo_confianca"] === "promessa" || answers["r.acordo_geral"] === "so_eu" || answers["r.fala"] === "sem_mudanca";
}

/** Os fatos decidem. A combinação numerológica não escolhe insistir nem terminar. */
export function decide(flags: StoryFlags, answers: Answers): DecisionId {
  if (flags.explicitLimit || flags.logisticalContact || (flags.alreadyAskedToReturn && !flags.mutualInitiative)) return "do_not_insist";
  if (flags.unrequited && answers["n.viu"] === "disse") return "do_not_insist";
  if (flags.together) {
    const both = flags.mutualInitiative && !flags.onlyClient && !flags.alreadyGaveSpace;
    if (!both || flags.onlyClient || flags.alreadyGaveSpace || agreementBroken(answers)) return "stop_carrying_alone";
    return "continue_with_conditions";
  }
  if (mixedSignals(answers)) return "observe_before_acting";
  if (flags.mutualInitiative && !flags.noContact) return "talk_now";
  if (!flags.alreadyAskedToReturn && (flags.noContact || answers["t.tentou"] === "nada" || answers["i.relacao"] === "nunca")) return "one_clear_attempt";
  if (flags.onlyClient) return "observe_before_acting";
  return "observe_before_acting";
}

export function clientRiskConfirmed(number: number | null, flags: StoryFlags, answers: Answers): boolean {
  if (!number) return false;
  if (number === 1) return flags.alreadyAskedToReturn && answers["t.quem"] === "eu";
  if (number === 2) return flags.alreadyAskedToReturn;
  if (number === 3) return answers["r.fala"] === "briga" || answers["t.estranho"] === "discussao";
  if (number === 4) return answers["r.acordo_tarefas"] === "so_eu" || answers["r.acordo_geral"] === "so_eu";
  if (number === 5) return answers["r.distancia"] === "afasto";
  if (number === 6) return flags.onlyClient && (answers["r.distancia"] === "procura" || Boolean(answers["r.peso"]));
  if (number === 7) return flags.alreadyGaveSpace || answers["r.distancia"] === "espera";
  if (number === 8) return answers["r.fala"] === "briga";
  if (number === 9) return flags.unrequited && (answers["n.desejo"] === "tentar" || answers["n.desejo"] === "insistindo");
  return false;
}

function problemAction(flags: StoryFlags, answers: Answers, other: string, decision: DecisionId): { action: string; avoid: string } {
  if (decision === "do_not_insist") {
    if (flags.logisticalContact) {
      return {
        action: `O contato com ${other} é por um motivo prático. Resolva só esse assunto e não fale de volta nesse recado.`,
        avoid: "Não use o recado para perguntar da relação.",
      };
    }
    return {
      action: `Não procurar ${other} de novo e não medir o seu valor pela mudança dessa resposta.`,
      avoid: "Não criar estratégia de reconquista nem mandar uma mensagem final para reabrir a decisão.",
    };
  }
  if (flags.together && answers["r.fala"] === "briga") {
    return {
      action: `Tratar um conflito por conversa com ${other}. Se a conversa escalar, pausar com horário marcado para retomar.`,
      avoid: "Proibir insulto, ameaça de término e a retomada de discussões antigas na mesma conversa.",
    };
  }
  if (flags.together && answers["r.falta"] === "tarefas") {
    return {
      action: `Definir quem assume cada responsabilidade concreta nesta semana e não fazer a parte de ${other} para evitar conflito.`,
      avoid: "Não aceitar só a concordância da conversa. A divisão aparece na execução sem cobrança constante.",
    };
  }
  if (flags.together && answers["r.falta"] === "confianca") {
    const fear = answers["r.atras"] === "receio";
    return {
      action: fear
        ? `O que você marcou é um receio, sem um fato de traição. Peça a ${other} uma atitude observável, sem vigilância permanente.`
        : `Nomear o combinado que quebrou a confiança e pedir a ${other} uma atitude reparadora correspondente a esse fato.`,
      avoid: "Não substituir a reconstrução por vigilância permanente.",
    };
  }
  if (flags.together && (answers["r.falta"] === "carinho" || answers["r.falta"] === "tempo")) {
    return {
      action: `Pedir a ${other} um comportamento específico: uma iniciativa de contato ou um tempo juntos, e ver se acontece sem lembrete.`,
      avoid: "Não transformar carinho em teste secreto nem pedir apenas a palavra carinho.",
    };
  }
  if (flags.uncertain && flags.mutualInitiative && !flags.onlyClient) {
    return {
      action: "Fazer um convite simples e concreto, com dia e uma atividade, e parar depois dele.",
      avoid: "Não confundir conversa com interesse em construir uma relação.",
    };
  }
  if (flags.uncertain && (flags.onlyClient || flags.noContact)) {
    return {
      action: "Interromper a condução dos contatos e observar se existe reciprocidade espontânea.",
      avoid: "Não continuar interpretando sinais no lugar de uma resposta clara.",
    };
  }
  if (flags.ended && flags.noContact && decision === "one_clear_attempt") {
    return {
      action: "Enviar uma tentativa clara, uma vez, e não mandar complemento, justificativa nem segunda pergunta.",
      avoid: "Silêncio, resposta educada sem continuidade ou mudança de assunto encerram a tentativa.",
    };
  }
  if (flags.ended && mixedSignals(answers)) {
    return {
      action: `Não falar em voltar na primeira reaproximação. Observar se ${other} inicia de novo e mantém o contato.`,
      avoid: "Não tratar saudade, curtida ou mensagem noturna como decisão de volta.",
    };
  }
  if (decision === "talk_now") {
    return {
      action: `Conversar com ${other} sobre o motivo real, cada pessoa nomeando uma mudança própria. Saudade sozinha não sustenta a volta.`,
      avoid: "Não aceitar uma volta sustentada apenas por saudade.",
    };
  }
  if (decision === "stop_carrying_alone") {
    return {
      action: `Parar de compensar a falta de participação de ${other} e decidir pelo que essa pessoa faz, não pelo que promete.`,
      avoid: "Não procurar a frase certa para sustentar uma mudança que depende dos dois.",
    };
  }
  if (decision === "continue_with_conditions") {
    return {
      action: `Continuar só se a mudança aparecer dos dois lados, no comportamento, e não apenas numa conversa.`,
      avoid: "Não investir mais do mesmo jeito se só um lado mudar.",
    };
  }
  return {
    action: `Fazer uma pergunta clara a ${other} e tratar a resposta, ou a falta dela, como a decisão.`,
    avoid: "Não completar o silêncio com uma segunda versão da mesma pergunta.",
  };
}

export type DecisionScript = {
  id: DecisionId;
  verdictLine: string;
  why: string;
  consequence: string;
  action: string;
  avoid: string;
  speech: string | null;
  afterSpeech: string | null;
  opening: string;
  ambiguous: string;
  closing: string;
  stop: string;
  whyStop: string | null;
  clientNote: string | null;
  card: { doNow: string; avoid: string; watch: string; rule: string };
};

function verdictLine(id: DecisionId, flags: StoryFlags, youNumber: number | null, theirNumber: number | null, other: string): string {
  const pair = youNumber && theirNumber ? [youNumber, theirNumber].sort((a, b) => a - b).join("-") : "";
  if (id === "do_not_insist") return "não insista nessa volta neste momento.";
  if (id === "one_clear_attempt" && pair === "4-5") return "faça um convite claro em vez de continuar interpretando sinais.";
  if (id === "talk_now" && pair === "2-5") return "vale conversar, mas não pedir uma volta imediata.";
  if (id === "talk_now" && pair === "3-3" && flags.ended) return "não fale em voltar apenas porque a conversa ficou boa novamente.";
  if (id === "observe_before_acting" && pair === "3-3") return "não fale em voltar apenas porque a conversa ficou boa novamente.";
  if (id === "continue_with_conditions" && pair === "6-7") return `ainda vale investir, desde que ${other} também participe.`;
  if (id === "one_clear_attempt") return "vale fazer uma tentativa clara, mas apenas uma.";
  if (id === "talk_now") return "vale conversar agora.";
  if (id === "observe_before_acting") return "observe antes de falar em voltar.";
  if (id === "continue_with_conditions") return "continue, mas não do mesmo jeito.";
  return `pare de compensar a falta de participação de ${other}.`;
}

export function buildDecisionScript(input: {
  flags: StoryFlags;
  answers: Answers;
  you: string;
  other: string;
  pronouns: Pronouns;
  youMotivation: number | null;
  theirMotivation: number | null;
  problem: string;
}): DecisionScript {
  const { flags, answers, you, other, pronouns, youMotivation, theirMotivation, problem } = input;
  const id = decide(flags, answers);
  const allowed = id === "one_clear_attempt" || id === "talk_now" || id === "continue_with_conditions";
  const approach = theirMotivation ? approachFor(theirMotivation, pronouns) : null;
  const problemStep = problemAction(flags, answers, other, id);
  const pair = youMotivation && theirMotivation ? pairOf(youMotivation, theirMotivation) : null;
  const bridge = pair && youMotivation && theirMotivation ? personalizeBridge(pair.bridge, youMotivation, you, theirMotivation, other) : "";
  const client = clientRiskConfirmed(youMotivation, flags, answers) && youMotivation ? CLIENT_RISK[youMotivation] : null;
  const action = allowed && approach ? `${problemStep.action} A forma de abordar ${other} é ${approach.how}.` : problemStep.action;
  const whyStop =
    id === "do_not_insist"
      ? `${other} já colocou o limite deste caso: ${problem}. Insistir repetiria o ciclo e não traria uma informação nova. Parar devolve a você a decisão e o espaço para uma reciprocidade real.`
      : id === "stop_carrying_alone"
        ? `A participação de ${other} não está acontecendo: ${problem}. Continuar compensando não traz uma informação nova.`
        : null;
  return {
    id,
    verdictLine: verdictLine(id, flags, youMotivation, theirMotivation, other),
    why: `${you} e ${other}: ${problem}. ${flags.explicitLimit ? `Existe um limite claro de ${other}.` : "Esse fato pesa mais do que a combinação dos números."}`,
    consequence: pair
      ? `A consequência prática é esta: ${bridge}. Os números explicam o desencontro. Não decidem se ${other} vai participar.`
      : `A consequência prática depende do que ${other} fizer depois, não de uma segunda explicação da conta.`,
    action,
    avoid: allowed && approach ? `${problemStep.avoid} Nesta mensagem, evite ${approach.avoid.replace(/\bela\b/g, pronouns.subject)}.` : problemStep.avoid,
    speech: allowed && approach ? approach.speech : null,
    afterSpeech: allowed ? "Depois de enviar, não mande complemento nem uma segunda pergunta. A resposta precisa aparecer também em atitude." : null,
    opening: `Abertura, aqui, é iniciativa de ${other}, continuidade, uma pergunta de volta e uma atitude concreta.`,
    ambiguous: "Ambiguidade é carinho sem decisão, saudade sem mudança, resposta educada ou contato ocasional.",
    closing: `Fechamento é recusa, pedido de distância, silêncio depois de uma pergunta clara ou a repetição do mesmo limite de ${other}.`,
    stop:
      id === "do_not_insist"
        ? `Se ${other} já limitou o contato, não envie outra mensagem tentando explicar melhor.`
        : `Se ${other} não responder à pergunta, mudar de assunto ou disser que não quer conversar sobre vocês, não envie outra mensagem. Você já terá a resposta para parar de sustentar essa possibilidade sem a outra pessoa.`,
    whyStop,
    clientNote: client ? `O risco deste caso é ${client.risk}. A correção é ${client.correction}.` : null,
    card: {
      doNow: id === "do_not_insist" ? "Não enviar nova mensagem." : allowed ? "Uma mensagem, uma vez." : "Parar de conduzir o contato.",
      avoid: allowed && approach ? approach.avoid : "Uma segunda tentativa igual.",
      watch: `Se ${other} inicia e sustenta.`,
      rule: id === "do_not_insist" ? "Limite recebido encerra a tentativa." : "Sem atitude da outra pessoa, pare.",
    },
  };
}

export function sameNeedLabel(number: number): string {
  return SAME[number]?.need ?? "";
}
