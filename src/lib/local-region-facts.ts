import type { Breed } from "./breeds";
import { sizeClass } from "./breeds";
import { breedPath } from "./breed-paths";
import { eunNeun, eulReul, iraRa } from "./korean";
import {
  getDongs,
  getSigungus,
  KOREA_REGIONS,
  neighborSigungus,
  SIDOS,
} from "./korea-regions";
import {
  bizSourceLine,
  dongBizCounts,
  getBizBundle,
  sidoBizCounts,
  sigunguBizCounts,
  sliceBiz,
  type BizItem,
} from "./local-pet-biz";

export type LocalStat = { label: string; value: string; note: string };

export type LocalTableRow = { cells: string[]; href?: string };

export type LocalTable = {
  caption: string;
  headers: string[];
  rows: LocalTableRow[];
  source: string;
};

export type LocalRegionFacts = {
  level: "national" | "sido" | "sigungu" | "dong";
  snapshotH2: string;
  snapshotSource: string;
  stats: LocalStat[];
  tables: LocalTable[];
  paragraphs: string[];
};

const TOTAL_SIDOS = SIDOS.length;
const TOTAL_SIGUNGU = KOREA_REGIONS.length;
const TOTAL_DONGS = KOREA_REGIONS.reduce((n, r) => n + r.dongs.length, 0);

const REGION_SOURCE =
  "행정구역 범위는 아이오펫이 입양 안내를 위해 정리한 시·도·시군구·동 목록입니다.";

function bizTable(caption: string, items: BizItem[], fallback: boolean): LocalTable | null {
  if (!items.length) return null;
  const { rows, extra } = sliceBiz(items);
  const note = fallback ? "이 동에 공개된 곳이 없어 같은 시·군·구를 보여 줍니다. " : "";
  const hasYear = rows.some((it) => it.year);
  return {
    caption: extra ? `${caption} (상위 ${rows.length}곳 · 외 ${extra}곳)` : caption,
    headers: hasYear ? ["상호", "동·읍·면", "등록연도"] : ["상호", "동·읍·면"],
    rows: rows.map((it) => ({
      cells: hasYear ? [it.name, it.dong || "—", it.year ? `${it.year}년` : "—"] : [it.name, it.dong || "—"],
    })),
    source: note + bizSourceLine(),
  };
}

function bizShopTables(place: string, sido?: string, sigungu?: string, dong?: string): LocalTable[] {
  const biz = getBizBundle(sido, sigungu, dong);
  return [
    bizTable(`${place} 동물판매업`, biz.sales, biz.salesFallback),
    bizTable(`${place} 동물생산업`, biz.breeding, biz.breedingFallback),
    bizTable(`${place} 동물병원`, biz.hospital, biz.hospitalFallback),
    bizTable(`${place} 동물미용업`, biz.groom, biz.groomFallback),
    bizTable(`${place} 위탁관리(호텔·유치원)`, biz.board, biz.boardFallback),
    bizTable(`${place} 동물약국`, biz.pharmacy, biz.pharmacyFallback),
  ].filter((t): t is LocalTable => Boolean(t));
}

function snapshotStats(sido?: string, sigungu?: string, dong?: string): LocalStat[] {
  const biz = getBizBundle(sido, sigungu, dong);
  if (dong && sigungu) {
    return [
      { label: "분양 등록업체", value: `${biz.salesParent}곳`, note: `이 동 ${biz.salesCount}곳 · ${sigungu} 영업 중` },
      { label: "생산 등록업체", value: `${biz.breedingParent}곳`, note: `이 동 ${biz.breedingCount}곳 · ${sigungu} 영업 중` },
      { label: "병원 수", value: `${biz.hospitalParent}곳`, note: `이 동 ${biz.hospitalCount}곳 · ${sigungu}` },
    ];
  }
  return [
    { label: "분양 등록업체", value: `${biz.salesCount}곳`, note: "영업 중" },
    { label: "생산 등록업체", value: `${biz.breedingCount}곳`, note: "영업 중" },
    { label: "병원 수", value: `${biz.hospitalCount}곳`, note: "공개 목록" },
  ];
}

