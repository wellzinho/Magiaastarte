import type { DateParts } from "../domain/types";
import { lifePath, nameNumbers } from "./calc";

export type NumberAudit = {
  fullNameUsed: string;
  birthDateUsed: string;
  motivationRaw: number | null;
  motivationBase: number | null;
  impressionRaw: number | null;
  impressionBase: number | null;
  expressionRaw: number;
  expressionBase: number;
  lifePathRaw: number;
  lifePathBase: number;
};

function dateUsed(date: DateParts): string {
  const day = String(date.day).padStart(2, "0");
  const month = String(date.month).padStart(2, "0");
  return `${day}/${month}/${date.year}`;
}

/** Cada chamada devolve um objeto novo. O perfil de uma pessoa não é o da outra. */
export function auditPerson(fullName: string, date: DateParts): NumberAudit | { error: string } {
  const numbers = nameNumbers(fullName);
  if ("error" in numbers) return { error: "Usa uma grafia em alfabeto latino que você reconheça." };
  const path = lifePath(date);
  return {
    fullNameUsed: fullName,
    birthDateUsed: dateUsed(date),
    motivationRaw: numbers.motivation?.total ?? null,
    motivationBase: numbers.motivation?.base ?? null,
    impressionRaw: numbers.impression?.total ?? null,
    impressionBase: numbers.impression?.base ?? null,
    expressionRaw: numbers.expression.total,
    expressionBase: numbers.expression.base,
    lifePathRaw: path.total,
    lifePathBase: path.base,
  };
}
