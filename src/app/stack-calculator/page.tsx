import type { Metadata } from "next";
import StackCalculator from "@/components/StackCalculator";

export const metadata: Metadata = {
  title: "Bitcoin Stacking Calculator — How Fast Can You Reach Your Sats Goal?",
  description:
    "Calculate how long it takes to stack 1 million sats, 10 million sats, or a whole Bitcoin based on your salary. Free Bitcoin savings calculator with live prices.",
  metadataBase: new URL("https://sats2usd.com"),
  alternates: {
    canonical: "https://sats2usd.com/stack-calculator",
  },
  openGraph: {
    title: "Bitcoin Stacking Calculator — How Fast Can You Reach Your Sats Goal?",
    description:
      "Calculate how long it takes to stack 1 million sats, 10 million sats, or a whole Bitcoin based on your salary. Free Bitcoin savings calculator with live prices.",
    url: "https://sats2usd.com/stack-calculator",
    siteName: "Sats2USD",
    type: "website",
    images: [
      {
        url: "https://sats2usd.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bitcoin Stacking Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitcoin Stacking Calculator — How Fast Can You Reach Your Sats Goal?",
    description:
      "Calculate how long it takes to stack 1 million sats, 10 million sats, or a whole Bitcoin based on your salary. Free Bitcoin savings calculator with live prices.",
    images: ["https://sats2usd.com/og-image.png"],
  },
};

export default function StackCalculatorPage() {
  return <StackCalculator />;
}
