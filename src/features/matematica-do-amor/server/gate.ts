export function checkoutAvailability(env: NodeJS.ProcessEnv = process.env): { mode: "mercadopago"; mercadoPago: "test" | "production" } | { mode: "unavailable"; reason: string } {
  const mode = env.MERCADO_PAGO_MODE;
  const token = env.MERCADO_PAGO_ACCESS_TOKEN;
  if ((mode === "test" || mode === "production") && typeof token === "string" && token.trim() !== "") {
    return { mode: "mercadopago", mercadoPago: mode };
  }
  return {
    mode: "unavailable",
    reason: "A cobrança não está disponível agora. Tente novamente em alguns instantes.",
  };
}
