export const PAID_CHAPTERS = [
  { title: "Minha resposta mais direta", mark: "Resposta direta" },
  { title: "Por que essa é a orientação", mark: "O motivo" },
  { title: "Como agir neste caso", mark: "Como agir" },
  { title: "Como ler a reação", mark: "A reação" },
] as const;

export function continueLabel(chapterIndex: number): string {
  if (chapterIndex <= 0) return "Continuar minha orientação";
  const next = PAID_CHAPTERS[chapterIndex + 1];
  return next ? `Continuar para: ${next.title}` : "Continuar minha orientação";
}
