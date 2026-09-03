import Link from "next/link";
import type { SeoPageSummary } from "@/lib/seo-pages";
import { pagePath } from "@/lib/seo-pages";

const MAIN_PREVIEW = 5;

export default function ArticlesScroll({ pages }: { pages: SeoPageSummary[] }) {
  const preview = pages.slice(0, MAIN_PREVIEW);

  if (!preview.length) {
    return (
      <section id="articles" className="section bg-white/50">
        <div className="container">
          <p className="section-kicker">ARCHIVE</p>
          <h2 className="mt-3 text-2xl font-bold text-[var(--navy)] md:text-3xl">
            <Link href="/guide" className="hover:text-[var(--coral)]">
              지역별 메인쿤분양 안내
            </Link>
          </h2>
          <p className="mt-3 text-[var(--muted)]">발행된 지역 안내 글이 여기에 노출됩니다.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="articles" className="section bg-white/50">
      <div className="container">
        <p className="section-kicker">ARCHIVE</p>
        <h2 className="mt-3 text-2xl font-bold text-[var(--navy)] md:text-3xl">
          <Link href="/guide" className="hover:text-[var(--coral)]">
              지역별 메인쿤분양 안내
          </Link>
        </h2>
        <p className="mt-3 text-[var(--muted)]">
          최신 {MAIN_PREVIEW}건 미리보기 · 전체 목록은 최신 100건 기준 —{" "}
          <Link href="/guide" className="underline hover:text-[var(--coral)]">
            전체 목록 보기
          </Link>
        </p>
        <div className="mt-8 space-y-2">
          {preview.map((p, i) => (
            <Link
              key={p.slug}
              href={pagePath(p.slug)}
              className="flex gap-4 rounded-[1.3rem] border border-[var(--line)] bg-white px-5 py-4 transition hover:border-[var(--coral)]"
            >
              <span className="w-8 shrink-0 text-lg font-extrabold text-[var(--coral)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <span className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--sky)]">
                  {p.keyword}
                </span>
                <h3 className="mt-1 text-xl font-bold text-[var(--navy)]">{p.h1}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                  {p.metaDescription}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
