import { deliveriesOf } from "./facts";
import { quizPlan } from "../content/steps";
import { validateBirthDate } from "./dates";
import { firstName, validateFullName } from "./names";
import {
  initialState,
  type Answers,
  type DateParts,
  type PersonSide,
  type Phase,
  type PreviewView,
  type SessionState,
  type TextBlock,
  type UnknownField,
} from "./types";

export type Action =
  | { type: "choose"; stepId: string; optionId: string }
  | { type: "submit-name"; who: PersonSide; name: string }
  | { type: "submit-date"; who: PersonSide; date: DateParts; today: Date }
  | { type: "unknown-data"; field: UnknownField }
  | { type: "resume-data" }
  | { type: "hold-data" }
  | { type: "set-session"; sessionId: string }
  | { type: "set-preview"; preview: PreviewView }
  | { type: "preview-error" }
  | { type: "retry-preview" }
  | { type: "start-prep"; at: number }
  | { type: "mark-prep" }
  | { type: "continue-free" }
  | { type: "choose-other" }
  | { type: "choose-format"; optionId: string }
  | { type: "set-order"; orderId: string; status: SessionState["payment"]; blocks?: TextBlock[] | null; plan?: SessionState["plan"]; figures?: SessionState["figures"]; readAt?: string | null }
  | { type: "restore-order"; orderId: string; status: SessionState["payment"]; preview: PreviewView | null; blocks: TextBlock[] | null; plan?: SessionState["plan"]; figures?: SessionState["figures"]; readAt?: string | null }
  | { type: "set-document"; blocks: TextBlock[] }
  | { type: "continue-reading" }
  | { type: "show-all" }
  | { type: "stay-preview" }
  | { type: "reopen-offer" }
  | { type: "begin-pix-email"; orderId: string; preview?: PreviewView | null }
  | { type: "retry-pix-email" }
  | { type: "edit-last" }
  | { type: "reset" }
  | { type: "replace"; state: SessionState };

export function answersOf(state: SessionState): Answers {
  return Object.fromEntries(state.choices.map((choice) => [choice.stepId, choice.optionId]));
}

export function profileReady(state: SessionState): boolean {
  return state.yourNameSet && state.yourDateSet && state.theirNameSet && state.theirDateSet && !state.dataHeld && !state.unknownField;
}

export function phaseOf(state: SessionState): Phase {
  const plan = quizPlan(answersOf(state));
  const pending = plan.find((step) => !answersOf(state)[step.id]);
  if (pending) return { name: "quiz", stepId: pending.id };
  if (state.unknownField) return { name: "unknown-data" };
  if (state.dataHeld) return { name: "context" };
  if (!state.yourNameSet) return { name: "your-name" };
  if (!state.yourDateSet) return { name: "your-date" };
  if (!state.theirNameSet) return { name: "their-name" };
  if (!state.theirDateSet) return { name: "their-date" };
  if (state.payment === "pending") return { name: "pix" };
  if (state.payment === "approved" && state.blocks) return { name: "paid" };
  if (!state.preview || !state.prepDone) return { name: "loading" };
  if (!state.freeContinued && state.preview.moments.some((moment) => moment >= 3)) return { name: "free" };
  if (state.awaitingPixEmail) return { name: "payer-email" };
  if (state.holdPreview) return { name: "held" };
  return { name: "offer" };
}

function clearDerived(state: SessionState): SessionState {
  if (state.payment === "approved") return state;
  return {
    ...state,
    preview: null,
    previewError: false,
    formatId: null,
    chooseOther: false,
    holdPreview: false,
    orderId: null,
    payment: "idle",
    blocks: null,
    plan: null,
    chapter: 0,
    showAll: false,
    prepStartedAt: null,
    prepDone: false,
    freeContinued: false,
    figures: null,
    readAt: null,
    awaitingPixEmail: false,
    pixRetry: false,
  };
}

