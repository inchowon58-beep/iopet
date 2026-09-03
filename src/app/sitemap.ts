import type { MetadataRoute } from "next";
import { listPageSummaries } from "@/lib/seo-pages";
import { publicOrigin } from "@/lib/public-url";
import { BREEDS, SPECIES_BREEDS } from "@/lib/breeds";
import { breedPath } from "@/lib/breed-paths";
import { KOREA_REGIONS, POPULAR_REGION_KEYS, SIDOS, SIDO_SHORT_NAMES, getSigunguByKey } from "@/lib/korea-regions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await publicOrigin();
  const pages = await listPageSummaries();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/guide`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/bunyang`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const guides = pages.map((p) => ({
    url: `${base}/guide/${encodeURIComponent(p.slug)}`,
    lastModified: new Date(p.updatedAt || p.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const breedHubs: MetadataRoute.Sitemap = BREEDS.map((b) => ({
    url: `${base}${breedPath(b.slug)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const sidoPages: MetadataRoute.Sitemap = [];
  for (const breed of BREEDS) {
    for (const sido of SIDOS) {
      sidoPages.push({
        url: `${base}${breedPath(breed.slug, sido)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.72,
      });
    }
    for (const sido of SIDO_SHORT_NAMES) {
      sidoPages.push({
        url: `${base}${breedPath(breed.slug, sido)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  const sigunguPages: MetadataRoute.Sitemap = [];
  for (const breed of BREEDS) {
    for (const region of KOREA_REGIONS) {
      sigunguPages.push({
        url: `${base}${breedPath(breed.slug, region.sido, region.sigungu)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.65,
      });
    }
  }

  const dongPages: MetadataRoute.Sitemap = [];
  for (const breed of SPECIES_BREEDS) {
    for (const key of POPULAR_REGION_KEYS) {
      const region = getSigunguByKey(key);
      if (!region) continue;
      for (const dong of region.dongs.slice(0, 3)) {
        dongPages.push({
          url: `${base}${breedPath(breed.slug, region.sido, region.sigungu, dong)}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  }

  return [...staticRoutes, ...guides, ...breedHubs, ...sidoPages, ...sigunguPages, ...dongPages];
}
