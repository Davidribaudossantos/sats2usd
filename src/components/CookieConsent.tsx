"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Script from "next/script";
import {
  readConsentCookie,
  writeConsentCookie,
  type ConsentPrefs,
} from "@/lib/cookieConsent";

// ── gtag type ─────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}

// ── Consent helpers ───────────────────────────────────────────────────────────

type Prefs = {
  analytics: boolean;
  advertising: boolean;
  personalized_ads: boolean;
};

const REJECTED: Prefs = {
  analytics: false,
  advertising: false,
  personalized_ads: false,
};
const ACCEPTED: Prefs = {
  analytics: true,
  advertising: true,
  personalized_ads: true,
};

// Env-var placeholders — set NEXT_PUBLIC_GA_ID and NEXT_PUBLIC_ADSENSE_ID when ready
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

function gtagUpdate(p: Prefs) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    analytics_storage: p.analytics ? "granted" : "denied",
    ad_storage: p.advertising ? "granted" : "denied",
    ad_user_data: p.advertising ? "granted" : "denied",
    ad_personalization: p.personalized_ads ? "granted" : "denied",
  });
}


function loadAdSense() {
  if (!ADSENSE_ID || document.getElementById("adsense-script")) return;
  const s = document.createElement("script");
  s.id = "adsense-script";
  s.async = true;
  s.src =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
  s.setAttribute("data-ad-client", ADSENSE_ID);
  document.head.appendChild(s);
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({
  on,
  locked,
  onChange,
}: {
  on: boolean;
  locked?: boolean;
  onChange?: () => void;
}) {
  // Locked (Necessary): orange circle blends into bg — visually disabled
  // ON: white circle  OFF: black circle
  const circleColor = locked ? "bg-[#f7931a]" : on ? "bg-white" : "bg-black";
  // Circle travel: container 48px - 2px left pad - 2px right pad - 16px circle = 28px
  return (
    <button
      type="button"
      onClick={locked ? undefined : onChange}
      disabled={locked}
      aria-pressed={on}
      className="relative h-[20px] w-[48px] shrink-0 overflow-hidden rounded-[12px] bg-[#e3830f]"
    >
      {/* "ON" label — fades in on the left when on */}
      <span
        className={`absolute left-[5px] top-1/2 -translate-y-1/2 text-[10px] font-semibold leading-[12px] text-white transition-opacity duration-200 ${
          on ? "opacity-100" : "opacity-0"
        }`}
      >
        ON
      </span>
      {/* Sliding circle */}
      <span
        className={`absolute left-[2px] top-[2px] size-[16px] rounded-full transition-transform duration-200 ease-in-out ${circleColor} ${
          on ? "translate-x-[28px]" : "translate-x-0"
        }`}
      />
      {/* "OFF" label — fades in on the right when off */}
      <span
        className={`absolute right-[4px] top-1/2 -translate-y-1/2 text-[10px] font-semibold leading-[12px] text-black transition-opacity duration-200 ${
          !on ? "opacity-100" : "opacity-0"
        }`}
      >
        OFF
      </span>
    </button>
  );
}

// ── CookieConsent ─────────────────────────────────────────────────────────────

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  // showBanner: true when no consent saved yet and modal not open
  const [analyticsConsented, setAnalyticsConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // prefs: current toggle state in modal (may differ from savedPrefs while editing)
  const [prefs, setPrefs] = useState<Prefs>(REJECTED);
  // savedPrefs: last committed consent (used to detect unsaved changes)
  const [savedPrefs, setSavedPrefs] = useState<Prefs>(REJECTED);
  // consentSaved: true once user has made a choice and a cookie was written
  const [consentSaved, setConsentSaved] = useState(false);

  const applyConsent = useCallback((p: Prefs) => {
    gtagUpdate(p);
    if (p.analytics) setAnalyticsConsented(true);
    if (p.advertising) loadAdSense();
  }, []);

  useEffect(() => {
    const existing = readConsentCookie();
    if (existing) {
      const p: Prefs = {
        analytics: existing.analytics,
        advertising: existing.advertising,
        personalized_ads: existing.personalized_ads,
      };
      setPrefs(p);
      setSavedPrefs(p);
      setConsentSaved(true);
      applyConsent(p);
      // Banner stays hidden — consent already given
    } else {
      setShowBanner(true);
    }
    setMounted(true);

    // Listen for "open-cookie-modal" from ManageCookiesButton (on /cookies page)
    function handleOpenModal() {
      setShowBanner(false);
      setShowModal(true);
    }
    window.addEventListener("open-cookie-modal", handleOpenModal);
    return () =>
      window.removeEventListener("open-cookie-modal", handleOpenModal);
  }, [applyConsent]);

  // Commit a preference choice: write cookie, update gtag, load scripts
  function commit(p: Prefs) {
    const cookie: ConsentPrefs = { necessary: true, ...p };
    writeConsentCookie(cookie);
    setSavedPrefs(p);
    setConsentSaved(true);
    applyConsent(p);
  }

  function handleAcceptAll() {
    setPrefs(ACCEPTED);
    commit(ACCEPTED);
    setShowModal(false);
    setShowBanner(false);
  }

  function handleRejectAll() {
    setPrefs(REJECTED);
    commit(REJECTED);
    setShowModal(false);
    setShowBanner(false);
  }

  function handleSavePrefs() {
    commit(prefs);
    setShowModal(false);
    setShowBanner(false);
  }

  function handleManage() {
    setShowBanner(false);
    setShowModal(true);
  }

  function handleCloseModal() {
    // Discard unsaved changes
    setPrefs(savedPrefs);
    setShowModal(false);
    // Re-show banner if no consent has been committed yet
    if (!consentSaved) setShowBanner(true);
  }

  // "Save preferences" is white (active) when toggles differ from last saved state
  const hasChanges =
    prefs.analytics !== savedPrefs.analytics ||
    prefs.advertising !== savedPrefs.advertising ||
    prefs.personalized_ads !== savedPrefs.personalized_ads;

  if (!mounted) return null;

  return (
    <>
      {/* ── Banner (fixed, full-width) ── */}
      {showBanner && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#E8851A]"
          style={{ boxShadow: "0px -3px 20px rgba(0,0,0,0.25)" }}
        >
          <div className="flex w-full flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[14px] font-normal leading-[18px] text-black md:flex-1">
              We use cookies to keep this site working.{" "}
              <button
                type="button"
                onClick={handleManage}
                className="underline hover:no-underline"
              >
                Manage
              </button>{" "}
              them anytime.
            </p>
            <div className="mt-1 flex w-full gap-2 md:mt-0 md:w-auto md:justify-end">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex h-[36px] flex-1 items-center justify-center rounded-[4px] bg-white px-4 text-[14px] font-semibold text-black transition-colors hover:bg-black hover:text-white md:flex-none md:min-w-[120px]"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={handleRejectAll}
                className="flex h-[36px] flex-1 items-center justify-center rounded-[4px] bg-[#8B4513] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-black md:flex-none md:min-w-[120px]"
              >
                Reject all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GA4 scripts — only after analytics consent ── */}
      {analyticsConsented && GA_ID && (
        <>
          <Script
            id="ga-script"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-config" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div
            className="w-full max-w-[360px] rounded-[8px] bg-[#ffa231] p-[24px] md:max-w-[500px]"
            style={{ boxShadow: "0px 10px 20px 0px rgba(0,0,0,0.2)" }}
          >
            {/* Header */}
            <div className="mb-[14px] flex items-start justify-between">
              <p className="text-[16px] font-semibold leading-[16px] text-black">
                Manage your cookies
              </p>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close"
                className="shrink-0"
              >
                <Image src="/x-close.svg" alt="" width={16} height={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-[14px]">
              <p className="text-[12px] font-normal leading-[16px] text-black">
                Choose which cookies we can use. Necessary cookies help the site
                function and can&apos;t be switched off.
              </p>

              {/* Necessary — always ON, locked */}
              <div className="flex items-start justify-between">
                <p className="w-[216px] text-[12px] leading-[16px] text-black">
                  <span className="font-semibold">Necessary</span>
                  <br />
                  <span className="font-normal">
                    Required for core functionality and security.
                  </span>
                </p>
                <Toggle on locked />
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between">
                <p className="w-[216px] text-[12px] leading-[16px] text-black">
                  <span className="font-semibold">Analytics</span>
                  <br />
                  <span className="font-normal">
                    Helps us understand how the site is used so we can improve
                    it.
                  </span>
                </p>
                <Toggle
                  on={prefs.analytics}
                  onChange={() =>
                    setPrefs((p) => ({ ...p, analytics: !p.analytics }))
                  }
                />
              </div>

              {/* Advertising */}
              <div className="flex items-start justify-between">
                <p className="w-[216px] text-[12px] leading-[16px] text-black">
                  <span className="font-semibold">Advertising</span>
                  <br />
                  <span className="font-normal">
                    Used to show ads and measure ad performance.
                  </span>
                </p>
                <Toggle
                  on={prefs.advertising}
                  onChange={() =>
                    setPrefs((p) => ({ ...p, advertising: !p.advertising }))
                  }
                />
              </div>

              {/* Personalized ads */}
              <div className="flex items-start justify-between">
                <p className="w-[216px] text-[12px] leading-[16px] text-black">
                  <span className="font-semibold">Personalized ads</span>
                  <br />
                  <span className="font-normal">
                    Allows Google to personalize ads based on your activity. If
                    off, you may still see ads but they may be less relevant.
                  </span>
                </p>
                <Toggle
                  on={prefs.personalized_ads}
                  onChange={() =>
                    setPrefs((p) => ({
                      ...p,
                      personalized_ads: !p.personalized_ads,
                    }))
                  }
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-[8px]">
                {/* Save preferences: white when there are changes, muted otherwise */}
                <button
                  type="button"
                  onClick={handleSavePrefs}
                  className={`flex h-[30px] w-full items-center justify-center rounded-[4px] text-[12px] font-semibold ${
                    hasChanges
                      ? "bg-white text-black"
                      : "bg-[#ffb862] text-[#e3830f]"
                  }`}
                >
                  Save preferences
                </button>
                <div className="flex gap-[8px]">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex h-[30px] flex-1 items-center justify-center rounded-[4px] bg-white text-[12px] font-semibold text-black transition-colors hover:bg-black hover:text-white"
                  >
                    Accept all
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectAll}
                    className="flex h-[30px] flex-1 items-center justify-center rounded-[4px] bg-[#8d4f04] text-[12px] font-semibold text-[#ffa231] transition-colors hover:bg-black hover:text-white"
                  >
                    Reject all
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
