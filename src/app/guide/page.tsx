import type { Metadata } from "next";
import Link from "next/link";
import { listPublicPageSummaries, pagePath, PUBLIC_PAGE_LIMIT } from "@/lib/seo-pages";
import { SITE } from "@/lib/site";
import { publicPageUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const url = await publicPageUrl("/guide");
  return {
    title: "지역별 메인쿤분양 안내",
    description: `${SITE.name} 지역별 메인쿤분양 — 특징·크기·분양가 안내`,
    keywords: [...SITE.keywords, "지역별 메인쿤분양"],
    alternates: { canonical: url },
    openGraph: {
      title: `지역별 메인쿤분양 안내 | ${SITE.name}`,
      description: `${SITE.name} 메인쿤분양 지역 가이드`,
      url,
      images: [{ url: SITE.logo, alt: SITE.name }],
    },
  };
}

const PAGE_SIZE = 25;

type Props = { searchParams: Promise<{ page?: string }> };

export default async function GuideIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pageNum = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const all = await listPublicPageSummaries();
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
  const current = Math.min(pageNum, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const slice = all.slice(start, start + PAGE_SIZE);

  return (
    <div className="container min-h-screen py-28">
      <p className="section-kicker">Archive</p>
      <h1 className="mt-3 text-3xl font-bold text-[var(--navy)] md:text-4xl">
        지역별 메인쿤분양 안내
      </h1>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        최신 {Math.min(total, PUBLIC_PAGE_LIMIT)}건 · 메인쿤분양 지역 가이드
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        오래된 문서는 검색 유입과 직접 URL 접근을 위해 유지되며, 목록에는 최신 문서 중심으로 노출됩니다.
      </p>

      <ul className="mt-10 divide-y divide-[var(--line)] overflow-hidden rounded-[0.4rem] border border-[var(--line)] bg-white">
        {slice.length === 0 && (
          <li className="px-5 py-8 text-[var(--muted)]">등록된 안내글이 없습니다.</li>
        )}
        {slice.map((p, i) => {
          const no = start + i + 1;
          return (
            <li key={p.slug}>
              <Link
                href={pagePath(p.slug)}
                className="flex gap-4 px-5 py-4 transition hover:bg-[var(--sky-soft)]"
              >
                <span className="w-10 shrink-0 text-xl font-bold text-[var(--coral)]">
                  {String(no).padStart(2, "0")}
                </span>
                <div>
                  <div className="text-xs text-[var(--sky)]">{p.keyword}</div>
                  <div className="text-xl font-bold text-[var(--navy)]">{p.h1}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                    {p.metaDescription}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {totalPages >= 1 && (
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="페이지">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={n === 1 ? "/guide" : `/guide?page=${n}`}
              className={`min-w-9 rounded-full px-2 py-1 text-center text-sm ${
                n === current
                  ? "bg-[var(--sky-deep)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--ink)]"
              }`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
