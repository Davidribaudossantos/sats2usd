import { MetadataRoute } from "next";
import { PAIR_SLUGS } from "@/lib/currencyPairs";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://sats2usd.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...PAIR_SLUGS.map((slug) => ({
      url: `https://sats2usd.com/convert/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    {
      url: "https://sats2usd.com/privacy-policy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://sats2usd.com/cookies",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://sats2usd.com/terms-of-use",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://sats2usd.com/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://sats2usd.com/stack-calculator",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
