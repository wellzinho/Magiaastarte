import { answersOf } from "./flow";
import type { Answers, DateParts, SessionState } from "./types";

/** Contrato enviado a `/api/leitura/previa` e `/api/leitura/pedido`. */
export type ReadingPayload = {
  sessionId: string;
  answers: Answers;
  yourName: string;
  theirName: string;
  yourDate: DateParts | null;
  theirDate: DateParts | null;
  formatId?: string;
};

type ReadingState = Pick<
  SessionState,
  "sessionId" | "choices" | "yourName" | "theirName" | "yourDate" | "theirDate" | "formatId"
>;

/**
 * Monta o JSON do chat. `formatId` só entra quando já existe entrega escolhida.
 * `null` não pode ir no corpo: o servidor rejeitava qualquer formatId não-string.
 */
export function readingPayload(state: ReadingState): ReadingPayload {
  const payload: ReadingPayload = {
    sessionId: state.sessionId ?? "",
    answers: answersOf(state as SessionState),
    yourName: state.yourName ?? "",
    theirName: state.theirName ?? "",
    yourDate: state.yourDate,
    theirDate: state.theirDate,
  };
  if (typeof state.formatId === "string" && state.formatId.length > 0) {
    payload.formatId = state.formatId;
  }
  return payload;
}

export function previewAttemptKey(state: ReadingState): string {
  const payload = readingPayload(state);
  return JSON.stringify({
    sessionId: payload.sessionId,
    answers: payload.answers,
    yourName: payload.yourName,
    theirName: payload.theirName,
    yourDate: payload.yourDate,
    theirDate: payload.theirDate,
    formatId: payload.formatId ?? null,
  });
}

export function shouldFetchPreview(input: {
  sessionReady: boolean;
  hasPreview: boolean;
  previewError: boolean;
  profileReady: boolean;
  hasSession: boolean;
  hasNames: boolean;
  hasDates: boolean;
  attemptKey: string;
  blockedKey: string | null;
}): boolean {
  if (!input.sessionReady || input.hasPreview || input.previewError) return false;
  if (!input.profileReady || !input.hasSession || !input.hasNames || !input.hasDates) return false;
  if (input.blockedKey === input.attemptKey) return false;
  return true;
}
