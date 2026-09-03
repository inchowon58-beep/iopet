import type { Metadata } from "next";
import Link from "next/link";
import { BREEDS, kindKo } from "@/lib/breeds";
import { breedCover } from "@/lib/breed-images";
import { breedPath } from "@/lib/breed-paths";
import { SITE } from "@/lib/site";
import { publicPageUrl } from "@/lib/public-url";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const url = await publicPageUrl("/bunyang");
  return {
    title: "전국 견종·묘종 입양 안내",
    description: `전국 시·군·구·동 ${SITE.brand} 견종·묘종 입양 안내. 기질과 우리 집 하루를 지역 맞춤으로 확인하세요.`,
    keywords: ["견종입양", "묘종입양", "지역별입양", "아이오펫", SITE.brand],
    alternates: { canonical: url },
    openGraph: {
      title: `전국 견종·묘종 입양 안내 | ${SITE.name}`,
      description: "시·군·구·동 × 견종·묘종 롱테일 입양 안내",
      url,
      images: [{ url: SITE.ogImage, width: 800, height: 600, alt: SITE.name }],
    },
  };
}

export default function BunyangIndexPage() {
  const dogs = BREEDS.filter((b) => b.kind === "dog");
  const cats = BREEDS.filter((b) => b.kind === "cat");
  const shelters = BREEDS.filter((b) => b.kind === "shelter");

  return (
    <div className="container py-16 md:py-24">
      <p className="section-kicker">Nationwide</p>
      <h1 className="mt-3 text-3xl font-extrabold text-[var(--navy)] md:text-4xl">
        전국 견종·묘종 입양 안내
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--muted)]">
        시·도, 시·군·구, 동 단위로 {SITE.brand} 입양 안내를 이어 드립니다. 품종을 고르시면
        그 색감의 지역 페이지로 이동합니다.
      </p>

      {[
        { title: `견종 ${dogs.length}종`, items: dogs },
        { title: `묘종 ${cats.length}종`, items: cats },
        { title: "보호소", items: shelters },
      ].map((group) => (
        <section key={group.title} className="mt-12">
          <h2 className="text-2xl font-extrabold text-[var(--navy)]">{group.title}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((b) => (
              <Link
                key={b.slug}
                href={breedPath(b.slug)}
                className="group overflow-hidden rounded-[1.1rem] border border-[var(--line)] bg-white transition hover:-translate-y-0.5"
                style={{ borderColor: `${b.palette.accent}44` }}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={breedCover(b.folder)}
                    alt={`${b.name} 분양`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span
                    className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold text-white"
                    style={{ background: b.palette.accent }}
                  >
                    {kindKo(b)}
                  </span>
                </div>
                <div className="p-4" style={{ background: b.palette.accentSoft }}>
                  <p className="text-lg font-extrabold" style={{ color: b.palette.ink }}>
                    {b.name} 분양
                  </p>
                  <p className="mt-1 text-sm" style={{ color: b.palette.muted }}>
                    {b.tag} · {b.size}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
