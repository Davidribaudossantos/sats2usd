export type PairSlug =
  | "usd-to-sats"
  | "eur-to-sats"
  | "gbp-to-sats"
  | "jpy-to-sats"
  | "brl-to-sats";

export interface CurrencyPair {
  currency: string;
  currencyName: string;
  /** Frankfurter rate code. null = USD (no FX fetch needed). */
  fxCode: string | null;
  h1: string;
  seoTitle: string;
  seoDescription: string;
}

export const CURRENCY_PAIRS: Record<PairSlug, CurrencyPair> = {
  "usd-to-sats": {
    currency: "USD",
    currencyName: "US Dollar",
    fxCode: null,
    h1: "US Dollar to Satoshis converter",
    seoTitle: "USD to Sats Converter — Live US Dollar to Satoshi Calculator",
    seoDescription:
      "Convert US dollars to satoshis instantly with live Bitcoin prices. Free, real-time USD to sats calculator — no sign-up required.",
  },
  "eur-to-sats": {
    currency: "EUR",
    currencyName: "Euro",
    fxCode: "EUR",
    h1: "Euro to Satoshis converter",
    seoTitle: "EUR to Sats Converter — Live Euro to Satoshi Calculator",
    seoDescription:
      "Convert euros to satoshis instantly with live Bitcoin prices. Free, real-time EUR to sats calculator — no sign-up required.",
  },
  "gbp-to-sats": {
    currency: "GBP",
    currencyName: "British Pound",
    fxCode: "GBP",
    h1: "British Pound to Satoshis converter",
    seoTitle: "GBP to Sats Converter — Live British Pound to Satoshi Calculator",
    seoDescription:
      "Convert British pounds to satoshis instantly with live Bitcoin prices. Free, real-time GBP to sats calculator — no sign-up required.",
  },
  "jpy-to-sats": {
    currency: "JPY",
    currencyName: "Japanese Yen",
    fxCode: "JPY",
    h1: "Japanese Yen to Satoshis converter",
    seoTitle: "JPY to Sats Converter — Live Japanese Yen to Satoshi Calculator",
    seoDescription:
      "Convert Japanese yen to satoshis instantly with live Bitcoin prices. Free, real-time JPY to sats calculator — no sign-up required.",
  },
  "brl-to-sats": {
    currency: "BRL",
    currencyName: "Brazilian Real",
    fxCode: "BRL",
    h1: "Brazilian Real to Satoshis converter",
    seoTitle: "BRL to Sats Converter — Live Brazilian Real to Satoshi Calculator",
    seoDescription:
      "Convert Brazilian reais to satoshis instantly with live Bitcoin prices. Free, real-time BRL to sats calculator — no sign-up required.",
  },
};

export const PAIR_SLUGS = Object.keys(CURRENCY_PAIRS) as PairSlug[];
