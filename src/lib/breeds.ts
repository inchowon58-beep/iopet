/** 견종·묘종·보호소 — URL slug는 한글 이름. 컬러·레이아웃은 품종마다 다르게. */

export type BreedKind = "dog" | "cat" | "shelter";
export type BreedLayout = "split" | "overlay" | "stack" | "ribbon";
export type BreedShape = "round" | "soft" | "sharp";

export type BreedPalette = {
  accent: string;
  accentSoft: string;
  ink: string;
  muted: string;
  paper: string;
  card: string;
  deep: string;
};

export type Breed = {
  name: string;
  folder: string;
  slug: string;
  kind: BreedKind;
  tag: string;
  size: string;
  coat: string;
  temperament: string;
  homeNeed: string;
  keyword: string;
  noun: string;
  palette: BreedPalette;
  layout: BreedLayout;
  shape: BreedShape;
};

export const IMAGE_HOST = "https://image.cattery.co.kr";

type Row = [
  name: string,
  folder: string,
  kind: BreedKind,
  tag: string,
  size: string,
  coat: string,
  temperament: string,
  homeNeed: string,
  palette: BreedPalette,
  layout: BreedLayout,
  shape: BreedShape,
];

const ROWS: Row[] = [
  [
    "아비시니안",
    "abisinan",
    "cat",
    "티킹 털의 활동묘",
    "중형",
    "짧은 티킹 코트",
    "호기심이 많고 사람 옆을 잘 따라다닙니다",
    "높은 스크래처와 놀이 시간이 필요합니다",
    { accent: "#c45c2c", accentSoft: "#fbe6d8", ink: "#3a2218", muted: "#7a5a4a", paper: "#fff6ef", card: "#fffdfb", deep: "#8a3a1c" },
    "overlay",
    "round",
  ],
  [
    "아메리칸숏헤어",
    "american",
    "cat",
    "균형 잡힌 가정묘",
    "중형",
    "짧은 밀도 있는 털",
    "온순하고 아이와도 잘 지냅니다",
    "기본 화장실·급식 자리만 안정되면 됩니다",
    { accent: "#2f6f9a", accentSoft: "#d9ebf6", ink: "#1b3144", muted: "#5a7080", paper: "#f3f8fc", card: "#ffffff", deep: "#1e4a68" },
    "split",
    "soft",
  ],
  [
    "뱅갈고양이",
    "bnagal",
    "cat",
    "표범 무늬의 운동묘",
    "중형",
    "윤기 있는 스팟 코트",
    "에너지가 높아 놀이를 자주 원합니다",
    "넓은 캣타워와 하루 놀이 루틴이 필요합니다",
    { accent: "#d97706", accentSoft: "#fde8c8", ink: "#3d2a10", muted: "#7a6240", paper: "#fff8eb", card: "#fffdf8", deep: "#9a4e08" },
    "ribbon",
    "sharp",
  ],
  [
    "보스턴테리어",
    "bosten",
    "dog",
    "도시형 컴패니언",
    "소형",
    "짧은 매끄러운 털",
    "밝고 사람 곁을 좋아합니다",
    "짧은 산책과 실내 놀이면 충분합니다",
    { accent: "#314e89", accentSoft: "#dce4f5", ink: "#1a2744", muted: "#5c6880", paper: "#f4f6fb", card: "#ffffff", deep: "#24365f" },
    "stack",
    "soft",
  ],
  [
    "브리티쉬숏헤어",
    "british",
    "cat",
    "둥근 얼굴의 침착묘",
    "중형~대형",
    "밀도 높은 단모",
    "차분하고 관찰을 즐깁니다",
    "시원한 자리와 무리하지 않는 놀이가 맞습니다",
    { accent: "#5b728c", accentSoft: "#e2e8ef", ink: "#243040", muted: "#66788a", paper: "#f5f7fa", card: "#ffffff", deep: "#3d5166" },
    "split",
    "round",
  ],
  [
    "버니즈마운틴독",
    "bunyz",
    "dog",
    "산악 대형견",
    "대형",
    "긴 삼중모",
    "온화하고 가족과 잘 맞습니다",
    "시원한 공간과 매일 긴 산책이 필요합니다",
    { accent: "#3d5a40", accentSoft: "#dce8dd", ink: "#1e2e20", muted: "#5a6e5c", paper: "#f3f7f3", card: "#ffffff", deep: "#2a402c" },
    "overlay",
    "soft",
  ],
  [
    "고양이보호소",
    "catboho",
    "shelter",
    "고양이 임시 보호",
    "다양",
    "개체마다 다름",
    "구조 후 안정을 먼저 찾습니다",
    "조용한 방과 천천히 다가가는 시간이 필요합니다",
    { accent: "#2d6a57", accentSoft: "#d5ece4", ink: "#16332a", muted: "#4e7266", paper: "#eef7f3", card: "#ffffff", deep: "#1b4a3c" },
    "stack",
    "sharp",
  ],
  [
    "차우차우",
    "chauchau",
    "dog",
    "사자 갈기의 독립견",
    "중형",
    "풍성한 더블코트",
    "신중하고 자기 영역을 지킵니다",
    "이른 사회화와 시원한 그늘이 중요합니다",
    { accent: "#a33b12", accentSoft: "#f6dccf", ink: "#3a1c12", muted: "#7a5344", paper: "#fbf3ee", card: "#fffdfb", deep: "#7a2c10" },
    "ribbon",
    "round",
  ],
  [
    "코카스파니엘",
    "coca",
    "dog",
    "늘어진 귀의 사냥개",
    "중형",
    "결이 있는 장모",
    "다정하고 사람 기분을 잘 읽습니다",
    "귀 관리와 매일 산책이 필요합니다",
    { accent: "#8b5a2b", accentSoft: "#f0e0cc", ink: "#352414", muted: "#6e5840", paper: "#faf4eb", card: "#fffdf8", deep: "#5c3a18" },
    "split",
    "soft",
  ],
  [
    "골든리트리버",
    "coldenret",
    "dog",
    "금색 리트리버",
    "대형",
    "물결 중장모",
    "사교적이고 학습을 즐깁니다",
    "운동량과 빗질이 꾸준히 필요합니다",
    { accent: "#c3922a", accentSoft: "#f7ebcc", ink: "#3a2e14", muted: "#7a6a40", paper: "#fff9ec", card: "#fffef8", deep: "#8a6418" },
    "overlay",
    "round",
  ],
  [
    "꼬똥드툴레아",
    "coton",
    "dog",
    "솜털 소형견",
    "소형",
    "면화 같은 장모",
    "밝고 무릎 위에서 잘 쉽니다",
    "매일 빗질과 짧은 산책이 맞습니다",
    { accent: "#8b5f9a", accentSoft: "#eedff3", ink: "#32203a", muted: "#6e5a78", paper: "#faf4fc", card: "#ffffff", deep: "#5c3a68" },
    "ribbon",
    "round",
  ],
  [
    "닥스훈트",
    "daks",
    "dog",
    "짧은 다리 사냥개",
    "소형",
    "단모·장모·와이어",
    "고집과 애교가 함께 있습니다",
    "허리 부담을 줄인 계단·소파 관리가 필요합니다",
    { accent: "#9a4a22", accentSoft: "#f3dccf", ink: "#3a2216", muted: "#745444", paper: "#fbf4ef", card: "#fffdfb", deep: "#6e3214" },
    "stack",
    "sharp",
  ],
  [
    "달마시안",
    "dalma",
    "dog",
    "점박이 마차견",
    "중형",
    "짧은 점박이 코트",
    "지구력이 높고 활동적입니다",
    "긴 운동과 청각 관리가 필요합니다",
    { accent: "#222222", accentSoft: "#ececec", ink: "#161616", muted: "#5c5c5c", paper: "#f7f7f7", card: "#ffffff", deep: "#111111" },
    "overlay",
    "sharp",
  ],
  [
    "도베르만",
    "doberman",
    "dog",
    "슬림한 가드독",
    "대형",
    "짧은 광택 코트",
    "충성심이 강하고 훈련 반응이 빠릅니다",
    "충분한 운동과 일관된 리더십이 필요합니다",
    { accent: "#7a1428", accentSoft: "#f3d6dc", ink: "#2e1016", muted: "#6e4450", paper: "#fbf1f3", card: "#fffdfd", deep: "#5a1020" },
    "split",
    "sharp",
  ],
  [
    "강아지보호소",
    "dogboho",
    "shelter",
    "강아지 임시 보호",
    "다양",
    "개체마다 다름",
    "구조 후 신뢰를 천천히 쌓습니다",
    "산책 루틴과 안정된 잠자리가 먼저입니다",
    { accent: "#4a6e3a", accentSoft: "#dcead4", ink: "#1e3018", muted: "#5a7050", paper: "#f2f7ee", card: "#ffffff", deep: "#2e4a24" },
    "stack",
    "sharp",
  ],
  [
    "잉글리쉬불독",
    "engbuldog",
    "dog",
    "주름 많은 불독",
    "중형",
    "짧은 부드러운 털",
    "느긋하고 실내 생활을 잘합니다",
    "더위 관리와 주름 청결이 핵심입니다",
    { accent: "#6e5340", accentSoft: "#ebe0d6", ink: "#2c2218", muted: "#6a5c50", paper: "#f7f2ec", card: "#fffdfb", deep: "#4a382c" },
    "split",
    "soft",
  ],
  [
    "프렌치불독",
    "frenchi",
    "dog",
    "박쥐 귀 컴패니언",
    "소형",
    "짧은 코트",
    "유머러스하고 사람 곁을 지킵니다",
    "호흡·더위 관리가 특히 중요합니다",
    { accent: "#5c3d7a", accentSoft: "#e8dcf3", ink: "#281830", muted: "#645870", paper: "#f7f3fb", card: "#ffffff", deep: "#3e2858" },
    "overlay",
    "round",
  ],
  [
    "이탈리안그레이하운드",
    "italian",
    "dog",
    "슬렌더 사이드독",
    "소형",
    "짧은 실키 코트",
    "예민하고 따뜻한 무릎을 좋아합니다",
    "보온과 부드러운 바닥이 필요합니다",
    { accent: "#6a5a48", accentSoft: "#ebe4dc", ink: "#2c241c", muted: "#6a6054", paper: "#f6f2ec", card: "#fffdfb", deep: "#4a3e32" },
    "ribbon",
    "soft",
  ],
  [
    "골든두들",
    "doodle",
    "dog",
    "골든×푸들 믹스",
    "중형",
    "웨이브·컬 코트",
    "명랑하고 사람 중심입니다",
    "빗질과 지적 놀이가 함께 필요합니다",
    { accent: "#c47a22", accentSoft: "#f6e4c4", ink: "#3a2810", muted: "#7a6240", paper: "#fff8eb", card: "#fffef8", deep: "#8a5410" },
    "ribbon",
    "round",
  ],
  [
    "메인쿤",
    "maincoon",
    "cat",
    "큰 체구의 숲고양이",
    "대형묘",
    "방수성 장모",
    "온순하고 물놀이를 즐기기도 합니다",
    "넓은 동선과 높은 전망대가 필요합니다",
    { accent: "#243056", accentSoft: "#e8ebf4", ink: "#1e2433", muted: "#5c6270", paper: "#f7f3ea", card: "#fffdf8", deep: "#243056" },
    "split",
    "soft",
  ],
  [
    "말라뮤트",
    "malamute",
    "dog",
    "북극 썰매개",
    "대형",
    "밀도 높은 더블코트",
    "힘 있고 독립적이며 가족과 유대가 깊습니다",
    "시원한 환경과 힘쓰는 운동이 필요합니다",
    { accent: "#3d6a8a", accentSoft: "#d6e8f2", ink: "#163040", muted: "#4e6880", paper: "#f0f6fa", card: "#ffffff", deep: "#1e4860" },
    "overlay",
    "sharp",
  ],
  [
    "먼치킨",
    "mcnchikin",
    "cat",
    "짧은 다리 고양이",
    "소형~중형",
    "단모 또는 장모",
    "장난기가 많고 낮게 달립니다",
    "낮은 가구와 관절을 배려한 동선이 필요합니다",
    { accent: "#d46a78", accentSoft: "#f8dde2", ink: "#3a1c24", muted: "#7a5460", paper: "#fdf4f6", card: "#fffdfd", deep: "#9a3a4a" },
    "ribbon",
    "round",
  ],
  [
    "미니핀",
    "minipin",
    "dog",
    "작은 핀셔",
    "초소형",
    "짧은 광택 코트",
    "경계심이 있고 또렷한 성격입니다",
    "보온과 짧은 산책, 사회화가 필요합니다",
    { accent: "#b01e2e", accentSoft: "#f6d4d8", ink: "#3a1218", muted: "#7a4450", paper: "#fdf2f3", card: "#fffdfd", deep: "#7a1420" },
    "stack",
    "sharp",
  ],
  [
    "네바마스커레이드",
    "neva",
    "cat",
    "네바의 포인트 묘",
    "중형~대형",
    "세미롱헤어",
    "온화하고 목소리가 부드럽습니다",
    "빗질과 시원한 휴식 공간이 필요합니다",
    { accent: "#6a7fb0", accentSoft: "#dde4f4", ink: "#222c44", muted: "#5c6880", paper: "#f4f6fb", card: "#ffffff", deep: "#3d4e78" },
    "split",
    "round",
  ],
  [
    "노르웨이숲고양이",
    "norwe",
    "cat",
    "북유럽 숲고양이",
    "대형묘",
    "방한 장모",
    "독립적이면서도 신뢰를 줍니다",
    "높은 나무형 스크래처가 잘 맞습니다",
    { accent: "#3d6a52", accentSoft: "#d8eadf", ink: "#183028", muted: "#4e6e5e", paper: "#f0f6f2", card: "#ffffff", deep: "#24503c" },
    "overlay",
    "soft",
  ],
  [
    "올드잉글리쉬쉽독",
    "oldbig",
    "dog",
    "털로 덮인 목양견",
    "대형",
    "셔깃 장모",
    "온순하고 아이와 잘 지냅니다",
    "매일 빗질과 시원한 그늘이 필요합니다",
    { accent: "#4a5c70", accentSoft: "#dde4ea", ink: "#1e2830", muted: "#5a6874", paper: "#f3f5f7", card: "#ffffff", deep: "#324050" },
    "stack",
    "soft",
  ],
  [
    "페르시안",
    "perisian",
    "cat",
    "납작한 얼굴의 장모묘",
    "중형",
    "풍성 장모",
    "조용하고 무릎 위에서 잘 쉽니다",
    "매일 빗질과 눈 주위 관리가 필요합니다",
    { accent: "#c48aa0", accentSoft: "#f6e6ee", ink: "#3a2430", muted: "#7a5c68", paper: "#fdf6f9", card: "#fffdfd", deep: "#8a4a62" },
    "ribbon",
    "round",
  ],
  [
    "페키니즈",
    "pekinee",
    "dog",
    "사자 얼굴 소형견",
    "소형",
    "풍성 장모",
    "자존심이 있고 보호자와 밀착합니다",
    "더위·호흡·눈 관리가 필요합니다",
    { accent: "#b07840", accentSoft: "#f0e0cc", ink: "#3a2818", muted: "#746044", paper: "#faf4eb", card: "#fffdf8", deep: "#7a4e24" },
    "split",
    "round",
  ],
  [
    "포메라니안",
    "pome",
    "dog",
    "폭신한 소형 스피츠",
    "초소형",
    "풍성 더블코트",
    "또렷하고 경계 짖음이 있을 수 있습니다",
    "빗질과 사회화, 무릎 보호가 필요합니다",
    { accent: "#e07080", accentSoft: "#fce0e4", ink: "#3a1c24", muted: "#7a5460", paper: "#fdf5f6", card: "#fffdfd", deep: "#c04055" },
    "overlay",
    "round",
  ],
  [
    "폼스키",
    "pomsky",
    "dog",
    "포메×허스키 믹스",
    "소형~중형",
    "스피츠형 더블코트",
    "활달하고 하울링을 할 수 있습니다",
    "운동과 빗질, 시원한 잠자리가 필요합니다",
    { accent: "#4a7a9a", accentSoft: "#d6e8f2", ink: "#183040", muted: "#4e6880", paper: "#f0f6fa", card: "#ffffff", deep: "#2a5470" },
    "ribbon",
    "soft",
  ],
  [
    "랙돌",
    "ragdoll",
    "cat",
    "안기면 힘이 빠지는 묘",
    "대형묘",
    "실키 세미롱",
    "유순하고 안기는 것을 잘 견딥니다",
    "부드러운 바닥과 낮은 점프대가 맞습니다",
    { accent: "#8a6ab0", accentSoft: "#ebe0f6", ink: "#2c2040", muted: "#685c80", paper: "#f7f3fb", card: "#ffffff", deep: "#5a3e80" },
    "split",
    "round",
  ],
  [
    "러시안블루",
    "rusian",
    "cat",
    "은빛 블루 코트",
    "중형",
    "짧은 이중모",
    "수줍고 한 사람을 잘 따릅니다",
    "조용한 환경과 숨숨집이 필요합니다",
    { accent: "#5a7a8c", accentSoft: "#dce8ee", ink: "#1c2c34", muted: "#547088", paper: "#f2f6f8", card: "#ffffff", deep: "#3a5464" },
    "stack",
    "soft",
  ],
  [
    "사모예드",
    "samoyed",
    "dog",
    "미소 짓는 흰 썰매개",
    "중형~대형",
    "흰 더블코트",
    "사교적이고 혼자 두면 짖을 수 있습니다",
    "시원함과 매일 빗질·운동이 필요합니다",
    { accent: "#8a8070", accentSoft: "#efeae2", ink: "#2c2820", muted: "#6a6458", paper: "#faf8f4", card: "#ffffff", deep: "#5a5248" },
    "overlay",
    "round",
  ],
  [
    "스코티쉬폴드",
    "scottish",
    "cat",
    "접힌 귀의 둥근 묘",
    "중형",
    "단모 또는 장모",
    "조용하고 특이한 자세로 쉽니다",
    "관절을 배려한 낮은 동선이 필요합니다",
    { accent: "#8a6a4a", accentSoft: "#efe4d6", ink: "#322418", muted: "#6e5c48", paper: "#f8f3eb", card: "#fffdf8", deep: "#5c4430" },
    "split",
    "round",
  ],
  [
    "셔틀랜드쉽독",
    "selti",
    "dog",
    "작은 콜리",
    "소형~중형",
    "풍성 장모",
    "영리하고 목양 본능이 있습니다",
    "빗질과 지능 놀이, 매일 산책이 필요합니다",
    { accent: "#6e3e22", accentSoft: "#ead8cc", ink: "#2e1c12", muted: "#6a5040", paper: "#f7f0ea", card: "#fffdfb", deep: "#4a2814" },
    "ribbon",
    "soft",
  ],
  [
    "시츄",
    "shichu",
    "dog",
    "사자 같은 얼굴의 소형견",
    "소형",
    "실키 장모",
    "온화하고 실내 생활을 잘합니다",
    "눈·얼굴 털 관리가 매일 필요합니다",
    { accent: "#c49040", accentSoft: "#f4e6cc", ink: "#3a2c14", muted: "#7a6848", paper: "#faf5ea", card: "#fffdf8", deep: "#8a6420" },
    "stack",
    "round",
  ],
  [
    "슈나우저",
    "shuna",
    "dog",
    "수염 난 테리어",
    "소형~중형",
    "와이어 코트",
    "또렷하고 집 안을 잘 지킵니다",
    "미용과 짧은 산책, 훈련이 필요합니다",
    { accent: "#4a4a42", accentSoft: "#e4e4de", ink: "#22221c", muted: "#5c5c54", paper: "#f4f4f0", card: "#ffffff", deep: "#32322c" },
    "split",
    "sharp",
  ],
  [
    "시바이누",
    "siba",
    "dog",
    "일본의 중형 스피츠",
    "중형",
    "짧은 더블코트",
    "독립적이고 자기 주장이 있습니다",
    "확실한 산책 예절과 사회화가 필요합니다",
    { accent: "#d45a1c", accentSoft: "#f6dcc8", ink: "#3a2010", muted: "#7a5840", paper: "#fbf3eb", card: "#fffdf8", deep: "#a03c10" },
    "overlay",
    "sharp",
  ],
  [
    "싱가푸라",
    "singa",
    "cat",
    "작은 체구의 티킹묘",
    "소형",
    "짧은 세피아 티킹",
    "사람을 잘 따라다니며 목소리가 큽니다",
    "높은 전망대와 놀이 시간이 필요합니다",
    { accent: "#c48840", accentSoft: "#f4e4cc", ink: "#3a2814", muted: "#7a6448", paper: "#faf5eb", card: "#fffdf8", deep: "#8a5c20" },
    "ribbon",
    "round",
  ],
  [
    "스핑크스고양이",
    "spinkix",
    "cat",
    "털 없는 온기묘",
    "중형",
    "거의 없는 코트",
    "사람을 꼭 붙고 체온을 나눕니다",
    "보온·피부 관리·자외선 차단이 필요합니다",
    { accent: "#d07048", accentSoft: "#f6ddd0", ink: "#3a2014", muted: "#7a5848", paper: "#fbf3ee", card: "#fffdfb", deep: "#a04828" },
    "stack",
    "soft",
  ],
  [
    "웰시코기",
    "welshi",
    "dog",
    "짧은 다리 목양견",
    "중형",
    "짧은 더블코트",
    "명랑하고 목양 습성이 남아 있습니다",
    "허리 관리와 체중·산책이 핵심입니다",
    { accent: "#e07020", accentSoft: "#f8e0c4", ink: "#3a2410", muted: "#7a5c38", paper: "#fff6ea", card: "#fffdf8", deep: "#b05010" },
    "overlay",
    "round",
  ],
  [
    "화이트테리어",
    "wterrier",
    "dog",
    "흰 털의 소형 테리어",
    "소형",
    "짧거나 와이어",
    "또렷하고 사냥 본능이 있습니다",
    "사회화와 짧은 훈련 게임이 필요합니다",
    { accent: "#6a6a62", accentSoft: "#e8e8e2", ink: "#242420", muted: "#5c5c56", paper: "#f6f6f2", card: "#ffffff", deep: "#3e3e38" },
    "split",
    "sharp",
  ],
  [
    "요크셔테리어",
    "yoki",
    "dog",
    "실크 장모 소형 테리어",
    "초소형",
    "실키 장모",
    "용기 있고 보호자 곁을 지킵니다",
    "얼굴 털·이빨 관리와 보온이 필요합니다",
    { accent: "#6e3e18", accentSoft: "#ead8c4", ink: "#2e1c10", muted: "#6a5040", paper: "#f7f0e8", card: "#fffdf8", deep: "#4a2810" },
    "ribbon",
    "soft",
  ],
];

