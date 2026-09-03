import raw from "@/data/local-pet-biz.json";
import { canonicalSido, getDongs, getSigungus, regionKey, SIDOS } from "./korea-regions";

type Triple = [name: string, dong: string, year?: string];
type RegionRec = {
  s: Triple[];
  b: Triple[];
  h: Triple[];
  p: Triple[];
  g: Triple[];
  w: Triple[];
};

const DATA = raw as unknown as {
  updated: string;
  regYear: string;
  sources: Record<string, string>;
  regions: Record<string, RegionRec>;
  dogs: Record<string, number>;
  cats: Record<string, number>;
};

const REGIONS = DATA.regions;
const DOGS = DATA.dogs || {};
const CATS = DATA.cats || {};
const TABLE_LIMIT = 20;
const EMPTY: RegionRec = { s: [], b: [], h: [], p: [], g: [], w: [] };

export const BIZ_UPDATED = DATA.updated;
export const BIZ_REG_YEAR = DATA.regYear || "2022-12";
export const BIZ_SOURCES = DATA.sources;

export type BizItem = { name: string; dong: string; year: string };

function dongMatch(stored: string, want: string): boolean {
  if (!stored || !want) return false;
  const a = stored.replace(/[0-9]+가$/, "");
  const b = want.replace(/[0-9]+가$/, "");
  return a === b || a.startsWith(b) || b.startsWith(a);
}

function toItems(rows: Triple[] | undefined): BizItem[] {
  return (rows || []).map(([name, dong, year]) => ({ name, dong, year: year || "" }));
}

function splitItems(items: BizItem[], dong?: string) {
  if (!dong) {
    return { exact: items, table: items, fallback: false, exactCount: items.length, parentCount: items.length };
  }
  const hit = items.filter((it) => dongMatch(it.dong, dong));
  if (hit.length) {
    return { exact: hit, table: hit, fallback: false, exactCount: hit.length, parentCount: items.length };
  }
  return {
    exact: [],
    table: items,
    fallback: items.length > 0,
    exactCount: 0,
    parentCount: items.length,
  };
}

function recOf(sido: string, sigungu: string): RegionRec {
  const official = canonicalSido(sido) || sido;
  return REGIONS[regionKey(official, sigungu)] || EMPTY;
}

function mergeRecs(recs: RegionRec[]): RegionRec {
  const out: RegionRec = { s: [], b: [], h: [], p: [], g: [], w: [] };
  for (const r of recs) {
    out.s.push(...(r.s || []));
    out.b.push(...(r.b || []));
    out.h.push(...(r.h || []));
    out.p.push(...(r.p || []));
    out.g.push(...(r.g || []));
    out.w.push(...(r.w || []));
  }
  return out;
}

function sidoRecs(sido: string): RegionRec[] {
  const official = canonicalSido(sido) || sido;
  const prefix = `${official}_`;
  return Object.entries(REGIONS)
    .filter(([k]) => k.startsWith(prefix))
    .map(([, v]) => v);
}

function sumDogs(keys: string[]): number {
  return keys.reduce((n, k) => n + (DOGS[k] || 0), 0);
}

export function formatCount(n: number): string {
  return n.toLocaleString("ko-KR");
}

export function getBizBundle(sido?: string, sigungu?: string, dong?: string) {
  let rec: RegionRec = EMPTY;
  let dogKeys: string[] = [];
  if (sido && sigungu) {
    const official = canonicalSido(sido) || sido;
    rec = recOf(official, sigungu);
    dogKeys = [regionKey(official, sigungu)];
  } else if (sido) {
    const official = canonicalSido(sido) || sido;
    rec = mergeRecs(sidoRecs(official));
    dogKeys = Object.keys(DOGS).filter((k) => k.startsWith(`${official}_`));
  } else {
    rec = mergeRecs(Object.values(REGIONS));
    dogKeys = Object.keys(DOGS);
  }

  const sales = splitItems(toItems(rec.s), dong);
  const breeding = splitItems(toItems(rec.b), dong);
  const hospital = splitItems(toItems(rec.h), dong);
  const pharmacy = splitItems(toItems(rec.p), dong);
  const groom = splitItems(toItems(rec.g), dong);
  const board = splitItems(toItems(rec.w), dong);
  const dogs = sumDogs(dogKeys);
  const cats = dogKeys.reduce((n, k) => n + (CATS[k] || 0), 0);

  return {
    sales: sales.table,
    breeding: breeding.table,
    hospital: hospital.table,
    pharmacy: pharmacy.table,
    groom: groom.table,
    board: board.table,
    salesCount: sales.exactCount,
    breedingCount: breeding.exactCount,
    hospitalCount: hospital.exactCount,
    pharmacyCount: pharmacy.exactCount,
    groomCount: groom.exactCount,
    boardCount: board.exactCount,
    salesParent: sales.parentCount,
    breedingParent: breeding.parentCount,
    hospitalParent: hospital.parentCount,
    salesFallback: sales.fallback,
    breedingFallback: breeding.fallback,
    hospitalFallback: hospital.fallback,
    pharmacyFallback: pharmacy.fallback,
    groomFallback: groom.fallback,
    boardFallback: board.fallback,
    dogs,
    cats,
    fallback: sales.fallback || breeding.fallback || hospital.fallback,
  };
}

export function sliceBiz(items: BizItem[]): { rows: BizItem[]; extra: number } {
  if (items.length <= TABLE_LIMIT) return { rows: items, extra: 0 };
  return { rows: items.slice(0, TABLE_LIMIT), extra: items.length - TABLE_LIMIT };
}

export function dongBizCounts(sido: string, sigungu: string) {
  const rec = recOf(sido, sigungu);
  return getDongs(sido, sigungu).map((dong) => ({
    dong,
    sales: toItems(rec.s).filter((it) => dongMatch(it.dong, dong)).length,
    breeding: toItems(rec.b).filter((it) => dongMatch(it.dong, dong)).length,
    hospital: toItems(rec.h).filter((it) => dongMatch(it.dong, dong)).length,
  }));
}

export function sigunguBizCounts(sido: string) {
  return getSigungus(sido).map((r) => {
    const rec = recOf(r.sido, r.sigungu);
    const key = regionKey(r.sido, r.sigungu);
    return {
      sigungu: r.sigungu,
      sales: rec.s.length,
      breeding: (rec.b || []).length,
      hospital: rec.h.length,
      dogs: DOGS[key] || 0,
    };
  });
}

export function sidoBizCounts() {
  return SIDOS.map((sido) => {
    const rec = mergeRecs(sidoRecs(sido));
    const dogKeys = Object.keys(DOGS).filter((k) => k.startsWith(`${sido}_`));
    return {
      sido,
      sales: rec.s.length,
      breeding: rec.b.length,
      hospital: rec.h.length,
      dogs: sumDogs(dogKeys),
    };
  });
}

export function bizSourceLine(): string {
  return `${BIZ_SOURCES.s}. ${BIZ_SOURCES.b}. ${BIZ_SOURCES.h}. ${BIZ_SOURCES.g}. ${BIZ_SOURCES.w}. 전화는 올리지 않습니다.`;
}

export function dogSourceLine(): string {
  return `${BIZ_SOURCES.d}. 시·군·구 단위 누계입니다.`;
}
