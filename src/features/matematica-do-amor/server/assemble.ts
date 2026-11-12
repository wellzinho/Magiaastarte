import { addressOf } from "../content/steps";
import { ctaOf, deliveriesOf, offerLines, preselectId } from "../domain/facts";
import { pronounsOf } from "../domain/pronouns";
import type { Answers, DateParts, PersonFigures } from "../domain/types";
import { CALC_VERSION, calculationNote, lifePath, nameNumbers } from "./calc";
import { freeLines, paidSections, splitWords, synthesize } from "./synthesis";

export type Figures = {
  motivation: number | null;
  impression: number | null;
  expression: number;
  path: number;
  motivationSteps: number[];
  impressionSteps: number[];
  expressionSteps: number[];
  pathSteps: number[];
};

export type ReadingBlock = {
  id: string;
  text: string;
  chapter: 1 | 2 | 3 | 4;
  evidenceKeys: string[];
  paid: boolean;
};

export type PlanRow = { label: string; text: string };

export type ReadingDocument = {
  contentVersion: typeof CALC_VERSION;
  moduleId: string;
  complementIds: string[];
  formatId: string;
  blocks: ReadingBlock[];
  free: string[];
  plan: PlanRow[];
  numbers: { you: Figures; them: Figures };
  calc: string;
};

export type PreviewPayload = {
  bubbles: string[];
  moments: number[];
  moduleId: string;
  identified: string;
  calc: string;
  deliveries: { id: string; label: string }[];
  preselectId: string | null;
  cta: string;
  offers: Record<string, string[]>;
  service: "simulated" | "unavailable";
};

function figures(raw: Exclude<ReturnType<typeof nameNumbers>, { error: string }>, path: ReturnType<typeof lifePath>): Figures {
  return {
    motivation: raw.motivation?.base ?? null,
    impression: raw.impression?.base ?? null,
    expression: raw.expression.base,
    path: path.base,
    motivationSteps: raw.motivation?.steps ?? [],
    impressionSteps: raw.impression?.steps ?? [],
    expressionSteps: raw.expression.steps,
    pathSteps: path.steps,
  };
}

export function buildPreview(
  answers: Answers,
  yourName: string,
  theirName: string,
  yourDate: DateParts,
  theirDate: DateParts,
  service: "simulated" | "unavailable",
): PreviewPayload | { error: string } {
  const report = synthesize(answers, yourName, theirName, yourDate, theirDate, pronounsOf(addressOf(answers)));
  if ("error" in report) return report;
  const you = nameNumbers(yourName);
  const them = nameNumbers(theirName);
  if ("error" in you || "error" in them) return { error: "Usa uma grafia em alfabeto latino que você reconheça." };
  const lines = freeLines(report);
  const moments = [1, 1, 2, 2, 3, 3, 4].slice(0, lines.length);
  const offers: Record<string, string[]> = {};
  for (const delivery of deliveriesOf()) offers[delivery.id] = offerLines(answers);
  return {
    bubbles: lines,
    moments,
    moduleId: report.moduleId,
    identified: report.band,
    calc: calculationNote(you, lifePath(yourDate), them, lifePath(theirDate)),
    deliveries: deliveriesOf(),
    preselectId: preselectId(),
    cta: ctaOf(answers),
    offers,
    service,
  };
}

export function buildDocument(
  answers: Answers,
  yourName: string,
  theirName: string,
  yourDate: DateParts,
  theirDate: DateParts,
  formatId: string,
): ReadingDocument | { error: string } {
  if (!deliveriesOf().some((item) => item.id === formatId)) return { error: "Entrega indisponível para esta história." };
  const report = synthesize(answers, yourName, theirName, yourDate, theirDate, pronounsOf(addressOf(answers)));
  if ("error" in report) return report;
  const you = nameNumbers(yourName);
  const them = nameNumbers(theirName);
  if ("error" in you || "error" in them) return { error: "Usa uma grafia em alfabeto latino que você reconheça." };
  const blocks: ReadingBlock[] = [];
  for (const section of paidSections(report)) {
    splitWords(section.text).forEach((text, index) => {
      blocks.push({
        id: index === 0 ? section.id : `${section.id}-${index}`,
        text,
        chapter: section.chapter,
        evidenceKeys: section.topicKey ? [section.topicKey] : [],
        paid: true,
      });
    });
  }
  return {
    contentVersion: CALC_VERSION,
    moduleId: report.moduleId,
    complementIds: [],
    formatId,
    blocks,
    free: freeLines(report),
    plan: [
      { label: "Faça agora", text: report.guidance.card.doNow },
      { label: "Evite", text: report.guidance.card.avoid },
      { label: "Observe", text: report.guidance.card.watch },
      { label: "Decida assim", text: report.guidance.card.rule },
    ],
    numbers: { you: figures(you, lifePath(yourDate)), them: figures(them, lifePath(theirDate)) },
    calc: calculationNote(you, lifePath(yourDate), them, lifePath(theirDate)),
  };
}

export function readingFigures(document: ReadingDocument): { you: PersonFigures; them: PersonFigures } {
  const slim = (side: Figures): PersonFigures => ({
    motivation: side.motivation,
    impression: side.impression,
    expression: side.expression,
    path: side.path,
  });
  return { you: slim(document.numbers.you), them: slim(document.numbers.them) };
}

export function deliveredTexts(document: ReadingDocument): string[] {
  return [...document.free, ...document.blocks.map((item) => item.text), ...document.plan.map((row) => `${row.label}: ${row.text}`)];
}
