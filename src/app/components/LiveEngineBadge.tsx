export default function LiveEngineBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wide text-[var(--navy)] ring-1 ring-[var(--line)] ${className}`}
    >
      [실시간 노출 엔진 가동 중]
      <span className="live-engine" aria-hidden>
        <span className="live-engine-spin" />
        <span className="live-engine-core" />
      </span>
    </span>
  );
}
