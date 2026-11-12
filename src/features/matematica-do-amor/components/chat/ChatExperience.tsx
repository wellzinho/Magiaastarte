"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { SYMBOLIC_NOTE } from "../../content/steps";
import { PAID_CHAPTERS } from "../../domain/chapters";
import { answersOf, profileReady, reduceSession } from "../../domain/flow";
import {
  trackMdaAddPaymentInfo,
  trackMdaCompraConcluida,
  trackMdaFreeReadingCompleted,
  trackMdaInitiateCheckout,
  trackMdaOfferViewed,
  trackMdaQuizStarted,
  trackMdaViewContent,
} from "../../domain/meta-pixel-events";
import { PREP_REDUCED_MS, PREP_STEP_MS, PREP_STEPS, prepDuration, prepLabel, prepProgress } from "../../domain/prep";
import { maskBirthInput, parseBirthInput, validateFullName } from "../../domain/names";
import { present, type ChatMessage, type EntryField, type Presentation } from "../../domain/present";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, type ReadingSource } from "../../domain/reading-copy";
import { PAYMENT_ONCE, PREPARING_LABEL, PRICE_LABEL, PIX_STATUS, isPayerEmail } from "../../domain/payment";
import { attachPaymentResumeListeners } from "../../domain/payment-visibility";
import { nextRevealCount, revealDelay, sessionHasProgress } from "../../domain/reveal";
import { clearSession, loadSession, saveSession } from "../../domain/session";
import { initialState, type DateParts, type PersonFigures, type PersonSide, type PlanRow, type PreviewView, type TextBlock } from "../../domain/types";
import styles from "./chat.module.css";

type PaidPayload = {
  blocks?: TextBlock[];
  plan?: PlanRow[];
  figures?: { you: PersonFigures; them: PersonFigures } | null;
  readAt?: string | null;
  preview?: PreviewView | null;
};

type PixChargeState = "open" | "rejected" | "cancelled" | "expired";

type PixView = {
  orderId: string;
  mpOrderId: string;
  copyPaste: string;
  qrSvg: string;
  testMode: boolean;
  chargeState: PixChargeState;
};

type PixCreateResponse = {
  code?: string;
  message?: string;
  orderId?: string;
  mpOrderId?: string;
  copyPaste?: string;
  qrSvg?: string;
  testMode?: boolean;
  chargeState?: PixChargeState;
  status?: string;
  ticketUrl?: string | null;
  eventId?: string;
};

const AUTO_POLL_MS = 3000;
const AUTO_POLL_LIMIT_MS = 3 * 60 * 1000;