function toBreed(row: Row): Breed {
  const [name, folder, kind, tag, size, coat, temperament, homeNeed, palette, layout, shape] = row;
  const noun = kind === "cat" ? "고양이" : kind === "shelter" ? (name.includes("고양이") ? "고양이" : "강아지") : "강아지";
  return {
    name,
    folder,
    slug: name,
    kind,
    tag,
    size,
    coat,
    temperament,
    homeNeed,
    keyword: kind === "shelter" ? name : `${name}분양`,
    noun,
    palette,
    layout,
    shape,
  };
}

export const BREEDS: Breed[] = ROWS.map(toBreed);

export const DOG_BREEDS = BREEDS.filter((s) => s.kind === "dog");
export const CAT_BREEDS = BREEDS.filter((s) => s.kind === "cat");
export const SHELTER_BREEDS = BREEDS.filter((s) => s.kind === "shelter");
/** 보호소 제외 — 전달된 견종·묘종 전체 */
export const SPECIES_BREEDS = BREEDS.filter((s) => s.kind !== "shelter");
export const SPECIES_SLUGS = SPECIES_BREEDS.map((s) => s.slug);

export const RESERVED_PATHS = new Set([
  "admin",
  "sample",
  "guide",
  "api",
  "feed",
  "bunyang",
  "rss.xml",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "favicon.svg",
]);

