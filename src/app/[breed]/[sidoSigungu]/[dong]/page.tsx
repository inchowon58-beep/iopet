import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBreed, isBreedSlug, SPECIES_BREEDS } from "@/lib/breeds";
import { buildBreedContent } from "@/lib/breed-content";
import { breedJsonLd, breedMetadata } from "@/lib/breed-meta";
import { getSigunguByKey, isValidDong, POPULAR_REGION_KEYS } from "@/lib/korea-regions";
import { publicOrigin } from "@/lib/public-url";
import { breedPath } from "@/lib/breed-paths";
import BreedLanding from "@/app/components/BreedLanding";

type Props = { params: Promise<{ breed: string; sidoSigungu: string; dong: string }> };

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  const params: { breed: string; sidoSigungu: string; dong: string }[] = [];
  for (const breed of SPECIES_BREEDS) {
    for (const key of POPULAR_REGION_KEYS) {
      const region = getSigunguByKey(key);
      if (!region) continue;
      for (const dong of region.dongs.slice(0, 3)) {
        params.push({ breed: breed.slug, sidoSigungu: key, dong });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { breed: raw, sidoSigungu, dong: rawDong } = await params;
  const breed = getBreed(raw);
  const region = getSigunguByKey(sidoSigungu);
  const dong = decodeURIComponent(rawDong || "").trim();
  if (!breed || !isBreedSlug(raw) || !region || !isValidDong(region.sido, region.sigungu, dong)) {
    return { title: "페이지 없음" };
  }
  return breedMetadata(breed, await publicOrigin(), region.sido, region.sigungu, dong);
}

export default async function BreedDongPage({ params }: Props) {
  const { breed: raw, sidoSigungu, dong: rawDong } = await params;
  const breed = getBreed(raw);
  const region = getSigunguByKey(sidoSigungu);
  const dong = decodeURIComponent(rawDong || "").trim();
  if (!breed || !isBreedSlug(raw) || !region || !isValidDong(region.sido, region.sigungu, dong)) {
    notFound();
  }
  const origin = await publicOrigin();
  const content = buildBreedContent(breed, region.sido, region.sigungu, dong);
  const jsonLd = breedJsonLd(breed, origin, region.sido, region.sigungu, dong);

  return (
    <>
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      <BreedLanding
        breed={breed}
        content={content}
        sido={region.sido}
        sigungu={region.sigungu}
        dong={dong}
        pagePath={breedPath(breed.slug, region.sido, region.sigungu, dong)}
      />
    </>
  );
}
