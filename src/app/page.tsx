"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  AdTopLeaderboard,
  AdMiddle,
  AdSmallBanner,
  AdFooterBanner,
  AdBottomLeaderboard,
} from "@/components/AdSlots";

// ── Constants ────────────────────────────────────────────────────────────────
const SATS_PER_BTC = 100_000_000;
const MAX_DIGITS = 20;
const RATES_URL = "/api/btc-price";
const FETCH_TIMEOUT_MS = 5_000;
const REFRESH_INTERVAL_MS = 60_000;

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatUsd(value: number): string {
  if (value === 0) return "0";
  if (value >= 1) {
    // e.g. 1234.56 → "1,234.56"
    const [int, dec] = value.toFixed(2).split(".");
    return `${parseInt(int, 10).toLocaleString("en-US")}.${dec}`;
  }
  return value.toFixed(6);
}

const FONT_SIZES = [42, 36, 32, 26, 24, 20, 18];

// Cached canvas context for text measurement (client only)
let _measureCtx: CanvasRenderingContext2D | null = null;
function getMeasureCtx() {
  if (typeof window === "undefined") return null;
  if (!_measureCtx) _measureCtx = document.createElement("canvas").getContext("2d");
  return _measureCtx;
}

/**
 * Returns the largest font size (px) from FONT_SIZES at which `text`
 * fits within `availableWidth`. Falls back to char-count heuristic on SSR.
 */
function getFittingFontSize(text: string, availableWidth: number): number {
  if (!text) return FONT_SIZES[0]; // empty → largest size so Math.min never caps a real value
  const ctx = getMeasureCtx();
  if (!ctx) {
    // SSR heuristic — account for commas in the char count
    const len = text.length;
    if (len <= 10) return 42;
    if (len <= 13) return 36;
    if (len <= 17) return 32;
    if (len <= 21) return 26;
    return 24;
  }
  // Add a small safety buffer so measured text never touches the container
  // edges even if canvas metrics are slightly optimistic.
  const safeWidth = Math.max(0, availableWidth - 20);
  for (const size of FONT_SIZES) {
    ctx.font = `400 ${size}px 'Lexend Deca', Arial, sans-serif`;
    if (ctx.measureText(text).width <= safeWidth) return size;
  }
  return FONT_SIZES[FONT_SIZES.length - 1];
}

/**
 * Apply comma separators to a raw USD string (e.g. "1234.56" → "1,234.56").
 * Preserves a trailing decimal point while the user is still typing.
 */
function applyUsdCommas(raw: string): string {
  if (!raw || raw === ".") return raw;
  const dotIdx = raw.indexOf(".");
  const intPart = dotIdx === -1 ? raw : raw.slice(0, dotIdx);
  const decPart = dotIdx === -1 ? "" : raw.slice(dotIdx); // includes the "."
  const formattedInt = intPart ? parseInt(intPart, 10).toLocaleString("en-US") : "";
  return formattedInt + decPart;
}

/**
 * After reformatting a controlled input with commas, restore the caret to the
 * logically equivalent position (same number of non-comma chars before it).
 */
function restoreCursor(input: HTMLInputElement, oldValue: string, newValue: string, oldCursor: number) {
  const nonCommasBefore = oldValue.slice(0, oldCursor).replace(/,/g, "").length;
  let counted = 0;
  let newPos = newValue.length;
  for (let i = 0; i < newValue.length; i++) {
    if (newValue[i] !== ",") counted++;
    if (counted === nonCommasBefore) { newPos = i + 1; break; }
  }
  requestAnimationFrame(() => input.setSelectionRange(newPos, newPos));
}

// ── Field width → available text width ───────────────────────────────────────
// Subtract actual layout constraints only:
// - left-3 padding             (≈12px)
// - right-[94px] currency area (≈94px)
// - borders                    (≈6px)
// The input element's own right-[94px] CSS already prevents text from
// overlapping the currency label/copy icon — no extra JS reserve needed.
function fieldToAvailableWidth(fieldWidth: number) {
  return Math.max(0, fieldWidth - 112);
}