export function ChatExperience() {
  const [boot] = useState(() => {
    const today = new Date();
    const loaded = loadSession(today) ?? initialState;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = reduced || sessionHasProgress(loaded) ? present(loaded, today).messages.length : 1;
    return { today, loaded, count, reduced };
  });
  const today = boot.today;
  const reducedMotion = boot.reduced;
  const [state, dispatch] = useReducer(reduceSession, boot.loaded);
  const stateRef = useRef(state);
  const [shownCount, setShownCount] = useState(boot.count);
  const [busy, setBusy] = useState(false);
  const [deliveryError, setDeliveryError] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [paymentNote, setPaymentNote] = useState<string | null>(null);
  const [creatingPix, setCreatingPix] = useState(false);
  const [checkingPix, setCheckingPix] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [pix, setPix] = useState<PixView | null>(null);
  const pixRef = useRef<PixView | null>(null);
  const [pixAttempt, setPixAttempt] = useState(0);
  const [pixGate, setPixGate] = useState<"waiting" | "test-ready" | "done">("waiting");
  const [releaseAllowed, setReleaseAllowed] = useState(false);
  const pixGateRef = useRef(pixGate);
  const releaseAllowedRef = useRef(releaseAllowed);
  const [typing, setTyping] = useState(false);
  const [prepNow, setPrepNow] = useState(() => Date.now());
  const [menuOpen, setMenuOpen] = useState(false);
  const [following, setFollowing] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);
  const focusRef = useRef(false);
  const lockRef = useRef(false);
  const choiceLock = useRef(false);
  const checkInFlight = useRef(false);
  const verifyRef = useRef<(options?: { silent?: boolean }) => Promise<void>>(async () => undefined);
  const announcedRef = useRef<string | null>(null);
  const skipAnnounceRef = useRef(sessionHasProgress(state));

  const presentation = present(state, today);
  const messageIds = presentation.messages.map((message) => message.id);
  const idsKey = messageIds.join("\n");
  const prevIdsRef = useRef<string[] | null>(null);
  const shownCountRef = useRef(shownCount);
  const visibleCount = Math.min(messageIds.length, shownCount);
  const shown = visibleMessages(presentation, { visibleCount, busy: busy && !creatingPix, deliveryError });
  const ready = !busy && !creatingPix && visibleCount >= presentation.messages.length;
  const nextMessage = presentation.messages[shownCount];
  const nextKey = nextMessage ? `${nextMessage.id}:${nextMessage.role}:${nextMessage.kind ?? ""}:${nextMessage.instant ? 1 : 0}:${nextMessage.text.length}` : "";
  const nextDelay = nextMessage ? revealDelay(nextMessage, reducedMotion) : 0;

  function commit(action: Parameters<typeof reduceSession>[1]) {
    const current = stateRef.current;
    const next = reduceSession(current, action);
    const nextIds = present(next, today).messages.map((message) => message.id);
    const shown = shownCountRef.current;
    const target = reducedMotion ? nextIds.length : nextRevealCount(prevIdsRef.current ?? nextIds, nextIds, shown);
    prevIdsRef.current = nextIds;
    if (target !== shown) {
      shownCountRef.current = target;
      setShownCount(target);
    }
    dispatch(action);
  }

  useEffect(() => {
    stateRef.current = state;
    saveSession(state);
  }, [state]);

  useEffect(() => {
    pixRef.current = pix;
  }, [pix]);

  useEffect(() => {
    pixGateRef.current = pixGate;
  }, [pixGate]);

  useEffect(() => {
    releaseAllowedRef.current = releaseAllowed;
  }, [releaseAllowed]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch("/api/leitura/session", {
        method: "POST",
        credentials: "same-origin",
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("session");
          return (await response.json()) as { sessionId?: string };
        })
        .then((data) => {
          if (typeof data.sessionId === "string" && /^[0-9a-f-]{36}$/i.test(data.sessionId)) {
            if (stateRef.current.sessionId !== data.sessionId) {
              dispatch({ type: "set-session", sessionId: data.sessionId });
            }
          }
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
        });
    }, 0);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (state.preview || state.previewError || !profileReady(state) || !state.sessionId || !state.yourName || !state.theirName || !state.yourDate || !state.theirDate) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch("/api/leitura/previa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(readingPayload(state)),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("preview");
          return (await response.json()) as PreviewView;
        })
        .then((preview) => dispatch({ type: "set-preview", preview }))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          dispatch({ type: "preview-error" });
        });
    }, 0);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [state]);

  useEffect(() => {
    if (!state.orderId || !state.sessionId || state.payment !== "idle" || state.awaitingPixEmail) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch("/api/leitura/pedido/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: state.sessionId, orderId: state.orderId }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) return null;
          return (await response.json()) as {
            id: string;
            status: "pending" | "approved";
            preview: PreviewView | null;
            plan?: PlanRow[];
            pix?: {
              mpOrderId: string;
              copyPaste: string;
              qrSvg: string;
              testMode: boolean;
              chargeState: PixChargeState;
            } | null;
          };
        })
        .then(async (order) => {
          if (!order) return;
          if (order.status === "approved") {
            const document = await fetch("/api/leitura/pedido/documento", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: state.sessionId, orderId: order.id }),
            }).then(async (response) => (response.ok ? ((await response.json()) as PaidPayload) : null));
            dispatch({
              type: "restore-order",
              orderId: order.id,
              status: "approved",
              preview: document?.preview ?? order.preview,
              blocks: document?.blocks ?? null,
              plan: document?.plan ?? null,
              figures: document?.figures ?? null,
              readAt: document?.readAt ?? null,
            });
            return;
          }
          if (order.pix) {
            setPix({
              orderId: order.id,
              mpOrderId: order.pix.mpOrderId,
              copyPaste: order.pix.copyPaste,
              qrSvg: order.pix.qrSvg,
              testMode: order.pix.testMode,
              chargeState: order.pix.chargeState,
            });
            setPixGate("waiting");
            setReleaseAllowed(false);
            dispatch({ type: "restore-order", orderId: order.id, status: "pending", preview: order.preview, blocks: null });
            return;
          }
          dispatch({ type: "begin-pix-email", orderId: order.id, preview: order.preview });
        })
        .catch(() => undefined);
    }, 0);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [state.orderId, state.sessionId, state.payment, state.awaitingPixEmail]);

  useEffect(() => {
    if (presentation.phase !== "loading" || state.previewError || state.prepDone) return;
    if (!state.prepStartedAt) {
      const timer = window.setTimeout(() => dispatch({ type: "start-prep", at: Date.now() }), 0);
      return () => window.clearTimeout(timer);
    }
    const total = prepDuration(reducedMotion);
    const elapsed = Date.now() - state.prepStartedAt;
    if (state.preview && elapsed >= total) {
      const timer = window.setTimeout(() => dispatch({ type: "mark-prep" }), 0);
      return () => window.clearTimeout(timer);
    }
    const step = reducedMotion ? PREP_REDUCED_MS : PREP_STEP_MS;
    const wait = Math.max(40, step - (elapsed % step));
    const timer = window.setTimeout(() => setPrepNow(Date.now()), wait);
    return () => window.clearTimeout(timer);
  }, [presentation.phase, state.previewError, state.prepDone, state.prepStartedAt, state.preview, reducedMotion, prepNow]);

  useEffect(() => {
    trackMdaViewContent();
  }, []);

  useEffect(() => {
    if (presentation.phase === "quiz" || state.choices.length > 0) trackMdaQuizStarted();
    if (
      state.preview?.moduleId &&
      presentation.phase !== "quiz" &&
      presentation.phase !== "loading" &&
      presentation.phase !== "free"
    ) {
      trackMdaFreeReadingCompleted();
    }
    if (
      presentation.phase === "offer" ||
      presentation.phase === "pix" ||
      presentation.phase === "held" ||
      presentation.phase === "payer-email"
    ) {
      trackMdaOfferViewed();
    }
    if (presentation.phase === "payer-email" || presentation.phase === "pix" || state.awaitingPixEmail) {
      trackMdaInitiateCheckout();
    }
  }, [presentation.phase, state.choices.length, state.preview?.moduleId, state.awaitingPixEmail]);

  useEffect(() => {
    choiceLock.current = false;
  }, [idsKey, busy, creatingPix, deliveryError]);

  useEffect(() => {
    const nextIds = idsKey ? idsKey.split("\n") : [];
    const previous = prevIdsRef.current ?? nextIds;
    const target = reducedMotion ? nextIds.length : nextRevealCount(previous, nextIds, shownCount);
    prevIdsRef.current = nextIds;
    shownCountRef.current = shownCount;
    const timers: number[] = [];
    const revealAt = (count: number) => {
      shownCountRef.current = count;
      setShownCount(count);
      setTyping(false);
    };
    if (reducedMotion) {
      if (shownCount !== nextIds.length) timers.push(window.setTimeout(() => revealAt(nextIds.length), 0));
    } else if (target !== shownCount) {
      timers.push(window.setTimeout(() => revealAt(target), 0));
    } else if (shownCount < nextIds.length && nextKey) {
      const next = shownCount + 1;
      if (nextDelay === 0) timers.push(window.setTimeout(() => revealAt(next), 0));
      else {
        timers.push(window.setTimeout(() => setTyping(true), 0));
        timers.push(window.setTimeout(() => revealAt(next), nextDelay));
      }
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [idsKey, shownCount, reducedMotion, nextKey, nextDelay]);

  useEffect(() => {
    if (!menuOpen) return;
    function close(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!followingRef.current) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const top = scroller.scrollHeight;
    if (reducedMotion || document.visibilityState !== "visible") scroller.scrollTop = top;
    else scroller.scrollTo({ top, behavior: "smooth" });
  }, [shown.length, ready, presentation.phase, busy, creatingPix, typing, reducedMotion]);

  useEffect(() => {
    if (!focusRef.current || !ready) return;
    focusRef.current = false;
    composerRef.current?.focus();
  }, [ready, presentation.phase, presentation.stepId, state.formatId, state.payment, state.holdPreview, state.yourNameSet, state.theirNameSet]);

  useEffect(() => {
    const latest = shown[shown.length - 1];
    if (!latest) return;
    if (skipAnnounceRef.current) {
      skipAnnounceRef.current = false;
      announcedRef.current = latest.id;
      return;
    }
    if (announcedRef.current === latest.id) return;
    announcedRef.current = latest.id;
    if (liveRef.current) liveRef.current.textContent = latest.kind === "wait" ? "Preparando a próxima mensagem" : latest.text;
  }, [shown]);

  const lastAssistant = [...shown].reverse().find((message) => message.role === "assistant");

  function markAction() {
    followingRef.current = true;
    setFollowing(true);
    focusRef.current = true;
    setDeliveryError(false);
  }

  function onScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const next = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 96;
    followingRef.current = next;
    setFollowing((current) => (current === next ? current : next));
  }

  function jumpToQuestion() {
    followingRef.current = true;
    setFollowing(true);
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    composerRef.current?.focus();
  }

  function onOption(id: string) {
    if (busy || creatingPix || choiceLock.current || !ready) return;
    choiceLock.current = true;
    markAction();
    if (id === "edit") {
      commit({ type: "edit-last" });
      return;
    }
    if (id === "resume-data") {
      commit({ type: "resume-data" });
      return;
    }
    if (id === "hold-data") {
      commit({ type: "hold-data" });
      return;
    }
    if (id === "unknown") {
      const field = presentation.phase === "their-name" ? "their-name" : "their-date";
      commit({ type: "unknown-data", field });
      return;
    }
    if (id === "unlock") {
      void onUnlock();
      return;
    }
    if (id === "stay") {
      commit({ type: "stay-preview" });
      return;
    }
    if (id === "use-preselect" && state.preview?.preselectId) {
      commit({ type: "choose-format", optionId: state.preview.preselectId });
      return;
    }
    if (id === "choose-other") {
      commit({ type: "choose-other" });
      return;
    }
    if (id === "retry-preview") {
      commit({ type: "retry-preview" });
      return;
    }
    if (id === "continue") {
      commit({ type: "continue-reading" });
      return;
    }
    if (id === "continue-free") {
      commit({ type: "continue-free" });
      return;
    }
    if (id === "show-all") {
      commit({ type: "show-all" });
      return;
    }
    if (id === "reopen") {
      commit({ type: "reopen-offer" });
      return;
    }
    if (presentation.phase === "format") {
      commit({ type: "choose-format", optionId: id });
      return;
    }
    if (presentation.phase === "quiz" && presentation.stepId) {
      commit({ type: "choose", stepId: presentation.stepId, optionId: id });
    }
  }

  async function onUnlock() {
    if (lockRef.current || !state.sessionId) return;
    const formatId = state.formatId ?? "resposta";
    lockRef.current = true;
    setBusy(true);
    setPaymentNote(null);
    try {
      const response = await fetch("/api/leitura/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...readingPayload(state), formatId }),
      });
      const body = (await response.json()) as { id?: string; status?: string; error?: string };
      if (!response.ok || !body.id) {
        setPaymentNote(body.error || "Não foi possível iniciar o pagamento agora. Tente novamente em alguns instantes.");
        return;
      }
      markAction();
      setPix(null);
      setPixGate("waiting");
      setReleaseAllowed(false);
      setCheckFailed(false);
      if (body.status === "approved") {
        const unlocked = await unlockApproved(body.id);
        if (!unlocked) setPaymentNote("Não foi possível iniciar o pagamento agora. Tente novamente em alguns instantes.");
        else setPixGate("done");
        return;
      }
      commit({ type: "begin-pix-email", orderId: body.id });
    } finally {
      setBusy(false);
      lockRef.current = false;
    }
  }

  async function onPayerEmail(email: string) {
    if (lockRef.current || creatingPix || !state.sessionId || !state.orderId) return;
    if (!isPayerEmail(email)) {
      setPaymentNote("Esse e-mail não parece válido. Confere e tenta de novo.");
      return;
    }
    lockRef.current = true;
    setCreatingPix(true);
    setPaymentNote(null);
    setCheckFailed(false);
    markAction();
    try {
      const response = await fetch("/api/mercado-pago/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payerEmail: email.trim(), sessionId: state.sessionId, orderId: state.orderId }),
      });
      const body = (await response.json()) as PixCreateResponse;
      if (!response.ok && !(body.code === "approved" && body.orderId)) {
        setPaymentNote(body.message || "Não consegui gerar o Pix agora. Tente novamente.");
        return;
      }
      if (body.orderId && body.mpOrderId && body.copyPaste && body.qrSvg) {
        const nextPix: PixView = {
          orderId: body.orderId,
          mpOrderId: body.mpOrderId,
          copyPaste: body.copyPaste,
          qrSvg: body.qrSvg,
          testMode: Boolean(body.testMode),
          chargeState: body.chargeState ?? "open",
        };
        setPix(nextPix);
        setPixAttempt((value) => value + 1);
        commit({ type: "set-order", orderId: body.orderId, status: "pending" });
        trackMdaAddPaymentInfo();
        if (body.code === "approved" || body.status === "approved") {
          await handleBackendApproved(body.orderId, nextPix.testMode, body.eventId ?? body.mpOrderId);
        } else {
          setPixGate("waiting");
          setReleaseAllowed(false);
        }
        return;
      }
      if ((body.code === "approved" || body.status === "approved") && body.orderId) {
        const unlocked = await unlockApproved(body.orderId);
        if (unlocked) setPixGate("done");
        else setPaymentNote(body.message || "Não consegui gerar o Pix agora. Tente novamente.");
        return;
      }
      setPaymentNote(body.message || "Não consegui gerar o Pix agora. Tente novamente.");
    } catch {
      setPaymentNote("Não consegui gerar o Pix agora. Tente novamente.");
    } finally {
      setCreatingPix(false);
      lockRef.current = false;
    }
  }

  async function unlockApproved(orderId: string) {
    const current = stateRef.current;
    if (!current.sessionId) return false;
    const document = await fetch("/api/leitura/pedido/documento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: current.sessionId, orderId }),
    });
    if (!document.ok) return false;
    const paid = (await document.json()) as PaidPayload;
    if (!paid.blocks?.length) return false;
    markAction();
    commit({
      type: "set-order",
      orderId,
      status: "approved",
      blocks: paid.blocks,
      plan: paid.plan ?? null,
      figures: paid.figures ?? null,
      readAt: paid.readAt ?? null,
    });
    setPaymentNote(null);
    setCheckFailed(false);
    setPixGate("done");
    return true;
  }

  async function handleBackendApproved(orderId: string, testMode: boolean, eventId?: string) {
    setReleaseAllowed(true);
    if (testMode) {
      setPixGate("test-ready");
      setCheckFailed(false);
      setPaymentNote(null);
      return true;
    }
    const unlocked = await unlockApproved(orderId);
    if (!unlocked) {
      setReleaseAllowed(false);
      setCheckFailed(true);
      setPaymentNote("Não consegui confirmar agora. Tente verificar novamente.");
      return false;
    }
    const purchaseEventId = eventId?.trim() || pixRef.current?.mpOrderId || "";
    if (purchaseEventId) trackMdaCompraConcluida(purchaseEventId);
    return true;
  }

  async function continueTestReading() {
    if (pixGateRef.current !== "test-ready" || !releaseAllowedRef.current) return;
    const current = stateRef.current;
    if (!current.orderId || current.payment !== "pending") return;
    if (lockRef.current) return;
    lockRef.current = true;
    setBusy(true);
    try {
      const unlocked = await unlockApproved(current.orderId);
      if (!unlocked) {
        setCheckFailed(true);
        setPaymentNote("Não consegui liberar a leitura agora. Tente novamente.");
      }
    } finally {
      setBusy(false);
      lockRef.current = false;
    }
  }

  async function verifyPayment(options: { silent?: boolean } = {}) {
    const current = stateRef.current;
    const currentPix = pixRef.current;
    if (!current.sessionId || !current.orderId || !currentPix?.mpOrderId || current.payment !== "pending") return;
    if (pixGateRef.current === "test-ready" || pixGateRef.current === "done") return;
    if (checkInFlight.current) return;
    checkInFlight.current = true;
    if (!options.silent) {
      setCheckingPix(true);
      setPaymentNote(null);
    }
    try {
      const response = await fetch("/api/mercado-pago/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: current.sessionId, orderId: currentPix.mpOrderId }),
      });
      const body = (await response.json()) as { status?: string; eventId?: string; testMode?: boolean };
      if (!response.ok || !body.status || body.status === "error") {
        setCheckFailed(true);
        if (!options.silent) setPaymentNote("Não consegui confirmar agora. Tente verificar novamente.");
        return;
      }
      if (body.status === "approved") {
        const ok = await handleBackendApproved(
          current.orderId,
          body.testMode === true || currentPix.testMode,
          body.eventId ?? currentPix.mpOrderId,
        );
        if (!ok && !options.silent) setPaymentNote("Não consegui confirmar agora. Tente verificar novamente.");
        return;
      }
      if (body.status === "rejected" || body.status === "cancelled" || body.status === "expired") {
        setPix((value) => (value ? { ...value, chargeState: body.status as PixChargeState } : value));
        setPixGate("waiting");
        setReleaseAllowed(false);
        commit({ type: "retry-pix-email" });
        setPaymentNote(null);
        return;
      }
      setCheckFailed(false);
      if (!options.silent) setPaymentNote("O pagamento ainda não está aprovado.");
    } catch {
      setCheckFailed(true);
      if (!options.silent) setPaymentNote("Não consegui confirmar agora. Tente verificar novamente.");
    } finally {
      checkInFlight.current = false;
      setCheckingPix(false);
    }
  }

  useEffect(() => {
    verifyRef.current = verifyPayment;
  });

  useEffect(() => {
    if (state.payment !== "pending" || !pix?.mpOrderId || !state.sessionId) return;
    if (pix.chargeState !== "open") return;
    if (pixGate !== "waiting") return;
    let stopped = false;
    let polls = 0;
    const maxPolls = Math.ceil(AUTO_POLL_LIMIT_MS / AUTO_POLL_MS);
    let timer: number | null = null;

    const tick = async () => {
      if (stopped || checkInFlight.current) return;
      if (polls >= maxPolls) return;
      polls += 1;
      await verifyRef.current({ silent: true });
      if (stopped) return;
      if (stateRef.current.payment !== "pending") return;
      timer = window.setTimeout(() => {
        void tick();
      }, AUTO_POLL_MS);
    };

    timer = window.setTimeout(() => {
      void tick();
    }, AUTO_POLL_MS);

    return () => {
      stopped = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [state.payment, state.sessionId, pix?.mpOrderId, pix?.chargeState, pixAttempt, pixGate]);

  useEffect(() => {
    if (state.payment !== "pending" || !pix?.mpOrderId || !state.sessionId) return;
    if (pixGate === "done") return;
    return attachPaymentResumeListeners({
      onVisible: () => {
        void verifyRef.current({ silent: true });
        setPixAttempt((current) => current + 1);
      },
    });
  }, [state.payment, state.sessionId, pix?.mpOrderId, pixGate]);

  function onRetry() {
    followingRef.current = true;
    setFollowing(true);
    setDeliveryError(false);
    setBusy(true);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 320;
    window.setTimeout(() => setBusy(false), delay);
  }

  function onEntry(who: PersonSide, kind: "name" | "date" | "email", value: string) {
    if (kind === "email") {
      void onPayerEmail(value);
      return;
    }
    markAction();
    if (kind === "name") {
      commit({ type: "submit-name", who, name: value });
      return;
    }
    const parsed = parseBirthInput(value, today);
    if (!parsed.ok) return;
    commit({ type: "submit-date", who, date: parsed.date, today });
  }

  function onReset() {
    announcedRef.current = null;
    const opening = reducedMotion ? present(initialState, today).messages.length : 1;
    prevIdsRef.current = reducedMotion ? present(initialState, today).messages.map((message) => message.id) : [];
    shownCountRef.current = opening;
    setShownCount(opening);
    clearSession();
    dispatch({ type: "reset" });
    setConfirmReset(false);
    setMenuOpen(false);
    setBusy(false);
    setCreatingPix(false);
    setDeliveryError(false);
    setPaymentNote(null);
    setPix(null);
    setPixGate("waiting");
    setReleaseAllowed(false);
    setCheckFailed(false);
    lockRef.current = false;
    choiceLock.current = false;
    followingRef.current = true;
    setFollowing(true);
  }

  const optionsOpen = ready;
  const composerLabel = presentation.options.length > 0 || presentation.entry ? "pergunta-atual" : undefined;

  return (
    <main className={styles.page} data-phase={presentation.phase} data-ready={ready ? "true" : "false"} data-shown={visibleCount}>
      <section className={styles.column} aria-labelledby="titulo-leitura">
        <a className={styles.skip} href="#opcoes">
          Ir para as opções
        </a>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.avatar}
            aria-label="Reiniciar a conversa"
            onClick={() => {
              setMenuOpen(false);
              setConfirmReset(true);
            }}
          >
            <Image className={styles.avatarImage} src="/matematica-do-amor/astarte-mark.png" alt="" width={80} height={80} />
          </button>
          <div className={styles.titles}>
            <h1 id="titulo-leitura" className={styles.title}>
              Matemática do Amor
            </h1>
            <p className={styles.subtitle}>Leitura de compatibilidade amorosa</p>
          </div>
          <div className={styles.menuWrap} ref={menuRef}>
            <button
              type="button"
              className={styles.menuButton}
              aria-label="Mais opções"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true">⋯</span>
            </button>
            {menuOpen ? (
              <div className={styles.menu} role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmReset(true);
                  }}
                >
                  Começar de novo
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <details className={styles.how}>
          <summary>Como funciona</summary>
          <p>{SYMBOLIC_NOTE}</p>
        </details>
        {presentation.showProgress ? (
          <div className={styles.progress} aria-label="Sua orientação completa, 4 partes">
            <p>Sua orientação completa · 4 partes</p>
            <ol>
              {PAID_CHAPTERS.map((chapter, index) => (
                <li key={chapter.mark} data-done={index < presentation.chaptersDone ? "true" : "false"}>
                  {index < presentation.chaptersDone ? "✓" : "·"} {chapter.mark}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {confirmReset ? (
          <div className={styles.confirm} role="dialog" aria-labelledby="reiniciar-titulo">
            <p id="reiniciar-titulo">Quer reiniciar a conversa?</p>
            <button type="button" className={styles.confirmPrimary} onClick={onReset}>
              Reiniciar
            </button>
            <button type="button" className={styles.confirmQuiet} onClick={() => setConfirmReset(false)}>
              Agora não
            </button>
          </div>
        ) : null}

        <div className={styles.threadWrap}>
          <div ref={scrollerRef} className={styles.thread} onScroll={onScroll}>
            <ol className={styles.list} aria-label="Conversa">
              {shown.map((message, index) => (
                <li key={message.id} className={message.role === "user" ? styles.userRow : styles.assistantRow}>
                  <div className={`${message.role === "user" ? styles.user : styles.assistant} ${message.kind === "plan" ? styles.plan : ""} ${index === shown.length - 1 ? styles.enter : ""}`}>
                    {message.kind === "save" ? (
                      <SaveCard
                        source={{
                          youName: state.yourFirst || "você",
                          theirName: state.theirFirst || "a outra pessoa",
                          readAt: state.readAt ? new Date(state.readAt) : new Date(),
                          blocks: state.blocks ?? [],
                          plan: state.plan ?? [],
                          figures: state.figures,
                        }}
                      />
                    ) : message.kind === "instagram" ? (
                      <InstagramCard />
                    ) : (
                      <p id={message.id === lastAssistant?.id ? "pergunta-atual" : undefined} aria-label={message.kind === "wait" ? "Preparando a próxima mensagem" : undefined}>
                        {message.text}
                      </p>
                    )}
                    {message.calc ? (
                      <details className={styles.calc}>
                        <summary>Como calculei</summary>
                        <p>{message.calc}</p>
                      </details>
                    ) : null}
                    {message.kind === "pix" && presentation.showPix && pix ? (
                      <PixCard
                        pix={pix}
                        mode={state.payment === "approved" || pixGate === "done" ? "confirmed" : pixGate === "test-ready" ? "test-ready" : "waiting"}
                        checking={checkingPix}
                        checkFailed={checkFailed}
                        continuing={busy && pixGate === "test-ready"}
                        onVerify={() => {
                          void verifyPayment();
                        }}
                        onContinueTest={() => {
                          void continueTestReading();
                        }}
                      />
                    ) : null}
                  </div>
                </li>
              ))}
              {presentation.phase === "loading" && !state.previewError && !state.prepDone ? (
                <PrepCard startedAt={state.prepStartedAt} now={prepNow} reduced={reducedMotion} previewReady={Boolean(state.preview)} firstName={state.theirFirst} />
              ) : null}
              {typing && presentation.phase !== "loading" ? (
                <li className={styles.assistantRow}>
                  <div className={styles.assistant} aria-label="Preparando a próxima mensagem">
                    <p className={styles.typing} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </p>
                  </div>
                </li>
              ) : null}
            </ol>
          </div>
          {!following ? (
            <button type="button" className={styles.jump} onClick={jumpToQuestion}>
              Ver a pergunta
            </button>
          ) : null}
        </div>

        <div
          id="opcoes"
          ref={composerRef}
          tabIndex={-1}
          className={styles.composer}
          aria-label={composerLabel ? undefined : "Ações da conversa"}
          aria-labelledby={composerLabel}
          hidden={!optionsOpen && !deliveryError && !creatingPix}
        >
          {optionsOpen && presentation.entry ? <p className={styles.hint}>Escreve e envia</p> : null}
          {optionsOpen && presentation.phase === "offer" ? <p className={styles.hint}>Pagamento único</p> : null}
          {optionsOpen && presentation.options.length > 0 && !presentation.entry && presentation.phase !== "offer" ? (
            <p className={styles.hint}>Escolha uma opção</p>
          ) : null}
          {paymentNote ? (
            <p className={styles.error} role="status">
              {paymentNote}
            </p>
          ) : null}
          {creatingPix ? (
            <p className={styles.hint} role="status">
              Gerando seu Pix…
            </p>
          ) : null}
          <div className={styles.composerBody}>
            {optionsOpen && presentation.entry ? (
              <EntryForm
                key={`${presentation.phase}-${state.choices.length}-${state.pixRetry ? "retry" : "once"}`}
                entry={presentation.entry}
                today={today}
                disabled={creatingPix}
                initial={
                  presentation.entry.kind === "name"
                    ? presentation.entry.who === "you"
                      ? state.yourName ?? ""
                      : state.theirName ?? ""
                    : presentation.entry.kind === "date"
                      ? presentation.entry.who === "you"
                        ? dateLabel(state.yourDate)
                        : dateLabel(state.theirDate)
                      : ""
                }
                onSubmit={(value) => onEntry(presentation.entry!.who, presentation.entry!.kind, value)}
              />
            ) : null}
            {optionsOpen
              ? presentation.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={option.tone === "primary" ? styles.primary : option.tone === "quiet" ? styles.quiet : styles.option}
                    onClick={() => onOption(option.id)}
                    disabled={busy || creatingPix}
                  >
                    {option.label}
                  </button>
                ))
              : null}
            {deliveryError ? (
              <button type="button" className={styles.primary} onClick={onRetry}>
                Tentar de novo
              </button>
            ) : null}
            {optionsOpen && presentation.showEdit ? (
              <button
                type="button"
                className={styles.edit}
                onClick={() => {
                  markAction();
                  commit({ type: "edit-last" });
                }}
                disabled={busy || creatingPix}
              >
                Editar última resposta
              </button>
            ) : null}
          </div>
        </div>
        <div ref={liveRef} className={styles.srOnly} aria-live="polite" aria-atomic="true" />
      </section>
    </main>
  );
}

function visibleMessages(
  presentation: Presentation,
  flags: { visibleCount: number; busy: boolean; deliveryError: boolean },
): ChatMessage[] {
  const base = presentation.messages.slice(0, flags.visibleCount);
  if (flags.busy) {
    return [...base.filter((message) => message.kind !== "paid"), { id: "preparing", role: "assistant", text: PREPARING_LABEL }];
  }
  if (flags.deliveryError) {
    return [
      ...base.filter((message) => message.kind !== "paid"),
      {
        id: "delivery-error",
        role: "assistant",
        text: "A leitura não entrou. O pagamento continua confirmado no Mercado Pago.",
      },
    ];
  }
  return base;
}

function PixCard({
  pix,
  mode,
  checking,
  checkFailed,
  continuing,
  onVerify,
  onContinueTest,
}: {
  pix: PixView;
  mode: "waiting" | "test-ready" | "confirmed";
  checking: boolean;
  checkFailed: boolean;
  continuing: boolean;
  onVerify: () => void;
  onContinueTest: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(pix.copyPaste);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  if (mode === "confirmed") {
    return (
      <section className={styles.pix} aria-label="Pagamento Pix">
        <p className={styles.status}>Pagamento confirmado</p>
      </section>
    );
  }

  return (
    <section className={styles.pix} aria-label="Pagamento Pix">
      <p className={styles.total}>
        {PAYMENT_ONCE} · {PRICE_LABEL}
      </p>
      <p className={styles.status}>{mode === "test-ready" ? "Pagamento de teste aprovado." : PIX_STATUS}</p>
      {pix.testMode ? <p className={styles.pixNote}>Ambiente de teste: nenhum valor real será cobrado.</p> : null}
      <figure className={styles.qr} aria-label="QR Code do Pix" dangerouslySetInnerHTML={{ __html: pix.qrSvg }} />
      <label className={styles.group}>
        <span className={styles.legend}>Pix Copia e Cola</span>
        <textarea className={styles.pixCode} value={pix.copyPaste} readOnly rows={3} />
      </label>
      <button type="button" className={styles.primary} onClick={() => void copyCode()}>
        Copiar código Pix
      </button>
      {copied ? (
        <p className={styles.pixNote} role="status">
          Código Pix copiado
        </p>
      ) : null}
      {mode === "test-ready" ? (
        <button type="button" className={styles.primary} onClick={onContinueTest} disabled={continuing}>
          {continuing ? "Liberando leitura…" : "Continuar teste e liberar leitura"}
        </button>
      ) : (
        <button type="button" className={styles.quiet} onClick={onVerify} disabled={checking}>
          {checkFailed ? "Verificar pagamento novamente" : checking ? "Verificando…" : "Já paguei, verificar pagamento"}
        </button>
      )}
    </section>
  );
}

function readingPayload(state: Parameters<typeof present>[0]) {
  return {
    sessionId: state.sessionId,
    answers: answersOf(state),
    yourName: state.yourName,
    theirName: state.theirName,
    yourDate: state.yourDate,
    theirDate: state.theirDate,
    formatId: state.formatId,
  };
}

function SaveCard({ source }: { source: ReadingSource }) {
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");

  async function onClick() {
    if (status === "working") return;
    setStatus("working");
    try {
      const { downloadReadingPdf } = await import("../../domain/reading-pdf");
      await downloadReadingPdf(source);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.saveCard}>
      <p className={styles.saveTitle}>Guarde sua orientação</p>
      <p>Baixe sua leitura completa para consultar novamente quando precisar.</p>
      <button type="button" className={styles.primary} disabled={status === "working"} onClick={() => void onClick()}>
        {status === "working" ? "Preparando sua leitura…" : "Baixar minha leitura em PDF"}
      </button>
      {status === "done" ? <p role="status">Sua leitura foi baixada.</p> : null}
      {status === "error" ? (
        <p className={styles.error} role="alert">
          Não foi possível preparar o PDF. Tente novamente.
        </p>
      ) : null}
    </div>
  );
}

function InstagramCard() {
  return (
    <div className={styles.saveCard}>
      <p>Quer continuar recebendo conteúdos sobre amor, numerologia e espiritualidade? Siga a Magia Astarte no Instagram.</p>
      <a className={styles.instagramLink} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
        Seguir {INSTAGRAM_HANDLE}
      </a>
    </div>
  );
}

function PrepCard({
  startedAt,
  now,
  reduced,
  previewReady,
  firstName,
}: {
  startedAt: number | null;
  now: number;
  reduced: boolean;
  previewReady: boolean;
  firstName: string | null;
}) {
  const progress = prepProgress(startedAt, now, reduced, previewReady);
  return (
    <li className={styles.assistantRow}>
      <div className={styles.prep} aria-live="polite">
        <ol>
          {PREP_STEPS.map((step, index) => {
            const done = index < progress.done;
            const active = index === progress.active;
            if (!done && !active) return null;
            return (
              <li key={step} data-state={done ? "done" : "active"}>
                <span aria-hidden="true">{done ? "✓" : "…"}</span> {prepLabel(index, firstName)}
              </li>
            );
          })}
        </ol>
      </div>
    </li>
  );
}

function dateLabel(date: DateParts | null): string {
  if (!date) return "";
  return `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`;
}

function EntryForm({
  entry,
  initial,
  today,
  disabled = false,
  onSubmit,
}: {
  entry: EntryField;
  initial: string;
  today: Date;
  disabled?: boolean;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const label = entry.kind === "name" ? "Nome completo de nascimento" : entry.kind === "date" ? "Data de nascimento" : "E-mail";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    if (entry.kind === "name") {
      const parsed = validateFullName(value);
      if (!parsed.ok) {
        setError(parsed.message);
        return;
      }
      setError(null);
      onSubmit(parsed.name);
      return;
    }
    if (entry.kind === "email") {
      if (!isPayerEmail(value)) {
        setError("Esse e-mail não parece válido. Confere e tenta de novo.");
        return;
      }
      setError(null);
      onSubmit(value.trim());
      return;
    }
    const parsed = parseBirthInput(value, today);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    setError(null);
    onSubmit(value);
  }

  return (
    <form className={styles.dateCard} onSubmit={submit}>
      <label className={styles.group}>
        <span className={styles.legend}>{label}</span>
        <input
          className={styles.field}
          value={value}
          type={entry.kind === "email" ? "email" : "text"}
          inputMode={entry.kind === "date" ? "numeric" : entry.kind === "email" ? "email" : "text"}
          autoComplete={entry.kind === "email" ? "email" : "off"}
          enterKeyHint="send"
          placeholder={entry.kind === "date" ? "DD/MM/AAAA" : entry.kind === "email" ? "seu@email.com" : "Nome de nascimento"}
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          onChange={(event) => {
            setError(null);
            setValue(entry.kind === "date" ? maskBirthInput(event.target.value) : event.target.value);
          }}
        />
      </label>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className={styles.submit} disabled={disabled}>
        {entry.submitLabel}
      </button>
    </form>
  );
}
