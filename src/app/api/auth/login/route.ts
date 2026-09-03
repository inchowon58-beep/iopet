import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSession,
  validateAdminCredentials,
} from "@/lib/auth";
import { ADMIN } from "@/lib/admin-config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username || "");
    const password = String(body.password || "");
    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }
    const token = await createSession("admin", ADMIN.username);
    const res = NextResponse.json({ ok: true, role: "admin" });
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
