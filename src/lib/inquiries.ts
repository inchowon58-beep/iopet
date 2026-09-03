import fs from "fs";
import path from "path";
import { get, list, put } from "@vercel/blob";

export type BreedInquiry = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  region: string;
  message: string;
  breedName: string;
  place: string;
  pagePath: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "inquiries.json");
const BLOB_PATH = "inquiries/index.json";
const MAX_ITEMS = 500;

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
  return token ? { token } : {};
}

function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL);
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

async function readBlobText(pathname: string): Promise<string | null> {
  const opts = { access: BLOB_ACCESS, ...blobOpts() };
  try {
    const result = await get(pathname, opts);
    if (result?.stream) return await streamToText(result.stream);
  } catch {
    /* list fallback */
  }
  try {
    const { blobs } = await list({ prefix: pathname, ...blobOpts() });
    const match = blobs.find((b) => b.pathname === pathname);
    if (!match) return null;
    const viaGet = await get(match.url, opts);
    if (viaGet?.stream) return await streamToText(viaGet.stream);
  } catch {
    /* ignore */
  }
  return null;
}

function readFs(): BreedInquiry[] {
  try {
    if (!fs.existsSync(FILE_PATH)) return [];
    const raw = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8")) as BreedInquiry[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeFs(items: BreedInquiry[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(items, null, 2), "utf-8");
}

async function readAll(): Promise<BreedInquiry[]> {
  if (resolveBlobToken()) {
    const blobRaw = await readBlobText(BLOB_PATH);
    if (blobRaw) {
      try {
        const parsed = JSON.parse(blobRaw) as BreedInquiry[];
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* fall through */
      }
    }
  }
  return readFs();
}

async function writeAll(items: BreedInquiry[]): Promise<void> {
  const trimmed = items.slice(0, MAX_ITEMS);
  const content = JSON.stringify(trimmed, null, 2);
  if (isVercelRuntime() || resolveBlobToken()) {
    try {
      await put(BLOB_PATH, content, {
        access: BLOB_ACCESS,
        ...blobOpts(),
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json; charset=utf-8",
      });
      if (!isVercelRuntime()) {
        try {
          writeFs(trimmed);
        } catch {
          /* optional local mirror */
        }
      }
      return;
    } catch (e) {
      if (isVercelRuntime()) throw e;
    }
  }
  writeFs(trimmed);
}

export async function listInquiries(): Promise<BreedInquiry[]> {
  const items = await readAll();
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addInquiry(
  input: Omit<BreedInquiry, "id" | "createdAt">
): Promise<BreedInquiry> {
  const item: BreedInquiry = {
    ...input,
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const items = await readAll();
  await writeAll([item, ...items]);
  return item;
}

export async function deleteInquiries(ids: string[]): Promise<number> {
  const set = new Set(ids);
  const items = await readAll();
  const next = items.filter((i) => !set.has(i.id));
  await writeAll(next);
  return items.length - next.length;
}
