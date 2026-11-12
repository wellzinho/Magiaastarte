import { describe, expect, it } from "vitest";
import { initialState } from "./types";
import { nextRevealCount, revealDelay, sessionHasProgress } from "./reveal";

describe("revelação por turno", () => {
  it("começa no primeiro balão e avança sem pular o histórico", () => {
    expect(nextRevealCount(["a", "b", "c"], ["a", "b", "c"], 1)).toBe(1);
    expect(nextRevealCount(["a", "b", "c"], ["a", "b", "c", "voce", "pergunta"], 3)).toBe(3);
    expect(revealDelay("user", false)).toBe(0);
    expect(revealDelay("assistant", false)).toBeGreaterThanOrEqual(450);
    expect(revealDelay("assistant", false)).toBeLessThanOrEqual(1100);
    expect(revealDelay({ role: "assistant", text: "uma frase curta aqui agora", kind: "pix" }, false)).toBe(0);
    expect(revealDelay({ role: "assistant", text: "palavra ".repeat(40), instant: true }, false)).toBe(0);
    expect(revealDelay("assistant", true)).toBe(0);
  });

  it("volta o cursor quando o ramo muda e restaura a sessão já vista", () => {
    const full = ["a", "b", "c", "voce", "pergunta", "ele"];
    const back = ["a", "b", "c"];
    expect(nextRevealCount(full, back, 6)).toBe(3);
    expect(nextRevealCount(back, ["a", "b", "c", "outra"], 3)).toBe(3);
    expect(nextRevealCount([], ["a", "b", "c"], 1)).toBe(1);
    expect(sessionHasProgress(initialState)).toBe(false);
    expect(sessionHasProgress({ ...initialState, choices: [{ stepId: "scenario", optionId: "ended" }] })).toBe(true);
  });
});
