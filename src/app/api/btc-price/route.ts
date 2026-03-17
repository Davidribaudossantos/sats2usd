import { NextResponse } from "next/server";

export const revalidate = 60; // 60 seconds

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

export async function GET() {
  try {
    const res = await fetch(COINGECKO_URL, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);
    const data = await res.json();
    const price: unknown = data?.bitcoin?.usd;
    if (typeof price !== "number") throw new Error("unexpected response shape");
    return NextResponse.json({ usd: price });
  } catch (err) {
    console.error("[/api/btc-price]", err);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
