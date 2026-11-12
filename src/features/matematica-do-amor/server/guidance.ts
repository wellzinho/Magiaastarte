import type { StoryFlags } from "../domain/facts";
import { branchOf } from "../domain/facts";
import type { Pronouns } from "../domain/pronouns";
import type { Answers } from "../domain/types";

/**
 * Os ids gravados no quiz continuam os do produto.
 * Eles cobrem as perguntas da auditoria com estes nomes:
 * recover_closeness = restore_closeness
 * share_tasks = share_responsibilities
 * evaluate_staying = decide_whether_to_continue
 * see_reciprocity = understand_reciprocity
 * say_what_you_feel = express_feelings
 * avoid_one_sided_expectation = avoid_false_expectation
 * stop_looking_for_signs = stop_scanning_for_signs
 * leave_the_cycle = distance_without_returning
 * move_on_from_refusal = move_forward
 */
export type GuidanceGoal =
  | "talk_about_return"
  | "observe_real_opening"
  | "changes_before_return"
  | "should_i_keep_trying"
  | "how_to_move_forward"
  | "talk_without_fighting"
  | "recover_closeness"
  | "share_tasks"
  | "rebuild_trust"
  | "evaluate_staying"
  | "see_reciprocity"
  | "approach_without_pressure"
  | "say_what_you_feel"
  | "avoid_one_sided_expectation"
  | "accept_the_answer"
  | "stop_looking_for_signs"
  | "leave_the_cycle"
  | "move_on_from_refusal";

export type TryingVerdict = "try_now" | "observe_before_acting" | "do_not_insist_now" | "moving_forward_is_healthier";

export type DecisionCard = { doNow: string; avoid: string; watch: string; rule: string };

export type GuidancePack = {
  goal: GuidanceGoal;
  catalog: string;
  directAnswer: string;
  reason: string;
  consequence: string;
  whatToDo: string;
  whatNotToDo: string;
  falseSignals: string | null;
  message: string | null;
  ifThen: [string, string];
  card: DecisionCard;
  practicalTopics: string[];
  tryingVerdict: TryingVerdict | null;
};

export type GuidanceContext = {
  you: string;
  other: string;
  pronouns: Pronouns;
  flags: StoryFlags;
  answers: Answers;
  problem: string;
};

const BREAKUP: GuidanceGoal[] = [
  "talk_about_return",
  "observe_real_opening",
  "changes_before_return",
  "should_i_keep_trying",
  "how_to_move_forward",
];
const RELATIONSHIP: GuidanceGoal[] = ["talk_without_fighting", "recover_closeness", "share_tasks", "rebuild_trust", "evaluate_staying"];
const UNCERTAIN: GuidanceGoal[] = ["see_reciprocity", "approach_without_pressure", "say_what_you_feel", "avoid_one_sided_expectation"];
const UNREQUITED: GuidanceGoal[] = ["accept_the_answer", "stop_looking_for_signs", "leave_the_cycle", "move_on_from_refusal"];

function allowed(answers: Answers): GuidanceGoal[] {
  const branch = branchOf(answers);
  if (branch === "T") return BREAKUP;
  if (branch === "R") return RELATIONSHIP;
  if (branch === "I") return UNCERTAIN;
  return UNREQUITED;
}

function fallback(answers: Answers): GuidanceGoal {
  const branch = branchOf(answers);
  if (branch === "R") {
    if (answers["r.falta"] === "tarefas" || answers["r.desejo"] === "assumir" || answers["r.desejo"] === "acordo" || answers["r.desejo"] === "sozinho") return "share_tasks";
    if (answers["r.falta"] === "confianca" || answers["r.desejo"] === "reconstruir" || answers["r.desejo"] === "atitudes") return "rebuild_trust";
    if (answers["r.falta"] === "conversa" || answers["r.desejo"] === "sem_brigar" || answers["r.desejo"] === "mudar" || answers["r.desejo"] === "querer") return "talk_without_fighting";
    if (answers["r.desejo"] === "continuar" || answers["r.desejo"] === "afastar") return "evaluate_staying";
    return "recover_closeness";
  }
  if (branch === "I") {
    if (answers["i.desejo"] === "aproximar") return "approach_without_pressure";
    if (answers["i.desejo"] === "falar" || answers["i.desejo"] === "comecar") return "say_what_you_feel";
    if (answers["i.desejo"] === "expectativa") return "avoid_one_sided_expectation";
    return "see_reciprocity";
  }
  if (branch === "N") {
    if (answers["n.desejo"] === "conviver") return "stop_looking_for_signs";
    if (answers["n.desejo"] === "afastar") return "leave_the_cycle";
    if (answers["n.desejo"] === "tentar" || answers["n.desejo"] === "insistindo") return "move_on_from_refusal";
    return "accept_the_answer";
  }
  if (answers["t.desejo"] === "abertura") return "observe_real_opening";
  if (answers["t.desejo"] === "seguir") return "how_to_move_forward";
  if (answers["t.desejo"] === "voltar" || answers["t.desejo"] === "de_novo") return "should_i_keep_trying";
  return "should_i_keep_trying";
}

export function goalFromAnswers(answers: Answers): GuidanceGoal {
  const chosen = answers["g.meta"] as GuidanceGoal | undefined;
  const options = allowed(answers);
  if (chosen && options.includes(chosen)) return chosen;
  if (chosen && process.env.NODE_ENV !== "production") {
    console.error("Missing paid guidance branch", chosen, branchOf(answers));
  }
  return fallback(answers);
}

function openWord(pronouns: Pronouns): string {
  if (pronouns.id === "ela") return "aberta";
  if (pronouns.id === "ele") return "aberto";
  return "a fim";
}

export function tryingVerdictOf(flags: StoryFlags): TryingVerdict {
  if (flags.explicitLimit) return "do_not_insist_now";
  if (flags.desire === "move_on") return "moving_forward_is_healthier";
  if (flags.mutualInitiative && !flags.noContact && !flags.onlyClient) return "try_now";
  if (flags.alreadyAskedToReturn && !flags.mutualInitiative) return "do_not_insist_now";
  if (flags.onlyClient && !flags.noContact) return "do_not_insist_now";
  return "observe_before_acting";
}

function tryingPhrase(verdict: TryingVerdict, other: string): string {
  if (verdict === "try_now") return `Vale tentar agora: uma conversa com ${other}, não uma campanha.`;
  if (verdict === "observe_before_acting") return `O veredito é observar antes de agir. Ainda não existe iniciativa de ${other} para tratar a volta como decisão dos dois.`;
  if (verdict === "moving_forward_is_healthier") return "O veredito é que seguir em frente é o caminho mais saudável. Continuar tentando só alonga a espera.";
  return "O veredito é não insistir agora.";
}

