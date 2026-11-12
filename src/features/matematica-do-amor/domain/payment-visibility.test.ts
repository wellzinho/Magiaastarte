import { afterEach, describe, expect, it, vi } from "vitest";
import { attachPaymentResumeListeners } from "./payment-visibility";

describe("retorno de visibilidade do pagamento", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("dispara consulta ao ficar visible e no pageshow, sem listeners duplicados após cleanup", () => {
    const onVisible = vi.fn();
    const visibilityHandlers = new Map<string, EventListener>();
    const windowHandlers = new Map<string, EventListener>();
    let visibilityState = "visible";

    const documentMock = {
      get visibilityState() {
        return visibilityState;
      },
      addEventListener: (type: string, handler: EventListener) => {
        visibilityHandlers.set(type, handler);
      },
      removeEventListener: (type: string, handler: EventListener) => {
        if (visibilityHandlers.get(type) === handler) visibilityHandlers.delete(type);
      },
    };

    const windowMock = {
      addEventListener: (type: string, handler: EventListener) => {
        windowHandlers.set(type, handler);
      },
      removeEventListener: (type: string, handler: EventListener) => {
        if (windowHandlers.get(type) === handler) windowHandlers.delete(type);
      },
    };

    vi.stubGlobal("document", documentMock);
    vi.stubGlobal("window", windowMock);

    const detach = attachPaymentResumeListeners({ onVisible });
    expect(visibilityHandlers.has("visibilitychange")).toBe(true);
    expect(windowHandlers.has("pageshow")).toBe(true);

    visibilityHandlers.get("visibilitychange")?.(new Event("visibilitychange"));
    windowHandlers.get("pageshow")?.(new Event("pageshow"));
    expect(onVisible).toHaveBeenCalledTimes(2);

    detach();
    expect(visibilityHandlers.has("visibilitychange")).toBe(false);
    expect(windowHandlers.has("pageshow")).toBe(false);

    visibilityState = "hidden";
    const again = attachPaymentResumeListeners({ onVisible });
    visibilityHandlers.get("visibilitychange")?.(new Event("visibilitychange"));
    expect(onVisible).toHaveBeenCalledTimes(2);
    again();
  });
});
