import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { assembleSeoPage, generateWithGemini } from "@/lib/gemini";
import { generateTemplateContent } from "@/lib/template-content";
import { savePage, pagePath } from "@/lib/seo-pages";
import { SITE } from "@/lib/site";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const keyword = String(body.keyword || "").trim();
    if (!keyword) {
      return NextResponse.json({ error: "키워드를 입력하세요." }, { status: 400 });
    }
    const mode = String(body.mode || "gemini").toLowerCase();
    let page;
    if (mode === "template") {
      page = generateTemplateContent(keyword, Date.now() % 1000);
    } else {
      const partial = await generateWithGemini(keyword, body.apiKey);
      page = assembleSeoPage(partial);
    }
    await savePage(page);

    const pageUrl = `${SITE.siteUrl.replace(/\/$/, "")}/guide/${encodeURIComponent(page.slug)}`;

    return NextResponse.json({
      ok: true,
      slug: page.slug,
      path: pagePath(page.slug),
      title: page.title,
      url: pageUrl,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "발행 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
