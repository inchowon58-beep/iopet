import fs from "fs";
import path from "path";
import { get, put } from "@vercel/blob";

export type SponsorLogin = {
  username: string;
  password: string;
};

export const DEFAULT_SPONSOR_LOGIN: SponsorLogin = {
  username: "sponsor",
  password: "ybijour80",
};

const BLOB_PATH = "sponsor-data/sponsor_login.json";
const DATA_PATH = path.join(process.cwd(), "data", "sponsor-login.json");
const BLOB_ACCESS = "private" as const;

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

function blobOpts() {
  const token = resolveBlobToken();
  return { access: BLOB_ACCESS, ...(token ? { token } : {}) };
}

function blobPutOpts() {
  return {
    ...blobOpts(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  };
}

function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL);
}

function normalize(raw: Partial<SponsorLogin> | null | undefined): SponsorLogin {
  const username = String(raw?.username || DEFAULT_SPONSOR_LOGIN.username).trim() || DEFAULT_SPONSOR_LOGIN.username;
  const password = String(raw?.password || "").trim() || DEFAULT_SPONSOR_LOGIN.password;
  return { username, password };
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

function readFs(): SponsorLogin | null {
  try {
    if (!fs.existsSync(DATA_PATH)) return null;
    return normalize(JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")));
  } catch {
    return null;
  }
}

function writeFs(data: SponsorLogin) {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getSponsorLogin(): Promise<SponsorLogin> {
  if (resolveBlobToken()) {
    try {
      const result = await get(BLOB_PATH, blobOpts());
      if (result?.stream) {
        const raw = await streamToText(result.stream);
        return normalize(JSON.parse(raw));
      }
    } catch {
      /* fall through */
    }
  }
  return readFs() || DEFAULT_SPONSOR_LOGIN;
}

export async function saveSponsorLogin(input: Partial<SponsorLogin>): Promise<SponsorLogin> {
  const current = await getSponsorLogin();
  const data = normalize({
    username: current.username,
    password: input.password ?? current.password,
  });
  const content = JSON.stringify(data, null, 2);

  if (isVercelRuntime() || resolveBlobToken()) {
    try {
      await put(BLOB_PATH, content, blobPutOpts());
    } catch (e) {
      if (isVercelRuntime()) {
        throw new Error(`스폰서 로그인 저장 실패. (${e instanceof Error ? e.message : e})`);
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