function pack(goal: GuidanceGoal, catalog: string, fields: Omit<GuidancePack, "goal" | "catalog" | "tryingVerdict"> & { tryingVerdict?: TryingVerdict | null }): GuidancePack {
  return { goal, catalog, tryingVerdict: fields.tryingVerdict ?? null, ...fields };
}

function talkAboutReturn(ctx: GuidanceContext): GuidancePack {
  const { you, other, pronouns, flags, answers } = ctx;
  const open = openWord(pronouns);
  const scanning = answers["t.tentou"] === "redes" || answers["n.volta"] === "redes";
  if (flags.explicitLimit) {
    return pack("talk_about_return", "paidGuidanceByGoal.talk_about_return", {
      directAnswer: `Não insistir agora. Existe um limite claro de ${other}, então não se fala sobre voltar.`,
      reason: answers["n.viu"] === "disse" || answers["i.limite"] === "sim"
        ? `${you} e ${other} não estão numa conversa aberta. ${other} já disse que não quer. Uma mensagem sobre volta atravessa esse limite.`
        : `${you} e ${other} não estão numa conversa aberta. ${other} pediu para você não procurar. Uma mensagem sobre volta atravessa esse limite.`,
      consequence: "Se a mensagem sair hoje, ela confirma que o limite não foi ouvido. Isso afasta, não reabre.",
      whatToDo: "Não mandar mensagem sobre volta. Guardar o que você queria dizer e não enviar.",
      whatNotToDo: scanning
        ? "Não olhar as redes para decidir se o limite mudou. Uma publicação não é uma resposta nova."
        : "Não reescrever o pedido com palavras mais leves. O assunto continua sendo a volta.",
      falseSignals: null,
      message: null,
      ifThen: [
        `Se ${other} procurar por conta própria e falar da relação, aí o fato mudou. Até lá, não antecipe essa conversa.`,
        "Se a vontade de explicar aparecer, escreva no bloco de notas e feche. Não envie.",
      ],
      card: {
        doNow: "Não enviar mensagem sobre volta.",
        avoid: "Pedir uma exceção ao limite.",
        watch: `Se ${other} reabrir o assunto sem você puxar.`,
        rule: "Sem uma iniciativa nova dessa pessoa, o assunto da volta fica fechado.",
      },
      practicalTopics: ["talk_timing", "talk_opening_line", "talk_cold_reply", "talk_stop"],
    });
  }
  if (flags.logisticalContact) {
    return pack("talk_about_return", "paidGuidanceByGoal.talk_about_return", {
      directAnswer: `Ainda não é hora de falar sobre voltar. O contato entre ${you} e ${other} existe por um motivo específico, e isso não é conversa de relação.`,
      reason: "Assunto prático, recado ou obrigação não mostram que a outra pessoa quer tratar da volta.",
      consequence: "Se você usar esse contato para perguntar da relação, mistura uma obrigação com um pedido afetivo.",
      whatToDo: "Resolver só o assunto prático. Deixar a volta fora dessa troca.",
      whatNotToDo: "Não acrescentar saudade, pedido de decisão ou um histórico no meio do recado.",
      falseSignals: null,
      message: null,
      ifThen: [
        `Se ${other} mudar do recado para a relação, você responde a isso e não amplia.`,
        "Se a conversa continuar só no motivo prático, encerre no assunto e não puxe a volta.",
      ],
      card: {
        doNow: "Responder apenas o assunto prático.",
        avoid: "Perguntar da volta nesse contato.",
        watch: "Se o assunto sair do recado por iniciativa da outra pessoa.",
        rule: "Contato por obrigação não autoriza conversa de volta.",
      },
      practicalTopics: ["talk_timing", "talk_opening_line", "talk_cold_reply", "talk_stop"],
    });
  }
  if (flags.noContact || (flags.alreadyAskedToReturn && !flags.mutualInitiative)) {
    const asked = flags.alreadyAskedToReturn;
    return pack("talk_about_return", "paidGuidanceByGoal.talk_about_return", {
      directAnswer: asked
        ? `Não repetir a pergunta sobre voltar. ${you} já fez essa pergunta e a procura ainda sai de você, não de ${other}.`
        : `Sem contato, este não é o momento de ${you} abrir com um pedido de volta para ${other}.`,
      reason: asked
        ? "Uma segunda versão da mesma pergunta coloca você de novo no lugar de quem sustenta a aproximação sem a outra pessoa."
        : "Sem uma conversa em andamento, a primeira mensagem sobre volta vira um pedido sem contexto.",
      consequence: asked
        ? "Se você perguntar de novo, a resposta fria tende a se repetir e a espera aumenta."
        : "Se a mensagem pedir decisão agora, você fica esperando uma resposta que ninguém ofereceu.",
      whatToDo: asked
        ? "Não enviar outra pergunta sobre volta. Outro contato só faria sentido se a outra pessoa entrasse com uma mudança."
        : "Não abrir o assunto da volta enquanto o contato não for iniciado pela outra pessoa.",
      whatNotToDo: "Não colocar na primeira mensagem um pedido de volta, uma cobrança de resposta nem um relato longo de saudade.",
      falseSignals: null,
      message: null,
      ifThen: [
        `Se ${other} responder só com educação ou não responder, não envie uma segunda versão.`,
        "Se surgir uma iniciativa que você não puxou e ela falar da relação, aí a conversa pode ser outra.",
      ],
      card: {
        doNow: asked ? "Não reenviar a pergunta da volta." : "Não abrir a volta hoje.",
        avoid: "Cobrar uma resposta.",
        watch: `Se ${other} iniciar e falar da relação.`,
        rule: "Sem uma entrada da outra pessoa, não existe conversa de volta.",
      },
      practicalTopics: ["talk_timing", "talk_opening_line", "talk_cold_reply", "talk_stop"],
    });
  }
  return pack("talk_about_return", "paidGuidanceByGoal.talk_about_return", {
    directAnswer: `Dá para falar de uma volta, ${you}, sem pedir uma decisão na primeira mensagem para ${other}. O assunto é o que mudaria, não a saudade.`,
    reason: "Os dois ainda se falam e a procura não está só com você. Isso é abertura mínima para uma conversa, não um sim para recomeçar.",
    consequence: "Se a primeira mensagem pedir a volta, a conversa vira pressão e a resposta fria fica mais provável.",
    whatToDo: "Escrever uma mensagem curta sobre o que aconteceu, sem pedido de decisão, e enviar uma vez só.",
    whatNotToDo: "Não colocar na primeira mensagem um pedido de volta, uma cobrança de resposta nem um relato longo de saudade.",
    falseSignals: null,
    message: `Eu pensei com mais calma no que aconteceu entre a gente. Não estou te chamando para decidir nada agora. Queria saber se, em algum momento, você estaria ${open} a conversar sobre o que aconteceu.`,
    ifThen: [
      `Se ${other} responder e também falar de uma mudança, marquem outro momento para continuar.`,
      "Se a resposta for fria, curta ou não vier, não envie uma segunda versão da mesma pergunta.",
    ],
    card: {
      doNow: "Enviar uma frase, uma vez.",
      avoid: "Pedir a volta nessa mensagem.",
      watch: `Se ${other} fala de mudança ou só cumprimenta.`,
      rule: "Sem resposta sobre o que mudaria, a conversa de volta não continua.",
    },
    practicalTopics: ["talk_timing", "talk_opening_line", "talk_cold_reply", "talk_stop"],
  });
}

