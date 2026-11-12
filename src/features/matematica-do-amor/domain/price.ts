/**
 * TEMPORÁRIO — teste real de Pix em produção.
 * Restaurar para 1990 (R$ 19,90) imediatamente após o teste.
 */
export const MDA_PRICE_CENTS = 1 as const;

export const MDA_CHARGE_AMOUNT = formatChargeAmount(MDA_PRICE_CENTS);
export const MDA_PRICE_LABEL = formatPriceLabel(MDA_PRICE_CENTS);
export const MDA_PRICE_VALUE = MDA_PRICE_CENTS / 100;

export function formatChargeAmount(cents: number): string {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `${whole}.${fraction}`;
}

export function formatPriceLabel(cents: number): string {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `R$ ${whole},${fraction}`;
}
