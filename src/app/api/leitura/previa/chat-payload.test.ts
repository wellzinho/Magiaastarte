import { beforeEach, describe, expect, it } from "vitest";
import { quizPlan } from "@/features/matematica-do-amor/content/steps";
import { reduceSession } from "@/features/matematica-do-amor/domain/flow";
import { firstName } from "@/features/matematica-do-amor/domain/names";
import { present } from "@/features/matematica-do-amor/domain/present";
import {
  previewAttemptKey,
  readingPayload,
  shouldFetchPreview,
} from "@/features/matematica-do-amor/domain/reading-request";
import { initialState, type Answers } from "@/features/matematica-do-amor/domain/types";
import { nameNumbers } from "@/features/matematica-do-amor/server/calc";
import { parseReadingRequest } from "@/features/matematica-do-amor/server/input";
import { authedJsonRequest, resetSecurityMemory } from "@/lib/security/test-helpers";
import { POST } from "./route";

const sessionId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const today = new Date(2026, 10, 12);
const fullYou = "Wellington Silveira Costa";
const fullThem = "Roberto Almeida Souza";

function chatStateAfterSecondDate() {
  const answers: Answers = {};
  for (let turn = 0; turn < 20; turn += 1) {
    const pending = quizPlan(answers).find((step) => !answers[step.id]);
    if (!pending) break;
    answers[pending.id] = pending.options[0]?.id ?? "";
  }
  let state = reduceSession(initialState, { type: "set-session", sessionId });
  for (const [stepId, optionId] of Object.entries(answers)) {
    state = reduceSession(state, { type: "choose", stepId, optionId });
  }
  state = reduceSession(state, { type: "submit-name", who: "you", name: fullYou });
  state = reduceSession(state, { type: "submit-date", who: "you", date: { day: 12, month: 3, year: 1990 }, today });
  state = reduceSession(state, { type: "submit-name", who: "them", name: fullThem });
  state = reduceSession(state, { type: "submit-date", who: "them", date: { day: 5, month: 8, year: 1988 }, today });
  return state;
}

describe("payload real do chat na prévia", () => {
  beforeEach(() => {
    resetSecurityMemory();
    process.env.ORDER_STORE_MODE = "memory";
    process.env.MERCADO_PAGO_MODE = "test";
    process.env.MERCADO_PAGO_ACCESS_TOKEN = "test-token";
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
  });

  it("aceita o JSON do chat com nomes completos e formatId ausente", async () => {
    const state = chatStateAfterSecondDate();
    expect(state.yourName).toBe(fullYou);
    expect(state.theirName).toBe(fullThem);
    expect(state.formatId).toBeNull();

    const payload = readingPayload(state);
    expect(payload.yourName).toBe(fullYou);
    expect(payload.theirName).toBe(fullThem);
    expect("formatId" in payload).toBe(false);

    const parsed = parseReadingRequest(payload, today);
    expect("error" in parsed).toBe(false);
    if ("error" in parsed) return;
    expect(parsed.yourName).toBe(fullYou);
    expect(parsed.theirName).toBe(fullThem);

    const youFull = nameNumbers(parsed.yourName);
    const youFirst = nameNumbers(firstName(parsed.yourName));
    expect("error" in youFull || "error" in youFirst).toBe(false);
    if (!("error" in youFull) && !("error" in youFirst)) {
      expect(youFull.motivation).not.toBe(youFirst.motivation);
    }

    const shown = present(state, today).messages.map((message) => message.text).join("\n");
    expect(shown).toContain("Wellington");
    expect(shown).toContain("Roberto");
    expect(shown).not.toContain("Silveira");
    expect(shown).not.toContain("Almeida");

    const response = await POST(await authedJsonRequest("http://localhost/api/leitura/previa", sessionId, payload));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { bubbles?: string[] };
    expect((body.bubbles?.length ?? 0) > 0).toBe(true);
  });

  it("aceita formatId null, como o JSON.stringify antigo enviava", () => {
    const state = chatStateAfterSecondDate();
    const legacy = { ...readingPayload(state), formatId: null };
    const parsed = parseReadingRequest(legacy, today);
    expect("error" in parsed).toBe(false);
  });

  it("rejeita data inválida com código técnico sem dados pessoais", () => {
    const state = chatStateAfterSecondDate();
    const payload = readingPayload(state);
    const parsed = parseReadingRequest({ ...payload, theirDate: { day: 31, month: 2, year: 1990 } }, today);
    expect(parsed).toMatchObject({ code: "MDA_PREVIEW_INVALID_THEIR_BIRTH_DATE" });
    expect(JSON.stringify(parsed)).not.toMatch(/Wellington|Roberto|Silveira|Almeida/);
  });

  it("não repete a prévia automaticamente depois de um 4xx da mesma tentativa", () => {
    const state = chatStateAfterSecondDate();
    const attemptKey = previewAttemptKey(state);
    const base = {
      sessionReady: true,
      hasPreview: false,
      previewError: false,
      profileReady: true,
      hasSession: true,
      hasNames: true,
      hasDates: true,
      attemptKey,
      blockedKey: null as string | null,
    };
    expect(shouldFetchPreview(base)).toBe(true);
    expect(shouldFetchPreview({ ...base, blockedKey: attemptKey })).toBe(false);
    expect(shouldFetchPreview({ ...base, previewError: true, blockedKey: null })).toBe(false);
    expect(shouldFetchPreview({ ...base, blockedKey: null })).toBe(true);
  });
});
