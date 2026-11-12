import { firstName } from "../domain/names";
import type { Pronouns } from "../domain/pronouns";
import { confirmedFact, storyFlags, type Desire, type StoryFlags } from "../domain/facts";
import type { Answers, DateParts } from "../domain/types";
import { COUPLE, LIFE_PATHS, POSITIONS, lifePathRow, positionFit, type Fit } from "./catalog";
import { coupleBase, lifePath, masterNote, nameNumbers, type NameNumbers, type Reduced } from "./calc";
import { buildDecisionScript, type DecisionId, type DecisionScript } from "./decision";
import { goalFromAnswers, type GuidancePack } from "./guidance";
import { auditPerson, type NumberAudit } from "./profile";
import { pairOf, personalizeBridge, sharedMotivationText } from "./pairs";
import { solarHint, solarProfile, type SolarProfile } from "./solar";

export type Reality = "mutual_opening" | "unclear" | "unilateral" | "explicit_limit" | "current_relationship";
export type Verdict =
  | "there_is_basis_to_talk"
  | "observe_before_investing_more"
  | "needs_mutual_change"
  | "do_not_insist_now"
  | "move_forward_is_healthier";

export type ShownInsight = { topicKey: string; claimKey: string; sourceIds: string[] };

export type Side = { fit: Fit; why: string; topicKey: string };

export type CompatibilitySynthesis = {
  nameNeeds: Side;
  firstReactions: Side;
  actionStyles: Side;
  lifePaths: Side;
  coupleClimate: string;
  observedReality: Reality;
  directVerdict: Verdict;
  directAnswer: string;
  reason: string[];
  actionNow: string;
  observe: string[];
  stopCondition: string;
  speech: string | null;
  selfCare: string;
  dependsOnYou: string;
  dependsOnThem: string;
  ifThen: string[];
  fact: string;
  band: string;
  solar: string | null;
  moduleId: DecisionId;
  flags: StoryFlags;
  youNeed: string;
  theirNeed: string;
  best: Side;
  worst: Side;
  other: string;
  coupleMotivation: number | null;
  coupleImpression: number | null;
  coupleExpression: number;
  guidance: GuidancePack;
  script: DecisionScript;
  freeInsights: ShownInsight[];
  freeTexts: string[];
  youAudit: NumberAudit;
  theirAudit: NumberAudit;
};

type Person = {
  motivation: number | null;
  impression: number | null;
  expression: number;
  path: number;
  motivationMaster: 11 | 22 | 33 | null;
  pathMaster: 11 | 22 | 33 | null;
};

function personOf(name: NameNumbers, path: Reduced): Person {
  return {
    motivation: name.motivation?.base ?? null,
    impression: name.impression?.base ?? null,
    expression: name.expression.base,
    path: path.base,
    motivationMaster: name.motivation?.master ?? null,
    pathMaster: path.master,
  };
}

function realityOf(flags: StoryFlags): Reality {
  if (flags.explicitLimit) return "explicit_limit";
  if (flags.together) return "current_relationship";
  if (flags.logisticalContact) return "unclear";
  if (flags.mutualInitiative && !flags.noContact) return "mutual_opening";
  if (flags.onlyClient || flags.noContact || (flags.alreadyAskedToReturn && !flags.mutualInitiative)) return "unilateral";
  return "unclear";
}

function verdictOf(reality: Reality, flags: StoryFlags): Verdict {
  if (reality === "explicit_limit") return "do_not_insist_now";
  if (flags.desire === "move_on" && (flags.ended || flags.unrequited || flags.uncertain || flags.onlyClient)) return "move_forward_is_healthier";
  if (reality === "current_relationship") return flags.onlyClient || flags.spaceRequested ? "needs_mutual_change" : "there_is_basis_to_talk";
  if (reality === "unilateral") {
    if (flags.ended && (flags.alreadyAskedToReturn || flags.noContact)) return "do_not_insist_now";
    return "observe_before_investing_more";
  }
  if (reality === "mutual_opening") return "there_is_basis_to_talk";
  if (flags.desire === "move_on") return "move_forward_is_healthier";
  return "observe_before_investing_more";
}

function need(number: number | null): string {
  return number ? POSITIONS[number]?.motivation ?? "uma necessidade que não fechou na conta" : "uma necessidade que o nome não deixou calcular";
}

