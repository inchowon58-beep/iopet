import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/site";
import { publicOrigin } from "@/lib/public-url";
import { faqJsonLd, howToJsonLd, orgJsonLd } from "@/lib/faq-data";
import { getGlobalSponsor } from "@/lib/site-sponsor";
import { publicKakaoUrl } from "@/lib/site-sponsor-shared";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SponsorStickyFooter from "./components/SponsorStickyFooter";
import SponsorFooterGate from "./components/SponsorFooterGate";
import { KakaoHrefProvider } from "./components/KakaoHrefProvider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const origin = await publicOrigin();
  return {
    metadataBase: new URL(origin),
    title: {
      default: SITE.title,
      template: `%s | ${SITE.brand}`,
    },
    description: SITE.description,
    keywords: [...SITE.keywords],
    authors: [{ name: SITE.brand }],
    creator: SITE.brand,
    publisher: SITE.brand,
    alternates: { canonical: origin },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: origin,
      siteName: SITE.name,
      title: SITE.title,
      description: SITE.description,
      ...(SITE.ogImage
        ? {
            images: [
              {
                url: SITE.ogImage,
                width: 1200,
                height: 630,
                alt: SITE.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: SITE.title,
      description: SITE.description,
      ...(SITE.ogImage ? { images: [SITE.ogImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    other: {
      "msapplication-TileColor": SITE.themeColor,
      "naver-site-verification": SITE.naverSiteVerification,
    },
  };
}

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const origin = await publicOrigin();
  const sponsor = await getGlobalSponsor();
  const kakaoHref = publicKakaoUrl(sponsor);
  const sponsorPhone =
    sponsor.status === "ACTIVE" && sponsor.phone_number.trim()
      ? sponsor.phone_number.trim()
      : undefined;
  const org = orgJsonLd(origin, sponsorPhone);
  const faq = faqJsonLd();
  const howTo = howToJsonLd(origin);
  return (
    <html lang="ko">
      <head>
        <meta name="naver-site-verification" content={SITE.naverSiteVerification} />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        {SITE.imageBase ? <link rel="preconnect" href={new URL(SITE.imageBase).origin} /> : null}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Noto+Serif+KR:wght@500;600;700&display=swap"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE.name} RSS`}
          href="/rss.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE.name} Feed`}
          href="/feed"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
        />
      </head>
      <body>
        <KakaoHrefProvider href={kakaoHref}>
          <Header />
          <main>{children}</main>
          <Footer />
          <SponsorFooterGate>
            <SponsorStickyFooter />
          </SponsorFooterGate>
        </KakaoHrefProvider>
      </body>
    </html>
  );
}
