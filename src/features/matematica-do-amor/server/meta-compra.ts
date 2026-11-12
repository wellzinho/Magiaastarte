import { interpretMetaResponse, META_DATASET_ID } from "@/app/api/kiwify-meta/purchase-event";
import { MDA_PRODUCT, mdaEventSourceUrl } from "../domain/meta-catalog";
import {
  claimMetaPurchaseSend,
  markMetaPurchaseFailed,
  markMetaPurchaseSent,
} from "./meta-capi-dedup";
import { mercadoPagoMode } from "./mercadopago";

export type MdaCompraInput = {
  mpOrderId: string;
  externalReference: string;
  amountCents: number;
  currency: "BRL";
  testMode: boolean;
};

/**
 * Envia CompraConcluida via CAPI após aprovação real.
 * Falhas de analytics não propagam — a leitura já foi liberada.
 */
export async function reportMdaCompraConcluida(input: MdaCompraInput): Promise<{ sent: boolean; reason?: string }> {
  try {
    if (input.testMode) return { sent: false, reason: "test_mode" };
    if (mercadoPagoMode() !== "production") return { sent: false, reason: "not_production" };
    if (input.amountCents !== 1990 || input.currency !== "BRL") return { sent: false, reason: "invalid_amount" };
    if (!input.externalReference.startsWith("astarte_matematica_amor_")) {
      return { sent: false, reason: "invalid_reference" };
    }
    if (!/^[A-Za-z0-9]{10,64}$/.test(input.mpOrderId)) return { sent: false, reason: "invalid_mp_order" };

    const claim = await claimMetaPurchaseSend(input.mpOrderId);
    if (claim === "skip") return { sent: false, reason: "duplicate" };

    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
    if (typeof accessToken !== "string" || accessToken.length === 0) {
      await markMetaPurchaseFailed(input.mpOrderId);
      return { sent: false, reason: "missing_access_token" };
    }

    const event = {
      event_name: "CompraConcluida" as const,
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.mpOrderId,
      action_source: "website" as const,
      event_source_url: mdaEventSourceUrl(),
      user_data: {
        client_user_agent: "matematica-do-amor/server",
      },
      custom_data: {
        value: MDA_PRODUCT.value,
        currency: MDA_PRODUCT.currency,
        content_name: MDA_PRODUCT.content_name,
        content_category: MDA_PRODUCT.content_category,
        content_ids: [...MDA_PRODUCT.content_ids],
        content_type: MDA_PRODUCT.content_type,
        num_items: MDA_PRODUCT.num_items,
      },
    };

    const url = `https://graph.facebook.com/v23.0/${META_DATASET_ID}/events`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: [event], access_token: accessToken }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    const body = await response.json().catch(() => null);
    const interpreted = interpretMetaResponse(response.status, body);
    if (!interpreted.ok) {
      await markMetaPurchaseFailed(input.mpOrderId);
      console.error("MDA Meta CAPI falhou", { status: response.status, code: interpreted.errorCode });
      return { sent: false, reason: "meta_error" };
    }
    await markMetaPurchaseSent(input.mpOrderId);
    return { sent: true };
  } catch {
    try {
      await markMetaPurchaseFailed(input.mpOrderId);
    } catch {
      // ignore
    }
    return { sent: false, reason: "exception" };
  }
}
