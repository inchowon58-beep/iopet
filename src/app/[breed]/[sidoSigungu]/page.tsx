import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BREEDS, getBreed, isBreedSlug } from "@/lib/breeds";
import { buildBreedContent } from "@/lib/breed-content";
import { breedJsonLd, breedMetadata } from "@/lib/breed-meta";
import { getSigunguByKey, parseSidoName, POPULAR_REGION_KEYS, SIDOS, SIDO_SHORT_NAMES } from "@/lib/korea-regions";
import { publicOrigin } from "@/lib/public-url";
import { breedPath } from "@/lib/breed-paths";
import BreedLanding from "@/app/components/BreedLanding";

type Props = { params: Promise<{ breed: string; sidoSigungu: string }> };

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  const params: { breed: string; sidoSigungu: string }[] = [];
  for (const breed of BREEDS) {
    for (const sido of SIDOS) {
      params.push({ breed: breed.slug, sidoSigungu: sido });
    }
    for (const sido of SIDO_SHORT_NAMES) {
      params.push({ breed: breed.slug, sidoSigungu: sido });
    }
    for (const key of POPULAR_REGION_KEYS) {
      params.push({ breed: breed.slug, sidoSigungu: key });
    }
  }
  return params;
}

function resolveRegion(sidoSigungu: string) {
  const sigungu = getSigunguByKey(sidoSigungu);
  if (sigungu) return { sido: sigungu.sido, sigungu: sigungu.sigungu };
  const sido = parseSidoName(sidoSigungu);
  if (sido) return { sido, sigungu: undefined as string | undefined };
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { breed: raw, sidoSigungu } = await params;
  const breed = getBreed(raw);
  const region = resolveRegion(sidoSigungu);
  if (!breed || !isBreedSlug(raw) || !region) return { title: "페이지 없음" };
  return breedMetadata(breed, await publicOrigin(), region.sido, region.sigungu);
}

export default async function BreedRegionPage({ params }: Props) {
  const { breed: raw, sidoSigungu } = await params;
  const breed = getBreed(raw);
  const region = resolveRegion(sidoSigungu);
  if (!breed || !isBreedSlug(raw) || !region) notFound();
  const origin = await publicOrigin();
  const content = buildBreedContent(breed, region.sido, region.sigungu);
  const jsonLd = breedJsonLd(breed, origin, region.sido, region.sigungu);

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
        pagePath={breedPath(breed.slug, region.sido, region.sigungu)}
      />
    </>
  );
}