function snapshotInsight(
  place: string,
  name: string,
  sido?: string,
  sigungu?: string,
  dong?: string
): string {
  const biz = getBizBundle(sido, sigungu, dong);
  if (dong && sigungu) {
    if (biz.breedingCount === 0) {
      return `${dong} 공개 자료에는 영업 중인 동물생산업이 보이지 않습니다. 이 동네에서 ${name}${eulReul(name)} 만나실 때는 ${sigungu} 안의 다른 읍·면이나 이웃 지역에서 오는 경우를 염두에 두시면 됩니다.`;
    }
    return `${dong} 공개 자료 기준 동물생산업 ${biz.breedingCount}곳, 동물판매업 ${biz.salesCount}곳이 영업 중입니다. ${name} 입양 전에 등록 현황과 가까운 병원 위치를 함께 보시면 마음이 편해집니다.`;
  }
  if (sigungu && sido) {
    return `${sigungu} 공개 자료 기준 동물판매업 ${biz.salesCount}곳, 동물생산업 ${biz.breedingCount}곳, 동물병원 ${biz.hospitalCount}곳입니다.`;
  }
  if (sido) {
    return `${sido} 공개 자료 기준 동물판매업 ${biz.salesCount}곳, 동물생산업 ${biz.breedingCount}곳, 동물병원 ${biz.hospitalCount}곳입니다.`;
  }
  return `전국 공개 자료 기준 동물판매업 ${biz.salesCount}곳, 동물생산업 ${biz.breedingCount}곳, 동물병원 ${biz.hospitalCount}곳입니다. ${place}${eulReul(place)} 고르시면 숫자가 달라집니다.`;
}

function joinNames(names: string[], limit = 8): string {
  if (!names.length) return "";
  if (names.length <= limit) return names.join("·");
  return `${names.slice(0, limit).join("·")} 등 ${names.length}곳`;
}

