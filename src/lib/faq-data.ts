import { SITE, KAKAO_CTA_HINT } from "./site";

export type FaqItem = { q: string; a: string };

/** 메인·AEO용 자주 묻는 질문 */
export const HOME_FAQS: FaqItem[] = [
  {
    q: "아이오펫은 무엇을 하는 곳인가요?",
    a: "강아지·고양이를 품종별로 소개하는 입양 안내 사이트입니다. 메인에서 얼굴을 고르신 뒤, 각 품종 페이지에서 기질·체구·하루 루틴을 읽고 상담으로 이어 갑니다.",
  },
  {
    q: "원하는 품종은 어디서 고르나요?",
    a: "홈 화면의 사진 카드, 또는 상단의 품종 메뉴에서 견종·묘종을 누르면 전용 안내 페이지로 이동합니다. 성격과 키우기는 그 페이지에 모아 두었습니다.",
  },
  {
    q: "입양 비용은 얼마인가요?",
    a: "품종·개체·시기에 따라 폭이 있어 이 사이트에 단가를 고정해 두지 않습니다. 상담에서 범위와 포함 항목을 먼저 맞춰 드립니다.",
  },
  {
    q: "우리 동네 안내도 볼 수 있나요?",
    a: "있습니다. 품종을 고르면 시·군·구·동 단위 페이지로 이어지고, 지역안내 메뉴에서 발행된 글도 볼 수 있습니다.",
  },
  {
    q: "상담은 어떻게 시작하나요?",
    a: `관리자에서 카카오톡을 등록한 뒤 오픈채팅으로 이어집니다. ${KAKAO_CTA_HINT}`,
  },
];

export const EMERGENCY_HOWTO_STEPS = [
  {
    name: "얼굴을 고릅니다",
    text: "홈에서 견종·묘종 사진을 보고 마음이 가는 품종을 선택합니다.",
  },
  {
    name: "하루 루틴을 읽습니다",
    text: "기질, 체구, 털 관리, 집 준비를 품종 페이지에서 확인합니다.",
  },
  {
    name: "우리 집과 맞춰 봅니다",
    text: "등록된 카카오톡으로 거주 지역과 희망 시기를 알려 주시면 이어서 안내합니다.",
  },
  {
    name: "만나고 결정합니다",
    text: "직접 보거나 추가 사진을 받은 뒤 입양 여부를 정합니다. 서두르지 않아도 됩니다.",
  },
] as const;

export function faqJsonLd(faqs: FaqItem[] = HOME_FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function howToJsonLd(pageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "아이오펫에서 입양 품종을 고르는 순서",
    description: "얼굴 고르기, 하루 루틴 확인, 상담까지 아이오펫 입양 안내.",
    inLanguage: "ko-KR",
    totalTime: "PT2H",
    url: pageUrl || SITE.siteUrl,
    step: EMERGENCY_HOWTO_STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function orgJsonLd(url?: string, telephone?: string) {
  const sameAs = [SITE.kakaoOpenChatUrl].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "PetStore",
    name: SITE.name,
    alternateName: [SITE.brand, SITE.brandEn],
    description: SITE.description,
    url: url || SITE.siteUrl,
    ...(SITE.ogImage ? { image: SITE.ogImage } : {}),
    ...(telephone ? { telephone } : {}),
    openingHours: "Mo-Su 10:00-20:00",
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
      streetAddress: SITE.address,
    },
    areaServed: SITE.areaServed,
    priceRange: "입양 상담",
    keywords: SITE.keywords.join(", "),
    ...(sameAs.length ? { sameAs } : {}),
  };
}
