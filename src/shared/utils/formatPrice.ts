/**
 * Currency formatting utility with support for multiple currencies
 * Defaults to Nigerian Naira (NGN)
 */

export type Currency = "NGN" | "USD" | "EUR" | "GBP" | "CAD" | "AUD";

export interface FormatPriceOptions {
  currency?: Currency;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
  compact?: boolean;
}

// Currency configurations
const CURRENCY_CONFIG = {
  NGN: {
    symbol: "₦",
    code: "NGN",
    locale: "en-NG",
    fallbackSymbol: "N",
  },
  USD: {
    symbol: "$",
    code: "USD",
    locale: "en-US",
    fallbackSymbol: "$",
  },
  EUR: {
    symbol: "€",
    code: "EUR",
    locale: "en-EU",
    fallbackSymbol: "€",
  },
  GBP: {
    symbol: "£",
    code: "GBP",
    locale: "en-GB",
    fallbackSymbol: "£",
  },
  CAD: {
    symbol: "C$",
    code: "CAD",
    locale: "en-CA",
    fallbackSymbol: "C$",
  },
  AUD: {
    symbol: "A$",
    code: "AUD",
    locale: "en-AU",
    fallbackSymbol: "A$",
  },
} as const;

/**
 * Formats a number as currency with proper localization
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatPrice(
  amount: number | string,
  options: FormatPriceOptions = {}
): string {
  const {
    currency = "NGN",
    locale,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    showSymbol = true,
    compact = false,
  } = options;

  // Convert string to number if needed
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  // Handle invalid numbers
  if (isNaN(numericAmount)) {
    return showSymbol ? `${CURRENCY_CONFIG[currency].fallbackSymbol}0` : "0";
  }

  const config = CURRENCY_CONFIG[currency];
  const targetLocale = locale || config.locale;

  try {
    // Use Intl.NumberFormat for proper localization
    const formatter = new Intl.NumberFormat(targetLocale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits,
      maximumFractionDigits,
      notation: compact ? "compact" : "standard",
    });

    let formatted = formatter.format(numericAmount);

    // For NGN, replace the default symbol with our preferred symbol
    if (currency === "NGN" && showSymbol) {
      // Remove the default currency symbol and add our preferred one
      formatted = formatted.replace(/[₦N]/, "").trim();
      formatted = `${config.symbol}${formatted}`;
    }

    return formatted;
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    const formattedNumber = numericAmount.toLocaleString(targetLocale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return showSymbol
      ? `${config.fallbackSymbol}${formattedNumber}`
      : formattedNumber;
  }
}

/**
 * Formats a price with Naira as default (convenience function)
 * @param amount - The amount to format
 * @param options - Additional formatting options
 * @returns Formatted Naira price string
 */
export function formatNaira(
  amount: number | string,
  options: Omit<FormatPriceOptions, "currency"> = {}
): string {
  return formatPrice(amount, { ...options, currency: "NGN" });
}

/**
 * Formats a price for display in tables/lists (compact format)
 * @param amount - The amount to format
 * @param currency - Currency to use
 * @returns Compact formatted price string
 */
export function formatPriceCompact(
  amount: number | string,
  currency: Currency = "NGN"
): string {
  return formatPrice(amount, { currency, compact: true });
}

/**
 * Formats a price without currency symbol (for calculations)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted number string without currency symbol
 */
export function formatPriceNumber(
  amount: number | string,
  options: Omit<FormatPriceOptions, "showSymbol"> = {}
): string {
  return formatPrice(amount, { ...options, showSymbol: false });
}

// Export commonly used formatters
export const formatNairaCompact = (amount: number | string) =>
  formatPriceCompact(amount, "NGN");

export const formatNairaNumber = (amount: number | string) =>
  formatPriceNumber(amount, { currency: "NGN" });
