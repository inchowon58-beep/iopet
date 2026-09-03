/**
 * 견종·묘종 백과 본문을 제미나이로 다듬어 TS 파일에 다시 씁니다.
 * 키는 .env.local 의 GEMINI_API_KEY 만 사용합니다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { GoogleGenAI } from "@google/genai";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DONE_PATH = join(ROOT, "tools/.encyclopedia-rewrite-done.json");

function loadEnvLocal() {
  const p = join(ROOT, ".env.local");
  try {
    const text = readFileSync(p, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* no file */
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function tsString(s) {
  return JSON.stringify(s);
}

function renderEncyclopedia(obj) {
  const lines = [];
  for (const [key, enc] of Object.entries(obj)) {
    lines.push(`  ${key}: {`);
    lines.push(`    origin: ${tsString(enc.origin)},`);
    lines.push(`    paragraphs: [`);
    for (const p of enc.paragraphs) lines.push(`      ${tsString(p)},`);
    lines.push(`    ],`);
    lines.push(`    genetics: [`);
    for (const g of enc.genetics) {
      lines.push(`      { name: ${tsString(g.name)}, detail: ${tsString(g.detail)} },`);
    }
    lines.push(`    ],`);
    lines.push(`    care: [`);
    for (const g of enc.care) {
      lines.push(`      { name: ${tsString(g.name)}, detail: ${tsString(g.detail)} },`);
    }
    lines.push(`    ],`);
    lines.push(`    beginner: ${tsString(enc.beginner)},`);
    lines.push(`  },`);
  }
  return lines.join("\n");
}

