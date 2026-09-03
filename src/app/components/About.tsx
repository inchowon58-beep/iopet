import { SITE } from "@/lib/site";
import ImageSlot from "./ImageSlot";

const BEDS = [
  {
    n: "고르기 1",
    title: "공간이 받쳐 주는가",
    desc: "품종마다 쓰는 공간이 다릅니다. 아이오펫은 우리 집 동선부터 맞춰 봅니다.",
  },
  {
    n: "고르기 2",
    title: "기질이 집에 맞는가",
    desc: "온순하다는 한 줄로 끝내지 않습니다. 지금 만날 아이가 사람 곁에서 어떻게 쉬는지를 풀어 드립니다.",
  },
  {
    n: "고르기 3",
    title: "얼굴을 먼저 고르기",
    desc: "분양 중인 모습은 갤러리에 진열해 두었습니다. 남는 아이가 있으면 그때 상담하면 됩니다.",
  },
];

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="relative">
          <div className="rounded-media relative aspect-[4/5] overflow-hidden shadow-[0_22px_50px_rgba(36,48,86,0.16)] md:aspect-[5/6]">
            <ImageSlot index={9} fill label={`${SITE.name} 소개`} />
          </div>
        </div>
        <div>
          <p className="section-kicker">IOPET</p>
          <h2 className="mt-3 text-3xl font-bold text-[var(--navy)] md:text-4xl">
            입양,
            <br />
            우리 집 하루에 맞춰 고릅니다
          </h2>
          <p className="mt-4 text-[var(--muted)]">
            {SITE.brand}은 외모만 보여 드리지 않습니다. 기질과 체구, 키우기 하루를 집 기준으로
            나눠 안내합니다.
          </p>
          <div className="mt-8 space-y-4">
            {BEDS.map((p) => (
              <div
                key={p.title}
                className="rounded-[var(--radius)] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(36,48,86,0.06)]"
              >
                <p className="text-xs font-bold tracking-[0.12em] text-[var(--coral-deep)]">
                  {p.n}
                </p>
                <h3 className="mt-1 text-lg font-bold text-[var(--navy)]">{p.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
