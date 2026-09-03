import { IMAGE_HOST, type Breed } from "./breeds";

/** CDN 폴더별 실제 webp 장수. 없는 번호를 고르면 카드가 깨집니다. */
export const FOLDER_IMAGE_COUNT: Record<string, number> = {
  abisinan: 20,
  american: 18,
  bnagal: 20,
  bosten: 5,
  british: 45,
  bunyz: 10,
  catboho: 45,
  chauchau: 5,
  coca: 10,
  coldenret: 10,
  coton: 30,
  daks: 21,
  dalma: 21,
  doberman: 5,
  dogboho: 45,
  engbuldog: 5,
  frenchi: 25,
  italian: 10,
  doodle: 40,
  maincoon: 45,
  malamute: 5,
  mcnchikin: 45,
  minipin: 10,
  neva: 45,
  norwe: 25,
  oldbig: 10,
  perisian: 10,
  pekinee: 25,
  pome: 45,
  pomsky: 45,
  ragdoll: 45,
  rusian: 15,
  samoyed: 15,
  scottish: 19,
  selti: 45,
  shichu: 21,
  shuna: 10,
  siba: 19,
  singa: 19,
  spinkix: 20,
  welshi: 15,
  wterrier: 30,
  yoki: 10,
};

export function folderImageCount(folder: string): number {
  return FOLDER_IMAGE_COUNT[folder] || 5;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function breedCover(folder: string): string {
  return `${IMAGE_HOST}/${folder}/01.webp`;
}

export function breedFolderUrls(folder: string, count?: number): string[] {
  const n = folderImageCount(folder);
  const take = Math.min(count ?? n, n);
  return Array.from({ length: take }, (_, i) => `${IMAGE_HOST}/${folder}/${pad(i + 1)}.webp`);
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

export function pickBreedImages(breed: Breed, count: number, salt = ""): string[] {
  const pool = breedFolderUrls(breed.folder);
  if (!pool.length) return [breedCover(breed.folder)];
  const rng = mulberry32(hashSlug(breed.slug + salt) ^ 0x9e3779b9);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (shuffled.length >= count) return shuffled.slice(0, count);
  return Array.from({ length: count }, (_, i) => shuffled[i % shuffled.length]);
}

const PUP_NAMES = [
  "밍키",
  "나비",
  "초코",
  "보리",
  "구름",
  "달이",
  "콩이",
  "별이",
  "모카",
  "라떼",
  "하루",
  "토리",
  "루시",
  "코코",
  "밤이",
  "뭉치",
  "하리",
  "누리",
  "다온",
  "시루",
  "마루",
  "두부",
  "밤비",
  "솔이",
  "단이",
  "복이",
  "초롱",
  "별하",
  "송이",
  "가을",
  "겨울",
  "봄이",
];

export type BreedGalleryCard = {
  id: string;
  src: string;
  name: string;
};

/** 지역 페이지 상단 5장 — 캡션·스키마·OG를 같은 세트로 맞춥니다. */
export function breedGalleryCards(breed: Breed, salt = "", count = 5): BreedGalleryCard[] {
  const rng = mulberry32(hashSlug(`${breed.slug}|${salt}|names`) ^ 0x51ed);
  const names = [...PUP_NAMES];
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  const images = pickBreedImages(breed, count, `${salt}|gallery`);
  const label = breed.keyword || `${breed.name}분양`;
  return Array.from({ length: count }, (_, i) => ({
    id: `card-${i + 1}`,
    src: images[i] || breedCover(breed.folder),
    name: `${label} ${names[i % names.length]}`,
  }));
}

/** 네이버 OG용 — 대표 썸네일 여러 장 */
export function breedOgImages(breed: Breed, salt = "", count = 6): string[] {
  const cover = breedCover(breed.folder);
  const rest = pickBreedImages(breed, count, salt || "og").filter((u) => u !== cover);
  return [cover, ...rest].slice(0, count);
}

export type BreedPhotos = {
  hero: string;
  portrait: string;
  ribbon: string[];
  essay: string;
  facts: string[];
  grid: string[];
  all: string[];
};

export function breedPhotos(breed: Breed, salt = ""): BreedPhotos {
  const urls = pickBreedImages(breed, 16, salt);
  return {
    hero: breedCover(breed.folder),
    portrait: urls[1] || urls[0],
    ribbon: urls.slice(2, 8),
    essay: urls[8] || urls[0],
    facts: urls.slice(9, 12),
    grid: urls.slice(12, 16),
    all: urls,
  };
}
