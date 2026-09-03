"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, MessageCircle, PawPrint, X } from "lucide-react";
import { SITE, CTA_KAKAO } from "@/lib/site";
import { useKakaoHref } from "./KakaoHrefProvider";

const NAV = [
  { href: "/#breeds", label: "품종 고르기" },
  { href: "/guide", label: "지역 이야기" },
  { href: "/bunyang", label: "전국 입양" },
];

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-full bg-[#0f766e] text-white"
      >
        <PawPrint size={18} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[0.62rem] font-bold tracking-[0.22em] text-[#0f766e]">
          {SITE.brandEn}
        </span>
        <span
          className="mt-1 text-[1.22rem] font-semibold tracking-[-0.03em] text-[#134e4a]"
          style={{ fontFamily: '"Fraunces", "Noto Serif KR", serif' }}
        >
          {SITE.brand}
        </span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const href = useKakaoHref();

  return (
    <header className="sticky top-0 z-50 border-b border-teal-900/10 bg-white/90 text-[#134e4a] backdrop-blur">
      <div className="container flex h-[3.7rem] items-center justify-between md:h-[4.4rem]">
        <BrandMark />

        <nav className="hidden items-center gap-7 text-[0.86rem] font-semibold text-teal-900/60 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#0f766e]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full bg-[#0f766e] px-3.5 py-2 text-[0.78rem] font-bold text-white sm:inline-flex hover:bg-[#115e59]"
            >
              <MessageCircle size={14} />
              {CTA_KAKAO}
            </a>
          ) : null}
          <button
            type="button"
            className="inline-flex p-2 text-[#134e4a] lg:hidden"
            aria-label="메뉴"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-teal-900/10 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-teal-50"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-3 py-2.5 text-sm font-bold text-white"
                onClick={() => setOpen(false)}
              >
                <MessageCircle size={16} />
                {CTA_KAKAO}
              </a>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}
