"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SponsorLoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("sponsor");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/auth/sponsor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-20">
      <form onSubmit={onLogin} className="soft-card w-full max-w-sm p-8">
        <p className="text-sm font-bold text-[var(--sky)]">Sponsor</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[var(--navy)]">스폰서 로그인</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          스폰서 계정으로 로그인합니다.
        </p>
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary mt-4 w-full" disabled={saving}>
          {saving ? "로그인 중…" : "로그인"}
        </button>
        <Link href="/admin" className="mt-4 block text-center text-sm text-[var(--muted)] underline">
          관리자 로그인
        </Link>
      </form>
    </div>
  );
}
