import type { MetadataRoute } from "next";
import { launchMarkets } from "@/lib/markets";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://securitymatchnow.com";
  const now = new Date();

  const staticPaths = [
    "",
    "/find-security",
    "/providers",
    "/founding-providers",
    "/markets",
    "/terms",
    "/privacy",
    "/provider-terms",
    "/billing-policy",
    "/verification-policy",
  ];

  return [
    ...staticPaths.map((path) => ({
      url: base + path,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...launchMarkets.map((market) => ({
      url: base + "/markets/" + market.slug,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: market.phase <= 2 ? 0.8 : 0.6,
    })),
  ];
}
