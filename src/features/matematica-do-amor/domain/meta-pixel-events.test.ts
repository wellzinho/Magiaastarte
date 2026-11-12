import { afterEach, describe, expect, it, vi } from "vitest";
import {
  resetMetaPixelEvents,
  trackMdaAddPaymentInfo,
  trackMdaCompraConcluida,
  trackMdaInitiateCheckout,
  trackMdaQuizStarted,
  trackMdaViewContent,
} from "./meta-pixel-events";

afterEach(() => {
  resetMetaPixelEvents();
  vi.unstubAllGlobals();
});

describe("eventos Meta da Matemática do Amor", () => {
  it("dispara ViewContent e QuizStarted uma vez, sem dados pessoais", () => {
    const fbq = vi.fn();
    vi.stubGlobal("window", { fbq });

    trackMdaViewContent();
    trackMdaViewContent();
    trackMdaQuizStarted();
    trackMdaQuizStarted();
    trackMdaInitiateCheckout();
    trackMdaAddPaymentInfo();

    expect(fbq).toHaveBeenCalledWith(
      "track",
      "ViewContent",
      expect.objectContaining({ content_ids: ["matematica_do_amor"], value: 19.9, currency: "BRL" }),
    );
    expect(fbq).toHaveBeenCalledWith(
      "trackCustom",
      "QuizStarted",
      expect.objectContaining({ content_name: "Matemática do Amor" }),
    );
    const payloads = fbq.mock.calls.flatMap((call) => call.slice(2)).map((item) => JSON.stringify(item));
    expect(payloads.some((item) => /@|nascimento|resposta|orientacao sexual|genero/i.test(item))).toBe(false);
    expect(fbq.mock.calls.filter((call) => call[1] === "ViewContent")).toHaveLength(1);
    expect(fbq.mock.calls.filter((call) => call[1] === "QuizStarted")).toHaveLength(1);
  });

  it("deduplica CompraConcluida pelo event_id", () => {
    const fbq = vi.fn();
    vi.stubGlobal("window", { fbq });
    trackMdaCompraConcluida("ORD01ABCDEFGH");
    trackMdaCompraConcluida("ORD01ABCDEFGH");
    expect(fbq).toHaveBeenCalledTimes(1);
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "CompraConcluida",
      expect.objectContaining({ content_ids: ["matematica_do_amor"] }),
      { eventID: "ORD01ABCDEFGH" },
    );
  });
});
