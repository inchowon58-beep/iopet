import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 호스트(www/non-www)·HTTP→HTTPS 전환은 여기서 301/308 하지 않습니다.
 * 끝 슬래시만 내부 rewrite 해서 수집기가 200을 받도록 합니다.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "") || "/";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
