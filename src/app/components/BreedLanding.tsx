import type { CSSProperties } from "react";
import Link from "next/link";
import {
  Baby,
  ClipboardCheck,
  Ear,
  Eye,
  Footprints,
  Heart,
  HeartHandshake,
  Home,
  MapPin,
  MessageCircle,
  PawPrint,
  Scissors,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Wind,
} from "lucide-react";
import type { Breed } from "@/lib/breeds";
import { CAT_BREEDS, DOG_BREEDS } from "@/lib/breeds";
import type { BreedLandingContent, ObserveCard } from "@/lib/breed-content";
import { placeLabel } from "@/lib/breed-content";
import { breedGalleryCards, breedPhotos } from "@/lib/breed-images";
import { breedPath, bunyangPath } from "@/lib/breed-paths";
import type { KoreaSigungu } from "@/lib/korea-regions";
import {
  getDongs,
  getSigungus,
  neighborDongs,
  neighborSigungus,
  sidoChipNames,
} from "@/lib/korea-regions";
import BreedPhoto from "./BreedPhoto";
import BreedInquiryForm from "./BreedInquiryForm";

const JOURNEY_ICONS = [HeartHandshake, Home, ClipboardCheck, Eye, ShieldAlert] as const;
const CARE_ICONS = [MessageCircle, Stethoscope, Baby, Scissors, Heart] as const;
const FACT_ICONS = [PawPrint, Sparkles, MapPin, Home] as const;

function observeIcon(title: string) {
  if (/눈|얼굴/.test(title)) return Eye;
  if (/숨|코/.test(title)) return Wind;
  if (/귀/.test(title)) return Ear;
  if (/털|피부/.test(title)) return Sparkles;
  if (/걸음|보행/.test(title)) return Footprints;
  return Heart;
}

