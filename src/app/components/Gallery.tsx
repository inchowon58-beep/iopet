import { SITE } from "@/lib/site";
import ImageSlot from "./ImageSlot";
import { GALLERY_FEATURED, GALLERY_GRID, galleryAlt } from "@/lib/images";

export default function Gallery() {
  return (
    <section id="gallery" className="section">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-kicker">ON THE FLOOR</p>
          <h2 className="mt-3 text-3xl font-bold text-[var(--navy)] md:text-4xl">
            분양 중인 메인쿤
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            {SITE.brand}에 지금 진열된 아이들입니다. 얼굴이 남는 아이가 있으면 이어서 물어보시면
            됩니다.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
          {GALLERY_FEATURED.map((fileNo) => (
            <div
              key={`feat-${fileNo}`}
              className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] sm:col-span-1 md:col-span-2 md:aspect-[16/10]"
            >
              <ImageSlot index={fileNo} fill label={galleryAlt(fileNo)} />
            </div>
          ))}
          {GALLERY_GRID.map((fileNo) => (
            <div
              key={`grid-${fileNo}`}
              className="relative aspect-square overflow-hidden rounded-[var(--radius)]"
            >
              <ImageSlot index={fileNo} fill label={galleryAlt(fileNo)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