const BY_SLUG = new Map(BREEDS.map((b) => [b.slug, b]));
const BY_FOLDER = new Map(BREEDS.map((b) => [b.folder, b]));

export function getBreed(slug: string): Breed | undefined {
  const key = decodeURIComponent(slug || "").trim();
  return BY_SLUG.get(key) || BY_FOLDER.get(key.toLowerCase());
}

export function isBreedSlug(slug: string): boolean {
  return Boolean(getBreed(slug)) && !RESERVED_PATHS.has(decodeURIComponent(slug || "").toLowerCase());
}

export function kindLabel(breed: Breed): string {
  if (breed.kind === "cat") return "CATTERY NOTE";
  if (breed.kind === "shelter") return "SHELTER NOTE";
  return "KENNEL NOTE";
}

export function kindKo(breed: Breed): string {
  if (breed.kind === "cat") return "묘종";
  if (breed.kind === "shelter") return "보호소";
  return "견종";
}

/** 대형 → 대형견, 중형 → 중형묘처럼 체구 말에 견/묘를 붙입니다. */
export function sizeClass(breed: Breed): string {
  const s = (breed.size || "").trim();
  if (!s || s === "다양") return s || "다양";
  if (/(견|묘)$/.test(s)) return s;
  if (breed.kind === "cat") return `${s}묘`;
  if (breed.kind === "dog") return `${s}견`;
  return s;
}

export function relatedBreeds(breed: Breed, count = 6): Breed[] {
  const same = SPECIES_BREEDS.filter((b) => b.kind === breed.kind && b.slug !== breed.slug);
  const rest = SPECIES_BREEDS.filter((b) => b.kind !== breed.kind);
  return [...same, ...rest].slice(0, count);
}

/** 빌드·사이트맵에 견종·묘종 전체를 넣습니다. */
export const POPULAR_BREED_SLUGS = SPECIES_SLUGS;
