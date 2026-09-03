"use client";

import { MessageCircle } from "lucide-react";
import { CTA_KAKAO } from "@/lib/site";
import ImageSlot from "./ImageSlot";
import { useKakaoHref } from "./KakaoHrefProvider";

const SERVICES = [
  {
    title: "메인쿤 특징",
    desc: "귀 터프트, 목도리 털, 큰 발. 사람 곁과 혼자 쉬는 면이 같이 있습니다",
    slot: 5,
    tag: "특징",
  },
  {
    title: "메인쿤 크기",
    desc: "수컷 6~12kg, 암컷 4~8kg 전후. 2~4년을 두고 천천히 커지는 대형묘입니다",
    slot: 14,
    tag: "크기",
  },
  {
    title: "메인쿤 분양가",
    desc: "혈통·성별·털색·시기에 따라 폭이 있습니다. 단가보다 포함 항목을 먼저 맞춰 드립니다",
    slot: 22,
    tag: "분양가",
  },
  {
    title: "메인쿤 성격",
    desc: "낮고 깊은 목소리, 사람 곁에 머무는 편. 개체 차는 상담에서 풀어 드립니다",
    slot: 33,
    tag: "성격",
  },
];

export default function Services() {
  const kakaoHref = useKakaoHref();
  return (
    <section id="services" className="section bg-white/55">
      <div className="container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">ON DISPLAY</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--navy)] md:text-4xl">
              고르기 전에 보는 네 가지
            </h2>
            <p className="mt-3 max-w-xl text-[var(--muted)]">
              기질, 체구, 비용 요인, 성격입니다. 아이오펫에서 실제 아이 얼굴을 먼저 보세요.
            </p>
          </div>
          {kakaoHref ? (
            <a
              href={kakaoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sky shrink-0 inline-flex items-center gap-2"
            >
              <MessageCircle size={18} />
              {CTA_KAKAO}
            </a>
          ) : null}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {SERVICES.map((item) => (
            <article key={item.title} className="group relative overflow-hidden rounded-[var(--radius)]">
              <div className="relative aspect-[3/4] overflow-hidden">
                <ImageSlot index={item.slot} fill label={item.title} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(36,48,86,0.92)_100%)]" />
                <span className="absolute left-2 top-2 rounded-full bg-white/92 px-2 py-0.5 text-[0.65rem] font-bold text-[var(--coral-deep)] sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
                  {item.tag}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <h3 className="text-base font-bold text-white sm:text-lg">{item.title}</h3>
                  <p className="mt-1 text-xs text-white/80 sm:text-sm">{item.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
