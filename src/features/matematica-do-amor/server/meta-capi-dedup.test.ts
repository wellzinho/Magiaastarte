import { afterEach, describe, expect, it } from "vitest";
import {
  claimMetaPurchaseSend,
  markMetaPurchaseFailed,
  markMetaPurchaseSent,
  readMetaPurchaseSendState,
  resetMetaCapiDedup,
} from "./meta-capi-dedup";

const mpOrderId = "ORD01ABCDEFGH";

afterEach(() => {
  resetMetaCapiDedup();
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
  process.env.ORDER_STORE_MODE = "memory";
  process.env.MERCADO_PAGO_MODE = "test";
});

describe("deduplicação CAPI da Matemática do Amor", () => {
  it("só permite um envio simultâneo e bloqueia polling repetido", async () => {
    const env = {
      ORDER_STORE_MODE: "memory",
      MERCADO_PAGO_MODE: "test",
    } as unknown as NodeJS.ProcessEnv;

    expect(await claimMetaPurchaseSend(mpOrderId, env)).toBe("proceed");
    expect(await claimMetaPurchaseSend(mpOrderId, env)).toBe("skip");
    expect(await readMetaPurchaseSendState(mpOrderId, env)).toBe("sending");

    await markMetaPurchaseSent(mpOrderId, env);
    expect(await claimMetaPurchaseSend(mpOrderId, env)).toBe("skip");
    expect(await readMetaPurchaseSendState(mpOrderId, env)).toBe("sent");
  });

  it("permite nova tentativa controlada após falha", async () => {
    const env = {
      ORDER_STORE_MODE: "memory",
      MERCADO_PAGO_MODE: "test",
    } as unknown as NodeJS.ProcessEnv;

    expect(await claimMetaPurchaseSend(mpOrderId, env)).toBe("proceed");
    await markMetaPurchaseFailed(mpOrderId, env);
    expect(await readMetaPurchaseSendState(mpOrderId, env)).toBe("failed");
    expect(await claimMetaPurchaseSend(mpOrderId, env)).toBe("proceed");
  });
});