function loadDone() {
  try {
    return JSON.parse(readFileSync(DONE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveDone(done) {
  writeFileSync(DONE_PATH, JSON.stringify(done, null, 2), "utf8");
}

function writeFiles(cats, dogs) {
  const catOut = `export type GuideFact = { name: string; detail: string };

export type BreedEncyclopedia = {
  origin: string;
  paragraphs: string[];
  genetics: GuideFact[];
  care: GuideFact[];
  beginner: string;
};

export const CAT_ENCYCLOPEDIA: Record<string, BreedEncyclopedia> = {
${renderEncyclopedia(cats)}
};
`;
  const dogOut = `import type { BreedEncyclopedia } from "./breed-encyclopedia-cats";

export const DOG_ENCYCLOPEDIA: Record<string, BreedEncyclopedia> = {
${renderEncyclopedia(dogs)}
};
`;
  writeFileSync(join(ROOT, "src/lib/breed-encyclopedia-cats.ts"), catOut, "utf8");
  writeFileSync(join(ROOT, "src/lib/breed-encyclopedia-dogs.ts"), dogOut, "utf8");
}

function errText(err) {
  if (!err) return "";
  if (typeof err === "string") return err;
  const msg = err.message ? String(err.message) : "";
  try {
    return `${msg} ${JSON.stringify(err)}`;
  } catch {
    return msg;
  }
}

function isRetryable(err) {
  return /503|UNAVAILABLE|429|RESOURCE_EXHAUSTED|timeout|high demand|ECONNRESET|fetch failed|overloaded/i.test(
    errText(err)
  );
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function rewriteOne(ai, model, breed, current) {
  const prompt = `당신은 한국 반려동물 입양 사이트의 수석 편집자입니다. 브랜드명은 아이오펫입니다.
아래는 '${breed.name}'(${breed.kind === "cat" ? "묘종" : breed.kind === "shelter" ? "보호소" : "견종"}) 안내 초안입니다.
사실을 뒤집거나 병을 새로 만들어내지 마세요. 문장 구조·어휘·호흡을 완전히 다시 써서, 다른 사이트 글을 베낀 느낌이 나지 않게 하세요.
보호자가 '이 아이와 가족이 되고 싶다'고 느끼게, 그러면서도 현실적인 집 준비와 관리를 분명히 쓰세요.
디어펫, 와일드쿤, 다른 브랜드 이름은 절대 넣지 마세요. 아이오펫은 본문에 최대 한 번만.

유지할 정보:
- 원산/계통, 체구(${breed.size}), 털(${breed.coat}), 기질(${breed.temperament}), 집 환경(${breed.homeNeed})
- 아래 초안의 유전·관리 항목 이름(병은 바꾸지 말 것)

금지: 가격 단정, 전화번호, 카카오 URL, 타사 비방, 케이지/무케이지, 영어 남발, 마크다운, 초안 문장을 거의 그대로 재사용.

초안 JSON:
${JSON.stringify(current, null, 2)}

아래 JSON만 출력.
{
  "origin": "18~28자 한 줄. 초안과 다른 표현",
  "paragraphs": ["260~380자. 입양 설득+기질", "260~380자. 생활 루틴+주의", "220~340자. 집 준비+아이오펫 안내"],
  "genetics": [{"name":"초안과 같은 항목명","detail":"110~180자"}, {"name":"...","detail":"..."}, {"name":"...","detail":"..."}],
  "care": [{"name":"초안과 같은 항목명","detail":"110~180자"}, {"name":"...","detail":"..."}, {"name":"...","detail":"..."}],
  "beginner": "80~150자. 초보 적합 여부. 초안과 다른 문장"
}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });
  const text = response.text ?? "";
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const data = JSON.parse((fence ? fence[1] : text).trim());
  const paragraphs = Array.isArray(data.paragraphs)
    ? data.paragraphs.map((p) => String(p || "").trim()).filter(Boolean).slice(0, 3)
    : [];
  const genetics = Array.isArray(data.genetics)
    ? data.genetics
        .map((g, i) => ({
          name: String(g?.name || current.genetics[i]?.name || "").trim(),
          detail: String(g?.detail || "").trim(),
        }))
        .filter((g) => g.name && g.detail)
        .slice(0, 3)
    : [];
  const care = Array.isArray(data.care)
    ? data.care
        .map((g, i) => ({
          name: String(g?.name || current.care[i]?.name || "").trim(),
          detail: String(g?.detail || "").trim(),
        }))
        .filter((g) => g.name && g.detail)
        .slice(0, 3)
    : [];
  if (paragraphs.length < 3 || genetics.length < 3 || care.length < 3 || !data.origin || !data.beginner) {
    throw new Error("incomplete json");
  }
  return {
    origin: String(data.origin).trim(),
    paragraphs,
    genetics,
    care,
    beginner: String(data.beginner).trim(),
  };
}

function modelList(preferred) {
  const ordered = [
    "gemini-3.5-flash-lite",
    preferred,
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
  ].filter(Boolean);
  return [...new Set(ordered)];
}

async function rewriteWithRetry(ai, models, breed, current) {
  let lastErr;
  for (const model of models) {
    for (let i = 1; i <= 2; i++) {
      try {
        const next = await withTimeout(rewriteOne(ai, model, breed, current), 50000);
        if (model !== models[0]) process.stdout.write(`via ${model} `);
        return next;
      } catch (err) {
        lastErr = err;
        const text = errText(err);
        if (/404|NOT_FOUND|not found|no longer available/i.test(text)) break;
        if (!isRetryable(err)) throw err;
        if (i < 2) {
          process.stdout.write(`${model} wait 8s ... `);
          await sleep(8000);
        } else {
          process.stdout.write(`${model} 503, `);
        }
      }
    }
  }
  throw lastErr;
}

async function main() {
  loadEnvLocal();
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY가 .env.local 에 없습니다.");
  const models = modelList(process.env.GEMINI_MODEL || "gemini-3.6-flash");
  const ai = new GoogleGenAI({ apiKey: key });

  const { BREEDS } = await import(pathToFileURL(join(ROOT, "src/lib/breeds.ts")).href);
  const { getEncyclopedia } = await import(pathToFileURL(join(ROOT, "src/lib/breed-encyclopedia.ts")).href);

  const dogs = {};
  const cats = {};
  for (const breed of BREEDS) {
    const current = getEncyclopedia(breed);
    if (breed.kind === "cat" || breed.folder === "catboho") cats[breed.folder] = current;
    else dogs[breed.folder] = current;
  }

  const done = loadDone();
  let okCount = 0;
  let skipCount = 0;
  let keepCount = 0;

  for (const breed of BREEDS) {
    const current =
      breed.kind === "cat" || breed.folder === "catboho"
        ? cats[breed.folder]
        : dogs[breed.folder];
    process.stdout.write(`${breed.folder} ${breed.name} ... `);
    let next = current;
    if (done[breed.folder]) {
      console.log("skip");
      skipCount += 1;
    } else {
      try {
        next = await rewriteWithRetry(ai, models, breed, current);
        done[breed.folder] = true;
        saveDone(done);
        console.log("ok");
        okCount += 1;
      } catch (err) {
        console.log("keep", errText(err).slice(0, 180));
        keepCount += 1;
      }
    }
    if (breed.kind === "cat" || breed.folder === "catboho") {
      cats[breed.folder] = next;
    } else {
      dogs[breed.folder] = next;
    }
    writeFiles(cats, dogs);
    if (!done[breed.folder]) await sleep(1200);
  }

  console.log(`wrote encyclopedia files  ok=${okCount} skip=${skipCount} keep=${keepCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