export default function BreedLanding({
  breed,
  content,
  sido,
  sigungu,
  dong,
  pagePath,
}: {
  breed: Breed;
  content: BreedLandingContent;
  sido?: string;
  sigungu?: string;
  dong?: string;
  pagePath: string;
}) {
  const salt = [sido, sigungu, dong].filter(Boolean).join("_");
  const photos = breedPhotos(breed, salt);
  const gallery = breedGalleryCards(breed, salt, 5);
  const place = placeLabel(sido, sigungu, dong);
  const nearbyGu = sido && sigungu ? neighborSigungus(sido, sigungu, 8) : [];
  const nearbyDong = sido && sigungu && dong ? neighborDongs(sido, sigungu, dong, 8) : [];
  const dongList = sido && sigungu && !dong ? getDongs(sido, sigungu) : [];
  const sidoList = !sido ? sidoChipNames() : [];
  const sigunguList: KoreaSigungu[] = sido && !sigungu ? getSigungus(sido) : [];
  const otherSidos = sido && !sigungu ? sidoChipNames(sido) : [];
  const samePlace = (slug: string) => {
    if (sido && sigungu && dong) return breedPath(slug, sido, sigungu, dong);
    if (sido && sigungu) return breedPath(slug, sido, sigungu);
    if (sido) return breedPath(slug, sido);
    return breedPath(slug);
  };

  const style = {
    "--bl-accent": breed.palette.accent,
    "--bl-soft": breed.palette.accentSoft,
    "--bl-ink": breed.palette.ink,
    "--bl-muted": breed.palette.muted,
    "--bl-paper": breed.palette.paper,
    "--bl-card": breed.palette.card,
    "--bl-deep": breed.palette.deep,
  } as CSSProperties;

  return (
    <div className="io-root bl-root" data-theme="iopet" style={style}>
      <div className="bl-wrap">
        <nav className="bl-crumb" aria-label="경로">
          <Link href="/">홈</Link>
          <span>/</span>
          <Link href={bunyangPath()}>입양 품종</Link>
          <span>/</span>
          <Link href={breedPath(breed.slug)}>{breed.name}</Link>
          {sido ? (
            <>
              <span>/</span>
              <Link href={breedPath(breed.slug, sido)}>{sido}</Link>
            </>
          ) : null}
          {sido && sigungu ? (
            <>
              <span>/</span>
              <Link href={breedPath(breed.slug, sido, sigungu)}>{sigungu}</Link>
            </>
          ) : null}
          {dong ? (
            <>
              <span>/</span>
              <span>{dong}</span>
            </>
          ) : null}
        </nav>
      </div>

      <header className="io-hero">
        <div className="bl-wrap io-hero-grid">
          <div className="io-hero-copy">
            <p className="io-kicker">
              <PawPrint size={14} />
              {content.kicker}
            </p>
            <h1 className="bl-h1">{content.h1}</h1>
            <p className="bl-lead">{content.lead}</p>
            <ul className="io-pills">
              <li>
                <Heart size={16} />
                가족이 되는 안내
              </li>
              <li>
                <Home size={16} />
                우리 집 루틴
              </li>
              <li>
                <Stethoscope size={16} />
                컨디션 확인
              </li>
              <li>
                <MapPin size={16} />
                {place}
              </li>
            </ul>
          </div>
          <div className="io-hero-photo">
            <BreedPhoto src={photos.hero} alt={`${content.h1} 대표 사진`} priority sizes="50vw" />
          </div>
        </div>
      </header>

      <section className="bl-wrap io-faces" aria-label={`${breed.name} 입양 사진`}>
        {gallery.map((card) => (
          <figure key={card.id} id={card.id} className="io-face">
            <div className="io-face-photo">
              <BreedPhoto src={card.src} alt={card.name} sizes="20vw" />
            </div>
            <figcaption>
              <Heart size={12} />
              {card.name}
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="bl-wrap io-story">
        <div className="bl-prose bl-intro">
          {content.intro.map((p) => (
            <p key={p.slice(0, 28)}>{p}</p>
          ))}
        </div>
        <div className="io-facts" aria-label={`${breed.name} 품종 요약`}>
          {content.profile.cards.map((c, i) => {
            const Icon = FACT_ICONS[i] || PawPrint;
            return (
              <article key={c.label} className="io-fact">
                <span className="io-icon">
                  <Icon size={18} />
                </span>
                <span>{c.label}</span>
                <strong>{c.value}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bl-wrap bl-block io-breed">
        <p className="io-kicker">
          <Sparkles size={14} />
          이 친구의 이야기
        </p>
        <h2 className="bl-h2">{content.profile.h2}</h2>
        <p className="bl-lead">
          {content.profile.origin}. {content.profile.beginner}
        </p>
        <div className="bl-prose">
          {content.profile.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <details className="bl-fold">
          <summary>
            <span>{breed.name} 건강에서 자주 보는 항목</span>
            <em>{content.profile.genetics.length}항목</em>
          </summary>
          <div className="bl-table-wrap">
            <table className="bl-table">
              <thead>
                <tr>
                  <th>항목</th>
                  <th>안내</th>
                </tr>
              </thead>
              <tbody>
                {content.profile.genetics.map((g) => (
                  <tr key={g.name}>
                    <th scope="row">{g.name}</th>
                    <td>{g.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <details className="bl-fold">
          <summary>
            <span>{breed.name} 매일의 손질</span>
            <em>{content.profile.care.length}항목</em>
          </summary>
          <div className="bl-table-wrap">
            <table className="bl-table">
              <thead>
                <tr>
                  <th>항목</th>
                  <th>안내</th>
                </tr>
              </thead>
              <tbody>
                {content.profile.care.map((g) => (
                  <tr key={g.name}>
                    <th scope="row">{g.name}</th>
                    <td>{g.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="io-journey">
        <div className="bl-wrap">
          <p className="io-kicker">
            <HeartHandshake size={14} />
            가족이 되는 길
          </p>
          <h2 className="bl-h2">{place}에서 {breed.name}을 맞이하는 순서</h2>
          <div className="io-journey-grid">
            {content.steps.map((step, idx) => {
              const Icon = JOURNEY_ICONS[idx] || Heart;
              return (
                <article key={step.n} className="io-journey-card">
                  <span className="io-icon">
                    <Icon size={20} />
                  </span>
                  <p className="io-step-label">{step.kicker}</p>
                  <h3>{step.h2}</h3>
                  {step.paragraphs.map((p) => (
                    <p key={p.slice(0, 26)}>{p}</p>
                  ))}
                  {step.items?.length ? (
                    <ul className="io-check">
                      {step.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {step.n === "2" ? (
                    <div className="bl-ency-photo bl-step-photo">
                      <BreedPhoto src={photos.essay} alt={`${place} ${breed.name} 집 환경`} sizes="100vw" />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bl-wrap io-observe">
        <p className="io-kicker">
          <Eye size={14} />
          만날 때 살피기
        </p>
        <h2 className="bl-h2">{content.observe.h2}</h2>
        <p className="bl-lead">{content.observe.lead}</p>
        <div className="io-observe-grid">
          {content.observe.cards.map((card: ObserveCard) => {
            const Icon = observeIcon(card.title);
            return (
              <article key={card.title} className="io-observe-card">
                <span className="io-icon">
                  <Icon size={18} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.lead}</p>
                <ul>
                  {card.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="io-care">
        <div className="bl-wrap">
          <p className="io-kicker">
            <Heart size={14} />
            {content.care.kicker}
          </p>
          <h2 className="bl-h2">{content.care.h2}</h2>
          <p className="bl-lead">{content.care.lead}</p>
          <div className="io-care-grid">
            {content.care.items.map((item, i) => {
              const Icon = CARE_ICONS[i] || Heart;
              return (
                <article key={item.n} className="io-care-card">
                  <span className="io-icon">
                    <Icon size={18} />
                  </span>
                  <em>{item.n}</em>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              );
            })}
          </div>
          <p className="bl-care-closer">{content.care.closer}</p>
        </div>
      </section>

      <section className="bl-wrap bl-block">
        <p className="io-kicker">
          <MessageCircle size={14} />
          자주 묻는 이야기
        </p>
        <h2 className="bl-h2">입양을 앞둔 분들이 많이 궁금해하세요</h2>
        <div className="bl-faq-list">
          {content.faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bl-wrap bl-block">
        <p className="io-kicker">
          <MapPin size={14} />
          이 동네 이야기
        </p>
        <h2 className="bl-h2">{content.local.h2}</h2>
        {content.local.paragraphs.slice(1).map((p) => (
          <p key={p.slice(0, 22)} className="bl-lead">
            {p}
          </p>
        ))}

        <details className="bl-fold">
          <summary>
            <span>{content.localFacts.snapshotH2}</span>
            <em>판매·생산·병원</em>
          </summary>
          <div className="bl-fold-body">
            <div className="bl-stats">
              {content.localFacts.stats.map((s) => (
                <article key={s.label} className="bl-stat">
                  <span>{s.label}</span>
                  <strong>{s.value}</strong>
                  <em>{s.note}</em>
                </article>
              ))}
            </div>
            <p className="bl-lead">{content.localFacts.paragraphs[0]}</p>
            <p className="bl-source bl-source-inline">{content.localFacts.snapshotSource}</p>
          </div>
        </details>

        {content.localFacts.tables.map((table) => (
          <details key={table.caption} className="bl-fold">
            <summary>
              <span>{table.caption}</span>
              <em>{table.rows.length}건</em>
            </summary>
            <div className="bl-table-wrap">
              <table className="bl-table">
                <thead>
                  <tr>
                    {table.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => (
                    <tr key={row.cells.join("-")}>
                      {row.cells.map((cell, i) => (
                        <td key={`${cell}-${i}`}>
                          {i === 0 && row.href ? <Link href={row.href}>{cell}</Link> : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="bl-source">{table.source}</p>
            </div>
          </details>
        ))}

        {sidoList.length ? (
          <div className="bl-link-card">
            <h3>시·도별 {breed.name} 입양</h3>
            <div className="bl-links">
              {sidoList.map((s) => (
                <Link key={s} className="bl-chip" href={breedPath(breed.slug, s)}>
                  {s}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {sigunguList.length ? (
          <div className="bl-hub-grid">
            {sigunguList.map((r) => (
              <Link key={r.sigungu} className="bl-hub-card" href={breedPath(breed.slug, r.sido, r.sigungu)}>
                <strong>
                  {r.sigungu} {breed.name} 입양
                </strong>
                <span>{r.sido} · 동·읍·면 안내</span>
              </Link>
            ))}
          </div>
        ) : null}

        {otherSidos.length ? (
          <div className="bl-link-card">
            <h3>다른 시·도 {breed.name} 입양</h3>
            <div className="bl-links">
              {otherSidos.map((s) => (
                <Link key={s} className="bl-chip" href={breedPath(breed.slug, s)}>
                  {s}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {dongList.length ? (
          <div className="bl-link-card">
            <h3>
              {sigungu} 행정구역별 {breed.name} 입양
            </h3>
            <div className="bl-links">
              {dongList.map((d) => (
                <Link key={d} className="bl-chip" href={breedPath(breed.slug, sido, sigungu, d)}>
                  {d}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {nearbyDong.length ? (
          <div className="bl-link-card">
            <h3>
              {sigungu} 이웃 동 {breed.name} 입양
            </h3>
            <div className="bl-links">
              {nearbyDong.map((d) => (
                <Link key={d} className="bl-chip" href={breedPath(breed.slug, sido, sigungu, d)}>
                  {d}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {nearbyGu.length ? (
          <div className="bl-link-card">
            <h3>
              {sido} 인근 시·군·구 {breed.keyword}
            </h3>
            <div className="bl-links">
              <Link className="bl-chip" href={breedPath(breed.slug)}>
                {breed.name} 전체
              </Link>
              {sido ? (
                <Link className="bl-chip" href={breedPath(breed.slug, sido)}>
                  {sido} 전체
                </Link>
              ) : null}
              {nearbyGu.map((r) => (
                <Link key={r.sigungu} className="bl-chip" href={breedPath(breed.slug, r.sido, r.sigungu)}>
                  {r.sigungu}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="bl-link-card">
          <h3>견종 입양</h3>
          <div className="bl-links">
            {DOG_BREEDS.map((b) => (
              <Link key={b.slug} className="bl-chip" href={samePlace(b.slug)}>
                {b.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="bl-link-card">
          <h3>묘종 입양</h3>
          <div className="bl-links">
            {CAT_BREEDS.map((b) => (
              <Link key={b.slug} className="bl-chip" href={samePlace(b.slug)}>
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="io-closer">
        <div className="bl-wrap">
          <h2 className="bl-h2">{content.closer.h2}</h2>
          <p className="bl-lead">{content.closer.lead}</p>
        </div>
      </section>

      <section className="bl-inquiry" id="inquiry">
        <div className="bl-wrap">
          <p className="io-kicker" style={{ color: "#99f6e4" }}>
            <MessageCircle size={14} />
            입양 문의
          </p>
          <h2 className="bl-h2">{content.cta}</h2>
          <p className="bl-lead">
            {place} {breed.name} 희망 시기와 가족 구성만 남겨 주셔도 상담이 시작됩니다.
          </p>
          <BreedInquiryForm
            breedName={breed.name}
            place={place}
            cta={content.cta}
            pagePath={pagePath}
          />
        </div>
      </section>
    </div>
  );
}