function side(kind: "motivation" | "impression" | "expression", you: number | null, them: number | null, other: string, evidence: boolean): Side {
  if (!you || !them) {
    return { fit: "adjustment", why: "Sem o número dos dois nessa posição, eu não invento uma comparação.", topicKey: kind };
  }
  const fit = positionFit(you, them);
  const label = kind === "motivation" ? "no que cada um precisa no amor" : kind === "impression" ? "na primeira reação" : "no jeito de agir";
  if (you === them) {
    const shared =
      kind === "motivation"
        ? sharedMotivationText(you).next
        : `Os dois têm o mesmo resultado ${label}. A leitura segue pelo excesso compartilhado, sem tratar isso como diferença.`;
    return { fit: "natural", why: shared, topicKey: kind };
  }
  const yours = POSITIONS[you];
  const theirs = POSITIONS[them];
  const yourTrait = yours?.[kind] ?? "";
  const theirTrait = theirs?.[kind] ?? "";
  const yourLine = kind === "motivation" ? `você precisa de ${yourTrait}` : kind === "impression" ? `você pode passar primeiro uma imagem de ${yourTrait}` : `você tende a ${yourTrait}`;
  const theirLine = kind === "motivation" ? `${other} busca ${theirTrait}` : kind === "impression" ? `${other} pode passar primeiro uma imagem de ${theirTrait}` : `${other} tende a ${theirTrait}`;
  const body =
    fit === "tension"
      ? `A compatibilidade é baixa ${label}: ${yourLine}, enquanto ${theirLine}.`
      : fit === "natural"
        ? `Vocês se encontram com menos esforço ${label}: ${yourLine}; ${theirLine}.`
        : `Dá para funcionar ${label}, com um acordo: ${yourLine}; ${theirLine}.`;
  const shadow =
    !evidence || !yours
      ? ""
      : you === them || !theirs || yours.shadow === theirs.shadow
        ? ` Quando isso não é conversado, pode aparecer como ${yours.shadow}.`
        : ` Quando isso não é conversado, pode aparecer como ${yours.shadow} de um lado e ${theirs.shadow} do outro.`;
  return { fit, why: `${body}${shadow}`.replace(/\s+/g, " ").trim(), topicKey: kind };
}

function factLine(flags: StoryFlags, other: string, problem: string): string {
  if (flags.explicitLimit) return `O fato que manda na orientação: ${other} já colocou um limite. Nenhum número abre uma exceção para contornar isso.`;
  if (flags.noContact && flags.alreadyAskedToReturn) {
    return `Hoje não existe contato entre vocês, e você já tentou falar sobre uma volta. Isso pesa mais do que uma combinação favorável: sem uma iniciativa de ${other}, insistir do mesmo jeito deixa você esperando uma resposta que não está sendo oferecida.`;
  }
  if (flags.alreadyAskedToReturn && flags.onlyClient) {
    return `Você já perguntou sobre voltar e a procura continua saindo de você. É isso que muda a orientação: neste momento, a possibilidade está sendo sustentada mais por você do que por ${other}.`;
  }
  if (flags.logisticalContact) return "O contato que existe é por um motivo específico. Isso não conta como abertura amorosa.";
  if (flags.spaceRequested && flags.onlyClient) return `Você procura mais quando sente distância, e ${other} já falou em espaço. O choque de hoje é esse, não uma frase genérica sobre compatibilidade.`;
  if (flags.alreadyGaveSpace) return `Você já deu espaço e ainda assim precisa retomar. O conselho não pode ser apenas dar mais espaço.`;
  return `O que pesa hoje é concreto: ${problem}.`;
}

function questionFor(desire: Desire, flags: StoryFlags): string {
  if (flags.explicitLimit) return "A leitura completa responde como cuidar do que continua em você, sem uma técnica para mudar a resposta que já foi dada.";
  if (desire === "reconcile") return "A leitura completa responde se ainda vale tentar de novo ou se você está sustentando essa possibilidade sozinha.";
  if (desire === "opening" && flags.together) return "A leitura completa responde quais atitudes mostrariam participação de verdade e o que não deve ser lido como sinal de que a distância acabou.";
  if (desire === "opening") return "A leitura completa responde quais atitudes mostrariam participação de verdade e o que não deve ser lido como volta.";
  if (desire === "move_on") return "A leitura completa responde como parar de alimentar essa espera e o que fazer no lugar dela.";
  return "A leitura completa responde o que pode ser ajustado e o que só muda se a outra pessoa participar.";
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function splitWords(text: string, max = 85): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) ?? [text.trim()];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = `${current} ${sentence}`.trim();
    if (current && words(next) > max) {
      chunks.push(current);
      current = sentence;
    } else current = next;
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [text.trim()];
}

