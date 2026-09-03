import { GoogleGenAI } from "@google/genai";
import { SITE, KAKAO_CTA_HINT } from "./site";
import { pickImages } from "./images";
import type { SeoPage } from "./seo-pages";
import { slugifyKeyword } from "./seo-pages";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

function clampDesc(text: string, max = 158): string {
  const t = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function asParagraphs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((p) => String(p || "").trim()).filter(Boolean);
}

function buildPrompt(keyword: string): string {
  const kakaoLine = SITE.kakaoOpenChatUrl
    ? `상담 연결(마지막에만): 카카오톡 오픈채팅 (${SITE.kakaoOpenChatUrl})`
    : "상담 연결(마지막에만): 카카오 URL·전화번호는 넣지 마세요. 관리자에서 카카오를 등록한 뒤에만 연결됩니다.";
  return `당신은 한국 반려동물 입양 안내문을 쓰는 작가입니다. 브랜드명은 아이오펫입니다.
이 문서는 아이오펫(iopet.cattery.co.kr)에 실리므로 견종·묘종 입양을 안내하되, 아이오펫을 자연스럽게 한두 번만 넣으세요.
다른 업체 실명 비방, 디어펫·와일드쿤 등 타 브랜드 언급은 하지 마세요.

메인 키워드: ${keyword}
핵심 키워드: 강아지입양, 고양이입양, 견종입양, 묘종입양, 품종안내, 아이오펫
${kakaoLine}
서비스 범위: ${SITE.areaServed}

독자: ${keyword}를 검색해 입양할 품종을 고르려는 보호자.
톤: 따뜻하고 설득력 있게. 가족이 되는 설렘과 현실적인 집 준비를 같이. 문장은 상담하듯.
금지: 가격 단정, 허위, 의료 단정, 타사 비방, 전화번호, 케이지/무케이지.

반드시 다룰 내용:
1) 품종 기질·체구·하루 루틴
2) 입양 순서(사진-상담-만남-집으로)
3) 비용이 달라지는 항목과 무료분양 주의
4) 아이 사진은 아이오펫 메인에서 품종을 고르면 볼 수 있음
5) 문의 방법 — 본문 마지막에만, 짧게

아래 JSON만 출력. 설명·마크다운 금지.

{
  "title": "55자 내. '{keyword}' 포함. 예: '{keyword} | 아이오펫 입양 안내'",
  "metaDescription": "140~158자. '{keyword}', 입양, 기질. 전화번호 금지",
  "metaKeywords": "{keyword}, 강아지입양, 고양이입양, 아이오펫 등 10~14개",
  "h1": "'{keyword}'와 '입양'이 들어간 H1",
  "heroSubtitle": "한글 한 문장. 입양 안내 + 우리 집 하루",
  "heroBadge": "입양 안내",
  "heroTitleLine2": "아이오펫",
  "heroBar": "설레는 얼굴과 우리 집 리듬을 먼저 맞춰 보세요.",
  "sections": [
    {"h2": "'{keyword}' 포함, 가족이 되기 전에", "paragraphs": ["200자+", "180자+", "180자+", "160자+"]},
    {"h2": "입양 순서", "paragraphs": ["200자+", "180자+", "180자+", "140자+"]},
    {"h2": "비용이 달라지는 이유·확인할 항목", "paragraphs": ["180자+", "180자+", "160자+"]},
    {"h2": "사진을 보다가 여는 상담", "paragraphs": ["160자+", "140자+"]}
  ],
  "faqs": [
    {"q": "아이오펫은 어떤 곳인가요?", "a": "100자+ 구체 답변"},
    {"q": "품종은 어디서 고르나요?", "a": "100자+"},
    {"q": "아파트에서도 키울 수 있나요?", "a": "100자+"},
    {"q": "입양 비용은 얼마인가요?", "a": "100자+. 단가 단정 금지"},
    {"q": "${keyword} 상담은 어떻게 하나요?", "a": "100자+. ${KAKAO_CTA_HINT}"},
    {"q": "아이 사진은 어디서 보나요?", "a": "80자+. 아이오펫 메인 안내"}
  ],
  "ctaText": "{keyword} 입양 상담 — 지역·희망 시기만 알려 주세요"
}

AEO: FAQ는 실제 검색 질문처럼. 본문에 '{keyword}'와 '입양'을 자연스럽게 반복.`;
}

export async function generateWithGemini(
  keyword: string,
  apiKey?: string
): Promise<
  Omit<SeoPage, "slug" | "images" | "createdAt" | "updatedAt"> & { keyword: string }
> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY가 없습니다.");

  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(keyword),
    config: {
      responseMimeType: "application/json",
    },
  });
  const text = response.text ?? "";
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = (fence ? fence[1] : text).trim();
  const data = JSON.parse(jsonStr);
  const sections = Array.isArray(data.sections)
    ? data.sections.map((sec: { h2?: string; paragraphs?: unknown }) => ({
        h2: String(sec?.h2 || "").trim(),
        paragraphs: asParagraphs(sec?.paragraphs),
      })).filter((sec: { h2: string; paragraphs: string[] }) => sec.h2 && sec.paragraphs.length)
    : [];
  const faqs = Array.isArray(data.faqs)
    ? data.faqs
        .map((f: { q?: string; a?: string }) => ({
          q: String(f?.q || "").trim(),
          a: String(f?.a || "").trim(),
        }))
        .filter((f: { q: string; a: string }) => f.q && f.a)
    : [];

  return {
    keyword,
    title: String(data.title || `${keyword} | 아이오펫 입양 안내`),
    metaDescription: clampDesc(data.metaDescription || SITE.description),
    metaKeywords: String(
      data.metaKeywords ||
        `${keyword}, 강아지입양, 고양이입양, 견종입양, 아이오펫`
    ),
    h1: String(data.h1 || `${keyword}, 메인쿤분양 안내`),
    heroSubtitle: String(
      data.heroSubtitle || "설레는 얼굴과 우리 집 리듬을 먼저 맞춰 보세요"
    ),
    heroBadge: String(data.heroBadge || "입양 안내"),
    heroTitleLine1: keyword,
    heroTitleLine2: String(data.heroTitleLine2 || "아이오펫"),
    heroBar: String(data.heroBar || "설레는 얼굴과 우리 집 리듬을 먼저 맞춰 보세요."),
    sections,
    faqs,
    ctaText: String(data.ctaText || `${keyword} 상담 — 지역·희망 조건만 알려 주세요`),
  };
}

export function assembleSeoPage(
  partial: Awaited<ReturnType<typeof generateWithGemini>>,
  slug?: string
): SeoPage {
  const now = new Date().toISOString();
  return {
    slug: slug || slugifyKeyword(partial.keyword),
    keyword: partial.keyword,
    title: partial.title,
    metaDescription: clampDesc(partial.metaDescription),
    metaKeywords: partial.metaKeywords,
    h1: partial.h1,
    heroSubtitle: partial.heroSubtitle,
    heroBadge: partial.heroBadge || "입양 안내",
    heroTitleLine1: partial.heroTitleLine1 || partial.keyword,
    heroTitleLine2: partial.heroTitleLine2 || "아이오펫",
    heroBar: partial.heroBar || "설레는 얼굴과 우리 집 리듬을 먼저 맞춰 보세요.",
    sections: partial.sections,
    faqs: partial.faqs,
    images: pickImages(3, Date.now() % 100000),
    ctaText: partial.ctaText,
    createdAt: now,
    updatedAt: now,
  };
}
