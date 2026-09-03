import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BREEDS, getBreed, isBreedSlug } from "@/lib/breeds";
import { buildBreedContent } from "@/lib/breed-content";
import { breedJsonLd, breedMetadata } from "@/lib/breed-meta";
import { publicOrigin } from "@/lib/public-url";
import { breedPath } from "@/lib/breed-paths";
import BreedLanding from "@/app/components/BreedLanding";

type Props = { params: Promise<{ breed: string }> };

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return BREEDS.map((b) => ({ breed: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { breed: raw } = await params;
  const breed = getBreed(raw);
  if (!breed || !isBreedSlug(raw)) return { title: "페이지 없음" };
  return breedMetadata(breed, await publicOrigin());
}

export default async function BreedHubPage({ params }: Props) {
  const { breed: raw } = await params;
  const breed = getBreed(raw);
  if (!breed || !isBreedSlug(raw)) notFound();
  const origin = await publicOrigin();
  const content = buildBreedContent(breed);
  const jsonLd = breedJsonLd(breed, origin);

  return (
    <>
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      <BreedLanding breed={breed} content={content} pagePath={breedPath(breed.slug)} />
    </>
  );
}
