import Link from "next/link";
import { Eye, Globe, MessageCircle, PhoneCall } from "lucide-react";
import type { SiteSponsor } from "@/lib/site-sponsor-shared";
import { phoneToTel, sponsorKakaoUrl, sponsorHomepageUrl } from "@/lib/site-sponsor-shared";
import { SITE, CTA_RENTAL } from "@/lib/site";

type Props = {
  sponsor: SiteSponsor;
  variant?: "fixed" | "inline";
  showPreviewLink?: boolean;
};

export default function SponsorStickyFooterBar({
  sponsor,
  variant = "fixed",
  showPreviewLink = true,
}: Props) {
  const wrapperClass = variant === "fixed" ? "fixed-cta" : "fixed-cta fixed-cta--inline";
  const kakaoUrl = sponsorKakaoUrl(sponsor);
  const recruitingKakao = kakaoUrl;
  const homepageUrl = sponsorHomepageUrl(sponsor);
  const hasPhone = Boolean(sponsor.phone_number?.trim());
  const phoneHref = hasPhone ? phoneToTel(sponsor.phone_number) : "";

  if (sponsor.status === "RECRUITING") {
    return (
      <div className={wrapperClass} aria-label="제휴 문의">
        <div className="fixed-cta-inner">
          {(hasPhone || homepageUrl) && (
            <div className={hasPhone && homepageUrl ? "fixed-cta-row" : undefined}>
              {hasPhone && (
                <a href={phoneHref} className="fixed-cta-call w-full justify-center">
                  <PhoneCall size={16} aria-hidden />
                  전화 제휴문의
                </a>
              )}
              {homepageUrl && (
                <a
                  href={homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fixed-cta-call fixed-cta-call--alt w-full justify-center"
                >
                  <Globe size={16} aria-hidden />
                  홈페이지
                </a>
              )}
            </div>
          )}
          {recruitingKakao ? (
          <a
            href={recruitingKakao}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed-cta-call w-full justify-center"
          >
            <MessageCircle size={16} aria-hidden />
            {CTA_RENTAL} {sponsor.rental_price ? `· ${sponsor.rental_price}` : ""}
          </a>
          ) : null}
          {showPreviewLink && variant === "fixed" && (
            <Link href="/sample" className="fixed-cta-build w-full justify-center">
              <Eye size={16} aria-hidden />
              입점 후 미리보기
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass} aria-label="정보 상담">
      <div className="fixed-cta-inner">
        {(hasPhone || homepageUrl) && (
          <div className={hasPhone && homepageUrl ? "fixed-cta-row" : undefined}>
            {hasPhone && (
              <a href={phoneHref} className="fixed-cta-call w-full justify-center">
                <PhoneCall size={16} aria-hidden />
                {sponsor.phone_number.trim()}
              </a>
            )}
            {homepageUrl && (
              <a
                href={homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed-cta-call fixed-cta-call--alt w-full justify-center"
              >
                <Globe size={16} aria-hidden />
                홈페이지
              </a>
            )}
          </div>
        )}
        {kakaoUrl && (
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed-cta-call w-full justify-center"
          >
            <MessageCircle size={16} aria-hidden />
            카카오톡 상담하기
          </a>
        )}
      </div>
    </div>
  );
}
