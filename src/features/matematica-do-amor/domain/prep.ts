export const PREP_STEPS = [
  "Calculando os números do seu nome…",
  "Calculando os números do nome de {nome}…",
  "Calculando os caminhos de vida…",
  "Cruzando os números com o que você contou…",
  "Organizando sua primeira leitura…",
] as const;

export const PREP_STEP_MS = 2000;
export const PREP_REDUCED_MS = 320;

export function prepDuration(reducedMotion: boolean): number {
  return (reducedMotion ? PREP_REDUCED_MS : PREP_STEP_MS) * PREP_STEPS.length;
}

export function prepProgress(startedAt: number | null, now: number, reducedMotion: boolean, previewReady: boolean): { done: number; active: number } {
  if (!startedAt) return { done: 0, active: 0 };
  const step = reducedMotion ? PREP_REDUCED_MS : PREP_STEP_MS;
  const elapsed = Math.max(0, now - startedAt);
  const reached = Math.min(PREP_STEPS.length, Math.floor(elapsed / step));
  if (!previewReady) return { done: Math.min(reached, PREP_STEPS.length - 1), active: Math.min(reached, PREP_STEPS.length - 1) };
  if (reached >= PREP_STEPS.length) return { done: PREP_STEPS.length, active: -1 };
  return { done: reached, active: reached };
}

export function prepLabel(index: number, firstName: string | null): string {
  return PREP_STEPS[index].replace("{nome}", firstName || "outra pessoa");
}
