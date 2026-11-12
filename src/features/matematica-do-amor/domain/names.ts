import { validateBirthDate } from "./dates";
import type { DateParts } from "./types";

export function validateFullName(value: string): { ok: true; name: string } | { ok: false; message: string } {
  const name = value.replace(/\s+/g, " ").trim();
  if (!name) return { ok: false, message: "Escreve o nome de nascimento." };
  const stripped = name.normalize("NFD").replace(/\p{M}/gu, "");
  let letters = "";
  for (const char of stripped) {
    if (/[A-Za-z]/.test(char)) letters += char;
    else if (char === " " || char === "'" || char === "’" || char === "-") continue;
    else return { ok: false, message: "Usa uma grafia em alfabeto latino que você reconheça. Confere antes de enviar." };
  }
  if (!letters) return { ok: false, message: "Escreve pelo menos uma letra do nome." };
  return { ok: true, name };
}

export function firstName(name: string | null): string {
  if (!name) return "";
  return name.trim().split(/\s+/)[0] ?? "";
}

export function parseBirthInput(
  raw: string,
  today: Date,
): { ok: true; date: DateParts } | { ok: false; message: string } {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) {
    return { ok: false, message: "Usa dia, mês e ano com oito números, no formato DD/MM/AAAA." };
  }
  const date = {
    day: Number(digits.slice(0, 2)),
    month: Number(digits.slice(2, 4)),
    year: Number(digits.slice(4)),
  };
  const check = validateBirthDate(date, today);
  if (!check.ok) return { ok: false, message: check.message };
  return { ok: true, date };
}

export function maskBirthInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
