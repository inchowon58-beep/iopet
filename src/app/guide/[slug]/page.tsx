import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE, CTA_KAKAO } from "@/lib/site";
import { listPageSummaries, readPage } from "@/lib/seo-pages";
import { galleryAlt, isRealImage, placeholderIndexFrom } from "@/lib/images";
import ImageSlot from "@/app/components/ImageSlot";
import { faqJsonLd, howToJsonLd } from "@/lib/faq-data";
import GuideHeroThumb from "@/app/components/GuideHeroThumb";
import SponsorMidBox from "@/app/components/SponsorMidBox";
import { getGlobalSponsor } from "@/lib/site-sponsor";
import { publicKakaoUrl } from "@/lib/site-sponsor-shared";
import NearbyRegionsSection from "@/app/components/NearbyRegionsSection";
import NearbyStationsSection from "@/app/components/NearbyStationsSection";
import DoodleGalleryCta from "@/app/components/DoodleGalleryCta";
import {
  getNearbyStationLinks,
  getNearbySubRegionLinks,
  regionFromPageKeyword,
} from "@/lib/nearby-regions";
import { extractKeywordTheme } from "@/lib/region-parse";
import { getSubRegionNames } from "@/lib/sub-region-map";
import { getNearbyStationNames } from "@/lib/subway-map";
import { absoluteUrl, publicOrigin } from "@/lib/public-url";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await listPageSummaries();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const page = await readPage(slug);
  if (!page) return { title: "페이지 없음" };
  const origin = await publicOrigin();
  const url = absoluteUrl(origin, `/guide/${encodeURIComponent(page.slug)}`);
  const ogImage = page.images.find((u) => isRealImage(u)) || SITE.ogImage || SITE.logo;
  const region = regionFromPageKeyword(page.keyword);
  const theme = extractKeywordTheme(page.keyword);
  const areas = getSubRegionNames(region, 5);
  const stations = getNearbyStationNames(region, 5);
  const geoBits = [
    ...areas.map((a) => `${a} ${theme}`),
    ...stations.map((s) => `${s} ${theme}`),
  ];
  const description =
    page.metaDescription.length >= 80
      ? page.metaDescription
      : geoBits.length > 0
        ? `${page.metaDescription} 근방 ${areas.slice(0, 3).join("·")} · 인근 ${stations
            .slice(0, 3)
            .join("·")} ${theme} 안내.`
        : page.metaDescription;
  const ogTitle = page.title.includes(SITE.brand)
    ? page.title
    : `${page.title} | ${SITE.brand}`;
  const keywords = [
    ...page.metaKeywords.split(",").map((s) => s.trim()).filter(Boolean),
    ...geoBits,
  ];
  return {
    title: page.title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      type: "article",
      locale: "ko_KR",
      siteName: SITE.name,
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      authors: [SITE.name],
      section: "메인쿤분양 안내",
      tags: keywords.slice(0, 8),
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                width: 1200,
                height: 1200,
                alt: `${page.keyword} 메인쿤분양 — ${SITE.name}`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const page = await readPage(slug);
  if (!page) notFound();

  const origin = await publicOrigin();
  const pageUrl = absoluteUrl(origin, `/guide/${encodeURIComponent(page.slug)}`);
  const images = (page.images || []).slice(0, 3);
  const region = regionFromPageKeyword(page.keyword);
  const keywordSuffix = extractKeywordTheme(page.keyword);
  const [{ cityLabel, regions }, { stations }, sponsor] = await Promise.all([
    getNearbySubRegionLinks(region, page.slug),
    getNearbyStationLinks(region, page.slug),
    getGlobalSponsor(),
  ]);
  const kakaoUrl = publicKakaoUrl(sponsor);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: origin },
      {
        "@type": "ListItem",
        position: 2,
        name: "지역별 메인쿤분양 안내",
        item: absoluteUrl(origin, "/guide"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.h1,
        item: pageUrl,
      },
    ],
  };
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.metaDescription,
    keywords: page.metaKeywords,
    datePublished: page.createdAt,
    dateModified: page.updatedAt,
    author: { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      ...(SITE.logo ? { logo: { "@type": "ImageObject", url: SITE.logo } } : {}),
    },
    ...(images.filter(isRealImage).length
      ? { image: images.filter(isRealImage) }
      : SITE.logo
        ? { image: [SITE.logo] }
        : {}),
    mainEntityOfPage: pageUrl,
    about: ["강아지입양", "고양이입양", "견종입양", "묘종입양", "아이오펫", page.keyword],
  };

  return (
    <article className="pb-8 pt-8 md:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(page.faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd(pageUrl)) }}
      />

      <div className="bg-[linear-gradient(180deg,#243056_0%,#d4a017_38%,#f7f3ea_38%)] px-4 pb-10 pt-6">
        <div className="container">
          <GuideHeroThumb page={page} imageSrc={images[0] || SITE.logo} />
        </div>
      </div>

      <div className="container max-w-3xl py-12">
        <nav className="mb-8 text-sm text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--coral)]">
            홈
          </Link>
          <span className="mx-2">/</span>
          <Link href="/guide" className="hover:text-[var(--coral)]">
            지역별 메인쿤분양 안내
          </Link>
          <span className="mx-2">/</span>
          <span>{page.keyword}</span>
        </nav>

        <p className="mb-2 text-sm font-bold tracking-wide text-[var(--sky)]">
          {page.heroSubtitle}
        </p>
        <p className="mb-8 text-lg font-semibold leading-snug text-[var(--navy)] md:text-xl">
          {page.h1}
        </p>

        <DoodleGalleryCta sponsor={sponsor} slot={1} />

        {page.sections.map((sec, si) => (
          <section key={sec.h2} className="mb-12">
            <h2 className="text-2xl font-extrabold text-[var(--navy)] md:text-3xl">{sec.h2}</h2>
            <div className="my-3 h-px w-12 bg-[var(--coral)]" />
            {sec.paragraphs.map((p, pi) => (
              <p key={pi} className="mb-4 leading-relaxed text-[var(--muted)]">
                {p}
              </p>
            ))}
            {si < 2 && images[si + 1] && (
              <figure className="relative my-7 aspect-[16/10] overflow-hidden rounded-[1.4rem] border border-[var(--line)]">
                {isRealImage(images[si + 1]) ? (
                  <Image
                    src={images[si + 1]}
                    alt={galleryAlt(page.keyword, si + 2)}
                    width={1000}
                    height={640}
                    unoptimized
                    className="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <ImageSlot
                    index={placeholderIndexFrom(images[si + 1])}
                    fill
                    label={galleryAlt(page.keyword, si + 2)}
                  />
                )}
              </figure>
            )}
            {si === 0 && <SponsorMidBox sponsor={sponsor} />}
            {si === 1 && <DoodleGalleryCta sponsor={sponsor} slot={2} />}
          </section>
        ))}

        {page.faqs?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-extrabold text-[var(--navy)] md:text-3xl">자주 묻는 질문</h2>
            <div className="my-3 h-px w-12 bg-[var(--coral)]" />
            <div className="space-y-3">
              {page.faqs.map((f) => (
                <details
                  key={f.q}
                  className="rounded-[var(--radius-lg)] bg-white px-4 py-3 ring-1 ring-[var(--line)]"
                >
                  <summary className="cursor-pointer font-medium text-[var(--navy)]">{f.q}</summary>
                  <p className="mt-2 text-sm text-[var(--muted)]">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <NearbyRegionsSection
          cityLabel={cityLabel}
          regions={regions}
          keywordSuffix={keywordSuffix}
        />
        <NearbyStationsSection
          cityLabel={cityLabel}
          stations={stations}
          keywordSuffix={keywordSuffix}
        />

        {sponsor.status !== "RECRUITING" && (
          <aside className="mt-10 border border-[var(--coral)] bg-[var(--coral-soft)] p-6 text-center">
            <p className="text-xl font-extrabold text-[var(--navy)] md:text-2xl">{page.ctaText}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {kakaoUrl && (
                <a
                  href={kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex"
                >
                  {CTA_KAKAO}
                </a>
              )}
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