// ── FAQ data ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    question: "What is a satoshi?",
    answer:
      "A satoshi (sat) is the smallest unit of Bitcoin. One Bitcoin equals 100,000,000 satoshis. It's named after Bitcoin's creator, Satoshi Nakamoto.",
  },
  {
    question: "What's the difference between Bitcoin and a satoshi?",
    answer:
      "A satoshi is simply a fraction of a Bitcoin — the smallest one. One Bitcoin equals 100 million satoshis. It's like the relationship between a dollar and a cent, just with more decimal places. When someone says \"I own 50,000 sats,\" they mean they own 0.0005 BTC.",
  },
  {
    question: "Who is Satoshi Nakamoto?",
    answer:
      "Satoshi Nakamoto is the pseudonym used by the person — or group — who created Bitcoin. They published the Bitcoin whitepaper in 2008 and launched the network in January 2009, then gradually disappeared from public communication by 2011. Their true identity has never been confirmed.",
  },
  {
    question: "Why did Satoshi cap Bitcoin at 21 million?",
    answer:
      "Satoshi never explicitly explained the choice, but the logic is widely understood: a fixed supply creates digital scarcity. Unlike fiat currencies, which central banks can print indefinitely (devaluing what you already hold), Bitcoin's hard cap means no one can inflate it away. The 21 million limit, combined with the halving schedule that cuts new supply roughly every four years, mimics the scarcity properties of gold, but with mathematically enforced precision.",
  },
  {
    question: "Why use satoshis instead of Bitcoin?",
    answer:
      "Satoshis make it easier to deal with small Bitcoin amounts without using many decimal places. As Bitcoin's value grows, transacting in sats feels more intuitive and precise.",
  },
  {
    question: "How many satoshis are in $1?",
    answer: "", // populated dynamically from live rate
  },
  {
    question: "Can I buy satoshis directly?",
    answer:
      "Yes — when you buy Bitcoin, you're already buying satoshis. Most exchanges let you purchase any amount, even just a few dollars' worth. You don't need to buy a whole Bitcoin. Platforms like Coinbase, Kraken, and Strike all support small purchases.",
  },
  {
    question: "Can I convert other currencies?",
    answer:
      "Currently we support Sats to USD, EUR, GBP, JPY and BRL conversions. We will add more currencies in the future.",
  },
  {
    question: "Is this converter accurate?",
    answer:
      "This tool uses current market data to provide estimates. Cryptocurrency prices are highly volatile and change frequently.",
  },
  {
    question: "How often does the price update?",
    answer:
      "The converter pulls live Bitcoin pricing data and updates in real time. The conversion rates you see reflect the current market price at the moment you use the tool.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account required. This is a free, instant converter with no sign-up needed.",
  },
  {
    question: "What makes this converter different from other tools?",
    answer:
      "Most crypto converters are buried inside exchanges or bloated with ads, pop-ups, and features you don't need. Sats2USD is a purpose-built tool — clean, fast, and focused. You open it, type a number, and get your answer. No distractions, no account required. Add it to your homescreen and it works just like an app — one tap to check what your sats are worth, anytime.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  // satsInput: raw digits while user is typing; comma-formatted when computed
  const [satsInput, setSatsInput] = useState("");
  // usdInput: raw decimal string while typing; formatted decimal when computed
  const [usdInput, setUsdInput] = useState("");
  // which field the user last typed in (determines which copy icon shows)
  const [lastTyped, setLastTyped] = useState<"sats" | "usd" | null>(null);
  const [focusedField, setFocusedField] = useState<"sats" | "usd" | null>(null);
  const [copiedField, setCopiedField] = useState<"sats" | "usd" | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [satoshiExpanded, setSatoshiExpanded] = useState(false);
  const [ratesFlashKey, setRatesFlashKey] = useState(0);

  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [ratesStatus, setRatesStatus] = useState<"loading" | "ready" | "error">("loading");

  const [popularConversions, setPopularConversions] = useState<{ currency: string; sats: string }[]>([]);

  const { isMobile, mounted } = useIsMobile();

  // fieldWidth: actual pixel width of the input fields, updated on resize
  // Mobile default: min(screenWidth, 375) - 64px padding = 311px
  const [fieldWidth, setFieldWidth] = useState(311);

  // Derived live rates (null while loading)
  const usdPerSat = btcPrice ? btcPrice / SATS_PER_BTC : null;
  const satsPerUsd = btcPrice ? SATS_PER_BTC / btcPrice : null;

  const satsInputRef = useRef<HTMLInputElement>(null);
  const usdInputRef = useRef<HTMLInputElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Responsive field width ──────────────────────────────────────────────────
  useEffect(() => {
    function updateFieldWidth() {
      const w = window.innerWidth;
      if (w >= 1024) {
        setFieldWidth(500);
      } else if (w >= 768) {
        setFieldWidth(320);
      } else {
        // content has px-8 (32px each side), max-w-[375px]
        setFieldWidth(Math.min(w, 375) - 64);
      }
    }
    updateFieldWidth();
    window.addEventListener("resize", updateFieldWidth);
    return () => window.removeEventListener("resize", updateFieldWidth);
  }, []);

  const inputAvailableWidth = fieldToAvailableWidth(fieldWidth);

  // ── Live BTC price fetch ────────────────────────────────────────────────────
  const fetchBtcPrice = useCallback(async () => {
    setRatesStatus("loading");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(RATES_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      const price: unknown = data?.usd;
      if (typeof price !== "number") throw new Error("unexpected data");
      setBtcPrice((prev) => {
        if (prev !== price) setRatesFlashKey((k) => k + 1);
        return price;
      });
      setRatesStatus("ready");
    } catch {
      clearTimeout(timeoutId);
      setRatesStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchBtcPrice]);

  useEffect(() => {
    fetch("/api/popular-conversions")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.conversions) setPopularConversions(data.conversions); })
      .catch(() => {});
  }, []);

  // Imperatively trigger pulse on the computed (output) input element
  const triggerPulse = useCallback((ref: React.RefObject<HTMLInputElement | null>) => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("animate-value-pulse");
    void el.offsetWidth; // force reflow to restart animation
    el.classList.add("animate-value-pulse");
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSatsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const oldValue = input.value;
      const oldCursor = input.selectionStart ?? oldValue.length;

      const raw = oldValue.replace(/[^0-9]/g, "");
      if (raw.length > MAX_DIGITS) return; // silent limit

      // Format with commas and restore caret
      const formatted = raw ? parseInt(raw, 10).toLocaleString("en-US") : "";
      setSatsInput(formatted);
      restoreCursor(input, oldValue, formatted, oldCursor);

      setLastTyped("sats");
      if (raw === "" || !usdPerSat) {
        setUsdInput("");
      } else {
        const computed = formatUsd(parseInt(raw.replace(/,/g, ""), 10) * usdPerSat);
        setUsdInput(computed);
        triggerPulse(usdInputRef);
      }
    },
    [triggerPulse, usdPerSat]
  );

  const handleUsdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const oldValue = input.value;
      const oldCursor = input.selectionStart ?? oldValue.length;

      // Strip commas + anything except digits and decimal point
      let raw = oldValue.replace(/[^0-9.]/g, "");
      // Only one decimal point allowed
      const dotIdx = raw.indexOf(".");
      if (dotIdx !== -1)
        raw = raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, "");
      // Enforce digit limit (excluding the dot)
      if (raw.replace(".", "").length > MAX_DIGITS) return;

      // Format with commas and restore caret
      const formatted = applyUsdCommas(raw);
      setUsdInput(formatted);
      restoreCursor(input, oldValue, formatted, oldCursor);

      setLastTyped("usd");
      if (raw === "" || raw === "." || !satsPerUsd) {
        setSatsInput("");
      } else {
        const usdNum = parseFloat(raw.replace(/,/g, ""));
        if (!isNaN(usdNum)) {
          const computedSats = Math.round(usdNum * satsPerUsd);
          setSatsInput(computedSats.toLocaleString("en-US"));
          triggerPulse(satsInputRef);
        }
      }
    },
    [triggerPulse, satsPerUsd]
  );

  const handleSatsFocus = useCallback(() => {
    setFocusedField("sats");
  }, []);

  const handleSatsBlur = useCallback(() => {
    setFocusedField(null);
    // Reformat with comma separators
    setSatsInput((prev) => {
      if (!prev) return prev;
      const n = parseInt(prev.replace(/,/g, ""), 10);
      return isNaN(n) ? prev : n.toLocaleString("en-US");
    });
  }, []);

  const handleUsdFocus = useCallback(() => {
    setFocusedField("usd");
  }, []);

  const handleUsdBlur = useCallback(() => {
    setFocusedField(null);
    // Reformat on blur (e.g. "1." → "1.00")
    setUsdInput((prev) => {
      if (!prev || prev === ".") return prev;
      const n = parseFloat(prev.replace(/,/g, ""));
      return isNaN(n) ? prev : formatUsd(n);
    });
  }, []);

  const handleReset = useCallback(() => {
    setSatsInput("");
    setUsdInput("");
    setLastTyped(null);
  }, []);

  const handleCopy = useCallback((field: "sats" | "usd", value: string) => {
    const text = value.replace(/,/g, "");
    try {
      navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    setCopiedField(field);
    copyTimerRef.current = setTimeout(() => setCopiedField(null), 500);
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  // Both fields always share the same font size so they stay visually in sync.
  // Use the minimum of both fitted sizes so neither field ever clips its content.
  const sharedFontSize = Math.min(
    getFittingFontSize(satsInput, inputAvailableWidth),
    getFittingFontSize(usdInput, inputAvailableWidth),
  );
  const satsFontSize = sharedFontSize;
  const usdFontSize = sharedFontSize;

  const hasSatsValue = satsInput.replace(/,/g, "") !== "";
  const hasUsdValue = usdInput !== "" && usdInput !== ".";

  // Live BTC equivalent of sats input
  const btcEquivalent = (() => {
    const raw = satsInput.replace(/,/g, "");
    const n = parseInt(raw, 10);
    if (!raw || isNaN(n) || n === 0) return "0 BTC";
    const btc = n / SATS_PER_BTC;
    // toFixed(8) then strip trailing zeros after decimal
    const str = btc.toFixed(8).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
    return `${str} BTC`;
  })();

  // Copy icon only appears on the computed (opposite) field
  const showSatsCopy = lastTyped === "usd" && hasSatsValue;
  const showUsdCopy = lastTyped === "sats" && hasUsdValue;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#f7931a] gap-8 py-8 md:pt-[12px]">

      {/* ── TOP AD: Desktop_Ad1 728×90 leaderboard ── */}
      <AdTopLeaderboard />

      {/* ── Main content ── */}
      <div className="flex w-full max-w-[375px] md:max-w-[320px] lg:max-w-[500px] flex-col gap-8 px-8 md:px-0">

        {/* Header */}
        <div className="fade-in-item flex flex-col items-center gap-3" style={{ animationDelay: "0ms" }}>
          <div className="size-10">
            <Image src="/btc-logo.svg" alt="Bitcoin logo" width={40} height={40} />
          </div>
          <h1 className="text-center text-[36px] font-medium leading-[1.1] text-black">
            Satoshi to USD converter
          </h1>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            {/* Reset / BTC equivalent row */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[12px] font-semibold text-[#8d4f04]">
                {btcEquivalent}
              </span>
              <button
                onClick={handleReset}
                className="group flex items-center gap-1 text-[12px] font-semibold text-[#8d4f04] hover:underline"
              >
                Reset
                <Image src="/reset.svg" alt="Reset" width={18} height={18} className="transition-transform duration-300 ease-in-out group-hover:rotate-180" />
              </button>
            </div>

            {/* SATS Input */}
            <div
              className={`fade-in-item relative h-[99px] w-full rounded-[8px] bg-white border-[3px] transition-[border-color] duration-200 ease-in-out ${
                focusedField === "sats" ? "border-black" : "border-transparent"
              }`}
              style={{ animationDelay: "100ms" }}
            >
              <span className="absolute left-3 top-[10px] text-[14px] font-medium text-[#c9c9c9]">
                Amount
              </span>
              <input
                ref={satsInputRef}
                type="text"
                inputMode="numeric"
                value={satsInput}
                onChange={handleSatsChange}
                onFocus={handleSatsFocus}
                onBlur={handleSatsBlur}
                placeholder="0"
                className={`absolute top-[67px] -translate-y-1/2 left-3 right-[94px] bg-transparent font-normal outline-none placeholder-[#c9c9c9] transition-[color] duration-200 ease-in-out ${
                  hasSatsValue ? "text-black" : "text-[#c9c9c9]"
                }`}
                style={{ fontSize: `${satsFontSize}px` }}
              />
              {showSatsCopy && (
                <button
                  onClick={() => handleCopy("sats", satsInput)}
                  className="group absolute right-[22px] top-[57px] size-6"
                  aria-label="Copy SATS value"
                >
                  {copiedField === "sats" && (
                    <span
                      key={satsInput}
                      className="animate-copied absolute right-7 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium text-black"
                    >
                      Copied!
                    </span>
                  )}
                  <Image
                    src="/copy.svg"
                    alt="Copy"
                    width={24}
                    height={24}
                    className="transition-[filter] group-hover:brightness-0"
                  />
                </button>
              )}
              <div className="absolute right-3 top-3 flex items-center gap-1">
                <div className="flex flex-col items-end">
                  <span className="text-[14px] font-medium text-black">Satoshis</span>
                  <span className="text-[12px] font-semibold text-[#f7931a]">SATS</span>
                </div>
                <Image src="/sats-icon.svg" alt="Satoshi" width={30} height={30} />
              </div>
            </div>

            {/* USD Input */}
            <div
              className={`fade-in-item relative h-[99px] w-full rounded-[8px] bg-white border-[3px] transition-[border-color] duration-200 ease-in-out ${
                focusedField === "usd" ? "border-black" : "border-transparent"
              }`}
              style={{ animationDelay: "200ms" }}
            >
              <span className="absolute left-3 top-[10px] text-[14px] font-medium text-[#c9c9c9]">
                Amount
              </span>
              <input
                ref={usdInputRef}
                type="text"
                inputMode="decimal"
                value={usdInput}
                onChange={handleUsdChange}
                onFocus={handleUsdFocus}
                onBlur={handleUsdBlur}
                placeholder="0"
                className={`absolute top-[67px] -translate-y-1/2 left-3 right-[94px] bg-transparent font-normal outline-none placeholder-[#c9c9c9] transition-[color] duration-200 ease-in-out ${
                  hasUsdValue ? "text-black" : "text-[#c9c9c9]"
                }`}
                style={{ fontSize: `${usdFontSize}px` }}
              />
              {showUsdCopy && (
                <button
                  onClick={() => handleCopy("usd", usdInput)}
                  className="group absolute right-[22px] top-[57px] size-6"
                  aria-label="Copy USD value"
                >
                  {copiedField === "usd" && (
                    <span
                      key={usdInput}
                      className="animate-copied absolute right-7 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium text-black"
                    >
                      Copied!
                    </span>
                  )}
                  <Image
                    src="/copy.svg"
                    alt="Copy"
                    width={24}
                    height={24}
                    className="transition-[filter] group-hover:brightness-0"
                  />
                </button>
              )}
              <div className="absolute right-3 top-3 flex items-center gap-1">
                <div className="flex flex-col items-end">
                  <span className="text-[14px] font-medium text-black">US Dollar</span>
                  <span className="text-[12px] font-semibold text-[#f7931a]">USD</span>
                </div>
                <Image src="/usd-icon.svg" alt="US Dollar" width={30} height={30} />
              </div>
            </div>
          </div>

          {/* Live rates */}
          <div className="fade-in-item flex flex-col gap-[8px]" style={{ animationDelay: "300ms" }}>
            <p className="text-[12px] font-semibold text-[#8d4f04]">Live rates:</p>

            {ratesStatus === "loading" && (
              <div className="flex flex-col gap-[4px]">
                <div className="h-[12px] w-full animate-pulse rounded-[2px] bg-[#8d4f04]/30" />
                <div className="h-[12px] w-full animate-pulse rounded-[2px] bg-[#8d4f04]/30" />
              </div>
            )}

            {ratesStatus === "error" && (
              <p className="text-[12px] font-medium text-[#b20000]">
                Unable to load Bitcoin price.{" "}
                <button onClick={fetchBtcPrice} className="underline">
                  Refresh
                </button>
              </p>
            )}

            {ratesStatus === "ready" && btcPrice && usdPerSat && satsPerUsd && (
              <div
                key={ratesFlashKey}
                className={`flex flex-col gap-[4px] rounded-[4px] text-[12px] font-medium text-[#8d4f04] ${
                  ratesFlashKey > 0 ? "animate-rates-flash" : ""
                }`}
              >
                <div className="flex justify-between">
                  <span>1 SATS = {usdPerSat.toFixed(6)} USD</span>
                  <span>1 USD = {Math.round(satsPerUsd).toLocaleString()} SATS</span>
                </div>
                <div className="flex justify-between">
                  <span>1 BTC = {btcPrice.toLocaleString("en-US")} USD</span>
                  <span>1 USD = {(1 / btcPrice).toFixed(8)} BTC</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MIDDLE AD: Desktop_Ad2 / Mobile_Ad1 300×250 ── */}
        <AdMiddle />

        {/* FAQ */}
        <div className="fade-in-item flex flex-col gap-4" style={{ animationDelay: "400ms" }}>
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="flex flex-col">
              <button
                className="group flex w-full items-start justify-between text-left"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span
                  className="text-[18px] font-semibold leading-[22px] text-black group-hover:underline"
                  style={{ maxWidth: "calc(100% - 24px)" }}
                >
                  {item.question}
                </span>
                <Image
                  src="/plus.svg"
                  alt={openFaq === index ? "Collapse" : "Expand"}
                  width={16}
                  height={16}
                  className={`mt-[3px] shrink-0 transition-transform duration-300 ease-in-out ${openFaq === index ? "rotate-45" : ""}`}
                />
              </button>
              <div className={`faq-grid ${openFaq === index ? "open" : ""}`}>
                <div className="faq-inner">
                  <p className="pt-3 text-[14px] font-medium leading-[22px] text-[#8d4f04]">
                    {item.question === "How many satoshis are in $1?"
                      ? satsPerUsd
                        ? `At the current rate, 1 USD ≈ ${Math.round(satsPerUsd).toLocaleString()} SATS.`
                        : "Loading current rate…"
                      : item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Conversion table */}
        <div className="fade-in-item flex flex-col gap-3" style={{ animationDelay: "450ms" }}>
          <p className="text-[18px] font-semibold leading-[20px] text-black">
            Conversion table
          </p>
          <div className="flex flex-col gap-[2px] text-[14px] font-medium leading-[22px] text-[#8d4f04]">
            {[
              ["1 satoshi", "0.00000001 bitcoin"],
              ["10 satoshi", "0.0000001 bitcoin"],
              ["100 satoshi", "0.000001 bitcoin"],
              ["1,000 satoshi", "0.00001 bitcoin"],
              ["10,000 satoshi", "0.0001 bitcoin"],
              ["100,000 satoshi", "0.001 bitcoin"],
              ["1,000,000 satoshi", "0.01 bitcoin"],
              ["10,000,000 satoshi", "0.1 bitcoin"],
              ["100,000,000 satoshi", "1 bitcoin"],
            ].map(([sats, btc]) => (
              <div key={sats} className="flex items-start justify-between w-full">
                <span>{sats}</span>
                <span className="text-right">{btc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular conversions */}
        {popularConversions.length > 0 && (
          <div className="fade-in-item flex flex-col gap-3" style={{ animationDelay: "455ms" }}>
            <p className="text-[18px] font-semibold leading-[20px] text-black">
              Popular conversions
            </p>
            <div className="flex flex-col gap-[2px] text-[14px] font-medium leading-[22px] text-[#8d4f04]">
              {popularConversions.map(({ currency, sats }) => (
                <Link
                  key={currency}
                  href={`/convert/${currency.toLowerCase()}-to-sats`}
                  className="flex items-start justify-between w-full hover:opacity-70 transition-opacity duration-150"
                >
                  <span>1 {currency}</span>
                  <span className="text-right">≈ {sats} satoshi</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── SMALL BANNER: Desktop_Ad3 / Mobile_Ad2 300×50 ── */}
        <AdSmallBanner />

        {/* Learn more about Bitcoin & Satoshis */}
        <div className="fade-in-item flex flex-col gap-3" style={{ animationDelay: "458ms" }}>
          <p className="text-[18px] font-semibold leading-[20px] text-black">
            Learn more about Bitcoin &amp; Satoshis
          </p>
          <div className="flex flex-col gap-[2px]">
            {[
              { label: "How Bitcoin Works — bitcoin.org", href: "https://bitcoin.org/en/how-it-works" },
              { label: "The Bitcoin Whitepaper by Satoshi Nakamoto", href: "https://bitcoin.org/bitcoin.pdf" },
              { label: "Bitcoin Magazine — News & Analysis", href: "https://bitcoinmagazine.com" },
              { label: "Learn Me a Bitcoin — Technical Guides", href: "https://learnmeabitcoin.com" },
              { label: "Mempool.space — Live Blockchain Explorer", href: "https://mempool.space" },
              { label: "Clark Moody Bitcoin Dashboard — Real-Time Stats", href: "https://bitcoin.clarkmoody.com/dashboard" },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-[6px] text-[14px] font-medium leading-[22px] text-[#8d4f04]"
              >
                <svg
                  width="12"
                  height="10"
                  viewBox="0 0 13 11.3851"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <path d="M0 5.69253H12M12 5.69253L7.2 0.692532M12 5.69253L7.2 10.6925" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
                <span className="group-hover:underline">{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* The smallest giant in finance */}
        <div className="fade-in-item flex flex-col gap-1" style={{ animationDelay: "460ms" }}>
          <div className="flex flex-col gap-3">
            <p className="text-[18px] font-semibold leading-[20px] text-black">
              The smallest giant in finance
            </p>
            <p className="text-[14px] font-medium leading-[22px] text-[#8d4f04]">
              {`In 2008, a pseudonymous figure called Satoshi Nakamoto published a nine-page whitepaper that would reshape how the world thinks about money. Bitcoin launched shortly after in January 2009, but while the protocol defined its smallest unit from day one (0.00000001 BTC), it didn't yet have a name.`}
            </p>
          </div>

          {/* Expanded content */}
          <div className={`faq-grid ${satoshiExpanded ? "open" : ""}`}>
            <div className="faq-inner">
              <div className="flex flex-col gap-3 pt-3 text-[14px] font-medium leading-[22px] text-[#8d4f04]">
                <p>{`That changed in 2011, when the Bitcoin community on the BitcoinTalk forum proposed naming the smallest divisible unit a "satoshi" or "sat" for short, in honour of its mysterious creator. The name stuck instantly.`}</p>
                <p>One bitcoin equals 100 million sats. Think of it like cents to a dollar, except far more precise, sats let you transact in incredibly small amounts, which matters when a single bitcoin is worth tens of thousands of dollars.</p>
                <p>{`Today, sats have become the preferred unit for a growing number of Bitcoiners. The logic is simple: saying "50,000 sats" is more intuitive than saying "0.0005 BTC." It also removes the psychological barrier of thinking you need to buy a whole bitcoin to get started. You don't. You can stack sats — a few dollars' worth at a time.`}</p>
                <p>{`That shift in language, from BTC to sats, is more than cosmetic. It's making Bitcoin accessible to everyone, not just those who got in early. And that's exactly why knowing what your sats are worth in real time matters.`}</p>
              </div>
            </div>
          </div>

          {/* Read more / Close */}
          <button
            onClick={() => setSatoshiExpanded((v) => !v)}
            className="flex items-center text-left"
          >
            <span className="text-[14px] font-semibold leading-[20px] text-black hover:underline">
              {satoshiExpanded ? "Close" : "Read more"}
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="fade-in-item flex w-full flex-col gap-4 text-[12px] text-[#8d4f04]" style={{ animationDelay: "500ms" }}>
          <p className="leading-[16px] md:text-center">
            <span className="font-semibold">Disclaimer: </span>
            <span className="font-normal">
              This tool provides estimates based on current market data. Cryptocurrency prices are
              highly volatile. Not financial advice.
            </span>
          </p>
          <a
            href="https://x.com/Sats2USD"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start md:self-center"
          >
            <Image src="/X_logo.svg" alt="Follow @Sats2USD on X" width={24} height={24} />
          </a>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-semibold leading-[16px] md:justify-center md:gap-0">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="hidden md:inline">&nbsp; |&nbsp;{" "}</span>
            <Link href="/privacy-policy" className="hover:underline">Privacy policy</Link>
            <span className="hidden md:inline">&nbsp; |&nbsp;{" "}</span>
            <Link href="/cookies" className="hover:underline">Cookies</Link>
            <span className="hidden md:inline">&nbsp; |&nbsp;{" "}</span>
            <Link href="/terms-of-use" className="hover:underline">Terms</Link>
            <span className="hidden md:inline">&nbsp; |&nbsp;{" "}</span>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
          <p className="font-normal leading-[12px] md:text-center">© 2026 Sats2USD.com</p>
          {/* ── FOOTER BANNER: Mobile_Ad3 300×50 ── */}
          <AdFooterBanner />
        </div>

      </div>

      {/* ── BOTTOM LEADERBOARD: Desktop_Ad4 728×90 ── */}
      <AdBottomLeaderboard />

    </div>
  );
}
