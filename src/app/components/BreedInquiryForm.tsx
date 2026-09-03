"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useKakaoHref } from "./KakaoHrefProvider";
import { CTA_KAKAO } from "@/lib/site";

export default function BreedInquiryForm({
  breedName,
  place,
  cta,
  pagePath,
}: {
  breedName: string;
  place: string;
  cta: string;
  pagePath: string;
}) {
  const kakao = useKakaoHref();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      region: String(data.get("region") || place).trim(),
      message: String(data.get("message") || "").trim(),
      company: String(data.get("company") || "").trim(),
      breedName,
      place,
      pagePath,
    };
    setSaving(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "접수에 실패했습니다.");
      setSent(true);
      form.reset();
      if (kakao) window.open(kakao, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "접수에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="bl-form" onSubmit={onSubmit}>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="bl-hp" aria-hidden />
      <div className="bl-form-grid">
        <label>
          이름
          <input name="name" type="text" autoComplete="name" placeholder="성함" required />
        </label>
        <label>
          연락처
          <input name="phone" type="tel" autoComplete="tel" placeholder="010-" required />
        </label>
      </div>
      <label>
        희망 지역
        <input name="region" type="text" defaultValue={place} />
      </label>
      <label>
        문의 내용
        <textarea
          name="message"
          rows={4}
          placeholder={`${place} ${breedName} 분양 희망 시기, 가족 구성 등을 적어 주세요.`}
        />
      </label>
      <div className="bl-form-actions">
        <button type="submit" className="bl-btn-fill" disabled={saving}>
          <Send size={16} />
          {saving ? "접수 중…" : cta}
        </button>
        {kakao ? (
          <a className="bl-btn-line" href={kakao} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={16} />
            {CTA_KAKAO}
          </a>
        ) : null}
      </div>
      {error ? <p className="bl-form-done">{error}</p> : null}
      {sent ? (
        <p className="bl-form-done">
          문의가 접수되었습니다. 관리자가 확인하며{kakao ? " 카카오톡으로도 이어 가실 수 있습니다." : " 등록된 연락처로 안내드립니다."}
        </p>
      ) : null}
    </form>
  );
}