export function buildLocalRegionFacts(
  breed: Breed,
  sido?: string,
  sigungu?: string,
  dong?: string
): LocalRegionFacts {
  const name = breed.name;
  const kw = breed.keyword;

  if (sido && sigungu && dong) {
    const dongs = getDongs(sido, sigungu);
    const nearbyGu = neighborSigungus(sido, sigungu, 6);
    const dongCounts = dongBizCounts(sido, sigungu);
    return {
      level: "dong",
      snapshotH2: `${dong}에서 ${name} 입양을 볼 때`
      snapshotSource: bizSourceLine(),
      stats: snapshotStats(sido, sigungu, dong),
      tables: [
        ...bizShopTables(dong, sido, sigungu, dong),
        {
          caption: `${sigungu} 안에서 ${dong} 위치`,
          headers: ["동·읍·면", "판매업", "생산업", "병원"],
          rows: dongCounts.map((r) => ({
            cells: [
              r.dong === dong ? `${r.dong} (현재)` : r.dong,
              `${r.sales}곳`,
              `${r.breeding}곳`,
              `${r.hospital}곳`,
            ],
            href: r.dong === dong ? undefined : breedPath(breed.slug, sido, sigungu, r.dong),
          })),
          source: bizSourceLine(),
        },
        {
          caption: `${sigungu} ${name} 분양 · 동·읍·면`,
          headers: ["행정구역", "소속", "안내"],
          rows: dongs.map((d) => ({
            cells: [d, `${sido} ${sigungu}`, d === dong ? "현재 페이지" : `${name} 분양`],
            href: d === dong ? undefined : breedPath(breed.slug, sido, sigungu, d),
          })),
          source: REGION_SOURCE,
        },
      ],
      paragraphs: [
        snapshotInsight(dong, name, sido, sigungu, dong),
        `${dong}${eunNeun(dong)} ${sido} ${sigungu} 안의 동네입니다. 같은 ${sigungu}에서는 ${joinNames(dongs)} 페이지로 ${name} 입양 안내가 이어집니다.`,
        `${name}${eunNeun(name)} ${sizeClass(breed)}이고 ${breed.coat}입니다. ${dong}에서 보실 때는 예쁜 사진보다, 산책·화장실·환기 동선이 ${breed.homeNeed.replace(/입니다\.?$/, "")}와 맞는지가 먼저입니다.`,
        nearbyGu.length
          ? `${sigungu} 옆으로 이어지는 ${sido} 시·군·구는 ${joinNames(nearbyGu.map((r) => r.sigungu))}입니다. 이동 반경이 넓으면 이웃 구 ${kw} 안내도 같이 열어 보세요.`
          : `${adminFallback(sido, sigungu, dong)} ${kw} 문의는 아래 양식으로 남겨 주세요.`,
      ],
    };
  }

  if (sido && sigungu) {
    const dongs = getDongs(sido, sigungu);
    const nearbyGu = neighborSigungus(sido, sigungu, 8);
    return {
      level: "sigungu",
      snapshotH2: `${sigungu}에서 ${name}과 살기`
      snapshotSource: bizSourceLine(),
      stats: snapshotStats(sido, sigungu),
      tables: [
        ...bizShopTables(sigungu, sido, sigungu),
        {
          caption: `${sigungu} 행정구역별 ${name} 분양`,
          headers: ["동·읍·면", "시·군·구", "안내"],
          rows: dongs.map((d) => ({
            cells: [d, sigungu, `${name} 분양`],
            href: breedPath(breed.slug, sido, sigungu, d),
          })),
          source: REGION_SOURCE,
        },
      ],
      paragraphs: [
        snapshotInsight(sigungu, name, sido, sigungu),
        `${sigungu}${eunNeun(sigungu)} ${sido}에 속한 시·군·구입니다. 이 페이지는 ${joinNames(dongs)} ${dongs.length}곳의 ${name} 입양을 동·읍·면 단위로 풀어 둡니다.`,
        `${name}${eunNeun(name)} ${breed.tag}입니다. ${sigungu} 집이 아파트인지 주택인지에 따라 산책 길과 털 관리량(${breed.coat})이 달라지니, 우리 집 구조를 먼저 그려 보시면 좋습니다.`,
        nearbyGu.length
          ? `${sido}에서 ${sigungu}와 맞닿은 시·군·구는 ${joinNames(nearbyGu.map((r) => r.sigungu))}입니다.`
          : `${sigungu} ${kw} 상담은 아래 문의에 남겨 주시면 됩니다.`,
      ],
    };
  }

  if (sido) {
    const gus = getSigungus(sido);
    const dongCount = gus.reduce((n, r) => n + r.dongs.length, 0);
    const counts = sigunguBizCounts(sido);
    return {
      level: "sido",
      snapshotH2: `${sido} ${name} 입양 지도`
      snapshotSource: bizSourceLine(),
      stats: snapshotStats(sido),
      tables: [
        {
          caption: `${sido} 시·군·구별 판매·생산·병원`,
          headers: ["시·군·구", "판매업", "생산업", "병원"],
          rows: counts.map((r) => ({
            cells: [r.sigungu, `${r.sales}곳`, `${r.breeding}곳`, `${r.hospital}곳`],
            href: breedPath(breed.slug, sido, r.sigungu),
          })),
          source: bizSourceLine(),
        },
        {
          caption: `${sido} 시·군·구별 ${name} 분양`,
          headers: ["시·군·구", "동·읍·면 수", "안내"],
          rows: gus.map((r) => ({
            cells: [r.sigungu, `${r.dongs.length}곳`, `${name} 분양`],
            href: breedPath(breed.slug, r.sido, r.sigungu),
          })),
          source: REGION_SOURCE,
        },
      ],
      paragraphs: [
        snapshotInsight(sido, name, sido),
        `${sido}${eunNeun(sido)} ${gus.length}개 시·군·구, 동·읍·면 ${dongCount}곳의 ${name} 입양 페이지로 나뉩니다. ${joinNames(gus.map((r) => r.sigungu))} 순으로 내려가시면 됩니다.`,
        `${name}${eunNeun(name)} ${sizeClass(breed)}${iraRa(sizeClass(breed))} ${breed.coat} 특성이 있어 ${sido} 안에서도 도심과 외곽의 산책·미용 여건이 다릅니다. 시·군·구를 고르신 뒤 동 단위 안내를 열어 보세요.`,
      ],
    };
  }

  const counts = sidoBizCounts();
  return {
    level: "national",
    snapshotH2: `전국에서 ${name} 입양을 고를 때`
    snapshotSource: bizSourceLine(),
    stats: snapshotStats(),
    tables: [
      {
        caption: `시·도별 판매·생산·병원`,
        headers: ["시·도", "판매업", "생산업", "병원"],
        rows: counts.map((r) => ({
          cells: [r.sido, `${r.sales}곳`, `${r.breeding}곳`, `${r.hospital}곳`],
          href: breedPath(breed.slug, r.sido),
        })),
        source: bizSourceLine(),
      },
      {
        caption: `시·도별 ${name} 분양`,
        headers: ["시·도", "시·군·구 수", "안내"],
        rows: SIDOS.map((s) => ({
          cells: [s, `${getSigungus(s).length}곳`, `${name} 분양`],
          href: breedPath(breed.slug, s),
        })),
        source: REGION_SOURCE,
      },
    ],
    paragraphs: [
      snapshotInsight("전국", name),
      `전국 ${name} 입양은 ${TOTAL_SIDOS}개 시·도, ${TOTAL_SIGUNGU}개 시·군·구, 동·읍·면 ${TOTAL_DONGS}곳으로 나뉩니다. 사시는 곳을 고르시면 그 동네 기준으로 집 준비와 상담이 짧아집니다.`,
      `${name}${eunNeun(name)} ${breed.tag}입니다. ${sizeClass(breed)} 체구와 ${breed.coat} 특성을 시·도별 주거 환경에 대입해 보신 뒤 시·군·구 페이지로 내려가 보세요.`,
    ],
  };
}

function adminFallback(sido: string, sigungu: string, dong: string): string {
  return `${sido} ${sigungu} ${dong}`;
}
