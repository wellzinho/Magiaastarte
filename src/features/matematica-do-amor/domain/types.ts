export type ScenarioId = "ended" | "uncertain" | "unrequited" | "difficult";

export type AddressId = "ele" | "ela" | "pessoa";

export type Answers = Record<string, string>;

export type Option = {
  id: string;
  label: string;
  tone?: "primary" | "quiet";
};

export type DateParts = {
  day: number;
  month: number;
  year: number;
};

export type PaymentStatus = "idle" | "pending" | "approved" | "expired" | "canceled" | "failed";

export type TextBlock = { id: string; text: string; chapter?: number };

export type PlanRow = { label: string; text: string };

export type PreviewView = {
  bubbles: string[];
  moments: number[];
  moduleId: string;
  identified: string;
  calc: string;
  deliveries: Option[];
  preselectId: string | null;
  cta: string;
  offers: Record<string, string[]>;
  service: "simulated" | "unavailable";
};

export type PersonFigures = {
  motivation: number | null;
  impression: number | null;
  expression: number;
  path: number;
};

export type PersonSide = "you" | "them";

export type UnknownField = "their-name" | "their-date";

export type SessionState = {
  choices: { stepId: string; optionId: string }[];
  yourName: string | null;
  theirName: string | null;
  yourDate: DateParts | null;
  theirDate: DateParts | null;
  yourNameSet: boolean;
  theirNameSet: boolean;
  yourDateSet: boolean;
  theirDateSet: boolean;
  yourFirst: string | null;
  theirFirst: string | null;
  unknownField: UnknownField | null;
  dataHeld: boolean;
  formatId: string | null;
  holdPreview: boolean;
  chooseOther: boolean;
  sessionId: string;
  preview: PreviewView | null;
  previewError: boolean;
  prepStartedAt: number | null;
  prepDone: boolean;
  freeContinued: boolean;
  plan: PlanRow[] | null;
  orderId: string | null;
  payment: PaymentStatus;
  awaitingPixEmail: boolean;
  pixRetry: boolean;
  blocks: TextBlock[] | null;
  chapter: number;
  showAll: boolean;
  figures: { you: PersonFigures; them: PersonFigures } | null;
  readAt: string | null;
};

export type PhaseName =
  | "quiz"
  | "your-name"
  | "your-date"
  | "their-name"
  | "their-date"
  | "unknown-data"
  | "context"
  | "loading"
  | "free"
  | "confirm-format"
  | "format"
  | "offer"
  | "payer-email"
  | "pix"
  | "paid"
  | "held";

export type Phase =
  | { name: "quiz"; stepId: string }
  | { name: Exclude<PhaseName, "quiz"> };

export const initialState: SessionState = {
  choices: [],
  yourName: null,
  theirName: null,
  yourDate: null,
  theirDate: null,
  yourNameSet: false,
  theirNameSet: false,
  yourDateSet: false,
  theirDateSet: false,
  yourFirst: null,
  theirFirst: null,
  unknownField: null,
  dataHeld: false,
  formatId: null,
  holdPreview: false,
  chooseOther: false,
  sessionId: "",
  preview: null,
  previewError: false,
  prepStartedAt: null,
  prepDone: false,
  freeContinued: false,
  plan: null,
  orderId: null,
  payment: "idle",
  awaitingPixEmail: false,
  pixRetry: false,
  blocks: null,
  chapter: 0,
  showAll: false,
  figures: null,
  readAt: null,
};

export function isAddress(value: string | undefined): value is AddressId {
  return value === "ele" || value === "ela" || value === "pessoa";
}