export function synthesize(
  answers: Answers,
  yourName: string,
  theirName: string,
  yourDate: DateParts,
  theirDate: DateParts,
  pronouns: Pronouns,
): CompatibilitySynthesis | { error: string } {
  const youName = nameNumbers(yourName);
  const theirNumbers = nameNumbers(theirName);
  if ("error" in youName || "error" in theirNumbers) return { error: "Usa uma grafia em alfabeto latino que você reconheça." };
  const youPath = lifePath(yourDate);
  const theirPath = lifePath(theirDate);
  const you = personOf(youName, youPath);
  const them = personOf(theirNumbers, theirPath);
  const flags = storyFlags(answers);
  const other = firstName(theirName) || pronouns.subject;
  const evidence = flags.spaceRequested || flags.onlyClient || answers["r.fala"] === "briga" || answers["r.atras"] === "receio" || flags.unrequited;
  const nameNeeds = side("motivation", you.motivation, them.motivation, other, evidence);
  const firstReactions = side("impression", you.impression, them.impression, other, evidence);
  const actionStyles = side("expression", you.expression, them.expression, other, evidence);
  const pathRow = lifePathRow(you.path, them.path);
  const pathText = pathRow.text.charAt(0).toUpperCase() + pathRow.text.slice(1);
  const lifePaths: Side = {
    fit: pathRow.fit,
    why: `Você está no caminho ${you.path}. ${other} está no ${them.path}. ${pathText}`,
    topicKey: "life_path",
  };
  const coupleMotivation = you.motivation && them.motivation ? coupleBase(you.motivation, them.motivation).base : null;
  const coupleImpression = you.impression && them.impression ? coupleBase(you.impression, them.impression).base : null;
  const coupleExpression = coupleBase(you.expression, them.expression).base;
  const coupleClimate = coupleMotivation
    ? `Juntos, a necessidade que ganha força é ${COUPLE[coupleMotivation]?.motivation}. Na convivência, a dupla tende a ${COUPLE[coupleExpression]?.expression}.`
    : `Na convivência, a dupla tende a ${COUPLE[coupleExpression]?.expression}.`;
  const reality = realityOf(flags);
  const verdict = verdictOf(reality, flags);
  const problem = confirmedFact(answers, pronouns);
  const youNeed = need(you.motivation);
  const theirNeed = need(them.motivation);
  const yourSolar = solarProfile(yourDate);
  const theirSolar = solarProfile(theirDate);
  const paceConfirmed = answers["r.fala"] === "adia" || answers["r.fala"] === "briga" || answers["t.estranho"] === "esfria" || answers["t.estranho"] === "discussao" || flags.spaceRequested;
  const solar =
    !("unavailable" in yourSolar) && !("unavailable" in theirSolar)
      ? solarHint(yourSolar as SolarProfile, theirSolar as SolarProfile, other, paceConfirmed)
      : null;
  const master = masterNote(you.motivationMaster) ?? masterNote(you.pathMaster) ?? masterNote(them.motivationMaster) ?? masterNote(them.pathMaster);
  const numberReasons = [nameNeeds.why, lifePaths.why];
  if (master) numberReasons.push(master);
  const ranked = [nameNeeds, firstReactions, actionStyles, lifePaths];
  const best = [...ranked].sort((left, item) => rank(left.fit) - rank(item.fit))[0] ?? nameNeeds;
  const hardest = [...ranked].sort((left, item) => rank(item.fit) - rank(left.fit))[0] ?? lifePaths;
  const worst = hardest.why === best.why ? (ranked.find((item) => item.why !== best.why) ?? hardest) : hardest;
  const fact = factLine(flags, other, problem);
  const youFirst = firstName(yourName) || "você";
  const youAudit = auditPerson(yourName, yourDate);
  const theirAudit = auditPerson(theirName, theirDate);
  if ("error" in youAudit || "error" in theirAudit) return { error: "Usa uma grafia em alfabeto latino que você reconheça." };
  const script = buildDecisionScript({
    flags,
    answers,
    you: youFirst,
    other,
    pronouns,
    youMotivation: you.motivation,
    theirMotivation: them.motivation,
    problem,
  });
  const goal = goalFromAnswers(answers);
  const guidance: GuidancePack = {
    goal,
    catalog: `decision.${script.id}`,
    directAnswer: script.verdictLine,
    reason: script.why,
    consequence: script.consequence,
    whatToDo: script.action,
    whatNotToDo: script.avoid,
    falseSignals: script.ambiguous,
    message: script.speech,
    ifThen: [script.opening, script.stop],
    card: script.card,
    practicalTopics: [script.id, goal],
    tryingVerdict: null,
  };
  const free = freeReading({
    youMotivation: you.motivation,
    theirMotivation: them.motivation,
    youImpression: you.impression,
    theirImpression: them.impression,
    youExpression: you.expression,
    theirExpression: them.expression,
    youPath: you.path,
    theirPath: them.path,
    you: youFirst,
    other,
    youNeed,
    theirNeed,
    fact,
    desire: flags.desire,
    flags,
  });
  return {
    nameNeeds,
    firstReactions,
    actionStyles,
    lifePaths,
    coupleClimate,
    observedReality: reality,
    directVerdict: verdict,
    directAnswer: script.verdictLine,
    reason: numberReasons,
    actionNow: guidance.whatToDo,
    observe: [guidance.card.watch],
    stopCondition: guidance.card.rule,
    speech: guidance.message,
    selfCare: guidance.whatNotToDo,
    dependsOnYou: "A parte que depende de você é cumprir o limite ou o pedido que você escolheu, sem fazer a parte dos dois.",
    dependsOnThem: `A participação de ${other} não pode ser garantida. Sem uma atitude dessa pessoa, o combinado não anda.`,
    ifThen: guidance.ifThen,
    fact,
    band: free.lines[0] ?? "",
    solar,
    moduleId: script.id,
    flags,
    youNeed,
    theirNeed,
    best: best ?? nameNeeds,
    worst: worst ?? lifePaths,
    other,
    coupleMotivation,
    coupleImpression,
    coupleExpression,
    guidance,
    script,
    freeInsights: free.insights,
    freeTexts: free.lines,
    youAudit,
    theirAudit,
  };
}