function observeRealOpening(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags } = ctx;
  const closed = flags.explicitLimit
    ? `Não insistir agora. Existe um limite claro, e nada do que ${other} deixou nas redes reabre essa resposta para ${you}.`
    : flags.logisticalContact
      ? `O contato entre ${you} e ${other} é por um motivo específico. Isso não é abertura amorosa.`
      : flags.mutualInitiative && !flags.noContact
        ? `Ainda não dá para cravar a abertura. ${you} e ${other} se falam, e existe base para uma conversa, mas abertura verdadeira pede iniciativa, continuidade e uma atitude concreta.`
        : `Não trate o silêncio como abertura. Entre ${you} e ${other}, ainda não há iniciativa suficiente para concluir que existe volta.`;
  return pack("observe_real_opening", "paidGuidanceByGoal.observe_real_opening", {
    directAnswer: closed,
    reason: flags.noContact
      ? "Sem contato, não existe aproximação acontecendo. O que dá para ler é a ausência de iniciativa, não um sinal escondido."
      : "Uma mensagem, uma educação ou um assunto prático não separam esperança de participação.",
    consequence: "Se você concluir por um contato isolado, passa a esperar uma relação que a outra pessoa não propôs.",
    whatToDo: "Anotar, nos próximos contatos, quem começou, se o assunto passou de educação e se houve uma proposta concreta.",
    whatNotToDo: "Não ensaiar reconquista enquanto observa. A tarefa agora é ler o contato, não provocá-lo.",
    falseSignals: "Não contam como abertura: curtida, visualização, educação, saudade dita uma vez, mensagem de carência e contato só por um assunto prático.",
    message: null,
    ifThen: [
      `Se ${other} procurar de novo e falar da relação, aí existe o que conversar.`,
      "Se os contatos continuarem educados, tardios ou só logísticos, encerre a leitura de sinal.",
    ],
    card: {
      doNow: "Anotar quem inicia o próximo contato.",
      avoid: "Concluir por uma curtida.",
      watch: "Iniciativa repetida e uma proposta concreta.",
      rule: "Sem as duas coisas, não existe abertura para tratar como volta.",
    },
    practicalTopics: ["opening_initiative", "opening_continuity", "opening_concrete", "opening_false"],
  });
}

function changesBeforeReturn(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags, problem } = ctx;
  const cycle = flags.onlyClient
    ? `O ciclo que desgasta ${you} e ${other} é este: você puxa a conversa, a outra pessoa não entra com uma mudança, e a saudade reabre o mesmo término.`
    : `O ciclo que desgasta é voltar pela saudade antes de os dois mudarem o que já quebrou: ${problem}.`;
  return pack("changes_before_return", "paidGuidanceByGoal.changes_before_return", {
    directAnswer: flags.explicitLimit
      ? `Não insistir agora. Existe um limite claro, e uma volta sem mudança dos dois repetiria o término. ${you} não chama ${other} para recomeçar.`
      : `Uma volta só faria sentido se ${you} e ${other} mudassem os dois lados. Saudade, sozinha, repetiria o término.`,
    reason: cycle,
    consequence: "Se o combinado tiver só a sua parte, a volta recomeça o problema com outro nome.",
    whatToDo: `Escrever duas condições antes de qualquer conversa: o que você para de carregar sem a outra pessoa e o que ${other} precisa fazer sem você puxar. Sem a segunda, não há recomeço.`,
    whatNotToDo: "Não transforme isso num convite para voltar. O passo agora é combinar o que mudaria, não chamar a pessoa.",
    falseSignals: null,
    message: null,
    ifThen: [
      `Se ${other} nomear a própria mudança e aceitar um prazo curto, o acordo pode ser testado.`,
      "Se só você listar mudanças, ou se aparecer só saudade, a condição de volta não existe.",
    ],
    card: {
      doNow: "Escrever as duas condições.",
      avoid: "Chamar para voltar antes disso.",
      watch: "Uma atitude da outra pessoa que você não puxou.",
      rule: "Saudade sem mudança dos dois não é condição de volta.",
    },
    practicalTopics: ["cycle_pattern", "user_change", "partner_change", "proof_behavior"],
  });
}

function shouldIKeepTrying(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags } = ctx;
  const verdict = tryingVerdictOf(flags);
  const limit = flags.explicitLimit ? " Existe um limite claro e ele entra no veredito." : "";
  return pack("should_i_keep_trying", "paidGuidanceByGoal.should_i_keep_trying", {
    directAnswer: `${tryingPhrase(verdict, other)}${limit} A pergunta de ${you} não fica em aberto.`,
    reason:
      verdict === "try_now"
        ? `Os dois ainda se movem. Por isso a tentativa cabe numa conversa, não numa sequência de mensagens de ${you}.`
        : verdict === "observe_before_acting"
          ? `Entre ${you} e ${other} ainda falta um fato dos dois. Agir agora seria investir numa resposta que não chegou.`
          : verdict === "moving_forward_is_healthier"
            ? "A espera está sendo alimentada por você. Mais uma tentativa não traz uma resposta nova."
            : `A tentativa está sem resposta de ${other}. Insistir agora aumenta a espera e não aumenta a chance.`,
    consequence:
      verdict === "try_now"
        ? "Se você transformar a conversa em cobrança, o veredito de tentar deixa de valer."
        : "Se você mandar outra mensagem para aliviar a dúvida, está escolhendo insistir contra o veredito.",
    whatToDo:
      verdict === "try_now"
        ? "Falar uma vez do que mudaria e parar se a resposta não vier dos dois."
        : verdict === "observe_before_acting"
          ? `Dar um prazo curto e só rever a decisão se ${other} iniciar um contato sobre a relação.`
          : "Interromper a tentativa atual. Não abrir uma nova abordagem esta semana.",
    whatNotToDo: "Não transformar o veredito em mais uma mensagem de reconquista.",
    falseSignals: null,
    message: null,
    ifThen: [
      `Se surgir uma iniciativa de ${other} que você não puxou, reavalie a conversa. Não recomece a insistência.`,
      "Se o prazo passar só com a sua procura, o veredito passa a ser parar.",
    ],
    card: {
      doNow: verdict === "try_now" ? "Falar uma vez e parar." : "Não abrir nova abordagem esta semana.",
      avoid: "Mandar mensagem para aliviar a dúvida.",
      watch: "Um fato novo que você não puxou.",
      rule: "Saudade sua não reabre a tentativa.",
    },
    practicalTopics: ["try_verdict", "try_window", "try_new_fact", "try_stop"],
    tryingVerdict: verdict,
  });
}

