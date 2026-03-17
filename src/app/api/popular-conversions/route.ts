import { NextResponse } from "next/server";

export const revalidate = 21600; // 6 hours

const SATS_PER_BTC = 100_000_000;
const BTC_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
// Request NGN + BRL — Frankfurter uses ECB data so NGN is unavailable;
// BRL is the fallback if NGN is missing from the response.
const FX_URL =
  "https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,NGN,BRL";

function formatSats(sats: number): string {
  if (sats >= 10) return Math.round(sats).toLocaleString("en-US");
  if (sats >= 1) return sats.toFixed(1);
  return sats.toFixed(2);
}

export async function GET() {
  try {
    const [btcRes, fxRes] = await Promise.all([
      fetch(BTC_URL, { next: { revalidate: 21600 } }),
      fetch(FX_URL, { next: { revalidate: 21600 } }),
    ]);

    if (!btcRes.ok) throw new Error("BTC fetch failed");

    const btcData = await btcRes.json();
    const btcPrice: number = btcData?.bitcoin?.usd;
    if (typeof btcPrice !== "number") throw new Error("unexpected BTC data");

    // fxData.rates: { EUR: 0.92, GBP: 0.79, JPY: 149.5, BRL: 5.8, … }
    // Meaning: 1 USD = X foreign units → 1 foreign unit = 1/X USD
    let fxRates: Record<string, number> = {};
    if (fxRes.ok) {
      const fxData = await fxRes.json();
      fxRates = fxData?.rates ?? {};
    }

    // Use NGN if available; fall back to BRL (Frankfurter uses ECB data, NGN is typically absent)
    const fifthCurrency = fxRates.NGN ? "NGN" : fxRates.BRL ? "BRL" : null;

    const usdPerForeign: Record<string, number | null> = {
      USD: 1,
      EUR: fxRates.EUR ? 1 / fxRates.EUR : null,
      GBP: fxRates.GBP ? 1 / fxRates.GBP : null,
      JPY: fxRates.JPY ? 1 / fxRates.JPY : null,
      ...(fifthCurrency && { [fifthCurrency]: 1 / fxRates[fifthCurrency] }),
    };

    const orderedCurrencies = ["USD", "EUR", "GBP", "JPY", ...(fifthCurrency ? [fifthCurrency] : [])];

    const conversions = orderedCurrencies
      .filter((c) => usdPerForeign[c] != null)
      .map((currency) => ({
        currency,
        sats: formatSats((usdPerForeign[currency]! / btcPrice) * SATS_PER_BTC),
      }));

    return NextResponse.json({ conversions });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
