"use client";

import Link from "next/link";
import { Heart, Home, MessageCircle, PawPrint } from "lucide-react";
import { SITE, CTA_KAKAO } from "@/lib/site";
import { breedPath } from "@/lib/breed-paths";
import { useKakaoHref } from "./KakaoHrefProvider";

const HERO_SHOTS = [
  { slug: "뱅갈", name: "뱅갈", src: "https://image.cattery.co.kr/bengal/01.webp" },
  { slug: "포메라니안", name: "포메라니안", src: "https://image.cattery.co.kr/pome/01.webp" },
  { slug: "랙돌", name: "랙돌", src: "https://image.cattery.co.kr/ragdoll/01.webp" },
] as const;

export default function Hero() {
  const kakaoHref = useKakaoHref();
  return (
    <section id="top" className="home-hero container">
      <div className="home-hero-copy">
        <p className="home-kicker">
          <PawPrint size={14} />
          {SITE.brandEn}
        </p>
        <h1 className="home-title">{SITE.brand}</h1>
        <p className="home-lead">
          강아지와 고양이의 얼굴을 고르고, 우리 집 하루에 맞는지 품종 페이지에서
          천천히 읽어 보세요. 설레는 입양이 평범한 내일이 되도록 안내합니다.
        </p>
        <p className="home-note">{SITE.tagline}</p>
        <div className="home-actions">
          <a href="#breeds" className="home-btn home-btn-gold">
            <Heart size={16} />
            입양할 품종 보기
          </a>
          {kakaoHref ? (
            <a
              href={kakaoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="home-btn home-btn-ghost"
            >
              <MessageCircle size={16} />
              {CTA_KAKAO}
            </a>
          ) : null}
        </div>
      </div>
      <div className="home-hero-gallery">
        {HERO_SHOTS.map((shot) => (
          <Link key={shot.slug} href={breedPath(shot.slug)} className="home-hero-shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.src} alt={`${shot.name} 입양`} />
            <span>
              <Home size={14} />
              {shot.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
