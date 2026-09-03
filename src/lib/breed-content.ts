import type { Breed } from "./breeds";
import { kindKo, relatedBreeds, sizeClass } from "./breeds";
import { getEncyclopedia } from "./breed-encyclopedia";
import type { GuideFact } from "./breed-encyclopedia";
import { eulReul, eunNeun, euroRo, iGa, iraRa } from "./korean";
import { areaLabel } from "./korea-regions";
import { buildLocalRegionFacts, type LocalRegionFacts } from "./local-region-facts";
import { SITE } from "./site";

export type BreedFaq = { q: string; a: string };

export type StepBlock = {
  n: string;
  kicker: string;
  h2: string;
  paragraphs: string[];
  items?: string[];
  itemLabel?: string;
};

export type ObserveCard = { title: string; lead: string; items: string[] };
export type CareItem = { n: string; title: string; body: string };

export type BreedProfileFact = { label: string; value: string };

export type BreedLandingContent = {
  kicker: string;
  h1: string;
  localH2: string;
  title: string;
  description: string;
  keywords: string[];
  lead: string;
  intro: string[];
  profile: {
    h2: string;
    cards: BreedProfileFact[];
    origin: string;
    paragraphs: string[];
    genetics: GuideFact[];
    care: GuideFact[];
    beginner: string;
  };
  localFacts: LocalRegionFacts;
  steps: StepBlock[];
  observe: { h2: string; lead: string; cards: ObserveCard[] };
  care: { kicker: string; h2: string; lead: string; items: CareItem[]; closer: string };
  local: { h2: string; paragraphs: string[] };
  faqs: BreedFaq[];
  closer: { h2: string; lead: string };
  cta: string;
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], n: number): T {
  return arr[n % arr.length];
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed || 1);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function placeLabel(sido?: string, sigungu?: string, dong?: string): string {
  if (dong) return dong;
  if (sigungu) return sigungu;
  if (sido) return sido;
  return "전국";
}

export function adminLabel(sido?: string, sigungu?: string, dong?: string): string {
  return areaLabel(sido || "", sigungu, dong) || "전국";
}

