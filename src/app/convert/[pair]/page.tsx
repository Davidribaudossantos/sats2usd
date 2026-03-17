import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CURRENCY_PAIRS, PAIR_SLUGS, type PairSlug } from "@/lib/currencyPairs";
import FiatConverter from "@/components/FiatConverter";

type Props = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  return PAIR_SLUGS.map((pair) => ({ pair }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const config = CURRENCY_PAIRS[pair as PairSlug];
  if (!config) return {};

  const canonicalUrl = `https://sats2usd.com/convert/${pair}`;
  return {
    title: config.seoTitle,
    description: config.seoDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: config.seoTitle,
      description: config.seoDescription,
      url: canonicalUrl,
      siteName: "Sats2USD",
      type: "website",
      images: [
        {
          url: "https://sats2usd.com/og-image.png",
          width: 1200,
          height: 630,
          alt: config.h1,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.seoTitle,
      description: config.seoDescription,
      images: ["https://sats2usd.com/og-image.png"],
    },
  };
}

export default async function ConvertPage({ params }: Props) {
  const { pair } = await params;
  const config = CURRENCY_PAIRS[pair as PairSlug];
  if (!config) notFound();

  return <FiatConverter {...config} pairSlug={pair as PairSlug} />;
}