export function reduceSession(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "replace":
      return action.state;
    case "reset":
      return { ...initialState, sessionId: state.sessionId };
    case "set-session":
      return state.sessionId ? state : { ...state, sessionId: action.sessionId };
    case "choose": {
      const phase = phaseOf(state);
      if (phase.name !== "quiz" || phase.stepId !== action.stepId || state.payment === "approved") return state;
      const step = quizPlan(answersOf(state)).find((item) => item.id === action.stepId);
      if (!step?.options.some((option) => option.id === action.optionId)) return state;
      return clearDerived({
        ...state,
        choices: [...state.choices, { stepId: action.stepId, optionId: action.optionId }],
        yourName: null,
        theirName: null,
        yourFirst: null,
        theirFirst: null,
        yourDate: null,
        theirDate: null,
        yourNameSet: false,
        theirNameSet: false,
        yourDateSet: false,
        theirDateSet: false,
        unknownField: null,
        dataHeld: false,
      });
    }
    case "submit-name": {
      const phase = phaseOf(state);
      const expected = action.who === "you" ? "your-name" : "their-name";
      if (phase.name !== expected || state.payment === "approved") return state;
      const parsed = validateFullName(action.name);
      if (!parsed.ok) return state;
      return clearDerived(
        action.who === "you"
          ? { ...state, yourName: parsed.name, yourFirst: firstName(parsed.name), yourNameSet: true, unknownField: null, dataHeld: false }
          : { ...state, theirName: parsed.name, theirFirst: firstName(parsed.name), theirNameSet: true, unknownField: null, dataHeld: false },
      );
    }
    case "submit-date": {
      const phase = phaseOf(state);
      const expected = action.who === "you" ? "your-date" : "their-date";
      if (phase.name !== expected || state.payment === "approved") return state;
      if (!validateBirthDate(action.date, action.today).ok) return state;
      return clearDerived(
        action.who === "you"
          ? { ...state, yourDate: action.date, yourDateSet: true, unknownField: null, dataHeld: false }
          : { ...state, theirDate: action.date, theirDateSet: true, unknownField: null, dataHeld: false },
      );
    }
    case "unknown-data": {
      const phase = phaseOf(state);
      if (action.field === "their-name" && phase.name !== "their-name") return state;
      if (action.field === "their-date" && phase.name !== "their-date") return state;
      return { ...clearDerived(state), unknownField: action.field, dataHeld: false };
    }
    case "resume-data":
      return state.unknownField ? { ...state, unknownField: null, dataHeld: false } : state;
    case "hold-data":
      return phaseOf(state).name === "unknown-data" && !state.dataHeld ? { ...state, dataHeld: true } : state;
    case "set-preview":
      return state.preview ? state : { ...state, preview: action.preview, previewError: false };
    case "preview-error":
      return { ...state, previewError: true };
    case "retry-preview":
      return { ...state, preview: null, previewError: false, prepStartedAt: null, prepDone: false, freeContinued: false };
    case "start-prep":
      return state.prepStartedAt ? state : { ...state, prepStartedAt: action.at };
    case "mark-prep":
      return state.preview ? { ...state, prepDone: true } : state;
    case "continue-free":
      return { ...state, freeContinued: true };
    case "choose-other":
      return { ...state, chooseOther: true, formatId: null };
    case "choose-format": {
      const phase = phaseOf(state);
      if ((phase.name !== "format" && phase.name !== "confirm-format" && phase.name !== "offer") || !state.preview) return state;
      if (!deliveriesOf().some((item) => item.id === action.optionId)) return state;
      return { ...state, formatId: action.optionId, chooseOther: false, holdPreview: false, orderId: null, payment: "idle", blocks: null, awaitingPixEmail: false, pixRetry: false };
    }
    case "set-order":
      return {
        ...state,
        orderId: action.orderId,
        payment: action.status,
        blocks: action.blocks ?? (action.status === "approved" ? state.blocks : null),
        plan: action.plan ?? (action.status === "approved" ? state.plan : null),
        figures: action.status === "approved" ? action.figures ?? state.figures : null,
        readAt: action.status === "approved" ? action.readAt ?? state.readAt : null,
        yourName: action.status === "approved" ? null : state.yourName,
        theirName: action.status === "approved" ? null : state.theirName,
        awaitingPixEmail: false,
        pixRetry: false,
      };
    case "restore-order":
      return {
        ...state,
        orderId: action.orderId,
        payment: action.status,
        preview: state.preview ?? action.preview,
        blocks: action.blocks ?? (action.status === "approved" ? state.blocks : null),
        plan: action.plan ?? state.plan,
        figures: action.status === "approved" ? action.figures ?? state.figures : null,
        readAt: action.status === "approved" ? action.readAt ?? state.readAt : null,
        prepDone: true,
        freeContinued: true,
      };
    case "set-document":
      return state.payment === "approved" ? { ...state, blocks: action.blocks, chapter: 0, showAll: false, yourName: null, theirName: null } : state;
    case "continue-reading":
      return { ...state, chapter: state.chapter + 1 };
    case "show-all":
      return { ...state, showAll: true };
    case "stay-preview":
      return phaseOf(state).name === "offer" ? { ...state, holdPreview: true, payment: "idle", orderId: null, awaitingPixEmail: false, pixRetry: false } : state;
    case "reopen-offer":
      return state.holdPreview ? { ...state, holdPreview: false } : state;
    case "begin-pix-email":
      if (state.payment === "approved") return state;
      return {
        ...state,
        orderId: action.orderId,
        payment: "idle",
        awaitingPixEmail: true,
        pixRetry: false,
        blocks: null,
        prepDone: true,
        freeContinued: true,
        preview: state.preview ?? action.preview ?? null,
      };
    case "retry-pix-email":
      return state.payment === "pending" ? { ...state, payment: "idle", awaitingPixEmail: true, pixRetry: true } : state;
    case "edit-last":
      return state.payment === "approved" ? state : editLast(state);
    default:
      return state;
  }
}

function editLast(state: SessionState): SessionState {
  if (state.awaitingPixEmail && state.payment !== "pending") return { ...state, awaitingPixEmail: false, pixRetry: false };
  if (state.payment === "pending") return { ...state, payment: "idle", orderId: null, awaitingPixEmail: false, pixRetry: false };
  if (state.dataHeld) return { ...state, dataHeld: false };
  if (state.holdPreview) return { ...state, holdPreview: false };
  if (state.formatId) return { ...state, formatId: null, chooseOther: false, blocks: null, orderId: null, payment: "idle" };
  if (state.chooseOther) return { ...state, chooseOther: false };
  if (state.preview) return { ...state, preview: null, previewError: false };
  if (state.unknownField) return { ...state, unknownField: null, dataHeld: false };
  if (state.theirDateSet) return { ...clearDerived(state), theirDateSet: false };
  if (state.theirNameSet) return { ...clearDerived(state), theirNameSet: false, theirName: null, theirFirst: null, theirDate: null, theirDateSet: false };
  if (state.yourDateSet) return { ...clearDerived(state), yourDateSet: false, theirName: null, theirFirst: null, theirNameSet: false, theirDate: null, theirDateSet: false };
  if (state.yourNameSet) {
    return { ...clearDerived(state), yourNameSet: false, yourName: null, yourFirst: null, yourDate: null, yourDateSet: false, theirName: null, theirFirst: null, theirNameSet: false, theirDate: null, theirDateSet: false };
  }
  return { ...initialState, sessionId: state.sessionId, choices: state.choices.slice(0, -1) };
}
