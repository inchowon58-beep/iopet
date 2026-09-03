import { SITE } from "@/lib/site";

const STEPS = [
  {
    n: "01",
    title: "진열을 둘러본다",
    desc: "갤러리에서 분양 중인 메인쿤을 봅니다. 남는 얼굴이 있으면 적어 두세요.",
  },
  {
    n: "02",
    title: "조건을 이야기한다",
    desc: "공간·아이 유무·희망 성별을 알려 주시면, 지금 만날 수 있는 아이를 골라 드립니다.",
  },
  {
    n: "03",
    title: "방문 날을 잡는다",
    desc: "직접 보고 싶으면 일정을 맞춥니다. 급해도, 며칠을 두고 봐도 됩니다.",
  },
  {
    n: "04",
    title: "집으로 모신다",
    desc: "첫 사료·빗질·화장실만 짚어 드린 뒤 집으로 모십니다.",
  },
];

export default function Process() {
  return (
    <section id="process" className="section">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-kicker">HOW TO CHOOSE</p>
          <h2 className="mt-3 text-3xl font-bold text-[var(--navy)] md:text-4xl">
            입양은 이렇게 골라 갑니다
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            사진부터 보고, 조건이 맞으면 {SITE.brand}에 물어보시면 됩니다.
          </p>
        </div>

        <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-7 hidden h-px bg-[var(--line)] lg:block" />
          {STEPS.map((s) => (
            <div key={s.n} className="relative text-center lg:pt-0">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--navy)] text-lg font-bold text-[#f4ead0]">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-bold text-[var(--navy)]">{s.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
