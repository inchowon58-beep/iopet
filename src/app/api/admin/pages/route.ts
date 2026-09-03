import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deletePage, listPageSummaries, pagePath, PUBLIC_PAGE_LIMIT } from "@/lib/seo-pages";
import { ADMIN } from "@/lib/admin-config";

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "latest";
  const scope = searchParams.get("scope") === "all" ? "all" : "recent";
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const all = await listPageSummaries();
  const ordered =
    sort === "oldest"
      ? [...all].sort((a, b) => ((a.createdAt || "") > (b.createdAt || "") ? 1 : -1))
      : [...all].sort((a, b) => ((a.createdAt || "") < (b.createdAt || "") ? 1 : -1));
  const scoped = scope === "recent" ? ordered.slice(0, PUBLIC_PAGE_LIMIT) : ordered;
  const filtered = q
    ? scoped.filter((p) => {
        const haystack = `${p.slug} ${p.keyword} ${p.title} ${p.h1}`.toLowerCase();
        return haystack.includes(q);
      })
    : scoped;
  const size = ADMIN.pageSize;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * size;
  const items = filtered.slice(start, start + size).map((p) => ({
    slug: p.slug,
    keyword: p.keyword,
    title: p.title,
    path: pagePath(p.slug),
    createdAt: p.createdAt,
  }));
  return NextResponse.json({
    total,
    page: current,
    pageSize: size,
    totalPages,
    sort,
    scope,
    q,
    items,
  });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const slugs = Array.isArray(body.slugs)
      ? body.slugs.map((v: unknown) => String(v || "").trim()).filter(Boolean)
      : [];

    if (!slugs.length) {
      return NextResponse.json({ error: "삭제할 페이지가 없습니다." }, { status: 400 });
    }

    for (const slug of slugs) {
      await deletePage(slug);
    }

    return NextResponse.json({ ok: true, deleted: slugs.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "삭제 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
