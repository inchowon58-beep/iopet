import { headers } from "next/headers";
import { SITE } from "./site";

/** 끝 슬래시 없는 절대 origin. 예: https://iopet.cattery.co.kr */
export function stripTrailingSlash(url: string): string {
  return (url || "").trim().replace(/\/+$/, "");
}

function isLocalHost(host: string): boolean {
  const h = host.toLowerCase();
  return h.startsWith("localhost") || h.startsWith("127.0.0.1") || h.endsWith(".local");
}

/**
 * 수집기(Yeti)가 받은 호스트 그대로 canonical/og:url에 씁니다.
 * env의 vercel.app 기본값으로 다른 도메인에 301처럼 보이게 만들지 않습니다.
 */
export async function publicOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = (h.get("x-forwarded-host") || h.get("host") || "")
      .split(",")[0]
      .trim()
      .toLowerCase();
    if (host && !isLocalHost(host)) {
      return `https://${host}`;
    }
  } catch {
    /* 정적 생성 등 headers 없는 경로 */
  }
  return stripTrailingSlash(SITE.siteUrl) || "https://iopet.cattery.co.kr";
}

/** origin + path. 끝 슬래시 없음(홈은 origin만). */
export function absoluteUrl(origin: string, path = ""): string {
  const base = stripTrailingSlash(origin);
  const p = (path || "").trim();
  if (!p || p === "/") return base;
  const normalized = p.startsWith("/") ? p : `/${p}`;
  return `${base}${stripTrailingSlash(normalized)}`;
}

export async function publicPageUrl(path = ""): Promise<string> {
  return absoluteUrl(await publicOrigin(), path);
}
