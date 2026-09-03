import fs from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import {
  DEFAULT_SPONSOR,
  GLOBAL_SPONSOR_TAG,
  type SiteSponsor,
} from "./site-sponsor-shared";

export type { SponsorStatus, SiteSponsor } from "./site-sponsor-shared";
export { DEFAULT_SPONSOR, GLOBAL_SPONSOR_TAG, phoneToTel } from "./site-sponsor-shared";

const BLOB_PATH = "sponsor-data/site_sponsor.json";
const DATA_PATH = path.join(process.cwd(), "public", "sponsor-data", "site_sponsor.json");

const BLOB_ACCESS = "private" as const;

function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL);
}

function resolveBlobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return process.env.BLOB_READ_WRITE_TOKEN.trim();
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (value?.trim() && key.includes("BLOB") && key.endsWith("READ_WRITE_TOKEN")) {
      return value.trim();
    }
  }
  return undefined;
}

function blobTokenOpts() {
  const token = resolveBlobToken();
  return token ? { token } : {} ;
}

function blobOpts() {
  return { access: BLOB_ACCESS, ...blobTokenOpts() };
}

function blobPutOpts() {
  return {
    ...blobOpts(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  };
}

function normalize(raw: Partial<SiteSponsor>): SiteSponsor {
  const points = Array.isArray(raw.highlight_points)
    ? raw.highlight_points
        .map((v) => String(v || "").trim())
        .filter(Boolean)
        .slice(0, 5)
    : DEFAULT_SPONSOR.highlight_points;
  const rawLink = (raw.link_url || "").trim();
  const rawHome = (raw.homepage_url || "").trim();
  const linkIsKakao = /open\.kakao\.com|kakao\.com/i.test(rawLink);
  const isActive = raw.status === "ACTIVE";
  const kakaoLink = linkIsKakao ? rawLink : "";
  return {
    id: 1,
    status: isActive ? "ACTIVE" : "RECRUITING",
    sponsor_name: (raw.sponsor_name || "").trim(),
    phone_number: (raw.phone_number || "").trim(),
    link_url: kakaoLink,
    homepage_url: rawHome || (!linkIsKakao && rawLink ? rawLink : ""),
    recruiting_notice:
      (raw.recruiting_notice || DEFAULT_SPONSOR.recruiting_notice).trim(),
    rental_price: (raw.rental_price || DEFAULT_SPONSOR.rental_price).trim(),
    highlight_points: points.length ? points : DEFAULT_SPONSOR.highlight_points,
    youtube_url: (raw.youtube_url || "").trim(),
    youtube_url_2: (raw.youtube_url_2 || "").trim(),
    sponsor_youtube_url: (raw.sponsor_youtube_url || "").trim(),
    sponsor_youtube_url_2: (raw.sponsor_youtube_url_2 || "").trim(),
    sponsor_youtube_channel: (raw.sponsor_youtube_channel || "").trim(),
    sponsor_youtube_desc: (raw.sponsor_youtube_desc || "").trim(),
  };
}

async function streamToText(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder("utf-8").decode(merged);
}

async function readBlobText(): Promise<string | null> {
  try {
    const result = await get(BLOB_PATH, blobOpts());
    if (result?.stream) return await streamToText(result.stream);
  } catch (e) {
    console.error("[site-sponsor] blob get failed", e);
  }
  return null;
}

function readFs(): SiteSponsor | null {
  try {
    if (!fs.existsSync(DATA_PATH)) return null;
    return normalize(JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")) as SiteSponsor);
  } catch {
    return null;
  }
}

function writeFs(data: SiteSponsor) {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function readSiteSponsorRaw(): Promise<SiteSponsor> {
  if (resolveBlobToken()) {
    const blobRaw = await readBlobText();
    if (blobRaw) {
      try {
        return normalize(JSON.parse(blobRaw) as SiteSponsor);
      } catch {
        /* fall through */
      }
    }
  }
  return readFs() || DEFAULT_SPONSOR;
}

const cachedReadSiteSponsor = unstable_cache(
  async () => readSiteSponsorRaw(),
  ["global-site-sponsor"],
  { tags: [GLOBAL_SPONSOR_TAG], revalidate: 3600 }
);

export async function getGlobalSponsor(): Promise<SiteSponsor> {
  return cachedReadSiteSponsor();
}

export async function saveGlobalSponsor(
  input: Omit<SiteSponsor, "id">
): Promise<SiteSponsor> {
  const data = normalize({ ...input, id: 1 });
  const content = JSON.stringify(data, null, 2);

  if (isVercelRuntime() || resolveBlobToken()) {
    try {
      await put(BLOB_PATH, content, blobPutOpts());
    } catch (e) {
      if (isVercelRuntime()) {
        throw new Error(
          `Vercel Blob 저장 실패(site_sponsor). (${
            e instanceof Error ? e.message : e
          })`
        );
      }
    }
  }

  try {
    writeFs(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isVercelRuntime() || /EROFS|read-only/i.test(msg)) {
      if (!resolveBlobToken()) {
        throw new Error("배포 환경은 파일 쓰기가 불가합니다. Vercel Blob 토큰을 설정하세요.");
      }
    } else {
      throw e;
    }
  }

  return data;
}
