import { quizComplete } from "../content/steps";
import { validateBirthDate } from "../domain/dates";
import type { Answers, DateParts } from "../domain/types";
import { nameNumbers } from "./calc";

export type ReadingRequest = {
  sessionId: string;
  answers: Answers;
  yourName: string;
  theirName: string;
  yourDate: DateParts;
  theirDate: DateParts;
  formatId?: string;
};

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export type ParseFailure = { error: string; code: PreviewInputCode };

export type PreviewInputCode =
  | "MDA_PREVIEW_INVALID_INPUT"
  | "MDA_PREVIEW_INVALID_YOUR_NAME"
  | "MDA_PREVIEW_INVALID_THEIR_NAME"
  | "MDA_PREVIEW_INVALID_YOUR_BIRTH_DATE"
  | "MDA_PREVIEW_INVALID_THEIR_BIRTH_DATE"
  | "MDA_PREVIEW_MISSING_FIELD"
  | "MDA_PREVIEW_INVALID_ENUM";

function fail(code: PreviewInputCode, error: string): ParseFailure {
  return { error, code };
}

export function parseReadingRequest(value: unknown, today: Date): ReadingRequest | ParseFailure {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fail("MDA_PREVIEW_INVALID_INPUT", "Pedido inválido.");
  const body = value as Record<string, unknown>;
  const keys = Object.keys(body);
  if (keys.length > 12) return fail("MDA_PREVIEW_INVALID_INPUT", "Pedido inválido.");
  if (typeof body.sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.sessionId)) {
    return fail("MDA_PREVIEW_MISSING_FIELD", "Sessão inválida.");
  }
  const answers = readAnswers(body.answers);
  if (!answers || !quizComplete(answers)) return fail("MDA_PREVIEW_INVALID_ENUM", "O quiz ainda não está completo.");
  if (typeof body.yourName !== "string") return fail("MDA_PREVIEW_INVALID_YOUR_NAME", "Faltam os nomes.");
  if (typeof body.theirName !== "string") return fail("MDA_PREVIEW_INVALID_THEIR_NAME", "Faltam os nomes.");
  const yourName = cleanName(body.yourName);
  if (!yourName) return fail("MDA_PREVIEW_INVALID_YOUR_NAME", "Faltam os nomes.");
  const theirName = cleanName(body.theirName);
  if (!theirName) return fail("MDA_PREVIEW_INVALID_THEIR_NAME", "Faltam os nomes.");
  const yourDate = readDate(body.yourDate);
  if (!yourDate || !validateBirthDate(yourDate, today).ok) return fail("MDA_PREVIEW_INVALID_YOUR_BIRTH_DATE", "Faltam datas válidas.");
  const theirDate = readDate(body.theirDate);
  if (!theirDate || !validateBirthDate(theirDate, today).ok) return fail("MDA_PREVIEW_INVALID_THEIR_BIRTH_DATE", "Faltam datas válidas.");
  if ("error" in nameNumbers(yourName)) return fail("MDA_PREVIEW_INVALID_YOUR_NAME", "Usa uma grafia em alfabeto latino que você reconheça.");
  if ("error" in nameNumbers(theirName)) return fail("MDA_PREVIEW_INVALID_THEIR_NAME", "Usa uma grafia em alfabeto latino que você reconheça.");
  const formatId = readOptionalFormatId(body.formatId);
  if ("error" in formatId) return formatId;
  return {
    sessionId: body.sessionId,
    answers,
    yourName,
    theirName,
    yourDate,
    theirDate,
    formatId: formatId.value,
  };
}

/** Ausente, null ou string vazia = prévia ainda sem entrega. Só string inválida é erro. */
function readOptionalFormatId(value: unknown): { value: string | undefined } | ParseFailure {
  if (value === undefined || value === null || value === "") return { value: undefined };
  if (typeof value !== "string") return fail("MDA_PREVIEW_INVALID_ENUM", "Falta a entrega.");
  const token = cleanToken(value, 64);
  if (!token) return fail("MDA_PREVIEW_INVALID_ENUM", "Falta a entrega.");
  return { value: token };
}

function cleanName(value: string): string | null {
  const normalized = value.normalize("NFC").trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > 120) return null;
  if (CONTROL_CHARS.test(normalized)) return null;
  return normalized;
}

function cleanToken(value: string, max: number): string | null {
  const normalized = value.normalize("NFC").trim();
  if (!normalized || normalized.length > max) return null;
  if (CONTROL_CHARS.test(normalized)) return null;
  return normalized;
}

function readAnswers(value: unknown): Answers | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (entries.length > 40) return null;
  const answers: Answers = {};
  for (const [key, item] of entries) {
    if (key.length > 40 || typeof item !== "string" || item.length > 80) return null;
    if (CONTROL_CHARS.test(key) || CONTROL_CHARS.test(item)) return null;
    answers[key.normalize("NFC")] = item.normalize("NFC");
  }
  return answers;
}

function readDate(value: unknown): DateParts | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const date = value as DateParts;
  if (!Number.isInteger(date.day) || !Number.isInteger(date.month) || !Number.isInteger(date.year)) return null;
  if (date.day < 1 || date.day > 31 || date.month < 1 || date.month > 12) return null;
  if (date.year < 1900 || date.year > new Date().getFullYear()) return null;
  return { day: date.day, month: date.month, year: date.year };
}