export function buildBreedContent(
  breed: Breed,
  sido?: string,
  sigungu?: string,
  dong?: string
): BreedLandingContent {
  const place = placeLabel(sido, sigungu, dong);
  const admin = adminLabel(sido, sigungu, dong);
  const kw = breed.keyword;
  const name = breed.name;
  const seed = hash(`${breed.slug}|${admin}|${place}|iopet`);
  const enc = getEncyclopedia(breed);
  const localFacts = buildLocalRegionFacts(breed, sido, sigungu, dong);
  const related = relatedBreeds(breed, 4)
    .map((b) => b.name)
    .join("·");
  const isCat = breed.kind === "cat";
  const isShelter = breed.kind === "shelter";
  const pet = isCat ? "고양이" : isShelter ? breed.noun : "강아지";
  const baby = isCat ? "아기 고양이" : isShelter ? "아이" : "아기 강아지";
  const size = sizeClass(breed);
  const salesStat = localFacts.stats.find((s) => s.label === "분양 등록업체")?.value || "";
  const hospitalStat = localFacts.stats.find((s) => s.label === "병원 수")?.value || "";

  const kicker = pick(
    [
      `${place} · ${name}와 가족이 되는 안내`,
      `${admin} ${name} 입양 노트`,
      `${place}에서 읽는 ${name} 하루`,
    ],
    seed
  );

  const h1 = pick(
    [
      `${place} ${name} 입양, 우리 집 하루에 맞춰 천천히`,
      `${name}${eulReul(name)} ${place}에서 맞이하기 전에 알아 두면 좋은 이야기`,
      `${place} ${name} — 사진이 아니라 함께할 내일을 고르는 법`,
      `${admin}에서 ${name} 가족을 찾을 때, 기질과 컨디션부터`,
      `${place} ${kw}, 설레는 마음과 현실적인 준비를 같이`,
    ],
    seed
  );

  const title = `${place} ${name} 입양 안내 | ${SITE.brand}`;
  const localH2 = `${place}에서 ${name}과 살면 어떤 하루가 될까`;
  const description = (
    dong
      ? `${dong}(${sido} ${sigungu}) ${name} 입양. 병원 ${hospitalStat}, 판매업 ${salesStat}. ${SITE.brand}이 기질·체구·집 준비를 풀어 드립니다.`
      : sigungu
        ? `${sido} ${sigungu} ${name} 입양. 병원 ${hospitalStat}, 판매업 ${salesStat}. ${SITE.brand} 입양 노트.`
        : sido
          ? `${sido} ${name} 입양. 병원 ${hospitalStat}, 판매업 ${salesStat}. ${SITE.brand}에서 하루 루틴을 정리했습니다.`
          : `전국 ${name} 입양. 병원 ${hospitalStat}, 판매업 ${salesStat}. ${SITE.brand}이 품종 이야기를 모았습니다.`
  ).slice(0, 158);

  const lead = pick(
    [
      `${place}에서 ${name}${eulReul(name)} 가족으로 맞이하고 싶다면, 예쁜 얼굴 다음에 우리 집 리듬을 먼저 그려 보세요.`,
      `${admin} ${kw}는 한순간에 결정하지 않아도 됩니다. 기질과 컨디션, 그리고 인계 이후의 질문을 ${SITE.brand}이 같이 받습니다.`,
      `설레는 마음이 먼저인 것은 당연합니다. ${place} ${name} 입양은 그 마음을 하루 루틴으로 바꿔 주는 과정입니다.`,
    ],
    seed + 1
  );

  const intro = [
    pick(
      [
        `${pet}을 들이는 일은 사진을 고르는 쇼핑이 아닙니다. ${place} ${kw}를 보실 때도 ‘이 아이와 열 해를 보낼 수 있나’를 먼저 떠올려 보시면 선택이 단단해집니다.`,
        `${place}${euroRo(place)} ${name} 입양을 알아보시면 얼굴이 먼저 눈에 들어옵니다. 실제로는 ${breed.temperament} 그 기질이 우리 집 저녁과 맞는지가 더 오래 남습니다.`,
        `${admin}에서 ${name}을 고민 중이라면, 가격표만 늘어놓지 말고 인계 뒤에도 물어볼 곳이 있는지를 확인해 주세요.`,
      ],
      seed + 2
    ),
    pick(
      [
        `어린 ${pet}${eunNeun(pet)} 낯선 집에 오면 밥이 줄거나 구석에 숨는 일이 흔합니다. ${place} 새 보금자리의 첫 방이, 이후 배변과 잠자리 습관을 거의 결정합니다.`,
        `${name}${eunNeun(name)} ${breed.temperament} ${place}에서 집을 비우는 시간, 아이 유무, 다른 반려동물 여부가 얼굴보다 중요합니다.`,
        `${size}이고 ${breed.coat}라 ${place} 집의 동선·환기·빗질 시간이 빠지면, 갤러리에서 본 모습과 실제 하루가 어긋나기 쉽습니다.`,
      ],
      seed + 4
    ),
    pick(
      [
        `그래서 ${place} ${kw}를 볼 때는 아이의 숨소리와 걸음, 건강 기록, 그리고 인계 이후에도 손을 잡아 줄 사람이 있는지를 같이 보세요.`,
        `${SITE.brand}은 ${admin} ${name} 입양뿐 아니라 첫 주 적응, 사료 전환, 화장실 루틴까지 이어서 안내합니다. 처음 ${pet}${eulReul(pet)} 키우시는 분도 순서를 밟으면 안정됩니다.`,
        enc.paragraphs[0] || `${name}의 기질과 관리 포인트를 ${place} 기준으로 풀어 두었습니다.`,
      ],
      seed + 5
    ),
  ];

  const catHome = [
    "하루 중 집을 비우는 시간이 얼마나 되는지",
    "캣타워나 숨을 공간이 있는지",
    "매일 빗질·화장실 청소를 할 수 있는지",
    "이미 함께 사는 반려동물이 있는지",
    "창문·베란다 안전망을 달 수 있는지",
    "화장실을 사람 동선과 떨어뜨릴 수 있는지",
    `${breed.homeNeed}`,
  ];
  const dogHome = [
    "하루 산책 시간과 동네 동선을 만들 수 있는지",
    "혼자 두는 시간과 분리 불안을 감당할 수 있는지",
    "빗질·미용 주기를 지킬 수 있는지",
    "이미 함께 사는 반려동물이 있는지",
    `${place} 집의 엘리베이터·계단·복도 소음을 점검했는지`,
    "미끄러운 바닥과 높은 소파를 보완할 수 있는지",
    `${breed.homeNeed}`,
  ];
  const shelterHome = [
    "처음 사흘 동안 비워 둘 조용한 방이 있는지",
    "기존 반려동물과 잠시 떨어져 지낼 공간이 있는지",
    "기록이 불완전해도 병원 일정을 잡을 수 있는지",
    "숨는 아이를 억지로 꺼내지 않을 수 있는지",
    `${place}에서 산책·화장실 시간을 고정할 수 있는지`,
    `${breed.homeNeed}`,
  ];
  const homeItems = shuffle(isCat ? catHome : isShelter ? shelterHome : dogHome, seed).slice(0, 5);

  const step1Paras = isShelter
    ? [
        `${place}에서 ${name}${eulReul(name)} 보실 때는 품종 자랑보다 ‘지금 이 아이’의 평온함이 먼저입니다. 살아온 길이 제각각이라 외모만으로 성격을 단정하기 어렵습니다.`,
        `보호 중 메모, 검진 기록, ${place} 집의 조용한 방을 먼저 확인해 주세요. 급하게 데려오면 숨거나 밥을 거부하는 기간이 길어질 수 있습니다.`,
      ]
    : [
        pick(
          [
            `${place} ${kw}를 열면 가장 먼저 얼굴이 보입니다. 설레는 것은 자연스럽지만, 같이 살 내일을 그리려면 기질과 관리량이 더 오래 남습니다.`,
            `${name}${eunNeun(name)} ${breed.tag}입니다. ${place}에서 고르실 때 얼굴 다음에 ${breed.coat} 관리량과 ${size} 성체 크기를 집 평면에 대입해 보세요.`,
          ],
          seed + 6
        ),
        pick(
          [
            `${pet}${eunNeun(pet)} 보호자님의 퇴근 시간, 집 구조, 가족 구성에 따라 적응 속도가 달라집니다. ${place} ${kw} 상담에서는 이 이야기부터 맞춰 드립니다.`,
            `장모인지 단모인지, 활동량이 많은지에 따라 ${place}의 하루가 달라집니다. ${breed.temperament}`,
          ],
          seed + 7
        ),
      ];

  const step2Paras = isCat
    ? [
        `${place} ${kw} 전에는 ${pet}${iGa(pet)} 마음을 놓을 작은 방을 먼저 마련해 주세요. 낯선 집에서는 바로 탐험하기보다 숨어서 분위기를 살피는 일이 많습니다.`,
        `화장실, 물, 밥그릇, 숨숨집을 한 방에 모아 두고, 높은 선반이나 캣타워를 더해 주세요. ${place} 창문·베란다는 안전망이 있어야 마음이 놓입니다.`,
      ]
    : isShelter
      ? [
          `${place}로 오기 전, 캐리어를 열어 둔 조용한 방이 가장 값진 준비물입니다. 첫날 목욕이나 강제 안기는 피하세요.`,
          `화장실과 잠자리 위치를 처음 사흘 동안 옮기지 않는 것이 ${name} 적응에 유리합니다. 보호소에서 먹던 사료를 받아 천천히 바꾸는 편이 안전합니다.`,
        ]
      : [
          `${place} ${kw} 전에는 산책 길, 잠자리, 식기, 배변 패드를 미리 정해 두세요. ${name}${eunNeun(name)} ${size}${iraRa(size)} 미끄러운 바닥과 높은 점프를 줄여 주세요.`,
          `${breed.homeNeed} ${place} 엘리베이터·복도 소음에도 처음에는 긴장을 잘합니다. 첫 산책은 짧게, 같은 길로 반복하는 편이 안정적입니다.`,
        ];

  const step3Paras = [
    pick(
      [
        `${place} ${kw}를 사진·영상만 보고 결정하는 것은 아쉽습니다. 화면에서는 활발해 보여도, 실제로 만나면 숨소리와 사람 반응이 다르게 느껴질 수 있습니다.`,
        `${admin}에서 ${name}${eulReul(name)} 고르실 때는 대면이나 실시간으로 걸음·호흡·사람 반응을 보는 것이 안전합니다.`,
      ],
      seed + 8
    ),
    `만나 보실 때는 사람을 얼마나 경계하는지, 움직임은 자연스러운지, 호흡은 편안한지를 봅니다. 예방접종·구충·먹던 사료·화장실 습관·최근 건강 설명을 충분히 들을 수 있어야 합니다.`,
  ];

  const processItems = shuffle(
    [
      "얼굴과 컨디션을 직접 확인",
      "건강 기록과 먹던 사료 받기",
      "인계 조건과 일정 정리",
      `${place} 집 세팅 마치기`,
      "첫 주 적응 질문 남기기",
      "만남 일정 잡기",
    ],
    seed + 9
  );

  const observeLead = isCat
    ? `${pet}${eunNeun(pet)} 낯선 앞에서 입을 다무는 일이 많아, 조용하다고 해서 얌전하다고 단정하기 어렵습니다. ${place}에서 ${baby}를 보실 때 아래를 같이 보세요.`
    : `${baby}${eunNeun(baby)} 처음 보는 자리에서 웅크리거나 너무 흥분할 수 있습니다. ${place} ${kw} 만남에서는 한 컷이 아니라 눈·코·귀·털·배변을 차례로 봅니다.`;

  const observeCards: ObserveCard[] = isCat
    ? [
        {
          title: "눈빛",
          lead: `${pet}의 눈은 컨디션을 읽는 창입니다. 아래가 보이면 조금 더 물어보세요.`,
          items: shuffle(
            ["눈곱이 유난히 많은 경우", "눈가가 항상 젖어 있는 경우", "충혈이 뚜렷한 경우", "눈을 자주 감고 있는 경우"],
            seed + 11
          ),
        },
        {
          title: "숨소리",
          lead: `코는 보통 깨끗하고 촉촉합니다. ${place}에서 호흡을 살필 때 아래를 봅니다.`,
          items: shuffle(
            ["콧물이 멈추지 않는 경우", "재채기가 반복되는 경우", "코 주변이 지저분한 경우"],
            seed + 12
          ),
        },
        {
          title: "귓속",
          lead: "귀 안쪽은 깨끗해야 하고 심한 냄새가 나면 안 됩니다.",
          items: shuffle(
            ["귀지가 쌓인 경우", "냄새가 강한 경우", "귀를 자주 긁는 행동", "고개를 자주 흔드는 행동"],
            seed + 13
          ),
        },
        {
          title: "털결",
          lead: `${name}${eunNeun(name)} ${breed.coat}입니다. 윤기가 없고 특정 부위가 비어 있으면 피부를 더 봐 주세요.`,
          items: shuffle(
            ["털이 푸석한 경우", "가려워 과도하게 핥는 경우", "특정 부위 탈모", `${enc.care[0]?.name || "빗질"} 주기를 미리 확인`],
            seed + 14
          ).slice(0, 3),
        },
        {
          title: "화장실",
          lead: "배변은 건강을 읽는 중요한 단서입니다. 쓰던 모래도 같이 물으면 첫 주가 편해집니다.",
          items: shuffle(
            ["설사 흔적", "항문 주변이 지저분한 경우", "화장실을 잘 쓰는지", "쓰던 모래·사료 종류"],
            seed + 15
          ),
        },
      ]
    : [
        {
          title: "얼굴",
          lead: `${place}에서 ${name} 얼굴을 보실 때 분비물과 호흡부터 확인하세요.`,
          items: shuffle(
            ["눈곱·충혈", "콧물·재채기", "거친 호흡", "입을 벌리고 쉬는 모습"],
            seed + 11
          ),
        },
        {
          title: "피부",
          lead: `${breed.coat}라 귀 냄새와 털 윤기가 컨디션을 잘 보여 줍니다.`,
          items: shuffle(
            ["귀지·냄새", "가려움으로 바닥을 비비는 행동", "털이 극도로 푸석한 경우", "습진 흔적"],
            seed + 12
          ),
        },
        {
          title: "걸음",
          lead: `${size} 체구는 무릎·허리 부담이 걸음에서 드러날 수 있습니다.`,
          items: shuffle(
            ["절뚝임", "앉을 때 한쪽 다리를 빼는 모습", "계단을 거부하는 모습", "과도한 점프 유도는 피할 것"],
            seed + 13
          ),
        },
        {
          title: "밥과 배변",
          lead: `${place} 인계 전에 먹던 사료와 배변 리듬을 받아 두면 첫 주가 수월합니다.`,
          items: shuffle(
            ["설사·혈변 흔적", "식욕 저하와 무기력", "쓰던 사료 이름", "산책 중 배변 여부"],
            seed + 14
          ),
        },
      ];

  const step5Paras = [
    pick(
      [
        `${place} ${kw}에서 가장 아쉬운 것은, 충분히 보지 못한 채 마음이 먼저 달려가는 순간입니다.`,
        `실물을 보기 전 예약금만 요구하거나, 건강 설명 없이 급하게 인계를 재촉하면 ${admin}이어도 속도를 늦추는 편이 맞습니다.`,
      ],
      seed + 16
    ),
    pick(
      [
        `인계 조건이나 예방·구충 기록이 흐릿하면 바로 결정하지 마세요. ${name}은 새 집에서 질문이 생기기 쉬워, 이후에도 물어볼 수 있는지가 중요합니다.`,
        `${SITE.brand}은 ${place} ${kw} 이후에도 첫 주 적응·사료 전환 질문을 받습니다. 한 번 만나고 끝나는 진행은 권하지 않습니다.`,
      ],
      seed + 17
    ),
  ];

  const careItems: CareItem[] = [
    {
      n: "01",
      title: "우리 집 이야기",
      body: `${place} 생활과 ${name} 기질을 맞춰 가족을 찾습니다. ${breed.temperament}`,
    },
    {
      n: "02",
      title: "건강 이야기",
      body: `예방·구충·최근 컨디션을 확인한 뒤 인계합니다. ${enc.genetics[0]?.name || "검진"} 항목은 상담에서 풀어 드립니다.`,
    },
    {
      n: "03",
      title: "첫 주의 집",
      body: `${place} 집의 화장실·잠자리·급식을 처음 며칠 고정하는 법을 안내합니다.`,
    },
    {
      n: "04",
      title: "매일의 손길",
      body: `${breed.coat} 관리와 ${enc.care[0]?.detail || breed.homeNeed}`,
    },
    {
      n: "05",
      title: "이후에도 열린 창",
      body: `사료 전환, 배변, 병원 일정처럼 ${place} ${kw} 이후 생기는 질문을 이어서 받습니다.`,
    },
  ];

  const faqsPool: BreedFaq[] = [
    {
      q: `${place}에 오자마자 밥을 안 먹으면 큰일인가요?`,
      a: `환경이 바뀌면 식욕이 잠시 줄어들 수 있습니다. ${pet}${eunNeun(pet)} 첫날 숨어 지내거나 식사를 거르기도 합니다. 오래 먹지 않거나 무기력이 같이 보이면 상태 확인이 필요합니다.`,
    },
    {
      q: `새 집에 오자마자 구석에만 있으면 어떻게 하나요?`,
      a: `흔한 적응입니다. 억지로 꺼내려고 하기보다 조용한 공간을 두고, 스스로 나올 때까지 기다려 주세요.`,
    },
    {
      q: `화장실을 안 쓰면 어떻게 하나요?`,
      a: isCat
        ? `화장실 위치를 자주 바꾸지 말고, 쓰던 모래와 비슷한 제품을 ${place} 집에 미리 준비하는 것이 도움이 됩니다.`
        : `배변 패드·산책 루틴을 ${place}에서 쓰던 방식에 가깝게 맞추고, 처음 사흘은 같은 지점을 반복해 주세요.`,
    },
    {
      q: `${place} ${kw} 후 바로 동물병원에 가야 하나요?`,
      a: `컨디션 확인이나 예방 일정이 남아 있다면 병원 상담을 받아 보는 것이 좋습니다. 기록과 함께 가시면 ${admin} 병원에서도 설명이 수월합니다.`,
    },
    {
      q: `${name}${eunNeun(name)} 처음 키우는 집과 맞나요?`,
      a: enc.beginner,
    },
    {
      q: `${place} ${kw} 상담은 어떻게 남기나요?`,
      a: `아래 문의에 ${place} 거주와 희망 시기만 적어 주셔도 됩니다. 가족 구성·다른 반려동물 여부까지 적으시면 더 정확한 안내가 됩니다.`,
    },
    {
      q: `${kw} 비용은 어디에서 알 수 있나요?`,
      a: `혈통·외모·월령에 따라 달라 ${place}에서 지금 만날 수 있는 아이 기준으로 상담하는 것이 정확합니다. 이 페이지에 단가를 박아 두지 않습니다.`,
    },
    {
      q: `${name}의 ${breed.coat} 손질은 얼마나 걸리나요?`,
      a: enc.care.find((c) => /털|빗|미용/.test(c.name))?.detail || `${breed.coat}. ${place} 생활 시간과 맞춰 주기를 상담에서 잡아 드립니다.`,
    },
  ];
  const localFaqs: BreedFaq[] = localFacts.paragraphs.slice(1, 3).map((p, i) =>
    i === 0
      ? {
          q: `${place}${eunNeun(place)} 어디에 속하고, ${name} 안내는 어디까지인가요?`,
          a: p,
        }
      : {
          q: `${place}에서 ${name}${eulReul(name)} 고를 때 무엇을 먼저 보면 되나요?`,
          a: `${p} 비슷한 ${kindKo(breed)}은 ${related} 페이지도 함께 보시면 됩니다.`,
        }
  );
  const faqs = [...localFaqs, ...shuffle(faqsPool, seed + 20).slice(0, 4)];

  const localParas = [
    ...localFacts.paragraphs,
    `이웃 동네와 비슷한 ${kindKo(breed)}(${related}) 페이지를 같이 열어 보시면 ${admin} 이동 범위가 분명해집니다.`,
  ];

  const closerH2 = pick(
    [
      `${place}에서 ${name}과 오래 가는 첫 주를 준비합니다`,
      `설레는 입양이 ${place}의 평범한 하루가 되도록`,
      `${admin} ${name}, 가족이 되는 결정을 천천히`,
    ],
    seed + 21
  );

  return {
    kicker,
    h1,
    localH2,
    title,
    description: description.slice(0, 158),
    keywords: [
      `${place} ${name} 입양`,
      `${place}${name}입양`,
      `${place} ${kw}`,
      `${admin} ${name}`,
      `${name} 입양`,
      kw,
      kindKo(breed),
      SITE.brand,
    ],
    lead,
    intro,
    profile: {
      h2: `${name}, 이런 친구입니다`,
      cards: [
        { label: "체구", value: size },
        { label: "털결", value: breed.coat },
        { label: "태어난 곳", value: enc.origin },
        { label: "우리 집", value: breed.homeNeed },
      ],
      origin: enc.origin,
      paragraphs: enc.paragraphs,
      genetics: enc.genetics,
      care: enc.care,
      beginner: enc.beginner,
    },
    localFacts,
    steps: [
      {
        n: "1",
        kicker: "마음 준비",
        h2: `${place}에서 ${name}을 맞이하기 전, 우리 집을 먼저 그리는 이유`,
        paragraphs: step1Paras,
        items: homeItems,
        itemLabel: "우리 집이 준비됐는지",
      },
      {
        n: "2",
        kicker: "보금자리",
        h2: `입양 전에 ${place} 집을 이렇게 비워 두세요`,
        paragraphs: step2Paras,
      },
      {
        n: "3",
        kicker: "만남",
        h2: `${place} ${name} 입양, 안전하게 만나는 순서`,
        paragraphs: step3Paras,
        items: processItems,
        itemLabel: "만남 순서",
      },
      {
        n: "4",
        kicker: "살피기",
        h2: `${baby}를 만날 때 눈여겨볼 포인트`,
        paragraphs: [observeLead],
      },
      {
        n: "5",
        kicker: "멈추기",
        h2: `${place} ${name} 입양에서 속도를 늦춰야 할 순간`,
        paragraphs: step5Paras,
      },
    ],
    observe: {
      h2: `${baby}를 만날 때 눈여겨볼 포인트`,
      lead: observeLead,
      cards: observeCards,
    },
    care: {
      kicker: `${SITE.brand}이 함께하는 길`,
      h2: `${place} ${name} 입양 이후에도 이어지는 손길`,
      lead: `${pet}을 키우다 보면 병원·미용·용품을 따로따로 찾게 됩니다. ${SITE.brand}은 ${place} ${kw} 상담부터 첫 주 적응까지 한 흐름으로 안내합니다.`,
      items: careItems,
      closer: `이야기 → 기록 확인 → 만남 → 적응 안내, ${place}에서 가족이 되는 시작을 같이`,
    },
    local: { h2: localH2, paragraphs: localParas },
    faqs,
    closer: {
      h2: closerH2,
      lead: `설레는 마음부터 인계 이후 질문까지 — ${place} ${name} 입양을 ${SITE.brand}이 같이 안내합니다.`,
    },
    cta: `${place} ${name} 입양 문의`,
  };
}
