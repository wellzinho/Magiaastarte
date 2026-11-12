import { describe, expect, it } from "vitest";
import { quizComplete, quizPlan } from "../content/steps";
import { firstName } from "../domain/names";
import type { Answers } from "../domain/types";
import { readingSections } from "../domain/reading-copy";
import { buildDocument, buildPreview, deliveredTexts, readingFigures, type ReadingDocument } from "./assemble";
import { AUDIT_FIXTURES, type AuditFixture } from "./audit-fixtures";
import { goalFromAnswers, selectPaidGuidance, type GuidanceGoal } from "./guidance";
import { paidExplanations, synthesize } from "./synthesis";
import { pronounsOf } from "../domain/pronouns";
import { addressOf } from "../content/steps";
import { storyFlags } from "../domain/facts";

const BREAKUP: GuidanceGoal[] = ["talk_about_return", "observe_real_opening", "changes_before_return", "should_i_keep_trying", "how_to_move_forward"];
const VAGUE_OFFER = /^(aprofundamento|mais detalhes|leitura detalhada|orientação completa)\.?$/i;

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 40);
}

function read(fixture: AuditFixture): ReadingDocument {
  const document = buildDocument(fixture.quizAnswers, fixture.userFullName, fixture.partnerFullName, fixture.userBirthDate, fixture.partnerBirthDate, "resposta");
  if ("error" in document) throw new Error(document.error);
  return document;
}

function reportOf(fixture: AuditFixture) {
  const report = synthesize(fixture.quizAnswers, fixture.userFullName, fixture.partnerFullName, fixture.userBirthDate, fixture.partnerBirthDate, pronounsOf(addressOf(fixture.quizAnswers)));
  if ("error" in report) throw new Error(report.error);
  return report;
}

