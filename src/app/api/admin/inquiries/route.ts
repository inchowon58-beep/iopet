import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteInquiries, listInquiries } from "@/lib/inquiries";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const items = await listInquiries();
  return NextResponse.json({ items, total: items.length });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const ids = Array.isArray(body.ids)
      ? body.ids.map((v: unknown) => String(v || "").trim()).filter(Boolean)
      : [];
    if (!ids.length) {
      return NextResponse.json({ error: "삭제할 문의가 없습니다." }, { status: 400 });
    }
    const deleted = await deleteInquiries(ids);
    return NextResponse.json({ ok: true, deleted });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "삭제 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