function howToMoveForward(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags, answers } = ctx;
  const feed = flags.noContact
    ? "sem conversa, o que alimenta a espera é checar as redes ou reler a última mensagem"
    : answers["t.contato"] === "estranho" || answers["i.duvida"] === "esfria"
      ? "o contato que esfria e volta faz você procurar uma resposta no meio do sumiço"
      : "a esperança baseada em saudade faz você reabrir uma conversa que já não anda";
  return pack("how_to_move_forward", "paidGuidanceByGoal.how_to_move_forward", {
    directAnswer: flags.explicitLimit
      ? `Não insistir agora. Existe um limite claro. Seguir em frente, para ${you}, é parar de procurar uma resposta em ${other}.`
      : `Seguir em frente, ${you}, é parar de procurar uma resposta em ${other}. O plano é encerrar a espera, não reconquistar.`,
    reason: `O que alimenta a espera, neste caso, é isto: ${feed}.`,
    consequence: "Se você responder a um sinal solto como se a história tivesse reaberto, o plano de seguir cai no mesmo dia.",
    whatToDo: "Escolher um gatilho concreto para cortar hoje: as redes, a conversa que você reabre ou o horário em que checa o celular.",
    whatNotToDo: "Não estudar um jeito de fazer a outra pessoa voltar. Este plano não ensina reconquista.",
    falseSignals: "Saudade, uma curtida ou uma visualização alimentam a espera. Nenhum desses fatos reabre a história.",
    message: null,
    ifThen: [
      "Se bater saudade, escreva o gatilho e feche sem enviar.",
      `Se ${other} procurar, responda ao que foi dito sem transformar isso num recomeço.`,
    ],
    card: {
      doNow: "Cortar um gatilho hoje.",
      avoid: "Mandar a mensagem de saudade.",
      watch: "O horário em que você checa o celular.",
      rule: "Voltar ao ciclo é falha do plano, não sinal de reabertura.",
    },
    practicalTopics: ["wait_feed", "social_check", "no_send", "relapse_rule"],
  });
}

function talkWithoutFighting(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags, answers } = ctx;
  const fought = answers["r.fala"] === "briga";
  const neverTried = answers["r.fala"] === "nao_tentei";
  return pack("talk_without_fighting", "relationship.talk_without_fighting", {
    directAnswer: fought
      ? `${you}, a conversa com ${other} não pode recomeçar do mesmo jeito. A última virou discussão. O próximo passo é um assunto só, com hora para parar.`
      : neverTried
        ? `${you} e ${other} ainda não tentaram essa conversa. A primeira precisa ser curta, com um assunto e um fim marcado.`
        : flags.alreadyTriedTalking
          ? `Vocês já falam e a conversa não se sustenta. ${you} não precisa de mais uma abertura geral com ${other}. Precisa de um assunto só e uma hora para parar.`
          : `A conversa entre ${you} e ${other} precisa de um assunto, um tempo e uma pausa. Sem isso, ela vira disputa sobre quem tem razão.`,
    reason: fought
      ? "Quando a fala vira defesa, aumentar o tempo só aumenta o ataque. O limite de vinte minutos corta esse ciclo."
      : "Sem assunto marcado, cada um traz o histórico inteiro e ninguém termina a conversa.",
    consequence: "Se vocês passarem da hora ou mudarem de assunto, a conversa deixa de ser acordo e volta a ser briga.",
    whatToDo: `Combinar vinte minutos sobre um ponto só e parar no horário, mesmo sem acordo final. ${other} também escolhe o ponto.`,
    whatNotToDo: "Não reabrir o histórico inteiro nem pedir uma conclusão no mesmo dia.",
    falseSignals: null,
    message: "Quero falar de uma coisa só, por vinte minutos, e parar na hora mesmo sem resolver tudo. Você topa escolher o assunto comigo?",
    ifThen: [
      "Se os dois cumprirem o tempo, marquem a próxima conversa com outro ponto.",
      "Se virar ataque ou silêncio, encerrem na hora e não retomem no mesmo dia.",
    ],
    card: {
      doNow: "Marcar vinte minutos e um assunto.",
      avoid: "Trazer o histórico inteiro.",
      watch: "Se a pausa foi respeitada.",
      rule: "Sem uma conversa que termina sem briga, não há base para um acordo maior.",
    },
    practicalTopics: ["fight_timebox", "fight_one_topic", "fight_pause", "fight_stop"],
  });
}

