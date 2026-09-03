import Link from "next/link";
import { Camera, Youtube } from "lucide-react";
import { CTA_GALLERY, CTA_YOUTUBE, CTA_YOUTUBE_HEADING } from "@/lib/site";
import type { SiteSponsor } from "@/lib/site-sponsor-shared";
import {
  sponsorYoutubeUrl,
  youtubeEmbedUrl,
  youtubeVideoId,
  youtubeWatchUrl,
} from "@/lib/site-sponsor-shared";

export default function DoodleGalleryCta({
  className = "",
  sponsor,
  slot = 1,
}: {
  className?: string;
  sponsor?: SiteSponsor;
  slot?: 1 | 2;
}) {
  const videoId = sponsor ? youtubeVideoId(sponsorYoutubeUrl(sponsor, slot)) : null;

  if (!videoId) {
    return (
      <div
        className={`my-8 rounded-[var(--radius-lg)] border border-[var(--coral)] bg-[var(--coral-soft)] p-5 text-center md:p-6 ${className}`}
      >
        <p className="text-sm font-semibold text-[var(--coral-deep)]">분양 사진</p>
        <p className="mt-1 text-lg font-extrabold text-[var(--navy)]">
          분양 중인 메인쿤 사진을 먼저 보세요
        </p>
        <Link href="/#gallery" className="btn-primary mt-4 inline-flex">
          <Camera size={18} />
          {CTA_GALLERY}
        </Link>
      </div>
    );
  }

  const watchHref = youtubeWatchUrl(videoId);
  const isActive = sponsor?.status === "ACTIVE";
  const channel = (sponsor?.sponsor_youtube_channel || "").trim();
  const desc = (sponsor?.sponsor_youtube_desc || "").trim();

  return (
    <div
      className={`my-8 rounded-[var(--radius-lg)] border border-[var(--coral)] bg-[var(--coral-soft)] p-4 md:p-5 ${className}`}
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,17.5rem)_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-[var(--radius)] bg-[#243056] shadow-[0_10px_24px_rgba(36,48,86,0.18)]">
          <iframe
            src={youtubeEmbedUrl(videoId)}
            title={isActive && channel ? `${channel} 유튜브 영상` : CTA_YOUTUBE_HEADING}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-[var(--coral-deep)]">분양 안내</p>
          <p className="mt-1 text-lg font-extrabold text-[var(--navy)]">{CTA_YOUTUBE_HEADING}</p>
          {isActive ? (
            <>
              {channel && (
                <p className="mt-2 text-base font-bold text-[var(--sky-deep)]">{channel}</p>
              )}
              {desc && <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{desc}</p>}
            </>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              입점 대기 중에는 협회에서 안내하는 영상을 보여 드립니다. 입점 시 입점업체가 등록한
              유튜브 영상이 이 자리에 등록됩니다.
            </p>
          )}
          <a
            href={watchHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4 inline-flex"
          >
            <Youtube size={18} />
            {CTA_YOUTUBE}
          </a>
        </div>
      </div>
    </div>
  );
}
