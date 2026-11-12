import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateBirthDate } from "../domain/dates";
import { validateFullName } from "../domain/names";
import { CALC_VERSION, calculationNote, coupleBase, letterValue, lifePath, nameNumbers, reduceToDigit } from "./calc";
import { solarProfile } from "./solar";

const today = new Date(2026, 10, 10);

describe("cálculo pitagórico do casal", () => {
  it("separa motivação, impressão e expressão e guarda o mestre", () => {
    const ana = nameNumbers("Ana Silva");
    expect("error" in ana).toBe(false);
    if ("error" in ana || !ana.motivation || !ana.impression) throw new Error("Ana Silva deveria fechar.");
    expect(ana.motivation.total).toBe(12);
    expect(ana.motivation.base).toBe(3);
    expect(ana.impression.total).toBe(13);
    expect(ana.expression.total).toBe(ana.motivation.total + ana.impression.total);
    expect(ana.expression.base).toBe(7);
    const path = lifePath({ day: 14, month: 7, year: 1992 });
    expect(path).toMatchObject({ total: 33, base: 6, master: 33 });
    const eleven = lifePath({ day: 15, month: 3, year: 1991 });
    expect(eleven.steps).toEqual([29, 11, 2]);
    expect(eleven.master).toBe(11);
    expect(eleven.base).toBe(2);
    expect(lifePath({ day: 15, month: 3, year: 1994 }).base).toBe(5);
    expect(coupleBase(5, 6).master).toBe(11);
    expect(coupleBase(5, 6).base).toBe(2);
    expect(CALC_VERSION).toBe("pitagorica-casal-v2");
  });

  it("trata acento, partícula e nome sem vogal", () => {
    const joao = nameNumbers("João");
    const plain = nameNumbers("Joao");
    expect(JSON.stringify(joao)).toBe(JSON.stringify(plain));
    const spaced = nameNumbers("Ana da Silva");
    const glued = nameNumbers("AnadaSilva");
    expect("error" in spaced || "error" in glued).toBe(false);
    if (!("error" in spaced) && !("error" in glued)) expect(spaced.expression.total).toBe(glued.expression.total);
    expect(validateFullName("Ana").ok).toBe(true);
    expect(nameNumbers("Ana 2")).toEqual({ error: "unmapped" });
    expect(letterValue("Y")).toBe(7);
    const noVowels = nameNumbers("Brynn Kyrk");
    expect("error" in noVowels).toBe(false);
    if (!("error" in noVowels)) {
      expect(noVowels.motivation).toBeNull();
      expect(noVowels.impression?.total).toBe(noVowels.expression.total);
    }
  });

  it("rejeita data futura, vazia, 31/04 e 29/02/1900, e aceita 29/02/2000", () => {
    expect(validateBirthDate({ day: 29, month: 2, year: 2000 }, today).ok).toBe(true);
    const nineteen = validateBirthDate({ day: 29, month: 2, year: 1900 }, today);
    expect(nineteen.ok).toBe(false);
    if (!nineteen.ok) expect(nineteen.message).toContain("28");
    expect(validateBirthDate({ day: 31, month: 4, year: 1990 }, today).ok).toBe(false);
    expect(validateBirthDate({ day: 1, month: 1, year: 2099 }, today).ok).toBe(false);
    expect(() => reduceToDigit(0)).toThrow();
  });

  it("não presume signo na troca e explica a conta sem o nome completo", () => {
    expect(solarProfile({ day: 21, month: 3, year: 1992 })).toEqual({ unavailable: "boundary" });
    expect(solarProfile({ day: 14, month: 7, year: 1992 })).toMatchObject({ sign: "cancer" });
    const you = nameNumbers("Ana Silva");
    const them = nameNumbers("João");
    if ("error" in you || "error" in them) throw new Error("nomes");
    const note = calculationNote(you, lifePath({ day: 14, month: 7, year: 1992 }), them, lifePath({ day: 15, month: 3, year: 1991 }));
    expect(note).toContain("Impressão");
    expect(note).toContain("consoante");
    expect(note).toContain("signo solar");
    expect(note).not.toContain("Ana Silva");
    expect(note).toContain("não equivale a uma sinastria completa");
  });

  it("não leva o catálogo pago para o componente", () => {
    const source = readFileSync(new URL("../components/chat/ChatExperience.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("server/catalog");
    expect(source).not.toContain("server/synthesis");
  });
});
