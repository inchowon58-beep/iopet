import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSession,
  validateSponsorCredentials,
} from "@/lib/auth";
import { getSponsorLogin } from "@/lib/sponsor-login";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username || "");
    const password = String(body.password || "");
    if (!(await validateSponsorCredentials(username, password))) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }
    const login = await getSponsorLogin();
    const token = await createSession("sponsor", login.username);
    const res = NextResponse.json({ ok: true, role: "sponsor" });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "요청 처리 실패" }, { status: 400 });
  }
}