function recoverCloseness(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags } = ctx;
  if (flags.alreadyGaveSpace) {
    return pack("recover_closeness", "relationship.recover_closeness", {
      directAnswer: `${you} já recuou e a retomada com ${other} continua nas suas mãos. Mais espaço não recupera a proximidade. O teste agora é uma iniciativa da outra pessoa.`,
      reason: "Você já deu espaço e ainda precisa puxar de novo. Repetir o recuo só adia o mesmo desencontro.",
      consequence: "Se o pedido for mais um período de espera, a proximidade segue dependendo só de você.",
      whatToDo: `Pedir uma iniciativa concreta de ${other} nesta semana. Você já recuou; o teste agora é a participação, não mais espaço.`,
      whatNotToDo: "Não oferecer mais espaço como se isso fosse o pedido, e não mandar uma sequência para medir interesse.",
      falseSignals: null,
      message: "Eu já tenho esperado e dado espaço. O que continua faltando é a sua parte. Qual iniciativa você assume nesta semana, sem eu precisar puxar?",
      ifThen: [
        `Se ${other} marcar e cumprir, repitam o mesmo formato na semana seguinte.`,
        "Se você precisar cobrar o encontro, a proximidade ainda está só nas suas mãos.",
      ],
      card: {
        doNow: "Pedir uma iniciativa com data.",
        avoid: "Oferecer mais espaço.",
        watch: "Se o encontro acontece sem você cobrar.",
        rule: "Sem iniciativa da outra pessoa, o plano de proximidade para.",
      },
      practicalTopics: ["closeness_date", "closeness_initiative", "closeness_not_space", "closeness_stop"],
    });
  }
  if (flags.spaceRequested || flags.onlyClient) {
    return pack("recover_closeness", "relationship.recover_closeness", {
      directAnswer: `A proximidade entre ${you} e ${other} não volta com mais mensagens. A mudança está ficando nas suas mãos e só melhora se a outra pessoa assumir uma parte concreta.`,
      reason: flags.spaceRequested
        ? `${other} já falou em espaço. Procurar mais, neste momento, empurra justamente o que você quer perto.`
        : "Quando só você puxa o contato, o carinho vira cobrança e a distância aumenta.",
      consequence: "Se você preencher o silêncio com outra sequência, o combinado de proximidade não chega a ser testado.",
      whatToDo: "Combinar um tempo curto dos dois e um tempo separado, com data, em vez de abrir a conversa geral sobre o problema.",
      whatNotToDo: "Não mandar outra sequência de mensagens para medir interesse.",
      falseSignals: null,
      message: "Quero combinar um tempo nosso e um tempo separado. Você topa definir isso comigo?",
      ifThen: [
        "Se o tempo combinado acontecer, repitam na semana seguinte antes de ampliar o pedido.",
        "Se você tiver que lembrar o encontro, a parte da outra pessoa ainda não entrou.",
      ],
      card: {
        doNow: "Combinar uma data curta.",
        avoid: "Encher o silêncio de mensagens.",
        watch: "Se a outra pessoa sugere o encontro.",
        rule: "Sem uma parte concreta da outra pessoa, pare o plano.",
      },
      practicalTopics: ["closeness_date", "closeness_initiative", "closeness_not_space", "closeness_stop"],
    });
  }
  return pack("recover_closeness", "relationship.recover_closeness", {
    directAnswer: `Dá para recuperar proximidade entre ${you} e ${other} com um tempo marcado dos dois. Não com uma cobrança de carinho.`,
    reason: "Os dois ainda participam. O que falta é um encontro pequeno, com data, e não uma conversa sobre o quanto sentem falta.",
    consequence: "Se o pedido for um sentimento, e não uma data, a conversa termina sem nada para cumprir.",
    whatToDo: "Escolher um encontro curto nesta semana e pedir que a outra pessoa confirme o horário.",
    whatNotToDo: "Não medir o carinho pelo tamanho da resposta no mesmo dia.",
    falseSignals: null,
    message: "Quero um tempo nosso nesta semana, curto e marcado. Você escolhe o dia comigo?",
    ifThen: [
      "Se o encontro acontecer, marquem o próximo antes de avaliar a relação inteira.",
      "Se a data for adiada duas vezes, a proximidade ainda não é um combinado.",
    ],
    card: {
      doNow: "Marcar um encontro curto.",
      avoid: "Cobrar um sentimento.",
      watch: "Se a data é confirmada pelos dois.",
      rule: "Sem data cumprida, não amplie o pedido.",
    },
    practicalTopics: ["closeness_date", "closeness_initiative", "closeness_not_space", "closeness_stop"],
  });
}

function shareTasks(ctx: GuidanceContext): GuidancePack {
  const { you, other, answers } = ctx;
  const both = answers["r.acordo_tarefas"] === "ambos";
  const none = answers["r.acordo_tarefas"] === "nenhum";
  return pack("share_tasks", "relationship.share_tasks", {
    directAnswer: both
      ? `${you} e ${other} já cumprem um combinado. O próximo passo é uma tarefa nova, não reabrir toda a lista.`
      : none
        ? `A divisão entre ${you} e ${other} ainda não tem dono. Sem uma tarefa nomeada, a carga continua difusa.`
        : `O acordo entre ${you} e ${other} só vale se a outra pessoa assumir uma parte concreta e ela continuar feita sem o seu lembrete.`,
    reason: answers["r.peso"] === "lembrar"
      ? "Você já está no lugar de quem lembra. Enquanto o lembrete for seu, a tarefa não foi dividida."
      : "Uma lista grande demais volta inteira para quem cobra. Uma parte visível cabe numa semana.",
    consequence: "Se você refizer a tarefa em silêncio, o acordo parece cumprido e a divisão não muda.",
    whatToDo: both
      ? `Escolher a próxima tarefa e o dia em que ${other} a assume, sem revisar o passado nesta conversa.`
      : `Escolher uma tarefa visível e pedir que ${other} assuma essa parte concreta nesta semana, com um dia para revisar.`,
    whatNotToDo: "Não refazer a tarefa em silêncio nem transformar a revisão numa lista de tudo que já deu errado.",
    falseSignals: null,
    message: "Esta semana eu preciso que você assuma esta parte, até sexta, sem eu lembrar. Se não rolar, a gente revê o acordo em vez de eu fazer no seu lugar.",
    ifThen: [
      "Se a tarefa ficar feita sem lembrete, escolham a próxima do mesmo tamanho.",
      "Se ela voltar para você, pare de compensar e diga que o acordo não se sustentou.",
    ],
    card: {
      doNow: "Uma tarefa, um prazo, uma revisão.",
      avoid: "Refazer em silêncio.",
      watch: "Se foi feita sem o seu lembrete.",
      rule: "Acordo que só você executa não é acordo.",
    },
    practicalTopics: ["task_owner", "task_deadline", "task_review", "task_stop"],
  });
}

