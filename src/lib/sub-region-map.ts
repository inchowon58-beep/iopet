/**
 * 시·군·구 키워드 기준 동·읍·면·주요 지명 (근방 지역 블록용)
 */
export const SUB_REGION_MAP: Record<string, string[]> = {
  부천: ["중동", "역곡", "소사", "옥길", "상동", "심곡", "춘의", "원미"],
  인천: ["부평", "주안", "연수", "송도", "계양", "남동", "서구", "미추홀"],
  청라: ["청라동", "가정동", "연희동", "검암동", "석남동"],
  김포: ["장기", "구래", "운양", "사우", "풍무동", "고촌", "양촌"],
  고양: ["일산", "백석", "정발산", "화정", "행신", "대화", "삼송"],
  파주: ["운정", "금촌", "교하", "문산", "탄현"],
  일산: ["주엽", "백석", "정발산", "마두", "대화"],
  수원: ["영통동", "광교동", "매탄동", "장안구", "팔달구"],
  성남: ["분당", "수정", "중원", "판교", "서현", "야탑"],
  용인: ["기흥", "수지", "처인", "동백", "상현"],
  안양: ["평촌", "범계", "관양", "비산", "호계"],
  안산: ["단원", "상록", "고잔", "선부", "사동"],
  화성: ["동탄", "병점", "향남", "봉담", "남양"],
  시흥: ["정왕", "신천", "배곧", "월곶"],
  광명: ["철산", "하안", "소하", "광명역"],
  평택: ["비전", "서정", "송탄", "안중", "고덕"],
  의정부: ["가능", "호원", "민락", "금오", "장암"],
  남양주: ["다산", "별내", "화도", "진접", "오남"],
  구리: ["갈매", "인창", "수택", "교문"],
  하남: ["미사", "감일", "덕풍", "풍산"],
  의왕: ["내손", "청계", "오전", "포일"],
  군포: ["산본", "금정", "당동", "당정"],
  오산: ["원동", "궐동", "세마"],
  이천: ["부발", "마장", "신둔"],
  춘천: ["석사", "퇴계", "후평", "효자"],
  원주: ["단구", "명륜", "학성", "무실"],
  청주: ["상당", "흥덕", "서원", "오창"],
  천안: ["두정", "불당", "신부", "쌍용"],
  아산: ["온양", "배방", "탕정"],
  대전: ["유성", "서구", "중구", "둔산"],
  세종: ["조치원", "나성", "도담"],
  전주: ["완산", "덕진", "효자", "서신"],
  광주: ["북구", "서구", "동구", "남구", "상무"],
  부산: ["해운대", "수영", "동래", "연제", "사상"],
  대구: ["수성", "달서", "북구", "동구", "중구"],
  울산: ["남구", "중구", "북구", "동구"],
  제주: ["노형", "연동", "이도", "애월", "한림"],
  강남: ["역삼", "논현", "삼성", "대치", "청담"],
  서초: ["반포", "잠원", "방배", "양재"],
  송파: ["잠실", "문정", "가락", "석촌"],
  마포: ["공덕", "상암", "합정", "연남", "망원"],
  영등포: ["여의도", "당산", "문래", "신길"],
  은평: ["불광", "응암", "역촌", "녹번"],
  노원: ["상계", "중계", "하계", "공릉"],
  관악: ["신림", "봉천", "남현"],
  강서: ["화곡", "등촌", "발산", "염창"],
};

export const REGION_PARENT_ALIASES: Record<string, string> = {
  청라국제도시: "청라",
  청라동: "청라",
  가정: "청라",
  가정동: "청라",
  연희: "청라",
  연희동: "청라",
  검암: "청라",
  검암동: "청라",
  석남: "청라",
  석남동: "청라",
  송도국제도시: "인천",
  송도동: "인천",
  부평구: "인천",
  주안동: "인천",
  연수구: "인천",
  계양구: "인천",
  배곧동: "시흥",
  정왕동: "시흥",
  신천동: "시흥",
  월곶동: "시흥",
  광교: "수원",
  광교동: "수원",
  영통: "수원",
  영통동: "수원",
  매탄: "수원",
  매탄동: "수원",
  분당구: "성남",
  판교동: "성남",
  서현동: "성남",
  야탑동: "성남",
  정자동: "성남",
  수지구: "용인",
  기흥구: "용인",
  동백동: "용인",
  죽전: "용인",
  상현동: "용인",
  평촌동: "안양",
  범계동: "안양",
  관양동: "안양",
  동탄신도시: "화성",
  동탄역: "화성",
  병점동: "화성",
  향남읍: "화성",
  미사강변도시: "하남",
  미사동: "하남",
  감일동: "하남",
  갈매동: "구리",
  다산동: "남양주",
  별내동: "남양주",
  산본동: "군포",
  금정동: "군포",
  오남읍: "남양주",
  불당동: "천안",
  두정동: "천안",
  배방읍: "아산",
  탕정면: "아산",
  둔산동: "대전",
  조치원읍: "세종",
  나성동: "세종",
  효자동: "전주",
  상무지구: "광주",
  해운대구: "부산",
  수영구: "부산",
  동래구: "부산",
  수성구: "대구",
  달서구: "대구",
  노형동: "제주",
  연동: "제주",
};

export function normalizeCityKey(region: string): string {
  return region
    .replace(/\s/g, "")
    .replace(/(특별시|광역시|특별자치시|특별자치도)$/u, "")
    .replace(/(시|군|구)$/u, "")
    .trim();
}

function normalizeAreaKey(area: string): string {
  return area
    .replace(/\s/g, "")
    .replace(/(특별시|광역시|특별자치시|특별자치도)$/u, "")
    .replace(/(시|군|구|동|읍|면|리|역)$/u, "")
    .trim();
}

export function resolveRegionAlias(region: string | null): string | null {
  if (!region) return null;
  const key = normalizeAreaKey(normalizeCityKey(region));
  if (!key) return null;
  for (const [alias, parent] of Object.entries(REGION_PARENT_ALIASES)) {
    const aliasKey = normalizeAreaKey(alias);
    if (aliasKey === key || aliasKey.includes(key) || key.includes(aliasKey)) {
      return parent;
    }
  }
  return null;
}

export function inferParentRegionFromSubArea(region: string | null): string | null {
  if (!region) return null;
  const key = normalizeAreaKey(normalizeCityKey(region));
  if (!key) return null;
  const alias = resolveRegionAlias(region);
  if (alias) return alias;

  for (const [mapKey, areas] of Object.entries(SUB_REGION_MAP)) {
    if (normalizeAreaKey(mapKey) === key) return mapKey;
    for (const area of areas) {
      const areaKey = normalizeAreaKey(area);
      if (areaKey === key || areaKey.includes(key) || key.includes(areaKey)) {
        return mapKey;
      }
    }
  }
  return null;
}

export function getSubRegionNames(region: string | null, count = 5): string[] {
  if (!region) return [];
  const key = normalizeCityKey(region);
  const direct = SUB_REGION_MAP[key];
  if (direct?.length) return direct.slice(0, count);
  for (const [mapKey, areas] of Object.entries(SUB_REGION_MAP)) {
    if (key.startsWith(mapKey) || mapKey.startsWith(key)) {
      return areas.slice(0, count);
    }
  }
  const parent = inferParentRegionFromSubArea(region);
  if (parent && SUB_REGION_MAP[parent]?.length) {
    return SUB_REGION_MAP[parent]
      .filter((area) => normalizeAreaKey(area) !== normalizeAreaKey(region))
      .slice(0, count);
  }
  return [];
}
