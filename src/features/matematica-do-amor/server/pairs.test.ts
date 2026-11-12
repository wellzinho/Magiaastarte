import { describe, expect, it } from "vitest";
import type { Answers, DateParts } from "../domain/types";
import { buildDocument } from "./assemble";
import { nameNumbers } from "./calc";
import { approachFor, decide } from "./decision";
import { auditPerson } from "./profile";
import { PAIRS, SAME, pairKey, pairOf, personalizeBridge, sharedMotivationText } from "./pairs";
import { synthesize } from "./synthesis";
import { pronounsOf } from "../domain/pronouns";
import { storyFlags } from "../domain/facts";

const date = (day: number, month: number, year: number): DateParts => ({ day, month, year });
const youDate = date(14, 7, 1992);
const theirDate = date(15, 3, 1991);

const PARTNER_BY_MOTIVATION: Record<number, string> = {
  1: "Ia",
  2: "Ana",
  3: "Otto",
  4: "Lua",
  5: "Ines",
  6: "Bela",
  7: "Olga",
  8: "Joana",
  9: "Iris",
};

function motivation(name: string): number {
  const numbers = nameNumbers(name);
  if ("error" in numbers || !numbers.motivation) throw new Error(name);
  return numbers.motivation.base;
}

describe("auditoria dos perfis", () => {
  it("não reutiliza o objeto e separa nomes diferentes", () => {
    const ana = auditPerson("Ana Costa", youDate);
    const ines = auditPerson("Ines Costa", theirDate);
    if ("error" in ana || "error" in ines) throw new Error("auditoria");
    expect(ana).not.toBe(ines);
    expect(ana.fullNameUsed).toBe("Ana Costa");
    expect(ines.fullNameUsed).toBe("Ines Costa");
    expect(ana.motivationBase).not.toBe(ines.motivationBase);
    const first = synthesize({ scenario: "T", gender: "homem", "t.contato": "nenhum", "t.pararam": "parou", "t.tentou": "nada", "t.desejo": "abertura" }, "Ana", "Ines", youDate, theirDate, pronounsOf("ela"));
    const same = synthesize({ scenario: "T", gender: "homem", "t.contato": "nenhum", "t.pararam": "parou", "t.tentou": "nada", "t.desejo": "abertura" }, "Carolina", "Joana", youDate, theirDate, pronounsOf("ela"));
    if ("error" in first || "error" in same) throw new Error("leitura");
    expect(first.youAudit.motivationBase).toBe(2);
    expect(first.theirAudit.motivationBase).toBe(5);
    expect(same.youAudit.motivationBase).toBe(same.theirAudit.motivationBase);
    expect(same.youAudit).not.toBe(same.theirAudit);
    expect(first.freeTexts.join(" ")).not.toBe(same.freeTexts.join(" "));
  });
});

describe("números iguais", () => {
  it("usa um bloco compartilhado e a expressão canônica uma vez", () => {
    for (let number = 1; number <= 9; number += 1) {
      const text = sharedMotivationText(number);
      const joined = `${text.canonical} ${text.next}`;
      expect(joined).not.toMatch(/enquanto|por outro lado|já a outra/i);
      const canonical = SAME[number]?.need ?? "";
      expect(joined.split(canonical).length - 1).toBe(1);
      expect(text.next.toLowerCase()).not.toContain(canonical);
    }
    const report = synthesize(
      { scenario: "T", gender: "mulher", "t.contato": "voltamos", "t.falaram": "sim", "t.quem": "dois", "t.tentou": "aconteceu", "t.desejo": "voltar" },
      "Carolina",
      "Joana",
      youDate,
      theirDate,
      pronounsOf("ela"),
    );
    if ("error" in report) throw new Error(report.error);
    const free = report.freeTexts.join("\n");
    expect(free.split("respeito, resultado e poder de decisão").length - 1).toBe(1);
    expect(free).not.toMatch(/enquanto|por outro lado|já a outra pessoa/i);
    expect(free).toContain("disputa por controle");
  });
});

