import type { SessionState } from "./types";

export const REVEAL_DELAY_MS = 450;

export function sessionHasProgress(state: SessionState): boolean {
  return (
    state.choices.length > 0 ||
    state.yourNameSet ||
    state.yourDateSet ||
    state.theirNameSet ||
    state.theirDateSet ||
    state.unknownField !== null ||
    state.formatId !== null ||
    state.holdPreview ||
    state.orderId !== null ||
    state.payment !== "idle"
  );
}

/** How many bubbles stay visible after the transcript changes. */
export function nextRevealCount(previousIds: string[], nextIds: string[], shown: number): number {
  if (nextIds.length === 0) return 0;
  let shared = 0;
  while (shared < previousIds.length && shared < nextIds.length && previousIds[shared] === nextIds[shared]) {
    shared += 1;
  }
  const diverged = shared < previousIds.length;
  if (diverged) return Math.max(shared, 1);
  return Math.min(Math.max(shown, 1), nextIds.length);
}

type RevealInput =
  | "assistant"
  | "user"
  | undefined
  | { role: "assistant" | "user"; text?: string; instant?: boolean; kind?: string };

export function revealDelay(input: RevealInput, reducedMotion: boolean): number {
  if (reducedMotion || input === "user" || input === undefined) return 0;
  if (typeof input === "string") return 700;
  if (input.role === "user" || input.instant || input.kind === "pix" || input.kind === "error") return 0;
  const words = (input.text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.min(1100, Math.max(450, 450 + Math.min(650, Math.max(0, words - 12) * 16)));
}
