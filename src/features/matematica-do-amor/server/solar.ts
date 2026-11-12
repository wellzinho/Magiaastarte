import type { DateParts } from "../domain/types";

export type ElementName = "fogo" | "terra" | "ar" | "agua";
export type ModalityName = "cardinal" | "fixo" | "mutavel";
export type SolarSign =
  | "aries"
  | "touro"
  | "gemeos"
  | "cancer"
  | "leao"
  | "virgem"
  | "libra"
  | "escorpiao"
  | "sagitario"
  | "capricornio"
  | "aquario"
  | "peixes";

export type SolarProfile = { sign: SolarSign; element: ElementName; modality: ModalityName };

const SIGNS: Array<{ sign: SolarSign; element: ElementName; modality: ModalityName; from: [number, number]; to: [number, number] }> = [
  { sign: "capricornio", element: "terra", modality: "cardinal", from: [12, 23], to: [1, 18] },
  { sign: "aquario", element: "ar", modality: "fixo", from: [1, 21], to: [2, 17] },
  { sign: "peixes", element: "agua", modality: "mutavel", from: [2, 20], to: [3, 19] },
  { sign: "aries", element: "fogo", modality: "cardinal", from: [3, 22], to: [4, 18] },
  { sign: "touro", element: "terra", modality: "fixo", from: [4, 21], to: [5, 19] },
  { sign: "gemeos", element: "ar", modality: "mutavel", from: [5, 22], to: [6, 19] },
  { sign: "cancer", element: "agua", modality: "cardinal", from: [6, 22], to: [7, 21] },
  { sign: "leao", element: "fogo", modality: "fixo", from: [7, 24], to: [8, 21] },
  { sign: "virgem", element: "terra", modality: "mutavel", from: [8, 24], to: [9, 21] },
  { sign: "libra", element: "ar", modality: "cardinal", from: [9, 24], to: [10, 21] },
  { sign: "escorpiao", element: "agua", modality: "fixo", from: [10, 24], to: [11, 20] },
  { sign: "sagitario", element: "fogo", modality: "mutavel", from: [11, 23], to: [12, 20] },
];

function dayValue(month: number, day: number): number {
  return month * 100 + day;
}

function inRange(month: number, day: number, from: [number, number], to: [number, number]): boolean {
  const value = dayValue(month, day);
  const start = dayValue(from[0], from[1]);
  const end = dayValue(to[0], to[1]);
  if (start <= end) return value >= start && value <= end;
  return value >= start || value <= end;
}

/** Dias de troca de signo ficam de fora. Sem hora e fuso, o sistema não presume o signo. */
export function solarProfile(date: DateParts): SolarProfile | { unavailable: "boundary" } {
  const found = SIGNS.find((item) => inRange(date.month, date.day, item.from, item.to));
  if (!found) return { unavailable: "boundary" };
  return { sign: found.sign, element: found.element, modality: found.modality };
}

const ELEMENT_PAIR: Record<string, string> = {
  "fogo-fogo": "os dois tendem a ir com intensidade",
  "terra-terra": "os dois tendem a buscar continuidade",
  "ar-ar": "os dois tendem a resolver pela conversa",
  "agua-agua": "os dois tendem a sentir antes de decidir",
  "fogo-ar": "há estímulo e movimento, e pode faltar pausa",
  "terra-agua": "há busca de segurança e acolhimento",
  "fogo-agua": "um age na hora e o outro precisa elaborar o que sente",
  "fogo-terra": "um acelera e o outro precisa de segurança",
  "ar-agua": "um quer explicar e o outro precisa sentir primeiro",
  "ar-terra": "um abre ideias e o outro quer ver isso funcionar na prática",
};

export function solarHint(you: SolarProfile, them: SolarProfile, other: string, confirmedPace: boolean): string | null {
  if (!confirmedPace) return null;
  const key = [you.element, them.element].sort().join("-");
  const element = ELEMENT_PAIR[key];
  if (!element) return null;
  const pace =
    you.modality === "cardinal" && them.modality !== "cardinal"
      ? `Você tende a querer resolver logo, enquanto ${other} pode precisar de mais tempo para mudar de posição.`
      : them.modality === "cardinal" && you.modality !== "cardinal"
        ? `${other} tende a puxar uma direção, enquanto você pode precisar de mais tempo para acompanhar.`
        : you.modality === "mutavel" && them.modality === "fixo"
          ? `Você se adapta com mais facilidade. ${other} tende a manter a posição.`
          : them.modality === "mutavel" && you.modality === "fixo"
            ? `${other} muda de rota com mais facilidade. Você tende a manter o que já está firme.`
            : "";
  const shared = you.element === them.element;
  const lead = shared
    ? `A data de vocês mostra um temperamento parecido: ${element}.`
    : `A data de vocês reforça um contraste de temperamento: ${element}.`;
  const paceLine = pace ? ` A diferença de ritmo é esta: ${pace}` : "";
  return `${lead}${paceLine}`.replace(/\s+/g, " ").trim();
}
