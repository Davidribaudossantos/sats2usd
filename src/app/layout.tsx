import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend-deca",
});

export const metadata: Metadata = {
  title: "Sats to USD Converter | Satoshi to US Dollar",
  description:
    "Convert satoshis (SATS) to USD and Bitcoin to US dollars with live rates.",
  verification: {
    google: "deiB3oK4r8X9Utr3wOVublgsupJBapcLlXdR1FQqgw4",
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
