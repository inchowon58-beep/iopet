import Image from "next/image";
import type { SeoPage } from "@/lib/seo-pages";
import { galleryAlt, isRealImage, placeholderIndexFrom } from "@/lib/images";
import { SITE } from "@/lib/site";
import ImageSlot from "./ImageSlot";

type Props = {
  page: SeoPage;
  imageSrc: string;
};

export default function GuideHeroThumb({ page, imageSrc }: Props) {
  const badge = page.heroBadge || "분양 안내";
  const line1 = page.heroTitleLine1 || page.keyword;
  const line2 = page.heroTitleLine2 || SITE.brand;
  const bar =
    page.heroBar || page.heroSubtitle || "진열된 얼굴의 크기·기질·분양가를 먼저 맞춰 보세요";
  const real = isRealImage(imageSrc);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[720px] overflow-hidden rounded-[var(--radius)] shadow-[0_18px_44px_rgba(36,48,86,0.22)] ring-1 ring-[#d4a017]/35">
      {real ? (
        <Image
          src={imageSrc}
          alt={galleryAlt(page.keyword, 1)}
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="(max-width:768px) 100vw, 720px"
        />
      ) : (
        <ImageSlot index={placeholderIndexFrom(imageSrc || 1)} fill label={galleryAlt(page.keyword, 1)} />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,48,86,0.12)_0%,rgba(18,22,36,0.62)_100%)]" />

      <div className="absolute inset-0 flex flex-col items-start justify-end px-7 pb-8 text-left md:px-10 md:pb-10">
        <span className="rounded-full bg-white/92 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--coral-deep)] md:text-xs">
          {badge}
        </span>

        <h1 className="mt-4 max-w-[16ch] text-[clamp(1.7rem,6vw,2.9rem)] font-bold leading-[1.25] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]">
          <span className="block">{line1}</span>
          <span className="mt-1 block text-[#f4ead0]">{line2}</span>
        </h1>

        <p className="mt-5 max-w-md rounded-[0.2rem] bg-black/25 px-4 py-3 text-[0.8rem] font-medium leading-snug text-white/92 md:text-[0.95rem]">
          {bar}
        </p>
      </div>
    </div>
  );
}
