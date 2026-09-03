/**
 * 미리 생성(ISR)된 분양 페이지를 중요도 순으로 뽑아
 * 네이버 웹문서 등록요청용 URL 목록을 만듭니다.
 */
const fs = require("fs");
const path = require("path");

const BASE = "https://iopet.cattery.co.kr";
const ROOT = path.join(__dirname, "..");

function breedPath(slug, sido, sigungu, dong) {
  const parts = [`/${encodeURIComponent(slug)}`];
  if (sido && sigungu) {
    parts.push(`/${encodeURIComponent(`${sido}_${sigungu}`)}`);
    if (dong) parts.push(`/${encodeURIComponent(dong)}`);
  } else if (sido) {
    parts.push(`/${encodeURIComponent(sido)}`);
  }
  return BASE + parts.join("");
}

function abs(p) {
  return BASE + (p.startsWith("/") ? p : `/${p}`);
}

function parseRows(file, marker) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  const a = text.indexOf(marker);
  const b = text.indexOf("];", a);
  return eval(text.slice(a + marker.length, b + 1));
}

const breedRows = parseRows("src/lib/breeds.ts", "const ROWS: Row[] = ");
const regionRows = parseRows("src/lib/korea-regions.ts", "const ROWS: Row[] = ");

const dogs = [];
const cats = [];
const shelters = [];
for (const row of breedRows) {
  const name = row[0];
  const kind = row[2];
  if (kind === "dog") dogs.push(name);
  else if (kind === "cat") cats.push(name);
  else shelters.push(name);
}
const allBreeds = [...dogs, ...cats, ...shelters];
const species = [...dogs, ...cats];

const sidos = [...new Set(regionRows.map((r) => r[0]))];
const byKey = new Map(regionRows.map((r) => [`${r[0]}_${r[1]}`, r]));

const kr = fs.readFileSync(path.join(ROOT, "src/lib/korea-regions.ts"), "utf8");
const popular = [...kr.match(/export const POPULAR_REGION_KEYS = \[([\s\S]*?)\] as const/)[1].matchAll(/"([^"]+)"/g)].map(
  (m) => m[1]
);

const urls = [];
const seen = new Set();
function add(url) {
  if (seen.has(url)) return;
  seen.add(url);
  urls.push(url);
}

add(abs("/"));
add(abs("/bunyang"));

for (const slug of allBreeds) add(breedPath(slug));

for (const sido of sidos) {
  for (const slug of allBreeds) add(breedPath(slug, sido));
}

for (const key of popular) {
  const row = byKey.get(key);
  if (!row) continue;
  const [sido, sigungu] = row;
  for (const slug of allBreeds) add(breedPath(slug, sido, sigungu));
}

for (const key of popular) {
  const row = byKey.get(key);
  if (!row) continue;
  const [sido, sigungu, dongs] = row;
  for (const dong of dongs.slice(0, 3)) {
    for (const slug of species) add(breedPath(slug, sido, sigungu, dong));
  }
}

const outDir = path.join(ROOT, "tools", "naver-submit");
fs.mkdirSync(outDir, { recursive: true });

const allPath = path.join(outDir, "naver-webdoc-urls.txt");
fs.writeFileSync(allPath, urls.join("\n") + "\n", "utf8");

const BATCH = 50;
let day = 0;
for (let i = 0; i < urls.length; i += BATCH) {
  day += 1;
  const chunk = urls.slice(i, i + BATCH);
  const name = `day-${String(day).padStart(3, "0")}.txt`;
  fs.writeFileSync(path.join(outDir, name), chunk.join("\n") + "\n", "utf8");
}

console.log(
  JSON.stringify(
    {
      total: urls.length,
      days: day,
      hubs: allBreeds.length,
      sidos: sidos.length,
      popular: popular.length,
      file: "tools/naver-submit/naver-webdoc-urls.txt",
      batch: "tools/naver-submit/day-001.txt ~",
    },
    null,
    2
  )
);
