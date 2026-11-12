import type { DateParts } from "./types";

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const FIRST_YEAR = 1900;

export type DateValidation =
  | { ok: true }
  | { ok: false; reason: "incomplete" | "invalid" | "future"; message: string };

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number | null {
  if (month < 1 || month > 12) return null;
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1] ?? null;
}

export function validateBirthDate(parts: DateParts | null, today: Date): DateValidation {
  if (!parts || !parts.day || !parts.month || !parts.year) {
    return {
      ok: false,
      reason: "incomplete",
      message: "Falta dia, mês e ano.",
    };
  }

  if (parts.year < FIRST_YEAR || parts.month < 1 || parts.month > 12 || parts.day < 1) {
    return {
      ok: false,
      reason: "invalid",
      message: "Essa data não entra na conta. Confere dia, mês e ano.",
    };
  }

  const days = daysInMonth(parts.year, parts.month);
  if (!days || parts.day > days) {
    if (parts.month === 2) {
      const limit = isLeapYear(parts.year) ? 29 : 28;
      return {
        ok: false,
        reason: "invalid",
        message: `Fevereiro de ${parts.year} tem ${limit} dias. Confere um dia que existe nesse mês.`,
      };
    }
    const monthName = MONTHS[parts.month - 1] ?? "Esse mês";
    return {
      ok: false,
      reason: "invalid",
      message: `${monthName} tem ${days} dias. Confere um dia que existe nesse mês.`,
    };
  }

  const born = new Date(parts.year, parts.month - 1, parts.day);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (born.getTime() > startOfToday.getTime()) {
    return {
      ok: false,
      reason: "future",
      message: "Essa data ainda não chegou. A leitura usa datas de nascimento que já aconteceram.",
    };
  }

  return { ok: true };
}

export function formatDate(date: DateParts): string {
  const day = String(date.day).padStart(2, "0");
  const month = String(date.month).padStart(2, "0");
  return `${day}/${month}/${date.year}`;
}
