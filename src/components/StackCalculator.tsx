"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Constants ────────────────────────────────────────────────────────────────
const SATS_PER_BTC = 100_000_000;
const RATES_URL = "/api/btc-price";

// ── Types ────────────────────────────────────────────────────────────────────
type SalaryPeriod = "hr" | "mo" | "yr";

interface GoalOption {
  label: string;
  btcLabel: string;
  sats: number;
}

interface TimeframeOption {
  label: string;
  years: number;
}

const GOAL_OPTIONS: GoalOption[] = [
  { label: "100K sats", btcLabel: "0.001 BTC", sats: 100_000 },
  { label: "1M sats", btcLabel: "0.01 BTC", sats: 1_000_000 },
  { label: "10M sats", btcLabel: "0.1 BTC", sats: 10_000_000 },
  { label: "100M sats", btcLabel: "1 BTC", sats: 100_000_000 },
];

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: "1 year", years: 1 },
  { label: "3 years", years: 3 },
  { label: "5 years", years: 5 },
  { label: "10 years", years: 10 },
];

const APPRECIATION_OPTIONS = [0, 10, 25, 50];

// ── Helpers ──────────────────────────────────────────────────────────────────
function toYearlySalary(value: number, period: SalaryPeriod): number {
  if (period === "hr") return value * 2080;
  if (period === "mo") return value * 12;
  return value;
}

function fmtMonthlyAlloc(monthly: number): string {
  if (monthly >= 1_000_000) return `$${(monthly / 1_000_000).toFixed(1)}M`;
  if (monthly >= 1_000) return `$${(monthly / 1_000).toFixed(1)}K`;
  return `$${Math.round(monthly)}`;
}

