import { SITE } from "./site";

export type SponsorStatus = "RECRUITING" | "ACTIVE";

export type SiteSponsor = {
  id: number;
  status: SponsorStatus;
  sponsor_name: string;
  phone_number: string;
  link_url: string;
  homepage_url: string;
  recruiting_notice: string;
  rental_price: string;
  highlight_points: string[];
  /** 입점 대기 중 웹문서 상단·중간 안내 영상 */
  youtube_url: string;
  youtube_url_2: string;
  /** 입점 후 업체가 등록한 영상 */
  sponsor_youtube_url: string;
  sponsor_youtube_url_2: string;
  sponsor_youtube_channel: string;
  sponsor_youtube_desc: string;
};

export const GLOBAL_SPONSOR_TAG = "global-sponsor";

export const DEFAULT_SPONSOR: SiteSponsor = {
  id: 1,
  status: "RECRUITING",
  sponsor_name: "",
  phone_number: "",
  link_url: "",
  homepage_url: "",
  recruiting_notice: "전국 메인쿤분양 입점 제휴 · 사이트 임대 모집 중",
  rental_price: "30만원",
  highlight_points: [
    "메인쿤분양 상담",
    "메인쿤크기·성격 안내",
    "메인쿤분양가 안내",
    "방문·상담 일정",
    "입양 후 키우기 안내",
  ],
  youtube_url: "",
  youtube_url_2: "",
  sponsor_youtube_url: "",
  sponsor_youtube_url_2: "",
  sponsor_youtube_channel: "",
  sponsor_youtube_desc: "",
};

export function phoneToTel(_phone: string): string {
  const digits = _phone.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}

export function isKakaoLink(url: string) {
  return /open\.kakao\.com|kakao\.com/i.test(url);
}

export function sponsorKakaoUrl(sponsor: SiteSponsor): string {
  const url = (sponsor.link_url || "").trim();
  if (url && isKakaoLink(url)) return url;
  return "";
}

/** 관리자에서 등록한 카카오만 사용. 비어 있으면 연결하지 않음. */
export function publicKakaoUrl(sponsor: SiteSponsor): string {
  return sponsorKakaoUrl(sponsor);
}

export function sponsorHomepageUrl(sponsor: SiteSponsor): string {
  const home = (sponsor.homepage_url || "").trim();
  if (home) return home;
  const url = (sponsor.link_url || "").trim();
  if (url && !isKakaoLink(url)) return url;
  return "";
}

const YOUTUBE_ID = /^[\w-]{11}$/;

export function youtubeVideoId(url: string): string | null {
  const raw = (url || "").trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v && YOUTUBE_ID.test(v)) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      if (
        parts[0] === "embed" ||
        parts[0] === "shorts" ||
        parts[0] === "live" ||
        parts[0] === "v"
      ) {
        const id = (parts[1] || "").split("?")[0];
        if (id && YOUTUBE_ID.test(id)) return id;
      }
    }
  } catch {
    const m = raw.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  const m = raw.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

function pickYoutubePair(first: string, second: string, slot: 1 | 2): string {
  const a = (first || "").trim();
  const b = (second || "").trim();
  if (slot === 1) return a || b;
  return b || a;
}

export function sponsorYoutubeUrl(sponsor: SiteSponsor, slot: 1 | 2 = 1): string {
  if (sponsor.status === "ACTIVE") {
    const tenant = pickYoutubePair(
      sponsor.sponsor_youtube_url,
      sponsor.sponsor_youtube_url_2,
      slot
    );
    if (tenant) return tenant;
  }
  return pickYoutubePair(sponsor.youtube_url, sponsor.youtube_url_2, slot);
}
