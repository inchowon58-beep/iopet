/** 한글 조사 */

function lastHangulCode(word: string): number | null {
  const ch = (word || "").trim().slice(-1);
  if (!ch) return null;
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;
  return code;
}

export function hasBatchim(word: string): boolean {
  const code = lastHangulCode(word);
  if (code == null) return false;
  return (code - 0xac00) % 28 !== 0;
}

export function eulReul(word: string): string {
  return hasBatchim(word) ? "을" : "를";
}

export function eunNeun(word: string): string {
  return hasBatchim(word) ? "은" : "는";
}

export function iGa(word: string): string {
  return hasBatchim(word) ? "이" : "가";
}

export function iraRa(word: string): string {
  return hasBatchim(word) ? "이라" : "라";
}

export function euroRo(word: string): string {
  const code = lastHangulCode(word);
  if (code == null) return "로";
  const jong = (code - 0xac00) % 28;
  if (jong === 0 || jong === 8) return "로";
  return "으로";
}
