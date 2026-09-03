import { NextResponse } from "next/server";
import { addInquiry } from "@/lib/inquiries";

function clean(v: unknown, max: number): string {
  return String(v || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (clean(body.company, 40)) {
      return NextResponse.json({ ok: true });
    }
    const name = clean(body.name, 40);
    const phone = clean(body.phone, 30);
    const region = clean(body.region, 60);
    const message = clean(body.message, 1000);
    const breedName = clean(body.breedName, 40);
    const place = clean(body.place, 60);
    const pagePath = clean(body.pagePath, 180);
    if (!name || !phone || !breedName) {
      return NextResponse.json({ error: "이름, 연락처를 입력해 주세요." }, { status: 400 });
    }
    if (!/[0-9]{8,}/.test(phone.replace(/\D/g, ""))) {
      return NextResponse.json({ error: "연락처를 확인해 주세요." }, { status: 400 });
    }
    await addInquiry({ name, phone, region, message, breedName, place, pagePath });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "저장 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
