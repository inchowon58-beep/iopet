import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // 표준 URL은 끝 슬래시 없음. 슬래시 있는 요청은 308/301 하지 않고 그대로 200.
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
    loader: "custom",
    loaderFile: "./image-loader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "image.cattery.co.kr" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
