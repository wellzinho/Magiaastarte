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

export function parseReadingRequest(value: unknown, today: Date): ReadingRequest | { error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "Pedido inválido." };
  const body = value as Record<string, unknown>;
  const keys = Object.keys(body);
  if (keys.length > 12) return { error: "Pedido inválido." };
  if (typeof body.sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.sessionId)) return { error: "Sessão inválida." };
  const answers = readAnswers(body.answers);
  if (!answers || !quizComplete(answers)) return { error: "O quiz ainda não está completo." };
  if (typeof body.yourName !== "string" || typeof body.theirName !== "string") return { error: "Faltam os nomes." };
  const yourName = cleanName(body.yourName);
  const theirName = cleanName(body.theirName);
  if (!yourName || !theirName) return { error: "Faltam os nomes." };
  const yourDate = readDate(body.yourDate);
  const theirDate = readDate(body.theirDate);
  if (!yourDate || !theirDate || !validateBirthDate(yourDate, today).ok || !validateBirthDate(theirDate, today).ok) {
    return { error: "Faltam datas válidas." };
  }
  if ("error" in nameNumbers(yourName) || "error" in nameNumbers(theirName)) {
    return { error: "Usa uma grafia em alfabeto latino que você reconheça." };
  }
  const formatId = typeof body.formatId === "string" ? cleanToken(body.formatId, 64) : undefined;
  if (body.formatId !== undefined && !formatId) return { error: "Falta a entrega." };
  return { sessionId: body.sessionId, answers, yourName, theirName, yourDate, theirDate, formatId: formatId ?? undefined };
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
