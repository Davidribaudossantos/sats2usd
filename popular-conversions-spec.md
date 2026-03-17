# Popular Conversions Component — Claude Code Spec

## Overview

Add a "Popular Conversions" section to the Sats2USD converter homepage. It displays live fiat-to-sats rates for the top 5 currency pairs, cached every 6 hours.

---

## Currency Pairs

| # | From | To   | Label format         |
|---|------|------|----------------------|
| 1 | USD  | SATS | 1 USD ≈ X satoshi    |
| 2 | EUR  | SATS | 1 EUR ≈ X satoshi    |
| 3 | GBP  | SATS | 1 GBP ≈ X satoshi    |
| 4 | JPY  | SATS | 1 JPY ≈ X satoshi    |
| 5 | NGN  | SATS | 1 NGN ≈ X satoshi    |

---

## Conversion Logic

Each rate is calculated in two steps:

1. **Fiat → USD** using frankfurter.app (free, no API key required)
2. **USD → SATS** using the BTC/USD price already available in the app

Formula: `sats = (fiat_amount_in_usd / btc_price_usd) × 100,000,000`

For USD, skip step 1 — it's already in USD.

---

## Data Sources

### Fiat exchange rates
- **API:** `https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,NGN`
- Free, no key, no rate limit
- Returns rates relative to USD — invert them for "1 EUR = ? USD"
- Note: frankfurter.app uses ECB data. NGN may not be available — if not, use Open Exchange Rates free tier or hardcode a fallback with a "rates may be delayed" note

### BTC/USD price
- Use whatever API the converter already uses (likely CoinGecko or similar)

---

## Caching Strategy

- Cache both the fiat exchange rates and BTC price used for this component
- **Refresh interval: every 6 hours**
- Use Next.js ISR (`revalidate: 21600`) or a server-side cache/cron — whichever fits the existing architecture
- On failure to fetch, serve stale cached data rather than showing empty/broken state

---

## Display Rules

- Round sats values to whole numbers for values > 1 (e.g. "≈ 1,333 satoshi")
- Show one decimal for values between 1–10 (e.g. "≈ 8.9 satoshi")
- Show two decimals for values < 1 (e.g. "≈ 0.85 satoshi")
- Use thousands separator for large numbers (e.g. "1,333" not "1333")
- Use "≈" prefix on all values to signal approximation
- Unit label: "satoshi" (singular, lowercase)

---

## Component Structure

```
<section>
  <h2>Popular conversions</h2>
  <div class="conversions-grid">
    {pairs.map(pair => (
      <div class="conversion-row">
        <span class="from">1 {pair.currency}</span>
        <span class="to">≈ {pair.satsValue} satoshi</span>
      </div>
    ))}
  </div>
</section>
```

---

## Placement

- Below the main converter on the homepage
- Above the FAQ section (if present)

---

## Future Enhancement (do not build yet)

Each row will eventually link to a dedicated internal page (e.g. `/convert/eur-to-sats`) with a pre-filled converter for that currency pair. For now, rows are static text — no links.

---

## Acceptance Criteria

- [ ] Component renders 5 currency pairs with live conversion rates
- [ ] Data refreshes every 6 hours via cache/ISR
- [ ] Graceful fallback on API failure (stale data, not broken UI)
- [ ] Number formatting matches display rules above
- [ ] Component is responsive and matches existing site typography/spacing
- [ ] No API keys required (frankfurter.app is keyless)
