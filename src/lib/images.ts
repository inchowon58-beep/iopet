import { SITE } from "./site";

/** 루트 `/01.webp`는 없고, 견종 폴더 아래만 있습니다. */
const DEFAULT_IMAGE_FOLDER = "maincoon";

/** 히어로·소개·특징 카드 */
export const FEATURE_FILES = [18, 9, 5, 14, 22, 33, 11, 36] as const;

/** 갤러리 상단 큰 사진 두 장 — 순서 변경 */
export const GALLERY_FEATURED = [2, 27] as const;

/** 갤러리 본문 12장 */
export const GALLERY_GRID = [6, 8, 11, 13, 17, 19, 20, 23, 28, 35, 36, 40] as const;

function clampFile(num: number): number {
  if (!Number.isFinite(num) || num < 1) return 1;
  return Math.floor(num);
}

export function fileUrl(fileNo: number): string {
  const n = clampFile(fileNo);
  if (!SITE.imageBase) return `placeholder:${n}`;
  const base = SITE.imageBase.replace(/\/$/, "");
  return `${base}/${DEFAULT_IMAGE_FOLDER}/${String(n).padStart(2, "0")}.webp`;
}

export function imageUrl(index: number): string {
  return fileUrl(index);
}

export function isRealImage(url: string): boolean {
  return /^https?:\/\//i.test(url || "");
}

export function placeholderIndexFrom(urlOrIndex: string | number): number {
  if (typeof urlOrIndex === "number") return clampFile(urlOrIndex);
  const m = String(urlOrIndex).match(/placeholder:(\d+)/i);
  if (m) return clampFile(Number(m[1]));
  const file = String(urlOrIndex).match(/(\d{1,3})\.webp/i);
  if (file) return clampFile(Number(file[1]));
  return 1;
}

export function migrateImageUrl(url: string): string {
  if (!url) return fileUrl(12);
  if (!SITE.imageBase) {
    const file = url.match(/(\d{1,3})\.webp/i);
    if (file) return `placeholder:${clampFile(Number(file[1]))}`;
    return url.startsWith("placeholder:") ? url : fileUrl(12);
  }
  const mapped = url.replace(
    /https?:\/\/image\.cattery\.co\.kr\/(?:jejumilgam|dogboho|petfuneral|doodle|maincoon|weding|smp)\/(?:new)?(\d{1,3})\.webp/gi,
    (_m, num: string) => fileUrl(Number(num))
  );
  if (mapped.startsWith("placeholder:")) {
    return fileUrl(placeholderIndexFrom(mapped));
  }
  return mapped;
}

export function allImageUrls(): string[] {
  return Array.from({ length: SITE.imageCount }, (_, i) => fileUrl(i + 1));
}

function seoPool(): string[] {
  const start = 12;
  const end = Math.min(40, SITE.imageCount);
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) =>
    fileUrl(start + i)
  );
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** SEO·가이드 페이지는 12번부터 마지막까지 */
export function pickImages(count: number, seed = 42): string[] {
  const pool = seoPool();
  const rng = mulberry32(seed ^ 0x47e1d90c);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function galleryAlt(keywordOrIndex: string | number, index = 1): string {
  const suffixes = [
    "메인쿤분양",
    "메인쿤 특징",
    "메인쿤크기",
    "메인쿤성격",
    "메인쿤키우기",
  ];
  if (typeof keywordOrIndex === "number") {
    const i = keywordOrIndex;
    return `${SITE.name} ${suffixes[(i - 1) % suffixes.length]} ${i}`;
  }
  const suffix = suffixes[(index - 1) % suffixes.length];
  return `${keywordOrIndex} ${suffix} ${index}`;
}
