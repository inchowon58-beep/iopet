"use client";

import { createContext, useContext } from "react";

const KakaoHrefContext = createContext<string>("");

export function KakaoHrefProvider({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <KakaoHrefContext.Provider value={(href || "").trim()}>{children}</KakaoHrefContext.Provider>
  );
}

export function useKakaoHref() {
  return useContext(KakaoHrefContext);
}
