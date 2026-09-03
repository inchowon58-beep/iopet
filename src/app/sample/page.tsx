import type { Metadata } from "next";
import { getGlobalSponsor } from "@/lib/site-sponsor";
import { buildSampleSponsors } from "@/lib/sample-sponsor";
import { SITE } from "@/lib/site";
import SamplePreviewClient from "./SamplePreviewClient";

export const metadata: Metadata = {
  title: "입점 샘플 미리보기",
  description:
    "아이오펫 SEO 페이지 입점 시 중간 카드·하단 고정 바가 어떻게 바뀌는지 미리 확인하세요.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function SamplePage() {
  const current = await getGlobalSponsor();
  const { recruiting, active } = buildSampleSponsors(current);
  const inquiryUrl = current.link_url || SITE.kakaoOpenChatUrl;

  return (
    <SamplePreviewClient recruiting={recruiting} active={active} inquiryUrl={inquiryUrl} />
  );
}
