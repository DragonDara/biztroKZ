export type Currency = "MXN" | "USD" | "KZT"

export function formatPrice(amount: number, currency: Currency): string {
  const locale =
    currency === "MXN"
      ? "es-MX"
      : currency === "USD"
        ? "en-US"
        : currency === "KZT"
          ? "kk-KZ"
          : "en-US"
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    style: "currency",
    currency,
    currencyDisplay: "symbol"
  }).format(amount)

  return `${formatted} ${currency}`
}

export function formatPriceRange(
  min: number,
  max: number,
  currency: Currency
): string {
  if (min === max) return formatPrice(min, currency)
  return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`
}

export function resolveCurrency(value?: unknown): Currency {
  if (typeof value === "string" && value.toUpperCase() === "USD") return "USD"
  if (typeof value === "string" && value.toUpperCase() === "MXN") return "MXN"
  return "KZT"
}
