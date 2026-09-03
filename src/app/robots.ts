import type { MetadataRoute } from "next";
import { publicOrigin } from "@/lib/public-url";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await publicOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
