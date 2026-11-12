import { DATA_BRIDGE, addressOf, quizPlan, WELCOME } from "../content/steps";
import { quizAsides } from "./asides";
import { PAID_CHAPTERS, continueLabel } from "./chapters";
import { confirmedFact, factualMirror } from "./facts";
import { answersOf, profileReady } from "./flow";
import { PRICE_LABEL } from "./payment";
import { pronounsOf } from "./pronouns";
import type { Option, PersonSide, PhaseName, SessionState } from "./types";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  kind?: "calc" | "pix" | "paid" | "wait" | "error" | "plan" | "save" | "instagram";
  instant?: boolean;
  calc?: string;
};

export type EntryField = {
  who: PersonSide;
  kind: "name" | "date" | "email";
  submitLabel: string;
};

export type Presentation = {
  messages: ChatMessage[];
  phase: PhaseName;
  stepId?: string;
  options: Option[];
  entry: EntryField | null;
  showPix: boolean;
  showEdit: boolean;
  paidReady: boolean;
  chaptersDone: number;
  showProgress: boolean;
};

export function present(state: SessionState, today: Date): Presentation {
  void today;
  const answers = answersOf(state);
  const pronouns = pronounsOf(addressOf(answers));
  const asides = quizAsides(answers);
  const messages: ChatMessage[] = WELCOME.map((text, index) => ({
    id: `welcome-${index}`,
    role: "assistant" as const,
    text,
  }));

  for (const step of quizPlan(answers)) {
    if (step.id !== "scenario") {
      step.intros.forEach((text, index) => messages.push({ id: `${step.id}-intro-${index}`, role: "assistant", text }));
      messages.push({ id: `${step.id}-q`, role: "assistant", text: step.question });
    }
    const selected = answers[step.id];
    if (!selected) return pack(messages, "quiz", step.options, { stepId: step.id, showEdit: state.choices.length > 0 });
    const label = step.options.find((option) => option.id === selected)?.label ?? selected;
    messages.push({ id: `${step.id}-a`, role: "user", text: label });
    for (const aside of asides.filter((item) => item.afterStepId === step.id)) {
      messages.push({ id: aside.id, role: "assistant", text: aside.text });
    }
  }

  messages.push({
    id: "marco-contexto",
    role: "assistant",
    text: "Já entendi o ponto principal dessa história e o que você quer esclarecer.",
  });
  messages.push({ id: "mirror", role: "assistant", text: factualMirror(answers, pronouns) });
  messages.push({
    id: "marco-numeros",
    role: "assistant",
    text: "Agora preciso dos números que mostram o que cada um precisa no amor, como age e qual ritmo aparece na data de nascimento.",
  });
  messages.push({ id: "data-bridge", role: "assistant", text: DATA_BRIDGE });

  messages.push({ id: "your-name-q", role: "assistant", text: "Qual é o seu nome completo de nascimento?" });
  if (!state.yourNameSet) return pack(messages, "your-name", [], { entry: { who: "you", kind: "name", submitLabel: "Enviar" }, showEdit: true });
  messages.push({ id: "your-name-a", role: "user", text: state.yourFirst || "Nome enviado" });

  messages.push({ id: "your-date-q", role: "assistant", text: "Qual é a sua data de nascimento?" });
  if (!state.yourDateSet) return pack(messages, "your-date", [], { entry: { who: "you", kind: "date", submitLabel: "Enviar" }, showEdit: true });
  messages.push({ id: "your-date-a", role: "user", text: "Data enviada" });

  messages.push({ id: "their-name-q", role: "assistant", text: `Qual é o nome completo de nascimento ${pronouns.possessive}?` });
  if (state.unknownField === "their-name") return unknownTurn(messages, state, `o nome completo de nascimento ${pronouns.possessive}`, confirmedFact(answers, pronouns));
  if (!state.theirNameSet) {
    return pack(messages, "their-name", [{ id: "unknown", label: "Não sei agora" }], {
      entry: { who: "them", kind: "name", submitLabel: "Enviar" },
      showEdit: true,
    });
  }
  messages.push({ id: "their-name-a", role: "user", text: state.theirFirst || "Nome enviado" });

  if (state.yourNameSet && state.yourDateSet && state.theirNameSet) {
    const who = state.theirFirst ? `de ${state.theirFirst}` : "da outra pessoa";
    messages.push({
      id: "marco-ultimo",
      role: "assistant",
      text: `Falta só a data de nascimento ${who} para eu cruzar as duas leituras.`,
    });
  }
  messages.push({ id: "their-date-q", role: "assistant", text: `Qual é a data de nascimento ${pronouns.possessive}?` });
  if (state.unknownField === "their-date") return unknownTurn(messages, state, `a data de nascimento ${pronouns.possessive}`, confirmedFact(answers, pronouns));
  if (!state.theirDateSet) {
    return pack(messages, "their-date", [{ id: "unknown", label: "Não sei agora" }], {
      entry: { who: "them", kind: "date", submitLabel: "Ver minha leitura grátis" },
      showEdit: true,
    });
  }
  messages.push({ id: "their-date-a", role: "user", text: "Data enviada" });

  if (!profileReady(state) || !state.preview || !state.prepDone) {
    if (state.previewError) {
      messages.push({ id: "loading-error", role: "assistant", text: "A leitura não entrou. Nada foi cobrado.", kind: "error", instant: true });
      return pack(messages, "loading", [{ id: "retry-preview", label: "Tentar de novo" }], { showEdit: true });
    }
    return pack(messages, "loading", [], { showEdit: true });
  }

  const moments = state.preview.moments.length === state.preview.bubbles.length ? state.preview.moments : state.preview.bubbles.map(() => 1);
  const pause = moments.some((moment) => moment >= 3) && !state.freeContinued;
  const visibleMoments = pause ? 2 : 4;
  state.preview.bubbles.forEach((text, index) => {
    if ((moments[index] ?? 1) > visibleMoments) return;
    const shownIndexes = moments.map((moment, bubble) => ((moment ?? 1) <= visibleMoments ? bubble : -1)).filter((bubble) => bubble >= 0);
    const last = shownIndexes[shownIndexes.length - 1] === index;
    messages.push({
      id: `preview-${index}`,
      role: "assistant",
      text,
      calc: !pause && last ? state.preview?.calc : undefined,
    });
  });
  if (pause) {
    return pack(messages, "free", [{ id: "continue-free", label: "Continuar minha primeira leitura", tone: "primary" }], { showEdit: true });
  }

  const offerKey = state.formatId && state.preview.offers[state.formatId] ? state.formatId : "resposta";
  (state.preview.offers[offerKey] ?? []).forEach((text, index) => messages.push({ id: `offer-${index}`, role: "assistant", text }));

  if (state.holdPreview && !state.awaitingPixEmail) {
    messages.push({ id: "held", role: "assistant", text: "Tudo bem. Sua leitura grátis fica aqui se quiser reler." });
    return pack(messages, "held", [{ id: "reopen", label: "Ver a oferta novamente", tone: "quiet" }], { showEdit: true });
  }

  if (state.awaitingPixEmail && state.payment !== "pending" && !(state.payment === "approved" && state.blocks)) {
    if (state.pixRetry) {
      messages.push({ id: "pix-nao-concluido", role: "assistant", text: "O pagamento não foi concluído. Você pode gerar um novo Pix." });
    }
    messages.push({ id: "pix-email-q", role: "assistant", text: "Antes de gerar seu Pix, me passa o seu e-mail?" });
    messages.push({
      id: "pix-email-apoio",
      role: "assistant",
      text: "Ele será usado somente para identificar o pagamento no Mercado Pago. Sua leitura será entregue aqui no chat.",
    });
    return pack(messages, "payer-email", [], {
      entry: { who: "you", kind: "email", submitLabel: `Gerar meu Pix de ${PRICE_LABEL}` },
      showEdit: true,
    });
  }

  if (state.payment === "pending") {
    messages.push({ id: "pix", role: "assistant", text: `Pagamento único de ${PRICE_LABEL}. Seu Pix está aqui.`, kind: "pix", instant: true });
    return pack(messages, "pix", [], { showPix: true, showEdit: true });
  }

  if (state.payment === "approved" && state.blocks) {
    messages.push({ id: "pix", role: "assistant", text: `Pagamento único de ${PRICE_LABEL}. Seu Pix está aqui.`, kind: "pix", instant: true });
    messages.push({ id: "pagamento-confirmado", role: "assistant", text: "Pagamento confirmado ✨ Agora vou liberar sua orientação completa." });
    const maxChapter = Math.max(1, ...state.blocks.map((block) => block.chapter ?? 1));
    const openChapters = state.showAll ? maxChapter : Math.min(maxChapter, state.chapter + 1);
    const visible = [...state.blocks]
      .map((block, index) => ({ ...block, index }))
      .filter((block) => (block.chapter ?? 4) <= openChapters)
      .sort((left, right) => (left.chapter ?? 4) - (right.chapter ?? 4) || left.index - right.index);
    let previousChapter = 0;
    visible.forEach((block) => {
      const chapter = block.chapter ?? 4;
      if (chapter !== previousChapter && chapter > 1) {
        messages.push({ id: `capitulo-${chapter}`, role: "assistant", text: PAID_CHAPTERS[chapter - 1]?.title ?? "Orientação", instant: true });
      }
      previousChapter = chapter;
      messages.push({ id: block.id, role: "assistant", text: block.text, kind: "paid", instant: block.id === "direta" || block.id === "abertura" });
    });
    const finished = state.showAll || openChapters >= maxChapter;
    if (finished && state.plan?.length) {
      messages.push({ id: "plano-titulo", role: "assistant", text: "Seu próximo passo", kind: "plan" });
      state.plan.forEach((row, index) => messages.push({ id: `plano-${index}`, role: "assistant", text: `${row.label}: ${row.text}`, kind: "plan" }));
    }
    if (!finished) {
      return pack(messages, "paid", [{ id: "continue", label: continueLabel(state.chapter), tone: "primary" }], {
        paidReady: true,
        chaptersDone: state.chapter,
        showProgress: true,
        showPix: true,
      });
    }
    messages.push({ id: "guardar", role: "assistant", text: "", kind: "save", instant: true });
    messages.push({ id: "seguir", role: "assistant", text: "", kind: "instagram", instant: true });
    return pack(messages, "paid", [], {
      paidReady: true,
      chaptersDone: 4,
      showProgress: true,
      showPix: true,
    });
  }

  return pack(messages, "offer", [
    { id: "unlock", label: state.preview.cta, tone: "primary" },
    { id: "stay", label: "Ficar com a leitura grátis", tone: "quiet" },
  ], { showEdit: true });
}

