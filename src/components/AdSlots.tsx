import Image from "next/image";
import Link from "next/link";

function AdLabel() {
  return (
    <span className="text-[10px] font-medium uppercase tracking-widest text-[#8d4f04]/50">
      Advertisement
    </span>
  );
}

/**
 * Desktop_Ad1 — 728×90 top leaderboard
 * Links to /convert/eur-to-sats. Desktop only.
 */
export function AdTopLeaderboard() {
  return (
    <div className="hidden md:flex flex-col items-center gap-1">
      <AdLabel />
      <Link href="/convert/eur-to-sats">
        <Image
          src="/Desktop_Ad1_728x90.png"
          alt="You can also convert Sats to EUR, GBP, JPY & BRL"
          width={728}
          height={90}
          priority
        />
      </Link>
    </div>
  );
}

/**
 * Desktop_Ad2 / Mobile_Ad1 — 300×250 mid-content
 * No link. Responsive: each image shown at its breakpoint.
 */
export function AdMiddle() {
  return (
    <div className="flex flex-col items-center gap-1 mx-auto">
      <AdLabel />
      {/* Desktop */}
      <Image
        src="/Desktop_Ad2_300x250.png"
        alt="Add to homescreen"
        width={300}
        height={250}
        className="hidden md:block"
      />
      {/* Mobile */}
      <Image
        src="/Mobile_Ad1_300x250.png"
        alt="Add to homescreen"
        width={300}
        height={250}
        className="block md:hidden"
      />
    </div>
  );
}

/**
 * Desktop_Ad3 / Mobile_Ad2 — 300×50 small banner
 * Links to https://x.com/sats2usd in a new tab.
 */
export function AdSmallBanner() {
  return (
    <div className="flex flex-col items-center gap-1 mx-auto">
      <AdLabel />
      {/* Desktop */}
      <a
        href="https://x.com/sats2usd"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:block"
      >
        <Image
          src="/Desktop_Ad3_300x50.png"
          alt="Follow @sats2usd on X"
          width={300}
          height={50}
        />
      </a>
      {/* Mobile */}
      <a
        href="https://x.com/sats2usd"
        target="_blank"
        rel="noopener noreferrer"
        className="block md:hidden"
      >
        <Image
          src="/Mobile_Ad2_300x50.png"
          alt="Follow @sats2usd on X"
          width={300}
          height={50}
        />
      </a>
    </div>
  );
}

/**
 * Mobile_Ad3 — 300×50 footer banner
 * Mailto link. Mobile only.
 */
export function AdFooterBanner() {
  return (
    <div className="flex flex-col items-center gap-1 mx-auto md:hidden">
      <AdLabel />
      <a href="mailto:support@sats2usd.com">
        <Image
          src="/Mobile_Ad3_300x50.png"
          alt="Want to reach Bitcoiners? Advertise here"
          width={300}
          height={50}
        />
      </a>
    </div>
  );
}

/**
 * Desktop_Ad4 — 728×90 bottom leaderboard
 * Mailto link. Desktop only.
 */
export function AdBottomLeaderboard() {
  return (
    <div className="hidden md:flex flex-col items-center gap-1">
      <AdLabel />
      <a href="mailto:support@sats2usd.com">
        <Image
          src="/Desktop_Ad4_728x90.png"
          alt="Want to reach Bitcoiners? Advertise here"
          width={728}
          height={90}
        />
      </a>
    </div>
  );
}
