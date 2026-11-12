import { siteUrl } from "@/lib/site-url";
import { MDA_PRICE_VALUE } from "./price";

/** Identificação técnica do produto — sem dados pessoais. */
export const MDA_PRODUCT = {
  content_name: "Matemática do Amor",
  content_category: "produto_digital",
  content_ids: ["matematica_do_amor"] as const,
  content_type: "product",
  value: MDA_PRICE_VALUE,
  currency: "BRL",
  num_items: 1,
} as const;

export function mdaEventSourceUrl(env: NodeJS.ProcessEnv = process.env): string {
  return siteUrl("/matematica-do-amor", env);
}

export type MdaProductPayload = {
  content_name: string;
  content_category: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
  num_items: number;
};

export function mdaProductPayload(): MdaProductPayload {
  return {
    content_name: MDA_PRODUCT.content_name,
    content_category: MDA_PRODUCT.content_category,
    content_ids: [...MDA_PRODUCT.content_ids],
    content_type: MDA_PRODUCT.content_type,
    value: MDA_PRODUCT.value,
    currency: MDA_PRODUCT.currency,
    num_items: MDA_PRODUCT.num_items,
  };
}
