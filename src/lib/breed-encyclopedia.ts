import type { Breed } from "./breeds";
import { CAT_ENCYCLOPEDIA, type BreedEncyclopedia, type GuideFact } from "./breed-encyclopedia-cats";
import { DOG_ENCYCLOPEDIA } from "./breed-encyclopedia-dogs";
import { SITE } from "./site";

export type { BreedEncyclopedia, GuideFact };

function fallbackEncyclopedia(breed: Breed): BreedEncyclopedia {
  return {
    origin: breed.tag,
    paragraphs: [
      `${breed.name}은 ${breed.size} 체구에 ${breed.coat}입니다. ${breed.temperament}`,
      `${breed.homeNeed} 분양 전에는 사진만 보지 않고 생활 리듬이 집과 맞는지부터 맞춰 보세요.`,
      `${SITE.brand}은 ${breed.keyword} 상담을 건강 기록과 초기 적응 순서부터 안내합니다. 직배송·방문 일정은 지역에 맞춰 조율합니다.`,
    ],
    genetics: [
      { name: "건강 기록", detail: `${breed.name} 분양 전 예방·검진 기록을 확인하세요.` },
      { name: "성장·체구", detail: `${breed.size}로 자라므로 집 동선에 대입해 보시면 선택이 분명해집니다.` },
      { name: "털·관리", detail: `${breed.coat}. 미용 주기와 빗질 시간은 보호자 생활과 맞춰야 합니다.` },
    ],
    care: [
      { name: "집 환경", detail: breed.homeNeed },
      { name: "기질", detail: breed.temperament },
      { name: "첫 주", detail: "화장실·잠자리·급식 위치를 처음 삼 일 동안 옮기지 않는 것이 안전합니다." },
    ],
    beginner: `${breed.tag} — 초보 보호자라면 하루 관리 시간을 먼저 그려 보시는 것이 좋습니다.`,
  };
}

export function getEncyclopedia(breed: Breed): BreedEncyclopedia {
  return CAT_ENCYCLOPEDIA[breed.folder] || DOG_ENCYCLOPEDIA[breed.folder] || fallbackEncyclopedia(breed);
}
