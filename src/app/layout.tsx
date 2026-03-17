import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend-deca",
});

export const metadata: Metadata = {
  title: "Sats to USD Converter — Live Satoshi to Dollar Calculator",
  description:
    "Convert satoshis to US dollars instantly with live Bitcoin prices. Free, fast, and no sign-up required.",
  metadataBase: new URL("https://sats2usd.com"),
  alternates: {
    canonical: "https://sats2usd.com",
  },
  openGraph: {
    title: "Sats to USD Converter — Live Satoshi to Dollar Calculator",
    description:
      "Convert satoshis to US dollars instantly with live Bitcoin prices. Free, fast, and no sign-up required.",
    url: "https://sats2usd.com",
    siteName: "Sats2USD",
    type: "website",
    images: [
      {
        url: "https://sats2usd.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sats to USD Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sats to USD Converter — Live Satoshi to Dollar Calculator",
    description:
      "Convert satoshis to US dollars instantly with live Bitcoin prices. Free, fast, and no sign-up required.",
    images: ["https://sats2usd.com/og-image.png"],
  },
  verification: {
    google: "deiB3oK4r8X9Utr3wOVublgsupJBapcLlXdR1FQqgw4",
  },
  other: {
    "theme-color": "#f7931a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lexendDeca.variable} antialiased`}>
        {/*
          Google Consent Mode v2 — must run BEFORE any Google tags.
          Defaults everything to denied until the user explicitly consents.
          wait_for_update: 500 gives CookieConsent time to fire an update
          for returning visitors before the first GA hit is sent.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500
              });
            `,
          }}
        />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