describe("auditoria das 20 jornadas", () => {
  it("gera quiz, números, veredito, prévia e pago sem repetir a explicação grátis", () => {
    const names = new Set<string>();
    for (const fixture of AUDIT_FIXTURES) {
      expect(quizComplete(fixture.quizAnswers), fixture.title).toBe(true);
      const shown = quizPlan(fixture.quizAnswers).map((step) => {
        const chosen = fixture.quizAnswers[step.id] ?? "";
        const option = step.options.find((item) => item.id === chosen);
        expect(option, `${fixture.title} ${step.id}`).toBeTruthy();
        return { question: step.question, chosen, label: option?.label ?? "" };
      });
      expect(shown.length).toBeGreaterThan(4);
      expect(goalFromAnswers(fixture.quizAnswers)).toBe(fixture.selectedGuidanceGoal);
      const document = read(fixture);
      const report = reportOf(fixture);
      names.add(`${document.numbers.you.expression}-${document.numbers.you.path}-${document.numbers.them.expression}-${document.numbers.them.path}`);
      expect(document.blocks[0]?.text.startsWith("Minha resposta mais direta:")).toBe(true);
      expect(document.blocks.slice(0, 3).every((block) => block.chapter === 1)).toBe(true);
      expect(document.blocks.filter((block) => block.chapter === 2).length).toBeLessThanOrEqual(2);
      for (const block of document.blocks) expect(words(block.text), fixture.title).toBeLessThanOrEqual(90);
      const paid = document.blocks.map((block) => block.text).join("\n");
      for (const line of document.free) {
        if (line.length > 40) expect(paid, fixture.title).not.toContain(line);
      }
      const explanations = paidExplanations(report).filter((item) => item.topicKey !== "transition");
      for (const item of explanations) {
        expect(report.freeInsights.some((shownInsight) => shownInsight.topicKey === item.topicKey || shownInsight.claimKey === item.claimKey)).toBe(false);
      }
      const repeated = sentences(`${paid}\n${document.plan.map((row) => row.text).join("\n")}`);
      expect(new Set(repeated).size, fixture.title).toBe(repeated.length);
      expect(paid).toContain(firstName(fixture.userFullName));
      expect(paid).toContain(firstName(fixture.partnerFullName));
      expect(paid).not.toMatch(/os números mostram o que|os números confirmam que|alma gêmea|Reserve dez minutos/i);
      const preview = buildPreview(fixture.quizAnswers, fixture.userFullName, fixture.partnerFullName, fixture.userBirthDate, fixture.partnerBirthDate, "simulated");
      if ("error" in preview) throw new Error(preview.error);
      const offer = preview.offers.resposta ?? [];
      expect(offer.length).toBeGreaterThanOrEqual(4);
      expect(offer.at(-1)).toMatch(/R\$ 19,90/);
      const promise = offer.slice(0, -1).join(" ");
      expect(promise).not.toMatch(VAGUE_OFFER);
      expect(promise).toMatch(/agir|abordar|observar|sinais|hábito|atitude|risco|participação|promessa/i);
      expect(offer.join(" ")).not.toMatch(/e-mail/i);
      const copy = readingSections({
        youName: firstName(fixture.userFullName),
        theirName: firstName(fixture.partnerFullName),
        readAt: new Date(2026, 10, 12),
        blocks: document.blocks,
        plan: document.plan,
        figures: readingFigures(document),
      })
        .flatMap((section) => section.paragraphs)
        .join("\n");
      expect(copy).toContain(document.blocks[0]?.text ?? "");
      expect(copy).toContain("Faça agora:");
      expect(copy).toContain("Decida assim:");
      for (const line of document.free) {
        if (line.length > 40) expect(copy, fixture.title).not.toContain(line);
      }
      expect(document.plan.map((row) => row.label)).toEqual(["Faça agora", "Evite", "Observe", "Decida assim"]);
      const withoutNumbers = document.blocks.filter((block) => block.chapter !== 2).map((block) => block.text).join(" ");
      expect(withoutNumbers).toMatch(/não |pare|enviar|marcar|escolher|escrever|cortar|combinar|pedir|ficar|tratar|anotar|começar|dizer|listar|dar um prazo|falar/i);
    }
    expect(names.size).toBeGreaterThanOrEqual(12);
  });

  it("não muda o veredito só porque a pergunta muda", () => {
    const base = AUDIT_FIXTURES[4];
    if (!base) throw new Error("fixture");
    const packs = BREAKUP.map((goal) => reportOf({ ...base, quizAnswers: { ...base.quizAnswers, "g.meta": goal }, selectedGuidanceGoal: goal }));
    expect(new Set(packs.map((report) => report.directAnswer)).size).toBe(1);
    expect(packs[0]?.moduleId).toBe("talk_now");
    const refused = reportOf({
      ...base,
      quizAnswers: { scenario: "T", gender: "homem", "t.contato": "nenhum", "t.pararam": "pediu", "t.tentou": "afastar", "t.desejo": "voltar", "g.meta": "talk_about_return" },
    });
    expect(refused.moduleId).toBe("do_not_insist");
    expect(refused.directAnswer).not.toBe(packs[0]?.directAnswer);
  });

  it("três fatos mudam três decisões e o limite bloqueia reconquista", () => {
    const mutual: Answers = { scenario: "T", gender: "homem", "t.contato": "voltamos", "t.falaram": "sim", "t.quem": "dois", "t.tentou": "aconteceu", "t.desejo": "voltar", "g.meta": "talk_about_return" };
    const asked: Answers = { ...mutual, "t.quem": "eu", "t.tentou": "voltar", "t.desejo": "de_novo" };
    const limited: Answers = { scenario: "T", gender: "homem", "t.contato": "nenhum", "t.pararam": "pediu", "t.tentou": "afastar", "t.desejo": "voltar", "g.meta": "talk_about_return" };
    const logistical: Answers = { ...mutual, "t.quem": "motivo" };
    const context = (answers: Answers) => reportOf({
      ...AUDIT_FIXTURES[0],
      userFullName: "Clara Nunes",
      partnerFullName: "Pedro Alves",
      quizAnswers: answers,
    });
    const open = context(mutual);
    const repeated = context(asked);
    const closed = context(limited);
    const errand = context(logistical);
    expect(open.speech).toBeTruthy();
    expect(repeated.speech).toBeNull();
    expect(`${closed.directAnswer} ${closed.script.why}`).toMatch(/limite claro|não insista/i);
    expect(open.directAnswer).not.toMatch(/limite claro/);
    expect(errand.actionNow).toMatch(/prático/);
    expect(open.actionNow).not.toMatch(/prático/);
    expect(closed.speech ?? "").not.toMatch(/estaria abert[oa] a conversar|Gosto de conversar/i);
    for (const goal of BREAKUP) {
      const text = deliveredTexts(read({ ...AUDIT_FIXTURES[0], quizAnswers: { ...limited, "g.meta": goal } })).join("\n");
      expect(text).not.toMatch(/estaria abert[oa] a conversar|Gosto de conversar com você/i);
    }
  });

  it("separa relação, interesse e recusa sem inventar frase que não foi dita", () => {
    const relationship = AUDIT_FIXTURES.filter((item) => item.relationshipStatus === "R");
    for (const fixture of relationship) {
      const paid = read(fixture).blocks.map((block) => block.text).join(" ");
      expect(paid, fixture.title).not.toMatch(/pedido de volta|reconquist/i);
    }
    const uncertain = AUDIT_FIXTURES.filter((item) => item.id === 13 || item.id === 14 || item.id === 15 || item.id === 16 || item.id === 18);
    for (const fixture of uncertain) {
      expect(read(fixture).blocks.map((block) => block.text).join(" "), fixture.title).not.toMatch(/já disse que não/i);
    }
    const clearNo = reportOf(AUDIT_FIXTURES[16]);
    expect(clearNo.directAnswer).toMatch(/não insista/i);
    expect(clearNo.script.why).toMatch(/limite claro/i);
    expect(clearNo.speech ?? "").not.toMatch(/Gosto de conversar|abert[oa] a conversar/i);
    const fear = reportOf({
      ...AUDIT_FIXTURES[10],
      quizAnswers: { ...AUDIT_FIXTURES[10].quizAnswers, "r.atras": "receio", "g.meta": "rebuild_trust" },
    });
    expect(fear.actionNow).toMatch(/receio, sem um fato de traição/i);
    expect(storyFlags(AUDIT_FIXTURES[4].quizAnswers).mutualInitiative).toBe(true);
    expect(selectPaidGuidance("how_to_move_forward", {
      you: "Paula",
      other: "Tiago",
      pronouns: pronounsOf("ele"),
      flags: storyFlags(AUDIT_FIXTURES[6].quizAnswers),
      answers: AUDIT_FIXTURES[6].quizAnswers,
      problem: "vocês não se falam",
    }).directAnswer).not.toMatch(/como fazer .* voltar|reconquistar a pessoa/i);
  });
});
