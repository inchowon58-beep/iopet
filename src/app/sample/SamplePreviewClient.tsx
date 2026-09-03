"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, MessageCircle } from "lucide-react";
import type { SiteSponsor } from "@/lib/site-sponsor-shared";
import DoodleGalleryCta from "@/app/components/DoodleGalleryCta";
import LiveEngineBadge from "@/app/components/LiveEngineBadge";
import SponsorMidBox from "@/app/components/SponsorMidBox";
import SponsorStickyFooterBar from "@/app/components/SponsorStickyFooterBar";
import { CTA_RENTAL } from "@/lib/site";
import { imageUrl } from "@/lib/images";
import {
  SAMPLE_PAGE_H1,
  SAMPLE_PAGE_KEYWORD,
  SAMPLE_PAGE_SUBTITLE,
  SAMPLE_SECTIONS,
} from "@/lib/sample-sponsor";

type Tab = "recruiting" | "active";

type Props = {
  recruiting: SiteSponsor;
  active: SiteSponsor;
  inquiryUrl: string;
};

export default function SamplePreviewClient({ recruiting, active, inquiryUrl }: Props) {
  const [tab, setTab] = useState<Tab>("recruiting");
  const sponsor = tab === "recruiting" ? recruiting : active;
  const isRecruiting = tab === "recruiting";

  return (
    <div className="pb-16 pt-8 md:pt-10">
      <div className="container max-w-3xl">
        <p className="rounded-[1.1rem] border border-[var(--coral)] bg-[var(--coral-soft)] px-4 py-3 text-center text-sm font-semibold leading-relaxed text-[var(--coral-deep)] md:text-base">
          <LiveEngineBadge className="mb-1.5" />
          <span className="mt-1.5 block">
            지금 이 시각에도 해당사이트의 웹문서 노출 작업은 진행중에 있습니다. 자리가 차기 전에
            확인하세요.
          </span>
        </p>
        <p className="mt-6 text-sm font-bold tracking-wide text-[var(--sky)]">입점 샘플 미리보기</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--navy)] md:text-4xl">
          입점 시 이렇게 바뀌어요
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--muted)]">
          전국 SEO 웹문서 5,000+ 페이지의 <strong className="text-[var(--navy)]">중간 카드</strong>와{" "}
          <strong className="text-[var(--navy)]">하단 고정 바</strong>가 입점 업체 정보로 일괄
          전환됩니다. 아래는 실제 SEO 페이지와 동일한 UI입니다.
        </p>

        <div className="mt-6 rounded-[0.4rem] border border-[var(--line)] bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-[0.3rem] bg-[var(--sky-soft)] px-3 py-1 text-sm font-bold text-[var(--sky-deep)]">
              임대 비용 {recruiting.rental_price || "30만원"}
            </span>
            <span className="text-sm text-[var(--muted)]">일일 SEO 발행 · 전국 노출 · 어드민 즉시 반영</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            입점 후 카카오톡 URL을 등록하면 고객이 바로 상담을 시작할 수 있습니다.
          </p>
        </div>

        <div className="mt-8 flex rounded-[0.4rem] border border-[var(--line)] bg-white p-1">
          <button
            type="button"
            onClick={() => setTab("recruiting")}
            className={`flex-1 rounded-[0.3rem] px-4 py-3 text-sm font-bold transition ${
              isRecruiting
                ? "bg-[var(--sky-soft)] text-[var(--sky-deep)]"
                : "text-[var(--muted)] hover:text-[var(--navy)]"
            }`}
          >
            모집 중 (현재)
          </button>
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`flex-1 rounded-[0.3rem] px-4 py-3 text-sm font-bold transition ${
              !isRecruiting
                ? "bg-[var(--coral-soft)] text-[var(--coral-deep)]"
                : "text-[var(--muted)] hover:text-[var(--navy)]"
            }`}
          >
            입점 후 (샘플)
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          {isRecruiting
            ? "지금 전국 SEO 페이지에 노출되는 제휴·임대 모집 화면입니다."
            : "입점 후 업체명·강조 포인트·상담 버튼이 전국 문서에 일괄 노출됩니다. (샘플 업체)"}
        </p>
      </div>

        <div className="mt-10 border-y border-[var(--line)] bg-[var(--sky-soft)] py-3">
        <p className="container flex items-center justify-center gap-2 text-center text-xs font-semibold text-[var(--muted)]">
          <Eye size={14} aria-hidden />
          SEO 페이지 미리보기 · {SAMPLE_PAGE_KEYWORD}
        </p>
      </div>

      <article className="container max-w-3xl py-10">
        <div className="mb-8 overflow-hidden border border-[var(--line)]">
          <Image
            src={imageUrl(1)}
            alt={`${SAMPLE_PAGE_KEYWORD} 안내`}
            width={1000}
            height={640}
            unoptimized
            className="aspect-[16/10] w-full object-cover"
            priority
          />
        </div>

        <nav className="mb-8 text-sm text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--coral)]">
            홈
          </Link>
          <span className="mx-2">/</span>
          <Link href="/guide" className="hover:text-[var(--coral)]">
            지역별 메인쿤분양 안내
          </Link>
          <span className="mx-2">/</span>
          <span>{SAMPLE_PAGE_KEYWORD}</span>
        </nav>

        <p className="mb-2 text-sm font-bold tracking-wide text-[var(--sky)]">{SAMPLE_PAGE_SUBTITLE}</p>
        <p className="mb-8 text-lg font-semibold leading-snug text-[var(--navy)] md:text-xl">
          {SAMPLE_PAGE_H1}
        </p>

        <DoodleGalleryCta sponsor={sponsor} slot={1} />

        {SAMPLE_SECTIONS.map((sec, si) => (
          <section key={sec.h2} className="mb-12">
            <h2 className="text-2xl font-extrabold text-[var(--navy)] md:text-3xl">{sec.h2}</h2>
            <div className="my-3 h-px w-12 bg-[var(--coral)]" />
            {sec.paragraphs.map((p, pi) => (
              <p key={pi} className="mb-4 leading-relaxed text-[var(--muted)]">
                {p}
              </p>
            ))}
            {si === 0 && <SponsorMidBox sponsor={sponsor} showPreviewLink={false} />}
            {si === 1 && <DoodleGalleryCta sponsor={sponsor} slot={2} />}
          </section>
        ))}

        <div className="mt-10 rounded-[0.4rem] border border-dashed border-[var(--line)] bg-white p-6">
          <p className="text-center text-sm font-bold text-[var(--navy)]">하단 고정 바 미리보기</p>
          <p className="mt-1 text-center text-xs text-[var(--muted)]">
            실제 페이지에서는 화면 하단에 고정됩니다
          </p>
          <div className="mt-4">
            <SponsorStickyFooterBar sponsor={sponsor} variant="inline" showPreviewLink={false} />
          </div>
        </div>
      </article>

      <div className="container max-w-3xl">
        <aside className="border border-[var(--sky)] bg-[var(--sky-soft)] p-6 text-center md:p-8">
          <p className="text-lg font-extrabold text-[var(--navy)] md:text-xl">
            전국 SEO 문서에 입점하고 싶으신가요?
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            임대 비용 {recruiting.rental_price || "30만원"} · 카카오톡으로 제휴 문의
          </p>
          {inquiryUrl ? (
            <a
              href={inquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-5 inline-flex"
            >
              <MessageCircle size={18} />
              {CTA_RENTAL} · {recruiting.rental_price || "30만원"}
            </a>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
