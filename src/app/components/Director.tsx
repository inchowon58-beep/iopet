const GROUPS = [
  {
    title: "몸집·성장",
    items: [
      "수컷 성체 6~12kg, 암컷 4~8kg 전후 (개체마다 다름)",
      "몸통이 길고 근육이 있어, 키보다 무게감이 먼저 느껴집니다",
      "2~4년을 두고 천천히 커지므로 성체 크기를 기준으로 집을 보세요",
      "캣타워보다 바닥에서 길게 누울 자리가 있으면 편합니다",
    ],
  },
  {
    title: "털·손질",
    items: [
      "이중모라 목도리와 바지털이 도드라집니다",
      "평소 주 2~3회 빗질이면 엉킴을 줄일 수 있습니다",
      "환모기에는 빗질만 조금 늘려 주시면 됩니다",
      "목욕은 자주 하지 않아도 되고, 발톱·귀는 따로 안내합니다",
    ],
  },
  {
    title: "기질·하루 리듬",
    items: [
      "사람 곁에 머물고, 낮고 깊은 소리로 말하듯 웁니다",
      "아이·다른 반려동물과 지내는 개체가 많습니다",
      "놀이와 사람 시간이 있으면 실내에서도 잘 지냅니다",
      "개체 차는 있어, 지금 만날 아이 기질을 상담에서 풀어 드립니다",
    ],
  },
  {
    title: "분양가·입양 전",
    items: [
      "분양가는 혈통·성별·털색·시기에 따라 폭이 있습니다",
      "화면에는 단가를 박지 않고, 상담에서 포함 항목부터 맞춥니다",
      "무료분양만 강조되는 곳은 건강·서류를 따로 확인하세요",
      "아이오펫에서는 사진·집 환경·예산을 맞춰 본 뒤 안내합니다",
    ],
  },
];

export default function Director() {
  return (
    <section id="director" className="section bg-white/55">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-kicker">BEFORE YOU PICK</p>
          <h2 className="mt-3 text-3xl font-bold text-[var(--navy)] md:text-4xl">
            고르기 전에 알아 두면 좋은 점
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            크기와 털, 기질, 분양가를 진열 카드처럼 모아 두었습니다. 입양 전 확인용입니다.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {GROUPS.map((g) => (
            <div
              key={g.title}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-5 py-5"
            >
              <h3 className="text-sm font-bold tracking-[0.12em] text-[var(--coral-deep)]">
                {g.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {g.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-[var(--ink)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--coral)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
