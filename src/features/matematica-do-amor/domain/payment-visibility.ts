export type PaymentResumeHandlers = {
  onVisible: () => void;
};

/** Reconsulta pagamento ao voltar do app do banco, sem criar loops extras por si só. */
export function attachPaymentResumeListeners(handlers: PaymentResumeHandlers): () => void {
  const resume = () => {
    if (typeof document !== "undefined" && document.visibilityState && document.visibilityState !== "visible") {
      return;
    }
    handlers.onVisible();
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") handlers.onVisible();
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", resume);

  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pageshow", resume);
  };
}
