export type ConsentPrefs = {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  personalized_ads: boolean;
};

const COOKIE_NAME = "cookie_consent";
const EXPIRES_DAYS = 365;

export function readConsentCookie(): ConsentPrefs | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + COOKIE_NAME + "=([^;]*)")
  );
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as ConsentPrefs;
  } catch {
    return null;
  }
}

export function writeConsentCookie(prefs: ConsentPrefs): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setDate(expires.getDate() + EXPIRES_DAYS);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(prefs)
  )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}
