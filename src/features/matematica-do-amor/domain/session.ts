import { validateBirthDate } from "./dates";
import { phaseOf, reduceSession } from "./flow";
import { validateFullName } from "./names";
import { initialState, type DateParts, type SessionState } from "./types";

export const SESSION_KEY = "astarte.matematica-do-amor.v5";

export function serializeSession(state: SessionState): string {
  const stored = { ...state, blocks: null, figures: null, readAt: null, preview: null, payment: "idle" as const, previewError: false };
  return JSON.stringify({ version: 5, state: stored });
}

export function parseSession(raw: string, today: Date): SessionState | null {
  try {
    const data = JSON.parse(raw) as { version?: unknown; state?: unknown };
    if (data.version !== 5 || !isLooseState(data.state)) return null;
    return sanitize(data.state, today);
  } catch {
    return null;
  }
}

export function loadSession(today: Date): SessionState | null {
  if (typeof window === "undefined") return null;
  try {
    let raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      // Migração única: jornadas antigas em localStorage passam para sessionStorage e são removidas.
      raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        window.sessionStorage.setItem(SESSION_KEY, raw);
        window.localStorage.removeItem(SESSION_KEY);
      }
    }
    if (!raw) return null;
    return parseSession(raw, today);
  } catch {
    return null;
  }
}

export function saveSession(state: SessionState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, serializeSession(state));
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // The conversation keeps going in memory if storage is blocked.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing else to clear.
  }
}

export function sanitize(input: SessionState, today: Date): SessionState {
  let state = initialState;

  for (const choice of input.choices) {
    if (!choice || typeof choice.stepId !== "string" || typeof choice.optionId !== "string") break;
    const next = reduceSession(state, {
      type: "choose",
      stepId: choice.stepId,
      optionId: choice.optionId,
    });
    if (next === state) break;
    state = next;
  }

  if (typeof input.sessionId === "string" && /^[0-9a-f-]{36}$/i.test(input.sessionId)) {
    state = reduceSession(state, { type: "set-session", sessionId: input.sessionId });
  }

  if (typeof input.yourName === "string" && phaseOf(state).name === "your-name" && validateFullName(input.yourName).ok) {
    state = reduceSession(state, { type: "submit-name", who: "you", name: input.yourName });
  }
  if (isDateParts(input.yourDate) && phaseOf(state).name === "your-date" && validateBirthDate(input.yourDate, today).ok) {
    state = reduceSession(state, { type: "submit-date", who: "you", date: input.yourDate, today });
  }
  if (input.unknownField === "their-name" && phaseOf(state).name === "their-name") {
    state = reduceSession(state, { type: "unknown-data", field: "their-name" });
  }
  if (typeof input.theirName === "string" && phaseOf(state).name === "their-name" && validateFullName(input.theirName).ok) {
    state = reduceSession(state, { type: "submit-name", who: "them", name: input.theirName });
  }
  if (input.unknownField === "their-date" && phaseOf(state).name === "their-date") {
    state = reduceSession(state, { type: "unknown-data", field: "their-date" });
  }
  if (isDateParts(input.theirDate) && phaseOf(state).name === "their-date" && validateBirthDate(input.theirDate, today).ok) {
    state = reduceSession(state, { type: "submit-date", who: "them", date: input.theirDate, today });
  }
  if (state.unknownField && input.dataHeld === true && phaseOf(state).name === "unknown-data") {
    const next = reduceSession(state, { type: "hold-data" });
    if (next !== state) state = next;
  }

  if (typeof input.orderId === "string") state = { ...state, orderId: input.orderId };

  if (state.theirDateSet && typeof input.formatId === "string" && (phaseOf(state).name === "format" || phaseOf(state).name === "loading" || phaseOf(state).name === "free" || phaseOf(state).name === "confirm-format")) {
    state = { ...state, formatId: input.formatId };
  }

  if (input.prepDone === true) state = { ...state, prepDone: true, freeContinued: true };
  if (input.freeContinued === true) state = { ...state, freeContinued: true };
  if (state.formatId && input.holdPreview === true) state = { ...state, holdPreview: true };
  if (input.awaitingPixEmail === true && state.theirDateSet) {
    state = { ...state, awaitingPixEmail: true, pixRetry: input.pixRetry === true, prepDone: true, freeContinued: true };
  }
  if (state.orderId) state = { ...state, payment: "idle", blocks: null, preview: null, prepDone: true, freeContinued: true };

  return state;
}

function isLooseState(value: unknown): value is SessionState {
  if (!value || typeof value !== "object") return false;
  return Array.isArray((value as SessionState).choices);
}

function isDateParts(value: unknown): value is DateParts {
  if (!value || typeof value !== "object") return false;
  const date = value as DateParts;
  return Number.isInteger(date.day) && Number.isInteger(date.month) && Number.isInteger(date.year);
}
