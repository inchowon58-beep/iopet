import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getSponsorLogin, saveSponsorLogin } from "@/lib/sponsor-login";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const login = await getSponsorLogin();
  return NextResponse.json({ username: login.username, password: login.password });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const password = String(body.password || "").trim();
    if (password.length < 4) {
      return NextResponse.json({ error: "비밀번호는 4자 이상이어야 합니다." }, { status: 400 });
    }
    const login = await saveSponsorLogin({ password });
    return NextResponse.json({ ok: true, username: login.username });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "저장 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
