"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { SiteSponsor, SponsorStatus } from "@/lib/site-sponsor-shared";

const HIGHLIGHT_SLOT_COUNT = 5;

function padHighlightPoints(points: string[] | undefined): string[] {
  const next = (points || []).slice(0, HIGHLIGHT_SLOT_COUNT);
  while (next.length < HIGHLIGHT_SLOT_COUNT) next.push("");
  return next;
}

export default function SponsorAdminClient() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<Omit<SiteSponsor, "id">>({
    status: "RECRUITING",
    sponsor_name: "",
    phone_number: "",
    link_url: "",
    homepage_url: "",
    recruiting_notice: "전국 메인쿤분양 입점 제휴 · 사이트 임대 모집 중",
    rental_price: "30만원",
    highlight_points: [
      "확인할 업체 항목 공개",
      "주의사항 안내",
      "전국 상담 가능",
      "방문·상담 일정 안내",
      "계약 전 체크리스트",
    ],
    youtube_url: "",
    youtube_url_2: "",
    sponsor_youtube_url: "",
    sponsor_youtube_url_2: "",
    sponsor_youtube_channel: "",
    sponsor_youtube_desc: "",
  });

  const loadSponsor = useCallback(async () => {
    const me = await fetch("/api/auth/me");
    if (me.status === 401) {
      setAuthed(false);
      return;
    }
    const session = await me.json().catch(() => ({}));
    if (session.role === "sponsor") {
      window.location.replace("/admin");
      return;
    }
    const res = await fetch("/api/admin/sponsor");
    if (res.status === 401 || res.status === 403) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    if (data.sponsor) {
      const { id: _id, ...rest } = data.sponsor as SiteSponsor;
      setForm({
        ...rest,
        homepage_url: rest.homepage_url || "",
        youtube_url: rest.youtube_url || "",
        youtube_url_2: rest.youtube_url_2 || "",
        sponsor_youtube_url: rest.sponsor_youtube_url || "",
        sponsor_youtube_url_2: rest.sponsor_youtube_url_2 || "",
        sponsor_youtube_channel: rest.sponsor_youtube_channel || "",
        sponsor_youtube_desc: rest.sponsor_youtube_desc || "",
        highlight_points: padHighlightPoints(rest.highlight_points),
      });
    }
    setAuthed(true);
  }, []);

  useEffect(() => {
    (async () => {
      setChecking(true);
      await loadSponsor();
      setChecking(false);
    })();
  }, [loadSponsor]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setLoginError("로그인에 실패했습니다.");
      return;
    }
    await loadSponsor();
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/sponsor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "저장 실패");
      if (data.sponsor) {
        const { id: _id, ...rest } = data.sponsor as SiteSponsor;
        setForm({
          ...rest,
          homepage_url: rest.homepage_url || "",
          youtube_url: rest.youtube_url || "",
          youtube_url_2: rest.youtube_url_2 || "",
          sponsor_youtube_url: rest.sponsor_youtube_url || "",
          sponsor_youtube_url_2: rest.sponsor_youtube_url_2 || "",
          sponsor_youtube_channel: rest.sponsor_youtube_channel || "",
          sponsor_youtube_desc: rest.sponsor_youtube_desc || "",
          highlight_points: padHighlightPoints(rest.highlight_points),
        });
      }
      setMessage("저장되었습니다. 전국 모든 페이지에 즉시 반영됩니다.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <div className="container min-h-screen py-28 text-center text-[var(--muted)]">
        확인 중…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-20">
        <form onSubmit={onLogin} className="soft-card w-full max-w-sm p-8">
          <h1 className="text-2xl font-extrabold text-[var(--navy)]">스폰서 관리</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">관리자 로그인이 필요합니다.</p>
          <div className="field mt-6">
            <label htmlFor="username">아이디</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button type="submit" className="btn-primary mt-4 w-full">
            로그인
          </button>
          <Link href="/admin" className="mt-4 block text-center text-sm text-[var(--muted)] underline">
            일반 관리자 페이지
          </Link>
        </form>
      </div>
    );
  }

  const isRecruiting = form.status === "RECRUITING";
  const highlightPoints = padHighlightPoints(form.highlight_points);

  return (
    <div className="admin-page-root container min-h-screen py-24 pb-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[var(--sky)]">Global Sponsor</p>
          <h1 className="text-3xl font-extrabold text-[var(--navy)]">전국 임대 스폰서 관리</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            스위치 한 번으로 전국 5,000+ 웹문서의 중간 카드·하단 바가 일괄 반영됩니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/sample"
            target="_blank"
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
          >
            입점 샘플 미리보기
          </Link>
          <Link
            href="/admin/inquiries"
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
          >
            분양문의
          </Link>
          <Link href="/admin" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold">
            웹문서 관리
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
          >
            로그아웃
          </button>
        </div>
      </div>

      <form onSubmit={onSave} className="soft-card mx-auto max-w-xl overflow-visible p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--sky-soft)] p-4">
          <div>
            <p className="font-bold text-[var(--navy)]">
              {isRecruiting ? "전체 모집 중" : "전체 임대 실행"}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {isRecruiting
                ? "제휴·임대 모집 문구가 노출됩니다."
                : "광고주 메인쿤분양 제휴가 노출됩니다."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!isRecruiting}
            onClick={() =>
              setForm((f) => ({
                ...f,
                status: (f.status === "RECRUITING" ? "ACTIVE" : "RECRUITING") as SponsorStatus,
              }))
            }
            className={`relative h-8 w-14 shrink-0 rounded-full transition ${
              isRecruiting ? "bg-[var(--muted)]" : "bg-[var(--sky)]"
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                isRecruiting ? "left-1" : "left-7"
              }`}
            />
          </button>
        </div>

        <div className="field mt-6">
          <label htmlFor="phone_number">{isRecruiting ? "제휴 문의 전화번호" : "대표 전화번호"}</label>
          <input
            id="phone_number"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            placeholder="0505-000-0000"
          />
        </div>
        <div className="field">
          <label htmlFor="link_url">
            {isRecruiting ? "제휴 문의 카카오톡 URL" : "카카오톡 상담 URL"}
          </label>
          <input
            id="link_url"
            value={form.link_url}
            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            placeholder="https://open.kakao.com/o/..."
          />
          <p className="mt-2 text-xs text-[var(--muted)]">
            비워 두면 사이트에 카카오 버튼이 나오지 않습니다. 제휴(입점 전)는 기본 카톡, 입점 후에는 업체 카톡을 넣으세요.
          </p>
        </div>
        <div className="field">
          <label htmlFor="homepage_url">홈페이지 URL</label>
          <input
            id="homepage_url"
            value={form.homepage_url || ""}
            onChange={(e) => setForm({ ...form, homepage_url: e.target.value })}
            placeholder="https://www.example.com"
          />
        </div>

        {isRecruiting ? (
          <>
            <div className="field">
              <label htmlFor="youtube_url">유튜브 영상 주소 1 (상단)</label>
              <input
                id="youtube_url"
                value={form.youtube_url || ""}
                onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="field">
              <label htmlFor="youtube_url_2">유튜브 영상 주소 2 (본문 중간)</label>
              <input
                id="youtube_url_2"
                value={form.youtube_url_2 || ""}
                onChange={(e) => setForm({ ...form, youtube_url_2: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                SEO 페이지 상단·중간에 각각 나갑니다. 하나만 넣으면 두 자리 모두 같은 영상이
                나갑니다.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="sponsor_youtube_url">입점업체 유튜브 영상 주소 1 (상단)</label>
              <input
                id="sponsor_youtube_url"
                value={form.sponsor_youtube_url || ""}
                onChange={(e) => setForm({ ...form, sponsor_youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="field">
              <label htmlFor="sponsor_youtube_url_2">입점업체 유튜브 영상 주소 2 (본문 중간)</label>
              <input
                id="sponsor_youtube_url_2"
                value={form.sponsor_youtube_url_2 || ""}
                onChange={(e) => setForm({ ...form, sponsor_youtube_url_2: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="field">
              <label htmlFor="sponsor_youtube_channel">유튜브 채널명</label>
              <input
                id="sponsor_youtube_channel"
                value={form.sponsor_youtube_channel || ""}
                onChange={(e) => setForm({ ...form, sponsor_youtube_channel: e.target.value })}
                placeholder="예: 아이오펫 안내"
              />
            </div>
            <div className="field">
              <label htmlFor="sponsor_youtube_desc">유튜브 간략 설명</label>
              <textarea
                id="sponsor_youtube_desc"
                rows={3}
                value={form.sponsor_youtube_desc || ""}
                onChange={(e) => setForm({ ...form, sponsor_youtube_desc: e.target.value })}
                placeholder="예: 확인할 항목과 주의사항을 짧게 정리한 안내 영상입니다."
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                하나만 넣으면 두 자리 모두 같은 영상이 나갑니다. 채널명·설명은 영상 오른쪽에
                함께 노출됩니다.
              </p>
            </div>
          </>
        )}

        {!isRecruiting && (
          <>
            <div className="field mt-6">
              <label htmlFor="sponsor_name">업체명</label>
              <input
                id="sponsor_name"
                value={form.sponsor_name}
                onChange={(e) => setForm({ ...form, sponsor_name: e.target.value })}
                placeholder="예: 아이오펫 입양안내"
              />
            </div>
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-[var(--navy)]">특징 배지 (최대 5개)</p>
              <div className="space-y-3">
                {highlightPoints.map((point, index) => (
                  <div className="field" key={index}>
                    <label htmlFor={`highlight-${index}`}>특징 {index + 1}</label>
                    <input
                      id={`highlight-${index}`}
                      value={point}
                      onChange={(e) => {
                        const next = [...highlightPoints];
                        next[index] = e.target.value;
                        setForm({ ...form, highlight_points: next });
                      }}
                      placeholder={index === 0 ? "예: 확인할 업체 항목 공개" : "예: 주의사항 안내"}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {isRecruiting && (
          <>
            <div className="field mt-6">
              <label htmlFor="recruiting_notice">모집 안내 문구</label>
              <textarea
                id="recruiting_notice"
                rows={3}
                value={form.recruiting_notice}
                onChange={(e) => setForm({ ...form, recruiting_notice: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="rental_price">노출 비용 문구</label>
              <input
                id="rental_price"
                value={form.rental_price}
                onChange={(e) => setForm({ ...form, rental_price: e.target.value })}
                placeholder="예: 30만원"
              />
            </div>
          </>
        )}

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.includes("저장되었") ? "text-green-700" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary mt-8 w-full bg-[var(--coral)] py-4 text-base font-extrabold text-white shadow-[0_8px_20px_rgba(196,92,74,0.28)]"
          disabled={saving}
        >
          {saving ? "저장 중…" : "저장 · 전국 일괄 반영"}
        </button>
      </form>
    </div>
  );
}
