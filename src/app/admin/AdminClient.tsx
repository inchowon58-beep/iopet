"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

const PAGE_SIZE = 25;

type PageItem = {
  slug: string;
  keyword: string;
  title: string;
  path: string;
  createdAt: string;
};

export default function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<"admin" | "sponsor" | null>(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [keyword, setKeyword] = useState("메인쿤분양");
  const [mode, setMode] = useState<"gemini" | "template">("template");
  const [apiKey, setApiKey] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<PageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSort, setPageSort] = useState<"latest" | "oldest">("latest");
  const [pageScope, setPageScope] = useState<"recent" | "all">("recent");
  const [pageQuery, setPageQuery] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");
  const [selectedPageSlugs, setSelectedPageSlugs] = useState<string[]>([]);
  const [deletingPages, setDeletingPages] = useState(false);
  const [sponsorPassword, setSponsorPassword] = useState("");
  const [sponsorPwMessage, setSponsorPwMessage] = useState("");
  const [savingSponsorPw, setSavingSponsorPw] = useState(false);

  const isSponsor = role === "sponsor";

  function absolutePageUrl(path: string) {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://iopet.cattery.co.kr").replace(
      /\/$/,
      ""
    );
    if (!path) return `${base}/guide`;
    if (path.startsWith("http")) return path;
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
  }

  async function copyPageUrl(path: string, slug: string) {
    const url = absolutePageUrl(path);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(""), 1800);
    } catch {
      window.prompt("주소를 복사하세요", url);
    }
  }

  const loadPages = useCallback(
    async (p = 1, sort = pageSort, scope = pageScope, q = pageQuery) => {
      const query = encodeURIComponent(q);
      const res = await fetch(`/api/admin/pages?page=${p}&sort=${sort}&scope=${scope}&q=${query}`);
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setPageSort(data.sort === "oldest" ? "oldest" : "latest");
      setPageScope(data.scope === "all" ? "all" : "recent");
      setPageQuery(data.q || "");
      setSelectedPageSlugs([]);
      setAuthed(true);
    },
    [pageQuery, pageScope, pageSort]
  );

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) return;
        const me = await meRes.json();
        setRole(me.role === "sponsor" ? "sponsor" : "admin");
        setAuthed(true);
        if (me.role === "admin") {
          await loadPages(1);
          const pwRes = await fetch("/api/admin/sponsor-login");
          if (pwRes.ok) {
            const pw = await pwRes.json();
            setSponsorPassword(pw.password || "");
          }
        }
      } finally {
        setChecking(false);
      }
    })();
  }, [loadPages]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoginError(data.error || "로그인 실패");
      return;
    }
    setAuthed(true);
    setRole("admin");
    await loadPages(1);
    const pwRes = await fetch("/api/admin/sponsor-login");
    if (pwRes.ok) {
      const pw = await pwRes.json();
      setSponsorPassword(pw.password || "");
    }
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
    setRole(null);
  }

  async function saveSponsorPassword(e: FormEvent) {
    e.preventDefault();
    setSavingSponsorPw(true);
    setSponsorPwMessage("");
    try {
      const res = await fetch("/api/admin/sponsor-login", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: sponsorPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "저장 실패");
      setSponsorPwMessage("스폰서 로그인 비밀번호가 저장되었습니다.");
    } catch (err) {
      setSponsorPwMessage(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSavingSponsorPw(false);
    }
  }

  async function onPublish(e: FormEvent) {
    e.preventDefault();
    setPublishing(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          mode,
          apiKey: apiKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "발행 실패");
      setMessage(`발행 완료: ${data.path}`);
      await loadPages(1);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "발행 실패");
    } finally {
      setPublishing(false);
    }
  }

  function togglePageSelect(slug: string) {
    setSelectedPageSlugs((prev) =>
      prev.includes(slug) ? prev.filter((v) => v !== slug) : [...prev, slug]
    );
  }

  function toggleSelectAllPages() {
    if (!items.length) {
      setSelectedPageSlugs([]);
      return;
    }
    setSelectedPageSlugs((prev) =>
      prev.length === items.length ? [] : items.map((item) => item.slug)
    );
  }

  async function deleteSelectedPages() {
    if (!selectedPageSlugs.length || deletingPages) return;
    const ok = window.confirm(`선택한 SEO 페이지 ${selectedPageSlugs.length}건을 삭제할까요?`);
    if (!ok) return;

    setDeletingPages(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/pages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: selectedPageSlugs }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "페이지 삭제 실패");
      setMessage(`${data.deleted || selectedPageSlugs.length}건 삭제되었습니다.`);
      await loadPages(page);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "페이지 삭제 실패");
    } finally {
      setDeletingPages(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <p className="text-[var(--muted)]">확인 중…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-24">
        <form
          onSubmit={onLogin}
          className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
        >
          <p className="text-sm font-bold text-[var(--orange)]">Admin</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--navy)]">관리자 로그인</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">아이오펫 · SEO 발행 관리</p>
          <label className="mt-6 block text-sm font-semibold">
            아이디
            <input
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            비밀번호
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {loginError && <p className="mt-3 text-sm text-red-700">{loginError}</p>}
          <button type="submit" className="btn-primary mt-6 w-full">
            로그인
          </button>
          <Link href="/admin/sponsor-login" className="mt-4 block text-center text-sm text-[var(--muted)] underline">
            스폰서 로그인
          </Link>
          <Link href="/" className="mt-2 block text-center text-sm text-[var(--muted)]">
            ← 사이트로 돌아가기
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page-root container min-h-screen py-28 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[var(--orange)]">
            {isSponsor ? "Sponsor" : "Dashboard"}
          </p>
          <h1 className="text-4xl font-extrabold text-[var(--navy)]">
            {isSponsor ? "스폰서" : "관리자"}
          </h1>
          {!isSponsor && (
            <p className="mt-2 text-[var(--muted)]">
              SEO 글 <strong className="text-[var(--ink)]">{total}</strong>건
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isSponsor ? (
            <span className="btn-secondary pointer-events-none cursor-not-allowed opacity-40 !text-[var(--navy)] !border-[var(--line)]">
              입점 샘플
            </span>
          ) : (
            <>
              <Link
                href="/sample"
                target="_blank"
                className="btn-secondary !text-[var(--navy)] !border-[var(--line)]"
              >
                입점 샘플
              </Link>
              <Link
                href="/admin/inquiries"
                className="btn-secondary !text-[var(--navy)] !border-[var(--line)]"
              >
                분양문의
              </Link>
            </>
          )}
          {isSponsor ? (
            <span className="btn-secondary pointer-events-none cursor-not-allowed opacity-40 !text-[var(--navy)] !border-[var(--line)]">
              스폰서 관리
            </span>
          ) : (
            <Link
              href="/admin/sponsor"
              className="btn-secondary !text-[var(--navy)] !border-[var(--line)]"
            >
              스폰서 관리
            </Link>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="btn-secondary !text-[var(--navy)] !border-[var(--line)]"
          >
            로그아웃
          </button>
        </div>
      </div>

      {isSponsor && (
        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">
          <h2 className="text-xl font-extrabold text-[var(--navy)]">상담 안내</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            상담 신청 양식은 없습니다. 스폰서 관리에서 카카오톡 URL을 등록하면 사이트에 상담 버튼이
            나타납니다.
          </p>
        </div>
      )}

      {!isSponsor && (
        <>
          <form
            onSubmit={saveSponsorPassword}
            className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-4 md:p-5"
          >
            <p className="text-sm font-extrabold text-[var(--navy)]">스폰서 로그인 비밀번호</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              아이디는 <strong>sponsor</strong> 입니다.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="min-w-[12rem] flex-1">
                <label htmlFor="sponsor-pw" className="text-xs">
                  비밀번호
                </label>
                <input
                  id="sponsor-pw"
                  type="text"
                  value={sponsorPassword}
                  onChange={(e) => setSponsorPassword(e.target.value)}
                  minLength={4}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary shrink-0 bg-[var(--coral)] px-5 py-3 text-white"
                disabled={savingSponsorPw}
              >
                {savingSponsorPw ? "저장 중…" : "비밀번호 저장"}
              </button>
            </div>
            {sponsorPwMessage && (
              <p className="mt-2 text-sm text-[var(--sky-deep)]">{sponsorPwMessage}</p>
            )}
          </form>

          <form
            onSubmit={onPublish}
            className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6"
          >
            <h2 className="text-2xl font-extrabold text-[var(--navy)]">SEO 1건 발행</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              대량 발행은 tools/webdoc 웹문서 발행기를 사용하세요.
            </p>
            <label className="mt-4 block text-sm font-semibold">
              키워드
              <input
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="예: 수원메인쿤분양"
                required
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === "template"}
                  onChange={() => setMode("template")}
                />
                기본 양식 (API 없음)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === "gemini"}
                  onChange={() => setMode("gemini")}
                />
                Gemini
              </label>
            </div>
            {mode === "gemini" && (
              <label className="mt-4 block text-sm font-semibold">
                Gemini API Key (선택 · 서버 .env 우선)
                <input
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="비우면 GEMINI_API_KEY 사용"
                />
              </label>
            )}
            <button type="submit" className="btn-primary mt-5" disabled={publishing}>
              {publishing ? "발행 중…" : "발행하기"}
            </button>
            {message && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--muted)]">{message}</p>
            )}
          </form>

          <div className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--navy)]">발행된 페이지</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  기본은 최근 100건만 보이며, 검색과 전체 보기 전환이 가능합니다.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadPages(1, pageSort, "recent", pageQuery)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    pageScope === "recent"
                      ? "bg-[var(--green)] text-white"
                      : "border border-[var(--line)] bg-white text-[var(--navy)]"
                  }`}
                >
                  최근 100건
                </button>
                <button
                  type="button"
                  onClick={() => loadPages(1, pageSort, "all", pageQuery)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    pageScope === "all"
                      ? "bg-[var(--green)] text-white"
                      : "border border-[var(--line)] bg-white text-[var(--navy)]"
                  }`}
                >
                  전체 보기
                </button>
                <button
                  type="button"
                  onClick={() => loadPages(1, "latest", pageScope, pageQuery)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    pageSort === "latest"
                      ? "bg-[var(--navy)] text-white"
                      : "border border-[var(--line)] bg-white text-[var(--navy)]"
                  }`}
                >
                  최신순
                </button>
                <button
                  type="button"
                  onClick={() => loadPages(1, "oldest", pageScope, pageQuery)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    pageSort === "oldest"
                      ? "bg-[var(--navy)] text-white"
                      : "border border-[var(--line)] bg-white text-[var(--navy)]"
                  }`}
                >
                  오래된순
                </button>
                <button
                  type="button"
                  onClick={toggleSelectAllPages}
                  disabled={items.length === 0}
                  className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                >
                  {selectedPageSlugs.length === items.length && items.length > 0
                    ? "선택 해제"
                    : "전체 선택"}
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedPages}
                  disabled={!selectedPageSlugs.length || deletingPages}
                  className="rounded-lg bg-[#dc2626] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                >
                  {deletingPages ? "삭제 중…" : `선택 삭제 (${selectedPageSlugs.length})`}
                </button>
              </div>
            </div>
            <form
              className="mt-3 flex flex-wrap items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void loadPages(1, pageSort, pageScope, pageQuery);
              }}
            >
              <input
                className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
                value={pageQuery}
                onChange={(e) => setPageQuery(e.target.value)}
                placeholder="키워드, 제목, slug 검색"
              />
              <button type="submit" className="rounded-lg bg-[var(--navy)] px-3 py-2 text-xs font-bold text-white">
                검색
              </button>
              {pageQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setPageQuery("");
                    void loadPages(1, pageSort, pageScope, "");
                  }}
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--navy)]"
                >
                  초기화
                </button>
              )}
            </form>
            <ul className="mt-4 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
              {items.length === 0 && (
                <li className="px-4 py-6 text-sm text-[var(--muted)]">아직 발행된 글이 없습니다.</li>
              )}
              {items.map((item, i) => {
                const no = (page - 1) * PAGE_SIZE + i + 1;
                const selected = selectedPageSlugs.includes(item.slug);
                return (
                  <li
                    key={item.slug}
                    className={`grid grid-cols-[22px_40px_minmax(0,1fr)] gap-3 px-4 py-3 md:grid-cols-[22px_40px_minmax(0,1fr)_120px] md:items-center ${
                      selected ? "bg-[#fff7f4]" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--coral)] md:mt-0"
                      checked={selected}
                      onChange={() => togglePageSelect(item.slug)}
                      aria-label={`${item.title} 선택`}
                    />
                    <span className="text-lg font-bold text-[var(--orange)]">
                      {String(no).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs text-[var(--orange)]">{item.keyword}</div>
                      <a
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate font-medium text-[var(--navy)] hover:underline"
                      >
                        {item.title}
                      </a>
                      <div className="truncate text-xs text-[var(--muted)]">
                        {absolutePageUrl(item.path)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyPageUrl(item.path, item.slug)}
                      className="col-span-full justify-self-start rounded-full border border-[var(--orange)] px-3 py-1.5 text-xs font-semibold text-[var(--orange)] md:col-span-1 md:justify-self-end"
                    >
                      {copiedSlug === item.slug ? "복사됨" : "주소복사하기"}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => loadPages(n, pageSort, pageScope, pageQuery)}
                  className={`min-w-9 rounded-full px-2 py-1 text-sm ${
                    n === page
                      ? "bg-[var(--green)] text-white"
                      : "rounded-xl border border-[var(--line)] bg-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
