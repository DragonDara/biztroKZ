export type Currency = "MXN" | "USD" | "KZT"

const CURRENCY_SYMBOL: Record<Currency, string> = {
  MXN: "$",
  USD: "$",
  KZT: "₸"
}

/** Narrow no-break space — common thousands separator for kk/ru, avoids line breaks. */
const GROUP_SEP_SPACE = "\u202F"
const GROUP_SEP_COMMA = ","
const DECIMAL_COMMA = ","
const DECIMAL_DOT = "."

/**
 * Pure string formatting — no Intl. NumberFormat ICU data differs between
 * Node and browsers (symbol position, `5 000` vs `5,000`), which breaks SSR hydration.
 */
function formatAmount(amount: number, currency: Currency): string {
  const isWestern = currency === "USD" || currency === "MXN"
  const groupSep = isWestern ? GROUP_SEP_COMMA : GROUP_SEP_SPACE
  const decimalSep = isWestern ? DECIMAL_DOT : DECIMAL_COMMA

  const negative = amount < 0 || Object.is(amount, -0)
  const absolute = Math.abs(amount)
  // Keep at most 2 decimal places without forcing trailing zeros for integers.
  const rounded = Math.round(absolute * 100) / 100
  const hasFraction = !Number.isInteger(rounded)
  const fixed = hasFraction ? rounded.toFixed(2) : String(Math.trunc(rounded))
  const [integerPart = "0", fractionPart] = fixed.split(".")

  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep)
  const body =
    hasFraction && fractionPart !== undefined
      ? `${groupedInteger}${decimalSep}${fractionPart}`
      : groupedInteger

  return negative ? `-${body}` : body
}

export function formatPrice(amount: number, currency: Currency): string {
  return `${formatAmount(amount, currency)} ${CURRENCY_SYMBOL[currency]}`
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
