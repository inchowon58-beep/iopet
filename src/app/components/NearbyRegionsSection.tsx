import Link from "next/link";
import type { NearbyLink } from "@/lib/nearby-regions";

interface Props {
  cityLabel: string | null;
  regions: NearbyLink[];
  keywordSuffix?: string;
}

/** 근방 구·동 — marketstore 스타일 SEO 키워드 카드 */
export default function NearbyRegionsSection({
  cityLabel,
  regions,
  keywordSuffix = "메인쿤분양",
}: Props) {
  if (regions.length === 0 || !cityLabel) return null;

  return (
    <section className="mb-12 border border-[var(--line)] bg-[linear-gradient(135deg,rgba(212,160,23,0.12),#fff)] p-6 sm:p-8">
      <p className="text-sm font-semibold text-[var(--sky-deep)]">근방 지역 (구·동)</p>
      <h2 className="mt-1 text-lg font-extrabold text-[var(--navy)] sm:text-xl">
        {cityLabel} 인근에서 함께 찾는 {keywordSuffix} 지역
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        {cityLabel}에서 {keywordSuffix}을 알아보는 분들이 이동 거리와 상담 범위를 고려해
        함께 검색하는 근방 구·동입니다.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {regions.map((item) => {
          const title = `${item.label} ${keywordSuffix}`;
          const body = (
            <span className="block">
              <span className="block text-sm font-semibold text-[var(--navy)]">{title}</span>
              <span className="mt-0.5 block text-xs text-[var(--muted)]">
                {cityLabel} 인근 · {item.label}
              </span>
            </span>
          );
          return (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-start gap-2 rounded-[0.4rem] border border-[var(--line)] bg-white px-4 py-3.5 transition hover:border-[var(--sky)]"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex items-start gap-2 rounded-[0.4rem] border border-[var(--line)] bg-white px-4 py-3.5">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="sr-only">
        {cityLabel} {keywordSuffix} 근방 지역:{" "}
        {regions.map((r) => `${r.label} ${keywordSuffix}`).join(", ")}
      </p>
    </section>
  );
}
