import type { DateParts } from "../domain/types";

export const CALC_VERSION = "pitagorica-casal-v2";

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export type Reduced = {
  total: number;
  steps: number[];
  master: 11 | 22 | 33 | null;
  base: number;
  /** Igual a base. As tabelas do casal usam 1–9. */
  number: number;
};

export type NameNumbers = {
  letters: string;
  expression: Reduced;
  motivation: Reduced | null;
  impression: Reduced | null;
};

export function normalizeLatinName(raw: string): { letters: string; unmapped: boolean } {
  const stripped = raw.normalize("NFD").replace(/\p{M}/gu, "");
  let letters = "";
  let unmapped = false;
  for (const char of stripped) {
    if (/[A-Za-z]/.test(char)) letters += char.toUpperCase();
    else if (char === " " || char === "'" || char === "’" || char === "-") continue;
    else unmapped = true;
  }
  return { letters, unmapped };
}

export function reduceToDigit(total: number): Reduced {
  if (!Number.isInteger(total) || total < 1) {
    throw new Error("Entrada zero ou vazia não entra na redução.");
  }
  let current = total;
  const steps = [current];
  let master: 11 | 22 | 33 | null = null;
  while (current > 9) {
    if (current === 11 || current === 22 || current === 33) master = current;
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
    steps.push(current);
  }
  return { total, steps, master, base: current, number: current };
}

export function letterValue(letter: string): number {
  const code = letter.charCodeAt(0) - 65;
  if (code < 0 || code > 25) throw new Error("Letra fora do alfabeto latino.");
  return (code % 9) + 1;
}

function sumLetters(letters: string[]): Reduced | null {
  if (!letters.length) return null;
  return reduceToDigit(letters.reduce((sum, letter) => sum + letterValue(letter), 0));
}

export function nameNumbers(raw: string): NameNumbers | { error: "unmapped" | "empty" } {
  const { letters, unmapped } = normalizeLatinName(raw);
  if (unmapped) return { error: "unmapped" };
  if (!letters) return { error: "empty" };
  const chars = [...letters];
  const motivation = sumLetters(chars.filter((letter) => VOWELS.has(letter)));
  const impression = sumLetters(chars.filter((letter) => !VOWELS.has(letter)));
  const expression = reduceToDigit(chars.reduce((sum, letter) => sum + letterValue(letter), 0));
  return { letters, expression, motivation, impression };
}

/** Soma os dígitos de DDMMYYYY e reduz. 11, 22 e 33 ficam guardados; a tabela usa a base 1–9. */
export function lifePath(date: DateParts): Reduced {
  const digits = `${String(date.day).padStart(2, "0")}${String(date.month).padStart(2, "0")}${date.year}`;
  const total = digits.split("").reduce((sum, digit) => sum + Number(digit), 0);
  return reduceToDigit(total);
}

export function coupleBase(left: number, right: number): Reduced {
  return reduceToDigit(left + right);
}

export function masterNote(master: 11 | 22 | 33 | null): string | null {
  if (master === 11) return "O 11 apareceu antes de virar 2. Ele entra só como uma sensibilidade maior à parceria, sem promessa de ligação especial.";
  if (master === 22) return "O 22 apareceu antes de virar 4. Ele entra como capacidade de construir algo concreto, sem promessa especial.";
  if (master === 33) return "O 33 apareceu antes de virar 6. Ele entra como um peso maior de cuidado, sem promessa de alma gêmea.";
  return null;
}

export function calculationNote(you: NameNumbers, yourPath: Reduced, them: NameNumbers, theirPath: Reduced): string {
  const line = (profile: NameNumbers, path: Reduced, who: string) => {
    const motivation = profile.motivation ? profile.motivation.steps.join(" → ") : "não fecha, porque não há vogais; nenhum número foi inventado";
    const impression = profile.impression ? profile.impression.steps.join(" → ") : "não fecha, porque não há consoantes";
    return `${who}: Motivação ${motivation}; Impressão ${impression}; Expressão ${profile.expression.steps.join(" → ")}; Caminho ${path.steps.join(" → ")}.`;
  };
  return [
    "A Motivação soma as vogais. A Impressão soma as consoantes. A Expressão soma o nome inteiro e confere com a soma bruta das duas. O Caminho soma os dígitos da data.",
    "Y conta como consoante. Partículas como da, de e dos entram no nome.",
    "Quando a conta passa por 11, 22 ou 33, esse valor fica guardado e a tabela do casal usa a base de 1 a 9. Isso não é promessa de alma gêmea.",
    line(you, yourPath, "Seus números"),
    line(them, theirPath, "Os números da outra pessoa"),
    "A orientação usa numerologia pitagórica e, quando a data permite uma identificação segura, uma camada complementar do signo solar para observar ritmo e temperamento. Isso não equivale a uma sinastria completa.",
  ].join(" ");
}