function rebuildTrust(ctx: GuidanceContext): GuidancePack {
  const { you, other, answers } = ctx;
  const fearOnly = answers["r.atras"] === "receio";
  const promise = answers["r.acordo_confianca"] === "promessa";
  const done = answers["r.acordo_confianca"] === "atitudes";
  return pack("rebuild_trust", "relationship.rebuild_trust", {
    directAnswer: fearOnly
      ? `${you} marcou um receio sem um fato concreto. A orientação não transforma isso em traição nem em culpa de ${other}. O passo é dizer o que ajudaria, sem fiscalizar.`
      : done
        ? `Já existe atitude, não só promessa, entre ${you} e ${other}. Confiança se reconstrói repetindo essa atitude, não reabrindo a acusação.`
        : `Confiança entre ${you} e ${other} não volta com uma promessa. Volta com uma atitude repetida, combinada antes, que você não precisa fiscalizar o tempo todo.`,
    reason: fearOnly
      ? "Sem um combinado quebrado, vigiar o dia inteiro cria o conflito que ainda não aconteceu."
      : promise
        ? "A conversa já aconteceu e parou na promessa. Por isso o próximo pedido é um comportamento desta semana."
        : "Promessa sem comportamento deixa você conferindo e a outra pessoa sem saber o que cumprir.",
    consequence: "Se a prova exigida for adivinhar o que você sente, ninguém consegue cumprir o acordo.",
    whatToDo: fearOnly
      ? "Dizer uma necessidade observável, como avisar quando o plano mudar, e parar de procurar uma confirmação o resto do dia."
      : `Pedir uma atitude específica, observável nesta semana, e dizer o que ${other} fará sem ser cobrado toda hora.`,
    whatNotToDo: "Não aceitar 'vai ser diferente' sem dizer qual comportamento muda, e não vigiar o dia inteiro.",
    falseSignals: null,
    message: fearOnly
      ? null
      : "Para eu confiar de novo, eu preciso ver esta atitude nesta semana, sem eu cobrar todo dia. Você topa assumir isso e me dizer se não conseguir?",
    ifThen: [
      "Se a atitude se repetir no prazo, o próximo combinado continua do mesmo tamanho.",
      "Se ficar só na frase, a confiança não está sendo reconstruída.",
    ],
    card: {
      doNow: "Pedir uma atitude desta semana.",
      avoid: "Fiscalizar o dia inteiro.",
      watch: "Se a atitude se repete sem cobrança.",
      rule: "Promessa sem comportamento não conta como reparo.",
    },
    practicalTopics: ["trust_behavior", "trust_repeat", "trust_no_promise", "trust_stop"],
  });
}

function evaluateStaying(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags, answers } = ctx;
  const mutual = flags.mutualInitiative && (answers["r.acordo_geral"] === "ambos" || answers["r.acordo_tarefas"] === "ambos" || answers["r.acordo_confianca"] === "atitudes");
  return pack("evaluate_staying", "relationship.evaluate_staying", {
    directAnswer: mutual
      ? `Vale continuar, ${you}, com uma revisão marcada. ${other} já participa de uma mudança concreta. A decisão usa o que for feito em trinta dias, não uma promessa.`
      : `A pergunta de ${you} não é se ainda existe amor. É se ${other} assume uma parte visível. Sem isso, continuar é sustentar a relação por uma pessoa só.`,
    reason: mutual
      ? "Já existe participação dos dois. O que falta é uma data para revisar, senão a melhora fica solta."
      : "Até aqui a tentativa está concentrada em você. Mais tempo sem um fato novo só adia a mesma avaliação.",
    consequence: mutual
      ? "Se não houver data, a avaliação vira mais uma conversa e você não decide."
      : "Se você alongar sem prazo, a relação segue no formato que já está te cansando.",
    whatToDo: mutual
      ? "Escrever o que já está funcionando e marcar a revisão em trinta dias."
      : "Listar duas mudanças para trinta dias e ver se a outra pessoa assume uma delas por escrito.",
    whatNotToDo: "Não usar a avaliação como ameaça nem como conversa sem data.",
    falseSignals: null,
    message: null,
    ifThen: [
      "Se uma mudança dos dois acontecer no prazo, continuem com outra revisão marcada.",
      "Se nada mudar além da sua tentativa, a avaliação aponta para não continuar do mesmo jeito.",
    ],
    card: {
      doNow: "Marcar a revisão em trinta dias.",
      avoid: "Ameaça ou conversa sem data.",
      watch: "O que foi feito, não o que foi prometido.",
      rule: "No fim do prazo, decida pelo comportamento.",
    },
    practicalTopics: ["stay_deadline", "stay_visible", "stay_review", "stay_decision"],
  });
}

function seeReciprocity(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags } = ctx;
  const never = flags.noContact;
  return pack("see_reciprocity", "uncertain.see_reciprocity", {
    directAnswer: never
      ? `${you} e ${other} ainda não conversam. Não há reciprocidade para ler. O passo é um assunto comum, não uma conclusão.`
      : flags.mutualInitiative
        ? `Os dois já puxam contato. Reciprocidade, daqui para frente, é ${other} sustentar a conversa e propor algo, não só responder.`
        : `Hoje a iniciativa está com ${you}. Reciprocidade só conta se ${other} criar contato sem o seu empurrão.`,
    reason: never
      ? "Sem uma conversa, qualquer leitura de interesse seria chute. O fato é a ausência de troca."
      : "Resposta educada não é o mesmo que a outra pessoa querer continuar.",
    consequence: "Se você declarar o que sente para testar o interesse, deixa de observar e passa a pressionar.",
    whatToDo: never
      ? "Começar por um assunto comum, uma vez, e ver se a conversa continua no dia seguinte."
      : "Durante alguns contatos, observar quem se aproxima e registrar se existe convite, sem puxar o assunto.",
    whatNotToDo: "Não fazer uma declaração para testar o interesse.",
    falseSignals: "Educação, resposta curta e presença no mesmo lugar não são reciprocidade.",
    message: null,
    ifThen: [
      `Se ${other} iniciar duas vezes e sustentar a conversa, aí existe base para um convite claro.`,
      "Se só você iniciar, pare de investir na dúvida.",
    ],
    card: {
      doNow: never ? "Abrir um assunto comum, uma vez." : "Não puxar o próximo assunto.",
      avoid: "Declarar para testar.",
      watch: "Quem volta no dia seguinte.",
      rule: "Sem iniciativa espontânea, não há reciprocidade.",
    },
    practicalTopics: ["reciprocity_start", "reciprocity_continue", "reciprocity_invite", "reciprocity_stop"],
  });
}

