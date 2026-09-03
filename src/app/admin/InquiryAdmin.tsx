"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  region: string;
  message: string;
  breedName: string;
  place: string;
  pagePath: string;
};

export default function InquiryAdmin() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      if (res.status === 401 || res.status === 403) {
        router.replace("/admin");
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me");
      if (!me.ok) {
        router.replace("/admin");
        return;
      }
      const data = await me.json();
      if (data.role !== "admin") {
        router.replace("/admin");
        return;
      }
      setReady(true);
      await load();
    })();
  }, [load, router]);

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin");
  }

  function toggleAll() {
    setSelected((cur) => (cur.length === items.length ? [] : items.map((i) => i.id)));
  }

  async function removeSelected() {
    if (!selected.length) return;
    if (!window.confirm(`선택한 문의 ${selected.length}건을 삭제할까요?`)) return;
    const res = await fetch("/api/admin/inquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error || "삭제 실패");
      return;
    }
    setMessage(`${data.deleted || selected.length}건 삭제했습니다.`);
    await load();
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <p className="text-[var(--muted)]">확인 중…</p>
      </div>
    );
  }

  return (
    <div className="admin-page-root container min-h-screen py-28 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[var(--orange)]">Dashboard</p>
          <h1 className="text-4xl font-extrabold text-[var(--navy)]">분양문의</h1>
          <p className="mt-2 text-[var(--muted)]">
            접수 <strong className="text-[var(--ink)]">{items.length}</strong>건 · 이름·연락처는 관리자만 볼 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/sample" target="_blank" className="btn-secondary !border-[var(--line)] !text-[var(--navy)]">
            입점 샘플
          </Link>
          <Link
            href="/admin/inquiries"
            className="btn-secondary !border-[var(--navy)] !bg-[var(--navy)] !text-white"
          >
            분양문의
          </Link>
          <Link href="/admin/sponsor" className="btn-secondary !border-[var(--line)] !text-[var(--navy)]">
            스폰서 관리
          </Link>
          <Link href="/admin" className="btn-secondary !border-[var(--line)] !text-[var(--navy)]">
            SEO 관리
          </Link>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="btn-secondary !border-[var(--line)] !text-[var(--navy)]"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold"
        >
          새로고침
        </button>
        <button
          type="button"
          onClick={toggleAll}
          disabled={!items.length}
          className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40"
        >
          {selected.length === items.length && items.length > 0 ? "선택 해제" : "전체 선택"}
        </button>
        <button
          type="button"
          onClick={() => void removeSelected()}
          disabled={!selected.length}
          className="rounded-xl bg-[#dc2626] px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          선택 삭제 ({selected.length})
        </button>
      </div>
      {message ? <p className="mt-3 text-sm text-[var(--sky-deep)]">{message}</p> : null}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[#f7f3ea] text-xs text-[var(--muted)]">
              <th className="w-12 px-4 py-3 font-bold">선택</th>
              <th className="px-3 py-3 font-bold">일시</th>
              <th className="px-3 py-3 font-bold">품종</th>
              <th className="px-3 py-3 font-bold">지역</th>
              <th className="px-3 py-3 font-bold">이름</th>
              <th className="px-3 py-3 font-bold">연락처</th>
              <th className="px-3 py-3 font-bold">내용</th>
              <th className="px-3 py-3 font-bold">페이지</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[var(--muted)]">
                  불러오는 중…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[var(--muted)]">
                  접수된 문의가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const checked = selected.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-[var(--line)] last:border-b-0 ${
                      checked ? "bg-[#fff7f4]" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0"
                        checked={checked}
                        onChange={() =>
                          setSelected((cur) =>
                            cur.includes(item.id) ? cur.filter((id) => id !== item.id) : [...cur, item.id]
                          )
                        }
                        aria-label={`${item.name} 문의 선택`}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 align-top text-xs text-[var(--muted)]">
                      {new Date(item.createdAt).toLocaleString("ko-KR")}
                    </td>
                    <td className="px-3 py-3 align-top font-semibold text-[var(--navy)]">{item.breedName}</td>
                    <td className="px-3 py-3 align-top">
                      {item.place}
                      {item.region && item.region !== item.place ? ` · ${item.region}` : ""}
                    </td>
                    <td className="px-3 py-3 align-top">{item.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 align-top">{item.phone}</td>
                    <td className="max-w-[280px] px-3 py-3 align-top text-[var(--muted)]">
                      <p className="whitespace-pre-wrap break-words">{item.message || "-"}</p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      {item.pagePath ? (
                        <a
                          href={item.pagePath}
                          className="break-all text-xs text-[var(--sky)] underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.pagePath}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
