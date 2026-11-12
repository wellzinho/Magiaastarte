import { describe, expect, it } from "vitest";
import type { Answers, DateParts } from "../domain/types";
import { PRICE_LABEL } from "../domain/payment";
import { buildDocument, buildPreview, deliveredTexts, type ReadingDocument } from "./assemble";
import { storyFlags } from "../domain/facts";
import { goalFromAnswers, selectPaidGuidance, type GuidanceGoal } from "./guidance";
import { freeLines, paidSections, synthesize } from "./synthesis";
import { pronounsOf } from "../domain/pronouns";

const youDate: DateParts = { day: 14, month: 7, year: 1992 };
const theirDate: DateParts = { day: 15, month: 3, year: 1991 };
const goals: GuidanceGoal[] = ["talk_about_return", "observe_real_opening", "changes_before_return", "should_i_keep_trying", "how_to_move_forward"];

const shared: Answers = {
  scenario: "T",
  gender: "homem",
  "t.contato": "voltamos",
  "t.falaram": "sim",
  "t.quem": "dois",
  "t.tentou": "aconteceu",
  "t.desejo": "abertura",
};

function read(answers: Answers, yourName = "Ana Silva", theirName = "João Pereira"): ReadingDocument {
  const document = buildDocument(answers, yourName, theirName, youDate, theirDate, "resposta");
  if ("error" in document) throw new Error(document.error);
  return document;
}

describe("ramificação da orientação", () => {
  it("mantém o veredito quando só a pergunta muda e os fatos são os mesmos", () => {
    const packs = goals.map((goal) => read({ ...shared, "g.meta": goal }));
    const leads = packs.map((document) => document.blocks[0]?.text ?? "");
    expect(new Set(leads).size).toBe(1);
    expect(leads[0]).toMatch(/vale conversar|conversar agora/i);
    expect(packs[0]?.blocks.some((block) => block.id === "fala")).toBe(true);
    expect(packs[0]?.blocks.map((block) => block.text).join(" ")).not.toMatch(/anote o que sente|liste duas mudanças|espere trinta dias/i);
    expect(goalFromAnswers({ ...shared, "g.meta": "talk_about_return" })).toBe("talk_about_return");
    expect(selectPaidGuidance("talk_about_return", {
      you: "Ana",
      other: "João",
      pronouns: pronounsOf("ele"),
      flags: storyFlags(shared),
      answers: shared,
      problem: "vocês já falaram com clareza sobre o que levou ao término",
    }).catalog).toBe("paidGuidanceByGoal.talk_about_return");
  });

  it("bloqueia reconquista quando existe limite, em todas as metas", () => {
    const limited: Answers = { ...shared, "t.contato": "nenhum", "t.pararam": "pediu", "t.tentou": "afastar", "t.desejo": "voltar" };
    for (const goal of goals) {
      const text = deliveredTexts(read({ ...limited, "g.meta": goal })).join("\n");
      expect(text).not.toMatch(/estaria abert[oa] a conversar|possibilidade de a gente voltar|Gosto de conversar com você/i);
      expect(text).not.toContain("Reserve dez minutos");
    }
  });

  it("separa duas metas de relação, de interesse e de recusa", () => {
    const pairs: Array<[Answers, GuidanceGoal, GuidanceGoal]> = [
      [{ scenario: "R", gender: "homem", "r.status": "namoro", "r.falta": "tempo", "r.fala": "escuta", "r.distancia": "combina", "r.acordo_geral": "ambos", "r.tentou": "tempo", "r.desejo": "proximidade" }, "recover_closeness", "share_tasks"],
      [{ scenario: "I", gender: "mulher", "i.relacao": "frequente", "i.quem": "dois", "i.duvida": "esfria", "i.limite": "nao", "i.desejo": "falar" }, "see_reciprocity", "say_what_you_feel"],
      [{ scenario: "N", gender: "homem", "n.viu": "disse", "n.contato": "nenhum", "n.volta": "redes", "n.tentou": "afastar", "n.desejo": "esperar" }, "accept_the_answer", "leave_the_cycle"],
    ];
    for (const [answers, left, right] of pairs) {
      const first = read({ ...answers, "g.meta": left }).blocks.find((block) => block.id === "acao")?.text;
      const second = read({ ...answers, "g.meta": right }).blocks.find((block) => block.id === "acao")?.text;
      expect(first).toBeTruthy();
      expect(first).toBe(second);
    }
  });
});

describe("a parte paga não repete a gratuita", () => {
  it("explica segurança contra liberdade uma vez e segue para a ação", () => {
    const answers: Answers = {
      scenario: "T",
      gender: "mulher",
      "t.contato": "nenhum",
      "t.pararam": "pediu",
      "t.tentou": "afastar",
      "t.desejo": "voltar",
      "g.meta": "should_i_keep_trying",
    };
    const report = synthesize(answers, "Bela", "Ines", youDate, theirDate, pronounsOf("ela"));
    if ("error" in report) throw new Error(report.error);
    const free = freeLines(report);
    const paid = paidSections(report).map((section) => section.text);
    const freeClash = free.find((line) => /liberdade/.test(line) && /cuidado|segurança|compromisso/.test(line)) ?? "";
    expect(freeClash.length).toBeGreaterThan(40);
    expect(paid.join("\n")).not.toContain(freeClash);
    expect(paid.join("\n")).not.toMatch(/Quando isso não é conversado/);
    expect(paidSections(report).filter((section) => section.chapter === 2).length).toBeLessThanOrEqual(2);
    const withoutNumbers = paid.filter((line) => !/número|Pelos números|primeira parte/.test(line)).join(" ");
    expect(withoutNumbers).toMatch(/não insista|limite/i);
    const preview = buildPreview(answers, "Bela", "Ines", youDate, theirDate, "simulated");
    if ("error" in preview) throw new Error(preview.error);
    const beforePrice = preview.offers.resposta.slice(0, -1).join(" ");
    expect(beforePrice).toMatch(/faz sentido tentar/);
    expect(beforePrice).toMatch(/como agir/);
    expect(beforePrice).toMatch(/atitudes/);
    expect(beforePrice).toMatch(/sem criar falsa esperança/);
    expect(preview.offers.resposta.at(-1)).toContain(PRICE_LABEL);
  });
});