function approachWithoutPressure(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags } = ctx;
  return pack("approach_without_pressure", "uncertain.approach_without_pressure", {
    directAnswer: flags.noContact
      ? `${you} ainda não tem uma conversa com ${other}. Aproximar sem pressão, agora, é um assunto comum. Não é um convite carregado de expectativa.`
      : `Aproximar sem pressão, ${you}, é um convite simples para ${other}, com saída fácil, e nenhuma segunda mensagem se a primeira ficar sem resposta.`,
    reason: "Uma sequência de mensagens alivia a sua ansiedade e aumenta a pressão do outro lado.",
    consequence: "Se você completar o silêncio com um lembrete, o convite vira campanha.",
    whatToDo: flags.noContact
      ? "Falar de uma situação que vocês já compartilham, uma vez, e parar."
      : "Fazer um convite concreto e único, com dia e uma atividade, e parar depois dele.",
    whatNotToDo: "Não explicar o convite várias vezes nem mandar uma sequência para aliviar a ansiedade.",
    falseSignals: null,
    message: flags.noContact ? null : "Queria te chamar para um café nesta semana. Se não for uma boa hora, tudo bem me dizer.",
    ifThen: [
      "Se houver outro horário proposto, aceitem esse e não acrescentem uma conversa sobre sentimentos.",
      "Se não houver resposta, não envie um lembrete.",
    ],
    card: {
      doNow: "Um convite, uma chance.",
      avoid: "Lembrete no silêncio.",
      watch: "Se a pessoa propõe outro horário.",
      rule: "Convite sem resposta encerra a aproximação.",
    },
    practicalTopics: ["invite_once", "invite_exit", "invite_no_followup", "invite_stop"],
  });
}

function sayWhatYouFeel(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags, answers } = ctx;
  const starting = answers["i.relacao"] === "nunca" || flags.noContact;
  return pack("say_what_you_feel", "uncertain.say_what_you_feel", {
    directAnswer: starting
      ? `${you} e ${other} ainda não têm uma conversa comum. Falar o que você sente agora seria pressão sem contexto. O passo é começar pelo assunto, não pela declaração.`
      : `Falar o que sente cabe numa frase, ${you}, depois de um contato que os dois sustentam. Não cabe num texto longo para ${other} nem numa cobrança de definição.`,
    reason: starting
      ? "Sem troca anterior, a declaração pede uma resposta que a outra pessoa nem sabe que está em jogo."
      : "Uma frase deixa espaço. Um texto longo pede plateia e uma definição imediata.",
    consequence: "Se você completar o silêncio com uma explicação, transforma a frase num discurso.",
    whatToDo: starting ? "Começar por um assunto comum, uma vez. Sem declaração." : "Dizer o interesse em uma frase e deixar a resposta vir sem complemento.",
    whatNotToDo: "Não pedir uma definição imediata nem repetir a frase se a reação for neutra.",
    falseSignals: null,
    message: starting ? null : "Gosto de conversar com você e queria saber se você teria vontade de fazer alguma coisa comigo, só nós dois.",
    ifThen: [
      "Se a resposta for um convite ou uma pergunta, continuem por aí.",
      "Se for neutra ou ausente, não explique a frase de novo.",
    ],
    card: {
      doNow: starting ? "Abrir um assunto comum." : "Dizer uma frase e parar.",
      avoid: "Pedir definição imediata.",
      watch: "Se a pessoa faz uma pergunta ou muda de assunto.",
      rule: "Uma frase sem resposta não pede segunda versão.",
    },
    practicalTopics: ["feeling_one_line", "feeling_context", "feeling_silence", "feeling_stop"],
  });
}

function avoidOneSidedExpectation(ctx: GuidanceContext): GuidancePack {
  const { you, other, answers } = ctx;
  const hotCold = answers["i.duvida"] === "esfria";
  return pack("avoid_one_sided_expectation", "uncertain.avoid_one_sided_expectation", {
    directAnswer: hotCold
      ? `O contato entre ${you} e ${other} que flui e esfria não é um começo de relação. Trate o tamanho real até existir um convite claro.`
      : `${you} ainda está lendo intenção onde ${other} só deu contato. A orientação é reduzir a expectativa antes de criar uma história de um lado só.`,
    reason: "Plano, releitura de mensagem e cobrança de clareza que não foi pedida aumentam uma relação que ainda não existe.",
    consequence: "Se um sinal pequeno virar um plano, você vai cobrar uma participação que a outra pessoa não assumiu.",
    whatToDo: "Tratar o contato atual como contato, não como começo de relação, até existir um convite claro.",
    whatNotToDo: "Não montar planos, não reler mensagens em busca de intenção e não cobrar uma clareza que você ainda não pediu.",
    falseSignals: null,
    message: null,
    ifThen: [
      "Se surgir um convite explícito, aí a expectativa tem um fato novo.",
      "Se você perceber que está esperando sem a outra pessoa, volte o contato ao tamanho real.",
    ],
    card: {
      doNow: "Deixar o contato no tamanho atual.",
      avoid: "Montar um plano a dois.",
      watch: "Se existe um convite explícito.",
      rule: "Expectativa sem convite é história de um lado só.",
    },
    practicalTopics: ["expectation_size", "expectation_reread", "expectation_plan", "expectation_stop"],
  });
}

function acceptTheAnswer(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags } = ctx;
  return pack("accept_the_answer", "unrequited.accept_the_answer", {
    directAnswer: flags.explicitLimit
      ? `Não insistir agora. Existe um limite claro: ${other} já disse que não quer. Aceitar, ${you}, é parar de procurar uma versão mais gentil dessa frase.`
      : `Ainda não houve um não claro entre ${you} e ${other}. Aceitar, aqui, é não transformar silêncio em rejeição nem em esperança.`,
    reason: flags.explicitLimit
      ? "Reescrever a frase com um 'mas talvez' mantém a história aberta contra a resposta que já chegou."
      : "Chamar o silêncio de rejeição inventa uma frase que não foi dita. Chamar de esperança inventa um sim.",
    consequence: "Se você testar a resposta com uma aproximação nova, volta para a espera que esta orientação encerra.",
    whatToDo: flags.explicitLimit
      ? "Repetir para você a frase que já foi dita, sem acrescentar um final alternativo."
      : "Não dar nome de rejeição nem de promessa ao que ainda não foi dito.",
    whatNotToDo: "Não ensaiar um novo jeito de perguntar e não usar aproximação para testar se a resposta mudou.",
    falseSignals: null,
    message: null,
    ifThen: [
      "Se a vontade de reperguntar aparecer, volte à frase original e não envie.",
      `Se ${other} mudar o que disse por conta própria, aí o fato é outro. Até lá, a resposta dada vale.`,
    ],
    card: {
      doNow: "Ficar com a frase que já foi dita.",
      avoid: "Testar se a resposta mudou.",
      watch: "Se você está acrescentando um 'mas talvez'.",
      rule: "A resposta só muda se a outra pessoa mudá-la.",
    },
    practicalTopics: ["answer_quote", "answer_no_rewrite", "answer_no_test", "answer_stop"],
  });
}

