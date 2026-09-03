import { SITE, KAKAO_CTA_HINT } from "./site";
import { pickImages } from "./images";
import type { SeoPage } from "./seo-pages";
import { slugifyKeyword } from "./seo-pages";
import { extractKeywordTheme, extractRegionFromKeyword } from "./region-parse";
import { getSubRegionNames } from "./sub-region-map";
import { getNearbyStationNames } from "./subway-map";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function hasBatchim(word: string): boolean {
  const ch = word[word.length - 1];
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function eulReul(word: string): string {
  return hasBatchim(word) ? "을" : "를";
}

function euroRo(word: string): string {
  const ch = word[word.length - 1];
  if (!ch) return "로";
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jong = (code - 0xac00) % 28;
    if (jong === 0 || jong === 8) return "로";
  }
  return hasBatchim(word) ? "으로" : "로";
}

function clampDesc(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

const TITLES = [
  "{kw} | 아이오펫 입양 안내",
  "{kw}, 우리 집 하루에 맞춰 보는 품종",
  "가족이 되기 전에 읽는 {kw}",
];

const METAS = [
  "{kw}에서 입양할 품종을 고르는 안내입니다. 기질·체구·하루 루틴을 집 기준으로 정리했습니다. 아이오펫에서 얼굴을 먼저 보세요.",
  "입양 전 확인할 점입니다. {kw} 키우기, 무료분양 광고 주의점, 사진 상담. 단가는 상담에서 맞춥니다.",
  "{kw} 안내 — 입양과 키우기를 비교해 보세요. 아이오펫에서 아이 사진을 먼저 보실 수 있습니다.",
];

const H1S = [
  "{kw}, 가족이 되기 전의 입양 안내",
  "{kw}에서 고르는 입양",
  "우리 집 리듬까지 맞춰 보는 {kw}",
];

const HERO_SUB = [
  "설레는 얼굴과 우리 집 리듬을 먼저 맞춰 보세요",
  "기질과 체구, 키우기 하루를 먼저 확인",
  "입양 비용과 포함 항목은 상담에서 맞춥니다",
];

const INTRO_H2 = [
  "{kw}, 들이기 전에",
  "키우기를 생각하며 보는 {kw}",
  "{kw}와 함께 보는 품종 이야기",
];

const FLOW_H2 = [
  "입양은 이렇게 흘러갑니다",
  "{kw}에서 아이를 만나는 순서",
  "사진 다음에 오는 {kw} 상담",
];

const TRUST_H2 = [
  "{kw}, 아이오펫이 풀어 드리는 기준",
  "분양가가 갈릴 때 볼 항목",
  "{kw}에서 무료분양 문구를 볼 때",
];

const NEXT_H2 = [
  "{kw} 상담을 여는 방법",
  "사진을 보다가 묻는 {kw}",
  "{kw}에서 다음 단계로 가는 법",
];

export function generateTemplateContent(keyword: string, pageIndex = 1): SeoPage {
  const seed = hash(`${keyword}|${pageIndex}|${SITE.brand}|iopet-v1`);
  const kw = keyword.trim() || "강아지입양";
  const brand = SITE.brand;
  const obj = eulReul(kw);
  const as = euroRo(kw);

  const fill = (s: string) => s.replace(/\{kw\}/g, kw).replace(/\{brand\}/g, brand);

  const title = fill(pick(TITLES, seed));
  const h1 = fill(pick(H1S, seed));
  const heroSubtitle = pick(HERO_SUB, seed);

  const sections = [
    {
      h2: fill(pick(INTRO_H2, seed)),
      paragraphs: [
        `${kw}${obj} 찾는 분들은 대개 ‘우리 집에 이 품종이 맞나’부터 묻습니다. ${brand}은 입양을 사진과 하루 루틴에 맞춰 안내합니다.`,
        `${kw}${as} 알아보실 때 흔한 질문은 성체 크기, 빗질 주기, 아이와의 생활입니다. 공간이 맞는지를 먼저 보시면 선택이 분명해집니다.`,
        `상담에 필요한 정보는 거주 지역과 희망 시기입니다. 서류가 없어도 ${kw} 사진을 보고 물어볼 수 있습니다. ${KAKAO_CTA_HINT}`,
        `이 페이지는 ${kw}에서 품종을 고르기 전, 기질·체구·비용 요인·키우기를 집 기준으로 풀어 둔 안내입니다. 실제 가능한 아이와 비용은 상담에서 맞추면 됩니다.`,
      ],
    },
    {
      h2: fill(pick(FLOW_H2, seed + 1)),
      paragraphs: [
        `${kw} 상담은 보통 얼굴 보기 → 집 이야기 → 만남 또는 추가 사진 → 입양 순입니다. 급하게 결정하지 않아도 됩니다.`,
        `품종마다 자라는 속도와 성체 크기가 다릅니다. ‘지금 작아 보인다’만 보고 고르면 나중에 놀랄 수 있으니, 성체 기준으로 공간을 보세요.`,
        `방문이 가능하면 일정을 확인하고, 어렵다면 갤러리 사진을 본 뒤 문의해 주세요. 결정은 본인의 것입니다.`,
        `${kw}${as} 검색하셨다면, 광고 문장보다 성격·크기·비용 항목이 설명되는지를 먼저 보는 것을 권합니다. ${brand} 품종 페이지가 그 출발점입니다.`,
      ],
    },
    {
      h2: fill(pick(TRUST_H2, seed + 2)),
      paragraphs: [
        `${kw}에서 ${brand}이 말하는 기준은, 품종 기질을 숨기지 않고, 비용이 달라지는 이유를 나누며, 키우기 안내가 남는지를 뜻합니다.`,
        `한 줄 가격만 있는 곳은 포함 항목이 빠지기 쉽습니다. 상담 때 물어보면 좋은 질문은 성별, 월령, 성체 예상 크기, 포함 항목입니다.`,
        `무료분양만 강조되면 건강·서류를 따로 확인하세요. ${kw}${as} 찾아오신 분은 ${brand}에서 아이 모습을 먼저 보시면 됩니다.`,
      ],
    },
    {
      h2: fill(pick(NEXT_H2, seed + 3)),
      paragraphs: [
        `${kw} 상담 시에는 지역과 희망 조건만 알려 주셔도 됩니다. ${KAKAO_CTA_HINT}`,
        `메인 품종 카드에서 입양 안내 사진을 보실 수 있습니다. 확인이 필요한 항목이 있으면 바로 물어보시면 됩니다.`,
      ],
    },
  ];

  const faqs = [
    {
      q: `여기는 어떤 곳인가요?`,
      a: `아이오펫은 견종·묘종 입양을 품종과 하루 루틴 기준으로 안내하는 곳입니다. ${kw}로 찾으시는 분께는 기질·체구·비용 요인과 아이들 얼굴을 함께 보여 드립니다.`,
    },
    {
      q: `이 품종은 어떤 성격인가요?`,
      a: `품종마다 기질이 다릅니다. ${kw} 상담에서 지금 만날 수 있는 아이 성격을 구체적으로 안내합니다.`,
    },
    {
      q: `성체 크기는 어느 정도인가요?`,
      a: `견종·묘종마다 성체 체구가 다릅니다. ${kw}로 공간을 고민 중이시면 성체 기준으로 안내합니다.`,
    },
    {
      q: `입양 비용은 얼마인가요?`,
      a: `혈통·성별·털색·시기에 따라 달라집니다. ${kw} 이용 전에는 한 줄 견적보다 포함 항목을 먼저 보는 것이 좋습니다. 단가를 단정하지 않습니다.`,
    },
    {
      q: `${kw} 상담은 어떻게 하나요?`,
      a: `지역과 희망 조건만 알려 주시면 ${kw} 기준으로 사진을 맞춰 안내받을 수 있습니다. ${KAKAO_CTA_HINT}`,
    },
    {
      q: `사진은 어디서 보나요?`,
      a: `메인에서 품종을 고르시면 입양 안내 사진을 보실 수 있습니다.`,
    },
  ];

  const now = new Date().toISOString();
  const region = extractRegionFromKeyword(kw);
  const theme = extractKeywordTheme(kw);
  const areas = getSubRegionNames(region, 5);
  const stations = getNearbyStationNames(region, 5);
  const geoKw = [
    ...areas.map((a) => `${a} ${theme}`),
    ...stations.map((s) => `${s} ${theme}`),
  ].join(", ");

  let metaDescription = fill(pick(METAS, seed));
  if (areas.length || stations.length) {
    const nearBits = [...areas.slice(0, 3), ...stations.slice(0, 3)].slice(0, 4).join(" · ");
    metaDescription = `${metaDescription} ${nearBits} ${theme} 안내.`;
  }

  return {
    slug: slugifyKeyword(kw, `t${pageIndex}${seed.toString(36).slice(0, 4)}`),
    keyword: kw,
    title,
    metaDescription: clampDesc(metaDescription),
    metaKeywords: `${kw}, 강아지입양, 고양이입양, 견종입양, 묘종입양, 아이오펫${
      geoKw ? `, ${geoKw}` : ""
    }`,
    h1,
    heroSubtitle,
    heroBadge: "입양 안내",
    heroTitleLine1: kw,
    heroTitleLine2: "아이오펫",
    heroBar: "설레는 얼굴과 우리 집 리듬을 먼저 맞춰 보세요.",
    sections,
    faqs,
    images: pickImages(3, seed),
    ctaText: `${kw} 상담 — 지역·희망 조건만 알려 주세요`,
    createdAt: now,
    updatedAt: now,
  };
}
