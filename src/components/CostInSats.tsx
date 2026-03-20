"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import rawItems from "@/data/items.json";

interface Item {
  name: string;
  priceUSD: number;
  category: string;
}

const items = rawItems as Item[];
const SATS_PER_BTC = 100_000_000;

function toSats(priceUSD: number, btcPrice: number): number {
  return Math.round((priceUSD / btcPrice) * SATS_PER_BTC);
}

function fmtSats(n: number): string {
  return n.toLocaleString("en-US");
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function getDateStr(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type S = "default" | "result" | "submit" | "done";

export default function CostInSats({ btcPrice }: { btcPrice: number | null }) {
  const [featured, setFeatured] = useState<Item[]>([]);

  useEffect(() => {
    setFeatured(pickRandom(items, 3));
  }, []);

  const [s, setS] = useState<S>("default");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [result, setResult] = useState<Item | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [blockVisible, setBlockVisible] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sRef = useRef(s);
  sRef.current = s;
  const dateStr = useMemo(() => getDateStr(), []);

  // ── Filtered suggestions ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();

    function score(name: string): number {
      const n = name.toLowerCase();
      const stripped = n.replace(/^(a pair of |a bottle of |a pack of |a bag of |an |a )/, "");
      if (stripped === q || n === q) return 100;
      if (stripped.startsWith(q)) return 80;
      if (n.split(/\s+/).some((w) => w.startsWith(q))) return 60;
      if (n.includes(q)) return 40;
      return 0;
    }

    return items
      .map((i) => ({ item: i, s: score(i.name) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.item.name.localeCompare(b.item.name))
      .slice(0, 5)
      .map((x) => x.item);
  }, [query]);

  const showDrop = focused && s === "default" && query.trim().length > 0;
  const arrowEnabled = showDrop && filtered.length > 0;

  // ── Reset to default ──────────────────────────────────────────────────────
  // If currently showing a faded-in block (result/done), fade it out first.
  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const doReset = () => {
      setS("default");
      setQuery("");
      setResult(null);
      setFocused(false);
      setCountdown(5);
      setBlockVisible(false);
    };
    if (sRef.current === "result" || sRef.current === "done") {
      setBlockVisible(false);
      setTimeout(doReset, 300);
    } else {
      doReset();
    }
  }, []);

  // ── Fade in result/done block after mount ─────────────────────────────────
  useEffect(() => {
    if (s === "result" || s === "done") {
      setBlockVisible(false);
      const t = setTimeout(() => setBlockVisible(true), 10);
      return () => clearTimeout(t);
    }
  }, [s]);

  // ── Transition from result → default while preserving query ──────────────
  function transitionToSearch() {
    if (sRef.current !== "result") return;
    if (transitionRef.current) return; // already in progress
    setBlockVisible(false);
    transitionRef.current = setTimeout(() => {
      setS("default");
      setResult(null);
      transitionRef.current = null;
    }, 300);
  }

  // ── Select item → show result ─────────────────────────────────────────────
  function selectItem(item: Item) {
    setResult(item);
    setQuery("");
    setFocused(false);
    setS("result");
  }

  // ── Arrow button ──────────────────────────────────────────────────────────
  function handleArrow() {
    if (arrowEnabled) selectItem(filtered[0]);
  }

  // ── Keyboard handler ──────────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setFocused(false);
      return;
    }
    if (e.key !== "Enter") return;

    if (s === "submit") {
      doSubmit();
      return;
    }

    if (arrowEnabled) {
      selectItem(filtered[0]);
      return;
    }

    // Edge case: pasted text exactly matches a database item
    const exact = items.find(
      (i) => i.name.toLowerCase() === query.trim().toLowerCase()
    );
    if (exact) {
      selectItem(exact);
    } else {
      gotoCantFind();
    }
  }

  // ── "Can't find it?" ──────────────────────────────────────────────────────
  function gotoCantFind() {
    setS("submit");
    setQuery("");
    setFocused(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  // ── Submit email ──────────────────────────────────────────────────────────
  function doSubmit() {
    const item = query.trim();
    if (!item) return;
    const sub = encodeURIComponent(`Sats2USD — New item suggestion: ${item}`);
    const bod = encodeURIComponent(`A user suggested adding: ${item}`);
    window.open(`mailto:support@sats2usd.com?subject=${sub}&body=${bod}`);
    setS("done");
    setQuery("");
    setCountdown(5);
  }

  // ── Countdown interval ────────────────────────────────────────────────────
  useEffect(() => {
    if (s !== "done") return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [s]);

  // When countdown hits 0, auto-reset (small delay to show 0:00, then fade out)
  useEffect(() => {
    if (s === "done" && countdown === 0) {
      const t = setTimeout(reset, 50);
      return () => clearTimeout(t);
    }
  }, [s, countdown, reset]);

  // Any printable key during "done" → reset
  useEffect(() => {
    if (s !== "done") return;
    function onKey(e: KeyboardEvent) {
      if (e.key.length === 1) reset();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [s, reset]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="fade-in-item flex flex-col gap-[16px]"
      style={{ animationDelay: "390ms", position: "relative", zIndex: 10 }}
    >
      {/* Title */}
      <p className="text-[18px] font-semibold leading-[20px] text-black">
        What does this cost in sats?
      </p>

      {/* 3 random featured items */}
      <div className="flex flex-col gap-[2px]">
        {featured.map((item) => (
          <div
            key={item.name}
            className="flex items-baseline justify-between text-[14px] font-medium leading-[22px] text-[#8d4f04]"
          >
            <span>{item.name}</span>
            <span>
              {btcPrice
                ? `${fmtSats(toSats(item.priceUSD, btcPrice))} sats`
                : "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Input / result / done area */}
      <div className="flex flex-col gap-[8px]">

        {/* Input field — hidden in "done" state */}
        {s !== "done" && (
          <div className="relative">
            <div
              className={`flex items-center gap-2 rounded-[8px] bg-white px-[12px] py-[14px] border-2 transition-[border-color] duration-150 ${
                focused ? "border-black" : "border-transparent"
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  transitionToSearch();
                }}
                onFocus={() => {
                  setFocused(true);
                  transitionToSearch();
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  s === "submit"
                    ? "Type your item to submit"
                    : "Type something to get its cost in sats"
                }
                className="flex-1 bg-transparent text-[16px] font-medium leading-[16px] text-black placeholder-[#c9c9c9] outline-none"
              />
              {/* Arrow button — only in default/result state */}
              {s !== "submit" && (
                <button
                  type="button"
                  onClick={handleArrow}
                  disabled={!arrowEnabled}
                  aria-label="Search"
                  className={`shrink-0 transition-opacity duration-150 ${
                    arrowEnabled ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <Image src="/arrow-right.svg" alt="→" width={14} height={11} />
                </button>
              )}
            </div>

            {/* Dropdown — absolutely positioned below input */}
            {showDrop && (
              <div className="absolute left-0 right-0 top-full z-50 mt-[4px] max-h-[240px] overflow-y-auto rounded-[8px] bg-white py-[8px] shadow-[0px_4px_12px_rgba(0,0,0,0.2)]">
                {filtered.map((item, i) => (
                  <button
                    key={item.name}
                    type="button"
                    onMouseDown={() => selectItem(item)}
                    className={`w-full px-[12px] py-[4px] text-left text-[14px] leading-[22px] hover:bg-[#f7931a]/10 ${
                      i === 0
                        ? "font-semibold text-black"
                        : "font-normal text-[#c9c9c9]"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                {filtered.length > 0 && (
                  <div className="mx-[12px] my-[2px] h-px bg-[#e0e0e0]" />
                )}
                <button
                  type="button"
                  onMouseDown={gotoCantFind}
                  className="w-full px-[12px] py-[4px] text-left text-[14px] font-normal leading-[22px] text-[#8d4f04] hover:bg-[#f7931a]/10"
                >
                  Can&apos;t find it? Submit it.
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUBMIT button + Start again */}
        {s === "submit" && (
          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              onClick={doSubmit}
              className="flex h-[32px] items-center rounded-[4px] bg-[#8d4f04] px-[12px] text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-black"
            >
              SUBMIT
            </button>
            <button
              type="button"
              onClick={reset}
              className="group flex items-center gap-[4px] text-[10px] font-medium text-[#8d4f04] hover:underline"
            >
              <Image
                src="/reset.svg"
                alt=""
                width={16}
                height={16}
                className="transition-transform duration-300 ease-in-out group-hover:rotate-180"
              />
              Start again
            </button>
          </div>
        )}

        {/* Result */}
        {s === "result" && result && (
          <div className={`flex flex-col gap-[18px] pt-[10px] transition-opacity duration-300 ${blockVisible ? "opacity-100" : "opacity-0"}`}>
            <div>
              <p className="mb-[10px] text-[14px] font-medium leading-[16px] text-[#8d4f04]">
                {result.name} is:
              </p>
              <p className="flex items-baseline gap-[6px] text-[36px] font-normal leading-[34px] text-black">
                {btcPrice ? fmtSats(toSats(result.priceUSD, btcPrice)) : "—"}
                <span className="text-[16px] font-medium leading-none">sats</span>
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-[32px] w-auto self-start items-center rounded-[4px] bg-[#8d4f04] px-[12px] text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-black"
            >
              START AGAIN
            </button>
          </div>
        )}

        {/* Done / confirmation */}
        {s === "done" && (
          <div className={`flex flex-col gap-[12px] transition-opacity duration-300 ${blockVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="h-px bg-[#8d4f04]/30" />
            <div className="flex items-center gap-[8px]">
              <div className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#1a7a1a]">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-[14px] font-medium text-black">
                Done and thank you!
              </span>
            </div>
            <div className="flex items-center gap-[12px]">
              <button
                type="button"
                onClick={reset}
                className="flex h-[32px] items-center rounded-[4px] bg-black px-[12px] text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-[#8d4f04]"
              >
                START AGAIN
              </button>
              <span className="text-[12px] font-medium text-[#8d4f04]">
                0:{countdown.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        )}

        {/* Prices date */}
        {s !== "done" && (
          <p className="mt-[10px] text-[10px] font-medium leading-[14px] text-[#8d4f04]">
            Prices as of {dateStr}
          </p>
        )}
      </div>
    </div>
  );
}
