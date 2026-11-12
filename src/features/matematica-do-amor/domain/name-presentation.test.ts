import { describe, expect, it } from "vitest";
import { reduceSession } from "./flow";
import { firstName, validateFullName } from "./names";
import { present } from "./present";
import { initialState } from "./types";
import { nameNumbers } from "../server/calc";
import { buildPreview } from "../server/assemble";
import { quizPlan } from "../content/steps";
import type { Answers } from "./types";

function completeQuiz(): Answers {
  const answers: Answers = {};
  for (let turn = 0; turn < 20; turn += 1) {
    const pending = quizPlan(answers).find((step) => !answers[step.id]);
    if (!pending) return answers;
    answers[pending.id] = pending.options[0]?.id ?? "";
  }
  return answers;
}

describe("nome completo no cálculo e primeiro nome no chat", () => {
  it("mantém fullName no estado e usa firstName só na apresentação", () => {
    const fullYou = "Wellington Silveira Costa";
    const fullThem = "Roberto Almeida Souza";
    expect(validateFullName(fullYou).ok).toBe(true);
    expect(validateFullName(fullThem).ok).toBe(true);

    let state = initialState;
    // Avança o quiz até os nomes.
    const answers = completeQuiz();
    for (const [stepId, optionId] of Object.entries(answers)) {
      state = reduceSession(state, { type: "choose", stepId, optionId });
    }
    state = reduceSession(state, { type: "submit-name", who: "you", name: fullYou });
    expect(state.yourName).toBe(fullYou);
    expect(state.yourFirst).toBe("Wellington");
    state = reduceSession(state, {
      type: "submit-date",
      who: "you",
      date: { day: 12, month: 3, year: 1990 },
      today: new Date(2026, 10, 12),
    });
    state = reduceSession(state, { type: "submit-name", who: "them", name: fullThem });
    expect(state.theirName).toBe(fullThem);
    expect(state.theirFirst).toBe("Roberto");

    const view = present(state, new Date(2026, 10, 12));
    const joined = view.messages.map((message) => message.text).join("\n");
    expect(joined).toContain("Wellington");
    expect(joined).toContain("Roberto");
    expect(joined).not.toContain("Silveira");
    expect(joined).not.toContain("Almeida");
  });

  it("envia nome completo ao cálculo numerológico", () => {
    const fullYou = "Wellington Silveira Costa";
    const fullThem = "Roberto Almeida Souza";
    const youFull = nameNumbers(fullYou);
    const youFirstOnly = nameNumbers(firstName(fullYou));
    expect("error" in youFull).toBe(false);
    expect("error" in youFirstOnly).toBe(false);
    if ("error" in youFull || "error" in youFirstOnly) return;
    expect(youFull.motivation).not.toBe(youFirstOnly.motivation);

    const preview = buildPreview(
      completeQuiz(),
      fullYou,
      fullThem,
      { day: 12, month: 3, year: 1990 },
      { day: 5, month: 8, year: 1988 },
      "simulated",
    );
    expect("error" in preview).toBe(false);
    if ("error" in preview) return;
    expect(preview.calc).toBeTruthy();
    // O texto gratuito pode citar o primeiro nome; o cálculo embutido usa o full name.
    expect(JSON.stringify(preview)).not.toContain("MDA_PREVIEW");
  });
});