function stopLookingForSigns(ctx: GuidanceContext): GuidancePack {
  const { you, other, answers } = ctx;
  const place = answers["n.volta"] === "redes" || answers["n.tentou"] === "redes" ? "as redes" : "o lugar em que você checa uma mudança";
  return pack("stop_looking_for_signs", "unrequited.stop_looking_for_signs", {
    directAnswer: `${you}, procurar sinal em ${other} é o que mantém a história aberta. O plano é parar de buscar uma mudança que não foi oferecida.`,
    reason: `O canal mais concreto para cortar hoje passa por ${place}. É ali que a espera se renova.`,
    consequence: "Se a checagem continuar, qualquer detalhe vira esperança e o dia não fecha.",
    whatToDo: `Escolher um lugar concreto para parar de checar hoje: ${place}.`,
    whatNotToDo: "Não chamar de coincidência o que foi uma checagem. Não tratar presença educada como revisão da resposta.",
    falseSignals: "Uma mensagem que aparece e some, uma curtida ou um encontro educado não contam como mudança da resposta.",
    message: null,
    ifThen: [
      "Se a checagem acontecer, anote o gatilho e saia, sem mandar mensagem.",
      "Se o encontro for inevitável, responda ao presente e não procure um significado extra.",
    ],
    card: {
      doNow: "Cortar um canal de checagem hoje.",
      avoid: "Procurar um sinal de propósito.",
      watch: "Quantas vezes você checou.",
      rule: "Sinal encontrado de propósito não é iniciativa da outra pessoa.",
    },
    practicalTopics: ["scan_place", "scan_count", "scan_not_signal", "scan_stop"],
  });
}

function leaveTheCycle(ctx: GuidanceContext): GuidancePack {
  const { you, other, answers } = ctx;
  const friendship = answers["n.tentou"] === "amizade" || answers["n.pesa"] === "amizade";
  return pack("leave_the_cycle", "unrequited.leave_the_cycle", {
    directAnswer: friendship
      ? `${you}, sair do ciclo com ${other} é parar de usar a amizade como porta de espera. O retorno que precisa cair é a conversa em que você explica de novo o que sente.`
      : `Sair do ciclo, ${you}, é interromper o retorno: a mensagem, a checagem e a conversa em que você explica de novo o que sente por ${other}.`,
    reason: friendship
      ? "Combinar amizade para continuar perto mantém a mesma espera com outro nome."
      : "O ciclo recomeça no gesto pequeno, não na decisão grande. É esse gesto que o plano troca.",
    consequence: "Se você explicar de novo o que sente, mesmo com palavras novas, a história reabre.",
    whatToDo: "Definir o horário em que você costuma procurar e colocar outra ação sua nesse mesmo horário.",
    whatNotToDo: "Não combinar amizade como forma de continuar disponível para a mesma espera.",
    falseSignals: null,
    message: null,
    ifThen: [
      "Se o impulso vier, faça a ação substituta antes de abrir a conversa.",
      "Se você já tiver enviado, pare na primeira mensagem e não complemente.",
    ],
    card: {
      doNow: "Trocar o horário de procura por outra ação.",
      avoid: "Amizade como espera.",
      watch: "O gesto que recomeça o ciclo.",
      rule: "Explicar de novo o que sente reabre o ciclo.",
    },
    practicalTopics: ["cycle_gesture", "cycle_substitute", "cycle_no_friendship_wait", "cycle_stop"],
  });
}

function moveOnFromRefusal(ctx: GuidanceContext): GuidancePack {
  const { you, other, flags } = ctx;
  return pack("move_on_from_refusal", "unrequited.move_on_from_refusal", {
    directAnswer: flags.explicitLimit
      ? `Não insistir agora. Existe um limite claro. ${you} ainda pode querer tentar, e isso não cria uma técnica para mudar o que ${other} já disse.`
      : `Seguir em frente, ${you}, sem um não claro de ${other}, é parar de esperar uma definição que não foi dada. Não é transformar suposição em rejeição.`,
    reason: flags.explicitLimit
      ? "A resposta já chegou. Um jeito melhor de pedir continua sendo insistência."
      : "Planejar uma nova abordagem trata a sua vontade como se ela pudesse completar a frase da outra pessoa.",
    consequence: "Se houver um plano de reconquista, esta orientação não foi seguida.",
    whatToDo: "Encerrar a tentativa ativa: sem nova declaração, sem plano de reconquista e sem leitura de sinal.",
    whatNotToDo: "Não estudar um jeito melhor de pedir. Não há técnica para contornar a resposta.",
    falseSignals: null,
    message: null,
    ifThen: [
      "Se a vontade de tentar de novo aparecer, escreva e não envie.",
      `Se ${other} reabrir o assunto, ouça sem tratar isso como convite para insistir.`,
    ],
    card: {
      doNow: "Nenhum contato novo iniciado por você nesta semana.",
      avoid: "Planejar uma nova abordagem.",
      watch: "Se um sinal virou esperança de mudança.",
      rule: "O seu esforço não é a mudança da resposta.",
    },
    practicalTopics: ["refusal_no_technique", "refusal_no_plan", "refusal_week", "refusal_stop"],
  });
}

export function selectPaidGuidance(goal: GuidanceGoal, ctx: GuidanceContext): GuidancePack {
  const catalogs: Record<GuidanceGoal, (context: GuidanceContext) => GuidancePack> = {
    talk_about_return: talkAboutReturn,
    observe_real_opening: observeRealOpening,
    changes_before_return: changesBeforeReturn,
    should_i_keep_trying: shouldIKeepTrying,
    how_to_move_forward: howToMoveForward,
    talk_without_fighting: talkWithoutFighting,
    recover_closeness: recoverCloseness,
    share_tasks: shareTasks,
    rebuild_trust: rebuildTrust,
    evaluate_staying: evaluateStaying,
    see_reciprocity: seeReciprocity,
    approach_without_pressure: approachWithoutPressure,
    say_what_you_feel: sayWhatYouFeel,
    avoid_one_sided_expectation: avoidOneSidedExpectation,
    accept_the_answer: acceptTheAnswer,
    stop_looking_for_signs: stopLookingForSigns,
    leave_the_cycle: leaveTheCycle,
    move_on_from_refusal: moveOnFromRefusal,
  };
  const selected = catalogs[goal](ctx);
  if ((ctx.flags.explicitLimit || ctx.flags.noContact) && selected.message && /voltar|reconquist|abert[oa] a conversar|Gosto de conversar/i.test(selected.message)) {
    return { ...selected, message: null };
  }
  return selected;
}
