"use client";

import Link from "next/link";
import { Heart, MapPin, MessageCircle, PawPrint } from "lucide-react";
import { SITE, CTA_KAKAO } from "@/lib/site";
import { useKakaoHref } from "./KakaoHrefProvider";

export default function Footer() {
  const kakaoHref = useKakaoHref();
  return (
    <footer className="border-t border-teal-900/10 bg-[#f4fbf9] py-12 text-[#134e4a]">
      <div className="container grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0f766e] text-white">
              <PawPrint size={18} />
            </span>
            <span>
              <p className="text-[0.62rem] font-bold tracking-[0.22em] text-[#0f766e]">{SITE.brandEn}</p>
              <h2
                className="text-2xl font-semibold tracking-[-0.03em]"
                style={{ fontFamily: '"Fraunces", "Noto Serif KR", serif' }}
              >
                {SITE.brand}
              </h2>
            </span>
          </Link>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-teal-900/60">{SITE.tagline}</p>
        </div>

        <div className="space-y-3 text-sm text-teal-900/70">
          {kakaoHref ? (
            <a
              href={kakaoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#0f766e]"
            >
              <MessageCircle size={16} className="text-[#0f766e]" />
              {CTA_KAKAO}
            </a>
          ) : null}
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[#fb7185]" />
            {SITE.location} · {SITE.address}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href="/#breeds"
              className="inline-flex items-center gap-1 rounded-full border border-teal-900/15 px-3 py-2 text-xs font-semibold hover:border-[#0f766e] hover:text-[#0f766e]"
            >
              <Heart size={12} />
              품종
            </Link>
            <Link
              href="/bunyang"
              className="inline-flex rounded-full border border-teal-900/15 px-3 py-2 text-xs font-semibold hover:border-[#0f766e] hover:text-[#0f766e]"
            >
              전국 입양
            </Link>
            <Link
              href="/admin"
              className="inline-flex rounded-full border border-teal-900/15 px-3 py-2 text-xs font-semibold hover:border-[#0f766e] hover:text-[#0f766e]"
            >
              관리자
            </Link>
          </div>
          <p className="pt-2 text-xs text-teal-900/35">
            © {new Date().getFullYear()} {SITE.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
