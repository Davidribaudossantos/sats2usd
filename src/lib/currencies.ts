export interface CurrencyInfo {
  name: string;
  symbol: string;
  icon: string;
  path: string;
  fxCode: string | null;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { name: "US Dollar",      symbol: "$",  icon: "/usd-icon.svg", path: "/convert/usd-to-sats", fxCode: null  },
  EUR: { name: "Euro",           symbol: "€",  icon: "/Euro.svg",     path: "/convert/eur-to-sats", fxCode: "EUR" },
  GBP: { name: "British Pound",  symbol: "£",  icon: "/GBP.svg",      path: "/convert/gbp-to-sats", fxCode: "GBP" },
  JPY: { name: "Japanese Yen",   symbol: "¥",  icon: "/JPY.svg",      path: "/convert/jpy-to-sats", fxCode: "JPY" },
  BRL: { name: "Brazilian Real", symbol: "R$", icon: "/BRL.svg",      path: "/convert/brl-to-sats", fxCode: "BRL" },
};

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "BRL";
export const CURRENCY_CODES: CurrencyCode[] = ["USD", "EUR", "GBP", "JPY", "BRL"];
