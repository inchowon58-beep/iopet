export function breedPath(breedSlug: string, sido?: string, sigungu?: string, dong?: string): string {
  const parts = [`/${encodeURIComponent(breedSlug)}`];
  if (sido && sigungu) {
    parts.push(`/${encodeURIComponent(`${sido}_${sigungu}`)}`);
    if (dong) parts.push(`/${encodeURIComponent(dong)}`);
  } else if (sido) {
    parts.push(`/${encodeURIComponent(sido)}`);
  }
  return parts.join("");
}

export function bunyangPath(): string {
  return "/bunyang";
}
