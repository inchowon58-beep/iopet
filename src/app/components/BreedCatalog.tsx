import Link from "next/link";
import { BookOpen, HeartHandshake, PawPrint } from "lucide-react";
import { CAT_BREEDS, DOG_BREEDS, SHELTER_BREEDS, kindKo, type Breed } from "@/lib/breeds";
import { breedCover } from "@/lib/breed-images";
import { breedPath } from "@/lib/breed-paths";

function Grid({ title, count, items }: { title: string; count: string; items: Breed[] }) {
  return (
    <section className="home-group">
      <h3>
        {title}
        <em>{count}</em>
      </h3>
      <div className="home-grid">
        {items.map((b) => (
          <Link key={b.slug} href={breedPath(b.slug)} className="home-card">
            <div className="home-card-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={breedCover(b.folder)} alt={`${b.name} 입양`} />
            </div>
            <div className="home-card-meta">
              <small>{kindKo(b)}</small>
              <strong>{b.name}</strong>
              <b>입양 안내 읽기</b>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function BreedCatalog() {
  return (
    <>
      <section className="home-steps">
        <div className="container">
          <ol>
            <li>
              <PawPrint size={22} />
              <b>얼굴을 고릅니다</b>
              <span>메인에서 견종·묘종 사진을 보고 마음이 가는 품종을 고릅니다.</span>
            </li>
            <li>
              <BookOpen size={22} />
              <b>하루를 읽습니다</b>
              <span>기질, 체구, 털 관리, 집 준비를 품종 페이지에서 확인합니다.</span>
            </li>
            <li>
              <HeartHandshake size={22} />
              <b>가족과 맞춥니다</b>
              <span>우리 집 리듬과 맞는지 상담으로 이어 갑니다.</span>
            </li>
          </ol>
        </div>
      </section>

      <section id="breeds" className="home-breeds">
        <div className="container">
          <div className="home-breeds-head">
            <div>
              <p className="home-kicker">가족이 될 품종</p>
              <h2>마음을 준 얼굴을 고르세요</h2>
            </div>
            <p>자세한 기질과 키우기는 각 품종 허브에 모아 두었습니다. 사진이 연결하는 페이지가 입양의 본문입니다.</p>
          </div>
          <Grid title="견종" count={`${DOG_BREEDS.length}종`} items={DOG_BREEDS} />
          <Grid title="묘종" count={`${CAT_BREEDS.length}종`} items={CAT_BREEDS} />
          {SHELTER_BREEDS.length ? (
            <Grid title="보호소" count={`${SHELTER_BREEDS.length}`} items={SHELTER_BREEDS} />
          ) : null}
          <div className="home-close">
            <p>예쁜 카드보다, 각 품종 페이지에서 함께할 내일을 천천히 읽어 주세요.</p>
            <Link href="/bunyang" className="home-btn home-btn-ghost" style={{ display: "inline-flex" }}>
              지역별 입양 목록
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
