"use client";

import Link from "next/link";
import { CURRENCIES, CURRENCY_CODES, type CurrencyCode } from "@/lib/currencies";

interface ToggleMode {
  mode: "toggle";
  activeCurrency: CurrencyCode;
  onSelect: (code: CurrencyCode) => void;
}

interface LinkMode {
  mode: "link";
  activeCurrency: CurrencyCode;
}

type Props = ToggleMode | LinkMode;

export default function CurrencySelectorBar(props: Props) {
  const { activeCurrency } = props;

  return (
    <div className="flex w-full items-center justify-between md:justify-start md:gap-[4px]">
      {CURRENCY_CODES.map((code) => {
        const isActive = code === activeCurrency;
        const className = `flex h-[32px] w-[52px] md:w-auto md:flex-1 items-center justify-center overflow-hidden rounded-[4px] px-[2px] py-[4px] text-[12px] font-semibold leading-[12px] whitespace-nowrap transition-colors duration-150 ${
          isActive
            ? "bg-white text-black"
            : "bg-[#e3830f] text-white hover:bg-white hover:text-black"
        }`;

        if (props.mode === "toggle") {
          return (
            <button
              key={code}
              type="button"
              onClick={() => props.onSelect(code)}
              className={className}
            >
              {code}
            </button>
          );
        }

        return (
          <Link key={code} href={CURRENCIES[code].path} className={className}>
            {code}
          </Link>
        );
      })}
    </div>
  );
}
