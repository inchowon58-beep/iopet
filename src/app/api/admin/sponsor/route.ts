import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth";
import {
  GLOBAL_SPONSOR_TAG,
  getGlobalSponsor,
  saveGlobalSponsor,
  type SponsorStatus,
} from "@/lib/site-sponsor";

export async function GET() {
  const authed = await isAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const sponsor = await getGlobalSponsor();
  return NextResponse.json({ sponsor });
}

export async function PUT(req: Request) {
  const authed = await isAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const status: SponsorStatus =
      body.status === "ACTIVE" ? "ACTIVE" : "RECRUITING";

    const sponsor = await saveGlobalSponsor({
      status,
      sponsor_name: String(body.sponsor_name || ""),
      phone_number: String(body.phone_number || ""),
      link_url: String(body.link_url || ""),
      homepage_url: String(body.homepage_url || ""),
      recruiting_notice: String(body.recruiting_notice || ""),
      rental_price: String(body.rental_price || ""),
      highlight_points: Array.isArray(body.highlight_points) ? body.highlight_points : [],
      youtube_url: String(body.youtube_url || ""),
      youtube_url_2: String(body.youtube_url_2 || ""),
      sponsor_youtube_url: String(body.sponsor_youtube_url || ""),
      sponsor_youtube_url_2: String(body.sponsor_youtube_url_2 || ""),
      sponsor_youtube_channel: String(body.sponsor_youtube_channel || ""),
      sponsor_youtube_desc: String(body.sponsor_youtube_desc || ""),
    });

    revalidateTag(GLOBAL_SPONSOR_TAG);

    return NextResponse.json({ ok: true, sponsor });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "저장 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