function fmtSats(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} K`;
  return n.toLocaleString();
}

function fmtSatsAxis(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function fmtMonthsToReach(months: number): string {
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  if (yrs === 0) return `${mo} mo`;
  if (mo === 0) return `${yrs} yr`;
  return `${yrs}yr ${mo}mo`;
}

function fmtBtcPrice(price: number): string {
  return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

interface ChartPoint {
  month: number;
  yearLabel: string;
  sats: number;
}

function generateChartData(
  yearlySalary: number,
  allocationPct: number,
  btcPrice: number,
  appreciationPct: number,
  timeframeYears: number
): ChartPoint[] {
  const months = timeframeYears * 12;
  const monthlyAllocUSD = (yearlySalary * (allocationPct / 100)) / 12;
  const appreciationRate = appreciationPct / 100;

  const data: ChartPoint[] = [{ month: 0, yearLabel: "Y0", sats: 0 }];
  let cumulative = 0;

  for (let m = 1; m <= months; m++) {
    const currentPrice = btcPrice * Math.pow(1 + appreciationRate, m / 12);
    cumulative += (monthlyAllocUSD / currentPrice) * SATS_PER_BTC;
    const yearLabel = m % 12 === 0 ? `Y${m / 12}` : "";
    data.push({ month: m, yearLabel, sats: Math.round(cumulative) });
  }
  return data;
}

// ── Custom tooltip ───────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
  btcPrice: number;
  appreciationPct: number;
}

function ChartTooltip({ active, payload, label, btcPrice, appreciationPct }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const month = typeof label === "number" ? label : parseInt(String(label), 10);
  const sats = payload[0].value;
  const currentPrice = btcPrice * Math.pow(1 + appreciationPct / 100, month / 12);
  const usdValue = (sats / SATS_PER_BTC) * currentPrice;
  return (
    <div className="rounded-[6px] bg-[#1e1e1e] border border-[#333] px-[10px] py-[8px] text-[11px] font-medium text-white shadow-lg">
      <p className="text-[#f7931a]">{fmtSats(sats).trim()} sats</p>
      <p className="text-[#aaa]">${usdValue.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD</p>
      <p className="text-[#666]">Month {month}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StackCalculator() {
  const [salaryRaw, setSalaryRaw] = useState("");
  const [period, setPeriod] = useState<SalaryPeriod>("yr");
  const [allocation, setAllocation] = useState(1);
  const [goalIndex, setGoalIndex] = useState(1); // 1M sats default
  const [timeframeIndex, setTimeframeIndex] = useState(0); // 1 year default
  const [appreciationPct, setAppreciationPct] = useState(0);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  const [goalOpen, setGoalOpen] = useState(false);
  const [timeframeOpen, setTimeframeOpen] = useState(false);

  const goalRef = useRef<HTMLDivElement>(null);
  const timeframeRef = useRef<HTMLDivElement>(null);

  // ── Fetch BTC price ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch(RATES_URL)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (typeof d?.usd === "number") setBtcPrice(d.usd); })
      .catch(() => {});
  }, []);

  // ── Close dropdowns on outside click ───────────────────────────────────
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (goalRef.current && !goalRef.current.contains(e.target as Node)) setGoalOpen(false);
      if (timeframeRef.current && !timeframeRef.current.contains(e.target as Node)) setTimeframeOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────
  const salaryNum = parseFloat(salaryRaw.replace(/,/g, "")) || 0;
  const yearlySalary = toYearlySalary(salaryNum, period);
  const monthlyAlloc = (yearlySalary * (allocation / 100)) / 12;
  const hasSalary = salaryNum > 0 && btcPrice !== null;

  const goal = GOAL_OPTIONS[goalIndex];
  const timeframe = TIMEFRAME_OPTIONS[timeframeIndex];

  const chartData = hasSalary && btcPrice
    ? generateChartData(yearlySalary, allocation, btcPrice, appreciationPct, timeframe.years)
    : [];

  const totalStacked = chartData.length > 0 ? chartData[chartData.length - 1].sats : 0;
  const progressPct = Math.min(100, (totalStacked / goal.sats) * 100);
  const goalReached = totalStacked >= goal.sats;

  const monthsToGoal = hasSalary
    ? (() => {
        for (const pt of chartData) {
          if (pt.sats >= goal.sats) return pt.month;
        }
        return null;
      })()
    : null;

  // ── Slider fill style — white left, dark right ──────────────────────────
  const sliderPct = ((allocation - 1) / (50 - 1)) * 100;
  const sliderStyle = {
    background: `linear-gradient(to right, #fff 0%, #fff ${sliderPct}%, #3d2900 ${sliderPct}%, #3d2900 100%)`,
  };

  // ── Salary input handler ────────────────────────────────────────────────
  function handleSalaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const dotIdx = raw.indexOf(".");
    const cleaned = dotIdx !== -1
      ? raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, "")
      : raw;
    const intPart = cleaned.split(".")[0];
    const decPart = cleaned.split(".")[1];
    const formatted = intPart
      ? parseInt(intPart, 10).toLocaleString("en-US") + (cleaned.includes(".") ? "." + (decPart ?? "") : "")
      : "";
    setSalaryRaw(formatted);
  }

  // ── X-axis tick formatter ───────────────────────────────────────────────
  const xAxisTicks = Array.from({ length: timeframe.years + 1 }, (_, i) => i * 12);

  // ── Show disclaimer ─────────────────────────────────────────────────────
  const showBtcDisclaimer = appreciationPct > 0;
  const showDisclaimer = hasSalary || showBtcDisclaimer;

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#f7931a] py-8 px-8">
      <div className="flex w-full max-w-[375px] md:max-w-[320px] lg:max-w-[500px] flex-col gap-8 px-0">

        {/* ── Header ── */}
        <div className="fade-in-item flex flex-col gap-[12px]" style={{ animationDelay: "0ms" }}>
          <Link
            href="/"
            className="flex items-center gap-[6px] text-[16px] font-medium text-black w-fit"
          >
            <Image src="/back-arrow.svg" alt="Back" width={14} height={12} />
            <span className="hover:underline">Home</span>
          </Link>
          <div className="flex flex-col items-center gap-[12px]">
            <Image src="/stack-icon.svg" alt="Stack Calculator" width={40} height={40} />
            <h1 className="text-center text-[36px] font-medium leading-[1.1] text-black">
              The Stack Calculator
            </h1>
            <p className="text-center text-[14px] font-medium leading-[16px] text-[#8d4f04]">
              How fast can you reach your sats goal?
            </p>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-col gap-[18px]">

          {/* Salary */}
          <div className="fade-in-item flex flex-col gap-[6px]" style={{ animationDelay: "100ms" }}>
            <p className="text-[10px] font-medium leading-[14px] text-[#8d4f04]">Salary</p>
            <div
              className={`flex items-center justify-between rounded-[8px] bg-white px-[12px] py-[16px] border-2 transition-[border-color] duration-150 ${
                salaryNum > 0 ? "border-black" : "border-transparent"
              }`}
            >
              <div className="flex items-center flex-1 min-w-0">
                <span className="text-[14px] font-medium text-black shrink-0">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={salaryRaw}
                  onChange={handleSalaryChange}
                  placeholder="Enter amount"
                  className="flex-1 min-w-0 bg-transparent text-[14px] font-medium leading-[16px] text-black placeholder-[#c9c9c9] outline-none ml-[4px]"
                />
              </div>
              <div className="flex items-center gap-[4px] shrink-0">
                {(["hr", "mo", "yr"] as SalaryPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`text-[14px] leading-[16px] transition-colors duration-100 ${
                      period === p
                        ? "font-semibold text-black"
                        : "font-medium text-[#c9c9c9] hover:text-black"
                    }`}
                  >
                    /{p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Allocate to Bitcoin */}
          <div className="fade-in-item flex flex-col gap-[6px]" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium leading-[14px] text-[#8d4f04]">Allocate to Bitcoin</p>
              <p className="text-[0px] leading-[0] text-black font-medium">
                <span className="text-[18px] leading-[14px]">{allocation}</span>
                <span className="text-[10px] leading-[14px]">%</span>
              </p>
            </div>
            <div className="relative h-[20px] flex items-center">
              <input
                type="range"
                min={1}
                max={50}
                value={allocation}
                onChange={(e) => setAllocation(parseInt(e.target.value))}
                className="stack-slider w-full"
                style={sliderStyle}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-medium leading-[14px] text-[#8d4f04]">
              <span>1%</span>
              {hasSalary && monthlyAlloc > 0 && (
                <span>{fmtMonthlyAlloc(monthlyAlloc)}/month → Bitcoin</span>
              )}
              <span>50%</span>
            </div>
          </div>

          {/* Goal + Timeframe */}
          <div className="fade-in-item relative z-[20] flex flex-col gap-[6px]" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-[4px] text-[10px] font-medium leading-[14px] text-[#8d4f04]">
              <span className="flex-1">Goal</span>
              <span className="flex-1">Timeframe</span>
            </div>
            <div className="flex items-start gap-[4px]">
              {/* Goal dropdown */}
              <div ref={goalRef} className="relative flex-1">
                <button
                  onClick={() => { setGoalOpen((o) => !o); setTimeframeOpen(false); }}
                  className="w-full flex items-center justify-between bg-white rounded-[8px] px-[12px] h-[52px]"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[14px] font-medium leading-[16px] text-black">{goal.label}</span>
                    <span className="text-[10px] font-medium leading-[12px] text-[#c9c9c9]">{goal.btcLabel}</span>
                  </div>
                  <svg width="11" height="5.6" viewBox="0 0 11 5.6" fill="none" className={`shrink-0 transition-transform duration-200 ${goalOpen ? "rotate-180" : ""}`}>
                    <path d="M1 1L5.5 4.6L10 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {goalOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-[4px] rounded-[8px] bg-white py-[8px] shadow-[0px_4px_12px_rgba(0,0,0,0.2)]">
                    {GOAL_OPTIONS.map((opt, i) => (
                      <button
                        key={opt.sats}
                        onMouseDown={() => { setGoalIndex(i); setGoalOpen(false); }}
                        className={`w-full px-[12px] py-[4px] text-left hover:bg-[#f7931a]/10 flex flex-col`}
                      >
                        <span className={`text-[14px] leading-[22px] ${i === goalIndex ? "font-semibold text-black" : "font-normal text-[#c9c9c9]"}`}>
                          {opt.label}
                        </span>
                        <span className="text-[10px] font-normal leading-[14px] text-[#c9c9c9]">{opt.btcLabel}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeframe dropdown */}
              <div ref={timeframeRef} className="relative flex-1">
                <button
                  onClick={() => { setTimeframeOpen((o) => !o); setGoalOpen(false); }}
                  className="w-full flex items-center justify-between bg-white rounded-[8px] px-[12px] h-[52px]"
                >
                  <span className="text-[14px] font-medium leading-[16px] text-black">{timeframe.label}</span>
                  <svg width="11" height="5.6" viewBox="0 0 11 5.6" fill="none" className={`shrink-0 transition-transform duration-200 ${timeframeOpen ? "rotate-180" : ""}`}>
                    <path d="M1 1L5.5 4.6L10 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {timeframeOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-[4px] rounded-[8px] bg-white py-[8px] shadow-[0px_4px_12px_rgba(0,0,0,0.2)]">
                    {TIMEFRAME_OPTIONS.map((opt, i) => (
                      <button
                        key={opt.years}
                        onMouseDown={() => { setTimeframeIndex(i); setTimeframeOpen(false); }}
                        className={`w-full px-[12px] py-[4px] text-left text-[14px] leading-[22px] hover:bg-[#f7931a]/10 ${
                          i === timeframeIndex ? "font-semibold text-black" : "font-normal text-[#c9c9c9]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Appreciation + Chart/Empty + Results (one connected block) ── */}
          <div className={`fade-in-item flex flex-col ${hasSalary ? "gap-[8px]" : "gap-[24px]"}`} style={{ animationDelay: "250ms" }}>

            {/* Annual BTC appreciation */}
            <div className="flex flex-col gap-[6px]">
              <p className="text-[10px] font-medium leading-[14px] text-[#8d4f04]">Annual BTC appreciation</p>
              <div className="flex items-center gap-[4px]">
                {APPRECIATION_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setAppreciationPct(pct)}
                    className={`h-[52px] flex-1 rounded-[8px] text-[14px] font-medium text-black transition-colors duration-150 ${
                      appreciationPct === pct ? "bg-white" : "bg-[#e3830f] hover:bg-[#FFAE4B]"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Chart (salary entered) */}
            {hasSalary && chartData.length > 0 && (
              <div className="rounded-[8px] overflow-hidden bg-[#141414] border border-[#2a2a2a] pt-[12px] pb-[8px] pr-[8px]">
                <ResponsiveContainer width="100%" height={149}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="stackGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f7931a" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f7931a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                    <XAxis
                      dataKey="month"
                      ticks={xAxisTicks}
                      tickFormatter={(v) => `Y${v / 12}`}
                      tick={{ fill: "#666", fontSize: 10, fontFamily: "inherit" }}
                      axisLine={{ stroke: "#2a2a2a" }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={fmtSatsAxis}
                      tick={{ fill: "#666", fontSize: 10, fontFamily: "inherit" }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip
                      content={<ChartTooltip btcPrice={btcPrice!} appreciationPct={appreciationPct} />}
                      cursor={{ stroke: "#f7931a", strokeWidth: 1, strokeDasharray: "3 3" }}
                    />
                    <ReferenceLine
                      y={goal.sats}
                      stroke="#f7931a"
                      strokeDasharray="4 3"
                      strokeWidth={1}
                      label={{
                        value: `Goal: ${goal.label}`,
                        position: "insideBottomRight",
                        fill: "#f7931a",
                        fontSize: 9,
                        fontFamily: "inherit",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sats"
                      stroke="#f7931a"
                      strokeWidth={2.5}
                      fill="url(#stackGradient)"
                      dot={false}
                      activeDot={{ r: 3, fill: "#f7931a", stroke: "#fff", strokeWidth: 1 }}
                      animationDuration={800}
                      animationEasing="ease-in-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Results card (salary entered) */}
            {hasSalary && (
              <div className="bg-[#141414] flex flex-col gap-[12px] items-start pb-[12px] pt-[8px] px-[12px] rounded-[8px] border border-[#2a2a2a]">
                <div className="flex flex-col gap-[6px] w-full">
                  <div className="flex items-center justify-between text-[10px] font-medium leading-[14px]">
                    <span className="text-[#f7931a]">Progress to {goal.label}</span>
                    <span className={goalReached ? "text-[#79d887]" : "text-[#f7931a]"}>
                      {Math.round(progressPct)}%
                    </span>
                  </div>
                  <div className="h-[6px] w-full rounded-[20px] bg-[#2a2a2a] overflow-hidden">
                    <div
                      className={`h-full rounded-[20px] transition-[width] duration-500 ease-in-out ${
                        goalReached
                          ? "bg-gradient-to-r from-[#f7931a] to-[#78d988]"
                          : "bg-[#f7931a]"
                      }`}
                      style={{ width: `${Math.min(100, progressPct)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-start justify-between w-full">
                  <div className="flex flex-col gap-[4px]">
                    <p className="text-[10px] font-medium leading-[14px] text-[#565656]">Total stacked (sats)</p>
                    <p className="text-[24px] font-medium leading-[20px] text-white">{fmtSats(totalStacked)}</p>
                  </div>
                  <div className="flex flex-col gap-[4px] text-right">
                    <p className="text-[10px] font-medium leading-[14px] text-[#565656]">Goal reached in</p>
                    {monthsToGoal !== null ? (
                      <p className="text-[24px] font-medium leading-[20px] text-[#79d887]">
                        {fmtMonthsToReach(monthsToGoal)}
                      </p>
                    ) : (
                      <p className="text-[24px] font-medium leading-[20px] text-[#f7931a]">
                        &gt;{timeframe.label}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state (no salary) */}
            {!hasSalary && (
              <div className="flex flex-col items-center gap-[8px]">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="16" cy="16" r="15" stroke="#8d4f04" strokeWidth="2"/>
                  <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill="#8d4f04" fontFamily="inherit">₿</text>
                </svg>
                <p className="text-center text-[14px] font-medium leading-[16px] text-[#8d4f04] w-full">
                  Enter your salary to see the stacking projection
                </p>
              </div>
            )}

          </div>{/* end appreciation+chart+results block */}

          {/* Disclaimer */}
          {showDisclaimer && (
            <p className="fade-in-item text-[10px] font-medium leading-[14px] text-[#8d4f04]" style={{ animationDelay: "300ms" }}>
              {showBtcDisclaimer
                ? `Based on current BTC price of $${btcPrice ? fmtBtcPrice(btcPrice) : "—"} with ${appreciationPct}%/yr appreciation. Not financial advice. Past performance ≠ future results. The above simulations are hypothetical — not financial advice.`
                : "Not financial advice. Past performance ≠ future results. The above simulations are hypothetical — not financial advice."}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="fade-in-item flex flex-col gap-[16px] text-[12px] text-[#8d4f04]" style={{ animationDelay: "500ms" }}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-semibold leading-[16px] md:justify-center md:gap-0">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="hidden md:inline">&nbsp; |&nbsp;{" "}</span>
            <Link href="/privacy-policy" className="hover:underline">Privacy policy</Link>
            <span className="hidden md:inline">&nbsp; |&nbsp;{" "}</span>
            <Link href="/cookies" className="hover:underline">Cookies</Link>
            <span className="hidden md:inline">&nbsp; |&nbsp;{" "}</span>
            <Link href="/terms-of-use" className="hover:underline">Terms of use</Link>
            <span className="hidden md:inline">&nbsp; |&nbsp;{" "}</span>
            <span className="underline">The Stack Calculator</span>
            <span className="hidden md:inline">&nbsp; |&nbsp;{" "}</span>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
          <p className="font-normal leading-[12px] md:text-center">© 2026 Sats2USD.com</p>
        </div>

      </div>
    </div>
  );
}