function unknownTurn(messages: ChatMessage[], state: SessionState, missing: string, fact: string): Presentation {
  messages.push({ id: "unknown-a", role: "user", text: "Não sei agora." });
  messages.push({
    id: "unknown-q",
    role: "assistant",
    text: `Pra leitura do casal, falta ${missing}. Sem esse dado eu não calculo número nenhum e não ofereço a leitura completa.`,
  });
  if (state.dataHeld) {
    messages.push({
      id: "context-end",
      role: "assistant",
      text: `Este ponto continua como contexto: ${fact}. Quando tiver o dado, dá para voltar. Até lá, a conta fica em aberto.`,
    });
    return pack(messages, "context", [{ id: "resume-data", label: "Voltar", tone: "quiet" }], { showEdit: true });
  }
  return pack(messages, "unknown-data", [
    { id: "resume-data", label: "Voltar" },
    { id: "hold-data", label: "Encerrar por agora", tone: "quiet" },
  ], { showEdit: true });
}

function pack(
  messages: ChatMessage[],
  phase: PhaseName,
  options: Option[],
  extras: { stepId?: string; entry?: EntryField | null; showPix?: boolean; showEdit?: boolean; paidReady?: boolean; chaptersDone?: number; showProgress?: boolean } = {},
): Presentation {
  return {
    messages,
    phase,
    stepId: extras.stepId,
    options,
    entry: extras.entry ?? null,
    showPix: extras.showPix ?? false,
    showEdit: extras.showEdit ?? false,
    paidReady: extras.paidReady ?? false,
    chaptersDone: extras.chaptersDone ?? 0,
    showProgress: extras.showProgress ?? false,
  };
}