describe("45 combinações", () => {
  it("cobre todos os pares e não depende da ordem", () => {
    expect(Object.keys(PAIRS)).toHaveLength(45);
    const bridges = new Set<string>();
    for (let left = 1; left <= 9; left += 1) {
      for (let right = left; right <= 9; right += 1) {
        const row = pairOf(left, right);
        expect(row.meeting.length).toBeGreaterThan(5);
        expect(row.risk.length).toBeGreaterThan(5);
        expect(row.bridge).not.toMatch(/anote|liste duas|espere trinta dias/i);
        expect(pairOf(right, left)).toEqual(row);
        expect(pairKey(left, right)).toBe(pairKey(right, left));
        bridges.add(row.bridge);
      }
    }
    expect(bridges.size).toBe(45);
    const named = personalizeBridge(pairOf(1, 2).bridge, 1, "Ana", 2, "Lia");
    expect(named).toContain("Ana");
    expect(named).toContain("Lia");
    expect(personalizeBridge(pairOf(1, 2).bridge, 2, "Lia", 1, "Ana")).toContain("Ana convida");
  });
});

describe("os fatos decidem", () => {
  const base: Answers = { scenario: "T", gender: "homem" };

  it("separa os cinco cenários do par 2×5", () => {
    expect(motivation("Ana")).toBe(2);
    expect(motivation("Ines")).toBe(5);
    const cases: Array<[Answers, string]> = [
      [{ ...base, "t.contato": "nenhum", "t.pararam": "pediu", "t.tentou": "afastar", "t.desejo": "voltar" }, "do_not_insist"],
      [{ ...base, "t.contato": "nenhum", "t.pararam": "parou", "t.tentou": "nada", "t.desejo": "abertura" }, "one_clear_attempt"],
      [{ ...base, "t.contato": "estranho", "t.estranho": "esfria", "t.quem": "eu", "t.tentou": "leve", "t.desejo": "abertura" }, "observe_before_acting"],
      [{ ...base, "t.contato": "voltamos", "t.falaram": "sim", "t.quem": "dois", "t.tentou": "aconteceu", "t.desejo": "voltar" }, "talk_now"],
      [{ scenario: "R", gender: "homem", "r.status": "namoro", "r.falta": "tempo", "r.fala": "escuta", "r.distancia": "combina", "r.acordo_geral": "ambos", "r.tentou": "tempo", "r.desejo": "proximidade" }, "continue_with_conditions"],
    ];
    const verdicts = cases.map(([answers, expected]) => {
      expect(decide(storyFlags(answers), answers)).toBe(expected);
      const report = synthesize(answers, "Ana", "Ines", youDate, theirDate, pronounsOf("ela"));
      if ("error" in report) throw new Error(report.error);
      return report.directAnswer;
    });
    expect(new Set(verdicts).size).toBe(5);
    const mutual = synthesize(cases[3][0], "Ana", "Ines", youDate, theirDate, pronounsOf("ela"));
    if ("error" in mutual) throw new Error(mutual.error);
    expect(mutual.directAnswer).toMatch(/vale conversar, mas não pedir uma volta imediata/);
  });

  it("muda a fala conforme o número da outra pessoa na tentativa clara", () => {
    const answers: Answers = { scenario: "T", gender: "mulher", "t.contato": "nenhum", "t.pararam": "parou", "t.tentou": "nada", "t.desejo": "abertura" };
    const speeches = new Set<string>();
    for (let number = 1; number <= 9; number += 1) {
      const approach = approachFor(number, pronounsOf("ela"));
      speeches.add(approach.speech);
      const report = synthesize(answers, "Ana", PARTNER_BY_MOTIVATION[number] ?? "Ana", youDate, theirDate, pronounsOf("ela"));
      if ("error" in report) throw new Error(report.error);
      expect(report.moduleId).toBe("one_clear_attempt");
      expect(report.speech).toBe(approach.speech);
      expect(motivation(PARTNER_BY_MOTIVATION[number] ?? "")).toBe(number);
    }
    expect(speeches.size).toBe(9);
    const document = buildDocument(answers, "Ana", "Olga", youDate, theirDate, "resposta");
    if ("error" in document) throw new Error(document.error);
    expect(document.blocks.map((block) => block.text).join(" ")).not.toMatch(/anote o que sente|liste duas mudanças|espere trinta dias/i);
  });
});
