import Link from "next/link";
import { BadgeCheck, Eye, Globe, MessageCircle, PhoneCall } from "lucide-react";
import type { SiteSponsor } from "@/lib/site-sponsor-shared";
import { phoneToTel, sponsorKakaoUrl, sponsorHomepageUrl } from "@/lib/site-sponsor-shared";
import { SITE, CTA_KAKAO } from "@/lib/site";
import LiveEngineBadge from "@/app/components/LiveEngineBadge";

type Props = { sponsor: SiteSponsor; showPreviewLink?: boolean };

export default function SponsorMidBox({ sponsor, showPreviewLink = true }: Props) {
  const kakaoUrl = sponsorKakaoUrl(sponsor);
  const recruitingKakao = kakaoUrl;
  const homepageUrl = sponsorHomepageUrl(sponsor);
  const phoneHref = sponsor.phone_number ? phoneToTel(sponsor.phone_number) : "";

  if (sponsor.status === "RECRUITING") {
    return (
      <aside className="my-10 border border-[var(--sky)] bg-[var(--sky-soft)] p-6 text-center md:p-8">
        <LiveEngineBadge />
        <p className="mt-3 text-lg font-extrabold text-[var(--navy)] md:text-xl">
          📢 전국 메인쿤분양 입점 제휴 / 사이트 임대 모집 중
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">{sponsor.recruiting_notice}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {sponsor.phone_number && (
            <a href={phoneHref} className="btn-primary inline-flex">
              <PhoneCall size={18} />
              전화 제휴문의
            </a>
          )}
          {recruitingKakao ? (
          <a
            href={recruitingKakao}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            <MessageCircle size={18} />
            카카오톡 제휴 문의하기 {sponsor.rental_price ? `· 비용 ${sponsor.rental_price}` : ""}
          </a>
          ) : null}
          {homepageUrl && (
            <a
              href={homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[0.4rem] border border-[var(--sky)] px-4 py-3 text-sm font-bold text-[var(--sky)]"
            >
              <Globe size={18} />
              홈페이지
            </a>
          )}
          {showPreviewLink && (
            <Link
              href="/sample"
              className="inline-flex items-center gap-1.5 rounded-[0.4rem] border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-[var(--navy)]"
            >
              <Eye size={18} />
              입점 후 미리보기
            </Link>
          )}
        </div>
        <div className="mx-auto mt-6 max-w-xl text-left text-sm leading-relaxed text-[var(--muted)] md:text-[0.95rem]">
          <p className="font-extrabold text-[var(--navy)]">입점, 서두르실 필요 없습니다.</p>
          <p className="mt-3">
            지금 이 순간에도 네이버 상위 노출 엔진은 멈추지 않고 돌아가며, 페이지의 가치는 매일
            실시간으로 쌓이고 있습니다.
          </p>
          <p className="mt-3">
            노출이 얼마나 터지는지 천천히 눈으로 확인하고, &apos;지금이다&apos; 싶을 때
            들어오셔도 좋습니다.
            <br />
            다만, 누군가 먼저 이 자리를 차지하는 순간, 그 기회는 영영 사라집니다.
          </p>
        </div>
      </aside>
    );
  }

  const points = (sponsor.highlight_points || []).slice(0, 5);

  return (
    <aside className="relative my-10 border border-[var(--coral)] bg-[var(--coral-soft)] p-6 md:p-8">
      <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-[0.3rem] bg-white px-3 py-1 text-xs font-bold text-[var(--coral-deep)]">
        <BadgeCheck size={14} />
        인증 확인
      </span>
      <p className="pt-6 text-center text-lg font-extrabold text-[var(--navy)] md:text-xl">
        📍 메인쿤분양 제휴
      </p>
      <div className="mt-4 flex flex-col items-center gap-3 text-center">
        {sponsor.sponsor_name && (
          <p className="text-xl font-bold text-[var(--sky-deep)]">{sponsor.sponsor_name}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {points.map((point) => (
            <p
              key={point}
              className="inline-flex items-center gap-2 rounded-[0.3rem] bg-white px-4 py-2 text-sm font-semibold text-[var(--navy)]"
            >
              {point}
            </p>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {sponsor.phone_number && (
            <a href={phoneHref} className="btn-primary inline-flex">
              <PhoneCall size={18} />
              정보상담
            </a>
          )}
          {homepageUrl && (
            <a
              href={homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[0.4rem] border border-[var(--sky)] px-4 py-3 text-sm font-bold text-[var(--sky)]"
            >
              <Globe size={18} />
              홈페이지
            </a>
          )}
          {kakaoUrl && (
            <a
              href={kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex"
            >
              <MessageCircle size={18} />
              {CTA_KAKAO}
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