function rank(fit: Fit): number {
  if (fit === "natural") return 0;
  if (fit === "adjustment") return 1;
  return 2;
}

function freeReading(input: {
  youMotivation: number | null;
  theirMotivation: number | null;
  youImpression: number | null;
  theirImpression: number | null;
  youExpression: number;
  theirExpression: number;
  youPath: number;
  theirPath: number;
  you: string;
  other: string;
  youNeed: string;
  theirNeed: string;
  fact: string;
  desire: Desire;
  flags: StoryFlags;
}): { lines: string[]; insights: ShownInsight[] } {
  const lines: string[] = [];
  const insights: ShownInsight[] = [];
  const mark = (topicKey: string, claimKey: string) => insights.push({ topicKey, claimKey, sourceIds: [topicKey] });
  const trait = (number: number, kind: "motivation" | "impression" | "expression" | "path") => POSITIONS[number]?.[kind] ?? "";
  if (input.youMotivation && input.theirMotivation && input.youMotivation === input.theirMotivation) {
    const shared = sharedMotivationText(input.youMotivation);
    lines.push(shared.canonical, shared.next);
    const number = input.youMotivation;
    mark(`shared_motivation_${number}`, `need_${number}`);
    mark(`user_motivation_${number}`, `need_${number}`);
    mark(`partner_motivation_${number}`, `need_${number}`);
    mark(`motivation_comparison_${number}_${number}`, `need_${number}`);
  } else if (input.youMotivation && input.theirMotivation) {
    const pair = pairOf(input.youMotivation, input.theirMotivation);
    const bridge = personalizeBridge(pair.bridge, input.youMotivation, input.you, input.theirMotivation, input.other);
    lines.push(
      `A combinação de vocês tem como ponto de encontro ${pair.meeting}. Você precisa de ${input.youNeed}. ${input.other} busca ${input.theirNeed}. O risco principal é ${pair.risk}. A ponte prática é ${bridge}.`,
    );
    const low = Math.min(input.youMotivation, input.theirMotivation);
    const high = Math.max(input.youMotivation, input.theirMotivation);
    mark(`motivation_comparison_${low}_${high}`, `pair_${low}_${high}`);
    mark(`user_motivation_${input.youMotivation}`, `need_${input.youMotivation}`);
    mark(`partner_motivation_${input.theirMotivation}`, `need_${input.theirMotivation}`);
  }
  if (input.youImpression && input.theirImpression && input.youImpression === input.theirImpression) {
    lines.push(`Na primeira reação, os dois passam a mesma imagem de ${trait(input.youImpression, "impression")}. O excesso dessa imagem é ${POSITIONS[input.youImpression]?.shadow}.`);
    mark(`shared_impression_${input.youImpression}`, `impression_${input.youImpression}`);
  } else if (input.youImpression && input.theirImpression) {
    lines.push(`Na primeira reação, você pode passar ${trait(input.youImpression, "impression")} e ${input.other} pode passar ${trait(input.theirImpression, "impression")}.`);
    mark("impression", "impression_diff");
  }
  if (input.youExpression === input.theirExpression) {
    lines.push(`No jeito de agir, os dois tendem a ${trait(input.youExpression, "expression")}. O combinado pedido é o mesmo.`);
    mark(`shared_expression_${input.youExpression}`, `expression_${input.youExpression}`);
  } else {
    lines.push(`No jeito de agir, você tende a ${trait(input.youExpression, "expression")} e ${input.other} tende a ${trait(input.theirExpression, "expression")}.`);
    mark("expression", "expression_diff");
  }
  if (input.youPath === input.theirPath) {
    lines.push(`Os dois estão no caminho ${input.youPath}: ${trait(input.youPath, "path")}. Não existe um caminho de um lado e outro do outro.`);
    mark(`shared_life_${input.youPath}`, `path_${input.youPath}`);
  } else {
    const row = lifePathRow(input.youPath, input.theirPath);
    lines.push(`Você está no caminho ${input.youPath}. ${input.other} está no ${input.theirPath}. ${row.text.charAt(0).toUpperCase()}${row.text.slice(1)}`);
    mark("life_path", "path_diff");
  }
  lines.push(input.fact, questionFor(input.desire, input.flags));
  mark("fact", input.flags.explicitLimit ? "current_boundary" : "contact_opening");
  return { lines, insights };
}

export function freeLines(report: CompatibilitySynthesis): string[] {
  return report.freeTexts;
}

export type PaidExplanation = { id: string; topicKey: string; claimKey: string; text: string };

export function paidExplanations(report: CompatibilitySynthesis): PaidExplanation[] {
  const usedTopics = new Set(report.freeInsights.map((item) => item.topicKey));
  const usedClaims = new Set(report.freeInsights.map((item) => item.claimKey));
  const blocks: PaidExplanation[] = [];
  const push = (item: PaidExplanation) => {
    if (usedTopics.has(item.topicKey) || usedClaims.has(item.claimKey)) return;
    blocks.push(item);
  };
  if (report.coupleMotivation) {
    const meaning = COUPLE[report.coupleMotivation]?.motivation;
    if (meaning) {
      push({
        id: "casal",
        topicKey: "couple",
        claimKey: "couple_climate",
        text: `Na conta do casal, a necessidade que aparece quando uma decisão precisa ser tomada pelos dois é ${meaning}.`,
      });
    }
  }
  if (report.solar) {
    push({ id: "ritmo", topicKey: "pace", claimKey: "solar_pace", text: report.solar });
  }
  if (blocks.length === 0) {
    blocks.push({
      id: "ponte",
      topicKey: "transition",
      claimKey: "bridge",
      text: "Como eu te mostrei na primeira parte, a decisão agora é o que fazer. Não vou repetir a conta.",
    });
  }
  return blocks.slice(0, 2);
}

export function paidSections(report: CompatibilitySynthesis): Array<{ id: string; chapter: 1 | 2 | 3 | 4; text: string; topicKey?: string; claimKey?: string }> {
  const script = report.script;
  const sections: Array<{ id: string; chapter: 1 | 2 | 3 | 4; text: string; topicKey?: string; claimKey?: string }> = [
    { id: "direta", chapter: 1, text: `Minha resposta mais direta: ${script.verdictLine}` },
    { id: "motivo", chapter: 1, text: script.why },
    { id: "consequencia", chapter: 1, text: script.consequence },
    ...paidExplanations(report).map((item) => ({ id: item.id, chapter: 2 as const, text: item.text, topicKey: item.topicKey, claimKey: item.claimKey })),
    { id: "acao", chapter: 3, text: script.action },
    { id: "evitar", chapter: 3, text: script.avoid },
  ];
  if (script.speech) sections.push({ id: "fala", chapter: 3, text: `Diga: “${script.speech}”` });
  if (script.afterSpeech) sections.push({ id: "depois", chapter: 3, text: script.afterSpeech });
  if (script.clientNote) sections.push({ id: "risco-cliente", chapter: 3, text: script.clientNote });
  if (script.whyStop) sections.push({ id: "parar", chapter: 3, text: script.whyStop });
  sections.push(
    { id: "abertura", chapter: 4, text: script.opening },
    { id: "ambiguo", chapter: 4, text: script.ambiguous },
    { id: "fechamento", chapter: 4, text: script.closing },
    { id: "limite", chapter: 4, text: script.stop },
  );
  return sections.filter((item) => item.text.trim());
}

export function assertCatalogComplete(): number {
  return LIFE_PATHS.length;
}
